import { injectable, inject } from 'inversify';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DocumentContent, DocumentGenerationOptions, DocumentGenerationResult, DocumentSection, DocumentTable, DocumentList } from '../../../types/pdf-utils';
import { BasePDFProvider } from './base-provider';
import { StorageService } from '../../storage/storage.service';
import { ITemplateService, TemplateService } from '../template.service';
import { TYPES } from '../../../config/inversify.types';
import { ILoggerService } from '../../logger.service';

/**
 * PDF generator using pdf-lib library
 */
@injectable()
export class PDFLibProvider extends BasePDFProvider {
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
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Set metadata
      if (content.metadata) {
        pdfDoc.setTitle(content.metadata.title || content.title || 'Document');
        pdfDoc.setAuthor(content.metadata.author || 'Fluxori System');
        pdfDoc.setSubject(content.metadata.subject || '');
        pdfDoc.setKeywords([...(content.metadata.keywords?.split(',') || []), 'Fluxori']);
        pdfDoc.setCreator('Fluxori PDF Service');
      }
      
      // Embed the standard font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Add a page
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const margin = 50;
      
      // Set initial position
      let currentY = height - margin;
      const pageWidth = width - 2 * margin;
      
      // Add title if provided
      if (content.title) {
        page.drawText(content.title, {
          x: margin,
          y: currentY,
          size: 18,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        currentY -= 30; // Move down after title
      }
      
      // Process each section
      for (const section of content.sections) {
        // Add section heading if provided
        if (section.heading) {
          // Check if we need a new page
          if (currentY < margin + 100) {
            const newPage = pdfDoc.addPage();
            currentY = newPage.getSize().height - margin;
          }
          
          page.drawText(section.heading, {
            x: margin,
            y: currentY,
            size: 14,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          currentY -= 20; // Move down after heading
        }
        
        // Process section content based on type
        if (typeof section.content === 'string') {
          // Text content
          const textLines = this.wrapText(section.content, font, 12, pageWidth);
          
          for (const line of textLines) {
            // Check if we need a new page
            if (currentY < margin + 50) {
              const newPage = pdfDoc.addPage();
              currentY = newPage.getSize().height - margin;
            }
            
            page.drawText(line, {
              x: margin,
              y: currentY,
              size: 12,
              font: font,
              color: rgb(0, 0, 0),
            });
            
            currentY -= 15; // Move down for next line
          }
          
          currentY -= 10; // Add space after text block
        } else if ('headers' in section.content) {
          // Table content
          currentY = this.drawTable(page, section.content, margin, currentY, font, boldFont, pdfDoc);
        } else if ('items' in section.content) {
          // List content
          currentY = this.drawList(page, section.content, margin, currentY, font, boldFont, pdfDoc);
        }
        
        // Add extra space between sections
        currentY -= 15;
      }
      
      // Add footer if provided
      if (content.footer) {
        const pageCount = pdfDoc.getPageCount();
        
        for (let i = 0; i < pageCount; i++) {
          const page = pdfDoc.getPage(i);
          const { height } = page.getSize();
          
          // Add footer text
          page.drawText(content.footer.text, {
            x: margin,
            y: margin / 2,
            size: 10,
            font: font,
            color: rgb(0.5, 0.5, 0.5),
          });
          
          // Add page numbers if requested
          if (content.footer.pageNumbers) {
            page.drawText(`Page ${i + 1} of ${pageCount}`, {
              x: width - margin - 100,
              y: margin / 2,
              size: 10,
              font: font,
              color: rgb(0.5, 0.5, 0.5),
            });
          }
        }
      }
      
      // Generate the PDF bytes
      const pdfBytes = await pdfDoc.save();
      
      // Create a unique filename if not provided
      const fileName = options?.fileName || `document-${Date.now()}.pdf`;
      
      // Save to storage
      const documentId = this.generateDocumentId();
      const path = `documents/${documentId}/${fileName}`;
      
      const fileInfo = await this.storageService.uploadFile(
        Buffer.from(pdfBytes),
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
      return {
        url: fileInfo.url,
        fileName: fileInfo.name,
        mimeType: 'application/pdf',
        size: pdfBytes.length,
        metadata: options?.metadataFields,
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Error generating PDF', { error });
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
   * Wrap text to fit within a specified width
   * @param text Text to wrap
   * @param font Font to use
   * @param fontSize Font size
   * @param maxWidth Maximum width
   * @returns Array of wrapped text lines
   */
  private wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  /**
   * Draw a table on a PDF page
   * @param page PDF page
   * @param table Table data
   * @param x X position
   * @param y Y position
   * @param font Regular font
   * @param boldFont Bold font
   * @param pdfDoc PDF document
   * @returns New Y position after drawing
   */
  private drawTable(
    page: any,
    table: DocumentTable,
    x: number,
    y: number,
    font: any,
    boldFont: any,
    pdfDoc: any
  ): number {
    const { headers, rows, widths = [], alignment = [] } = table;
    const { width, height } = page.getSize();
    const margin = 50;
    const availableWidth = width - 2 * margin;
    
    // Calculate column widths if not provided
    const columnWidths = widths.length === headers.length
      ? widths
      : headers.map(() => availableWidth / headers.length);
    
    // Calculate column alignments if not provided
    const columnAlignments = alignment.length === headers.length
      ? alignment
      : headers.map(() => 'left' as 'left' | 'center' | 'right');
    
    // Calculate row height
    const rowHeight = 20;
    
    // Check if we need a new page for the table header
    if (y < margin + rowHeight * (rows.length + 1)) {
      const newPage = pdfDoc.addPage();
      y = newPage.getSize().height - margin;
      page = newPage;
    }
    
    // Draw header row
    let currentX = x;
    for (let i = 0; i < headers.length; i++) {
      const headerText = headers[i];
      const colWidth = columnWidths[i];
      const align = columnAlignments[i];
      
      let textX = currentX;
      if (align === 'center') {
        textX = currentX + colWidth / 2 - boldFont.widthOfTextAtSize(headerText, 12) / 2;
      } else if (align === 'right') {
        textX = currentX + colWidth - boldFont.widthOfTextAtSize(headerText, 12);
      }
      
      page.drawText(headerText, {
        x: textX,
        y: y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      currentX += colWidth;
    }
    
    y -= rowHeight;
    
    // Draw separator line
    page.drawLine({
      start: { x, y: y + rowHeight / 2 },
      end: { x: x + availableWidth, y: y + rowHeight / 2 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    // Draw data rows
    for (const row of rows) {
      // Check if we need a new page
      if (y < margin + rowHeight) {
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - margin;
        page = newPage;
      }
      
      currentX = x;
      for (let i = 0; i < row.length; i++) {
        const cellText = row[i];
        const colWidth = columnWidths[i];
        const align = columnAlignments[i];
        
        let textX = currentX;
        if (align === 'center') {
          textX = currentX + colWidth / 2 - font.widthOfTextAtSize(cellText, 10) / 2;
        } else if (align === 'right') {
          textX = currentX + colWidth - font.widthOfTextAtSize(cellText, 10);
        }
        
        page.drawText(cellText, {
          x: textX,
          y: y,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        currentX += colWidth;
      }
      
      y -= rowHeight;
    }
    
    return y;
  }

  /**
   * Draw a list on a PDF page
   * @param page PDF page
   * @param list List data
   * @param x X position
   * @param y Y position
   * @param font Regular font
   * @param boldFont Bold font
   * @param pdfDoc PDF document
   * @returns New Y position after drawing
   */
  private drawList(
    page: any,
    list: DocumentList,
    x: number,
    y: number,
    font: any,
    boldFont: any,
    pdfDoc: any
  ): number {
    const { items, style = 'bullet' } = list;
    const { width, height } = page.getSize();
    const margin = 50;
    const itemIndent = 15;
    const itemSpacing = 15;
    
    let currentY = y;
    
    for (let i = 0; i < items.length; i++) {
      // Check if we need a new page
      if (currentY < margin + 50) {
        const newPage = pdfDoc.addPage();
        currentY = newPage.getSize().height - margin;
        page = newPage;
      }
      
      const item = items[i];
      let bullet = '•';
      
      // Determine bullet style
      if (style === 'number') {
        bullet = `${i + 1}.`;
      } else if (style === 'check') {
        bullet = '✓';
      }
      
      // Draw bullet
      page.drawText(bullet, {
        x,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      // Draw item text with wrapping
      const wrappedText = this.wrapText(item, font, 12, width - 2 * margin - itemIndent);
      for (let j = 0; j < wrappedText.length; j++) {
        const line = wrappedText[j];
        const lineX = j === 0 ? x + itemIndent : x + itemIndent * 2;
        
        page.drawText(line, {
          x: lineX,
          y: currentY,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        currentY -= itemSpacing;
      }
    }
    
    return currentY;
  }
}