/**
 * Scheduled Job Controller
 * 
 * Handles API requests for AI Insights scheduled jobs
 */
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { 
  IScheduledJobRepository, 
  InsightType, 
  IInsightSchedulerService 
} from '../interfaces/insight.interface';
import { AuthenticatedRequest } from './insight.controller';

/**
 * Interface for Scheduled Job Controller
 */
export interface IScheduledJobController {
  getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  createJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  updateJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  deleteJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  runJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Controller for scheduled job operations
 */
@injectable()
export class ScheduledJobController implements IScheduledJobController {
  /**
   * Constructor
   */
  constructor(
    @inject('Logger') private logger: Logger,
    @inject('ScheduledJobRepository') private jobRepository: IScheduledJobRepository,
    @inject('InsightSchedulerService') private schedulerService: IInsightSchedulerService
  ) {}

  /**
   * Get all scheduled jobs
   */
  public async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const organizationId = req.user.organizationId;
      
      // Get data from repository
      const jobs = await this.jobRepository.getByOrganization(organizationId);
      
      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      this.logger.error('Error getting scheduled jobs', { error });
      next(error);
    }
  }

  /**
   * Get scheduled job by ID
   */
  public async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const organizationId = req.user.organizationId;
      const jobId = req.params.id;
      
      // Get data from repository
      const job = await this.jobRepository.getById(jobId);
      
      // Check if job exists
      if (!job) {
        res.status(404).json({ success: false, message: 'Scheduled job not found' });
        return;
      }
      
      // Check if job belongs to user's organization
      if (job.organizationId !== organizationId) {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to access this scheduled job' 
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      this.logger.error(`Error getting scheduled job by ID ${req.params.id}`, { error });
      next(error);
    }
  }

  /**
   * Create a new scheduled job
   */
  public async createJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      
      const { 
        name, 
        description, 
        insightType, 
        frequency, 
        dayOfWeek, 
        dayOfMonth, 
        pipelineOptions 
      } = req.body;
      
      // Validate required fields
      if (!name || !insightType || !frequency || !pipelineOptions) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: name, insightType, frequency, pipelineOptions' 
        });
        return;
      }
      
      // Validate insight type
      if (!Object.values(InsightType).includes(insightType)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid insight type',
          validTypes: Object.values(InsightType)
        });
        return;
      }
      
      // Validate frequency
      if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid frequency. Must be one of: daily, weekly, monthly' 
        });
        return;
      }
      
      // Additional validation for weekly frequency
      if (frequency === 'weekly' && (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6)) {
        res.status(400).json({ 
          success: false, 
          message: 'For weekly frequency, dayOfWeek is required and must be between 0-6 (Sunday is 0)' 
        });
        return;
      }
      
      // Additional validation for monthly frequency
      if (frequency === 'monthly' && (dayOfMonth === undefined || dayOfMonth < 1 || dayOfMonth > 31)) {
        res.status(400).json({ 
          success: false, 
          message: 'For monthly frequency, dayOfMonth is required and must be between 1-31' 
        });
        return;
      }
      
      // Create the job
      const job = await this.schedulerService.createScheduledJob({
        name,
        description,
        insightType,
        frequency,
        dayOfWeek,
        dayOfMonth,
        isActive: true,
        pipelineOptions,
        organizationId,
        userId,
        createdBy: userId,
      });
      
      res.status(201).json({
        success: true,
        message: 'Scheduled job created successfully',
        data: job
      });
    } catch (error) {
      this.logger.error('Error creating scheduled job', { error });
      next(error);
    }
  }

  /**
   * Update a scheduled job
   */
  public async updateJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const jobId = req.params.id;
      
      // Get job to verify ownership
      const job = await this.jobRepository.getById(jobId);
      
      // Check if job exists
      if (!job) {
        res.status(404).json({ success: false, message: 'Scheduled job not found' });
        return;
      }
      
      // Check if job belongs to user's organization
      if (job.organizationId !== organizationId) {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to update this scheduled job' 
        });
        return;
      }
      
      const updateData: any = {
        ...req.body,
        updatedBy: userId
      };
      
      // Recalculate next run time if frequency or day settings change
      if (updateData.frequency || updateData.dayOfWeek !== undefined || updateData.dayOfMonth !== undefined) {
        const frequency = updateData.frequency || job.frequency;
        const dayOfWeek = updateData.dayOfWeek !== undefined ? updateData.dayOfWeek : job.dayOfWeek;
        const dayOfMonth = updateData.dayOfMonth !== undefined ? updateData.dayOfMonth : job.dayOfMonth;
        
        // Validate frequency
        if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
          res.status(400).json({ 
            success: false, 
            message: 'Invalid frequency. Must be one of: daily, weekly, monthly' 
          });
          return;
        }
        
        // Additional validation for weekly frequency
        if (frequency === 'weekly' && (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6)) {
          res.status(400).json({ 
            success: false, 
            message: 'For weekly frequency, dayOfWeek is required and must be between 0-6 (Sunday is 0)' 
          });
          return;
        }
        
        // Additional validation for monthly frequency
        if (frequency === 'monthly' && (dayOfMonth === undefined || dayOfMonth < 1 || dayOfMonth > 31)) {
          res.status(400).json({ 
            success: false, 
            message: 'For monthly frequency, dayOfMonth is required and must be between 1-31' 
          });
          return;
        }
        
        const nextRunTime = this.schedulerService.calculateNextRunTime(
          frequency, 
          dayOfWeek, 
          dayOfMonth
        );
        
        updateData.nextRunTime = nextRunTime;
      }
      
      // Update the job
      const updatedJob = await this.jobRepository.update(jobId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Scheduled job updated successfully',
        data: updatedJob
      });
    } catch (error) {
      this.logger.error(`Error updating scheduled job ${req.params.id}`, { error });
      next(error);
    }
  }

  /**
   * Delete a scheduled job
   */
  public async deleteJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const organizationId = req.user.organizationId;
      const jobId = req.params.id;
      
      // Get job to verify ownership
      const job = await this.jobRepository.getById(jobId);
      
      // Check if job exists
      if (!job) {
        res.status(404).json({ success: false, message: 'Scheduled job not found' });
        return;
      }
      
      // Check if job belongs to user's organization
      if (job.organizationId !== organizationId) {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to delete this scheduled job' 
        });
        return;
      }
      
      // Delete the job
      await this.jobRepository.delete(jobId);
      
      res.status(200).json({
        success: true,
        message: 'Scheduled job deleted successfully'
      });
    } catch (error) {
      this.logger.error(`Error deleting scheduled job ${req.params.id}`, { error });
      next(error);
    }
  }

  /**
   * Run a scheduled job immediately
   */
  public async runJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const organizationId = req.user.organizationId;
      const jobId = req.params.id;
      
      // Get job to verify ownership
      const job = await this.jobRepository.getById(jobId);
      
      // Check if job exists
      if (!job) {
        res.status(404).json({ success: false, message: 'Scheduled job not found' });
        return;
      }
      
      // Check if job belongs to user's organization
      if (job.organizationId !== organizationId) {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to run this scheduled job' 
        });
        return;
      }
      
      // Run the job (this might take some time)
      // Return a response immediately and run in background
      
      // First update status to processing
      res.status(202).json({
        success: true,
        message: 'Scheduled job execution started',
        data: {
          jobId: job.id
        }
      });
      
      // Then execute the job asynchronously
      this.schedulerService.runJob(jobId)
        .then(insight => {
          this.logger.info(`Job ${jobId} executed successfully. Insight ID: ${insight?.id}`);
        })
        .catch(error => {
          this.logger.error(`Error executing job ${jobId}`, { error });
        });
      
    } catch (error) {
      this.logger.error(`Error running scheduled job ${req.params.id}`, { error });
      next(error);
    }
  }
}

/**
 * Factory function to create the controller with dependencies
 */
export const createScheduledJobController = (
  logger: Logger,
  jobRepository: IScheduledJobRepository,
  schedulerService: IInsightSchedulerService
): IScheduledJobController => {
  return new ScheduledJobController(
    logger,
    jobRepository,
    schedulerService
  );
};