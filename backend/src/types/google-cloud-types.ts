/**
 * TypeScript definitions for Google Cloud libraries
 * 
 * This file provides type definitions for Google Cloud libraries that
 * don't have complete type definitions in their packages.
 */

/**
 * Secret Manager types
 */
export interface SecretVersion {
  name: string;
  createTime: Date;
  destroyTime?: Date;
  state: 'ENABLED' | 'DISABLED' | 'DESTROYED';
  payload?: {
    data: Buffer;
    dataCrc32c?: string;
  };
}

export interface SecretOptions {
  replication: {
    automatic: Record<string, unknown>;
  };
}

export interface SecretPayload {
  data: Buffer;
  dataCrc32c?: string;
}

export interface AccessSecretVersionResponse {
  name: string;
  payload?: {
    data: Buffer;
    dataCrc32c?: string;
  };
}

export interface CreateSecretRequest {
  parent: string;
  secretId: string;
  secret: SecretOptions;
}

export interface AddSecretVersionRequest {
  parent: string;
  payload: SecretPayload;
}

export interface DeleteSecretRequest {
  name: string;
  etag?: string;
}

export interface AccessSecretVersionRequest {
  name: string;
}

/**
 * Scheduler types
 */
export interface CloudSchedulerOptions {
  projectId?: string;
}

export interface Schedule {
  name: string;
  schedule: string; // cron format
  timeZone?: string;
  description?: string;
  state?: 'ENABLED' | 'DISABLED' | 'PAUSED';
}

export interface JobRequest {
  parent: string;
  job: {
    name?: string;
    description?: string;
    schedule: string;
    timeZone?: string;
    target: {
      uri: string;
      httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      body?: string | Buffer;
    } | {
      pubsubTarget: {
        topicName: string;
        data?: string | Buffer;
      };
    } | {
      appEngineHttpTarget: {
        appEngineRouting?: {
          service?: string;
          version?: string;
          instance?: string;
        };
        relativeUri: string;
        httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: Record<string, string>;
        body?: string | Buffer;
      };
    };
  };
}

export interface Job {
  name: string;
  description?: string;
  schedule: string;
  timeZone?: string;
  state?: 'ENABLED' | 'DISABLED' | 'PAUSED';
  target?: any;
  lastAttemptTime?: Date;
  userUpdateTime?: Date;
}