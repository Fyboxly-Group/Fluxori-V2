/**
 * Amazon Data Kiosk API Module
 * 
 * Provides functionality for accessing and analyzing business data through
 * queries to Amazon's data repositories, offering insights on sales, inventory, and
 * business operations.
 */

import AmazonErrorHandler, { AmazonErrorCode } from '../utils/amazon-error';
import { ApiRequestFunction } from '../core/base-module.interface';

/**
 * Type definition for data query expression
 */
export interface QueryExpression {
  /**
   * The query string for the data query
   */
  query: string;
  
  /**
   * The variables to use in the query
   */
  variables?: Record<string, any>;
}

/**
 * Type definition for query response
 */
export interface QueryResponse<T = any> {
  /**
   * The data returned by the query
   */
  data: T;
}

/**
 * Options for creating a document
 */
export interface CreateDocumentOptions {
  /**
   * The name of the document
   */
  name: string;
  
  /**
   * The data query to use for the document
   */
  dataQuery: QueryExpression;
  
  /**
   * Content type for the document
   */
  contentType: 'application/json' | 'text/csv';
  
  /**
   * Description of the document
   */
  description?: string;
}

/**
 * Document creation response
 */
export interface CreateDocumentResponse {
  /**
   * The ID of the created document
   */
  documentId: string;
}

/**
 * Options for retrieving documents
 */
export interface GetDocumentsOptions {
  /**
   * Filter documents by name
   */
  name?: string;
  
  /**
   * Maximum number of results to return
   */
  maxResults?: number;
  
  /**
   * Token for pagination
   */
  nextToken?: string;
}

/**
 * Document metadata
 */
export interface DocumentMetadata {
  /**
   * The ID of the document
   */
  documentId: string;
  
  /**
   * The name of the document
   */
  name: string;
  
  /**
   * The description of the document
   */
  description?: string;
  
  /**
   * The data query used for the document
   */
  dataQuery: QueryExpression;
  
  /**
   * The content type of the document
   */
  contentType: string;
  
  /**
   * The time when the document was created
   */
  createdTime: string;
  
  /**
   * The time when the document was last modified
   */
  lastModifiedTime: string;
}

/**
 * Response for getting documents
 */
export interface GetDocumentsResponse {
  /**
   * List of document metadata
   */
  documents: DocumentMetadata[];
  
  /**
   * Token for pagination
   */
  nextToken?: string;
}

/**
 * Options for retrieving document content
 */
export interface GetDocumentContentOptions {
  /**
   * Optional desired content type for the response
   */
  acceptType?: 'application/json' | 'text/csv';
}

/**
 * Document content response
 */
export interface DocumentContentResponse<T = any> {
  /**
   * The content of the document
   */
  content: T;
  
  /**
   * The content type of the document
   */
  contentType: string;
}

/**
 * Options for retrieving job content
 */
export interface GetJobContentOptions {
  /**
   * Optional desired content type for the response
   */
  acceptType?: 'application/json' | 'text/csv';
}

/**
 * Job content response
 */
export interface JobContentResponse<T = any> {
  /**
   * The content of the job
   */
  content: T;
  
  /**
   * The content type of the job
   */
  contentType: string;
}

/**
 * Options for scheduling a document job
 */
export interface ScheduleDocumentJobOptions {
  /**
   * Schedule for the job (cron expression)
   */
  schedule?: string;
}

/**
 * Response for scheduling a document job
 */
export interface ScheduleDocumentJobResponse {
  /**
   * The ID of the scheduled job
   */
  jobId: string;
}

/**
 * Status of a job
 */
export type JobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

/**
 * Job metadata
 */
export interface JobMetadata {
  /**
   * The ID of the job
   */
  jobId: string;
  
  /**
   * The ID of the document
   */
  documentId: string;
  
  /**
   * The status of the job
   */
  status: JobStatus;
  
  /**
   * The time when the job was created
   */
  createdTime: string;
  
  /**
   * The time when the job was last modified
   */
  lastModifiedTime: string;
  
  /**
   * The schedule for the job (cron expression)
   */
  schedule?: string;
}

/**
 * Options for retrieving jobs
 */
export interface GetJobsOptions {
  /**
   * Filter jobs by document ID
   */
  documentId?: string;
  
  /**
   * Filter jobs by status
   */
  status?: JobStatus;
  
  /**
   * Maximum number of results to return
   */
  maxResults?: number;
  
  /**
   * Token for pagination
   */
  nextToken?: string;
}

/**
 * Response for getting jobs
 */
export interface GetJobsResponse {
  /**
   * List of job metadata
   */
  jobs: JobMetadata[];
  
  /**
   * Token for pagination
   */
  nextToken?: string;
}

/**
 * Amazon Data Kiosk API Module Implementation
 */
export class DataKioskModule {
  private readonly resourcePath = '/dataKiosk';
  private readonly apiVersion: string;
  private readonly apiRequest: ApiRequestFunction;
  private readonly marketplaceId: string;

  /**
   * Create a new Data Kiosk API module
   * 
   * @param apiVersion Amazon API version to use
   * @param apiRequest Function to make API requests
   * @param marketplaceId Amazon marketplace ID
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string
  ) {
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
  }

  /**
   * Execute a data query against Amazon's data repositories
   * 
   * @param queryExpression The query to execute
   * @returns The query response
   */
  public async executeQuery<T = any>(queryExpression: QueryExpression): Promise<QueryResponse<T>> {
    if (!queryExpression || !queryExpression.query) {
      throw AmazonErrorHandler.createError(
        'Query expression is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    try {
      const response = await this.apiRequest(
        `${this.resourcePath}/query`,
        'POST',
        queryExpression
      );
      
      return response.data as QueryResponse<T>;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Create a document from a data query
   * 
   * @param options The document creation options
   * @returns The document creation response
   */
  public async createDocument(options: CreateDocumentOptions): Promise<CreateDocumentResponse> {
    if (!options || !options.name || !options.dataQuery || !options.dataQuery.query || !options.contentType) {
      throw AmazonErrorHandler.createError(
        'Document name, data query, and content type are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    try {
      const response = await this.apiRequest(
        `${this.resourcePath}/documents`,
        'POST',
        options
      );
      
      return response.data as CreateDocumentResponse;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Get a list of documents
   * 
   * @param options Options for retrieving documents
   * @returns List of documents
   */
  public async getDocuments(options?: GetDocumentsOptions): Promise<GetDocumentsResponse> {
    try {
      const response = await this.apiRequest(
        `${this.resourcePath}/documents`,
        'GET',
        options
      );
      
      return response.data as GetDocumentsResponse;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Get a document by ID
   * 
   * @param documentId The ID of the document to retrieve
   * @returns The document metadata
   */
  public async getDocument(documentId: string): Promise<DocumentMetadata> {
    if (!documentId) {
      throw AmazonErrorHandler.createError(
        'Document ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    try {
      const response = await this.apiRequest(
        `${this.resourcePath}/documents/${documentId}`,
        'GET'
      );
      
      return response.data as DocumentMetadata;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Delete a document
   * 
   * @param documentId The ID of the document to delete
   */
  public async deleteDocument(documentId: string): Promise<void> {
    if (!documentId) {
      throw AmazonErrorHandler.createError(
        'Document ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    try {
      await this.apiRequest(
        `${this.resourcePath}/documents/${documentId}`,
        'DELETE'
      );
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Update a document
   * 
   * @param documentId The ID of the document to update
   * @param options The document update options
   * @returns The updated document metadata
   */
  public async updateDocument(
    documentId: string,
    options: Partial<CreateDocumentOptions>
  ): Promise<DocumentMetadata> {
    if (!documentId) {
      throw AmazonErrorHandler.createError(
        'Document ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    if (!options || Object.keys(options).length === 0) {
      throw AmazonErrorHandler.createError(
        'Update options are required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    try {
      const response = await this.apiRequest(
        `${this.resourcePath}/documents/${documentId}`,
        'PATCH',
        options
      );
      
      return response.data as DocumentMetadata;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Get document content
   * 
   * @param documentId The ID of the document
   * @param options Options for retrieving document content
   * @returns The document content
   */
  public async getDocumentContent<T = any>(
    documentId: string,
    options?: GetDocumentContentOptions
  ): Promise<DocumentContentResponse<T>> {
    if (!documentId) {
      throw AmazonErrorHandler.createError(
        'Document ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    try {
      // We'll need to handle headers differently since the ApiRequestFunction
      // doesn't directly support headers. In a real implementation, this would
      // need to be passed through the data parameter or handled specially.
      const response = await this.apiRequest(
        `${this.resourcePath}/documents/${documentId}/content`,
        'GET',
        options
      );
      
      return response.data as DocumentContentResponse<T>;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Schedule a document job
   * 
   * @param documentId The ID of the document to schedule
   * @param options Options for scheduling a document job
   * @returns The scheduled job response
   */
  public async scheduleDocumentJob(
    documentId: string,
    options?: ScheduleDocumentJobOptions
  ): Promise<ScheduleDocumentJobResponse> {
    if (!documentId) {
      throw AmazonErrorHandler.createError(
        'Document ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    try {
      const response = await this.apiRequest(
        `${this.resourcePath}/documents/${documentId}/jobs`,
        'POST',
        options || {}
      );
      
      return response.data as ScheduleDocumentJobResponse;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Get a list of jobs
   * 
   * @param options Options for retrieving jobs
   * @returns List of jobs
   */
  public async getJobs(options?: GetJobsOptions): Promise<GetJobsResponse> {
    try {
      const response = await this.apiRequest(
        `${this.resourcePath}/jobs`,
        'GET',
        options
      );
      
      return response.data as GetJobsResponse;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Get a job by ID
   * 
   * @param jobId The ID of the job to retrieve
   * @returns The job metadata
   */
  public async getJob(jobId: string): Promise<JobMetadata> {
    if (!jobId) {
      throw AmazonErrorHandler.createError(
        'Job ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    try {
      const response = await this.apiRequest(
        `${this.resourcePath}/jobs/${jobId}`,
        'GET'
      );
      
      return response.data as JobMetadata;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Cancel a job
   * 
   * @param jobId The ID of the job to cancel
   */
  public async cancelJob(jobId: string): Promise<void> {
    if (!jobId) {
      throw AmazonErrorHandler.createError(
        'Job ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    try {
      await this.apiRequest(
        `${this.resourcePath}/jobs/${jobId}`,
        'DELETE'
      );
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }

  /**
   * Get job content
   * 
   * @param jobId The ID of the job
   * @param options Options for retrieving job content
   * @returns The job content
   */
  public async getJobContent<T = any>(
    jobId: string,
    options?: GetJobContentOptions
  ): Promise<JobContentResponse<T>> {
    if (!jobId) {
      throw AmazonErrorHandler.createError(
        'Job ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }

    try {
      // Note: In the actual implementation, you would need to handle the Accept header
      // through the system that manages the API requests. For now, we're just passing
      // the options through, and assuming the ApiRequestFunction handles them appropriately.
      const response = await this.apiRequest(
        `${this.resourcePath}/jobs/${jobId}/content`,
        'GET',
        options
      );
      
      return response.data as JobContentResponse<T>;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
}
