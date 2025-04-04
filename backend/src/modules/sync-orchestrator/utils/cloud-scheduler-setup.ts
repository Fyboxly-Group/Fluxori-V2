// Importing Types from mongoose
import { Types } from 'mongoose';

// CloudSchedulerClient interface stub since we don't have the actual package
interface CloudSchedulerClient {
  locationPath(projectId: string, location: string): string;
  jobPath(projectId: string, location: string, jobName: string): string;
  createJob(options: { parent: string, job: any }): Promise<[any]>;
  deleteJob(options: { name: string }): Promise<[any]>;
}

// CloudSchedulerClient implementation stub
class CloudSchedulerClientImpl implements CloudSchedulerClient {
  locationPath(projectId: string, location: string): string {
    return `projects/${projectId}/locations/${location}`;
  }
  
  jobPath(projectId: string, location: string, jobName: string): string {
    return `projects/${projectId}/locations/${location}/jobs/${jobName}`;
  }
  
  async createJob(options: { parent: string, job: any }): Promise<[any]> {
    console.log('Creating job:', options.job);
    return [{ name: options.job.name }];
  }
  
  async deleteJob(options: { name: string }): Promise<[any]> {
    console.log('Deleting job:', options.name);
    return [{ success: true }];
  }
}

/**
 * Interface for job configuration
 */
interface JobConfig {
  name: string;
  schedule: string;
  endpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Cloud Scheduler Setup Utility
 * 
 * Handles creation and management of Cloud Scheduler jobs
 */
export class CloudSchedulerSetup {
  private client: CloudSchedulerClient;
  private projectId: string;
  private location: string;
  
  /**
   * Constructor
   */
  constructor(projectId: string, location = 'us-central1') {
    this.client = new CloudSchedulerClientImpl();
    this.projectId = projectId;
    this.location = location;
  }
  
  /**
   * Create a scheduled sync job
   */
  async createSyncJob(config: JobConfig): Promise<any> {
    try {
      const parent = this.client.locationPath(this.projectId, this.location);
      
      const job = {
        name: `${parent}/jobs/${config.name}`,
        schedule: config.schedule,
        timeZone: 'UTC',
        httpTarget: {
          uri: config.endpoint,
          httpMethod: config.httpMethod,
          body: config.body ? Buffer.from(JSON.stringify(config.body)).toString('base64') : undefined,
          headers: config.headers || {}
        }
      };
      
      const [response] = await this.client.createJob({
        parent,
        job
      });
      
      console.log(`Job created: ${response.name}`);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error creating sync job:', errorMessage);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
  
  /**
   * Delete a scheduled sync job
   */
  async deleteJob(jobName: string): Promise<any> {
    try {
      const name = this.client.jobPath(this.projectId, this.location, jobName);
      const [response] = await this.client.deleteJob({ name });
      
      console.log(`Job deleted: ${jobName}`);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error deleting job ${jobName}:`, errorMessage);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}
