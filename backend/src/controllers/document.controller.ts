import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/inversify.types';
import { ILoggerService } from '../services/logger.service';
import { IPDFGenerationService, PDFGenerationService } from '../services/pdf/pdf-generation.service';
import { DocumentContent, DocumentGenerationOptions } from '../types/pdf-utils';
import { ApiError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types/express-extensions';

/**
 * Controller for document generation
 */
@injectable()
export class DocumentController {
  constructor(
    @inject(TYPES.PDFGenerationService) private pdfService: IPDFGenerationService,
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {}

  /**
   * Generate a PDF document
   * @param req Request
   * @param res Response
   * @param next NextFunction
   */
  public generateDocument = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { content, options } = req.body;
      
      // Validate request body
      if (!content || !content.sections) {
        throw new ApiError(400, 'Invalid document content');
      }
      
      // Set organization ID in metadata if not provided
      const documentOptions: DocumentGenerationOptions = {
        ...options,
        metadataFields: {
          ...options?.metadataFields,
          organizationId: req.organizationId || req.user?.organizationId || undefined
        }
      };
      
      // Generate PDF
      const result = await this.pdfService.generatePdf(content, documentOptions);
      
      // Return the result
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      this.logger.error('Error generating document', { error });
      next(error);
    }
  };

  /**
   * Generate a PDF document from a template
   * @param req Request
   * @param res Response
   * @param next NextFunction
   */
  public generateFromTemplate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { templateId, data, options } = req.body;
      
      // Validate request body
      if (!templateId || !data) {
        throw new ApiError(400, 'Template ID and data are required');
      }
      
      // Set organization ID in metadata if not provided
      const documentOptions: DocumentGenerationOptions = {
        ...options,
        metadataFields: {
          ...options?.metadataFields,
          organizationId: req.organizationId || req.user?.organizationId || undefined
        }
      };
      
      // Generate PDF from template
      const result = await this.pdfService.generateFromTemplate(templateId, data, documentOptions);
      
      // Return the result
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      this.logger.error('Error generating document from template', { error });
      next(error);
    }
  };

  /**
   * Get a download URL for a document
   * @param req Request
   * @param res Response
   * @param next NextFunction
   */
  public getDownloadUrl = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { documentId } = req.params;
      
      // Validate request parameters
      if (!documentId) {
        throw new ApiError(400, 'Document ID is required');
      }
      
      // Get download URL
      const url = await this.pdfService.getDownloadUrl(documentId);
      
      // Return the URL
      res.status(200).json({
        success: true,
        data: { url }
      });
    } catch (error) {
      this.logger.error('Error getting download URL', { error });
      next(error);
    }
  };

  /**
   * Delete a document
   * @param req Request
   * @param res Response
   * @param next NextFunction
   */
  public deleteDocument = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { documentId } = req.params;
      
      // Validate request parameters
      if (!documentId) {
        throw new ApiError(400, 'Document ID is required');
      }
      
      // Delete document
      const result = await this.pdfService.deleteDocument(documentId);
      
      // Return the result
      res.status(200).json({
        success: result,
        message: result ? 'Document deleted successfully' : 'Failed to delete document'
      });
    } catch (error) {
      this.logger.error('Error deleting document', { error });
      next(error);
    }
  };
}