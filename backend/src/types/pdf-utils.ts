/**
 * Utility types and interfaces for PDF document generation
 */

/**
 * Document generation options
 */
export interface DocumentGenerationOptions {
  fileName?: string;
  outputFormat?: 'pdf' | 'html' | 'png';
  templateId?: string;
  companyLogo?: boolean;
  signatureRequired?: boolean;
  compressOutput?: boolean;
  metadataFields?: Record<string, string>;
}

/**
 * Document content data structure
 */
export interface DocumentContent {
  title?: string;
  sections: DocumentSection[];
  footer?: {
    text: string;
    pageNumbers: boolean;
  };
  metadata?: Record<string, string>;
}

/**
 * Document section structure
 */
export interface DocumentSection {
  heading?: string;
  content: string | DocumentTable | DocumentList;
  style?: 'normal' | 'emphasized' | 'boxed';
}

/**
 * Document table structure
 */
export interface DocumentTable {
  headers: string[];
  rows: string[][];
  widths?: number[];
  alignment?: ('left' | 'center' | 'right')[];
}

/**
 * Document list structure
 */
export interface DocumentList {
  items: string[];
  style?: 'bullet' | 'number' | 'check';
}

/**
 * Document generation result
 */
export interface DocumentGenerationResult {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  metadata?: Record<string, string>;
  generatedAt: Date;
}

/**
 * PDF document service interface
 */
export interface PdfDocumentService {
  generatePdf(content: DocumentContent, options?: DocumentGenerationOptions): Promise<DocumentGenerationResult>;
  generateFromTemplate(templateId: string, data: any, options?: DocumentGenerationOptions): Promise<DocumentGenerationResult>;
  getDownloadUrl(documentId: string): Promise<string>;
  deleteDocument(documentId: string): Promise<boolean>;
}

/**
 * Implement this as a mock for testing
 */
export class MockPdfService implements PdfDocumentService {
  public async generatePdf(
    content: DocumentContent, 
    options?: DocumentGenerationOptions
  ): Promise<DocumentGenerationResult> {
    // Mock implementation
    return {
      url: `https://storage.googleapis.com/documents/${Date.now()}/${options?.fileName || 'document.pdf'}`,
      fileName: options?.fileName || 'document.pdf',
      mimeType: 'application/pdf',
      size: 12345,
      metadata: options?.metadataFields,
      generatedAt: new Date()
    };
  }
  
  public async generateFromTemplate(
    templateId: string,
    data: any,
    options?: DocumentGenerationOptions
  ): Promise<DocumentGenerationResult> {
    // Mock implementation
    return {
      url: `https://storage.googleapis.com/documents/${Date.now()}/${options?.fileName || 'document.pdf'}`,
      fileName: options?.fileName || 'document.pdf',
      mimeType: 'application/pdf',
      size: 12345,
      metadata: options?.metadataFields,
      generatedAt: new Date()
    };
  }
  
  public async getDownloadUrl(documentId: string): Promise<string> {
    return `https://storage.googleapis.com/downloads/${documentId}`;
  }
  
  public async deleteDocument(documentId: string): Promise<boolean> {
    return true;
  }
}
