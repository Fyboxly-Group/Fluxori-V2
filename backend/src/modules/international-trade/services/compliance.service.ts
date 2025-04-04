import mongoose, { Types } from 'mongoose';
import { 
  IInternationalShipment, 
  ICustomsDeclaration,
  IShipmentItem 
} from '../models/international-trade.model';
import { InternationalShipment, CustomsDeclaration } from '../models/international-trade.model';

/**
 * Possible compliance check result statuses
 */
export type ComplianceStatus = 'passed' | 'failed' | 'warning';

/**
 * Interface for compliance check item result
 */
export interface IComplianceCheckItem {
  name: string;
  status: ComplianceStatus;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Interface for compliance check result
 */
export interface IComplianceCheckResult {
  status: ComplianceStatus;
  checks: IComplianceCheckItem[];
  timestamp: Date;
}

/**
 * Interface for restricted item rule
 */
export interface IRestrictedItemRule {
  type: 'keyword' | 'hsCode';
  value: string;
  countries: string[] | 'all';
  level: 'prohibited' | 'restricted';
  message: string;
}

/**
 * Interface for reporting a restricted item violation
 */
export interface IRestrictedItemViolation {
  item: IShipmentItem;
  rule: IRestrictedItemRule;
}

/**
 * Interface for sanctions entry
 */
export interface ISanctionsEntry {
  country: string;
  restrictions: 'full' | 'partial';
  exemptions?: string[];
  details: string;
}

/**
 * Interface for license requirement
 */
export interface ILicenseRequirement {
  type: 'hsCode' | 'country' | 'both';
  hsCode?: string;
  hsCodePrefix?: string;
  originCountry?: string;
  destinationCountry?: string;
  licenseType: string;
  description: string;
}

/**
 * Interface for reporting a license requirement match
 */
export interface ILicenseMatch {
  item: IShipmentItem;
  requirement: ILicenseRequirement;
}

/**
 * Compliance Service for international trade
 * Handles compliance checks for international shipments
 */
export class ComplianceService {
  // Sample data - in a real implementation, these would come from a database or API
  private restrictedItems: IRestrictedItemRule[] = [
    {
      type: 'keyword',
      value: 'weapon',
      countries: 'all',
      level: 'prohibited',
      message: 'Weapons are prohibited for international shipping'
    },
    {
      type: 'keyword',
      value: 'firearm',
      countries: 'all',
      level: 'prohibited',
      message: 'Firearms are prohibited for international shipping'
    },
    {
      type: 'keyword',
      value: 'alcohol',
      countries: ['SA', 'IR', 'LY', 'KW'],
      level: 'prohibited',
      message: 'Alcohol is prohibited for shipping to these countries'
    },
    {
      type: 'hsCode',
      value: '9301',
      countries: 'all',
      level: 'prohibited',
      message: 'Military weapons are prohibited for international shipping'
    }
  ];

  private sanctionedCountries: ISanctionsEntry[] = [
    {
      country: 'IR',
      restrictions: 'full',
      details: 'Comprehensive sanctions prohibit most transactions'
    },
    {
      country: 'CU',
      restrictions: 'partial',
      exemptions: ['food', 'medicine', 'medical devices'],
      details: 'Most transactions prohibited except for humanitarian goods'
    },
    {
      country: 'KP',
      restrictions: 'full',
      details: 'Comprehensive sanctions prohibit most transactions'
    }
  ];

  private licenseRequirements: ILicenseRequirement[] = [
    {
      type: 'hsCode',
      hsCodePrefix: '84',
      licenseType: 'EAR',
      description: 'Export Administration Regulations license may be required for machinery'
    },
    {
      type: 'hsCode',
      hsCodePrefix: '85',
      licenseType: 'EAR',
      description: 'Export Administration Regulations license may be required for electronics'
    },
    {
      type: 'country',
      destinationCountry: 'CN',
      licenseType: 'EAR',
      description: 'Export Administration Regulations license may be required for sensitive goods to China'
    }
  ];

  /**
   * Check compliance for a shipment
   * 
   * @param shipmentId Shipment ID to check
   * @returns Compliance check result
   */
  public async checkCompliance(shipmentId: string): Promise<IComplianceCheckResult> {
    try {
      // Validate shipment ID
      if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
        throw new Error('Invalid shipment ID');
      }

      // Retrieve shipment data
      const shipment = await InternationalShipment.findById(shipmentId);
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }

      // Retrieve customs declaration
      const customsDeclaration = await CustomsDeclaration.findOne({ 
        shipmentId: shipment._id 
      });

      // Initialize compliance checks array
      const checks: IComplianceCheckItem[] = [];

      // Perform various compliance checks
      const restrictedItemsCheck = await this.checkRestrictedItems(shipment);
      checks.push(restrictedItemsCheck);

      const sanctionsCheck = await this.checkSanctions(shipment);
      checks.push(sanctionsCheck);

      const licenseCheck = await this.checkLicenseRequirements(shipment, customsDeclaration);
      checks.push(licenseCheck);

      const documentationCheck = await this.checkDocumentation(shipment, customsDeclaration);
      checks.push(documentationCheck);

      // Determine overall status
      const status = this.determineOverallStatus(checks);

      return {
        status,
        checks,
        timestamp: new Date()
      };
    } catch (error) {
      // Log the error
      console.error('Compliance check error:', error);
      
      // Return failed status with error information
      return {
        status: 'failed',
        checks: [{
          name: 'system_error',
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown compliance check error'
        }],
        timestamp: new Date()
      };
    }
  }

  /**
   * Check for restricted items in shipment
   * 
   * @param shipment Shipment data
   * @returns Compliance check item result
   */
  private async checkRestrictedItems(shipment: IInternationalShipment): Promise<IComplianceCheckItem> {
    try {
      const destinationCountry = shipment.destination.country;
      const violations: IRestrictedItemViolation[] = [];

      // Check each item in the shipment
      for (const item of shipment.items) {
        // Check for restricted keywords in description
        const keywordRules = this.restrictedItems.filter(rule => rule.type === 'keyword');
        for (const rule of keywordRules) {
          const isCountryRestricted = rule.countries === 'all' || 
            (Array.isArray(rule.countries) && rule.countries.includes(destinationCountry));
          
          if (isCountryRestricted && 
              item.description.toLowerCase().includes(rule.value.toLowerCase())) {
            violations.push({ item, rule });
          }
        }

        // Check for restricted HS codes
        if (item.hsCode) {
          const hsCodeRules = this.restrictedItems.filter(rule => rule.type === 'hsCode');
          for (const rule of hsCodeRules) {
            const isCountryRestricted = rule.countries === 'all' || 
              (Array.isArray(rule.countries) && rule.countries.includes(destinationCountry));
            
            if (isCountryRestricted && item.hsCode.startsWith(rule.value)) {
              violations.push({ item, rule });
            }
          }
        }
      }

      // Determine status based on violations
      if (violations.length === 0) {
        return {
          name: 'restricted_items',
          status: 'passed',
          message: 'No restricted items detected'
        };
      }

      // Count prohibited vs. restricted items
      const prohibitedItems = violations.filter(v => v.rule.level === 'prohibited');
      const restrictedItems = violations.filter(v => v.rule.level === 'restricted');

      if (prohibitedItems.length > 0) {
        return {
          name: 'restricted_items',
          status: 'failed',
          message: `Shipment contains ${prohibitedItems.length} prohibited item(s)`,
          details: {
            prohibitedItems: prohibitedItems.map(v => ({
              description: v.item.description,
              hsCode: v.item.hsCode,
              message: v.rule.message
            })),
            restrictedItems: restrictedItems.map(v => ({
              description: v.item.description,
              hsCode: v.item.hsCode,
              message: v.rule.message
            }))
          }
        };
      }

      return {
        name: 'restricted_items',
        status: 'warning',
        message: `Shipment contains ${restrictedItems.length} restricted item(s) that may require special handling`,
        details: {
          restrictedItems: restrictedItems.map(v => ({
            description: v.item.description,
            hsCode: v.item.hsCode,
            message: v.rule.message
          }))
        }
      };
    } catch (error) {
      console.error('Error checking restricted items:', error);
      return {
        name: 'restricted_items',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Error checking restricted items'
      };
    }
  }

  /**
   * Check for sanctions compliance
   * 
   * @param shipment Shipment data
   * @returns Compliance check item result
   */
  private async checkSanctions(shipment: IInternationalShipment): Promise<IComplianceCheckItem> {
    try {
      const destinationCountry = shipment.destination.country;
      
      // Check if destination country is sanctioned
      const sanctionsEntry = this.sanctionedCountries.find(
        s => s.country === destinationCountry
      );

      if (!sanctionsEntry) {
        return {
          name: 'sanctions_check',
          status: 'passed',
          message: 'No sanctions violations detected'
        };
      }

      // If there are full restrictions, fail the check
      if (sanctionsEntry.restrictions === 'full') {
        return {
          name: 'sanctions_check',
          status: 'failed',
          message: `Shipment to ${destinationCountry} is blocked due to comprehensive sanctions`,
          details: {
            sanctionsInfo: sanctionsEntry
          }
        };
      }

      // Check for exemptions in partial sanctions
      const hasExemptedItems = shipment.items.every(item => {
        // Check if item description contains any exemption keywords
        return sanctionsEntry.exemptions?.some(
          exemption => item.description.toLowerCase().includes(exemption.toLowerCase())
        ) || false;
      });

      if (hasExemptedItems) {
        return {
          name: 'sanctions_check',
          status: 'warning',
          message: `Shipping to ${destinationCountry} has restrictions, but items may qualify for exemptions`,
          details: {
            sanctionsInfo: sanctionsEntry,
            requiresReview: true
          }
        };
      }

      return {
        name: 'sanctions_check',
        status: 'failed',
        message: `Shipment to ${destinationCountry} contains items subject to sanctions restrictions`,
        details: {
          sanctionsInfo: sanctionsEntry
        }
      };
    } catch (error) {
      console.error('Error checking sanctions:', error);
      return {
        name: 'sanctions_check',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Error checking sanctions compliance'
      };
    }
  }

  /**
   * Check for license requirements
   * 
   * @param shipment Shipment data
   * @param customsDeclaration Customs declaration data
   * @returns Compliance check item result
   */
  private async checkLicenseRequirements(
    shipment: IInternationalShipment, 
    customsDeclaration?: ICustomsDeclaration | null
  ): Promise<IComplianceCheckItem> {
    try {
      const destinationCountry = shipment.destination.country;
      const licenseMatches: ILicenseMatch[] = [];

      // Check each item in the shipment
      for (const item of shipment.items) {
        if (item.hsCode) {
          // Check HS code-based requirements
          const hsCodeRequirements = this.licenseRequirements.filter(req => 
            req.type === 'hsCode' || req.type === 'both'
          );

          for (const requirement of hsCodeRequirements) {
            if (requirement.hsCode && item.hsCode === requirement.hsCode) {
              licenseMatches.push({ item, requirement });
            } else if (requirement.hsCodePrefix && item.hsCode.startsWith(requirement.hsCodePrefix)) {
              licenseMatches.push({ item, requirement });
            }
          }
        }

        // Check country-based requirements
        const countryRequirements = this.licenseRequirements.filter(req => 
          (req.type === 'country' || req.type === 'both') && 
          (req.destinationCountry === destinationCountry || 
           (req.originCountry && item.originCountry === req.originCountry))
        );

        for (const requirement of countryRequirements) {
          licenseMatches.push({ item, requirement });
        }
      }

      // Determine status based on license requirements
      if (licenseMatches.length === 0) {
        return {
          name: 'license_requirements',
          status: 'passed',
          message: 'No export licenses required'
        };
      }

      return {
        name: 'license_requirements',
        status: 'warning',
        message: `${licenseMatches.length} item(s) may require export licenses`,
        details: {
          licenseRequirements: licenseMatches.map(match => ({
            description: match.item.description,
            hsCode: match.item.hsCode,
            licenseType: match.requirement.licenseType,
            details: match.requirement.description
          }))
        }
      };
    } catch (error) {
      console.error('Error checking license requirements:', error);
      return {
        name: 'license_requirements',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Error checking license requirements'
      };
    }
  }

  /**
   * Check for required documentation
   * 
   * @param shipment Shipment data
   * @param customsDeclaration Customs declaration data
   * @returns Compliance check item result
   */
  private async checkDocumentation(
    shipment: IInternationalShipment, 
    customsDeclaration?: ICustomsDeclaration | null
  ): Promise<IComplianceCheckItem> {
    try {
      const missingDocs: string[] = [];
      
      // Check if customs declaration exists
      if (!customsDeclaration) {
        missingDocs.push('Customs Declaration');
      } else {
        // Check for complete customs declaration
        if (!customsDeclaration.items || customsDeclaration.items.length === 0) {
          missingDocs.push('Customs Declaration Items');
        }
        
        if (!customsDeclaration.exporterDetails) {
          missingDocs.push('Exporter Details');
        }
        
        if (!customsDeclaration.importerDetails) {
          missingDocs.push('Importer Details');
        }
      }
      
      // Check for HS codes on items
      const missingHsCodes = shipment.items.some(item => !item.hsCode);
      if (missingHsCodes) {
        missingDocs.push('HS Codes for all items');
      }
      
      // Check for origin countries on items
      const missingOriginCountries = shipment.items.some(item => !item.originCountry);
      if (missingOriginCountries) {
        missingDocs.push('Origin Countries for all items');
      }
      
      // Determine status based on missing documentation
      if (missingDocs.length === 0) {
        return {
          name: 'documentation',
          status: 'passed',
          message: 'All required documentation is present'
        };
      }
      
      return {
        name: 'documentation',
        status: 'warning',
        message: `Missing ${missingDocs.length} required document(s) or information`,
        details: {
          missingDocumentation: missingDocs
        }
      };
    } catch (error) {
      console.error('Error checking documentation:', error);
      return {
        name: 'documentation',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Error checking documentation requirements'
      };
    }
  }

  /**
   * Determine overall compliance status from individual checks
   * 
   * @param checks Array of compliance checks
   * @returns Overall compliance status
   */
  private determineOverallStatus(checks: IComplianceCheckItem[]): ComplianceStatus {
    if (checks.some(check => check.status === 'failed')) {
      return 'failed';
    }
    
    if (checks.some(check => check.status === 'warning')) {
      return 'warning';
    }
    
    return 'passed';
  }

  /**
   * Get restricted item rules
   * This allows other services to access the rules
   * 
   * @returns Array of restricted item rules
   */
  public getRestrictedItemRules(): IRestrictedItemRule[] {
    return [...this.restrictedItems];
  }

  /**
   * Get sanctioned countries
   * This allows other services to access the sanctions list
   * 
   * @returns Array of sanctions entries
   */
  public getSanctionedCountries(): ISanctionsEntry[] {
    return [...this.sanctionedCountries];
  }

  /**
   * Get license requirements
   * This allows other services to access the license requirements
   * 
   * @returns Array of license requirements
   */
  public getLicenseRequirements(): ILicenseRequirement[] {
    return [...this.licenseRequirements];
  }
}
