import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { body, param, query, validationResult } from 'express-validator';
import { Timestamp } from 'firebase-admin/firestore';
import { 
  RepricingRule, 
  RepricingStrategy 
} from '../../../models/firestore/buybox.schema';
import { RepricingRuleRepository } from '../repositories/repricing-rule.repository';
import { RepricingEventRepository } from '../repositories/repricing-event.repository';
import { RepricingEngineService } from '../services/repricing-engine.service';
import { CreditService } from '../../credits/services/credit.service';
import { RULE_CREATION_CREDIT_COST } from '../constants/credit-costs';

@injectable()
export class RepricingController {
  constructor(
    @inject('Logger') private logger: Logger,
    @inject(RepricingRuleRepository) private ruleRepository: RepricingRuleRepository,
    @inject(RepricingEventRepository) private eventRepository: RepricingEventRepository,
    @inject(RepricingEngineService) private repricingEngine: RepricingEngineService,
    @inject(CreditService) private creditService: CreditService
  ) {}
  
  /**
   * Validation rules for creating/updating a rule
   */
  public static validateRule = [
    body('name').isString().trim().notEmpty().withMessage('Rule name is required'),
    body('isActive').isBoolean().withMessage('isActive must be true or false'),
    body('strategy')
      .isIn(Object.values(RepricingStrategy))
      .withMessage('Strategy must be a valid repricing strategy'),
    body('parameters').isObject().withMessage('Parameters are required'),
    body('marketplaces')
      .isArray()
      .withMessage('Marketplaces must be an array')
      .notEmpty()
      .withMessage('At least one marketplace is required'),
    body('updateFrequency')
      .isInt({ min: 5, max: 1440 })
      .withMessage('Update frequency must be between 5 and 1440 minutes'),
    body('priority')
      .isInt({ min: 1, max: 100 })
      .withMessage('Priority must be between 1 and 100')
  ];
  
  /**
   * Get all rules for the current organization
   */
  public getRules = async (req: Request, res: Response): Promise<void> => {
    try {
      const orgId = req.headers['x-organization-id'] as string;
      
      if (!orgId) {
        res.status(400).json({ message: 'Organization ID is required' });
        return;
      }
      
      const rules = await this.ruleRepository.findByOrgId(orgId);
      
      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      this.logger.error('Error getting rules', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve rules'
      });
    }
  };
  
  /**
   * Get a specific rule by ID
   */
  public getRuleById = [
    param('id').isString().withMessage('Rule ID is required'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        const ruleId = req.params.id;
        const rule = await this.ruleRepository.findById(ruleId);
        
        if (!rule) {
          res.status(404).json({
            success: false,
            message: 'Rule not found'
          });
          return;
        }
        
        // Verify that the rule belongs to the user's organization
        const orgId = req.headers['x-organization-id'] as string;
        if (rule.orgId !== orgId) {
          res.status(403).json({
            success: false,
            message: 'You do not have permission to access this rule'
          });
          return;
        }
        
        res.json({
          success: true,
          data: rule
        });
      } catch (error) {
        this.logger.error(`Error getting rule by ID ${req.params.id}`, { error });
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve rule'
        });
      }
    }
  ];
  
  /**
   * Create a new repricing rule
   */
  public createRule = [
    ...RepricingController.validateRule,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        const userId = req.headers['x-user-id'] as string;
        const orgId = req.headers['x-organization-id'] as string;
        
        if (!userId || !orgId) {
          res.status(400).json({
            success: false,
            message: 'User ID and Organization ID are required'
          });
          return;
        }
        
        // Check if credits are available
        const hasCredits = await this.creditService.hasAvailableCredits(
          orgId,
          RULE_CREATION_CREDIT_COST
        );
        
        if (!hasCredits) {
          res.status(403).json({
            success: false,
            message: 'Not enough credits to create a repricing rule'
          });
          return;
        }
        
        // Create the rule
        const ruleData: Omit<RepricingRule, 'id' | 'createdAt' | 'updatedAt' | 'lastRun' | 'nextRun'> = {
          userId,
          orgId,
          name: req.body.name,
          description: req.body.description,
          isActive: req.body.isActive,
          strategy: req.body.strategy,
          parameters: req.body.parameters,
          productFilter: req.body.productFilter,
          marketplaces: req.body.marketplaces,
          updateFrequency: req.body.updateFrequency,
          priority: req.body.priority
        };
        
        const rule = await this.ruleRepository.createRule(ruleData);
        
        // Deduct credits
        await this.creditService.useCredits(
          orgId,
          RULE_CREATION_CREDIT_COST,
          `Created repricing rule: ${rule.name}`,
          rule.id
        );
        
        res.status(201).json({
          success: true,
          data: rule
        });
      } catch (error) {
        this.logger.error('Error creating rule', { error });
        res.status(500).json({
          success: false,
          message: 'Failed to create rule'
        });
      }
    }
  ];
  
  /**
   * Update an existing repricing rule
   */
  public updateRule = [
    param('id').isString().withMessage('Rule ID is required'),
    ...RepricingController.validateRule,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        const ruleId = req.params.id;
        const orgId = req.headers['x-organization-id'] as string;
        
        // Check if rule exists and belongs to the organization
        const existingRule = await this.ruleRepository.findById(ruleId);
        
        if (!existingRule) {
          res.status(404).json({
            success: false,
            message: 'Rule not found'
          });
          return;
        }
        
        if (existingRule.orgId !== orgId) {
          res.status(403).json({
            success: false,
            message: 'You do not have permission to update this rule'
          });
          return;
        }
        
        // Update the rule
        const updateData: Partial<RepricingRule> = {
          name: req.body.name,
          description: req.body.description,
          isActive: req.body.isActive,
          strategy: req.body.strategy,
          parameters: req.body.parameters,
          productFilter: req.body.productFilter,
          marketplaces: req.body.marketplaces,
          updateFrequency: req.body.updateFrequency,
          priority: req.body.priority
        };
        
        await this.ruleRepository.updateRule(ruleId, updateData);
        
        // Get the updated rule
        const updatedRule = await this.ruleRepository.findById(ruleId);
        
        res.json({
          success: true,
          data: updatedRule
        });
      } catch (error) {
        this.logger.error(`Error updating rule ${req.params.id}`, { error });
        res.status(500).json({
          success: false,
          message: 'Failed to update rule'
        });
      }
    }
  ];
  
  /**
   * Delete a repricing rule
   */
  public deleteRule = [
    param('id').isString().withMessage('Rule ID is required'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        const ruleId = req.params.id;
        const orgId = req.headers['x-organization-id'] as string;
        
        // Check if rule exists and belongs to the organization
        const existingRule = await this.ruleRepository.findById(ruleId);
        
        if (!existingRule) {
          res.status(404).json({
            success: false,
            message: 'Rule not found'
          });
          return;
        }
        
        if (existingRule.orgId !== orgId) {
          res.status(403).json({
            success: false,
            message: 'You do not have permission to delete this rule'
          });
          return;
        }
        
        // Delete the rule
        await this.ruleRepository.deleteRule(ruleId);
        
        res.json({
          success: true,
          message: 'Rule deleted successfully'
        });
      } catch (error) {
        this.logger.error(`Error deleting rule ${req.params.id}`, { error });
        res.status(500).json({
          success: false,
          message: 'Failed to delete rule'
        });
      }
    }
  ];
  
  /**
   * Execute a rule manually
   */
  public executeRule = [
    param('id').isString().withMessage('Rule ID is required'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        const ruleId = req.params.id;
        const orgId = req.headers['x-organization-id'] as string;
        
        // Check if rule exists and belongs to the organization
        const existingRule = await this.ruleRepository.findById(ruleId);
        
        if (!existingRule) {
          res.status(404).json({
            success: false,
            message: 'Rule not found'
          });
          return;
        }
        
        if (existingRule.orgId !== orgId) {
          res.status(403).json({
            success: false,
            message: 'You do not have permission to execute this rule'
          });
          return;
        }
        
        // Execute the rule
        const result = await this.repricingEngine.executeRuleManually(ruleId);
        
        res.json({
          success: result.success,
          message: result.message,
          data: {
            updateCount: result.updates
          }
        });
      } catch (error) {
        this.logger.error(`Error executing rule ${req.params.id}`, { error });
        res.status(500).json({
          success: false,
          message: 'Failed to execute rule'
        });
      }
    }
  ];
  
  /**
   * Get repricing events for a rule
   */
  public getRuleEvents = [
    param('id').isString().withMessage('Rule ID is required'),
    query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        const ruleId = req.params.id;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
        const orgId = req.headers['x-organization-id'] as string;
        
        // Check if rule exists and belongs to the organization
        const existingRule = await this.ruleRepository.findById(ruleId);
        
        if (!existingRule) {
          res.status(404).json({
            success: false,
            message: 'Rule not found'
          });
          return;
        }
        
        if (existingRule.orgId !== orgId) {
          res.status(403).json({
            success: false,
            message: 'You do not have permission to view events for this rule'
          });
          return;
        }
        
        // Get events for the rule
        const events = await this.eventRepository.findByRuleId(ruleId, limit);
        
        // Get rule success rate
        const successRate = await this.eventRepository.getRuleSuccessRate(ruleId);
        
        res.json({
          success: true,
          data: {
            events,
            stats: successRate
          }
        });
      } catch (error) {
        this.logger.error(`Error getting events for rule ${req.params.id}`, { error });
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve events'
        });
      }
    }
  ];
  
  /**
   * Get repricing events for a product
   */
  public getProductEvents = [
    param('id').isString().withMessage('Product ID is required'),
    query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        const productId = req.params.id;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
        
        // Get events for the product
        const events = await this.eventRepository.findByProductId(productId, limit);
        
        res.json({
          success: true,
          data: events
        });
      } catch (error) {
        this.logger.error(`Error getting events for product ${req.params.id}`, { error });
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve events'
        });
      }
    }
  ];
  
  /**
   * Get repricing events for a specific marketplace
   */
  public getMarketplaceEvents = [
    param('id').isString().withMessage('Marketplace ID is required'),
    query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        const marketplaceId = req.params.id;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
        
        // Get events for the marketplace
        const events = await this.eventRepository.findByMarketplaceId(marketplaceId, limit);
        
        res.json({
          success: true,
          data: events
        });
      } catch (error) {
        this.logger.error(`Error getting events for marketplace ${req.params.id}`, { error });
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve events'
        });
      }
    }
  ];
  
  /**
   * Get recent repricing events across all rules and products
   */
  public getRecentEvents = [
    query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
        
        // Get recent events
        const events = await this.eventRepository.findRecentEvents(limit);
        
        res.json({
          success: true,
          data: events
        });
      } catch (error) {
        this.logger.error('Error getting recent events', { error });
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve events'
        });
      }
    }
  ];
  
  /**
   * Get events by date range
   */
  public getEventsByDateRange = [
    query('start').isISO8601().withMessage('Start date must be a valid ISO8601 date'),
    query('end').isISO8601().withMessage('End date must be a valid ISO8601 date'),
    query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        const startDate = new Date(req.query.start as string);
        const endDate = new Date(req.query.end as string);
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 500;
        
        // Get events for the date range
        const events = await this.eventRepository.findEventsByDateRange(
          Timestamp.fromDate(startDate),
          Timestamp.fromDate(endDate),
          limit
        );
        
        res.json({
          success: true,
          data: events
        });
      } catch (error) {
        this.logger.error('Error getting events by date range', { error });
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve events'
        });
      }
    }
  ];
}