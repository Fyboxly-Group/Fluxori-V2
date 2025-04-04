/**
 * Buy Box Controller
 * 
 * Handles API requests for Buy Box functionality
 */
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { 
  BuyBoxMonitoringService, 
  IBuyBoxMonitoringService 
} from '../services/buybox-monitoring.service';
import { 
  BuyBoxHistoryRepository, 
  IBuyBoxHistoryRepository 
} from '../repositories/buybox-history.repository';
import { 
  BuyBoxMonitorFactory 
} from '../factories/buybox-monitor.factory';

/**
 * Interface for BuyBox controller
 */
export interface IBuyBoxController {
  initializeMonitoring(req: Request, res: Response): Promise<void>;
  stopMonitoring(req: Request, res: Response): Promise<void>;
  initializeMonitoringForMarketplace(req: Request, res: Response): Promise<void>;
  checkBuyBoxStatus(req: Request, res: Response): Promise<void>;
  getBuyBoxHistory(req: Request, res: Response): Promise<void>;
  getBuyBoxHistoriesByMarketplace(req: Request, res: Response): Promise<void>;
  applyRepricingRules(req: Request, res: Response): Promise<void>;
  executeRuleManually(req: Request, res: Response): Promise<void>;
}

/**
 * Buy Box controller
 */
@injectable()
export class BuyBoxController implements IBuyBoxController {
  /**
   * Constructor
   */
  constructor(
    @inject('Logger') private logger: Logger,
    @inject(BuyBoxMonitoringService) private buyBoxMonitoringService: IBuyBoxMonitoringService,
    @inject(BuyBoxHistoryRepository) private buyBoxHistoryRepository: IBuyBoxHistoryRepository,
    @inject(BuyBoxMonitorFactory) private buyBoxMonitorFactory: BuyBoxMonitorFactory
  ) {}
  
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
      if (!this.buyBoxMonitorFactory.isMarketplaceSupported(marketplaceId)) {
        res.status(400).json({
          success: false,
          message: `Marketplace not supported for Buy Box monitoring: ${marketplaceId}`,
          supportedMarketplaces: this.buyBoxMonitorFactory.getSupportedMarketplaces()
        });
        return;
      }
      
      // Initialize monitoring
      const history = await this.buyBoxMonitoringService.initializeMonitoring(
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
        message: `Error initializing Buy Box monitoring: ${error instanceof Error ? error.message : String(error)}`
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
      const success = await this.buyBoxMonitoringService.stopMonitoring(productId, marketplaceId);
      
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
        message: `Error stopping Buy Box monitoring: ${error instanceof Error ? error.message : String(error)}`
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
      if (!this.buyBoxMonitorFactory.isMarketplaceSupported(marketplaceId)) {
        res.status(400).json({
          success: false,
          message: `Marketplace not supported for Buy Box monitoring: ${marketplaceId}`,
          supportedMarketplaces: this.buyBoxMonitorFactory.getSupportedMarketplaces()
        });
        return;
      }
      
      // Initialize monitoring for all products
      const count = await this.buyBoxMonitoringService.initializeMonitoringForMarketplace(
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
        message: `Error initializing Buy Box monitoring: ${error instanceof Error ? error.message : String(error)}`
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
      const snapshot = await this.buyBoxMonitoringService.checkBuyBoxStatus(
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
        message: `Error checking Buy Box status: ${error instanceof Error ? error.message : String(error)}`
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
      const historyId = `${productId}_${marketplaceId}`;
      const history = await this.buyBoxHistoryRepository.findById(historyId);
      
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
        message: `Error getting Buy Box history: ${error instanceof Error ? error.message : String(error)}`
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
      const histories = await this.buyBoxHistoryRepository.findByMarketplaceId(marketplaceId);
      
      res.status(200).json({
        success: true,
        data: histories
      });
    } catch (error) {
      this.logger.error('Failed to get Buy Box histories by marketplace', error);
      
      res.status(500).json({
        success: false,
        message: `Error getting Buy Box histories: ${error instanceof Error ? error.message : String(error)}`
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
      const { productId, marketplaceId, ruleIds } = req.body;
      const count = await this.buyBoxMonitoringService.applyRepricingRules(productId, marketplaceId, ruleIds);
      
      res.status(200).json({
        success: true,
        message: `Repricing rules applied to ${count} products`,
        count
      });
    } catch (error) {
      this.logger.error('Failed to apply repricing rules', error);
      
      res.status(500).json({
        success: false,
        message: `Error applying repricing rules: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }
  
  /**
   * Execute a specific rule manually
   * @param req Express request
   * @param res Express response
   */
  async executeRuleManually(req: Request, res: Response): Promise<void> {
    try {
      const { ruleId } = req.params;
      
      // Validate required fields
      if (!ruleId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameter: ruleId'
        });
        return;
      }
      
      // Execute rule
      const result = await this.buyBoxMonitoringService.executeRuleManually(ruleId);
      
      res.status(200).json({
        success: result.success,
        message: result.message,
        updates: result.updates
      });
    } catch (error) {
      this.logger.error(`Failed to execute rule manually`, error);
      
      res.status(500).json({
        success: false,
        message: `Error executing rule: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }
}