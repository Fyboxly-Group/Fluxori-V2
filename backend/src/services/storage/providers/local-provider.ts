import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as util from 'util';
import { BaseStorageProvider } from './base-provider';
import { FileInfo, FileMetadata, SignedUrlOptions, UploadOptions } from '../../../types/storage-utils';
import { injectable } from 'inversify';

// Promisify fs functions
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const stat = util.promisify(fs.stat);
const readdir = util.promisify(fs.readdir);
const copyFile = util.promisify(fs.copyFile);

/**
 * Local File System Storage Provider Implementation
 */
@injectable()
export class LocalStorageProvider extends BaseStorageProvider {
  private baseDir: string;
  private baseUrl: string;

  constructor() {
    super();
    this.baseDir = process.env.LOCAL_STORAGE_DIR || path.join(process.cwd(), 'storage');
    this.baseUrl = process.env.LOCAL_STORAGE_URL || 'http://localhost:3000/storage';
    
    // Create base directory if it doesn't exist
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Upload a file to local file system
   */
  public async uploadFile(
    file: Buffer,
    filename: string,
    options?: UploadOptions
  ): Promise<FileInfo> {
    try {
      // Generate a unique filename unless custom filename is provided
      const uniqueFilename = options?.customFilename || this.generateUniqueFilename(filename);
      
      // Build the file path
      const relativeFilePath = this.buildFilePath(uniqueFilename, options);
      const absoluteFilePath = path.join(this.baseDir, relativeFilePath);
      
      // Ensure directory exists
      const directory = path.dirname(absoluteFilePath);
      await mkdir(directory, { recursive: true });
      
      // Write the file to disk
      await writeFile(absoluteFilePath, file);
      
      // Create metadata file if metadata is provided
      if (options?.metadata || options?.tags) {
        const metadataPath = `${absoluteFilePath}.metadata.json`;
        const metadata = {
          contentType: options?.contentType || 'application/octet-stream',
          isPublic: options?.isPublic !== false,
          organizationId: options?.organizationId,
          userId: options?.userId,
          tags: options?.tags,
          metadata: options?.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      }
      
      // Get file stats
      const stats = await stat(absoluteFilePath);
      
      // Return file info
      return {
        id: relativeFilePath,
        url: `${this.baseUrl}/${relativeFilePath}`,
        name: path.basename(relativeFilePath),
        path: relativeFilePath,
        size: stats.size,
        contentType: options?.contentType || 'application/octet-stream',
        isPublic: options?.isPublic !== false,
        metadata: options?.metadata,
      };
    } catch (error) {
      console.error('Error uploading file to local storage:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to upload file to local storage');
    }
  }

  /**
   * Delete a file from local file system
   */
  public async deleteFile(filePathOrUrl: string): Promise<boolean> {
    try {
      // Parse the URL or path to get the file path
      const relativeFilePath = this.parseUrl(filePathOrUrl);
      const absoluteFilePath = path.join(this.baseDir, relativeFilePath);
      
      // Check if file exists
      if (!fs.existsSync(absoluteFilePath)) {
        return false;
      }
      
      // Delete the file
      await unlink(absoluteFilePath);
      
      // Delete metadata file if it exists
      const metadataPath = `${absoluteFilePath}.metadata.json`;
      if (fs.existsSync(metadataPath)) {
        await unlink(metadataPath);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting file from local storage:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Get a signed URL for uploading or downloading
   * Note: For local provider, this just returns a regular URL
   */
  public async getSignedUrl(
    filepath: string,
    options: SignedUrlOptions
  ): Promise<string> {
    try {
      // For local storage, we don't need real signed URLs
      // Instead, we'll generate a temporary token in the URL
      
      const token = crypto.randomBytes(16).toString('hex');
      const expiresAt = options.expires ? options.expires.getTime() : Date.now() + 15 * 60 * 1000;
      const queryParams = new URLSearchParams({
        token,
        expires: expiresAt.toString(),
        action: options.action,
      });
      
      if (options.action === 'write' && options.contentType) {
        queryParams.append('contentType', options.contentType);
      }
      
      if (options.action === 'read' && options.responseDisposition) {
        queryParams.append('responseDisposition', options.responseDisposition);
      }
      
      return `${this.baseUrl}/${filepath}?${queryParams.toString()}`;
    } catch (error) {
      console.error('Error generating signed URL:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Get file metadata
   */
  public async getFileMetadata(filePathOrUrl: string): Promise<FileMetadata | null> {
    try {
      // Parse the URL or path to get the file path
      const relativeFilePath = this.parseUrl(filePathOrUrl);
      const absoluteFilePath = path.join(this.baseDir, relativeFilePath);
      
      // Check if file exists
      if (!fs.existsSync(absoluteFilePath)) {
        return null;
      }
      
      // Get file stats
      const stats = await stat(absoluteFilePath);
      
      // Check for metadata file
      const metadataPath = `${absoluteFilePath}.metadata.json`;
      let metadata: any = {};
      let contentType = 'application/octet-stream';
      let isPublic = true;
      let tags: string[] | undefined;
      let organizationId: string | undefined;
      let userId: string | undefined;
      
      if (fs.existsSync(metadataPath)) {
        const metadataContent = await readFile(metadataPath, 'utf-8');
        const parsedMetadata = JSON.parse(metadataContent);
        
        metadata = parsedMetadata.metadata || {};
        contentType = parsedMetadata.contentType || 'application/octet-stream';
        isPublic = parsedMetadata.isPublic !== false;
        tags = parsedMetadata.tags;
        organizationId = parsedMetadata.organizationId;
        userId = parsedMetadata.userId;
      }
      
      return {
        id: relativeFilePath,
        name: path.basename(relativeFilePath),
        path: relativeFilePath,
        url: `${this.baseUrl}/${relativeFilePath}`,
        contentType,
        size: stats.size,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
        organizationId,
        userId,
        isPublic,
        tags,
        metadata,
      };
    } catch (error) {
      console.error('Error getting file metadata:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * List files in a directory
   */
  public async listFiles(
    folder?: string,
    options?: { prefix?: string; limit?: number; marker?: string }
  ): Promise<{ files: FileMetadata[]; nextMarker?: string }> {
    try {
      const prefix = options?.prefix || '';
      const folderPath = folder ? path.join(this.baseDir, folder) : this.baseDir;
      
      // Ensure directory exists
      if (!fs.existsSync(folderPath)) {
        return { files: [] };
      }
      
      // Read all files in the directory
      const items = await readdir(folderPath, { withFileTypes: true });
      
      // Filter to get only files, not directories or metadata files
      const files = items
        .filter(item => item.isFile() && !item.name.endsWith('.metadata.json'))
        .filter(item => item.name.startsWith(prefix))
        .map(item => path.join(folder || '', item.name));
      
      // Apply pagination
      const limit = options?.limit || files.length;
      const marker = options?.marker;
      
      let startIndex = 0;
      if (marker) {
        const markerIndex = files.findIndex(file => file === marker);
        if (markerIndex !== -1) {
          startIndex = markerIndex + 1;
        }
      }
      
      const paginatedFiles = files.slice(startIndex, startIndex + limit);
      
      // Get metadata for each file
      const fileMetadata: FileMetadata[] = await Promise.all(
        paginatedFiles.map(async (file) => {
          const metadata = await this.getFileMetadata(file);
          
          if (!metadata) {
            // If metadata can't be retrieved, return a minimal object
            const absoluteFilePath = path.join(this.baseDir, file);
            const stats = await stat(absoluteFilePath);
            
            return {
              id: file,
              name: path.basename(file),
              path: file,
              url: `${this.baseUrl}/${file}`,
              contentType: 'application/octet-stream',
              size: stats.size,
              createdAt: stats.birthtime,
              updatedAt: stats.mtime,
              isPublic: true,
            };
          }
          
          return metadata;
        })
      );
      
      // Determine if there are more files
      const nextMarker = startIndex + limit < files.length ? files[startIndex + limit - 1] : undefined;
      
      return {
        files: fileMetadata,
        nextMarker,
      };
    } catch (error) {
      console.error('Error listing files:', error instanceof Error ? error.message : String(error));
      return { files: [] };
    }
  }

  /**
   * Copy a file from one location to another
   */
  public async copyFile(
    sourcePathOrUrl: string,
    destinationPath: string,
    options?: UploadOptions
  ): Promise<FileInfo> {
    try {
      // Parse the source URL or path to get the file path
      const sourceRelativePath = this.parseUrl(sourcePathOrUrl);
      const sourceAbsolutePath = path.join(this.baseDir, sourceRelativePath);
      
      // Build the destination path
      const destAbsolutePath = path.join(this.baseDir, destinationPath);
      
      // Ensure destination directory exists
      const destDir = path.dirname(destAbsolutePath);
      await mkdir(destDir, { recursive: true });
      
      // Copy the file
      await copyFile(sourceAbsolutePath, destAbsolutePath);
      
      // Copy or create metadata
      const sourceMetadataPath = `${sourceAbsolutePath}.metadata.json`;
      const destMetadataPath = `${destAbsolutePath}.metadata.json`;
      
      if (fs.existsSync(sourceMetadataPath)) {
        // If source has metadata, copy and update it
        const metadataContent = await readFile(sourceMetadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        
        // Update metadata with new options
        if (options?.contentType) {
          metadata.contentType = options.contentType;
        }
        
        if (options?.isPublic !== undefined) {
          metadata.isPublic = options.isPublic;
        }
        
        if (options?.metadata) {
          metadata.metadata = options.metadata;
        }
        
        if (options?.tags) {
          metadata.tags = options.tags;
        }
        
        if (options?.organizationId) {
          metadata.organizationId = options.organizationId;
        }
        
        if (options?.userId) {
          metadata.userId = options.userId;
        }
        
        // Update timestamp
        metadata.updatedAt = new Date().toISOString();
        
        await writeFile(destMetadataPath, JSON.stringify(metadata, null, 2));
      } else if (options) {
        // If no source metadata but options provided, create new metadata
        const metadata = {
          contentType: options.contentType || 'application/octet-stream',
          isPublic: options.isPublic !== false,
          organizationId: options.organizationId,
          userId: options.userId,
          tags: options.tags,
          metadata: options.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await writeFile(destMetadataPath, JSON.stringify(metadata, null, 2));
      }
      
      // Get file stats
      const stats = await stat(destAbsolutePath);
      
      // Return file info
      return {
        id: destinationPath,
        url: `${this.baseUrl}/${destinationPath}`,
        name: path.basename(destinationPath),
        path: destinationPath,
        size: stats.size,
        contentType: options?.contentType || 'application/octet-stream',
        isPublic: options?.isPublic !== false,
        metadata: options?.metadata,
      };
    } catch (error) {
      console.error('Error copying file:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to copy file');
    }
  }

  /**
   * Move a file from one location to another
   */
  public async moveFile(
    sourcePathOrUrl: string,
    destinationPath: string,
    options?: UploadOptions
  ): Promise<FileInfo> {
    try {
      // Copy the file first
      const fileInfo = await this.copyFile(sourcePathOrUrl, destinationPath, options);
      
      // Then delete the original
      await this.deleteFile(sourcePathOrUrl);
      
      return fileInfo;
    } catch (error) {
      console.error('Error moving file:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to move file');
    }
  }

  /**
   * Check if a file exists
   */
  public async fileExists(filePathOrUrl: string): Promise<boolean> {
    try {
      // Parse the URL or path to get the file path
      const relativeFilePath = this.parseUrl(filePathOrUrl);
      const absoluteFilePath = path.join(this.baseDir, relativeFilePath);
      
      return fs.existsSync(absoluteFilePath);
    } catch (error) {
      console.error('Error checking if file exists:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Make a file public (not really applicable for local storage)
   */
  public async makeFilePublic(filePathOrUrl: string): Promise<string> {
    try {
      // Parse the URL or path to get the file path
      const relativeFilePath = this.parseUrl(filePathOrUrl);
      const absoluteFilePath = path.join(this.baseDir, relativeFilePath);
      
      // Check if file exists
      if (!fs.existsSync(absoluteFilePath)) {
        throw new Error('File not found');
      }
      
      // Update metadata file if it exists
      const metadataPath = `${absoluteFilePath}.metadata.json`;
      if (fs.existsSync(metadataPath)) {
        const metadataContent = await readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        
        metadata.isPublic = true;
        metadata.updatedAt = new Date().toISOString();
        
        await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      } else {
        // Create new metadata file
        const metadata = {
          contentType: 'application/octet-stream',
          isPublic: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      }
      
      // Return the URL
      return `${this.baseUrl}/${relativeFilePath}`;
    } catch (error) {
      console.error('Error making file public:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to make file public');
    }
  }

  /**
   * Make a file private (not really applicable for local storage)
   */
  public async makeFilePrivate(filePathOrUrl: string): Promise<boolean> {
    try {
      // Parse the URL or path to get the file path
      const relativeFilePath = this.parseUrl(filePathOrUrl);
      const absoluteFilePath = path.join(this.baseDir, relativeFilePath);
      
      // Check if file exists
      if (!fs.existsSync(absoluteFilePath)) {
        return false;
      }
      
      // Update metadata file if it exists
      const metadataPath = `${absoluteFilePath}.metadata.json`;
      if (fs.existsSync(metadataPath)) {
        const metadataContent = await readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        
        metadata.isPublic = false;
        metadata.updatedAt = new Date().toISOString();
        
        await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      } else {
        // Create new metadata file
        const metadata = {
          contentType: 'application/octet-stream',
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      }
      
      return true;
    } catch (error) {
      console.error('Error making file private:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}