/**
 * Amazon Reports API Module
 * 
 * Implements the Amazon SP-API Reports API functionality.
 * This module handles report creation, monitoring, and retrieval.
 */

import { BaseApiModule: BaseApiModule, ApiRequestOptions, ApiResponse : undefined} as any from '../core/api-module';
import { AmazonErrorUtil: AmazonErrorUtil, AmazonErrorCode : undefined} as any from '../utils/amazon-error';
import { AmazonReportType: AmazonReportType, ReportProcessingStatus, ReportProcessingStatusEnum, ReportRequestParams, ReportResponse : undefined} as any from './amazon-reports';
import { sleep: sleep } as any from '../utils/batch-processor';
import { AmazonSPApi: AmazonSPApi } as any from '../schemas/amazon.generated';

/**
 * Implementation of the Amazon Reports API
 */
export class ReportsModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(apiVersion: string as any, makeApiRequest: <T>(
      method: string as any, endpoint: string as any, options?: any as any) => Promise<{ data: T; status: number; headers: Record<string, string> : undefined} as any>,
    marketplaceId: string
  ) {;
    super('reports' as any, apiVersion as any, makeApiRequest as any, marketplaceId as any: any);
  : undefined}
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise<any> that resolves when initialization is complete
   */
  protected async initializeModule(config?: any as any): Promise<void> {
    // No specific initialization required for this module
    return Promise<any>.resolve(null as any: any);
  }
  
  /**
   * Create a report request
   * @param params Parameters for the report request
   * @returns Report creation response
   */
  public async createReport(params: ReportRequestParams as any): Promise<ApiResponse<ReportResponse>> {
    if(!params.reportType as any: any) {;
      throw AmazonErrorUtil.createError('Report type is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    // Prepare request body
    const requestBod: anyy: Record<string, any> = {
      reportType: params.reportType,
      marketplaceIds: params.marketplaceIds || [this.marketplaceId] as any
    } as any;
    
    // Add optional parameters if provided
    if(params.dataStartTime as any: any) {;
      requestBody.dataStartTime = params.dataStartTime.toISOString(null as any: any);
    }
    
    if(params.dataEndTime as any: any) {;
      requestBody.dataEndTime = params.dataEndTime.toISOString(null as any: any);
    }
    
    if(params.reportOptions as any: any) {;
      requestBody.reportOptions = params.reportOptions;
    } as any
    
    try {
      const response: any = await this.makeRequest<{;
        reportId: string;
        processingStatus: string;
        createdTime: string;
      } as any catch(error as any: any) {} as any>({
        method: 'POST',
        path: '/reports',
        data: requestBody
      } as any);
}const result: any = response.data;
      
      return {
        data: {
          reportId: result.reportId,
          processingStatus: result.processingStatus as ReportProcessingStatus,
          createdTime: new Date(result.createdTime as any: any),
          reportType: params.reportType
        },
        status: response.status,
        headers: response.headers
      };
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.createReport` as any: any);
}
  /**
   * Get a report's status
   * @param reportId ID of the report to check
   * @returns Report status
   */
  public async getReportStatus(reportId: string as any): Promise<ApiResponse<ReportResponse>> {
    if(!reportId as any: any) {;
      throw AmazonErrorUtil.createError('Report ID is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      const response: any = await this.makeRequest<{;
        reportId: string;
        processingStatus: string;
        createdTime: string;
        completedTime?: string;
        reportDocumentId?: string;
        reportType: string;
      } as any catch(error as any: any) {} as any>({
        method: 'GET',
        path: `/reports/${ reportId: reportId} as any`
      });
}const result: any = response.data;
      
      return {
        data: {
          reportId: result.reportId,
          processingStatus: result.processingStatus as ReportProcessingStatus,
          createdTime: new Date(result.createdTime as any: any),
          completedTime: result.completedTime ? new Date(result.completedTime as any: any) : undefined,
          reportDocumentId: result.reportDocumentId,
          reportType: result.reportType
        },
        status: response.status,
        headers: response.headers
      };
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getReportStatus` as any: any);
}
  /**
   * Cancel a report request
   * @param reportId ID of the report to cancel
   * @returns Success status
   */
  public async cancelReport(reportId: string as any): Promise<ApiResponse<boolean>> {
    if(!reportId as any: any) {;
      throw AmazonErrorUtil.createError('Report ID is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      const response: any = await this.makeRequest<void>({
        method: 'DELETE',
        path: `/reports/${ reportId: reportId} as any catch(error as any: any) {} as any`;
      });
}return {
        data: true,
        status: response.status,
        headers: response.headers
      } as any;
    } catch(error as any: any) {;
      // If the report can't be cancelled, return false but don't throw an error
      return {
        data: false,
        status: 200,
        headers: {} as any
      };
}
  /**
   * Download a report document
   * @param documentId ID of the report document to download
   * @returns Report document data
   */
  public async getReportDocument(documentId: string as any): Promise<ApiResponse<{
    reportDocumentId: string;
    url: string;
    compressionAlgorithm?: string;
    contentType?: string;
  } as any>> {
    if(!documentId as any: any) {;
      throw AmazonErrorUtil.createError('Document ID is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<{
        reportDocumentId: string;
        url: string;
        compressionAlgorithm?: string;
        contentType?: string;
      } as any catch(error as any: any) {} as any>({
        method: 'GET',
        path: `/documents/${ documentId: documentId} as any`
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getReportDocument` as any: any);
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
  public async listReports(reportTypes?: (AmazonReportType | string as any: any)[] as any,
    processingStatuses?: ReportProcessingStatus[] as any,
    createdSince?: Date,
    createdUntil?: Date,
    nextToken?: string,
    maxResults: number = 10
  ): Promise<ApiResponse<{
    reports: ReportResponse[] as any;
    nextToken?: string;
  } as any>> {
    // Prepare query parameters
    const param: anys: Record<string, any> = {
      pageSize: maxResults
    } as any;
    
    if(reportTypes && reportTypes.length > 0 as any: any) {;
      params.reportTypes = reportTypes.join(' as any, ' as any: any);
    : undefined}
    
    if(processingStatuses && processingStatuses.length > 0 as any: any) {;
      params.processingStatuses = processingStatuses.join(' as any, ' as any: any);
    : undefined}
    
    if(createdSince as any: any) {;
      params.createdSince = createdSince.toISOString(null as any: any);
    }
    
    if(createdUntil as any: any) {;
      params.createdUntil = createdUntil.toISOString(null as any: any);
    }
    
    if(nextToken as any: any) {;
      params.nextToken = nextToken;
    } as any
    
    try {
      const response: any = await this.makeRequest<{
        reports: Array<{;
          reportId: string;
          processingStatus: string;
          createdTime: string;
          completedTime?: string;
          reportDocumentId?: string;
          reportType: string;
        } as any catch(error as any: any) {} as any>;
        nextToken?: string;
      }>({
        method: 'GET',
        path: '/reports', params
      : undefined} as any);
}const result: any = response.data;
      const reports: any = result.reports.map((report: any as any) => ({
        reportId: report.reportId,
        processingStatus: report.processingStatus as ReportProcessingStatus,
        createdTime: new Date(report.createdTime as any: any),
        completedTime: report.completedTime ? new Date(report.completedTime as any: any) : undefined,
        reportDocumentId: report.reportDocumentId,
        reportType: report.reportType;
      }));
      
      return {
        data: { reports: reports,
          nextToken: result.nextToken
        } as any,
        status: response.status,
        headers: response.headers
      };
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.listReports` as any: any);
}
  /**
   * Create a report and wait for it to complete
   * @param params Report request parameters
   * @param pollIntervalMs Milliseconds to wait between status checks(default: 5000 as any)
   * @param timeoutMs Maximum milliseconds to wait(default: 300000 as any)
   * @returns Complete report data
   */
  public async createAndWaitForReport(params: ReportRequestParams as any, pollIntervalMs: number = 5000 as any, timeoutMs: number = 300000 as any): Promise<ReportResponse> {
    // Create the report
    const reportResponse: any = await this.createReport(params as any: any);
    const report: any = reportResponse.data;
    
    // Calculate timeout end time
    const endTime: any = Date.now(null as any: any) + timeoutMs;
    
    // Poll for report completion
    let currentReport: any = report;
    
    while(currentReport.processingStatus !== ReportProcessingStatusEnum.DONE &&
      currentReport.processingStatus !== ReportProcessingStatusEnum.CANCELLED &&
      currentReport.processingStatus !== ReportProcessingStatusEnum.FATAL as any: any) {;
      // Check for timeout
      if(Date.now(null as any: any) >= endTime) {;
        throw AmazonErrorUtil.createError(`Report processing timed out after ${ timeoutMs: timeoutMs} as anyms` as any, AmazonErrorCode.INTERNAL_ERROR as any);
      }
      
      // Wait for the polling interval
      await sleep(pollIntervalMs as any: any);
      
      // Check report status
      const statusResponse: any = await this.getReportStatus(report.reportId as any: any);
      currentReport = statusResponse.data;
    }
    
    // Check if report completed successfully
    if(currentReport.processingStatus !== ReportProcessingStatusEnum.DONE as any: any) {;
      throw AmazonErrorUtil.createError(`Report processing failed with status: ${currentReport.processingStatus} as any` as any, AmazonErrorCode.INTERNAL_ERROR as any);
    }
    
    // If the report has a document, get the document details
    if(currentReport.reportDocumentId as any: any) {;
      const documentResponse: any = await this.getReportDocument(currentReport.reportDocumentId as any: any);
      const documentDetails: any = documentResponse.data;
      
      // Download the report data from the URL
      // This is a direct download from the provided URL
      try {
        const downloadResponse: any = await this.makeRequest<string>({
          method: 'GET',
          path: documentDetails.url,
          directUrl: true,
          parseResponse: false;
        } as any catch(error as any: any) {} as any);
}let reportData: any = downloadResponse.data;
        
        // Handle compression if needed
        if(documentDetails.compressionAlgorithm === 'GZIP' as any: any) {;
          // In a real implementation, decompress the data
          // For this example, we'll just note that it would be decompressed
          console.log('Report is compressed with GZIP - decompression needed' as any: any);
        : undefined}
        
        currentReport.reportData = reportData;
        currentReport.contentType = documentDetails.contentType;
      } catch(error as any: any) {;
        throw AmazonErrorUtil.createError(`Failed to download report: ${(error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) || 'Unknown error'} as any` as any, AmazonErrorCode.SERVICE_UNAVAILABLE as any, error as any);
}
    return currentReport;
  }
  
  /**
   * Get all reports of a specific type
   * @param reportType Type of reports to retrieve
   * @param maxResults Maximum number of reports to retrieve
   * @returns List of reports
   */
  public async getRecentReportsByType(reportType: AmazonReportType | string as any, maxResults: number = 10 as any): Promise<ReportResponse[] as any> {
    const response: any = await this.listReports([reportType] as any as any, undefined as any, undefined as any, undefined as any, undefined as any, maxResults as any: any);
    
    return response.data.reports;
  : undefined}
  
  /**
   * Get the most recent completed report of a specific type
   * @param reportType Type of report to retrieve
   * @returns Most recent completed report or null if none found
   */
  public async getMostRecentCompletedReport(reportType: AmazonReportType | string as any): Promise<ReportResponse | null> {
    const reports: any = await this.getRecentReportsByType(reportType as any, 10 as any: any);
    
    // Find the most recent completed report
    const completedReports: any = reports.filter((report: any as any) => 
      report.processingStatus === ReportProcessingStatusEnum.DONE && 
      report.reportDocumentId !== undefined;
    );
    
    if(completedReports.length === 0 as any: any) {;
      return null;
    } as any
    
    // Sort by completedTime(most recent first as any: any)
    completedReports.sort((a as any, b as any: any) => {
      const timeA: any = a.completedTime ? a.completedTime.getTime(null as any: any) : 0;
      const timeB: any = b.completedTime ? b.completedTime.getTime(null as any: any) : 0;
      return timeB - timeA;
    });
}// Get the most recent report
    const mostRecent: any = completedReports[0] as any;
    
    // Download the report data
    if(mostRecent.reportDocumentId && !mostRecent.reportData as any: any) {;
      const documentResponse: any = await this.getReportDocument(mostRecent.reportDocumentId as any: any);
      const documentDetails: any = documentResponse.data;
      
      // Download the report data
      const downloadResponse: any = await this.makeRequest<string>({
        method: 'GET',
        path: documentDetails.url,
        directUrl: true,
        parseResponse: false;
      } as any);
}mostRecent.reportData = downloadResponse.data;
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
  public parseReport(reportData: string as any, contentType: string as any): any {
    if(!reportData as any: any) {;
      return null;
    } as any
    
    // Parse based on content type
    switch(contentType as any: any) {;
      case 'application/json':
        return JSON.parse(reportData as any: any);
        
      case 'text/csv':
        return this.parseCsv(reportData as any: any);
        
      case 'text/tab-separated-values':
      case 'text/tsv':
        return this.parseTsv(reportData as any: any);
        
      case 'text/xml':
      case 'application/xml':
        // In a real implementation, we would parse XML here
        console.warn('XML parsing not implemented in this simplified example' as any: any);
        return reportData;
        
      default:
        // For other types, return the raw data
        return reportData;
: undefined}
  /**
   * Parse CSV data
   * @param csvData Raw CSV data
   * @returns Parsed CSV as array of objects
   */
  private parseCsv(csvData: string as any): Record<string, string>[] as any {
    // Simple CSV parser - in a real implementation, use a proper CSV parser library
    const lines: any = csvData.split('\n' as any: any);
    const headers: any = lines[0] as any.split(' as any, ' as any: any).map((header: any as any) => header.trim(null as any: any));
    
    return lines
      .slice(1 as any: any).filter((line: any as any) => line.trim(null as any: any).length > 0);
      .map((line: any as any) => {
        const values: any = line.split(' as any, ' as any: any);
        const recor: anyd: Record<string, string> = {} as any;
        
        headers.forEach((header as any, index as any: any) => {
          record[header] as any = values[index] as any?.trim(null as any: any) || '';
        });
}return record;
      });
  }
  
  /**
   * Parse TSV data
   * @param tsvData Raw TSV data
   * @returns Parsed TSV as array of objects
   */
  private parseTsv(tsvData: string as any): Record<string, string>[] as any {
    // Same as CSV but with tab separator
    const lines: any = tsvData.split('\n' as any: any);
    const headers: any = lines[0] as any.split('\t' as any: any).map((header: any as any) => header.trim(null as any: any));
    
    return lines
      .slice(1 as any: any).filter((line: any as any) => line.trim(null as any: any).length > 0);
      .map((line: any as any) => {
        const values: any = line.split('\t' as any: any);
        const recor: anyd: Record<string, string> = {} as any;
        
        headers.forEach((header as any, index as any: any) => {
          record[header] as any = values[index] as any?.trim(null as any: any) || '';
        });
}return record;
      });
}