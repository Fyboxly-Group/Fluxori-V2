/**
 * Amazon Reports Module
 * 
 * Handles creation, polling, and downloading of Amazon SP-API reports
 * Supports various report types for inventory, orders, financial data, etc.
 */

import { AxiosError } from 'axios';
import { AmazonErrorHandler, AmazonErrorCode } from '../utils/amazon-error';
import { sleep } from '../utils/batch-processor';

/**
 * Amazon report types
 * Common report types that can be requested via the Amazon Reports API
 */
export enum AmazonReportType {
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
  reportType: AmazonReportType | string;
  
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
 * Interface for the Amazon Reports client
 */
export interface AmazonReportsClient {
  /**
   * Request a report from Amazon
   * @param params Report request parameters
   * @returns Report response with reportId
   */
  createReport(params: ReportRequestParams): Promise<ReportResponse>;
  
  /**
   * Check the status of a report
   * @param reportId ID of the report to check
   * @returns Current report status
   */
  getReportStatus(reportId: string): Promise<ReportResponse>;
  
  /**
   * Download a report's contents
   * @param reportDocumentId Document ID for the report
   * @returns Report data and content type
   */
  downloadReport(reportDocumentId: string): Promise<{ reportData: string; contentType: string; }>;
  
  /**
   * List reports that have been requested
   * @param reportTypes Optional filter for report types
   * @param processingStatuses Optional filter for processing statuses
   * @param createdSince Optional filter for reports created after this date
   * @param createdUntil Optional filter for reports created before this date
   * @param nextToken Optional pagination token
   * @param maxResults Maximum number of results to return
   * @returns List of reports
   */
  listReports(
    reportTypes?: (AmazonReportType | string)[],
    processingStatuses?: ReportProcessingStatus[],
    createdSince?: Date,
    createdUntil?: Date,
    nextToken?: string,
    maxResults?: number
  ): Promise<{
    reports: ReportResponse[];
    nextToken?: string;
  }>;
  
  /**
   * Request a report and wait for it to complete
   * @param params Report request parameters
   * @param pollIntervalMs Milliseconds to wait between status checks (default: 5000)
   * @param timeoutMs Maximum milliseconds to wait (default: 300000)
   * @returns Complete report data
   */
  createAndWaitForReport(
    params: ReportRequestParams, 
    pollIntervalMs?: number, 
    timeoutMs?: number
  ): Promise<ReportResponse>;
  
  /**
   * Cancel a report that is in progress
   * @param reportId ID of the report to cancel
   * @returns Success status
   */
  cancelReport(reportId: string): Promise<boolean>;
  
  /**
   * Parse report data based on content type
   * @param reportData Raw report data
   * @param contentType Content type of the report
   * @returns Parsed report data
   */
  parseReport(reportData: string, contentType: string): any;
}

/**
 * Request options for API calls
 */
export interface ApiRequestOptions {
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  directUrl?: boolean;
  parseResponse?: boolean;
}

/**
 * API response type
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

/**
 * Make request function type
 */
export type MakeRequestFunction = <T = any>(
  method: string,
  path: string,
  options?: ApiRequestOptions
) => Promise<ApiResponse<T>>;

/**
 * Amazon reports client implementation
 * Handles creating, checking, and downloading reports from Amazon SP-API
 */
export class AmazonReportsClient implements AmazonReportsClient {
  private readonly apiPath: string;
  
  /**
   * Constructor
   * @param makeRequest Function to make SP-API requests
   * @param amazonMarketplaceId Default marketplace ID
   * @param apiVersion Reports API version
   */
  constructor(
    private readonly makeRequest: MakeRequestFunction,
    private readonly amazonMarketplaceId: string,
    private readonly apiVersion: string = '2021-06-30'
  ) {
    this.apiPath = `/reports/${this.apiVersion}`;
  }
  
  /**
   * Request a report from Amazon
   * @param params Report request parameters
   * @returns Report response with reportId
   */
  async createReport(params: ReportRequestParams): Promise<ReportResponse> {
    try {
      const { reportType, dataStartTime, dataEndTime, marketplaceIds, reportOptions } = params;
      
      // Validate required parameters
      if (!reportType) {
        throw AmazonErrorHandler.createError(
          'Report type is required',
          AmazonErrorCode.INVALID_INPUT
        );
      }
      
      // Prepare request body
      const requestBody: Record<string, any> = {
        reportType,
        marketplaceIds: marketplaceIds || [this.amazonMarketplaceId]
      };
      
      // Add optional parameters if provided
      if (dataStartTime) {
        requestBody.dataStartTime = dataStartTime.toISOString();
      }
      
      if (dataEndTime) {
        requestBody.dataEndTime = dataEndTime.toISOString();
      }
      
      if (reportOptions) {
        requestBody.reportOptions = reportOptions;
      }
      
      // Call the SP-API to create the report
      const response = await this.makeRequest<{
        reportId: string;
        processingStatus: string;
        createdTime: string;
      }>(
        'POST',
        `${this.apiPath}/reports`,
        {
          data: requestBody
        }
      );
      
      // Map the API response to our ReportResponse interface
      const result = response.data;
      
      return {
        reportId: result.reportId,
        processingStatus: result.processingStatus as ReportProcessingStatus,
        createdTime: new Date(result.createdTime),
        reportType
      };
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to create report: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * Check the status of a report
   * @param reportId ID of the report to check
   * @returns Current report status
   */
  async getReportStatus(reportId: string): Promise<ReportResponse> {
    try {
      // Validate required parameters
      if (!reportId) {
        throw AmazonErrorHandler.createError(
          'Report ID is required',
          AmazonErrorCode.INVALID_INPUT
        );
      }
      
      const response = await this.makeRequest<{
        reportId: string;
        processingStatus: string;
        createdTime: string;
        completedTime?: string;
        reportDocumentId?: string;
        reportType: string;
      }>(
        'GET',
        `${this.apiPath}/reports/${reportId}`
      );
      
      const result = response.data;
      
      return {
        reportId: result.reportId,
        processingStatus: result.processingStatus as ReportProcessingStatus,
        createdTime: new Date(result.createdTime),
        completedTime: result.completedTime ? new Date(result.completedTime) : undefined,
        reportDocumentId: result.reportDocumentId,
        reportType: result.reportType
      };
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to get report status: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * Download a report's contents
   * @param reportDocumentId Document ID for the report
   * @returns Report data and content type
   */
  async downloadReport(reportDocumentId: string): Promise<{ reportData: string; contentType: string; }> {
    try {
      // Validate required parameters
      if (!reportDocumentId) {
        throw AmazonErrorHandler.createError(
          'Report Document ID is required',
          AmazonErrorCode.INVALID_INPUT
        );
      }
      
      // First, get the document details (which contains the download URL)
      const documentResponse = await this.makeRequest<ReportDocument>(
        'GET',
        `${this.apiPath}/documents/${reportDocumentId}`
      );
      
      const documentDetails = documentResponse.data;
      const downloadUrl = documentDetails.url;
      const contentType = documentDetails.contentType || 'text/plain';
      
      // Download the actual report
      const reportResponse = await this.makeRequest<string>(
        'GET',
        downloadUrl,
        {
          directUrl: true,
          parseResponse: false
        }
      );
      
      // If the report is compressed, we would decompress it here
      // This is a simplified example - in a real implementation, we would handle compression
      let reportData = reportResponse.data;
      
      if (documentDetails.compressionAlgorithm === 'GZIP') {
        // In a real implementation, decompress the data using a library like zlib
        console.log('Report is compressed with GZIP - decompression needed');
      }
      
      return { reportData, contentType };
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to download report: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * List reports that have been requested
   * @param reportTypes Optional filter for report types
   * @param processingStatuses Optional filter for processing statuses
   * @param createdSince Optional filter for reports created after this date
   * @param createdUntil Optional filter for reports created before this date
   * @param nextToken Optional pagination token
   * @param maxResults Maximum number of results to return
   * @returns List of reports
   */
  async listReports(
    reportTypes?: (AmazonReportType | string)[],
    processingStatuses?: ReportProcessingStatus[],
    createdSince?: Date,
    createdUntil?: Date,
    nextToken?: string,
    maxResults: number = 10
  ): Promise<{
    reports: ReportResponse[];
    nextToken?: string;
  }> {
    try {
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
      
      // Make the API call
      const response = await this.makeRequest<{
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
        `${this.apiPath}/reports`,
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
        reports,
        nextToken: result.nextToken
      };
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to list reports: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
  
  /**
   * Request a report and wait for it to complete
   * @param params Report request parameters
   * @param pollIntervalMs Milliseconds to wait between status checks (default: 5000)
   * @param timeoutMs Maximum milliseconds to wait (default: 300000)
   * @returns Complete report data
   */
  async createAndWaitForReport(
    params: ReportRequestParams,
    pollIntervalMs: number = 5000,
    timeoutMs: number = 300000
  ): Promise<ReportResponse> {
    try {
      // Create the report
      const report = await this.createReport(params);
      
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
        currentReport = await this.getReportStatus(report.reportId);
      }
      
      // Check if report completed successfully
      if (currentReport.processingStatus !== ReportProcessingStatus.DONE) {
        throw AmazonErrorHandler.createError(
          `Report processing failed with status: ${currentReport.processingStatus}`,
          AmazonErrorCode.OPERATION_FAILED
        );
      }
      
      // Download the report if available
      if (currentReport.reportDocumentId) {
        const { reportData, contentType } = await this.downloadReport(currentReport.reportDocumentId);
        currentReport.reportData = reportData;
        currentReport.contentType = contentType;
      }
      
      return currentReport;
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to create and wait for report: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.OPERATION_FAILED,
        error
      );
    }
  }
  
  /**
   * Cancel a report that is in progress
   * @param reportId ID of the report to cancel
   * @returns Success status
   */
  async cancelReport(reportId: string): Promise<boolean> {
    try {
      // Validate required parameters
      if (!reportId) {
        throw AmazonErrorHandler.createError(
          'Report ID is required',
          AmazonErrorCode.INVALID_INPUT
        );
      }
      
      await this.makeRequest(
        'DELETE',
        `${this.apiPath}/reports/${reportId}`
      );
      
      return true;
    } catch (error) {
      // If the report can't be cancelled, return false
      console.warn(`Failed to cancel report ${reportId}: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
  
  /**
   * Get all reports of a specific type
   * @param reportType Type of reports to retrieve
   * @param maxResults Maximum number of reports to retrieve
   * @returns List of reports
   */
  async getRecentReportsByType(
    reportType: AmazonReportType | string,
    maxResults: number = 10
  ): Promise<ReportResponse[]> {
    const response = await this.listReports([reportType], undefined, undefined, undefined, undefined, maxResults);
    return response.reports;
  }
  
  /**
   * Get the most recent completed report of a specific type
   * @param reportType Type of report to retrieve
   * @returns Most recent completed report or null if none found
   */
  async getMostRecentCompletedReport(reportType: AmazonReportType | string): Promise<ReportResponse | null> {
    try {
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
        const { reportData, contentType } = await this.downloadReport(mostRecent.reportDocumentId);
        mostRecent.reportData = reportData;
        mostRecent.contentType = contentType;
      }
      
      return mostRecent;
    } catch (error) {
      throw AmazonErrorHandler.createError(
        `Failed to get most recent completed report: ${error instanceof Error ? error.message : String(error)}`,
        AmazonErrorCode.OPERATION_FAILED,
        error
      );
    }
  }
  
  /**
   * Parse a report based on its content type
   * @param reportData Raw report data
   * @param contentType Content type of the report
   * @returns Parsed report data
   */
  parseReport(reportData: string, contentType: string): any {
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