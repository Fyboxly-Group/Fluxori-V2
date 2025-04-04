import * as mongoose from 'mongoose';
import { ApiError } from '../../../utils/error.utils';
import { ScheduledJobRepository, IScheduledJob } from '../repositories/scheduled-job.repository';
import { InsightGenerationService, IInsightGenerationParams } from './insight-generation.service';
import { CreditService } from '../../credits/services/credit.service';
import { getCreditCost } from '../constants/credit-costs';
import * as cron from 'node-cron';

/**
 * Parameters to create a new scheduled job
 */
export interface ICreateScheduledJobParams {
  name: string;
  description?: string;
  schedule: string;
  insightType: string;
  parameters: Record<string, any>;
  status?: 'active' | 'inactive';
}

/**
 * Parameters to update a scheduled job
 */
export interface IUpdateScheduledJobParams {
  name?: string;
  description?: string;
  schedule?: string;
  insightType?: string;
  parameters?: Record<string, any>;
  status?: 'active' | 'inactive';
}

/**
 * Service for managing scheduled insight generation jobs
 */
export class InsightSchedulerService {
  private scheduledJobRepository: ScheduledJobRepository;
  private insightGenerationService: InsightGenerationService;
  private activeJobs: Map<string, cron.ScheduledTask> = new Map();
  
  constructor() {
    this.scheduledJobRepository = new ScheduledJobRepository();
    this.insightGenerationService = new InsightGenerationService();
    
    // Initialize scheduler and load active jobs
    this.initializeScheduler();
  }

  /**
   * Initialize the scheduler and load active jobs
   */
  private async initializeScheduler() {
    try {
      // Get all active jobs
      const activeJobs = await this.scheduledJobRepository.findDueJobs();
      
      // Schedule each job
      for (const job of activeJobs) {
        this.scheduleJob(job);
      }
      
      console.log(`Initialized scheduler with ${this.activeJobs.size} active jobs`);
    } catch (error) {
      console.error('Error initializing scheduler:', error);
    }
  }

  /**
   * Schedule a job to run
   */
  private scheduleJob(job: IScheduledJob) {
    try {
      // Validate cron expression
      if (!cron.validate(job.schedule)) {
        console.error(`Invalid cron expression for job ${job.id}: ${job.schedule}`);
        return;
      }
      
      // Create the scheduled task
      const task = cron.schedule(job.schedule, async () => {
        try {
          // Execute the job
          await this.executeJob(job);
        } catch (error) {
          console.error(`Error executing scheduled job ${job.id}:`, error);
          
          // Update job status after failed execution
          if (job.id) {
            await this.scheduledJobRepository.updateAfterExecution(
              job.id,
              false,
              error instanceof Error ? error.message : String(error)
            );
          }
        }
      });
      
      // Store the active job
      if (job.id) {
        this.activeJobs.set(job.id, task);
      }
    } catch (error) {
      console.error(`Error scheduling job ${job.id}:`, error);
    }
  }

  /**
   * Execute a job
   */
  private async executeJob(job: IScheduledJob) {
    try {
      console.log(`Executing scheduled job ${job.id}: ${job.name}`);
      
      // Check if credit cost is affordable
      const creditCost = getCreditCost(job.insightType);
      await CreditService.checkCredits(job.createdBy, creditCost, job.organizationId);
      
      // Prepare insight generation parameters
      const params: IInsightGenerationParams = {
        insightType: job.insightType,
        contextData: job.parameters,
        title: job.name
      };
      
      // Generate the insight
      const result = await this.insightGenerationService.generateInsight(
        params,
        job.createdBy,
        job.organizationId
      );
      
      console.log(`Successfully generated insight ${result.insightId} for job ${job.id}`);
      
      // Update job status after successful execution
      if (job.id) {
        await this.scheduledJobRepository.updateAfterExecution(job.id, true);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error executing job ${job.id}:`, errorMessage);
      
      // Rethrow to be handled by the scheduler
      throw error;
    }
  }

  /**
   * Create a new scheduled job
   * @param params Job parameters
   * @param userId User ID creating the job
   * @param organizationId Organization ID
   * @returns The created job
   */
  async createScheduledJob(
    params: ICreateScheduledJobParams,
    userId: string,
    organizationId: string
  ): Promise<IScheduledJob> {
    try {
      // Validate cron expression
      if (!cron.validate(params.schedule)) {
        throw new ApiError(400, 'Invalid cron expression');
      }
      
      // Prepare job data
      const jobData: IScheduledJob = {
        name: params.name,
        description: params.description,
        schedule: params.schedule,
        insightType: params.insightType,
        parameters: params.parameters,
        status: params.status || 'active',
        organizationId,
        createdBy: userId
      };
      
      // Create the job in the database
      const createdJob = await this.scheduledJobRepository.create(jobData, organizationId, userId);
      
      // Schedule the job if active
      if (createdJob.status === 'active' && createdJob.id) {
        this.scheduleJob(createdJob);
      }
      
      return createdJob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error creating scheduled job: ${errorMessage}`);
    }
  }

  /**
   * Get all scheduled jobs for an organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @param limit Maximum number of jobs to return
   * @param offset Offset for pagination
   * @returns List of scheduled jobs
   */
  async getAllScheduledJobs(
    userId: string,
    organizationId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<IScheduledJob[]> {
    try {
      return await this.scheduledJobRepository.findAll(organizationId, limit, offset);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error getting scheduled jobs: ${errorMessage}`);
    }
  }

  /**
   * Get a scheduled job by ID
   * @param id Job ID
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns The scheduled job if found
   */
  async getScheduledJobById(
    id: string,
    userId: string,
    organizationId: string
  ): Promise<IScheduledJob | null> {
    try {
      const job = await this.scheduledJobRepository.findById(id, organizationId);
      if (!job) {
        throw new ApiError(404, 'Scheduled job not found');
      }
      return job;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error getting scheduled job: ${errorMessage}`);
    }
  }

  /**
   * Update a scheduled job
   * @param id Job ID
   * @param params Update parameters
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns The updated job
   */
  async updateScheduledJob(
    id: string,
    params: IUpdateScheduledJobParams,
    userId: string,
    organizationId: string
  ): Promise<IScheduledJob | null> {
    try {
      // Find the job first
      const existingJob = await this.scheduledJobRepository.findById(id, organizationId);
      if (!existingJob) {
        throw new ApiError(404, 'Scheduled job not found');
      }
      
      // Validate cron expression if schedule is being updated
      if (params.schedule && !cron.validate(params.schedule)) {
        throw new ApiError(400, 'Invalid cron expression');
      }
      
      // Update the job in the database
      const updatedJob = await this.scheduledJobRepository.update(id, params, organizationId);
      
      // If the job is active and already scheduled, update it
      if (updatedJob && updatedJob.id) {
        const existingTask = this.activeJobs.get(updatedJob.id);
        if (existingTask) {
          // Stop the existing task
          existingTask.stop();
          this.activeJobs.delete(updatedJob.id);
        }
        
        // Schedule the updated job if active
        if (updatedJob.status === 'active') {
          this.scheduleJob(updatedJob);
        }
      }
      
      return updatedJob;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error updating scheduled job: ${errorMessage}`);
    }
  }

  /**
   * Delete a scheduled job
   * @param id Job ID
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns True if the job was deleted
   */
  async deleteScheduledJob(
    id: string,
    userId: string,
    organizationId: string
  ): Promise<boolean> {
    try {
      // Find the job first
      const existingJob = await this.scheduledJobRepository.findById(id, organizationId);
      if (!existingJob) {
        throw new ApiError(404, 'Scheduled job not found');
      }
      
      // Stop the job if it's scheduled
      const existingTask = this.activeJobs.get(id);
      if (existingTask) {
        existingTask.stop();
        this.activeJobs.delete(id);
      }
      
      // Delete the job from the database
      return await this.scheduledJobRepository.delete(id, organizationId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error deleting scheduled job: ${errorMessage}`);
    }
  }

  /**
   * Run a job immediately
   * @param id Job ID
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns The result of the job execution
   */
  async runJobNow(
    id: string,
    userId: string,
    organizationId: string
  ): Promise<any> {
    try {
      // Find the job
      const job = await this.scheduledJobRepository.findById(id, organizationId);
      if (!job) {
        throw new ApiError(404, 'Scheduled job not found');
      }
      
      // Execute the job
      return await this.executeJob(job);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error running job: ${errorMessage}`);
    }
  }

  /**
   * Activate a job
   * @param id Job ID
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns The updated job
   */
  async activateJob(
    id: string,
    userId: string,
    organizationId: string
  ): Promise<IScheduledJob | null> {
    try {
      return await this.updateScheduledJob(
        id,
        { status: 'active' },
        userId,
        organizationId
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error activating job: ${errorMessage}`);
    }
  }

  /**
   * Deactivate a job
   * @param id Job ID
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns The updated job
   */
  async deactivateJob(
    id: string,
    userId: string,
    organizationId: string
  ): Promise<IScheduledJob | null> {
    try {
      return await this.updateScheduledJob(
        id,
        { status: 'inactive' },
        userId,
        organizationId
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error deactivating job: ${errorMessage}`);
    }
  }
}