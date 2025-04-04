import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/inversify.types';
import { ILoggerService } from '../logger.service';
import { DocumentContent, DocumentGenerationOptions, DocumentGenerationResult, PdfDocumentService } from '../../types/pdf-utils';
import { PDFLibProvider } from './providers/pdf-lib-provider';
import { PDFKitProvider } from './providers/pdfkit-provider';

/**
 * PDF generator provider types
 */
export enum PDFGeneratorType {
  PDF_LIB = 'pdf-lib',
  PDF_KIT = 'pdfkit'
}

/**
 * Interface for PDF generation service
 */
export interface IPDFGenerationService extends PdfDocumentService {
  /**
   * Set the active PDF generator provider
   * @param providerType Provider type
   */
  setProvider(providerType: PDFGeneratorType): void;
}

/**
 * Service for PDF generation
 * Serves as a facade for different PDF generation providers
 */
@injectable()
export class PDFGenerationService implements IPDFGenerationService {
  private activeProvider: PDFGeneratorType = PDFGeneratorType.PDF_LIB;

  constructor(
    @inject(TYPES.LoggerService) private logger: ILoggerService,
    @inject(PDFLibProvider) private pdfLibProvider: PDFLibProvider,
    @inject(PDFKitProvider) private pdfKitProvider: PDFKitProvider
  ) {
    // Set default provider from environment or use pdf-lib as default
    const configuredProvider = process.env.PDF_PROVIDER?.toLowerCase();
    if (configuredProvider === 'pdfkit') {
      this.activeProvider = PDFGeneratorType.PDF_KIT;
    }
  }

  /**
   * Set the active PDF generator provider
   * @param providerType Provider type
   */
  public setProvider(providerType: PDFGeneratorType): void {
    this.activeProvider = providerType;
    this.logger.info(`PDF generator provider set to ${providerType}`);
  }

  /**
   * Get the active provider instance
   * @returns Active provider
   */
  private getActiveProvider(): PDFLibProvider | PDFKitProvider {
    switch (this.activeProvider) {
      case PDFGeneratorType.PDF_KIT:
        return this.pdfKitProvider;
      case PDFGeneratorType.PDF_LIB:
      default:
        return this.pdfLibProvider;
    }
  }

  /**
   * Generate a PDF document from content
   * @param content Document content
   * @param options Document generation options
   * @returns Document generation result
   */
  public async generatePdf(
    content: DocumentContent, 
    options?: DocumentGenerationOptions
  ): Promise<DocumentGenerationResult> {
    try {
      this.logger.info('Generating PDF document', { 
        title: content.title, 
        sections: content.sections.length,
        provider: this.activeProvider
      });
      
      const provider = this.getActiveProvider();
      const result = await provider.generatePdf(content, options);
      
      this.logger.info('PDF document generated successfully', { 
        fileName: result.fileName, 
        size: result.size,
        provider: this.activeProvider
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error generating PDF document', { error });
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate a PDF document from a template
   * @param templateId Template ID
   * @param data Template data
   * @param options Document generation options
   * @returns Document generation result
   */
  public async generateFromTemplate(
    templateId: string,
    data: any,
    options?: DocumentGenerationOptions
  ): Promise<DocumentGenerationResult> {
    try {
      this.logger.info('Generating PDF from template', { 
        templateId, 
        provider: this.activeProvider
      });
      
      const provider = this.getActiveProvider();
      const result = await provider.generateFromTemplate(templateId, data, options);
      
      this.logger.info('PDF from template generated successfully', { 
        fileName: result.fileName, 
        size: result.size,
        provider: this.activeProvider
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error generating PDF from template', { templateId, error });
      throw new Error(`Failed to generate PDF from template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a download URL for a document
   * @param documentId Document ID
   * @returns Download URL
   */
  public async getDownloadUrl(documentId: string): Promise<string> {
    try {
      this.logger.info('Getting download URL for document', { documentId });
      
      const provider = this.getActiveProvider();
      const url = await provider.getDownloadUrl(documentId);
      
      return url;
    } catch (error) {
      this.logger.error('Error getting download URL', { documentId, error });
      throw new Error(`Failed to get download URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a document
   * @param documentId Document ID
   * @returns True if deletion was successful
   */
  public async deleteDocument(documentId: string): Promise<boolean> {
    try {
      this.logger.info('Deleting document', { documentId });
      
      const provider = this.getActiveProvider();
      const result = await provider.deleteDocument(documentId);
      
      if (result) {
        this.logger.info('Document deleted successfully', { documentId });
      } else {
        this.logger.warn('Document deletion failed', { documentId });
      }
      
      return result;
    } catch (error) {
      this.logger.error('Error deleting document', { documentId, error });
      return false;
    }
  }
}