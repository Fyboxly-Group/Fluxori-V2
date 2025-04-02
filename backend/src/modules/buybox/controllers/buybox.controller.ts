/**
 * Buy Box Controller
 * 
 * Handles API requests for Buy Box functionality
 */
import { Request, Response } from 'express';
import { getBuyBoxMonitoringService } from '../services/buybox-monitoring.service';
import { getBuyBoxHistoryRepository } from '../repositories/buybox-history.repository';
import { getBuyBoxMonitorFactory } from '../factories/buybox-monitor.factory';
import { Logger } from '../../../utils/logger';

/**
 * Buy Box controller
 */
export class BuyBoxController {
  private readonly logger: Logger;
  
  /**
   * Constructor
   */
  constructor() {
    this.logger = new Logger('BuyBoxController');
  }
  
  /**
   * Initialize Buy Box monitoring for a product
   * @param req Express request
   * @param res Express response
   */
  async initializeMonitoring(req: Request, res: Response): Promise<void> {
    try {
      const { productId, marketplaceId, marketplaceProductId, monitoringFrequency } = req.body;
      
      // Validate required fields
      if (!productId || !marketplaceId || !marketplaceProductId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: productId, marketplaceId, marketplaceProductId'
        });
        return;
      }
      
      // Check if marketplace is supported
      const factory = getBuyBoxMonitorFactory();
      if (!factory.isMarketplaceSupported(marketplaceId)) {
        res.status(400).json({
          success: false,
          message: `Marketplace not supported for Buy Box monitoring: ${marketplaceId}`,
          supportedMarketplaces: factory.getSupportedMarketplaces()
        });
        return;
      }
      
      // Initialize monitoring
      const service = getBuyBoxMonitoringService();
      const history = await service.initializeMonitoring(
        productId,
        marketplaceId,
        marketplaceProductId,
        monitoringFrequency
      );
      
      res.status(200).json({
        success: true,
        message: 'Buy Box monitoring initialized successfully',
        data: history
      });
    } catch (error) {
      this.logger.error('Failed to initialize Buy Box monitoring', error);
      
      res.status(500).json({
        success: false,
        message: `Error initializing Buy Box monitoring: ${(error as Error).message}`
      });
    }
  }
  
  /**
   * Stop Buy Box monitoring for a product
   * @param req Express request
   * @param res Express response
   */
  async stopMonitoring(req: Request, res: Response): Promise<void> {
    try {
      const { productId, marketplaceId } = req.body;
      
      // Validate required fields
      if (!productId || !marketplaceId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: productId, marketplaceId'
        });
        return;
      }
      
      // Stop monitoring
      const service = getBuyBoxMonitoringService();
      const success = await service.stopMonitoring(productId, marketplaceId);
      
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Buy Box monitoring stopped successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Buy Box monitoring not found or failed to stop'
        });
      }
    } catch (error) {
      this.logger.error('Failed to stop Buy Box monitoring', error);
      
      res.status(500).json({
        success: false,
        message: `Error stopping Buy Box monitoring: ${(error as Error).message}`
      });
    }
  }
  
  /**
   * Initialize Buy Box monitoring for all products on a marketplace
   * @param req Express request
   * @param res Express response
   */
  async initializeMonitoringForMarketplace(req: Request, res: Response): Promise<void> {
    try {
      const { marketplaceId, monitoringFrequency } = req.body;
      
      // Validate required fields
      if (!marketplaceId) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: marketplaceId'
        });
        return;
      }
      
      // Check if marketplace is supported
      const factory = getBuyBoxMonitorFactory();
      if (!factory.isMarketplaceSupported(marketplaceId)) {
        res.status(400).json({
          success: false,
          message: `Marketplace not supported for Buy Box monitoring: ${marketplaceId}`,
          supportedMarketplaces: factory.getSupportedMarketplaces()
        });
        return;
      }
      
      // Initialize monitoring for all products
      const service = getBuyBoxMonitoringService();
      const count = await service.initializeMonitoringForMarketplace(
        marketplaceId,
        monitoringFrequency
      );
      
      res.status(200).json({
        success: true,
        message: `Buy Box monitoring initialized for ${count} products on ${marketplaceId}`,
        count
      });
    } catch (error) {
      this.logger.error('Failed to initialize Buy Box monitoring for marketplace', error);
      
      res.status(500).json({
        success: false,
        message: `Error initializing Buy Box monitoring: ${(error as Error).message}`
      });
    }
  }
  
  /**
   * Check Buy Box status for a product
   * @param req Express request
   * @param res Express response
   */
  async checkBuyBoxStatus(req: Request, res: Response): Promise<void> {
    try {
      const { productId, marketplaceId, marketplaceProductId } = req.body;
      
      // Validate required fields
      if (!productId || !marketplaceId || !marketplaceProductId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: productId, marketplaceId, marketplaceProductId'
        });
        return;
      }
      
      // Check Buy Box status
      const service = getBuyBoxMonitoringService();
      const snapshot = await service.checkBuyBoxStatus(
        productId,
        marketplaceId,
        marketplaceProductId
      );
      
      res.status(200).json({
        success: true,
        message: 'Buy Box status checked successfully',
        data: snapshot
      });
    } catch (error) {
      this.logger.error('Failed to check Buy Box status', error);
      
      res.status(500).json({
        success: false,
        message: `Error checking Buy Box status: ${(error as Error).message}`
      });
    }
  }
  
  /**
   * Get Buy Box history for a product
   * @param req Express request
   * @param res Express response
   */
  async getBuyBoxHistory(req: Request, res: Response): Promise<void> {
    try {
      const { productId, marketplaceId } = req.params;
      
      // Validate required fields
      if (!productId || !marketplaceId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: productId, marketplaceId'
        });
        return;
      }
      
      // Get Buy Box history
      const repository = getBuyBoxHistoryRepository();
      const historyId = `${productId}_${marketplaceId}`;
      const history = await repository.getById(historyId);
      
      if (!history) {
        res.status(404).json({
          success: false,
          message: 'Buy Box history not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      this.logger.error('Failed to get Buy Box history', error);
      
      res.status(500).json({
        success: false,
        message: `Error getting Buy Box history: ${(error as Error).message}`
      });
    }
  }
  
  /**
   * Get Buy Box histories for a marketplace
   * @param req Express request
   * @param res Express response
   */
  async getBuyBoxHistoriesByMarketplace(req: Request, res: Response): Promise<void> {
    try {
      const { marketplaceId } = req.params;
      const { limit, startAfter } = req.query;
      
      // Validate required fields
      if (!marketplaceId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameter: marketplaceId'
        });
        return;
      }
      
      // Get Buy Box histories
      const repository = getBuyBoxHistoryRepository();
      const result = await repository.getByMarketplace(
        marketplaceId,
        limit ? parseInt(limit as string) : undefined,
        startAfter as any
      );
      
      res.status(200).json({
        success: true,
        data: result.histories,
        pagination: {
          hasMore: !!result.lastDoc,
          lastDoc: result.lastDoc ? result.lastDoc.id : null
        }
      });
    } catch (error) {
      this.logger.error('Failed to get Buy Box histories by marketplace', error);
      
      res.status(500).json({
        success: false,
        message: `Error getting Buy Box histories: ${(error as Error).message}`
      });
    }
  }
  
  /**
   * Apply repricing rules
   * @param req Express request
   * @param res Express response
   */
  async applyRepricingRules(req: Request, res: Response): Promise<void> {
    try {
      // Apply repricing rules
      const service = getBuyBoxMonitoringService();
      const count = await service.applyRepricingRules();
      
      res.status(200).json({
        success: true,
        message: `Repricing rules applied to ${count} products`,
        count
      });
    } catch (error) {
      this.logger.error('Failed to apply repricing rules', error);
      
      res.status(500).json({
        success: false,
        message: `Error applying repricing rules: ${(error as Error).message}`
      });
    }
  }
}