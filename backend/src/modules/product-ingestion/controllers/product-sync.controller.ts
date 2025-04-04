import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';
import { ApiError } from '../../../middleware/error.middleware';
import { ProductIngestionService, IProductIngestionService, ProductOperationResult } from '../services/product-ingestion.service';
import { IProductSyncConfig } from '../models/product-sync-config.model';

/**
 * Request with authentication
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    _id?: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
}

/**
 * Product Sync Controller
 * Handles API requests for product synchronization
 */
@injectable()
export class ProductSyncController {
  constructor(
    @inject('Logger') private logger: Logger,
    @inject(ProductIngestionService) private productIngestionService: IProductIngestionService
  ) {}

  /**
   * Get sync configuration for a marketplace
   * @route GET /api/product-sync/config/:marketplaceId
   */
  async getSyncConfig(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { marketplaceId } = req.params;
      const userId = req.user.id || req.user._id as string;
      const { organizationId } = req.user;

      if (!marketplaceId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Marketplace ID is required');
      }

      const config = await this.productIngestionService.getSyncConfig(
        userId,
        organizationId,
        marketplaceId
      );

      if (!config) {
        // Return a default config if none exists
        res.status(StatusCodes.OK).json({
          success: true,
          data: {
            userId,
            organizationId,
            marketplaceId,
            syncEnabled: true,
            syncDirection: 'both',
            syncFrequency: 'daily',
            syncFields: ['price', 'stock', 'status'],
            defaultWarehouseId: 'default',
          }
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: config
      });
    } catch (error) {
      this.logger.error('Error in getSyncConfig', {
        error: error instanceof Error ? error.message : String(error),
        marketplaceId: req.params.marketplaceId,
        userId: req.user?.id || req.user?._id
      });
      next(error);
    }
  }

  /**
   * Update sync configuration for a marketplace
   * @route PUT /api/product-sync/config/:marketplaceId
   */
  async updateSyncConfig(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { marketplaceId } = req.params;
      const userId = req.user.id || req.user._id as string;
      const { organizationId } = req.user;

      if (!marketplaceId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Marketplace ID is required');
      }

      // Merge config data from request with user and marketplace IDs
      const configData: Partial<IProductSyncConfig> = {
        ...req.body,
        userId,
        organizationId,
        marketplaceId
      };

      // Update the sync configuration
      const result = await this.productIngestionService.updateSyncConfig(configData);

      if (!result.success) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          result.error?.message || 'Failed to update sync configuration',
          result.error?.details
        );
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      this.logger.error('Error in updateSyncConfig', {
        error: error instanceof Error ? error.message : String(error),
        marketplaceId: req.params.marketplaceId,
        userId: req.user?.id || req.user?._id,
        body: req.body
      });
      next(error);
    }
  }

  /**
   * Synchronize a product to marketplaces
   * @route POST /api/product-sync/products/:productId/sync
   */
  async syncProduct(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { productId } = req.params;
      const { marketplaceIds } = req.body;

      if (!productId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Product ID is required');
      }

      // Sync the product
      const result = await this.productIngestionService.syncProductToMarketplaces(
        productId,
        marketplaceIds
      );

      if (!result.success) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          result.error?.message || 'Failed to sync product',
          result.error?.details
        );
      }

      // Log the sync result
      this.logger.info('Product synchronized', {
        productId,
        marketplaceIds,
        successful: result.data?.successful,
        failed: result.data?.failed
      });

      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          productId,
          ...result.data
        }
      });
    } catch (error) {
      this.logger.error('Error in syncProduct', {
        error: error instanceof Error ? error.message : String(error),
        productId: req.params.productId,
        marketplaceIds: req.body.marketplaceIds,
        userId: req.user?.id || req.user?._id
      });
      next(error);
    }
  }

  /**
   * Trigger product ingestion from a marketplace
   * @route POST /api/product-sync/ingest/:marketplaceId
   */
  async ingestProducts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { marketplaceId } = req.params;
      const userId = req.user.id || req.user._id as string;
      const { organizationId } = req.user;
      const { products } = req.body;

      if (!marketplaceId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Marketplace ID is required');
      }

      if (!Array.isArray(products) || products.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Products array is required and must not be empty');
      }

      // Ingest the products
      const result = await this.productIngestionService.ingestProducts(
        marketplaceId,
        userId,
        organizationId,
        products
      );

      if (!result.success) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          result.error?.message || 'Failed to ingest products',
          result.error?.details
        );
      }

      // Log the ingestion result
      this.logger.info('Products ingested', {
        marketplaceId,
        count: result.data?.count,
        userId,
        organizationId
      });

      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          marketplaceId,
          count: result.data?.count,
          successCount: result.data?.count
        }
      });
    } catch (error) {
      this.logger.error('Error in ingestProducts', {
        error: error instanceof Error ? error.message : String(error),
        marketplaceId: req.params.marketplaceId,
        userId: req.user?.id || req.user?._id,
        productCount: Array.isArray(req.body.products) ? req.body.products.length : 0
      });
      next(error);
    }
  }
}

// Export controller to be used in routes
export default ProductSyncController;