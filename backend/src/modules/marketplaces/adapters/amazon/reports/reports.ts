/**
 * Amazon Reports API Module
 * 
 * Implements the Amazon SP-API Reports API functionality.
 * This module handles report creation, monitoring, and retrieval.
 */

import { ApiRequestFunction, ApiResponse, BaseModule } from '../../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../../utils/amazon-error';
import { sleep } from '../../../utils/batch-processor';

/**
 * Amazon report types
 * Common report types that can be requested via the Amazon Reports API
 */
export enum ReportType {
  // Inventory Reports
  INVENTORY_REPORT = 'GET_FLAT_FILE_OPEN_LISTINGS_DATA',
  INVENTORY_REPORT_XML = 'GET_MERCHANT_LISTINGS_ALL_DATA',
  INVENTORY_REPORT_LITE = 'GET_MERCHANT_LISTINGS_DATA_LITE',
  FBA_INVENTORY_REPORT = 'GET_FBA_INVENTORY_AGED_DATA',
  FBA_MANAGED_INVENTORY_REPORT = 'GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA',
  STRANDED_INVENTORY_REPORT = 'GET_STRANDED_INVENTORY_UI_DATA',
  EXCESS_INVENTORY_REPORT = 'GET_EXCESS_INVENTORY_DATA',
  
  // Order Reports
  ORDER_REPORT = 'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL',
  ORDER_REPORT_XML = 'GET_ORDERS_DATA_BY_ORDER_DATE',
  ORDER_ITEMS_REPORT = 'GET_FLAT_FILE_ORDER_REPORT_DATA_SHIPPING',
  FBA_RETURNS_REPORT = 'GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA',
  
  // Financial Reports
  FINANCIAL_TRANSACTION_REPORT = 'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
  DATE_RANGE_FINANCIAL_REPORT = 'GET_DATE_RANGE_FINANCIAL_TRANSACTION_DATA',
  FBA_REIMBURSEMENTS_REPORT = 'GET_FBA_REIMBURSEMENTS_DATA',
  
  // Performance Reports
  PERFORMANCE_REPORT = 'GET_V1_SELLER_PERFORMANCE_REPORT',
  FEEDBACK_REPORT = 'GET_SELLER_FEEDBACK_DATA',
  
  // Advertising Reports
  CAMPAIGN_PERFORMANCE_REPORT = 'GET_CAMPAIGN_PERFORMANCE_REPORT',
  SEARCH_TERM_REPORT = 'GET_SEARCH_TERM_REPORT',
  
  // Tax Reports
  TAX_REPORT = 'GET_TAX_REPORT',
  VAT_TRANSACTION_REPORT = 'GET_VAT_TRANSACTION_DATA',
  
  // Browse Tree Reports
  BROWSE_TREE_REPORT = 'GET_XML_BROWSE_TREE_DATA'
}

/**
 * Amazon report processing status
 */
export enum ReportProcessingStatus {
  IN_QUEUE = 'IN_QUEUE',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
  FATAL = 'FATAL'
}

/**
 * Amazon report request parameters
 */
export interface ReportRequestParams {
  /**
   * Type of report to request
   */
  reportType: ReportType | string;
  
  /**
   * Start date for report data
   */
  dataStartTime?: Date;
  
  /**
   * End date for report data
   */
  dataEndTime?: Date;
  
  /**
   * Marketplace IDs to include in the report
   */
  marketplaceIds?: string[];
  
  /**
   * Additional report-specific options
   */
  reportOptions?: Record<string, string>;
}

/**
 * Amazon report document interface
 */
export interface ReportDocument {
  /**
   * Document ID for the report
   */
  reportDocumentId: string;
  
  /**
   * URL to download the report
   */
  url: string;
  
  /**
   * Compression algorithm used (if any)
   */
  compressionAlgorithm?: string;
  
  /**
   * Content type of the report (e.g., text/csv)
   */
  contentType?: string;
}

/**
 * Amazon report response
 */
export interface ReportResponse {
  /**
   * Report ID
   */
  reportId: string;
  
  /**
   * Processing status of the report
   */
  processingStatus: ReportProcessingStatus;
  
  /**
   * Time the report was requested
   */
  createdTime: Date;
  
  /**
   * Time the report processing completed (if done)
   */
  completedTime?: Date;
  
  /**
   * Document ID where the report can be downloaded (if available)
   */
  reportDocumentId?: string;
  
  /**
   * Type of the report
   */
  reportType: string;
  
  /**
   * Raw report data (when downloaded)
   */
  reportData?: string;
  
  /**
   * Report content type (e.g. 'text/csv', 'text/tab-separated-values', 'application/json')
   */
  contentType?: string;
}

/**
 * Reports module options
 */
export interface ReportsModuleOptions {
  /**
   * Default polling interval for waiting for reports (milliseconds)
   */
  defaultPollInterval?: number;
  
  /**
   * Default timeout for waiting for reports (milliseconds)
   */
  defaultTimeout?: number;
  
  /**
   * Default page size for listing reports
   */
  defaultPageSize?: number;
}

/**
 * Implementation of the Amazon Reports API
 */
export class ReportsModule implements BaseModule<ReportsModuleOptions> {
  /**
   * The unique identifier for this module
   */
  public readonly moduleId: string = 'reports';
  
  /**
   * The human-readable name of this module
   */
  public readonly moduleName: string = 'Reports';
  
  /**
   * The base URL path for API requests
   */
  public readonly basePath: string;
  
  /**
   * API version
   */
  public readonly apiVersion: string;
  
  /**
   * Marketplace ID
   */
  public readonly marketplaceId: string;
  
  /**
   * Additional configuration options for this module
   */
  public readonly options: ReportsModuleOptions = {
    defaultPollInterval: 5000,
    defaultTimeout: 300000,
    defaultPageSize: 10
  };
  
  /**
   * The API request function used by this module
   */
  public readonly apiRequest: ApiRequestFunction;
  
  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param options Optional module-specific configuration
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options?: ReportsModuleOptions
  ) {
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
    this.basePath = `/reports/${apiVersion}`;
    
    if (options) {
      this.options = {
        ...this.options,
        ...options
      };
    }
  }
  
  /**
   * Create a report request
   * @param params Parameters for the report request
   * @returns Report creation response
   */
  public async createReport(params: ReportRequestParams): Promise<ApiResponse<ReportResponse>> {
    if (!params.reportType) {
      throw AmazonErrorHandler.createError(
        'Report type is required', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    // Prepare request body
    const requestBody: Record<string, any> = {
      reportType: params.reportType,
      marketplaceIds: params.marketplaceIds || [this.marketplaceId]
    };
    
    // Add optional parameters if provided
    if (params.dataStartTime) {
      requestBody.dataStartTime = params.dataStartTime.toISOString();
    }
    
    if (params.dataEndTime) {
      requestBody.dataEndTime = params.dataEndTime.toISOString();
    }
    
    if (params.reportOptions) {
      requestBody.reportOptions = params.reportOptions;
    }
    
    try {
      const response = await this.apiRequest<{
        reportId: string;
        processingStatus: string;
        createdTime: string;
      }>(
        'POST',
        `${this.basePath}/reports`,
        {
          data: requestBody
        }
      );
      
      const result = response.data;
      
      return {
        data: {
          reportId: result.reportId,
          processingStatus: result.processingStatus as ReportProcessingStatus,
          createdTime: new Date(result.createdTime),
          reportType: params.reportType
        },
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get a report's status
   * @param reportId ID of the report to check
   * @returns Report status
   */
  public async getReportStatus(reportId: string): Promise<ApiResponse<ReportResponse>> {
    if (!reportId) {
      throw AmazonErrorHandler.createError(
        'Report ID is required', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest<{
        reportId: string;
        processingStatus: string;
        createdTime: string;
        completedTime?: string;
        reportDocumentId?: string;
        reportType: string;
      }>(
        'GET',
        `${this.basePath}/reports/${encodeURIComponent(reportId)}`
      );
      
      const result = response.data;
      
      return {
        data: {
          reportId: result.reportId,
          processingStatus: result.processingStatus as ReportProcessingStatus,
          createdTime: new Date(result.createdTime),
          completedTime: result.completedTime ? new Date(result.completedTime) : undefined,
          reportDocumentId: result.reportDocumentId,
          reportType: result.reportType
        },
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Cancel a report request
   * @param reportId ID of the report to cancel
   * @returns Success status
   */
  public async cancelReport(reportId: string): Promise<ApiResponse<boolean>> {
    if (!reportId) {
      throw AmazonErrorHandler.createError(
        'Report ID is required', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest<void>(
        'DELETE',
        `${this.basePath}/reports/${encodeURIComponent(reportId)}`
      );
      
      return {
        data: true,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      // If the report can't be cancelled, return false but don't throw an error
      return {
        data: false,
        status: 200,
        headers: {}
      };
    }
  }
  
  /**
   * Download a report document
   * @param documentId ID of the report document to download
   * @returns Report document data
   */
  public async getReportDocument(documentId: string): Promise<ApiResponse<ReportDocument>> {
    if (!documentId) {
      throw AmazonErrorHandler.createError(
        'Document ID is required', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.apiRequest<ReportDocument>(
        'GET',
        `${this.basePath}/documents/${encodeURIComponent(documentId)}`
      );
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * List reports based on various filters
   * @param reportTypes Optional filter for report types
   * @param processingStatuses Optional filter for processing statuses
   * @param createdSince Optional filter for reports created after this date
   * @param createdUntil Optional filter for reports created before this date
   * @param nextToken Optional pagination token
   * @param maxResults Maximum number of results to return
   * @returns List of reports
   */
  public async listReports(
    reportTypes?: (ReportType | string)[],
    processingStatuses?: ReportProcessingStatus[],
    createdSince?: Date,
    createdUntil?: Date,
    nextToken?: string,
    maxResults: number = 10
  ): Promise<ApiResponse<{
    reports: ReportResponse[];
    nextToken?: string;
  }>> {
    // Prepare query parameters
    const params: Record<string, any> = {
      pageSize: maxResults
    };
    
    if (reportTypes && reportTypes.length > 0) {
      params.reportTypes = reportTypes.join(',');
    }
    
    if (processingStatuses && processingStatuses.length > 0) {
      params.processingStatuses = processingStatuses.join(',');
    }
    
    if (createdSince) {
      params.createdSince = createdSince.toISOString();
    }
    
    if (createdUntil) {
      params.createdUntil = createdUntil.toISOString();
    }
    
    if (nextToken) {
      params.nextToken = nextToken;
    }
    
    try {
      const response = await this.apiRequest<{
        reports: Array<{
          reportId: string;
          processingStatus: string;
          createdTime: string;
          completedTime?: string;
          reportDocumentId?: string;
          reportType: string;
        }>;
        nextToken?: string;
      }>(
        'GET',
        `${this.basePath}/reports`,
        { params }
      );
      
      const result = response.data;
      const reports = result.reports.map(report => ({
        reportId: report.reportId,
        processingStatus: report.processingStatus as ReportProcessingStatus,
        createdTime: new Date(report.createdTime),
        completedTime: report.completedTime ? new Date(report.completedTime) : undefined,
        reportDocumentId: report.reportDocumentId,
        reportType: report.reportType
      }));
      
      return {
        data: { 
          reports, 
          nextToken: result.nextToken
        },
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Create a report and wait for it to complete
   * @param params Report request parameters
   * @param pollIntervalMs Milliseconds to wait between status checks
   * @param timeoutMs Maximum milliseconds to wait
   * @returns Complete report data
   */
  public async createAndWaitForReport(
    params: ReportRequestParams, 
    pollIntervalMs: number = this.options.defaultPollInterval || 5000, 
    timeoutMs: number = this.options.defaultTimeout || 300000
  ): Promise<ReportResponse> {
    // Create the report
    const reportResponse = await this.createReport(params);
    const report = reportResponse.data;
    
    // Calculate timeout end time
    const endTime = Date.now() + timeoutMs;
    
    // Poll for report completion
    let currentReport = report;
    
    while (
      currentReport.processingStatus !== ReportProcessingStatus.DONE &&
      currentReport.processingStatus !== ReportProcessingStatus.CANCELLED &&
      currentReport.processingStatus !== ReportProcessingStatus.FATAL
    ) {
      // Check for timeout
      if (Date.now() >= endTime) {
        throw AmazonErrorHandler.createError(
          `Report processing timed out after ${timeoutMs}ms`, 
          AmazonErrorCode.OPERATION_TIMEOUT
        );
      }
      
      // Wait for the polling interval
      await sleep(pollIntervalMs);
      
      // Check report status
      const statusResponse = await this.getReportStatus(report.reportId);
      currentReport = statusResponse.data;
    }
    
    // Check if report completed successfully
    if (currentReport.processingStatus !== ReportProcessingStatus.DONE) {
      throw AmazonErrorHandler.createError(
        `Report processing failed with status: ${currentReport.processingStatus}`, 
        AmazonErrorCode.OPERATION_FAILED
      );
    }
    
    // If the report has a document, get the document details
    if (currentReport.reportDocumentId) {
      const documentResponse = await this.getReportDocument(currentReport.reportDocumentId);
      const documentDetails = documentResponse.data;
      
      // Download the report data from the URL
      // This is a direct download from the provided URL
      try {
        const downloadResponse = await this.apiRequest<string>(
          'GET',
          documentDetails.url,
          {
            directUrl: true,
            parseResponse: false
          }
        );
        
        let reportData = downloadResponse.data;
        
        // Handle compression if needed
        if (documentDetails.compressionAlgorithm === 'GZIP') {
          // In a real implementation, decompress the data
          // For this example, we'll just note that it would be decompressed
          console.log('Report is compressed with GZIP - decompression needed');
        }
        
        currentReport.reportData = reportData;
        currentReport.contentType = documentDetails.contentType;
      } catch (error) {
        throw AmazonErrorHandler.createError(
          `Failed to download report: ${error instanceof Error ? error.message : String(error)}`,
          AmazonErrorCode.SERVICE_UNAVAILABLE,
          error
        );
      }
    }
    
    return currentReport;
  }
  
  /**
   * Get all reports of a specific type
   * @param reportType Type of reports to retrieve
   * @param maxResults Maximum number of reports to retrieve
   * @returns List of reports
   */
  public async getRecentReportsByType(
    reportType: ReportType | string, 
    maxResults: number = 10
  ): Promise<ReportResponse[]> {
    const response = await this.listReports([reportType], undefined, undefined, undefined, undefined, maxResults);
    return response.data.reports;
  }
  
  /**
   * Get the most recent completed report of a specific type
   * @param reportType Type of report to retrieve
   * @returns Most recent completed report or null if none found
   */
  public async getMostRecentCompletedReport(reportType: ReportType | string): Promise<ReportResponse | null> {
    const reports = await this.getRecentReportsByType(reportType, 10);
    
    // Find the most recent completed report
    const completedReports = reports.filter(report => 
      report.processingStatus === ReportProcessingStatus.DONE && 
      report.reportDocumentId !== undefined
    );
    
    if (completedReports.length === 0) {
      return null;
    }
    
    // Sort by completedTime (most recent first)
    completedReports.sort((a, b) => {
      const timeA = a.completedTime ? a.completedTime.getTime() : 0;
      const timeB = b.completedTime ? b.completedTime.getTime() : 0;
      return timeB - timeA;
    });
    
    // Get the most recent report
    const mostRecent = completedReports[0];
    
    // Download the report data
    if (mostRecent.reportDocumentId && !mostRecent.reportData) {
      const documentResponse = await this.getReportDocument(mostRecent.reportDocumentId);
      const documentDetails = documentResponse.data;
      
      // Download the report data
      const downloadResponse = await this.apiRequest<string>(
        'GET',
        documentDetails.url,
        {
          directUrl: true,
          parseResponse: false
        }
      );
      
      mostRecent.reportData = downloadResponse.data;
      mostRecent.contentType = documentDetails.contentType;
    }
    
    return mostRecent;
  }
  
  /**
   * Parse a report based on its content type
   * @param reportData Raw report data
   * @param contentType Content type of the report
   * @returns Parsed report data
   */
  public parseReport(reportData: string, contentType: string): any {
    if (!reportData) {
      return null;
    }
    
    // Parse based on content type
    switch (contentType) {
      case 'application/json':
        return JSON.parse(reportData);
        
      case 'text/csv':
        return this.parseCsv(reportData);
        
      case 'text/tab-separated-values':
      case 'text/tsv':
        return this.parseTsv(reportData);
        
      case 'text/xml':
      case 'application/xml':
        // In a real implementation, we would parse XML here
        console.warn('XML parsing not implemented in this simplified example');
        return reportData;
        
      default:
        // For other types, return the raw data
        return reportData;
    }
  }
  
  /**
   * Parse CSV data
   * @param csvData Raw CSV data
   * @returns Parsed CSV as array of objects
   */
  private parseCsv(csvData: string): Record<string, string>[] {
    // Simple CSV parser - in a real implementation, use a proper CSV parser library
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines
      .slice(1)
      .filter(line => line.trim().length > 0)
      .map(line => {
        const values = line.split(',');
        const record: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index]?.trim() || '';
        });
        
        return record;
      });
  }
  
  /**
   * Parse TSV data
   * @param tsvData Raw TSV data
   * @returns Parsed TSV as array of objects
   */
  private parseTsv(tsvData: string): Record<string, string>[] {
    // Same as CSV but with tab separator
    const lines = tsvData.split('\n');
    const headers = lines[0].split('\t').map(header => header.trim());
    
    return lines
      .slice(1)
      .filter(line => line.trim().length > 0)
      .map(line => {
        const values = line.split('\t');
        const record: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index]?.trim() || '';
        });
        
        return record;
      });
  }
}