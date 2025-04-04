/**
 * Amazon Uploads API Module
 * 
 * Implements the Amazon SP-API Uploads API functionality.
 * This module handles creating upload destinations for various resource types.
 */

import { BaseApiModule } from '../core/api-module';
import { AmazonErrorUtil } from '../utils/amazon-error';

/**
 * Content types for uploads
 */
export type UploadContentType = 
  | 'text/xml'
  | 'text/plain'
  | 'text/csv'
  | 'application/json'
  | 'application/xml'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/pdf'
  | 'application/vnd.ms-excel'
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'application/zip'
  | 'application/gzip';

/**
 * Upload resource types
 */
export enum UploadResourceType {
  /**
   * Feed document used for submitting feeds
   */
  FEED_DOCUMENT = 'FeedDocument',
  
  /**
   * Report document used for downloading reports
   */
  REPORT_DOCUMENT = 'ReportDocument',
  
  /**
   * Images for products
   */
  IMAGE = 'Image',
  
  /**
   * Documents for FBA inventory
   */
  FBA_INBOUND_SHIPMENT_DOCUMENT = 'FulfillmentInboundShipDocument'
}

/**
 * Upload destination details
 */
export interface UploadDestination {
  /**
   * The URL for uploading content
   */
  uploadDestinationId: string;
  
  /**
   * The URL for uploading content (presigned)
   */
  url: string;
  
  /**
   * HTTP headers to include with the upload
   */
  headers?: Record<string, string>;
}

/**
 * Options for creating upload destinations
 */
export interface CreateUploadOptions {
  /**
   * Content type of the file to upload
   */
  contentType: UploadContentType;
  
  /**
   * Size of the file in bytes
   */
  contentLength?: number;
  
  /**
   * MD5 hash of the file content (base64 encoded)
   */
  contentMD5?: string;
  
  /**
   * Marketplace IDs to upload for (defaults to module's marketplace ID)
   */
  marketplaceIds?: string[];
}

/**
 * Implementation of the Amazon Uploads API
 */
export class UploadsModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string, 
    makeApiRequest: <T>(
      method: string, 
      endpoint: string, 
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string
  ) {
    super('uploads', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise.resolve();
  }
  
  /**
   * Create an upload destination for a resource type
   * @param resourceType Type of resource to upload
   * @param options Upload options including content type
   * @returns Upload destination details
   */
  public async createUploadDestination(
    resourceType: UploadResourceType,
    options: CreateUploadOptions
  ): Promise<UploadDestination> {
    try {
      // Build query parameters
      const params: Record<string, any> = {
        contentType: options.contentType
      };
      
      if (options.contentLength) {
        params.contentLength = options.contentLength;
      }
      
      if (options.contentMD5) {
        params.contentMD5 = options.contentMD5;
      }
      
      // Use provided marketplace IDs or default to module's marketplace ID
      const marketplaceIds = options.marketplaceIds || [this.marketplaceId];
      if (marketplaceIds.length > 0) {
        params.marketplaceIds = marketplaceIds.join(',');
      }
      
      const response = await this.makeRequest<UploadDestination>({
        method: 'POST',
        path: '/uploadDestinations',
        params,
        data: { resourceType }
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.createUploadDestination`);
    }
  }
  
  /**
   * Get an upload destination by ID
   * @param uploadDestinationId ID of the upload destination
   * @returns Upload destination details
   */
  public async getUploadDestination(
    uploadDestinationId: string
  ): Promise<UploadDestination> {
    try {
      const response = await this.makeRequest<UploadDestination>({
        method: 'GET',
        path: `/uploadDestinations/${uploadDestinationId}`
      });
      
      return response.data;
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getUploadDestination`);
    }
  }
  
  /**
   * Create an upload destination for a feed document
   * @param contentType Content type of the document
   * @param marketplaceId Marketplace ID (defaults to module's marketplace)
   * @returns Upload destination details
   */
  public async createFeedDocumentUpload(
    contentType: UploadContentType,
    marketplaceId?: string
  ): Promise<UploadDestination> {
    const mktId = marketplaceId || this.marketplaceId;
    
    const response = await this.createUploadDestination(
      UploadResourceType.FEED_DOCUMENT,
      {
        contentType,
        marketplaceIds: [mktId]
      }
    );
    
    return response;
  }
  
  /**
   * Create an upload destination for a product image
   * @param contentType Content type of the image (must be image content type)
   * @param marketplaceId Marketplace ID (defaults to module's marketplace)
   * @returns Upload destination details
   */
  public async createImageUpload(
    contentType: UploadContentType,
    marketplaceId?: string
  ): Promise<UploadDestination> {
    // Validate content type is an image type
    if (!contentType.startsWith('image/')) {
      throw AmazonErrorUtil.createError(
        `Invalid content type for image upload: ${contentType}. Must be an image type (image/jpeg, image/png, etc.)`,
        'INVALID_INPUT'
      );
    }
    
    const mktId = marketplaceId || this.marketplaceId;
    
    const response = await this.createUploadDestination(
      UploadResourceType.IMAGE,
      {
        contentType,
        marketplaceIds: [mktId]
      }
    );
    
    return response;
  }
  
  /**
   * Create an upload destination for a report document
   * @param contentType Content type of the document
   * @param marketplaceId Marketplace ID (defaults to module's marketplace)
   * @returns Upload destination details
   */
  public async createReportDocumentUpload(
    contentType: UploadContentType,
    marketplaceId?: string
  ): Promise<UploadDestination> {
    const mktId = marketplaceId || this.marketplaceId;
    
    const response = await this.createUploadDestination(
      UploadResourceType.REPORT_DOCUMENT,
      {
        contentType,
        marketplaceIds: [mktId]
      }
    );
    
    return response;
  }
  
  /**
   * Create an upload destination for a FBA inbound shipment document
   * @param contentType Content type of the document
   * @param marketplaceId Marketplace ID (defaults to module's marketplace)
   * @returns Upload destination details
   */
  public async createFBAInboundShipmentDocumentUpload(
    contentType: UploadContentType,
    marketplaceId?: string
  ): Promise<UploadDestination> {
    const mktId = marketplaceId || this.marketplaceId;
    
    const response = await this.createUploadDestination(
      UploadResourceType.FBA_INBOUND_SHIPMENT_DOCUMENT,
      {
        contentType,
        marketplaceIds: [mktId]
      }
    );
    
    return response;
  }
  
  /**
   * Helper method to build HTTP headers for uploads
   * 
   * @param contentType Content type of the file
   * @param contentLength Optional content length in bytes
   * @param contentMD5 Optional MD5 hash in base64 format
   * @returns Headers object for the upload
   */
  public buildUploadHeaders(
    contentType: string,
    contentLength?: number,
    contentMD5?: string
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': contentType
    };
    
    if (contentLength !== undefined) {
      headers['Content-Length'] = contentLength.toString();
    }
    
    if (contentMD5) {
      headers['Content-MD5'] = contentMD5;
    }
    
    return headers;
  }
  
  /**
   * Generate a presigned URL for uploading content to Amazon S3
   * 
   * @param resourceType Type of resource to upload
   * @param contentType Content type of the file
   * @param options Additional options for the upload
   * @returns Presigned URL information for the upload
   */
  public async getPresignedUrl(
    resourceType: UploadResourceType,
    contentType: UploadContentType,
    options: {
      contentLength?: number;
      contentMD5?: string;
      marketplaceId?: string;
    } = {}
  ): Promise<{
    url: string;
    headers: Record<string, string>;
    uploadId: string;
  }> {
    try {
      const destination = await this.createUploadDestination(
        resourceType,
        {
          contentType,
          contentLength: options.contentLength,
          contentMD5: options.contentMD5,
          marketplaceIds: options.marketplaceId ? [options.marketplaceId] : [this.marketplaceId]
        }
      );
      
      // Build standard headers
      const headers = this.buildUploadHeaders(
        contentType,
        options.contentLength,
        options.contentMD5
      );
      
      // Add any headers from the upload destination
      if (destination.headers) {
        Object.assign(headers, destination.headers);
      }
      
      return {
        url: destination.url,
        headers,
        uploadId: destination.uploadDestinationId
      };
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getPresignedUrl`);
    }
  }
}

export default UploadsModule;