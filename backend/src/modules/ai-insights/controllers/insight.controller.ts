/**
 * Insight Controller
 * 
 * Handles API requests for AI Insights functionality
 */
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { 
  IInsightRepository, 
  InsightType, 
  InsightFeedback, 
  IInsightGenerationService 
} from '../interfaces/insight.interface';

/**
 * Extended Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    roles?: string[];
  };
}

/**
 * Interface for Insight Controller
 */
export interface IInsightController {
  getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  getByType(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  generateInsight(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  provideFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller for insight operations
 */
@injectable()
export class InsightController implements IInsightController {
  /**
   * Constructor
   */
  constructor(
    @inject('Logger') private logger: Logger,
    @inject('InsightRepository') private insightRepository: IInsightRepository,
    @inject('InsightGenerationService') private insightGenerationService: IInsightGenerationService
  ) {}

  /**
   * Get all insight records
   */
  public async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const organizationId = req.user.organizationId;
      const limit = parseInt(req.query.limit as string) || 20;
      const startAfter = req.query.startAfter as string;
      
      // Get data from repository
      const result = await this.insightRepository.getByOrganization(
        organizationId, 
        limit, 
        startAfter
      );
      
      res.status(200).json({
        success: true,
        data: result.insights,
        pagination: {
          lastDoc: result.lastDoc ? result.lastDoc.id : null,
          hasMore: result.insights.length === limit
        }
      });
    } catch (error) {
      this.logger.error('Error getting insights', { error });
      next(error);
    }
  }

  /**
   * Get insight by ID
   */
  public async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const organizationId = req.user.organizationId;
      const insightId = req.params.id;
      
      // Get data from repository
      const insight = await this.insightRepository.getById(insightId);
      
      // Check if insight exists
      if (!insight) {
        res.status(404).json({ success: false, message: 'Insight not found' });
        return;
      }
      
      // Check if insight belongs to user's organization
      if (insight.organizationId !== organizationId) {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to access this insight' 
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: insight
      });
    } catch (error) {
      this.logger.error(`Error getting insight by ID ${req.params.id}`, { error });
      next(error);
    }
  }

  /**
   * Get insights by type
   */
  public async getByType(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const organizationId = req.user.organizationId;
      const insightType = req.params.type as InsightType;
      const limit = parseInt(req.query.limit as string) || 20;
      const startAfter = req.query.startAfter as string;
      
      // Validate insight type
      if (!Object.values(InsightType).includes(insightType)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid insight type',
          validTypes: Object.values(InsightType)
        });
        return;
      }
      
      // Get data from repository
      const result = await this.insightRepository.getByType(
        organizationId,
        insightType,
        limit,
        startAfter
      );
      
      res.status(200).json({
        success: true,
        data: result.insights,
        pagination: {
          lastDoc: result.lastDoc ? result.lastDoc.id : null,
          hasMore: result.insights.length === limit
        }
      });
    } catch (error) {
      this.logger.error(`Error getting insights by type ${req.params.type}`, { error });
      next(error);
    }
  }

  /**
   * Generate a new insight
   */
  public async generateInsight(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      
      const { type, options } = req.body;
      
      // Validate required fields
      if (!type) {
        res.status(400).json({ 
          success: false, 
          message: 'Insight type is required',
          validTypes: Object.values(InsightType)
        });
        return;
      }
      
      // Validate insight type
      if (!Object.values(InsightType).includes(type)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid insight type',
          validTypes: Object.values(InsightType)
        });
        return;
      }
      
      // Start generating the insight (this might take some time)
      // Return a pending response immediately and generate in background
      const insight = await this.insightGenerationService.generateOnDemandInsight(
        userId,
        organizationId,
        type,
        options
      );
      
      res.status(202).json({
        success: true,
        message: 'Insight generation started',
        data: {
          id: insight.id,
          status: insight.status
        }
      });
    } catch (error) {
      this.logger.error('Error generating insight', { error });
      next(error);
    }
  }

  /**
   * Provide feedback for an insight
   */
  public async provideFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const organizationId = req.user.organizationId;
      const insightId = req.params.id;
      const { feedback, comment } = req.body;
      
      // Validate required fields
      if (!feedback) {
        res.status(400).json({ 
          success: false, 
          message: 'Feedback value is required',
          validValues: Object.values(InsightFeedback)
        });
        return;
      }
      
      // Validate feedback value
      if (!Object.values(InsightFeedback).includes(feedback)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid feedback value',
          validValues: Object.values(InsightFeedback)
        });
        return;
      }
      
      // Get insight to verify ownership
      const insight = await this.insightRepository.getById(insightId);
      
      // Check if insight exists
      if (!insight) {
        res.status(404).json({ success: false, message: 'Insight not found' });
        return;
      }
      
      // Check if insight belongs to user's organization
      if (insight.organizationId !== organizationId) {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to access this insight' 
        });
        return;
      }
      
      // Record feedback
      const updatedInsight = await this.insightRepository.recordFeedback(
        insightId,
        feedback,
        comment
      );
      
      res.status(200).json({
        success: true,
        message: 'Feedback recorded successfully',
        data: updatedInsight
      });
    } catch (error) {
      this.logger.error(`Error providing feedback for insight ${req.params.id}`, { error });
      next(error);
    }
  }
}

/**
 * Factory function to create the controller with dependencies
 */
export const createInsightController = (
  logger: Logger,
  insightRepository: IInsightRepository,
  insightGenerationService: IInsightGenerationService
): IInsightController => {
  return new InsightController(
    logger,
    insightRepository,
    insightGenerationService
  );
};