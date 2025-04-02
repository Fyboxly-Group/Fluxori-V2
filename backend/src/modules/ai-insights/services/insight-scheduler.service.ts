/**
 * Service for scheduling and managing insight jobs
 */

import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { CronJob } from 'cron';
import { CreditService } from '../../credits/services/credit.service';
import { ScheduledJobRepository } from '../repositories/scheduled-job.repository';
import { InsightGenerationService } from './insight-generation.service';
import { 
  ScheduledInsightJob, 
  InsightSource, 
  OnDemandInsightRequest
} from '../interfaces/insight.interface';
import { SCHEDULED_INSIGHT_JOB_CREATION_COST } from '../constants/credit-costs';

@injectable()
export class InsightSchedulerService {
  private cronJobs: Map<string, CronJob> = new Map();
  
  constructor(
    @inject('Logger') private logger: Logger,
    @inject(CreditService) private creditService: CreditService,
    @inject(ScheduledJobRepository) private jobRepository: ScheduledJobRepository,
    @inject(InsightGenerationService) private insightGenerationService: InsightGenerationService
  ) {}
  
  /**
   * Initialize the scheduler - load all active jobs and schedule them
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing insight scheduler...');
      
      // Cancel any existing cron jobs
      this.stopAllJobs();
      
      // Get all active jobs from the database
      const allJobs = await this.jobRepository.findDueJobs();
      
      // Schedule each active job
      let scheduledCount = 0;
      for (const job of allJobs) {
        if (job.isActive) {
          this.scheduleJob(job);
          scheduledCount++;
        }
      }
      
      this.logger.info(`Insight scheduler initialized with ${scheduledCount} active jobs`);
    } catch (error) {
      this.logger.error('Error initializing insight scheduler:', error);
    }
  }
  
  /**
   * Create a new scheduled insight job
   * @param organizationId Organization ID
   * @param userId User ID
   * @param jobData Job data
   * @returns Created job
   */
  public async createJob(
    organizationId: string,
    userId: string,
    jobData: Omit<ScheduledInsightJob, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'organizationId'>
  ): Promise<ScheduledInsightJob> {
    try {
      // Check if the organization has enough credits
      const hasCredits = await this.creditService.hasAvailableCredits(
        organizationId,
        SCHEDULED_INSIGHT_JOB_CREATION_COST
      );
      
      if (!hasCredits) {
        throw new Error('Not enough credits to create a scheduled insight job');
      }
      
      // Calculate the next run time based on frequency or cron expression
      const nextRun = this.calculateNextRunTime(jobData.frequency, jobData.cronExpression);
      
      // Create the job in the database
      const job = await this.jobRepository.createJob({
        ...jobData,
        userId,
        organizationId,
        nextRun
      });
      
      // Use credits for job creation
      await this.creditService.useCredits(
        organizationId,
        SCHEDULED_INSIGHT_JOB_CREATION_COST,
        `Created scheduled insight job: ${job.name}`,
        job.id
      );
      
      // Schedule the job if it's active
      if (job.isActive) {
        this.scheduleJob(job);
      }
      
      return job;
    } catch (error) {
      this.logger.error('Error creating scheduled insight job:', error);
      throw new Error(`Failed to create scheduled insight job: ${error.message}`);
    }
  }
  
  /**
   * Update an existing scheduled insight job
   * @param jobId Job ID
   * @param organizationId Organization ID
   * @param updateData Job data to update
   * @returns Updated job
   */
  public async updateJob(
    jobId: string,
    organizationId: string,
    updateData: Partial<ScheduledInsightJob>
  ): Promise<ScheduledInsightJob> {
    try {
      // Get the current job
      const currentJob = await this.jobRepository.findById(jobId);
      
      if (!currentJob) {
        throw new Error('Scheduled insight job not found');
      }
      
      // Check organization access
      if (currentJob.organizationId !== organizationId) {
        throw new Error('You do not have permission to update this job');
      }
      
      // Calculate the next run time if frequency or cron expression changed
      let nextRun = currentJob.nextRun;
      if (updateData.frequency || updateData.cronExpression) {
        const frequency = updateData.frequency || currentJob.frequency;
        const cronExpression = updateData.cronExpression || currentJob.cronExpression;
        nextRun = this.calculateNextRunTime(frequency, cronExpression);
      }
      
      // Update the job in the database
      const updatedJob = await this.jobRepository.updateJob(jobId, {
        ...updateData,
        nextRun
      });
      
      if (!updatedJob) {
        throw new Error('Failed to update scheduled insight job');
      }
      
      // Update the scheduling if the job is active
      if (this.cronJobs.has(jobId)) {
        this.cronJobs.get(jobId)?.stop();
        this.cronJobs.delete(jobId);
      }
      
      if (updatedJob.isActive) {
        this.scheduleJob(updatedJob);
      }
      
      return updatedJob;
    } catch (error) {
      this.logger.error(`Error updating scheduled insight job ${jobId}:`, error);
      throw new Error(`Failed to update scheduled insight job: ${error.message}`);
    }
  }
  
  /**
   * Delete a scheduled insight job
   * @param jobId Job ID
   * @param organizationId Organization ID
   * @returns True if successful
   */
  public async deleteJob(jobId: string, organizationId: string): Promise<boolean> {
    try {
      // Get the current job
      const currentJob = await this.jobRepository.findById(jobId);
      
      if (!currentJob) {
        throw new Error('Scheduled insight job not found');
      }
      
      // Check organization access
      if (currentJob.organizationId !== organizationId) {
        throw new Error('You do not have permission to delete this job');
      }
      
      // Stop and remove any scheduled cron job
      if (this.cronJobs.has(jobId)) {
        this.cronJobs.get(jobId)?.stop();
        this.cronJobs.delete(jobId);
      }
      
      // Delete the job from the database
      const success = await this.jobRepository.deleteJob(jobId);
      
      if (!success) {
        throw new Error('Failed to delete scheduled insight job');
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Error deleting scheduled insight job ${jobId}:`, error);
      throw new Error(`Failed to delete scheduled insight job: ${error.message}`);
    }
  }
  
  /**
   * Manually run a scheduled insight job immediately
   * @param jobId Job ID
   * @param organizationId Organization ID
   * @returns Generated insight ID
   */
  public async runJobNow(jobId: string, organizationId: string): Promise<string> {
    try {
      // Get the job
      const job = await this.jobRepository.findById(jobId);
      
      if (!job) {
        throw new Error('Scheduled insight job not found');
      }
      
      // Check organization access
      if (job.organizationId !== organizationId) {
        throw new Error('You do not have permission to run this job');
      }
      
      // Execute the job
      const insightId = await this.executeJob(job);
      
      // Update the job's last run and next run times
      const lastRun = new Date();
      const nextRun = this.calculateNextRunTime(job.frequency, job.cronExpression);
      
      await this.jobRepository.updateJobRunTimes(jobId, lastRun, nextRun);
      
      return insightId;
    } catch (error) {
      this.logger.error(`Error running scheduled insight job ${jobId}:`, error);
      throw new Error(`Failed to run scheduled insight job: ${error.message}`);
    }
  }
  
  /**
   * Schedule a job as a cron job
   * @param job Scheduled insight job
   */
  private scheduleJob(job: ScheduledInsightJob): void {
    try {
      // If there's already a cron job for this ID, stop it
      if (this.cronJobs.has(job.id)) {
        this.cronJobs.get(job.id)?.stop();
      }
      
      // Get the cron expression based on the job frequency
      let cronExpression: string;
      
      if (job.cronExpression) {
        // Use custom cron expression if provided
        cronExpression = job.cronExpression;
      } else {
        // Otherwise use predefined frequency
        switch (job.frequency) {
          case 'daily':
            cronExpression = '0 0 * * *'; // Run at midnight every day
            break;
          case 'weekly':
            cronExpression = '0 0 * * 1'; // Run at midnight every Monday
            break;
          case 'monthly':
            cronExpression = '0 0 1 * *'; // Run at midnight on first day of month
            break;
          default:
            throw new Error(`Unsupported job frequency: ${job.frequency}`);
        }
      }
      
      // Create the cron job
      const cronJob = new CronJob(cronExpression, async () => {
        try {
          await this.executeJob(job);
          
          // Update the job's last run and next run times
          const lastRun = new Date();
          const nextRun = this.calculateNextRunTime(job.frequency, job.cronExpression);
          
          await this.jobRepository.updateJobRunTimes(job.id, lastRun, nextRun);
        } catch (error) {
          this.logger.error(`Error executing scheduled job ${job.id}:`, error);
        }
      });
      
      // Start the cron job
      cronJob.start();
      
      // Store it in our map
      this.cronJobs.set(job.id, cronJob);
      
      this.logger.info(`Scheduled insight job ${job.id} - ${job.name} with cron: ${cronExpression}`);
    } catch (error) {
      this.logger.error(`Error scheduling insight job ${job.id}:`, error);
    }
  }
  
  /**
   * Execute a scheduled insight job
   * @param job Scheduled insight job
   * @returns Generated insight ID
   */
  private async executeJob(job: ScheduledInsightJob): Promise<string> {
    try {
      this.logger.info(`Executing scheduled insight job ${job.id} - ${job.name}`);
      
      // Create an insight request from the job
      const request: OnDemandInsightRequest = {
        type: job.type,
        userId: job.userId,
        organizationId: job.organizationId,
        targetEntityIds: job.targetEntities?.map(entity => entity.id),
        targetEntityType: job.targetEntities?.[0]?.type,
        options: job.options
      };
      
      // Generate the insight
      const insight = await this.insightGenerationService.generateInsight(request);
      
      this.logger.info(`Successfully executed scheduled insight job ${job.id}, generated insight ${insight.id}`);
      
      return insight.id;
    } catch (error) {
      this.logger.error(`Error executing job ${job.id}:`, error);
      throw new Error(`Failed to execute scheduled insight job: ${error.message}`);
    }
  }
  
  /**
   * Calculate the next run time based on frequency or cron expression
   * @param frequency Job frequency
   * @param cronExpression Optional custom cron expression
   * @returns Next run date
   */
  private calculateNextRunTime(
    frequency: string,
    cronExpression?: string
  ): Date {
    const now = new Date();
    
    if (cronExpression) {
      // Use the cron library to calculate the next run time
      const tempCronJob = new CronJob(cronExpression, () => {});
      return tempCronJob.nextDates().toDate();
    }
    
    // Otherwise calculate based on frequency
    switch (frequency) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
        
      case 'weekly':
        const nextMonday = new Date(now);
        nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
        nextMonday.setHours(0, 0, 0, 0);
        return nextMonday;
        
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(0, 0, 0, 0);
        return nextMonth;
        
      default:
        throw new Error(`Unsupported job frequency: ${frequency}`);
    }
  }
  
  /**
   * Stop all scheduled cron jobs
   */
  private stopAllJobs(): void {
    this.cronJobs.forEach((job, id) => {
      job.stop();
      this.logger.info(`Stopped scheduled insight job ${id}`);
    });
    
    this.cronJobs.clear();
  }
}