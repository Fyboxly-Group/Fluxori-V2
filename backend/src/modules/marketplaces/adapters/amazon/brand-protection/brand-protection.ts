/**
 * Amazon Brand Protection API Module
 * 
 * Implements the Amazon SP-API Brand Protection API functionality.
 * This module allows sellers to manage protections against counterfeits and intellectual
 * property violations through Amazon's Brand Registry program.
 */

import { ApiModule } from '../core/api-module';
import { BaseModule, ApiResponse, ApiRequestFunction } from '../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../utils/amazon-error';

/**
 * Search filter types
 */
export type SearchFilterType = 'ASIN' | 'BRAND_NAME' | 'EXTERNAL_ID' | 'TITLE';

/**
 * Case status type
 */
export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

/**
 * Violation type
 */
export type ViolationType = 
  'COPYRIGHT' | 
  'TRADEMARK' | 
  'PATENT' | 
  'COUNTERFEIT' | 
  'ITEM_CONDITION' | 
  'PRODUCT_SAFETY';

/**
 * Sort order for search results
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * Order by field for search results
 */
export type OrderBy = 'CASE_ID' | 'STATUS' | 'CREATED_DATE' | 'LAST_MODIFIED_DATE';

/**
 * Report types for brand protection reports
 */
export type ReportType = 
  'VIOLATION_DETAIL' | 
  'ENFORCEMENT_METRICS' | 
  'RESOLUTION_METRICS';

/**
 * Report format
 */
export type ReportFormat = 'CSV' | 'XLSX' | 'PDF';

/**
 * Search filter
 */
export interface SearchFilter {
  /**
   * Type of filter to apply
   */
  filterType: SearchFilterType;
  
  /**
   * Value to filter by
   */
  value: string;
}

/**
 * Brand Registry case
 */
export interface BrandCase {
  /**
   * Unique case identifier
   */
  caseId: string;
  
  /**
   * Current case status
   */
  status: CaseStatus;
  
  /**
   * Violation type
   */
  violationType: ViolationType;
  
  /**
   * ASIN affected by the case
   */
  asin?: string;
  
  /**
   * Name of the brand being protected
   */
  brandName?: string;
  
  /**
   * Title of the product
   */
  title?: string;
  
  /**
   * Brand registry ID
   */
  brandRegistryId?: string;
  
  /**
   * Date the case was created
   */
  createdDate: string;
  
  /**
   * Date the case was last modified
   */
  lastModifiedDate: string;
  
  /**
   * Notes or description about the case
   */
  description?: string;
  
  /**
   * Related evidence IDs
   */
  evidenceIds?: string[];
}

/**
 * Brand Registry evidence
 */
export interface BrandEvidence {
  /**
   * Unique evidence identifier
   */
  evidenceId: string;
  
  /**
   * Type of evidence
   */
  evidenceType: string;
  
  /**
   * URL to access the evidence
   */
  evidenceUrl?: string;
  
  /**
   * Date the evidence was uploaded
   */
  uploadDate: string;
  
  /**
   * Status of the evidence
   */
  status: string;
}

/**
 * Search cases response
 */
export interface SearchCasesResponse {
  /**
   * List of cases matching the search criteria
   */
  cases: BrandCase[];
  
  /**
   * Pagination token for the next page, if available
   */
  nextToken?: string;
}

/**
 * Create evidence response
 */
export interface CreateEvidenceResponse {
  /**
   * Unique evidence identifier
   */
  evidenceId: string;
  
  /**
   * Presigned URL to upload the evidence
   */
  uploadUrl: string;
  
  /**
   * Evidence status
   */
  status: string;
}

/**
 * Report response
 */
export interface ReportResponse {
  /**
   * Report ID
   */
  reportId: string;
  
  /**
   * Status of the report generation
   */
  status: string;
  
  /**
   * URL to download the report when ready
   */
  downloadUrl?: string;
}

/**
 * Case creation request
 */
export interface CreateCaseRequest {
  /**
   * Violation type
   */
  violationType: ViolationType;
  
  /**
   * ASIN affected by the violation
   */
  asin?: string;
  
  /**
   * Brand name being protected
   */
  brandName: string;
  
  /**
   * Description of the violation
   */
  description: string;
  
  /**
   * Evidence IDs to attach to the case
   */
  evidenceIds?: string[];
}

/**
 * Options for brand protection operations
 */
export interface BrandProtectionOptions {
  /**
   * Pagination token for list operations
   */
  nextToken?: string;
  
  /**
   * Maximum number of results to return
   */
  maxResults?: number;
  
  /**
   * Date range start for filtering
   */
  startDate?: string;
  
  /**
   * Date range end for filtering
   */
  endDate?: string;
  
  /**
   * Field to order results by
   */
  orderBy?: OrderBy;
  
  /**
   * Order direction (ascending or descending)
   */
  sortOrder?: SortOrder;
  
  /**
   * Specific brand registry ID to filter by
   */
  brandRegistryId?: string;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  method: string;
  path: string;
  params?: Record<string, string | string[] | number | boolean>;
  data?: any;
}

/**
 * Module options for brand protection
 */
export interface BrandProtectionModuleOptions {
  /**
   * Default brand registry ID to use
   */
  defaultBrandRegistryId?: string;
}

/**
 * Implementation of the Amazon Brand Protection API
 */
export class BrandProtectionModule extends ApiModule<BrandProtectionModuleOptions> implements BaseModule<BrandProtectionModuleOptions> {
  /**
   * The unique identifier for this module
   */
  readonly moduleId: string = 'amazon-brand-protection';
  
  /**
   * The human-readable name of this module
   */
  readonly moduleName: string = 'BrandProtection';
  
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
    options: BrandProtectionModuleOptions = {}
  ) {
    super(apiRequest, marketplaceId, options);
    this.apiVersion = apiVersion;
    this.basePath = `/brand-protection/${this.apiVersion}`;
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
   * Search for brand protection cases
   * @param filters Search filters to apply
   * @param options Search options
   * @returns Cases matching the search criteria
   */
  public async searchCases(
    filters: SearchFilter[],
    options: BrandProtectionOptions = {}
  ): Promise<ApiResponse<SearchCasesResponse>> {
    if (!filters || filters.length === 0) {
      throw AmazonErrorHandler.createError(
        'At least one search filter is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const params: Record<string, string | string[] | number> = {};
    
    if (options.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    if (options.maxResults) {
      params.maxResults = options.maxResults;
    }
    
    if (options.startDate) {
      params.startDate = options.startDate;
    }
    
    if (options.endDate) {
      params.endDate = options.endDate;
    }
    
    if (options.orderBy) {
      params.orderBy = options.orderBy;
    }
    
    if (options.sortOrder) {
      params.sortOrder = options.sortOrder;
    }
    
    return this.makeApiCall<SearchCasesResponse>({
      method: 'POST',
      path: '/cases/search',
      data: { filters },
      params
    });
  }
  
  /**
   * Get details for a specific case
   * @param caseId Unique case identifier
   * @returns Detailed case information
   */
  public async getCase(
    caseId: string
  ): Promise<ApiResponse<BrandCase>> {
    if (!caseId) {
      throw AmazonErrorHandler.createError(
        'Case ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<BrandCase>({
      method: 'GET',
      path: `/cases/${caseId}`
    });
  }
  
  /**
   * Create a new brand protection case
   * @param caseData Case details
   * @returns Created case details
   */
  public async createCase(
    caseData: CreateCaseRequest
  ): Promise<ApiResponse<BrandCase>> {
    if (!caseData) {
      throw AmazonErrorHandler.createError(
        'Case data is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!caseData.violationType) {
      throw AmazonErrorHandler.createError(
        'Violation type is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!caseData.brandName) {
      throw AmazonErrorHandler.createError(
        'Brand name is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<BrandCase>({
      method: 'POST',
      path: '/cases',
      data: caseData
    });
  }
  
  /**
   * Update an existing case
   * @param caseId Unique case identifier
   * @param updateData Data to update
   * @returns Updated case details
   */
  public async updateCase(
    caseId: string,
    updateData: Partial<CreateCaseRequest>
  ): Promise<ApiResponse<BrandCase>> {
    if (!caseId) {
      throw AmazonErrorHandler.createError(
        'Case ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!updateData || Object.keys(updateData).length === 0) {
      throw AmazonErrorHandler.createError(
        'Update data is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<BrandCase>({
      method: 'PATCH',
      path: `/cases/${caseId}`,
      data: updateData
    });
  }
  
  /**
   * Close a brand protection case
   * @param caseId Unique case identifier
   * @param reason Reason for closing the case
   * @returns Success response
   */
  public async closeCase(
    caseId: string,
    reason: string
  ): Promise<ApiResponse<void>> {
    if (!caseId) {
      throw AmazonErrorHandler.createError(
        'Case ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<void>({
      method: 'POST',
      path: `/cases/${caseId}/close`,
      data: { reason }
    });
  }
  
  /**
   * Get evidence associated with a case
   * @param caseId Unique case identifier
   * @returns Evidence records
   */
  public async getCaseEvidence(
    caseId: string
  ): Promise<ApiResponse<BrandEvidence[]>> {
    if (!caseId) {
      throw AmazonErrorHandler.createError(
        'Case ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<BrandEvidence[]>({
      method: 'GET',
      path: `/cases/${caseId}/evidence`
    });
  }
  
  /**
   * Create evidence for a brand protection case
   * @param caseId Unique case identifier
   * @param evidenceType Type of evidence
   * @returns Evidence creation response with upload URL
   */
  public async createEvidence(
    caseId: string,
    evidenceType: string
  ): Promise<ApiResponse<CreateEvidenceResponse>> {
    if (!caseId) {
      throw AmazonErrorHandler.createError(
        'Case ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!evidenceType) {
      throw AmazonErrorHandler.createError(
        'Evidence type is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<CreateEvidenceResponse>({
      method: 'POST',
      path: `/cases/${caseId}/evidence`,
      data: { evidenceType }
    });
  }
  
  /**
   * Delete evidence from a case
   * @param caseId Unique case identifier
   * @param evidenceId Unique evidence identifier
   * @returns Success response
   */
  public async deleteEvidence(
    caseId: string,
    evidenceId: string
  ): Promise<ApiResponse<void>> {
    if (!caseId) {
      throw AmazonErrorHandler.createError(
        'Case ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!evidenceId) {
      throw AmazonErrorHandler.createError(
        'Evidence ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<void>({
      method: 'DELETE',
      path: `/cases/${caseId}/evidence/${evidenceId}`
    });
  }
  
  /**
   * Generate a brand protection report
   * @param reportType Type of report to generate
   * @param format Report format
   * @param options Report options
   * @returns Report generation response
   */
  public async createReport(
    reportType: ReportType,
    format: ReportFormat,
    options: BrandProtectionOptions = {}
  ): Promise<ApiResponse<ReportResponse>> {
    if (!reportType) {
      throw AmazonErrorHandler.createError(
        'Report type is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!format) {
      throw AmazonErrorHandler.createError(
        'Report format is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const data: any = {
      reportType,
      format
    };
    
    if (options.startDate) {
      data.startDate = options.startDate;
    }
    
    if (options.endDate) {
      data.endDate = options.endDate;
    }
    
    if (options.brandRegistryId || this.options.defaultBrandRegistryId) {
      data.brandRegistryId = options.brandRegistryId || this.options.defaultBrandRegistryId;
    }
    
    return this.makeApiCall<ReportResponse>({
      method: 'POST',
      path: '/reports',
      data
    });
  }
  
  /**
   * Get report status and download URL
   * @param reportId Unique report identifier
   * @returns Report status and download URL
   */
  public async getReport(
    reportId: string
  ): Promise<ApiResponse<ReportResponse>> {
    if (!reportId) {
      throw AmazonErrorHandler.createError(
        'Report ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.makeApiCall<ReportResponse>({
      method: 'GET',
      path: `/reports/${reportId}`
    });
  }
  
  /**
   * Check if a brand registry ID is valid
   * @param brandRegistryId Brand registry ID to check
   * @returns Whether the brand registry ID is valid
   */
  public async validateBrandRegistryId(
    brandRegistryId: string
  ): Promise<boolean> {
    if (!brandRegistryId) {
      throw AmazonErrorHandler.createError(
        'Brand registry ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      await this.makeApiCall<any>({
        method: 'GET',
        path: '/brands/validate',
        params: { brandRegistryId }
      });
      
      return true;
    } catch (error) {
      if (error.code === AmazonErrorCode.RESOURCE_NOT_FOUND) {
        return false;
      }
      
      throw error;
    }
  }
  
  /**
   * Get all cases with automatic pagination
   * @param filters Search filters to apply
   * @param options Search options
   * @returns All cases matching the search criteria
   */
  public async getAllCases(
    filters: SearchFilter[],
    options: BrandProtectionOptions = {}
  ): Promise<BrandCase[]> {
    const allCases: BrandCase[] = [];
    let nextToken: string | undefined = undefined;
    
    do {
      const response = await this.searchCases(filters, {
        ...options,
        nextToken
      });
      
      allCases.push(...response.data.cases);
      nextToken = response.data.nextToken;
    } while (nextToken);
    
    return allCases;
  }
  
  /**
   * Get all cases for a specific ASIN
   * @param asin ASIN to search for
   * @param options Search options
   * @returns All cases matching the ASIN
   */
  public async getCasesByAsin(
    asin: string,
    options: BrandProtectionOptions = {}
  ): Promise<BrandCase[]> {
    if (!asin) {
      throw AmazonErrorHandler.createError(
        'ASIN is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const filters: SearchFilter[] = [
      {
        filterType: 'ASIN',
        value: asin
      }
    ];
    
    return this.getAllCases(filters, options);
  }
  
  /**
   * Get all cases for a specific brand name
   * @param brandName Brand name to search for
   * @param options Search options
   * @returns All cases matching the brand name
   */
  public async getCasesByBrandName(
    brandName: string,
    options: BrandProtectionOptions = {}
  ): Promise<BrandCase[]> {
    if (!brandName) {
      throw AmazonErrorHandler.createError(
        'Brand name is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const filters: SearchFilter[] = [
      {
        filterType: 'BRAND_NAME',
        value: brandName
      }
    ];
    
    return this.getAllCases(filters, options);
  }
  
  /**
   * Wait for a report to be generated and get the download URL
   * @param reportId Report ID to check
   * @param maxAttempts Maximum number of attempts (default: 10)
   * @param intervalMs Time between attempts in milliseconds (default: 1000)
   * @returns Report with download URL
   */
  public async waitForReport(
    reportId: string,
    maxAttempts = 10,
    intervalMs = 1000
  ): Promise<ReportResponse> {
    if (!reportId) {
      throw AmazonErrorHandler.createError(
        'Report ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const response = await this.getReport(reportId);
      const report = response.data;
      
      if (report.status === 'COMPLETED' && report.downloadUrl) {
        return report;
      }
      
      if (report.status === 'FAILED') {
        throw AmazonErrorHandler.createError(
          'Report generation failed',
          AmazonErrorCode.OPERATION_FAILED
        );
      }
      
      // Wait for the next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }
    
    throw AmazonErrorHandler.createError(
      `Report not ready after ${maxAttempts} attempts`,
      AmazonErrorCode.OPERATION_TIMEOUT
    );
  }
}
