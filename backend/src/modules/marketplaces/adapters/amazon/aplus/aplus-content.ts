/**
 * Amazon A+ Content API Module
 * 
 * Implements the Amazon SP-API A+ Content API functionality.
 * This module allows sellers to create and manage enhanced content on product detail pages
 * with rich media and formatted text.
 */

import { ApiModule } from '../core/api-module';
import { BaseModule, ApiResponse, ApiRequestFunction } from '../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../utils/amazon-error';

/**
 * Content document language tag
 */
export type ContentLanguageTag = string;

/**
 * Content type to filter by
 */
export type ContentType = 'STANDARD' | 'ENHANCED' | 'STANDARD_COMPARISON' | 'ENHANCED_COMPARISON';

/**
 * Content status to filter by
 */
export type ContentStatus = 'APPROVED' | 'DRAFT' | 'REJECTED' | 'SUBMITTED';

/**
 * Publication status to filter by
 */
export type PublicationStatus = 'APPROVED' | 'DRAFT' | 'REJECTED' | 'SUBMITTED';

/**
 * Content document error code
 */
export enum ContentDocumentErrorCode {
  INVALID_CONTENT_DOCUMENT = 'INVALID_CONTENT_DOCUMENT',
  INVALID_ASIN_LIST = 'INVALID_ASIN_LIST',
  DUPLICATE_ASIN = 'DUPLICATE_ASIN',
  CONTENT_DOCUMENT_TOO_LARGE = 'CONTENT_DOCUMENT_TOO_LARGE',
  CONTENT_TYPE_MISMATCH = 'CONTENT_TYPE_MISMATCH',
  INVALID_MARKETPLACE = 'INVALID_MARKETPLACE',
  INVALID_CONTENT_METADATA = 'INVALID_CONTENT_METADATA',
  INVALID_LANGUAGE_TAG = 'INVALID_LANGUAGE_TAG',
  UNSUPPORTED_LANGUAGE = 'UNSUPPORTED_LANGUAGE',
  UNSUPPORTED_CONTENT_TYPE = 'UNSUPPORTED_CONTENT_TYPE',
  CONTENT_REFERENCE_KEY_ALREADY_EXISTS = 'CONTENT_REFERENCE_KEY_ALREADY_EXISTS',
  CONTENT_REFERENCE_INVALID = 'CONTENT_REFERENCE_INVALID',
  CONTENT_REFERENCE_ALREADY_PUBLISHED = 'CONTENT_REFERENCE_ALREADY_PUBLISHED'
}

/**
 * Content module data
 */
export interface ContentModule {
  contentModuleType: string;
  [key: string]: any;
}

/**
 * Content document metadata
 */
export interface ContentMetadata {
  name?: string;
  marketplaceId: string;
  contentType: ContentType;
  contentSubType?: string;
  locale?: ContentLanguageTag;
}

/**
 * Content document 
 */
export interface ContentDocument {
  contentReferenceKey: string;
  contentMetadata: ContentMetadata;
  contentModules: ContentModule[];
}

/**
 * Search content response
 */
export interface SearchContentResponse {
  contentMetadataRecords: Array<{
    contentReferenceKey: string;
    contentMetadata: ContentMetadata;
    status: ContentStatus;
  }>;
  nextPageToken?: string;
}

/**
 * Create content response
 */
export interface CreateContentResponse {
  contentReferenceKey: string;
  warnings?: Array<{
    code: string;
    message: string;
  }>;
}

/**
 * List content document ASINs response
 */
export interface ListContentDocumentAsinRelationsResponse {
  asinMetadataSet: Array<{
    asin: string;
    badgeSet?: string[];
    parent?: string;
    title?: string;
    imageUrl?: string;
  }>;
  nextPageToken?: string;
}

/**
 * Options for content operations
 */
export interface ContentOptions {
  /**
   * Token for pagination
   */
  nextPageToken?: string;
  
  /**
   * Number of results to return per page
   */
  pageSize?: number;
  
  /**
   * Filter by content status
   */
  includedDataSet?: string[];
  
  /**
   * Filter by content status
   */
  contentStatus?: ContentStatus;
  
  /**
   * Filter by ASIN
   */
  asin?: string;
  
  /**
   * Filter by content reference key
   */
  contentReferenceKey?: string;
  
  /**
   * Filter by marketplace ID
   */
  marketplaceId?: string;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  method: string;
  path: string;
  params?: Record<string, string | string[]>;
  data?: any;
}

/**
 * A+ Content module options
 */
export interface APlusContentModuleOptions {
  // Module-specific options can be added here
}

/**
 * Implementation of the Amazon A+ Content API
 */
export class APlusContentModule extends ApiModule<APlusContentModuleOptions> implements BaseModule<APlusContentModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'amazon-aplus-content';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'APlusContent';
  
  /**
   * The API version this module uses
   */
  readonly apiVersion: string;
  
  /**
   * The base URL path for API requests
   */
  readonly basePath: string;
  
  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param options Module options
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options: APlusContentModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/aplus/content/${this.apiVersion}`;
  }
  
  /**
   * Make an API request with proper error handling
   * @param options Request options
   * @returns API response
   */
  private async makeApiCall<T>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
    const { method, path, params, data } = options;
    
    const fullPath = path.startsWith('/') 
      ? `${this.basePath}${path}`
      : `${this.basePath}/${path}`;
    
    try {
      return await this.apiRequest<T>(fullPath, method, {
        ...data,
        _params: params,
        _marketplaceId: this.marketplaceId
      });
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.${method} ${path}`);
    }
  }
  
  /**
   * Search for A+ Content documents
   * @param options Search options
   * @returns List of content documents matching search criteria
   */
  public async searchContentDocuments(
    options: ContentOptions = {}
  ): Promise<ApiResponse<SearchContentResponse>> {
    const marketplaceId = options.marketplaceId || this.marketplaceId;
    
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to search content documents',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const params: Record<string, string | string[]> = {
      marketplaceId
    };
    
    if (options.nextPageToken) {
      params.nextPageToken = options.nextPageToken;
    }
    
    if (options.pageSize) {
      params.pageSize = options.pageSize.toString();
    }
    
    if (options.includedDataSet) {
      params.includedDataSet = options.includedDataSet;
    }
    
    if (options.contentStatus) {
      params.contentStatus = options.contentStatus;
    }
    
    return this.makeApiCall<SearchContentResponse>({
      method: 'GET',
      path: '/contentDocuments',
      params
    });
  }
  
  /**
   * Create a new A+ Content document
   * @param contentDocument Content document to create
   * @returns Created content document reference
   */
  public async createContentDocument(
    contentDocument: ContentDocument
  ): Promise<ApiResponse<CreateContentResponse>> {
    if (!contentDocument) {
      throw AmazonErrorHandler.createError(
        'Content document is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!contentDocument.contentMetadata.marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required in content metadata',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<CreateContentResponse>({
      method: 'POST',
      path: '/contentDocuments',
      data: contentDocument
    });
  }
  
  /**
   * Get an A+ Content document by reference key
   * @param contentReferenceKey Content reference key
   * @param includedDataSet Optional data to include in response
   * @returns Content document
   */
  public async getContentDocument(
    contentReferenceKey: string,
    includedDataSet?: string[]
  ): Promise<ApiResponse<ContentDocument>> {
    if (!contentReferenceKey) {
      throw AmazonErrorHandler.createError(
        'Content reference key is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const params: Record<string, string | string[]> = {};
    
    if (includedDataSet) {
      params.includedDataSet = includedDataSet;
    }
    
    return this.makeApiCall<ContentDocument>({
      method: 'GET',
      path: `/contentDocuments/${contentReferenceKey}`,
      params
    });
  }
  
  /**
   * Update an A+ Content document
   * @param contentReferenceKey Content reference key
   * @param contentDocument Updated content document
   * @returns Success response
   */
  public async updateContentDocument(
    contentReferenceKey: string,
    contentDocument: ContentDocument
  ): Promise<ApiResponse<void>> {
    if (!contentReferenceKey) {
      throw AmazonErrorHandler.createError(
        'Content reference key is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!contentDocument) {
      throw AmazonErrorHandler.createError(
        'Content document is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<void>({
      method: 'POST',
      path: `/contentDocuments/${contentReferenceKey}`,
      data: contentDocument
    });
  }
  
  /**
   * Delete an A+ Content document
   * @param contentReferenceKey Content reference key
   * @returns Success response
   */
  public async deleteContentDocument(
    contentReferenceKey: string
  ): Promise<ApiResponse<void>> {
    if (!contentReferenceKey) {
      throw AmazonErrorHandler.createError(
        'Content reference key is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<void>({
      method: 'DELETE',
      path: `/contentDocuments/${contentReferenceKey}`
    });
  }
  
  /**
   * List ASIN relationships for a content document
   * @param contentReferenceKey Content reference key
   * @param options List options
   * @returns ASIN relationships
   */
  public async listContentDocumentAsinRelations(
    contentReferenceKey: string,
    options: ContentOptions = {}
  ): Promise<ApiResponse<ListContentDocumentAsinRelationsResponse>> {
    if (!contentReferenceKey) {
      throw AmazonErrorHandler.createError(
        'Content reference key is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const marketplaceId = options.marketplaceId || this.marketplaceId;
    
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to list content document ASIN relations',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const params: Record<string, string | string[]> = {
      marketplaceId
    };
    
    if (options.nextPageToken) {
      params.nextPageToken = options.nextPageToken;
    }
    
    if (options.pageSize) {
      params.pageSize = options.pageSize.toString();
    }
    
    if (options.includedDataSet) {
      params.includedDataSet = options.includedDataSet;
    }
    
    if (options.asin) {
      params.asin = options.asin;
    }
    
    return this.makeApiCall<ListContentDocumentAsinRelationsResponse>({
      method: 'GET',
      path: `/contentDocuments/${contentReferenceKey}/asins`,
      params
    });
  }
  
  /**
   * Validate an A+ Content document for submission 
   * @param contentDocument Content document to validate
   * @returns Content validation results
   */
  public async validateContentDocumentAsinRelations(
    contentDocument: ContentDocument
  ): Promise<ApiResponse<any>> {
    if (!contentDocument) {
      throw AmazonErrorHandler.createError(
        'Content document is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!contentDocument.contentMetadata.marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required in content metadata',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<any>({
      method: 'POST',
      path: '/contentDocuments/validate',
      data: contentDocument
    });
  }
  
  /**
   * Search for A+ Content ASINs
   * @param marketplaceId Marketplace ID
   * @param keywords Keywords to search for
   * @param options Search options
   * @returns ASINs matching search criteria
   */
  public async searchContentPublishRecords(
    keywords: string[],
    options: ContentOptions = {}
  ): Promise<ApiResponse<any>> {
    if (!keywords || keywords.length === 0) {
      throw AmazonErrorHandler.createError(
        'Keywords are required to search content publish records',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const marketplaceId = options.marketplaceId || this.marketplaceId;
    
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to search content publish records',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const params: Record<string, string | string[]> = {
      marketplaceId,
      keywords: keywords
    };
    
    if (options.nextPageToken) {
      params.nextPageToken = options.nextPageToken;
    }
    
    if (options.pageSize) {
      params.pageSize = options.pageSize.toString();
    }
    
    return this.makeApiCall<any>({
      method: 'GET',
      path: '/contentPublishRecords',
      params
    });
  }
  
  /**
   * Create a content document ASIN relation
   * @param contentReferenceKey Content reference key
   * @param asins List of ASINs to associate with the content
   * @returns Operation result
   */
  public async postContentDocumentAsinRelations(
    contentReferenceKey: string,
    asins: string[]
  ): Promise<ApiResponse<any>> {
    if (!contentReferenceKey) {
      throw AmazonErrorHandler.createError(
        'Content reference key is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!asins || asins.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const marketplaceId = this.marketplaceId;
    
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to post content document ASIN relations',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<any>({
      method: 'POST',
      path: `/contentDocuments/${contentReferenceKey}/asins`,
      data: {
        asinList: asins,
        marketplaceId
      }
    });
  }
  
  /**
   * Publish A+ Content for specified ASINs
   * @param contentReferenceKey Content reference key
   * @param marketplaceId Marketplace ID
   * @returns Publication result
   */
  public async publishContentDocument(
    contentReferenceKey: string,
    marketplaceId?: string
  ): Promise<ApiResponse<any>> {
    if (!contentReferenceKey) {
      throw AmazonErrorHandler.createError(
        'Content reference key is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to publish content document',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<any>({
      method: 'POST',
      path: `/contentDocuments/${contentReferenceKey}/publish`,
      data: {
        marketplaceId: mktId
      }
    });
  }
  
  /**
   * Get all A+ Content documents for a seller
   * @param options Optional parameters
   * @returns All content documents
   */
  public async getAllContentDocuments(
    options: ContentOptions = {}
  ): Promise<ContentDocument[]> {
    const result: ContentDocument[] = [];
    let nextPageToken: string | undefined = undefined;
    
    try {
      do {
        const response = await this.searchContentDocuments({
          ...options,
          nextPageToken
        });
        
        // Get full content documents for each result
        for (const record of response.data.contentMetadataRecords) {
          try {
            const contentResponse = await this.getContentDocument(record.contentReferenceKey);
            result.push(contentResponse.data);
          } catch (error) {
            console.error(`Error getting content document ${record.contentReferenceKey}:`, error);
          }
        }
        
        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken);
      
      return result;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getAllContentDocuments`);
    }
  }
  
  /**
   * Get all ASINs related to an A+ Content document with automatic pagination
   * @param contentReferenceKey Content reference key
   * @param options Optional parameters
   * @returns All related ASINs
   */
  public async getAllRelatedAsins(
    contentReferenceKey: string,
    options: ContentOptions = {}
  ): Promise<string[]> {
    if (!contentReferenceKey) {
      throw AmazonErrorHandler.createError(
        'Content reference key is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const result: string[] = [];
    let nextPageToken: string | undefined = undefined;
    
    try {
      do {
        const response = await this.listContentDocumentAsinRelations(
          contentReferenceKey,
          {
            ...options,
            nextPageToken
          }
        );
        
        for (const asinMetadata of response.data.asinMetadataSet) {
          result.push(asinMetadata.asin);
        }
        
        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken);
      
      return result;
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getAllRelatedAsins`);
    }
  }
}
