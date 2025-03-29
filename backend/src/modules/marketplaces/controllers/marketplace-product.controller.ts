import { Request, Response } from 'express';
import { ProductPushService } from '../services/product-push.service';
import { ApiError } from '../../../middleware/error.middleware';
import InventoryItem from '../../../models/inventory.model';

// Import the extended Express Request interface with user property
import '../../../middleware/auth.middleware';

/**
 * Controller for marketplace product operations
 */
export class MarketplaceProductController {
  /**
   * Push product updates to a marketplace
   * @route POST /api/products/:productId/push/:marketplaceId
   * @param req - Express request
   * @param res - Express response
   */
  static async pushProductUpdates(req: Request, res: Response) {
    try {
      const { productId, marketplaceId } = req.params;
      const { price, rrp, stock, status } = req.body;
      
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      // Validate that the product exists and the user has access to it
      const product = await InventoryItem.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found`
        });
      }
      
      // Check if product belongs to the user
      if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to push updates for this product'
        });
      }
      
      // Ensure at least one update field is provided
      if (price === undefined && rrp === undefined && stock === undefined && status === undefined) {
        return res.status(400).json({
          success: false,
          message: 'At least one update field (price, rrp, stock, status) must be provided'
        });
      }
      
      // Process status update
      let normalizedStatus: 'active' | 'inactive' | undefined;
      if (status !== undefined) {
        if (status === true || status === 'active' || status === 'true') {
          normalizedStatus = 'active';
        } else if (status === false || status === 'inactive' || status === 'false') {
          normalizedStatus = 'inactive';
        } else {
          return res.status(400).json({
            success: false,
            message: 'Status must be "active", "inactive", true, or false'
          });
        }
      }
      
      // Push updates to marketplace
      const pushService = ProductPushService.getInstance();
      const result = await pushService.pushProductUpdate(
        productId,
        marketplaceId,
        req.user.id,
        {
          price: price !== undefined ? Number(price) : undefined,
          rrp: rrp !== undefined ? Number(rrp) : undefined,
          stock: stock !== undefined ? Number(stock) : undefined,
          status: normalizedStatus
        }
      );
      
      // Return result to client
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error in pushProductUpdates:', error);
      const statusCode = error && typeof error === 'object' && 'statusCode' in error 
        ? (error as { statusCode: number }).statusCode 
        : 500;
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as Error).message
        : 'Internal server error';
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }
  
  /**
   * Get a list of available marketplaces for the user
   * @route GET /api/marketplaces/connected
   * @param req - Express request
   * @param res - Express response
   */
  static async getConnectedMarketplaces(req: Request, res: Response) {
    try {
      // In a real implementation, you would fetch the actual connections from your database
      // For now, we'll return mock data
      
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      // Mock connected marketplaces
      const connectedMarketplaces = [
        {
          id: 'takealot',
          name: 'Takealot',
          status: 'connected',
          lastSynced: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          features: ['price', 'stock', 'status'],
          logo: 'https://www.takealot.com/favicon.ico'
        }
        // Add other marketplaces as they become supported
      ];
      
      return res.status(200).json({
        success: true,
        data: connectedMarketplaces
      });
    } catch (error) {
      console.error('Error in getConnectedMarketplaces:', error);
      const statusCode = error && typeof error === 'object' && 'statusCode' in error 
        ? (error as { statusCode: number }).statusCode 
        : 500;
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as Error).message
        : 'Internal server error';
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }
}