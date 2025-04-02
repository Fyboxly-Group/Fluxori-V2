import mongoose from 'mongoose';
import { 
  IInternationalShipment, 
  ICustomsDeclaration,
  ITradeCompliance,
  IShippingRate,
  InternationalShipment,
  CustomsDeclaration,
  TradeCompliance,
  ShippingRate
} from '../models/international-trade.model';
import { CustomsDocumentService } from './customs-document.service';
import { ShippingRateService } from './shipping-rate.service';
import { ComplianceService } from './compliance.service';

/**
 * Service for managing international shipments and related documentation
 */
export class InternationalTradeService {
  private customsDocumentService: CustomsDocumentService;
  private shippingRateService: ShippingRateService;
  private complianceService: ComplianceService;

  constructor() {
    this.customsDocumentService = new CustomsDocumentService();
    this.shippingRateService = new ShippingRateService();
    this.complianceService = new ComplianceService();
  }

  /**
   * Create a new international shipment
   * @param shipmentData Shipment data
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns Created shipment
   */
  public async createShipment(
    shipmentData: Partial<IInternationalShipment>,
    userId: string,
    organizationId: string
  ): Promise<IInternationalShipment> {
    try {
      // Generate a unique shipment ID
      const shipmentId = `SHIP-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

      // Create the shipment
      const shipment = new InternationalShipment({
        ...shipmentData,
        shipmentId,
        userId: new mongoose.Types.ObjectId(userId),
        organizationId: new mongoose.Types.ObjectId(organizationId),
        status: 'created'
      });

      await shipment.save();
      return shipment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create shipment: ${errorMessage}`);
    }
  }

  /**
   * Create customs declaration for a shipment
   * @param declarationData Declaration data
   * @param shipmentId Shipment ID
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns Created customs declaration
   */
  public async createCustomsDeclaration(
    declarationData: Partial<ICustomsDeclaration>,
    shipmentId: string,
    userId: string,
    organizationId: string
  ): Promise<ICustomsDeclaration> {
    try {
      // Find the shipment
      const shipment = await InternationalShipment.findOne({ shipmentId });
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }

      // Generate a unique declaration ID
      const declarationId = `CUST-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

      // Create the customs declaration
      const declaration = new CustomsDeclaration({
        ...declarationData,
        declarationId,
        shipmentId: new mongoose.Types.ObjectId(shipment._id),
        userId: new mongoose.Types.ObjectId(userId),
        organizationId: new mongoose.Types.ObjectId(organizationId),
        status: 'draft'
      });

      await declaration.save();

      // Update the shipment with the customs declaration ID
      shipment.customsDeclarationId = declaration._id as unknown as mongoose.Types.ObjectId;
      shipment.status = 'documents_pending';
      await shipment.save();

      return declaration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create customs declaration: ${errorMessage}`);
    }
  }

  /**
   * Generate all required documents for a shipment
   * @param shipmentId Shipment ID
   * @returns URLs to generated documents
   */
  public async generateShipmentDocuments(
    shipmentId: string
  ): Promise<{
    commercialInvoice?: string;
    packingList?: string;
    certificateOfOrigin?: string;
  }> {
    try {
      // Find the shipment
      const shipment = await InternationalShipment.findOne({ shipmentId });
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }

      // Find the customs declaration
      const declaration = await CustomsDeclaration.findById(shipment.customsDeclarationId);
      if (!declaration) {
        throw new Error(`Customs declaration not found for shipment ${shipmentId}`);
      }

      // Generate the documents
      const documents = await this.customsDocumentService.generateDocuments(shipment, declaration);

      // Update the shipment with document URLs
      const documentEntries: Array<{
        type: string;
        url: string;
        createdAt: Date;
      }> = [];

      if (documents.commercialInvoice) {
        documentEntries.push({
          type: 'commercial_invoice',
          url: documents.commercialInvoice,
          createdAt: new Date()
        });
      }

      if (documents.packingList) {
        documentEntries.push({
          type: 'packing_list',
          url: documents.packingList,
          createdAt: new Date()
        });
      }

      if (documents.certificateOfOrigin) {
        documentEntries.push({
          type: 'certificate_of_origin',
          url: documents.certificateOfOrigin,
          createdAt: new Date()
        });
      }

      // Update the shipment with the document URLs
      shipment.documents = documentEntries;
      if (documentEntries.length > 0) {
        shipment.status = 'documents_completed';
      }
      await shipment.save();

      return documents;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate shipment documents: ${errorMessage}`);
    }
  }

  /**
   * Get shipping rates for a shipment
   * @param shipmentId Shipment ID
   * @returns Shipping rates
   */
  public async getShippingRates(shipmentId: string): Promise<IShippingRate> {
    try {
      // Find the shipment
      const shipment = await InternationalShipment.findOne({ shipmentId });
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }

      // Generate a unique rate ID
      const rateId = `RATE-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

      // Get rates from the shipping rate service
      const rates = await this.shippingRateService.getRates(
        shipment.origin.country,
        shipment.origin.postalCode,
        shipment.destination.country,
        shipment.destination.postalCode,
        shipment.packages
      );

      // Create a new shipping rate record
      const shippingRate = new ShippingRate({
        rateId,
        origin: {
          country: shipment.origin.country,
          postalCode: shipment.origin.postalCode
        },
        destination: {
          country: shipment.destination.country,
          postalCode: shipment.destination.postalCode
        },
        packages: shipment.packages,
        options: {
          insuranceRequired: shipment.insuranceAmount > 0,
          insuranceAmount: shipment.insuranceAmount,
          signatureRequired: true,
          residentialDelivery: true,
          saturdayDelivery: false
        },
        quotes: rates,
        selectedQuoteIndex: -1,
        userId: shipment.userId,
        organizationId: shipment.organizationId
      });

      await shippingRate.save();
      return shippingRate;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get shipping rates: ${errorMessage}`);
    }
  }

  /**
   * Select a shipping rate for a shipment
   * @param rateId Rate ID
   * @param quoteIndex Index of the selected quote
   * @returns Updated shipping rate
   */
  public async selectShippingRate(
    rateId: string,
    quoteIndex: number
  ): Promise<IShippingRate> {
    try {
      // Find the shipping rate
      const shippingRate = await ShippingRate.findOne({ rateId });
      if (!shippingRate) {
        throw new Error(`Shipping rate with ID ${rateId} not found`);
      }

      // Verify the quote index is valid
      if (quoteIndex < 0 || quoteIndex >= shippingRate.quotes.length) {
        throw new Error(`Invalid quote index: ${quoteIndex}`);
      }

      // Update the selected quote
      shippingRate.selectedQuoteIndex = quoteIndex;
      await shippingRate.save();

      return shippingRate;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to select shipping rate: ${errorMessage}`);
    }
  }

  /**
   * Run trade compliance checks for a shipment
   * @param shipmentId Shipment ID
   * @returns Compliance check results
   */
  public async runComplianceChecks(shipmentId: string): Promise<ITradeCompliance> {
    try {
      // Find the shipment
      const shipment = await InternationalShipment.findOne({ shipmentId });
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }

      // Find the customs declaration
      const declaration = await CustomsDeclaration.findById(shipment.customsDeclarationId);
      if (!declaration) {
        throw new Error(`Customs declaration not found for shipment ${shipmentId}`);
      }

      // Generate a unique compliance ID
      const complianceId = `COMP-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

      // Run compliance checks
      const results = await this.complianceService.runComplianceChecks(
        shipment,
        declaration,
        shipment.userId.toString(),
        shipment.organizationId.toString()
      );

      // Create a new compliance record
      const compliance = new TradeCompliance({
        complianceId,
        shipmentId: new mongoose.Types.ObjectId(shipment._id),
        status: results.status,
        checks: results.checks,
        requiredDocuments: results.requiredDocuments,
        restrictedItems: results.restrictedItems,
        exportApproval: results.exportApproval,
        importApproval: results.importApproval,
        riskAssessment: results.riskAssessment,
        userId: shipment.userId,
        organizationId: shipment.organizationId
      });

      await compliance.save();

      // Update the shipment with compliance ID and status
      shipment.complianceCheckId = compliance._id as unknown as mongoose.Types.ObjectId;
      
      if (results.status === 'approved') {
        shipment.status = 'customs_cleared';
      } else if (results.status === 'rejected') {
        shipment.status = 'exception';
      } else {
        shipment.status = 'customs_processing';
      }
      
      await shipment.save();

      return compliance;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to run compliance checks: ${errorMessage}`);
    }
  }

  /**
   * Get shipment details by ID
   * @param shipmentId Shipment ID
   * @returns Shipment details with related documents and compliance
   */
  public async getShipmentDetails(shipmentId: string): Promise<{
    shipment: IInternationalShipment;
    customsDeclaration?: ICustomsDeclaration;
    complianceCheck?: ITradeCompliance;
  }> {
    try {
      // Find the shipment
      const shipment = await InternationalShipment.findOne({ shipmentId });
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }

      // Find related records
      const customsDeclaration = shipment.customsDeclarationId 
        ? await CustomsDeclaration.findById(shipment.customsDeclarationId) 
        : undefined;
        
      const complianceCheck = shipment.complianceCheckId 
        ? await TradeCompliance.findById(shipment.complianceCheckId) 
        : undefined;

      return {
        shipment,
        customsDeclaration: customsDeclaration || undefined,
        complianceCheck: complianceCheck || undefined
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get shipment details: ${errorMessage}`);
    }
  }

  /**
   * Update shipment status
   * @param shipmentId Shipment ID
   * @param status New status
   * @returns Updated shipment
   */
  public async updateShipmentStatus(
    shipmentId: string,
    status: string
  ): Promise<IInternationalShipment> {
    try {
      // Find the shipment
      const shipment = await InternationalShipment.findOne({ shipmentId });
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }

      // Validate the status
      const validStatuses = [
        'created',
        'documents_pending',
        'documents_completed',
        'customs_processing',
        'customs_cleared',
        'in_transit',
        'delivered',
        'exception',
        'returned',
        'cancelled'
      ];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      // Update the status
      shipment.status = status;
      await shipment.save();

      return shipment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update shipment status: ${errorMessage}`);
    }
  }

  /**
   * List shipments for a user or organization
   * @param userId User ID (optional)
   * @param organizationId Organization ID (optional)
   * @param status Status filter (optional)
   * @param page Page number
   * @param limit Items per page
   * @returns Paginated shipments
   */
  public async listShipments(
    userId?: string,
    organizationId?: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    shipments: IInternationalShipment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Build query filters
      const filters: Record<string, any> = {};
      
      if (userId) {
        filters.userId = new mongoose.Types.ObjectId(userId);
      }
      
      if (organizationId) {
        filters.organizationId = new mongoose.Types.ObjectId(organizationId);
      }
      
      if (status) {
        filters.status = status;
      }

      // Get total count
      const total = await InternationalShipment.countDocuments(filters);
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);
      
      // Get shipments
      const shipments = await InternationalShipment.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        shipments,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list shipments: ${errorMessage}`);
    }
  }
}