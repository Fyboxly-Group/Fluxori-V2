import * as path from 'path';
import * as crypto from 'crypto';
import { StorageProvider, FileInfo, UploadOptions, SignedUrlOptions, FileMetadata } from '../../../types/storage-utils';

/**
 * Base storage provider with common functionality
 */
export abstract class BaseStorageProvider implements StorageProvider {
  /**
   * Generate a unique filename to prevent collisions
   */
  protected generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalFilename);
    const basename = path.basename(originalFilename, extension);
    
    return `${basename}-${timestamp}-${random}${extension}`;
  }

  /**
   * Build the file path with proper folder structure
   */
  protected buildFilePath(filename: string, options?: UploadOptions): string {
    const folder = options?.folder || '';
    return folder ? `${folder}/${filename}` : filename;
  }

  /**
   * Parse a URL to extract file path
   */
  protected parseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathName = urlObj.pathname;
      
      // Remove leading bucket or container name if present
      const segments = pathName.split('/');
      return segments.slice(segments[0] === '' ? 2 : 1).join('/');
    } catch (error) {
      // If not a valid URL, treat as a path
      return url;
    }
  }
  
  /**
   * Get a file stream
   * Default implementation returns null - providers should override
   */
  public async getFileStream(filePathOrUrl: string): Promise<NodeJS.ReadableStream | null> {
    return null;
  }

  /**
   * Abstract methods that must be implemented by concrete providers
   */
  public abstract uploadFile(
    file: Buffer,
    filename: string,
    options?: UploadOptions
  ): Promise<FileInfo>;

  public abstract deleteFile(filePathOrUrl: string): Promise<boolean>;

  public abstract getSignedUrl(
    filepath: string,
    options: SignedUrlOptions
  ): Promise<string>;

  public abstract getFileMetadata(filePathOrUrl: string): Promise<FileMetadata | null>;

  public abstract listFiles(
    folder?: string,
    options?: { prefix?: string; limit?: number; marker?: string }
  ): Promise<{ files: FileMetadata[]; nextMarker?: string }>;

  public abstract copyFile(
    sourcePathOrUrl: string,
    destinationPath: string,
    options?: UploadOptions
  ): Promise<FileInfo>;

  public abstract moveFile(
    sourcePathOrUrl: string,
    destinationPath: string,
    options?: UploadOptions
  ): Promise<FileInfo>;

  public abstract fileExists(filePathOrUrl: string): Promise<boolean>;

  public abstract makeFilePublic(filePathOrUrl: string): Promise<string>;

  public abstract makeFilePrivate(filePathOrUrl: string): Promise<boolean>;
}