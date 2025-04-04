import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { 
  InternationalTradeService,
  IShipmentCreateData,
  IDeclarationCreateData,
  ShipmentStatus
} from '../services/international-trade.service';
import { ComplianceService } from '../services/compliance.service';
import { ShippingRateService, IRateRequestParams } from '../services/shipping-rate.service';
import { 
  CustomsDocumentService, 
  IDocumentGenerationOptions,
  DocumentType
} from '../services/customs-document.service';
import { IAddress, IShipmentItem, IDimensions } from '../models/international-trade.model';
import { IRateRequest, ITrackingRequest } from '../interfaces/shipping-provider.interface';

// Extended Request type with authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    roles?: string[];
  };
}

/**
 * International Trade Controller
 * 
 * Handles all international trade related API endpoints
 */
export class InternationalTradeController {
  private tradeService: InternationalTradeService;
  private complianceService: ComplianceService;
  private shippingService: ShippingRateService;
  private documentService: CustomsDocumentService;

  constructor() {
    this.tradeService = new InternationalTradeService();
    this.complianceService = new ComplianceService();
    this.shippingService = new ShippingRateService();
    this.documentService = new CustomsDocumentService();
    
    // Bind methods to maintain 'this' context
    this.createShipment = this.createShipment.bind(this);
    this.getShipmentDetails = this.getShipmentDetails.bind(this);
    this.listShipments = this.listShipments.bind(this);
    this.createCustomsDeclaration = this.createCustomsDeclaration.bind(this);
    this.getComplianceInfo = this.getComplianceInfo.bind(this);
    this.getShippingRates = this.getShippingRates.bind(this);
    this.generateDocuments = this.generateDocuments.bind(this);
    this.trackShipment = this.trackShipment.bind(this);
  }

  /**
   * Create a new international shipment
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next middleware function
   */
  public async createShipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const shipmentData = req.body as IShipmentCreateData;

      // Validate required fields
      if (!shipmentData.origin || !shipmentData.destination || !shipmentData.packageDetails) {
        res.status(400).json({ message: 'Missing required shipment data' });
        return;
      }

      const shipment = await this.tradeService.createShipment(shipmentData, userId, organizationId);
      
      res.status(201).json({ 
        success: true, 
        message: 'Shipment created successfully',
        data: shipment 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get details for a specific shipment
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next middleware function
   */
  public async getShipmentDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const shipmentId = req.params.id;
      
      if (!Types.ObjectId.isValid(shipmentId)) {
        res.status(400).json({ message: 'Invalid shipment ID' });
        return;
      }

      const result = await this.tradeService.getShipmentDetails(shipmentId);
      
      if (!result.shipment) {
        res.status(404).json({ message: 'Shipment not found' });
        return;
      }
      
      res.status(200).json({ 
        success: true, 
        data: result.shipment 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all shipments with optional filtering and pagination
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next middleware function
   */
  public async listShipments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const status = req.query.status as ShipmentStatus | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.tradeService.listShipments(
        userId, 
        organizationId, 
        status,
        page,
        limit
      );
      
      res.status(200).json({ 
        success: true, 
        data: result.shipments,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a customs declaration for a shipment
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next middleware function
   */
  public async createCustomsDeclaration(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const shipmentId = req.params.shipmentId;
      
      if (!Types.ObjectId.isValid(shipmentId)) {
        res.status(400).json({ message: 'Invalid shipment ID' });
        return;
      }
      
      const declarationData = req.body as IDeclarationCreateData;
      
      // Validate required fields
      if (!declarationData.declarationType || !declarationData.exporterDetails || !declarationData.items) {
        res.status(400).json({ message: 'Missing required declaration data' });
        return;
      }

      const declaration = await this.tradeService.createCustomsDeclaration(
        declarationData,
        shipmentId,
        userId,
        organizationId
      );
      
      res.status(201).json({ 
        success: true, 
        message: 'Customs declaration created successfully',
        data: declaration 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get compliance information for a shipment
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next middleware function
   */
  public async getComplianceInfo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const shipmentId = req.params.id;
      
      if (!Types.ObjectId.isValid(shipmentId)) {
        res.status(400).json({ message: 'Invalid shipment ID' });
        return;
      }

      // Get compliance information
      const complianceInfo = await this.complianceService.checkCompliance(shipmentId);
      
      res.status(200).json({ 
        success: true,
        data: complianceInfo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get shipping rates for a shipment
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next middleware function
   */
  public async getShippingRates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      // Rate request can either come from existing shipment ID or from request body
      if (req.params.id) {
        // Get rates for existing shipment
        const shipmentId = req.params.id;
        
        if (!Types.ObjectId.isValid(shipmentId)) {
          res.status(400).json({ message: 'Invalid shipment ID' });
          return;
        }

        // Extract rate request parameters from query
        const rateParams: IRateRequestParams = {
          carrier: req.query.carrier as string,
          service: req.query.service as string,
          urgency: req.query.urgency as 'economy' | 'standard' | 'express' | undefined,
          options: {
            insurance: req.query.insurance === 'true',
            signature: req.query.signature === 'true',
            saturdayDelivery: req.query.saturdayDelivery === 'true',
            dangerousGoods: req.query.dangerousGoods === 'true'
          }
        };

        const rates = await this.tradeService.getShippingRates(shipmentId, rateParams);
        
        res.status(200).json({ 
          success: true,
          data: rates 
        });
      } else {
        // Generating rates from scratch not implemented in this version
        // This would require creating a temporary shipment or using a different endpoint
        res.status(400).json({ 
          success: false,
          message: 'Please provide a shipment ID to get rates' 
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate shipment documents
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next middleware function
   */
  public async generateDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const shipmentId = req.params.id;
      
      if (!Types.ObjectId.isValid(shipmentId)) {
        res.status(400).json({ message: 'Invalid shipment ID' });
        return;
      }

      // Create document generation options
      const options: IDocumentGenerationOptions = {
        format: req.query.format as 'pdf' | 'docx' | 'html' | undefined,
        language: req.query.language as string,
        includeLogoAndBranding: req.query.branding === 'true',
        includeDigitalSignature: req.query.signature === 'true',
        saveToCloud: req.query.save === 'true'
      };

      const documents = await this.tradeService.generateShipmentDocuments(shipmentId, options);
      
      res.status(200).json({ 
        success: true,
        data: documents 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Track a shipment
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next middleware function
   */
  public async trackShipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      let trackingInfo;

      // Tracking can come from shipment ID or tracking number
      if (req.params.id && Types.ObjectId.isValid(req.params.id)) {
        // Get the shipment details to find the tracking number
        const shipmentId = req.params.id;
        const shipmentDetails = await this.tradeService.getShipmentDetails(shipmentId);
        
        if (!shipmentDetails.shipment || !shipmentDetails.shipment.trackingNumber) {
          res.status(404).json({ 
            success: false,
            message: 'No tracking number found for this shipment' 
          });
          return;
        }
        
        // Track using the shipment's tracking number
        trackingInfo = await this.shippingService.getTrackingInfo(
          shipmentDetails.shipment.trackingNumber,
          shipmentDetails.shipment.carrier
        );
      } else if (req.body.trackingNumber) {
        // Track by tracking number directly
        trackingInfo = await this.shippingService.getTrackingInfo(
          req.body.trackingNumber,
          req.body.carrier
        );
      } else {
        res.status(400).json({ 
          success: false,
          message: 'Missing shipment ID or tracking number' 
        });
        return;
      }
      
      res.status(200).json({ 
        success: true,
        data: trackingInfo 
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create controller instance
const internationalTradeController = new InternationalTradeController();

// Export individual controller methods
export const {
  createShipment,
  getShipmentDetails,
  listShipments,
  createCustomsDeclaration,
  getComplianceInfo,
  getShippingRates,
  generateDocuments,
  trackShipment
} = internationalTradeController;

// Export the controller instance as default
export default internationalTradeController;