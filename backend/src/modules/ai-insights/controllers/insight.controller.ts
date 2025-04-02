/**
 * Controller for AI insights
 */

import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { body, param, query, validationResult } from 'express-validator';
import { InsightGenerationService } from '../services/insight-generation.service';
import { InsightRepository } from '../repositories/insight.repository';
import { CreditService } from '../../credits/services/credit.service';
import { 
  InsightType, 
  InsightModel, 
  InsightFeedback 
} from '../interfaces/insight.interface';

@injectable()
export class InsightController {
  constructor(
    @inject('Logger') private logger: Logger,
    @inject(InsightGenerationService) private insightGenerationService: InsightGenerationService,
    @inject(InsightRepository) private insightRepository: InsightRepository,
    @inject(CreditService) private creditService: CreditService
  ) {}
  
  /**
   * Validation rules for generating an insight
   */
  public static validateInsightRequest = [
    body('type')
      .isIn(Object.values(InsightType))
      .withMessage('Invalid insight type'),
    body('options')
      .isObject()
      .withMessage('Options must be an object'),
    body('options.model')
      .optional()
      .isIn(Object.values(InsightModel))
      .withMessage('Invalid model'),
    body('options.useRag')
      .optional()
      .isBoolean()
      .withMessage('useRag must be true or false'),
    body('options.timeframeInDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Timeframe must be between 1 and 365 days'),
    body('targetEntityIds')
      .optional()
      .isArray()
      .withMessage('targetEntityIds must be an array'),
    body('targetEntityType')
      .optional()
      .isString()
      .withMessage('targetEntityType must be a string'),
    body('customPrompt')
      .optional()
      .isString()
      .withMessage('customPrompt must be a string')
  ];
  
  /**
   * Generate an insight
   * @param req Express request
   * @param res Express response
   */
  public generateInsight = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }
      
      // Get user and organization IDs from headers
      const userId = req.headers['x-user-id'] as string;
      const organizationId = req.headers['x-organization-id'] as string;
      
      if (!userId || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'User ID and Organization ID are required'
        });
        return;
      }
      
      // Create insight request object
      const insightRequest = {
        type: req.body.type,
        userId,
        organizationId,
        targetEntityIds: req.body.targetEntityIds,
        targetEntityType: req.body.targetEntityType,
        customPrompt: req.body.customPrompt,
        options: req.body.options || {}
      };
      
      // Generate the insight asynchronously
      const insight = await this.insightGenerationService.generateInsight(insightRequest);
      
      res.status(202).json({
        success: true,
        message: 'Insight generation started',
        data: {
          insightId: insight.id,
          status: insight.status
        }
      });
    } catch (error) {
      this.logger.error('Error generating insight:', error);
      
      res.status(error.message.includes('credits') ? 403 : 500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  /**
   * Get insight by ID
   * @param req Express request
   * @param res Express response
   */
  public getInsightById = async (req: Request, res: Response): Promise<void> => {
    try {
      const insightId = req.params.id;
      
      // Get organization ID from headers
      const organizationId = req.headers['x-organization-id'] as string;
      
      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
        return;
      }
      
      // Get the insight
      const insight = await this.insightRepository.findById(insightId);
      
      if (!insight) {
        res.status(404).json({
          success: false,
          message: 'Insight not found'
        });
        return;
      }
      
      // Check organization access
      if (insight.organizationId !== organizationId) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to access this insight'
        });
        return;
      }
      
      res.json({
        success: true,
        data: insight
      });
    } catch (error) {
      this.logger.error(`Error getting insight ${req.params.id}:`, error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve insight'
      });
    }
  };
  
  /**
   * Get insights for organization with filters
   * @param req Express request
   * @param res Express response
   */
  public getInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get organization ID from headers
      const organizationId = req.headers['x-organization-id'] as string;
      
      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
        return;
      }
      
      // Process filters from query params
      const type = req.query.type as InsightType;
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const entityId = req.query.entityId as string;
      const entityType = req.query.entityType as string;
      
      // Process pagination and sorting
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortDirection = (req.query.sortDirection as 'asc' | 'desc') || 'desc';
      
      // Process date range
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      // Get insights with filters
      const { insights, total } = await this.insightRepository.findWithFilters(
        {
          organizationId,
          type,
          status: status as any,
          priority: priority as any,
          entityId,
          entityType,
          startDate,
          endDate
        },
        {
          limit,
          offset,
          sortBy,
          sortDirection
        }
      );
      
      res.json({
        success: true,
        data: {
          insights,
          total,
          limit,
          offset
        }
      });
    } catch (error) {
      this.logger.error('Error getting insights:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve insights'
      });
    }
  };
  
  /**
   * Get insights by type
   * @param req Express request
   * @param res Express response
   */
  public getInsightsByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const type = req.params.type as InsightType;
      
      // Validate insight type
      if (!Object.values(InsightType).includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid insight type'
        });
        return;
      }
      
      // Get organization ID from headers
      const organizationId = req.headers['x-organization-id'] as string;
      
      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
        return;
      }
      
      // Get limit from query params
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      
      // Get insights by type
      const insights = await this.insightRepository.findByType(organizationId, type, limit);
      
      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      this.logger.error(`Error getting insights by type ${req.params.type}:`, error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve insights'
      });
    }
  };
  
  /**
   * Delete an insight
   * @param req Express request
   * @param res Express response
   */
  public deleteInsight = async (req: Request, res: Response): Promise<void> => {
    try {
      const insightId = req.params.id;
      
      // Get organization ID from headers
      const organizationId = req.headers['x-organization-id'] as string;
      
      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
        return;
      }
      
      // Get the insight to check ownership
      const insight = await this.insightRepository.findById(insightId);
      
      if (!insight) {
        res.status(404).json({
          success: false,
          message: 'Insight not found'
        });
        return;
      }
      
      // Check organization access
      if (insight.organizationId !== organizationId) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this insight'
        });
        return;
      }
      
      // Delete the insight
      const success = await this.insightRepository.deleteInsight(insightId);
      
      if (!success) {
        throw new Error('Failed to delete insight');
      }
      
      res.json({
        success: true,
        message: 'Insight deleted successfully'
      });
    } catch (error) {
      this.logger.error(`Error deleting insight ${req.params.id}:`, error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete insight'
      });
    }
  };
  
  /**
   * Submit feedback for an insight
   * @param req Express request
   * @param res Express response
   */
  public submitFeedback = [
    param('id').isString().withMessage('Insight ID is required'),
    body('feedback')
      .isIn(Object.values(InsightFeedback))
      .withMessage('Invalid feedback value'),
    body('comments')
      .optional()
      .isString()
      .withMessage('Comments must be a string'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({
            success: false,
            errors: errors.array()
          });
          return;
        }
        
        const insightId = req.params.id;
        const feedback = req.body.feedback;
        const comments = req.body.comments;
        
        // Get organization ID from headers
        const organizationId = req.headers['x-organization-id'] as string;
        
        if (!organizationId) {
          res.status(400).json({
            success: false,
            message: 'Organization ID is required'
          });
          return;
        }
        
        // Get the insight to check ownership
        const insight = await this.insightRepository.findById(insightId);
        
        if (!insight) {
          res.status(404).json({
            success: false,
            message: 'Insight not found'
          });
          return;
        }
        
        // Check organization access
        if (insight.organizationId !== organizationId) {
          res.status(403).json({
            success: false,
            message: 'You do not have permission to update this insight'
          });
          return;
        }
        
        // Update the feedback
        const updatedInsight = await this.insightRepository.updateFeedback(insightId, feedback, comments);
        
        if (!updatedInsight) {
          throw new Error('Failed to update feedback');
        }
        
        res.json({
          success: true,
          message: 'Feedback submitted successfully',
          data: {
            insightId,
            feedback,
            feedbackTimestamp: updatedInsight.feedbackTimestamp
          }
        });
      } catch (error) {
        this.logger.error(`Error submitting feedback for insight ${req.params.id}:`, error);
        
        res.status(500).json({
          success: false,
          message: 'Failed to submit feedback'
        });
      }
    }
  ];
  
  /**
   * Get insights by related entity
   * @param req Express request
   * @param res Express response
   */
  public getInsightsByEntity = [
    param('entityType').isString().withMessage('Entity type is required'),
    param('entityId').isString().withMessage('Entity ID is required'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({
            success: false,
            errors: errors.array()
          });
          return;
        }
        
        const entityType = req.params.entityType;
        const entityId = req.params.entityId;
        
        // Get organization ID from headers
        const organizationId = req.headers['x-organization-id'] as string;
        
        if (!organizationId) {
          res.status(400).json({
            success: false,
            message: 'Organization ID is required'
          });
          return;
        }
        
        // Get limit from query params
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
        
        // Get insights by related entity
        const insights = await this.insightRepository.findByRelatedEntity(
          organizationId,
          entityId,
          entityType,
          limit
        );
        
        res.json({
          success: true,
          data: insights
        });
      } catch (error) {
        this.logger.error(`Error getting insights for entity ${req.params.entityType}/${req.params.entityId}:`, error);
        
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve insights'
        });
      }
    }
  ];
}