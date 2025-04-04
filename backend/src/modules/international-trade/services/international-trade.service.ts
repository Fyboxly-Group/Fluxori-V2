import mongoose, { Types } from 'mongoose';
import { 
  InternationalShipment, 
  CustomsDeclaration, 
  IInternationalShipment, 
  ICustomsDeclaration,
  IAddress,
  IShipmentItem 
} from '../models/international-trade.model';
import { ComplianceService, IComplianceCheckResult } from './compliance.service';
import { ShippingRateService, IRateRequestParams, IShippingRate } from './shipping-rate.service';
import { 
  CustomsDocumentService, 
  IDocumentGenerationOptions, 
  IDocumentGenerationResult,
  DocumentType 
} from './customs-document.service';

/**
 * Shipment status type
 */
export type ShipmentStatus = 'draft' | 'pending' | 'processed' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Customs declaration status type
 */
export type DeclarationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

/**
 * Type for shipment creation data
 */
export interface IShipmentCreateData {
  origin: IAddress;
  destination: IAddress;
  packageDetails: {
    weight: number;
    weightUnit: string;
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
  };
  items: IShipmentItem[];
  carrier?: string;
  service?: string;
  trackingNumber?: string;
}

/**
 * Type for shipment query parameters
 */
export interface IShipmentQuery {
  organizationId: Types.ObjectId;
  userId?: Types.ObjectId;
  status?: ShipmentStatus;
}

/**
 * Type for shipment list response
 */
export interface IShipmentListResponse {
  shipments: IInternationalShipment[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Type for shipment details response
 */
export interface IShipmentDetailsResponse {
  shipment: IInternationalShipment | null;
  customsDeclaration?: ICustomsDeclaration | null;
}

/**
 * Type for customs declaration creation data
 */
export interface IDeclarationCreateData {
  declarationType: string;
  exporterDetails: {
    name: string;
    taxId?: string;
    address: string;
  };
  importerDetails: {
    name: string;
    taxId?: string;
    address: string;
  };
  items: Array<{
    description: string;
    hsCode: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
    netWeight: number;
    originCountry: string;
  }>;
  totalValue: number;
  currency: string;
  incoterm: string;
}

/**
 * Service for handling international trade operations
 */
export class InternationalTradeService {
  private complianceService: ComplianceService;
  private shippingRateService: ShippingRateService;
  private customsDocumentService: CustomsDocumentService;

  /**
   * Constructor
   */
  constructor() {
    this.complianceService = new ComplianceService();
    this.shippingRateService = new ShippingRateService();
    this.customsDocumentService = new CustomsDocumentService();
  }

  /**
   * Create a new international shipment
   * 
   * @param shipmentData Shipment creation data
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns Created shipment
   */
  public async createShipment(
    shipmentData: IShipmentCreateData,
    userId: string,
    organizationId: string
  ): Promise<IInternationalShipment> {
    try {
      // Validate userId and organizationId
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(organizationId)) {
        throw new Error('Invalid user ID or organization ID');
      }

      // Create new shipment
      const shipment = new InternationalShipment({
        ...shipmentData,
        userId: new Types.ObjectId(userId),
        organizationId: new Types.ObjectId(organizationId),
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Save shipment
      await shipment.save();
      return shipment;
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error instanceof Error ? error : new Error('Unknown error creating shipment');
    }
  }

  /**
   * Get details for a shipment
   * 
   * @param shipmentId Shipment ID
   * @returns Shipment details
   */
  public async getShipmentDetails(shipmentId: string): Promise<IShipmentDetailsResponse> {
    try {
      // Validate shipment ID
      if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
        throw new Error('Invalid shipment ID');
      }

      // Find shipment
      const shipment = await InternationalShipment.findById(shipmentId);
      
      // Find customs declaration for this shipment
      const customsDeclaration = shipment 
        ? await CustomsDeclaration.findOne({ shipmentId: shipment._id })
        : null;

      return { 
        shipment,
        customsDeclaration
      };
    } catch (error) {
      console.error('Error getting shipment details:', error);
      throw error instanceof Error ? error : new Error('Unknown error getting shipment details');
    }
  }

  /**
   * List shipments with filtering and pagination
   * 
   * @param userId User ID
   * @param organizationId Organization ID
   * @param status Optional status filter
   * @param page Page number
   * @param limit Results per page
   * @returns Paginated list of shipments
   */
  public async listShipments(
    userId: string,
    organizationId: string,
    status?: ShipmentStatus,
    page = 1,
    limit = 10
  ): Promise<IShipmentListResponse> {
    try {
      // Validate organizationId
      if (!mongoose.Types.ObjectId.isValid(organizationId)) {
        throw new Error('Invalid organization ID');
      }

      // Build query
      const query: IShipmentQuery = {
        organizationId: new Types.ObjectId(organizationId)
      };

      // Add status filter if provided
      if (status) {
        query.status = status;
      }

      // Get total count and shipments
      const total = await InternationalShipment.countDocuments(query);
      const shipments = await InternationalShipment.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        shipments,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error listing shipments:', error);
      throw error instanceof Error ? error : new Error('Unknown error listing shipments');
    }
  }

  /**
   * Create a customs declaration for a shipment
   * 
   * @param declarationData Customs declaration creation data
   * @param shipmentId Shipment ID
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns Created customs declaration
   */
  public async createCustomsDeclaration(
    declarationData: IDeclarationCreateData,
    shipmentId: string,
    userId: string,
    organizationId: string
  ): Promise<ICustomsDeclaration> {
    try {
      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(shipmentId) ||
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(organizationId)
      ) {
        throw new Error('Invalid shipment ID, user ID, or organization ID');
      }

      // Verify shipment exists
      const shipment = await InternationalShipment.findById(shipmentId);
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }

      // Create new customs declaration
      const declaration = new CustomsDeclaration({
        ...declarationData,
        shipmentId: new Types.ObjectId(shipmentId),
        userId: new Types.ObjectId(userId),
        organizationId: new Types.ObjectId(organizationId),
        status: 'draft', // Default status for new declarations
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Save declaration
      await declaration.save();
      return declaration;
    } catch (error) {
      console.error('Error creating customs declaration:', error);
      throw error instanceof Error ? error : new Error('Unknown error creating customs declaration');
    }
  }

  /**
   * Run compliance checks for a shipment
   * 
   * @param shipmentId Shipment ID
   * @returns Compliance check results
   */
  public async runComplianceChecks(shipmentId: string): Promise<IComplianceCheckResult> {
    try {
      // Validate shipment ID
      if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
        throw new Error('Invalid shipment ID');
      }

      // Use compliance service to run checks
      return await this.complianceService.checkCompliance(shipmentId);
    } catch (error) {
      console.error('Error running compliance checks:', error);
      throw error instanceof Error ? error : new Error('Unknown error running compliance checks');
    }
  }

  /**
   * Get shipping rates for a shipment
   * 
   * @param shipmentId Shipment ID
   * @param params Optional rate request parameters
   * @returns Shipping rates from various carriers
   */
  public async getShippingRates(shipmentId: string, params?: IRateRequestParams): Promise<IShippingRate[]> {
    try {
      // Validate shipment ID
      if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
        throw new Error('Invalid shipment ID');
      }

      // Use shipping rate service to get rates
      return await this.shippingRateService.getShippingRates(shipmentId, params);
    } catch (error) {
      console.error('Error getting shipping rates:', error);
      throw error instanceof Error ? error : new Error('Unknown error getting shipping rates');
    }
  }

  /**
   * Generate shipment documents
   * 
   * @param shipmentId Shipment ID
   * @param options Document generation options
   * @returns Generated documents
   */
  public async generateShipmentDocuments(
    shipmentId: string, 
    options?: IDocumentGenerationOptions
  ): Promise<IDocumentGenerationResult> {
    try {
      // Validate shipment ID
      if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
        throw new Error('Invalid shipment ID');
      }

      // Use customs document service to generate documents
      return await this.customsDocumentService.generateDocuments(shipmentId, options);
    } catch (error) {
      console.error('Error generating shipment documents:', error);
      throw error instanceof Error ? error : new Error('Unknown error generating shipment documents');
    }
  }

  /**
   * Update shipment status
   * 
   * @param shipmentId Shipment ID
   * @param status New status
   * @returns Updated shipment
   */
  public async updateShipmentStatus(
    shipmentId: string,
    status: ShipmentStatus
  ): Promise<IInternationalShipment | null> {
    try {
      // Validate shipment ID
      if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
        throw new Error('Invalid shipment ID');
      }

      // Update shipment status
      const updatedShipment = await InternationalShipment.findByIdAndUpdate(
        shipmentId,
        { 
          status,
          updatedAt: new Date()
        },
        { new: true }
      );

      return updatedShipment;
    } catch (error) {
      console.error('Error updating shipment status:', error);
      throw error instanceof Error ? error : new Error('Unknown error updating shipment status');
    }
  }

  /**
   * Update customs declaration status
   * 
   * @param declarationId Declaration ID
   * @param status New status
   * @returns Updated customs declaration
   */
  public async updateDeclarationStatus(
    declarationId: string,
    status: DeclarationStatus
  ): Promise<ICustomsDeclaration | null> {
    try {
      // Validate declaration ID
      if (!mongoose.Types.ObjectId.isValid(declarationId)) {
        throw new Error('Invalid declaration ID');
      }

      // Update declaration status
      const updatedDeclaration = await CustomsDeclaration.findByIdAndUpdate(
        declarationId,
        { 
          status,
          updatedAt: new Date()
        },
        { new: true }
      );

      return updatedDeclaration;
    } catch (error) {
      console.error('Error updating declaration status:', error);
      throw error instanceof Error ? error : new Error('Unknown error updating declaration status');
    }
  }
}
