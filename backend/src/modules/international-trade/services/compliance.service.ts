import * as mongoose from 'mongoose';
import { Types, ObjectId } from 'mongoose';
import { ITradeCompliance, ComplianceStatus } from '../interfaces/trade-compliance.interface';
import { IInternationalShipment } from '../interfaces/international-shipment.interface';
import { ICustomsDeclaration } from '../interfaces/customs-declaration.interface';
import { IShipmentItem } from '../interfaces/shipment-item.interface';
import { hsCodeLookup } from '../utils/hs-code-lookup';
import TradeCompliance from '../models/trade-compliance.model';

/**
 * Service for managing trade compliance checks
 */
export class ComplianceService {
  /**
   * Performs comprehensive compliance checks for an international shipment
   * @param customsDeclaration Customs declaration data
   * @param shipment Shipment data 
   * @returns A compliance record with all check results
   */
  public async performComplianceChecks(
    customsDeclaration: ICustomsDeclaration,
    shipment: IInternationalShipment
  ): Promise<ITradeCompliance> {
    try {
      // Create a new compliance record
      const compliance = new TradeCompliance({
        shipmentId: shipment._id,
        declarationId: customsDeclaration._id,
        destinationCountry: shipment.destinationCountry,
        originCountry: shipment.originCountry,
        status: ComplianceStatus.PENDING,
        checks: [],
        riskScore: 0,
        isCompliant: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Run the various compliance checks
      await Promise.all<any>([
        this.checkProhibitedItems(compliance, customsDeclaration, shipment),
        this.checkDocumentRequirements(compliance, customsDeclaration, shipment),
        this.checkExportControls(compliance, customsDeclaration, shipment),
        this.checkImportRestrictions(compliance, customsDeclaration, shipment),
        this.assessRisk(compliance, customsDeclaration, shipment)
      ]);
      
      // Calculate overall compliance
      this.calculateOverallCompliance(compliance);
      
      // Save and return
      await compliance.save();
      return compliance;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error performing compliance checks: ${errorMessage}`);
    }
  }
  
  /**
   * Check for prohibited items based on destination country
   * @param compliance Compliance record to update
   * @param customsDeclaration Customs declaration
   * @param shipment Shipment data
   */
  private async checkProhibitedItems(
    compliance: ITradeCompliance, 
    customsDeclaration: ICustomsDeclaration, 
    shipment: IInternationalShipment
  ): Promise<void> {
    // Check each shipment item against prohibited items list
    const restrictedItems: IShipmentItem[] = [];
    
    // Get all items from the shipment
    for (const item of shipment.items) {
      const hsCode = item.hsCode || this.determineHsCode(item);
      
      // Check if this HS code is restricted for the destination
      if (this.isProhibited(hsCode, shipment.destinationCountry)) {
        restrictedItems.push(item);
      }
    }
    
    // Add the check result
    compliance.checks.push({
      type: 'prohibited_items',
      status: restrictedItems.length > 0 ? 'failed' : 'passed',
      details: restrictedItems.length > 0 
        ? `Shipment contains ${restrictedItems.length} restricted items` 
        : 'No prohibited items found',
      timestamp: new Date()
    });
  }
  
  /**
   * Check required document requirements
   * @param compliance Compliance record to update
   * @param customsDeclaration Customs declaration
   * @param shipment Shipment data
   */
  private async checkDocumentRequirements(
    compliance: ITradeCompliance, 
    customsDeclaration: ICustomsDeclaration, 
    shipment: IInternationalShipment
  ): Promise<void> {
    // Check each item's HS code for required documents
    const requiredDocs = new Set<string>();
    
    // For each item, determine required documents based on HS code
    for (const item of shipment.items) {
      const hsCode = item.hsCode || this.determineHsCode(item);
      const docsForItem = this.getRequiredDocuments(
        hsCode, 
        shipment.originCountry, 
        shipment.destinationCountry,
        item.description
      );
      
      // Add to the set of required documents
      docsForItem.forEach(doc => requiredDocs.add(doc));
    }
    
    // Check which documents are missing
    const providedDocs = new Set(
      customsDeclaration.documents.map(doc => doc.type)
    );
    
    const missingDocs = Array.from(requiredDocs)
      .filter(doc => !providedDocs.has(doc));
    
    // Add the check result
    compliance.checks.push({
      type: 'document_requirements',
      status: missingDocs.length > 0 ? 'failed' : 'passed',
      details: missingDocs.length > 0 
        ? `Missing required documents: ${missingDocs.join(', ')}` 
        : 'All required documents provided',
      timestamp: new Date()
    });
  }
  
  /**
   * Check export control requirements
   * @param compliance Compliance record to update
   * @param customsDeclaration Customs declaration
   * @param shipment Shipment data
   */
  private async checkExportControls(
    compliance: ITradeCompliance, 
    customsDeclaration: ICustomsDeclaration, 
    shipment: IInternationalShipment
  ): Promise<void> {
    // Check if any items require export licenses or permits
    const controlledItems: IShipmentItem[] = [];
    const licenseRequirements: string[] = [];
    
    // Check each item's HS code for export controls
    for (const item of shipment.items) {
      const hsCode = item.hsCode || this.determineHsCode(item);
      
      // Check if this HS code is subject to export controls
      if (this.isExportControlled(hsCode, shipment.originCountry, shipment.destinationCountry)) {
        controlledItems.push(item);
        
        // Get specific license requirements
        const licenses = this.getExportLicenseRequirements(
          hsCode, 
          shipment.originCountry, 
          shipment.destinationCountry
        );
        
        licenseRequirements.push(...licenses);
      }
    }
    
    // Check if all required licenses are present
    const providedLicenses = new Set(
      customsDeclaration.licenses.map(license => license.type)
    );
    
    const missingLicenses = Array.from(new Set(licenseRequirements))
      .filter(license => !providedLicenses.has(license));
    
    // Add the check result
    compliance.checks.push({
      type: 'export_controls',
      status: missingLicenses.length > 0 ? 'failed' : 'passed',
      details: missingLicenses.length > 0 
        ? `Missing required export licenses: ${missingLicenses.join(', ')}` 
        : controlledItems.length > 0 
          ? 'All required export licenses provided' 
          : 'No export controlled items found',
      timestamp: new Date()
    });
  }
  
  /**
   * Check import restrictions for destination country
   * @param compliance Compliance record to update
   * @param customsDeclaration Customs declaration
   * @param shipment Shipment data
   */
  private async checkImportRestrictions(
    compliance: ITradeCompliance, 
    customsDeclaration: ICustomsDeclaration, 
    shipment: IInternationalShipment
  ): Promise<void> {
    // Check import quotas, tariffs, and restrictions
    const restrictedItems: Array<{
      item: IShipmentItem;
      reason: string;
      quota?: {
        limit: number;
        used: number;
        remaining: number;
      };
    }> = [];
    
    // Check each item for import restrictions
    for (const item of shipment.items) {
      const hsCode = item.hsCode || this.determineHsCode(item);
      
      // Check import restrictions
      const restriction = this.getImportRestriction(
        hsCode, 
        shipment.destinationCountry
      );
      
      if (restriction) {
        restrictedItems.push({
          item,
          reason: restriction.reason,
          quota: restriction.quota
        });
      }
    }
    
    // Add the check result
    compliance.checks.push({
      type: 'import_restrictions',
      status: restrictedItems.length > 0 ? 'warning' : 'passed',
      details: restrictedItems.length > 0 
        ? `Items with import restrictions: ${restrictedItems.length}` 
        : 'No import restrictions found',
      timestamp: new Date(),
      metadata: restrictedItems.length > 0 ? { restrictedItems } : undefined
    });
  }
  
  /**
   * Determine overall compliance status based on all checks
   * @param compliance The compliance record to update 
   */
  private calculateOverallCompliance(compliance: ITradeCompliance): void {
    // Count failed checks
    const failedChecks = compliance.checks.filter(check => check.status === 'failed');
    const warningChecks = compliance.checks.filter(check => check.status === 'warning');
    
    // Determine overall status
    if (failedChecks.length > 0) {
      compliance.status = ComplianceStatus.FAILED;
      compliance.isCompliant = false;
    } else if (warningChecks.length > 0) {
      compliance.status = ComplianceStatus.WARNING;
      compliance.isCompliant = true; // Warnings still allow shipment
    } else {
      compliance.status = ComplianceStatus.PASSED;
      compliance.isCompliant = true;
    }
    
    // Update timestamp
    compliance.updatedAt = new Date();
  }
  
  /**
   * Calculate risk score for shipment
   * @param compliance Compliance record to update
   * @param customsDeclaration Customs declaration
   * @param shipment Shipment data
   */
  private async assessRisk(
    compliance: ITradeCompliance, 
    customsDeclaration: ICustomsDeclaration, 
    shipment: IInternationalShipment
  ): Promise<void> {
    // Initialize risk factors
    let riskScore = 0;
    
    // Factor 1: High-risk destination countries
    const highRiskCountries = ['XX', 'YY', 'ZZ']; // Placeholder country codes
    if (highRiskCountries.includes(shipment.destinationCountry)) {
      riskScore += 30;
    }
    
    // Factor 2: High-value shipment
    const totalValue = shipment.items.reduce(
      (sum, item) => sum + (item.value || 0) * (item.quantity || 1), 
      0
    );
    
    if (totalValue > 10000) {
      riskScore += 20;
    } else if (totalValue > 5000) {
      riskScore += 10;
    }
    
    // Factor 3: Certain product categories
    const sensitiveCategories = ['electronics', 'chemicals', 'machinery'];
    const hasSensitiveItems = shipment.items.some(
      item => sensitiveCategories.includes(item.category || '')
    );
    
    if (hasSensitiveItems) {
      riskScore += 15;
    }
    
    // Factor 4: Incomplete documentation
    const missingDocChecks = compliance.checks.find(
      check => check.type === 'document_requirements' && check.status === 'failed'
    );
    
    if (missingDocChecks) {
      riskScore += 25;
    }
    
    // Update compliance record
    compliance.riskScore = riskScore;
    compliance.checks.push({
      type: 'risk_assessment',
      status: riskScore > 50 ? 'warning' : 'passed',
      details: `Shipment risk score: ${riskScore}/100`,
      timestamp: new Date()
    });
  }
  
  /**
   * Determines HS code for an item based on its description
   * @param item Shipment item
   * @returns The determined HS code
   */
  private determineHsCode(item: IShipmentItem): string {
    // For now, use a simple lookup - in real app would use AI-based classification
    return hsCodeLookup(item.description || '') || '9999.99.99';
  }
  
  /**
   * Checks if an item is prohibited for import to a specific country
   * @param hsCode HS code of the item
   * @param countryCode Destination country code
   * @returns True if prohibited, false otherwise
   */
  private isProhibited(hsCode: string, countryCode: string): boolean {
    // Simplified implementation - in real app would connect to a compliance database
    const prohibitedHsCodes: Record<string, string[]> = {
      'US': ['0301.11', '9301.10'],
      'CA': ['0301.11', '9301.10'],
      'EU': ['0301.11', '9301.10', '1211.30'],
      // More countries...
    };
    
    const prohibited = prohibitedHsCodes[countryCode] || [];
    return prohibited.some(code => hsCode.startsWith(code));
  }
  
  /**
   * Gets required documents for an item based on HS code and countries
   * @param hsCode HS code of the item
   * @param originCountry Origin country code
   * @param destinationCountry Destination country code
   * @param description Optional item description for specific checks
   * @returns Array of required document types
   */
  private getRequiredDocuments(
    hsCode: string, 
    originCountry: string, 
    destinationCountry: string,
    description?: string
  ): string[] {
    // Always require commercial invoice and packing list
    const documents = ['COMMERCIAL_INVOICE', 'PACKING_LIST'];
    
    // Check for certificate of origin requirement
    if (this.requiresCertificateOfOrigin(hsCode, originCountry, destinationCountry)) {
      documents.push('CERTIFICATE_OF_ORIGIN');
    }
    
    // Check for other specific documents based on HS code
    if (hsCode.startsWith('29') || hsCode.startsWith('28')) {
      // Chemicals require safety data sheet
      documents.push('SAFETY_DATA_SHEET');
    }
    
    if (hsCode.startsWith('01') || hsCode.startsWith('02') || hsCode.startsWith('03')) {
      // Live animals, meat, fish require health certificates
      documents.push('HEALTH_CERTIFICATE');
    }
    
    // Placeholder for more specific document requirements
    
    return documents;
  }
  
  /**
   * Determines if a certificate of origin is required
   * @param hsCode HS code
   * @param originCountry Origin country
   * @param destinationCountry Destination country
   * @returns True if required
   */
  private requiresCertificateOfOrigin(
    hsCode: string, 
    originCountry: string, 
    destinationCountry: string
  ): boolean {
    // Simplified implementation - in real app would check trade agreements
    
    // Free trade agreement pairs requiring certificate of origin
    const ftaPairs = [
      ['US', 'CA'], ['US', 'MX'], ['CA', 'MX'],  // USMCA
      ['GB', 'EU'], // UK-EU
      // More pairs...
    ];
    
    // Check if countries have a free trade agreement
    const hasFta = ftaPairs.some(pair => 
      (pair[0] === originCountry && pair[1] === destinationCountry) ||
      (pair[0] === destinationCountry && pair[1] === originCountry)
    );
    
    return hasFta;
  }
  
  /**
   * Checks if an item is subject to export controls
   * @param hsCode HS code
   * @param originCountry Origin country code
   * @param destinationCountry Destination country code
   * @returns True if export controlled
   */
  private isExportControlled(
    hsCode: string, 
    originCountry: string, 
    destinationCountry: string
  ): boolean {
    // Simplified implementation - in real app would use export control classification
    
    // Controlled HS codes by origin country
    const controlledHsCodes: Record<string, string[]> = {
      'US': ['8517.12', '8471.30', '8526.91'], // Electronics, computers, navigation equipment
      'EU': ['8517.12', '8471.30', '8526.91', '9306.30'],
      // More countries...
    };
    
    const controlled = controlledHsCodes[originCountry] || [];
    return controlled.some(code => hsCode.startsWith(code));
  }
  
  /**
   * Gets export license requirements if any
   * @param hsCode HS code
   * @param originCountry Origin country code
   * @param destinationCountry Destination country code
   * @returns Array of required license types
   */
  private getExportLicenseRequirements(
    hsCode: string, 
    originCountry: string, 
    destinationCountry: string
  ): string[] {
    // Check if export controlled first
    if (!this.isExportControlled(hsCode, originCountry, destinationCountry)) {
      return [];
    }
    
    // Different types of export licenses by country
    const documentTypes: Record<string, string> = {
      'US': 'BIS_EXPORT_LICENSE',
      'EU': 'EU_EXPORT_AUTHORIZATION',
      'GB': 'UK_EXPORT_LICENSE',
      // More countries...
    };
    
    return [documentTypes[originCountry] || 'EXPORT_LICENSE'];
  }
  
  /**
   * Gets import restrictions for a destination country
   * @param hsCode HS code
   * @param countryCode Destination country code
   * @returns Import restriction details if any
   */
  private getImportRestriction(
    hsCode: string, 
    countryCode: string
  ): { reason: string; quota?: { limit: number; used: number; remaining: number } } | null {
    // Simplified implementation - in real app would connect to tariff database
    
    // Define some example quotas and restrictions
    const quotaHsCodes: Record<string, Record<string, { limit: number; used: number }>> = {
      'US': {
        '5201': { limit: 100000, used: 75000 }, // Raw cotton
        '0201': { limit: 50000, used: 30000 }   // Beef
      },
      'EU': {
        '1006': { limit: 200000, used: 150000 } // Rice
      }
      // More countries...
    };
    
    // Check for quota restrictions
    const countryQuotas = quotaHsCodes[countryCode] || {};
    const hsPrefix = hsCode.substring(0, 4);
    
    if (countryQuotas[hsPrefix]) {
      const { limit, used } = countryQuotas[hsPrefix];
      return {
        reason: `Subject to import quota (${hsPrefix})`,
        quota: {
          limit,
          used,
          remaining: limit - used
        }
      };
    }
    
    const docTypeMap: Record<string, string> = {
      // String mapping examples
    };
    
    return null;
  }
}