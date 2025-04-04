/**
 * Amazon SP-API Invoices Module
 * 
 * Implements the Amazon SP-API Invoices API functionality.
 * This module handles invoice operations for Amazon orders and shipments.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../../core/api-module';
import { AmazonErrorHandler, AmazonErrorCode } from '../../utils/amazon-error';
import { AmazonSPApi } from '../../schemas/amazon.generated';

/**
 * Invoice document types
 */
export enum InvoiceDocumentType {
  INVOICE = 'Invoice',
  CREDIT_NOTE = 'CreditNote'
}

/**
 * Parameters for uploading invoice
 */
export interface UploadInvoiceParams {
  /**
   * Amazon order ID
   */
  orderId: string;
  
  /**
   * Invoice document type
   */
  documentType: InvoiceDocumentType;
  
  /**
   * Invoice document content (Base64 encoded)
   */
  documentContent: string;
  
  /**
   * Content type of the document (e.g., application/pdf)
   */
  contentType: string;
  
  /**
   * Marketplace ID where the order was placed
   */
  marketplaceId?: string;
}

/**
 * Parameters for getting invoice status
 */
export interface GetInvoiceStatusParams {
  /**
   * Invoice ID returned from uploadInvoice operation
   */
  invoiceId: string;
}

/**
 * Implementation of the Amazon Invoices API
 */
export class InvoicesModule extends BaseApiModule {
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
      options?: ApiRequestOptions
    ) => Promise<ApiResponse<T>>,
    marketplaceId: string
  ) {
    super('invoices', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise that resolves when initialization is complete
   */
  protected async initializeModule(config?: Record<string, unknown>): Promise<void> {
    // No specific initialization required for this module
    return Promise.resolve();
  }
  
  /**
   * Upload an invoice or credit note for an Amazon order
   * @param params Parameters for uploading invoice
   * @returns Upload response with invoice ID
   */
  public async uploadInvoice(
    params: UploadInvoiceParams
  ): Promise<ApiResponse<AmazonSPApi.Invoices.UploadInvoiceResponse>> {
    if (!params.orderId) {
      throw AmazonErrorHandler.createError('Order ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!params.documentContent) {
      throw AmazonErrorHandler.createError('Document content is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Invoices.UploadInvoiceResponse>({
        method: 'POST',
        path: '/orders/invoices',
        data: {
          orderId: params.orderId,
          documentType: params.documentType,
          documentContent: params.documentContent
        },
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          marketplaceIds: params.marketplaceId || this.marketplaceId
        }
      });
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.uploadInvoice`);
    }
  }
  
  /**
   * Get the status of an invoice upload operation
   * @param params Parameters for getting invoice status
   * @returns Invoice status
   */
  public async getInvoiceStatus(
    params: GetInvoiceStatusParams
  ): Promise<ApiResponse<AmazonSPApi.Invoices.GetInvoiceStatusResponse>> {
    if (!params.invoiceId) {
      throw AmazonErrorHandler.createError('Invoice ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Invoices.GetInvoiceStatusResponse>({
        method: 'GET',
        path: `/orders/invoices/${params.invoiceId}`
      });
    } catch (error) {
      throw AmazonErrorHandler.mapHttpError(error, `${this.moduleName}.getInvoiceStatus`);
    }
  }
  
  /**
   * Upload an invoice for an order and wait for processing
   * @param params Parameters for uploading invoice
   * @param pollIntervalMs Interval in milliseconds to poll for status (default: 2000)
   * @param timeoutMs Maximum time to wait in milliseconds (default: 60000 - 1 minute)
   * @returns Final invoice status
   */
  public async uploadInvoiceAndWait(
    params: UploadInvoiceParams,
    pollIntervalMs = 2000,
    timeoutMs = 60000
  ): Promise<AmazonSPApi.Invoices.GetInvoiceStatusResponse> {
    // Upload the invoice
    const uploadResponse = await this.uploadInvoice(params);
    const invoiceId = uploadResponse.data.invoiceId;
    
    // Wait for processing to complete
    const startTime = Date.now();
    let status = 'PROCESSING';
    
    while (status === 'PROCESSING' && (Date.now() - startTime) < timeoutMs) {
      // Sleep for poll interval
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      
      // Check status
      const statusResponse = await this.getInvoiceStatus({ invoiceId });
      status = statusResponse.data.status;
      
      // Return if processing is complete
      if (status !== 'PROCESSING') {
        return statusResponse.data;
      }
    }
    
    // Timeout reached
    if (status === 'PROCESSING') {
      throw AmazonErrorHandler.createError(
        `Invoice processing timed out after ${timeoutMs}ms`,
        AmazonErrorCode.TIMEOUT
      );
    }
    
    // Get final status
    const finalStatus = await this.getInvoiceStatus({ invoiceId });
    return finalStatus.data;
  }
  
  /**
   * Upload a PDF invoice for an order
   * @param orderId Amazon order ID
   * @param pdfContent PDF content as base64 encoded string
   * @param documentType Document type (default: Invoice)
   * @param marketplaceId Optional marketplace ID
   * @returns Invoice ID
   */
  public async uploadPdfInvoice(
    orderId: string,
    pdfContent: string,
    documentType: InvoiceDocumentType = InvoiceDocumentType.INVOICE,
    marketplaceId?: string
  ): Promise<string> {
    const response = await this.uploadInvoice({
      orderId,
      documentType,
      documentContent: pdfContent,
      contentType: 'application/pdf',
      marketplaceId
    });
    
    return response.data.invoiceId;
  }
}