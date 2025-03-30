import { Request, Response, NextFunction } from 'express';
import { InternationalTradeService } from '../services/international-trade.service';
import { ShippingRateService } from '../services/shipping-rate.service';
import { lookupHsCodes, getHsCodeDetails } from '../utils/hs-code-lookup';
import { calculateDuties, getProhibitedItems } from '../utils/customs-calculator';

// Use the Express namespace for extending the Request type
import { IUserDocument } from '../../../models/user.model';

// Define a type that matches what our auth middleware provides
// Define the authenticated request interface to match what auth middleware provides
interface AuthUser {
  id: string;
  organizationId: string;
  email?: string;
  role?: string;
}

// Extend IUserDocument for compatibility with our auth middleware
interface AuthenticatedUserDocument extends IUserDocument {
  organizationId: string;
}

// Define the authenticated request type
type AuthenticatedRequest = Request & {
  user?: AuthUser | AuthenticatedUserDocument;
}

/**
 * Controller for international trade module
 */
export class InternationalTradeController {
  private tradeService: InternationalTradeService;
  private shippingService: ShippingRateService;

  constructor() {
    this.tradeService = new InternationalTradeService();
    this.shippingService = new ShippingRateService();
  }

  /**
   * Create a new international shipment
   */
  public createShipment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { shipmentData } = req.body;
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User ID and organization ID are required' 
        });
      }

      const shipment = await this.tradeService.createShipment(
        shipmentData,
        userId,
        organizationId
      );

      return res.status(201).json({
        success: true,
        data: shipment
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Get a shipment by ID
   */
  public getShipment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { shipmentId } = req.params;

      const shipmentDetails = await this.tradeService.getShipmentDetails(shipmentId);

      if (!shipmentDetails.shipment) {
        return res.status(404).json({
          success: false,
          message: `Shipment with ID ${shipmentId} not found`
        });
      }

      return res.status(200).json({
        success: true,
        data: shipmentDetails
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Get shipments with filtering and pagination
   */
  public getShipments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User ID and organization ID are required' 
        });
      }

      // Parse query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await this.tradeService.listShipments(
        userId,
        organizationId,
        status,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Update a shipment
   */
  public updateShipment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // This is a placeholder - in a real controller, this would update the shipment
      return res.status(200).json({
        success: true,
        message: 'Shipment updated successfully'
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Create a customs declaration for a shipment
   */
  public createCustomsDeclaration = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { shipmentId } = req.params;
      const { declarationData } = req.body;
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User ID and organization ID are required' 
        });
      }

      const declaration = await this.tradeService.createCustomsDeclaration(
        declarationData,
        shipmentId,
        userId,
        organizationId
      );

      return res.status(201).json({
        success: true,
        data: declaration
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Update a customs declaration
   */
  public updateCustomsDeclaration = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // This is a placeholder - in a real controller, this would update the customs declaration
      return res.status(200).json({
        success: true,
        message: 'Customs declaration updated successfully'
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Run compliance checks for a shipment
   */
  public runComplianceChecks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { shipmentId } = req.params;
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User ID and organization ID are required' 
        });
      }

      const compliance = await this.tradeService.runComplianceChecks(shipmentId);

      return res.status(200).json({
        success: true,
        data: compliance
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Get shipping rates for a shipment
   */
  public getShippingRates = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { shipmentId } = req.params;
      const rates = await this.tradeService.getShippingRates(shipmentId);

      return res.status(200).json({
        success: true,
        data: rates
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Book a shipment with a carrier
   */
  public bookShipment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // This is a placeholder - in a real controller, this would book the shipment
      return res.status(200).json({
        success: true,
        message: 'Shipment booked successfully',
        data: {
          trackingNumber: 'MOCK123456789',
          label: 'https://example.com/label.pdf',
          estimatedDelivery: new Date(Date.now() + 86400000 * 3) // 3 days from now
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Track a shipment
   */
  public trackShipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trackingNumber } = req.params;
      const carrier = req.query.carrier as string;

      if (!trackingNumber || !carrier) {
        return res.status(400).json({
          success: false,
          message: 'Tracking number and carrier are required'
        });
      }

      const trackingInfo = await this.shippingService.trackShipment(trackingNumber, carrier);

      return res.status(200).json({
        success: true,
        data: trackingInfo
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Cancel a shipment
   */
  public cancelShipment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // This is a placeholder - in a real controller, this would cancel the shipment
      return res.status(200).json({
        success: true,
        message: 'Shipment cancelled successfully'
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Generate customs documents for a shipment
   */
  public generateCustomsDocuments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { shipmentId } = req.params;
      const documents = await this.tradeService.generateShipmentDocuments(shipmentId);

      return res.status(200).json({
        success: true,
        data: documents
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Look up HS codes for a product description
   */
  public lookupHsCodes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const description = req.query.description as string;

      if (!description) {
        return res.status(400).json({
          success: false,
          message: 'Product description is required'
        });
      }

      const hsCodes = await lookupHsCodes(description);

      return res.status(200).json({
        success: true,
        data: hsCodes
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Calculate duties and taxes for items
   */
  public calculateDuties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, originCountry, destinationCountry } = req.body;

      if (!items || !originCountry || !destinationCountry) {
        return res.status(400).json({
          success: false,
          message: 'Items, origin country, and destination country are required'
        });
      }

      const dutiesResult = await calculateDuties(items, originCountry, destinationCountry);

      return res.status(200).json({
        success: true,
        data: dutiesResult
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Get prohibited and restricted items for a country
   */
  public getProhibitedItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { countryCode } = req.params;

      if (!countryCode) {
        return res.status(400).json({
          success: false,
          message: 'Country code is required'
        });
      }

      const prohibitedItems = getProhibitedItems(countryCode);

      return res.status(200).json({
        success: true,
        data: prohibitedItems
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };

  /**
   * Get available shipping options
   */
  public getShippingOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // This is a placeholder - in a real controller, this would get available shipping options
      return res.status(200).json({
        success: true,
        data: [
          {
            carrier: 'fedex',
            name: 'FedEx',
            services: [
              { code: 'PRIORITY_OVERNIGHT', name: 'Priority Overnight' },
              { code: 'STANDARD_OVERNIGHT', name: 'Standard Overnight' },
              { code: 'FEDEX_2_DAY', name: 'FedEx 2Day' },
              { code: 'FEDEX_GROUND', name: 'FedEx Ground' }
            ]
          },
          {
            carrier: 'dhl',
            name: 'DHL Express',
            services: [
              { code: 'EXPRESS_WORLDWIDE', name: 'DHL Express Worldwide' },
              { code: 'EXPRESS_ECONOMY', name: 'DHL Express Economy' }
            ]
          },
          {
            carrier: 'ups',
            name: 'UPS',
            services: [
              { code: 'UPS_NEXT_DAY_AIR', name: 'UPS Next Day Air' },
              { code: 'UPS_2ND_DAY_AIR', name: 'UPS 2nd Day Air' },
              { code: 'UPS_GROUND', name: 'UPS Ground' }
            ]
          }
        ]
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      next(error);
    }
  };
}