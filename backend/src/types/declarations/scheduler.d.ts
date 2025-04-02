/**
 * Type declarations for @google-cloud/scheduler
 */

declare module '@google-cloud/scheduler' {
  import { CloudSchedulerOptions, JobRequest, Job } from '../../google-cloud-types';

  export class CloudSchedulerClient {
    constructor(options?: CloudSchedulerOptions);
    createJob(request: JobRequest): Promise<[Job, any, any]>;
    deleteJob(request: { name: string }): Promise<[any, any, any]>;
    getJob(request: { name: string }): Promise<[Job, any, any]>;
    listJobs(request: { parent: string }): Promise<[Job[], any, any]>;
    pauseJob(request: { name: string }): Promise<[Job, any, any]>;
    resumeJob(request: { name: string }): Promise<[Job, any, any]>;
    runJob(request: { name: string }): Promise<[any, any, any]>;
    updateJob(request: { job: Job }): Promise<[Job, any, any]>;
  }
}