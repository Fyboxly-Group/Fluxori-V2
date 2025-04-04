import { Storage, Bucket, GetSignedUrlConfig } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';
import { BaseStorageProvider } from './base-provider';
import { FileInfo, FileMetadata, SignedUrlOptions, UploadOptions } from '../../../types/storage-utils';
import { injectable } from 'inversify';

/**
 * Google Cloud Storage Provider Implementation
 */
@injectable()
export class GCSStorageProvider extends BaseStorageProvider {
  private storage: Storage;
  private bucket: Bucket;
  private bucketName: string;

  constructor() {
    super();
    this.bucketName = process.env.GCS_BUCKET_NAME || 'fluxori-v2-bucket';
    
    if (process.env.NODE_ENV === 'production') {
      // In production, use GCP default authentication
      this.storage = new Storage();
    } else {
      // In development or test, use key file if available, otherwise default credentials
      const keyFilePath = process.env.GCS_KEY_FILE || path.join(__dirname, '../../../../service-account-key.json');
      try {
        if (fs.existsSync(keyFilePath)) {
          this.storage = new Storage({ keyFilename: keyFilePath });
        } else {
          console.warn('GCS key file not found, using default credentials');
          this.storage = new Storage();
        }
      } catch (error) {
        console.error('Error initializing GCS:', error instanceof Error ? error.message : String(error));
        this.storage = new Storage();
      }
    }
    
    this.bucket = this.storage.bucket(this.bucketName);
  }

  /**
   * Upload a file to Google Cloud Storage
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
      const filePath = this.buildFilePath(uniqueFilename, options);
      
      // Get file object
      const fileObject = this.bucket.file(filePath);
      
      // Upload file
      await fileObject.save(file, {
        contentType: options?.contentType,
        metadata: {
          contentType: options?.contentType,
          metadata: options?.metadata,
          cacheControl: 'public, max-age=31536000', // Cache for 1 year
        },
      });
      
      // Make the file publicly accessible if isPublic is true
      let fileUrl: string;
      if (options?.isPublic !== false) {
        await fileObject.makePublic();
        fileUrl = `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
      } else {
        fileUrl = await this.getSignedUrl(filePath, { 
          action: 'read',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
      }
      
      // Get file metadata
      const [metadata] = await fileObject.getMetadata();
      
      return {
        id: filePath,
        url: fileUrl,
        name: path.basename(filePath),
        path: filePath,
        size: parseInt(metadata.size),
        contentType: metadata.contentType || options?.contentType || 'application/octet-stream',
        isPublic: options?.isPublic !== false,
        metadata: options?.metadata
      };
    } catch (error) {
      console.error('Error uploading file to GCS:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to upload file to Google Cloud Storage');
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   */
  public async deleteFile(filePathOrUrl: string): Promise<boolean> {
    try {
      // Parse the URL or path to get the file path
      const filePath = this.parseUrl(filePathOrUrl);
      
      // Delete the file
      await this.bucket.file(filePath).delete();
      
      return true;
    } catch (error) {
      console.error('Error deleting file from GCS:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Get a signed URL for uploading or downloading
   */
  public async getSignedUrl(
    filepath: string,
    options: SignedUrlOptions
  ): Promise<string> {
    try {
      const file = this.bucket.file(filepath);
      
      const signedUrlConfig: GetSignedUrlConfig = {
        version: 'v4',
        action: options.action,
        expires: options.expires ? options.expires.getTime() : Date.now() + 15 * 60 * 1000, // Default 15 minutes
      };
      
      if (options.action === 'write' && options.contentType) {
        signedUrlConfig.contentType = options.contentType;
      }
      
      if (options.action === 'read' && options.responseDisposition) {
        signedUrlConfig.responseDisposition = options.responseDisposition;
      }
      
      const [url] = await file.getSignedUrl(signedUrlConfig);
      
      return url;
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
      const filePath = this.parseUrl(filePathOrUrl);
      
      // Get file object
      const file = this.bucket.file(filePath);
      
      // Get metadata
      const [metadata] = await file.getMetadata();
      
      // Check if file exists
      const exists = await this.fileExists(filePath);
      if (!exists) {
        return null;
      }
      
      return {
        id: filePath,
        name: path.basename(filePath),
        path: filePath,
        url: `https://storage.googleapis.com/${this.bucketName}/${filePath}`,
        contentType: metadata.contentType || 'application/octet-stream',
        size: parseInt(metadata.size),
        createdAt: new Date(metadata.timeCreated),
        updatedAt: new Date(metadata.updated),
        organizationId: metadata.metadata?.organizationId,
        userId: metadata.metadata?.userId,
        isPublic: !!metadata.acl?.some(acl => acl.entity === 'allUsers'),
        tags: metadata.metadata?.tags ? JSON.parse(metadata.metadata.tags) : undefined,
        metadata: metadata.metadata,
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
      const folderPath = folder ? `${folder}/` : '';
      const fullPrefix = folderPath + prefix;
      
      // List files with given options
      const [files, { nextPageToken }] = await this.bucket.getFiles({
        prefix: fullPrefix,
        maxResults: options?.limit,
        pageToken: options?.marker,
      });
      
      // Get metadata for each file
      const fileMetadata: FileMetadata[] = await Promise.all(
        files.map(async (file) => {
          const [metadata] = await file.getMetadata();
          
          return {
            id: file.name,
            name: path.basename(file.name),
            path: file.name,
            url: `https://storage.googleapis.com/${this.bucketName}/${file.name}`,
            contentType: metadata.contentType || 'application/octet-stream',
            size: parseInt(metadata.size),
            createdAt: new Date(metadata.timeCreated),
            updatedAt: new Date(metadata.updated),
            organizationId: metadata.metadata?.organizationId,
            userId: metadata.metadata?.userId,
            isPublic: !!metadata.acl?.some(acl => acl.entity === 'allUsers'),
            tags: metadata.metadata?.tags ? JSON.parse(metadata.metadata.tags) : undefined,
            metadata: metadata.metadata,
          };
        })
      );
      
      return {
        files: fileMetadata,
        nextMarker: nextPageToken,
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
      const sourcePath = this.parseUrl(sourcePathOrUrl);
      
      // Get source file
      const sourceFile = this.bucket.file(sourcePath);
      
      // Get destination file
      const destFile = this.bucket.file(destinationPath);
      
      // Copy the file
      await sourceFile.copy(destFile, {
        metadata: {
          contentType: options?.contentType,
          metadata: options?.metadata,
        },
      });
      
      // Make the file publicly accessible if isPublic is true
      let fileUrl: string;
      if (options?.isPublic !== false) {
        await destFile.makePublic();
        fileUrl = `https://storage.googleapis.com/${this.bucketName}/${destinationPath}`;
      } else {
        fileUrl = await this.getSignedUrl(destinationPath, { 
          action: 'read',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
      }
      
      // Get file metadata
      const [metadata] = await destFile.getMetadata();
      
      return {
        id: destinationPath,
        url: fileUrl,
        name: path.basename(destinationPath),
        path: destinationPath,
        size: parseInt(metadata.size),
        contentType: metadata.contentType || options?.contentType || 'application/octet-stream',
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
      const filePath = this.parseUrl(filePathOrUrl);
      
      // Get file object
      const file = this.bucket.file(filePath);
      
      // Check if file exists
      const [exists] = await file.exists();
      
      return exists;
    } catch (error) {
      console.error('Error checking if file exists:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Make a file public
   */
  public async makeFilePublic(filePathOrUrl: string): Promise<string> {
    try {
      // Parse the URL or path to get the file path
      const filePath = this.parseUrl(filePathOrUrl);
      
      // Get file object
      const file = this.bucket.file(filePath);
      
      // Make the file public
      await file.makePublic();
      
      // Return the public URL
      return `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
    } catch (error) {
      console.error('Error making file public:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to make file public');
    }
  }

  /**
   * Make a file private
   */
  public async makeFilePrivate(filePathOrUrl: string): Promise<boolean> {
    try {
      // Parse the URL or path to get the file path
      const filePath = this.parseUrl(filePathOrUrl);
      
      // Get file object
      const file = this.bucket.file(filePath);
      
      // Make the file private
      await file.makePrivate();
      
      return true;
    } catch (error) {
      console.error('Error making file private:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}