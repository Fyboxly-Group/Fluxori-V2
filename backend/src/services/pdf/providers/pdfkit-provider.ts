import { injectable, inject } from 'inversify';
import PDFDocument from 'pdfkit';
import { DocumentContent, DocumentGenerationOptions, DocumentGenerationResult, DocumentSection, DocumentTable, DocumentList } from '../../../types/pdf-utils';
import { BasePDFProvider } from './base-provider';
import { StorageService } from '../../storage/storage.service';
import { ITemplateService, TemplateService } from '../template.service';
import { TYPES } from '../../../config/inversify.types';
import { ILoggerService } from '../../logger.service';

/**
 * PDF generator using PDFKit library
 */
@injectable()
export class PDFKitProvider extends BasePDFProvider {
  constructor(
    @inject(TYPES.StorageService) private storageService: StorageService,
    @inject(TYPES.TemplateService) private templateService: ITemplateService,
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {
    super();
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
    return new Promise((resolve, reject) => {
      try {
        // Create an array to hold the PDF data chunks
        const chunks: Buffer[] = [];
        
        // Create a new PDF document
        const doc = new PDFDocument({
          info: {
            Title: content.title || 'Document',
            Author: content.metadata?.author || 'Fluxori System',
            Subject: content.metadata?.subject || '',
            Keywords: content.metadata?.keywords || ''
          },
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          },
          bufferPages: true
        });
        
        // Collect the PDF data
        doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        
        // Handle the end of the PDF generation
        doc.on('end', async () => {
          try {
            // Combine all chunks into a single buffer
            const pdfBuffer = Buffer.concat(chunks);
            
            // Create a unique filename if not provided
            const fileName = options?.fileName || `document-${Date.now()}.pdf`;
            
            // Save to storage
            const documentId = this.generateDocumentId();
            const path = `documents/${documentId}/${fileName}`;
            
            const fileInfo = await this.storageService.uploadFile(
              pdfBuffer,
              path,
              {
                contentType: 'application/pdf',
                isPublic: false,
                metadata: {
                  documentId,
                  title: content.title || 'Document',
                  ...(content.metadata || {}),
                  ...(options?.metadataFields || {})
                }
              }
            );
            
            // Return the result
            resolve({
              url: fileInfo.url,
              fileName: fileInfo.name,
              mimeType: 'application/pdf',
              size: pdfBuffer.length,
              metadata: options?.metadataFields,
              generatedAt: new Date()
            });
          } catch (error) {
            reject(new Error(`Failed to save PDF: ${error instanceof Error ? error.message : String(error)}`));
          }
        });
        
        // Handle errors during PDF generation
        doc.on('error', (error) => {
          reject(new Error(`Error generating PDF: ${error.message}`));
        });
        
        // Add title if provided
        if (content.title) {
          doc.fontSize(18).font('Helvetica-Bold').text(content.title, { align: 'left' });
          doc.moveDown(1.5);
        }
        
        // Process each section
        for (const section of content.sections) {
          // Add section heading if provided
          if (section.heading) {
            doc.fontSize(14).font('Helvetica-Bold').text(section.heading, { align: 'left' });
            doc.moveDown(0.5);
          }
          
          // Process section content based on type
          if (typeof section.content === 'string') {
            // Text content
            doc.fontSize(12).font('Helvetica').text(section.content, {
              align: 'left',
              lineGap: 5
            });
            doc.moveDown(0.5);
          } else if ('headers' in section.content) {
            // Table content
            this.drawTable(doc, section.content);
            doc.moveDown(0.5);
          } else if ('items' in section.content) {
            // List content
            this.drawList(doc, section.content);
            doc.moveDown(0.5);
          }
          
          // Add space between sections
          doc.moveDown(0.5);
        }
        
        // Add footer if provided
        if (content.footer) {
          const totalPages = doc.bufferedPageRange().count;
          
          for (let i = 0; i < totalPages; i++) {
            doc.switchToPage(i);
            
            // Save the current state
            doc.save();
            
            // Move to the bottom of the page
            doc.fontSize(10).font('Helvetica').fillColor('#666666');
            
            // Add footer text
            doc.text(
              content.footer.text,
              50,
              doc.page.height - 50,
              { width: doc.page.width - 100, align: 'left' }
            );
            
            // Add page numbers if requested
            if (content.footer.pageNumbers) {
              doc.text(
                `Page ${i + 1} of ${totalPages}`,
                50,
                doc.page.height - 50,
                { width: doc.page.width - 100, align: 'right' }
              );
            }
            
            // Restore the state
            doc.restore();
          }
        }
        
        // Finalize the PDF
        doc.end();
      } catch (error) {
        this.logger.error('Error generating PDF', { error });
        reject(new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
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
      // Get template
      const templateContent = await this.templateService.getTemplate(templateId);
      if (!templateContent) {
        throw new Error(`Template with ID '${templateId}' not found`);
      }
      
      // Get template metadata to determine format
      const metadata = await this.templateService.getTemplateMetadata(templateId);
      if (!metadata) {
        throw new Error(`Template metadata for ID '${templateId}' not found`);
      }
      
      // Process template based on format
      let processedContent: DocumentContent;
      
      switch (metadata.format) {
        case 'handlebars':
          processedContent = await this.processHandlebarsTemplate(templateContent, data);
          break;
        case 'pug':
          processedContent = await this.processPugTemplate(templateContent, data);
          break;
        case 'ejs':
          processedContent = await this.processEjsTemplate(templateContent, data);
          break;
        case 'html':
        default:
          // Basic string replacement for simple templates
          processedContent = this.processBasicTemplate(templateContent, data);
          break;
      }
      
      // Generate PDF from processed content
      return this.generatePdf(processedContent, {
        ...options,
        fileName: options?.fileName || `${metadata.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`
      });
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
      // List files in the document directory
      const files = await this.storageService.listFiles(`documents/${documentId}/`);
      
      if (files.length === 0) {
        throw new Error(`Document with ID '${documentId}' not found`);
      }
      
      // Get the first file (there should be only one)
      const file = files[0];
      
      // Generate a signed URL with 15 minutes expiration
      const signedUrl = await this.storageService.getSignedUrl(file.path, {
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });
      
      return signedUrl;
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
      // List files in the document directory
      const files = await this.storageService.listFiles(`documents/${documentId}/`);
      
      // Delete each file
      for (const file of files) {
        await this.storageService.deleteFile(file.path);
      }
      
      return true;
    } catch (error) {
      this.logger.error('Error deleting document', { documentId, error });
      return false;
    }
  }

  /**
   * Process a basic template with string replacement
   * @param templateContent Template content
   * @param data Template data
   * @returns Processed document content
   */
  private processBasicTemplate(templateContent: string, data: any): DocumentContent {
    try {
      // Parse the template as JSON
      const templateJson = JSON.parse(templateContent);
      
      // Process template by replacing placeholders with data
      const processNode = (node: any): any => {
        if (typeof node === 'string') {
          // Replace placeholders in strings (format: {{variable}})
          return node.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
            const keys = path.split('.');
            let value = data;
            
            for (const key of keys) {
              if (value === undefined || value === null) {
                return '';
              }
              value = value[key];
            }
            
            return value !== undefined && value !== null ? String(value) : '';
          });
        } else if (Array.isArray(node)) {
          return node.map(item => processNode(item));
        } else if (node !== null && typeof node === 'object') {
          const result: Record<string, any> = {};
          
          for (const [key, value] of Object.entries(node)) {
            result[key] = processNode(value);
          }
          
          return result;
        }
        
        return node;
      };
      
      return processNode(templateJson) as DocumentContent;
    } catch (error) {
      this.logger.error('Error processing basic template', { error });
      throw new Error(`Failed to process template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process a Handlebars template
   * @param templateContent Template content
   * @param data Template data
   * @returns Processed document content
   */
  private async processHandlebarsTemplate(templateContent: string, data: any): Promise<DocumentContent> {
    try {
      // Dynamically import Handlebars to avoid hard dependency
      const { default: Handlebars } = await import('handlebars');
      
      // Compile the template
      const template = Handlebars.compile(templateContent);
      
      // Execute the template with data
      const processed = template(data);
      
      // Parse the result as JSON
      return JSON.parse(processed) as DocumentContent;
    } catch (error) {
      this.logger.error('Error processing Handlebars template', { error });
      throw new Error(`Failed to process Handlebars template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process a Pug template
   * @param templateContent Template content
   * @param data Template data
   * @returns Processed document content
   */
  private async processPugTemplate(templateContent: string, data: any): Promise<DocumentContent> {
    try {
      // Dynamically import Pug to avoid hard dependency
      const { default: pug } = await import('pug');
      
      // Compile the template
      const template = pug.compile(templateContent);
      
      // Execute the template with data
      const processed = template(data);
      
      // Parse the result as JSON
      return JSON.parse(processed) as DocumentContent;
    } catch (error) {
      this.logger.error('Error processing Pug template', { error });
      throw new Error(`Failed to process Pug template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process an EJS template
   * @param templateContent Template content
   * @param data Template data
   * @returns Processed document content
   */
  private async processEjsTemplate(templateContent: string, data: any): Promise<DocumentContent> {
    try {
      // Dynamically import EJS to avoid hard dependency
      const { default: ejs } = await import('ejs');
      
      // Render the template with data
      const processed = ejs.render(templateContent, data);
      
      // Parse the result as JSON
      return JSON.parse(processed) as DocumentContent;
    } catch (error) {
      this.logger.error('Error processing EJS template', { error });
      throw new Error(`Failed to process EJS template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Draw a table in the PDF document
   * @param doc PDFKit document
   * @param table Table data
   */
  private drawTable(doc: PDFKit.PDFDocument, table: DocumentTable) {
    const { headers, rows, widths = [], alignment = [] } = table;
    const colCount = headers.length;
    
    // Calculate column widths if not provided
    const pageWidth = doc.page.width;
    const margin = 50;
    const tableWidth = pageWidth - 2 * margin;
    
    const columnWidths = widths.length === colCount
      ? widths.map(w => w * tableWidth)
      : Array(colCount).fill(tableWidth / colCount);
    
    // Calculate column alignments if not provided
    const columnAlignments = alignment.length === colCount
      ? alignment
      : Array(colCount).fill('left');
    
    // Calculate row height
    const rowHeight = 20;
    
    // Start point
    let x = doc.x;
    let y = doc.y;
    
    // Draw header row
    doc.font('Helvetica-Bold');
    for (let i = 0; i < colCount; i++) {
      doc.text(
        headers[i],
        x,
        y,
        {
          width: columnWidths[i],
          align: columnAlignments[i]
        }
      );
      x += columnWidths[i];
    }
    
    // Move down for data rows
    y = doc.y + 5;
    doc.moveTo(margin, y).lineTo(margin + tableWidth, y).stroke();
    y += 5;
    
    // Draw data rows
    doc.font('Helvetica');
    for (const row of rows) {
      x = margin;
      doc.y = y;
      
      for (let i = 0; i < colCount; i++) {
        doc.text(
          row[i],
          x,
          y,
          {
            width: columnWidths[i],
            align: columnAlignments[i]
          }
        );
        x += columnWidths[i];
      }
      
      y = doc.y + 5;
    }
    
    // Update document y position
    doc.y = y;
  }

  /**
   * Draw a list in the PDF document
   * @param doc PDFKit document
   * @param list List data
   */
  private drawList(doc: PDFKit.PDFDocument, list: DocumentList) {
    const { items, style = 'bullet' } = list;
    const margin = 50;
    const indent = 15;
    
    // Starting position
    const startX = doc.x;
    let y = doc.y;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let bullet = '•';
      
      // Determine bullet style
      if (style === 'number') {
        bullet = `${i + 1}.`;
      } else if (style === 'check') {
        bullet = '✓';
      }
      
      // Draw bullet
      doc.text(
        bullet,
        startX,
        y,
        { continued: false, lineGap: 5 }
      );
      
      // Draw item text
      doc.text(
        item,
        startX + indent,
        y,
        { indent: 0, lineGap: 5 }
      );
      
      y = doc.y + 5;
    }
    
    // Update document y position
    doc.y = y;
  }
}