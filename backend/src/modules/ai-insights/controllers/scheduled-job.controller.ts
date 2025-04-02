/**
 * Controller for scheduled insight jobs
 */

import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { body, param, validationResult } from 'express-validator';
import { InsightSchedulerService } from '../services/insight-scheduler.service';
import { ScheduledJobRepository } from '../repositories/scheduled-job.repository';
import { InsightType } from '../interfaces/insight.interface';

@injectable()
export class ScheduledJobController {
  constructor(
    @inject('Logger') private logger: Logger,
    @inject(InsightSchedulerService) private schedulerService: InsightSchedulerService,
    @inject(ScheduledJobRepository) private jobRepository: ScheduledJobRepository
  ) {}
  
  /**
   * Validation rules for creating/updating a scheduled job
   */
  public static validateScheduledJob = [
    body('name')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Job name is required'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('type')
      .isIn(Object.values(InsightType))
      .withMessage('Invalid insight type'),
    body('frequency')
      .isIn(['daily', 'weekly', 'monthly', 'custom'])
      .withMessage('Invalid frequency'),
    body('cronExpression')
      .optional()
      .isString()
      .withMessage('Cron expression must be a string'),
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be true or false'),
    body('options')
      .isObject()
      .withMessage('Options must be an object'),
    body('targetEntities')
      .optional()
      .isArray()
      .withMessage('targetEntities must be an array'),
    body('targetEntities.*.id')
      .optional()
      .isString()
      .withMessage('Entity ID must be a string'),
    body('targetEntities.*.type')
      .optional()
      .isString()
      .withMessage('Entity type must be a string')
  ];
  
  /**
   * Create a new scheduled job
   * @param req Express request
   * @param res Express response
   */
  public createJob = async (req: Request, res: Response): Promise<void> => {
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
      
      // Create the job
      const jobData = {
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        frequency: req.body.frequency,
        cronExpression: req.body.cronExpression,
        isActive: req.body.isActive,
        options: req.body.options,
        targetEntities: req.body.targetEntities
      };
      
      const job = await this.schedulerService.createJob(organizationId, userId, jobData);
      
      res.status(201).json({
        success: true,
        message: 'Scheduled job created successfully',
        data: job
      });
    } catch (error) {
      this.logger.error('Error creating scheduled job:', error);
      
      res.status(error.message.includes('credits') ? 403 : 500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  /**
   * Get all scheduled jobs for organization
   * @param req Express request
   * @param res Express response
   */
  public getJobs = async (req: Request, res: Response): Promise<void> => {
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
      
      // Get limit from query params
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      
      // Get jobs for organization
      const jobs = await this.jobRepository.findByOrganizationId(organizationId, limit);
      
      res.json({
        success: true,
        data: jobs
      });
    } catch (error) {
      this.logger.error('Error getting scheduled jobs:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve scheduled jobs'
      });
    }
  };
  
  /**
   * Get scheduled job by ID
   * @param req Express request
   * @param res Express response
   */
  public getJobById = async (req: Request, res: Response): Promise<void> => {
    try {
      const jobId = req.params.id;
      
      // Get organization ID from headers
      const organizationId = req.headers['x-organization-id'] as string;
      
      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
        return;
      }
      
      // Get the job
      const job = await this.jobRepository.findById(jobId);
      
      if (!job) {
        res.status(404).json({
          success: false,
          message: 'Scheduled job not found'
        });
        return;
      }
      
      // Check organization access
      if (job.organizationId !== organizationId) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to access this job'
        });
        return;
      }
      
      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      this.logger.error(`Error getting scheduled job ${req.params.id}:`, error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve scheduled job'
      });
    }
  };
  
  /**
   * Update a scheduled job
   * @param req Express request
   * @param res Express response
   */
  public updateJob = [
    param('id').isString().withMessage('Job ID is required'),
    ...ScheduledJobController.validateScheduledJob,
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
        
        const jobId = req.params.id;
        
        // Get organization ID from headers
        const organizationId = req.headers['x-organization-id'] as string;
        
        if (!organizationId) {
          res.status(400).json({
            success: false,
            message: 'Organization ID is required'
          });
          return;
        }
        
        // Update the job
        const updateData = {
          name: req.body.name,
          description: req.body.description,
          type: req.body.type,
          frequency: req.body.frequency,
          cronExpression: req.body.cronExpression,
          isActive: req.body.isActive,
          options: req.body.options,
          targetEntities: req.body.targetEntities
        };
        
        const updatedJob = await this.schedulerService.updateJob(jobId, organizationId, updateData);
        
        res.json({
          success: true,
          message: 'Scheduled job updated successfully',
          data: updatedJob
        });
      } catch (error) {
        this.logger.error(`Error updating scheduled job ${req.params.id}:`, error);
        
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    }
  ];
  
  /**
   * Delete a scheduled job
   * @param req Express request
   * @param res Express response
   */
  public deleteJob = async (req: Request, res: Response): Promise<void> => {
    try {
      const jobId = req.params.id;
      
      // Get organization ID from headers
      const organizationId = req.headers['x-organization-id'] as string;
      
      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
        return;
      }
      
      // Delete the job
      const success = await this.schedulerService.deleteJob(jobId, organizationId);
      
      res.json({
        success: true,
        message: 'Scheduled job deleted successfully'
      });
    } catch (error) {
      this.logger.error(`Error deleting scheduled job ${req.params.id}:`, error);
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  /**
   * Run a scheduled job now
   * @param req Express request
   * @param res Express response
   */
  public runJobNow = async (req: Request, res: Response): Promise<void> => {
    try {
      const jobId = req.params.id;
      
      // Get organization ID from headers
      const organizationId = req.headers['x-organization-id'] as string;
      
      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
        return;
      }
      
      // Run the job
      const insightId = await this.schedulerService.runJobNow(jobId, organizationId);
      
      res.json({
        success: true,
        message: 'Scheduled job executed successfully',
        data: {
          insightId
        }
      });
    } catch (error) {
      this.logger.error(`Error running scheduled job ${req.params.id}:`, error);
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  /**
   * Get jobs by type
   * @param req Express request
   * @param res Express response
   */
  public getJobsByType = async (req: Request, res: Response): Promise<void> => {
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
      
      // Get jobs by type
      const jobs = await this.jobRepository.findByType(organizationId, type, limit);
      
      res.json({
        success: true,
        data: jobs
      });
    } catch (error) {
      this.logger.error(`Error getting scheduled jobs by type ${req.params.type}:`, error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve scheduled jobs'
      });
    }
  };
}