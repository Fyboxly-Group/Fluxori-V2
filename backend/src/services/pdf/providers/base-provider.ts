import { DocumentContent, DocumentGenerationOptions, DocumentGenerationResult } from '../../../types/pdf-utils';

/**
 * Base interface for PDF providers
 */
export interface PDFProvider {
  /**
   * Generate a PDF document from content
   * @param content Document content
   * @param options Document generation options
   * @returns Document generation result
   */
  generatePdf(content: DocumentContent, options?: DocumentGenerationOptions): Promise<DocumentGenerationResult>;
  
  /**
   * Generate a PDF document from a template
   * @param templateId Template ID
   * @param data Template data
   * @param options Document generation options
   * @returns Document generation result
   */
  generateFromTemplate(templateId: string, data: any, options?: DocumentGenerationOptions): Promise<DocumentGenerationResult>;
  
  /**
   * Get a download URL for a document
   * @param documentId Document ID
   * @returns Download URL
   */
  getDownloadUrl(documentId: string): Promise<string>;
  
  /**
   * Delete a document
   * @param documentId Document ID
   * @returns True if deletion was successful
   */
  deleteDocument(documentId: string): Promise<boolean>;
}

/**
 * Base abstract class for PDF providers
 * Provides common functionality shared across PDF generation providers
 */
export abstract class BasePDFProvider implements PDFProvider {
  /**
   * Generate a unique document ID
   * @param prefix Optional prefix for the document ID
   * @returns Unique document ID
   */
  protected generateDocumentId(prefix: string = 'doc'): string {
    const timestamp = Date.now();
    const randomChars = Math.random().toString(36).substring(2, 10);
    return `${prefix}_${timestamp}_${randomChars}`;
  }
  
  /**
   * Determine MIME type based on output format
   * @param format Output format
   * @returns MIME type
   */
  protected getMimeType(format: string = 'pdf'): string {
    switch (format.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'html':
        return 'text/html';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }
  
  /**
   * Generate a PDF document from content
   * @param content Document content
   * @param options Document generation options
   * @returns Document generation result
   */
  public abstract generatePdf(
    content: DocumentContent, 
    options?: DocumentGenerationOptions
  ): Promise<DocumentGenerationResult>;
  
  /**
   * Generate a PDF document from a template
   * @param templateId Template ID
   * @param data Template data
   * @param options Document generation options
   * @returns Document generation result
   */
  public abstract generateFromTemplate(
    templateId: string,
    data: any,
    options?: DocumentGenerationOptions
  ): Promise<DocumentGenerationResult>;
  
  /**
   * Get a download URL for a document
   * @param documentId Document ID
   * @returns Download URL
   */
  public abstract getDownloadUrl(documentId: string): Promise<string>;
  
  /**
   * Delete a document
   * @param documentId Document ID
   * @returns True if deletion was successful
   */
  public abstract deleteDocument(documentId: string): Promise<boolean>;
}