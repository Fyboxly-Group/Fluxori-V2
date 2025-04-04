import mongoose, { Types } from 'mongoose';
import { 
  IInternationalShipment, 
  ICustomsDeclaration 
} from '../models/international-trade.model';
import { InternationalShipment, CustomsDeclaration } from '../models/international-trade.model';

/**
 * Document service error codes
 */
export enum DocumentErrorCode {
  INVALID_SHIPMENT_ID = 'INVALID_SHIPMENT_ID',
  SHIPMENT_NOT_FOUND = 'SHIPMENT_NOT_FOUND',
  CUSTOMS_DECLARATION_NOT_FOUND = 'CUSTOMS_DECLARATION_NOT_FOUND',
  DOCUMENT_GENERATION_FAILED = 'DOCUMENT_GENERATION_FAILED',
  INVALID_DOCUMENT_ID = 'INVALID_DOCUMENT_ID',
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  INVALID_FORMAT = 'INVALID_FORMAT',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom API error class with error code
 */
export class DocumentServiceError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: DocumentErrorCode,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'DocumentServiceError';
    
    // This is needed for proper instanceof checks with custom Error subclasses
    Object.setPrototypeOf(this, DocumentServiceError.prototype);
  }
}

/**
 * Interface for generated document info
 */
export interface IGeneratedDocument {
  type: DocumentType;
  format: DocumentFormat;
  url?: string;
  content?: string;
  filename: string;
}

/**
 * Document format types
 */
export type DocumentFormat = 'pdf' | 'docx' | 'html' | 'xml' | 'json';

/**
 * Interface for document generation options
 */
export interface IDocumentGenerationOptions {
  format?: DocumentFormat;
  language?: string;
  template?: string;
  includeLogoAndBranding?: boolean;
  includeDigitalSignature?: boolean;
  saveToCloud?: boolean;
}

/**
 * Interface for document generation result
 */
export interface IDocumentGenerationResult {
  success: boolean;
  documents: IGeneratedDocument[];
  error?: string;
}

/**
 * Document type enum
 */
export enum DocumentType {
  COMMERCIAL_INVOICE = 'commercialInvoice',
  PACKING_LIST = 'packingList',
  CERTIFICATE_OF_ORIGIN = 'certificateOfOrigin',
  CUSTOMS_DECLARATION = 'customsDeclarationForm',
  DANGEROUS_GOODS = 'dangerousGoodsForm'
}

/**
 * Service for customs document generation and management
 * Handles generation and retrieval of international trade documents
 */
export class CustomsDocumentService {
  /**
   * Generate customs documents for a shipment
   * 
   * @param shipmentId ID of the shipment
   * @param options Document generation options
   * @returns Document generation result with generated documents
   * @throws DocumentServiceError when validation fails or document generation fails
   */
  async generateDocuments(
    shipmentId: string, 
    options: IDocumentGenerationOptions = {}
  ): Promise<IDocumentGenerationResult> {
    try {
      // Validate shipment ID
      if (!shipmentId || typeof shipmentId !== 'string' || !mongoose.Types.ObjectId.isValid(shipmentId)) {
        throw new DocumentServiceError(
          'Invalid shipment ID', 
          DocumentErrorCode.INVALID_SHIPMENT_ID,
          400
        );
      }

      // Validate document format if provided
      if (options.format && 
          !['pdf', 'docx', 'html', 'xml', 'json'].includes(options.format)) {
        throw new DocumentServiceError(
          `Invalid document format: ${options.format}`, 
          DocumentErrorCode.INVALID_FORMAT,
          400
        );
      }

      // Retrieve shipment data
      const shipment = await InternationalShipment.findById(shipmentId);
      if (!shipment) {
        throw new DocumentServiceError(
          `Shipment with ID ${shipmentId} not found`, 
          DocumentErrorCode.SHIPMENT_NOT_FOUND,
          404
        );
      }

      // Retrieve customs declaration
      const customsDeclaration = await CustomsDeclaration.findOne({ 
        shipmentId: new mongoose.Types.ObjectId(shipmentId) 
      });
      
      if (!customsDeclaration) {
        throw new DocumentServiceError(
          `Customs declaration for shipment ${shipmentId} not found`, 
          DocumentErrorCode.CUSTOMS_DECLARATION_NOT_FOUND,
          404
        );
      }

      // Generate the documents
      const documents: IGeneratedDocument[] = [];
      const generationErrors: string[] = [];

      // Commercial Invoice
      try {
        const commercialInvoice = await this.generateCommercialInvoice(
          shipment, 
          customsDeclaration, 
          options
        );
        if (commercialInvoice) {
          documents.push(commercialInvoice);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        generationErrors.push(`Commercial Invoice: ${errorMessage}`);
        console.error('Error generating commercial invoice:', error);
      }

      // Packing List
      try {
        const packingList = await this.generatePackingList(
          shipment, 
          options
        );
        if (packingList) {
          documents.push(packingList);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        generationErrors.push(`Packing List: ${errorMessage}`);
        console.error('Error generating packing list:', error);
      }

      // Certificate of Origin (if needed)
      if (this.needsCertificateOfOrigin(shipment, customsDeclaration)) {
        try {
          const certificateOfOrigin = await this.generateCertificateOfOrigin(
            shipment, 
            customsDeclaration, 
            options
          );
          if (certificateOfOrigin) {
            documents.push(certificateOfOrigin);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          generationErrors.push(`Certificate of Origin: ${errorMessage}`);
          console.error('Error generating certificate of origin:', error);
        }
      }

      // Customs Declaration Form
      try {
        const customsDeclarationForm = await this.generateCustomsDeclarationForm(
          shipment, 
          customsDeclaration, 
          options
        );
        if (customsDeclarationForm) {
          documents.push(customsDeclarationForm);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        generationErrors.push(`Customs Declaration Form: ${errorMessage}`);
        console.error('Error generating customs declaration form:', error);
      }

      // Dangerous Goods Declaration (if needed)
      if (this.hasDangerousGoods(shipment)) {
        try {
          const dangerousGoodsForm = await this.generateDangerousGoodsForm(
            shipment, 
            options
          );
          if (dangerousGoodsForm) {
            documents.push(dangerousGoodsForm);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          generationErrors.push(`Dangerous Goods Form: ${errorMessage}`);
          console.error('Error generating dangerous goods form:', error);
        }
      }

      // If no documents were generated successfully
      if (documents.length === 0) {
        return {
          success: false,
          documents: [],
          error: generationErrors.length > 0 
            ? `Failed to generate any documents: ${generationErrors.join('; ')}` 
            : 'No documents were generated'
        };
      }

      // Return the generated documents, including partial success info if needed
      return {
        success: true,
        documents,
        error: generationErrors.length > 0 
          ? `Some documents failed to generate: ${generationErrors.join('; ')}` 
          : undefined
      };
    } catch (error) {
      // If it's already our custom error, pass it through
      if (error instanceof DocumentServiceError) {
        console.error(`Document service error: [${error.code}] ${error.message}`);
        return {
          success: false,
          documents: [],
          error: error.message
        };
      }
      
      // Otherwise, wrap the error
      console.error('Error generating customs documents:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        documents: [],
        error: `Document generation failed: ${errorMessage}`
      };
    }
  }

  /**
   * Get all customs document records for a user/organization
   * 
   * @param userId User ID
   * @param organizationId Organization ID
   * @param limit Max number of records to return
   * @param offset Number of records to skip
   * @returns Array of document records
   * @throws DocumentServiceError when parameters are invalid or retrieval fails
   */
  async getAll(
    userId: string, 
    organizationId: string, 
    limit = 10, 
    offset = 0
  ): Promise<IGeneratedDocument[]> {
    try {
      // Validate parameters
      if (!userId || typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new DocumentServiceError(
          'Invalid user ID', 
          DocumentErrorCode.UNAUTHORIZED_ACCESS,
          400
        );
      }

      if (!organizationId || typeof organizationId !== 'string' || !mongoose.Types.ObjectId.isValid(organizationId)) {
        throw new DocumentServiceError(
          'Invalid organization ID', 
          DocumentErrorCode.UNAUTHORIZED_ACCESS,
          400
        );
      }

      // Validate limit and offset
      if (typeof limit !== 'number' || limit < 1) {
        throw new DocumentServiceError(
          'Limit must be a positive number', 
          DocumentErrorCode.INVALID_FORMAT,
          400
        );
      }

      if (typeof offset !== 'number' || offset < 0) {
        throw new DocumentServiceError(
          'Offset must be a non-negative number', 
          DocumentErrorCode.INVALID_FORMAT,
          400
        );
      }

      // In a real implementation, you would:
      // 1. Query documents from a database using userId and organizationId
      // 2. Apply pagination (limit and offset)
      // 3. Return the documents or an empty array if none found

      // For now, returning a placeholder implementation
      // These would be documents from a database query
      const documents: IGeneratedDocument[] = [
        {
          type: DocumentType.COMMERCIAL_INVOICE,
          format: 'pdf',
          url: `https://example.com/documents/user_${userId}/invoice_1.pdf`,
          filename: 'commercial_invoice_1.pdf'
        },
        {
          type: DocumentType.PACKING_LIST,
          format: 'pdf',
          url: `https://example.com/documents/user_${userId}/packing_1.pdf`,
          filename: 'packing_list_1.pdf'
        }
      ];

      return documents;
    } catch (error) {
      // If it's already our custom error, rethrow it
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      
      // Otherwise, wrap the error
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new DocumentServiceError(
        `Error getting customs document records: ${errorMessage}`, 
        DocumentErrorCode.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Get a customs document by ID
   * 
   * @param id Document ID
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns Document record
   * @throws DocumentServiceError when document is not found or access is unauthorized
   */
  async getById(
    id: string, 
    userId: string, 
    organizationId: string
  ): Promise<IGeneratedDocument> {
    try {
      // Validate all parameters
      if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        throw new DocumentServiceError(
          'Invalid document ID', 
          DocumentErrorCode.INVALID_DOCUMENT_ID,
          400
        );
      }

      if (!userId || typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new DocumentServiceError(
          'Invalid user ID', 
          DocumentErrorCode.UNAUTHORIZED_ACCESS,
          400
        );
      }

      if (!organizationId || typeof organizationId !== 'string' || !mongoose.Types.ObjectId.isValid(organizationId)) {
        throw new DocumentServiceError(
          'Invalid organization ID', 
          DocumentErrorCode.UNAUTHORIZED_ACCESS,
          400
        );
      }

      // In a real implementation, you would:
      // 1. Query the document from a database
      // 2. Verify that the document belongs to the user/organization
      // 3. Check if the document exists
      // 4. Return the document or throw the appropriate error

      // For now, returning a placeholder implementation
      // In a real implementation, you would check if a document with this ID exists
      const documentExists = true; // This would be a database query result

      if (!documentExists) {
        throw new DocumentServiceError(
          `Document with ID ${id} not found`, 
          DocumentErrorCode.DOCUMENT_NOT_FOUND,
          404
        );
      }

      // Return a placeholder document record
      return {
        type: DocumentType.COMMERCIAL_INVOICE,
        format: 'pdf',
        url: `https://example.com/documents/${id}.pdf`,
        filename: `commercial_invoice_${id}.pdf`
      };
    } catch (error) {
      // If it's already our custom error, rethrow it
      if (error instanceof DocumentServiceError) {
        throw error;
      }
      
      // Otherwise, wrap the error
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new DocumentServiceError(
        `Error getting customs document by ID: ${errorMessage}`, 
        DocumentErrorCode.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Generate a commercial invoice
   * 
   * @param shipment Shipment data
   * @param customsDeclaration Customs declaration data
   * @param options Document generation options
   * @returns Generated document info
   */
  private async generateCommercialInvoice(
    shipment: IInternationalShipment, 
    customsDeclaration: ICustomsDeclaration,
    options: IDocumentGenerationOptions
  ): Promise<IGeneratedDocument | null> {
    try {
      // This would use a template engine and PDF generation library
      // For now, returning a placeholder document info
      return {
        type: DocumentType.COMMERCIAL_INVOICE,
        format: options.format || 'pdf',
        url: `https://example.com/documents/${shipment._id}/commercial_invoice.pdf`,
        filename: `commercial_invoice_${shipment._id}.pdf`
      };
    } catch (error) {
      console.error('Error generating commercial invoice:', error);
      return null;
    }
  }

  /**
   * Generate a packing list
   * 
   * @param shipment Shipment data
   * @param options Document generation options
   * @returns Generated document info
   */
  private async generatePackingList(
    shipment: IInternationalShipment,
    options: IDocumentGenerationOptions
  ): Promise<IGeneratedDocument | null> {
    try {
      // This would use a template engine and PDF generation library
      // For now, returning a placeholder document info
      return {
        type: DocumentType.PACKING_LIST,
        format: options.format || 'pdf',
        url: `https://example.com/documents/${shipment._id}/packing_list.pdf`,
        filename: `packing_list_${shipment._id}.pdf`
      };
    } catch (error) {
      console.error('Error generating packing list:', error);
      return null;
    }
  }

  /**
   * Generate a certificate of origin
   * 
   * @param shipment Shipment data
   * @param customsDeclaration Customs declaration data
   * @param options Document generation options
   * @returns Generated document info
   */
  private async generateCertificateOfOrigin(
    shipment: IInternationalShipment,
    customsDeclaration: ICustomsDeclaration,
    options: IDocumentGenerationOptions
  ): Promise<IGeneratedDocument | null> {
    try {
      // This would use a template engine and PDF generation library
      // For now, returning a placeholder document info
      return {
        type: DocumentType.CERTIFICATE_OF_ORIGIN,
        format: options.format || 'pdf',
        url: `https://example.com/documents/${shipment._id}/certificate_of_origin.pdf`,
        filename: `certificate_of_origin_${shipment._id}.pdf`
      };
    } catch (error) {
      console.error('Error generating certificate of origin:', error);
      return null;
    }
  }

  /**
   * Generate a customs declaration form
   * 
   * @param shipment Shipment data
   * @param customsDeclaration Customs declaration data
   * @param options Document generation options
   * @returns Generated document info
   */
  private async generateCustomsDeclarationForm(
    shipment: IInternationalShipment,
    customsDeclaration: ICustomsDeclaration,
    options: IDocumentGenerationOptions
  ): Promise<IGeneratedDocument | null> {
    try {
      // This would use a template engine and PDF generation library
      // For now, returning a placeholder document info
      return {
        type: DocumentType.CUSTOMS_DECLARATION,
        format: options.format || 'pdf',
        url: `https://example.com/documents/${shipment._id}/customs_declaration.pdf`,
        filename: `customs_declaration_${shipment._id}.pdf`
      };
    } catch (error) {
      console.error('Error generating customs declaration form:', error);
      return null;
    }
  }

  /**
   * Generate a dangerous goods form
   * 
   * @param shipment Shipment data
   * @param options Document generation options
   * @returns Generated document info
   */
  private async generateDangerousGoodsForm(
    shipment: IInternationalShipment,
    options: IDocumentGenerationOptions
  ): Promise<IGeneratedDocument | null> {
    try {
      // This would use a template engine and PDF generation library
      // For now, returning a placeholder document info
      return {
        type: DocumentType.DANGEROUS_GOODS,
        format: options.format || 'pdf',
        url: `https://example.com/documents/${shipment._id}/dangerous_goods.pdf`,
        filename: `dangerous_goods_${shipment._id}.pdf`
      };
    } catch (error) {
      console.error('Error generating dangerous goods form:', error);
      return null;
    }
  }

  /**
   * Check if a certificate of origin is needed
   * 
   * @param shipment Shipment data
   * @param customsDeclaration Customs declaration data
   * @returns True if a certificate of origin is needed
   */
  private needsCertificateOfOrigin(
    shipment: IInternationalShipment,
    customsDeclaration: ICustomsDeclaration
  ): boolean {
    // This would check country requirements and trade agreements
    // For now, using a placeholder implementation
    const countriesRequiringCertificate = ['CN', 'BR', 'IN', 'RU', 'AE', 'SA', 'EG'];
    return countriesRequiringCertificate.includes(shipment.destination.country);
  }

  /**
   * Check if the shipment contains dangerous goods
   * 
   * @param shipment Shipment data
   * @returns True if the shipment contains dangerous goods
   */
  private hasDangerousGoods(shipment: IInternationalShipment): boolean {
    // This would check for dangerous goods keywords or HS codes
    // For now, using a simple keyword check in item descriptions
    const dangerousKeywords = ['battery', 'acid', 'flammable', 'explosive', 'corrosive', 'poisonous'];
    return shipment.items.some(item => 
      dangerousKeywords.some(keyword => 
        item.description.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }
}
