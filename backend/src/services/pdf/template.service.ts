import { injectable, inject } from 'inversify';
import fs from 'fs';
import path from 'path';
import { StorageService } from '../storage/storage.service';
import { TYPES } from '../../config/inversify.types';
import { ILoggerService } from '../logger.service';

/**
 * Template metadata interface
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description?: string;
  category: string;
  format: 'html' | 'handlebars' | 'pug' | 'ejs';
  version: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  previewUrl?: string;
  author?: string;
  tags?: string[];
}

/**
 * Interface for the template service
 */
export interface ITemplateService {
  getTemplate(templateId: string): Promise<string | null>;
  getTemplateMetadata(templateId: string): Promise<TemplateMetadata | null>;
  listTemplates(category?: string): Promise<TemplateMetadata[]>;
  saveTemplate(templateId: string, content: string, metadata: Partial<TemplateMetadata>): Promise<TemplateMetadata>;
  deleteTemplate(templateId: string): Promise<boolean>;
}

/**
 * Service responsible for managing document templates
 * Supports fetching, listing, and managing templates
 * Templates can be stored either in the filesystem (development) or cloud storage (production)
 */
@injectable()
export class TemplateService implements ITemplateService {
  private readonly templateBasePath: string = process.env.TEMPLATE_PATH || path.join(process.cwd(), 'templates');
  private readonly useStorage: boolean = process.env.USE_STORAGE_FOR_TEMPLATES === 'true';
  private readonly templateCache: Map<string, { content: string; lastUpdated: Date }> = new Map();
  private readonly metadataCache: Map<string, TemplateMetadata> = new Map();

  constructor(
    @inject(TYPES.StorageService) private storageService: StorageService,
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {
    // Create template directory if it doesn't exist
    if (!this.useStorage) {
      try {
        if (!fs.existsSync(this.templateBasePath)) {
          fs.mkdirSync(this.templateBasePath, { recursive: true });
        }
      } catch (error) {
        this.logger.error('Failed to create template directory', { error });
      }
    }
  }

  /**
   * Get a template by ID
   * @param templateId Template ID
   * @returns Template content string or null if not found
   */
  public async getTemplate(templateId: string): Promise<string | null> {
    try {
      // Check cache first
      const cached = this.templateCache.get(templateId);
      if (cached) {
        // Check if cache is fresh (less than 5 minutes old)
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (cached.lastUpdated > fiveMinutesAgo) {
          return cached.content;
        }
      }

      if (this.useStorage) {
        // Get from cloud storage
        const templatePath = `templates/${templateId}.template`;
        const result = await this.storageService.getFileContent(templatePath);
        
        if (result) {
          // Update cache
          this.templateCache.set(templateId, {
            content: result.toString('utf-8'),
            lastUpdated: new Date()
          });
          return result.toString('utf-8');
        }
        return null;
      } else {
        // Get from filesystem
        const templatePath = path.join(this.templateBasePath, `${templateId}.template`);
        if (!fs.existsSync(templatePath)) {
          return null;
        }
        
        const content = fs.readFileSync(templatePath, 'utf-8');
        
        // Update cache
        this.templateCache.set(templateId, {
          content,
          lastUpdated: new Date()
        });
        
        return content;
      }
    } catch (error) {
      this.logger.error('Error getting template', { templateId, error });
      return null;
    }
  }

  /**
   * Get template metadata
   * @param templateId Template ID
   * @returns Template metadata or null if not found
   */
  public async getTemplateMetadata(templateId: string): Promise<TemplateMetadata | null> {
    try {
      // Check cache first
      const cached = this.metadataCache.get(templateId);
      if (cached) {
        return cached;
      }

      if (this.useStorage) {
        // Get from cloud storage
        const metadataPath = `templates/${templateId}.metadata.json`;
        const result = await this.storageService.getFileContent(metadataPath);
        
        if (result) {
          const metadata = JSON.parse(result.toString('utf-8')) as TemplateMetadata;
          this.metadataCache.set(templateId, metadata);
          return metadata;
        }
        return null;
      } else {
        // Get from filesystem
        const metadataPath = path.join(this.templateBasePath, `${templateId}.metadata.json`);
        if (!fs.existsSync(metadataPath)) {
          return null;
        }
        
        const content = fs.readFileSync(metadataPath, 'utf-8');
        const metadata = JSON.parse(content) as TemplateMetadata;
        
        // Update cache
        this.metadataCache.set(templateId, metadata);
        
        return metadata;
      }
    } catch (error) {
      this.logger.error('Error getting template metadata', { templateId, error });
      return null;
    }
  }

  /**
   * List all available templates
   * @param category Optional category filter
   * @returns Array of template metadata
   */
  public async listTemplates(category?: string): Promise<TemplateMetadata[]> {
    try {
      const metadataList: TemplateMetadata[] = [];
      
      if (this.useStorage) {
        // List from cloud storage
        const files = await this.storageService.listFiles('templates/');
        
        const metadataFiles = files.filter(file => file.name.endsWith('.metadata.json'));
        
        for (const file of metadataFiles) {
          const content = await this.storageService.getFileContent(file.path);
          if (content) {
            try {
              const metadata = JSON.parse(content.toString('utf-8')) as TemplateMetadata;
              
              // Apply category filter if specified
              if (!category || metadata.category === category) {
                metadataList.push(metadata);
                
                // Update cache
                this.metadataCache.set(metadata.id, metadata);
              }
            } catch (error) {
              this.logger.error('Error parsing template metadata', { file: file.path, error });
            }
          }
        }
      } else {
        // List from filesystem
        if (!fs.existsSync(this.templateBasePath)) {
          return [];
        }
        
        const files = fs.readdirSync(this.templateBasePath);
        const metadataFiles = files.filter(file => file.endsWith('.metadata.json'));
        
        for (const file of metadataFiles) {
          const filePath = path.join(this.templateBasePath, file);
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const metadata = JSON.parse(content) as TemplateMetadata;
            
            // Apply category filter if specified
            if (!category || metadata.category === category) {
              metadataList.push(metadata);
              
              // Update cache
              this.metadataCache.set(metadata.id, metadata);
            }
          } catch (error) {
            this.logger.error('Error parsing template metadata', { file: filePath, error });
          }
        }
      }
      
      return metadataList;
    } catch (error) {
      this.logger.error('Error listing templates', { category, error });
      return [];
    }
  }

  /**
   * Save a template
   * @param templateId Template ID
   * @param content Template content
   * @param metadata Template metadata
   * @returns Updated template metadata
   */
  public async saveTemplate(
    templateId: string,
    content: string,
    metadata: Partial<TemplateMetadata>
  ): Promise<TemplateMetadata> {
    try {
      // Get existing metadata or create new
      let existingMetadata = await this.getTemplateMetadata(templateId);
      const now = new Date();
      
      if (!existingMetadata) {
        // Create new metadata
        existingMetadata = {
          id: templateId,
          name: metadata.name || templateId,
          category: metadata.category || 'general',
          format: metadata.format || 'html',
          version: metadata.version || '1.0.0',
          createdAt: now,
          updatedAt: now,
          ...metadata
        };
      } else {
        // Update existing metadata
        existingMetadata = {
          ...existingMetadata,
          ...metadata,
          updatedAt: now
        };
      }
      
      const metadataContent = JSON.stringify(existingMetadata, null, 2);
      
      if (this.useStorage) {
        // Save to cloud storage
        const templatePath = `templates/${templateId}.template`;
        const metadataPath = `templates/${templateId}.metadata.json`;
        
        await this.storageService.saveFileContent(templatePath, Buffer.from(content, 'utf-8'), { contentType: 'text/plain' });
        await this.storageService.saveFileContent(metadataPath, Buffer.from(metadataContent, 'utf-8'), { contentType: 'application/json' });
      } else {
        // Save to filesystem
        const templatePath = path.join(this.templateBasePath, `${templateId}.template`);
        const metadataPath = path.join(this.templateBasePath, `${templateId}.metadata.json`);
        
        fs.writeFileSync(templatePath, content, 'utf-8');
        fs.writeFileSync(metadataPath, metadataContent, 'utf-8');
      }
      
      // Update caches
      this.templateCache.set(templateId, {
        content,
        lastUpdated: new Date()
      });
      
      this.metadataCache.set(templateId, existingMetadata);
      
      return existingMetadata;
    } catch (error) {
      this.logger.error('Error saving template', { templateId, error });
      throw new Error(`Failed to save template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a template
   * @param templateId Template ID
   * @returns True if deletion was successful
   */
  public async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      if (this.useStorage) {
        // Delete from cloud storage
        const templatePath = `templates/${templateId}.template`;
        const metadataPath = `templates/${templateId}.metadata.json`;
        
        await this.storageService.deleteFile(templatePath);
        await this.storageService.deleteFile(metadataPath);
      } else {
        // Delete from filesystem
        const templatePath = path.join(this.templateBasePath, `${templateId}.template`);
        const metadataPath = path.join(this.templateBasePath, `${templateId}.metadata.json`);
        
        if (fs.existsSync(templatePath)) {
          fs.unlinkSync(templatePath);
        }
        
        if (fs.existsSync(metadataPath)) {
          fs.unlinkSync(metadataPath);
        }
      }
      
      // Clear from caches
      this.templateCache.delete(templateId);
      this.metadataCache.delete(templateId);
      
      return true;
    } catch (error) {
      this.logger.error('Error deleting template', { templateId, error });
      return false;
    }
  }
}