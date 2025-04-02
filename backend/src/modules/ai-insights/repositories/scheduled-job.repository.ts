/**
 * Repository for managing scheduled insight jobs in Firestore
 */

import { injectable, inject } from 'inversify';
import { Firestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { 
  ScheduledInsightJob, 
  InsightType 
} from '../interfaces/insight.interface';
import { 
  ScheduledInsightJobSchema, 
  convertScheduledJobToSchema, 
  convertSchemaToScheduledJob 
} from '../models/insight.schema';

@injectable()
export class ScheduledJobRepository {
  private readonly collectionName = 'scheduled_insight_jobs';
  
  constructor(
    @inject('Firestore') private firestore: Firestore,
    @inject('Logger') private logger: Logger
  ) {}
  
  /**
   * Create a new scheduled job
   * @param data Job data without ID
   * @returns The created job with ID
   */
  async createJob(data: Omit<ScheduledInsightJob, 'id'>): Promise<ScheduledInsightJob> {
    try {
      const id = uuidv4();
      const now = new Date();
      
      const job: ScheduledInsightJob = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now
      };
      
      const schema = convertScheduledJobToSchema(job);
      await this.firestore.collection(this.collectionName).doc(id).set(schema);
      
      return job;
    } catch (error) {
      this.logger.error('Error creating scheduled job:', error);
      throw new Error(`Failed to create scheduled job: ${error.message}`);
    }
  }
  
  /**
   * Get a scheduled job by ID
   * @param id Job ID
   * @returns The job or null if not found
   */
  async findById(id: string): Promise<ScheduledInsightJob | null> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      const schema = doc.data() as ScheduledInsightJobSchema;
      return convertSchemaToScheduledJob(schema);
    } catch (error) {
      this.logger.error(`Error finding scheduled job with ID ${id}:`, error);
      throw new Error(`Failed to find scheduled job: ${error.message}`);
    }
  }
  
  /**
   * Update a scheduled job
   * @param id Job ID
   * @param data Data to update
   * @returns The updated job
   */
  async updateJob(id: string, data: Partial<ScheduledInsightJob>): Promise<ScheduledInsightJob | null> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      await this.firestore.collection(this.collectionName).doc(id).update(updateData);
      
      // Get the updated document
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Error updating scheduled job with ID ${id}:`, error);
      throw new Error(`Failed to update scheduled job: ${error.message}`);
    }
  }
  
  /**
   * Delete a scheduled job
   * @param id Job ID
   * @returns True if successful, false if not found
   */
  async deleteJob(id: string): Promise<boolean> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return false;
      }
      
      await this.firestore.collection(this.collectionName).doc(id).delete();
      return true;
    } catch (error) {
      this.logger.error(`Error deleting scheduled job with ID ${id}:`, error);
      throw new Error(`Failed to delete scheduled job: ${error.message}`);
    }
  }
  
  /**
   * Find scheduled jobs by organization ID
   * @param organizationId Organization ID
   * @param limit Maximum number of results (default: 50)
   * @returns Array of scheduled jobs
   */
  async findByOrganizationId(
    organizationId: string,
    limit: number = 50
  ): Promise<ScheduledInsightJob[]> {
    try {
      const query = this.firestore.collection(this.collectionName)
        .where('organizationId', '==', organizationId)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => {
        const schema = doc.data() as ScheduledInsightJobSchema;
        return convertSchemaToScheduledJob(schema);
      });
    } catch (error) {
      this.logger.error(`Error finding scheduled jobs for organization ${organizationId}:`, error);
      throw new Error(`Failed to find scheduled jobs: ${error.message}`);
    }
  }
  
  /**
   * Find scheduled jobs by type
   * @param organizationId Organization ID
   * @param type Insight type
   * @param limit Maximum number of results (default: 50)
   * @returns Array of scheduled jobs
   */
  async findByType(
    organizationId: string,
    type: InsightType,
    limit: number = 50
  ): Promise<ScheduledInsightJob[]> {
    try {
      const query = this.firestore.collection(this.collectionName)
        .where('organizationId', '==', organizationId)
        .where('type', '==', type)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => {
        const schema = doc.data() as ScheduledInsightJobSchema;
        return convertSchemaToScheduledJob(schema);
      });
    } catch (error) {
      this.logger.error(`Error finding scheduled jobs of type ${type}:`, error);
      throw new Error(`Failed to find scheduled jobs: ${error.message}`);
    }
  }
  
  /**
   * Find active jobs that are due to run
   * @param currentTime Current time
   * @param limit Maximum number of results (default: 100)
   * @returns Array of jobs due to run
   */
  async findDueJobs(
    currentTime: Date = new Date(),
    limit: number = 100
  ): Promise<ScheduledInsightJob[]> {
    try {
      const query = this.firestore.collection(this.collectionName)
        .where('isActive', '==', true)
        .where('nextRun', '<=', currentTime)
        .orderBy('nextRun', 'asc')
        .limit(limit);
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => {
        const schema = doc.data() as ScheduledInsightJobSchema;
        return convertSchemaToScheduledJob(schema);
      });
    } catch (error) {
      this.logger.error('Error finding due jobs:', error);
      throw new Error(`Failed to find due jobs: ${error.message}`);
    }
  }
  
  /**
   * Update the next run time for a job
   * @param id Job ID
   * @param lastRun Last run timestamp
   * @param nextRun Next run timestamp
   * @returns The updated job
   */
  async updateJobRunTimes(
    id: string,
    lastRun: Date,
    nextRun: Date
  ): Promise<ScheduledInsightJob | null> {
    try {
      return await this.updateJob(id, { lastRun, nextRun });
    } catch (error) {
      this.logger.error(`Error updating run times for job ${id}:`, error);
      throw new Error(`Failed to update job run times: ${error.message}`);
    }
  }
}