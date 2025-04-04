import { injectable, inject } from 'inversify';
import { 
  StorageService as IStorageService,
  StorageProvider, 
  StorageProviderType,
  FileInfo,
  UploadOptions,
  SignedUrlOptions,
  FileMetadata
} from '../../types/storage-utils';
import { GCSStorageProvider } from './providers/gcs-provider';
import { S3StorageProvider } from './providers/s3-provider';
import { LocalStorageProvider } from './providers/local-provider';
import { TYPES } from '../../config/inversify';

/**
 * Storage Service Implementation
 * This service manages file storage with multiple provider support
 */
@injectable()
export class StorageService implements IStorageService {
  private providers: Map<StorageProviderType, StorageProvider>;
  private defaultProvider: StorageProviderType;

  constructor(
    @inject(TYPES.GCSStorageProvider) gcsProvider: GCSStorageProvider,
    @inject(TYPES.S3StorageProvider) s3Provider: S3StorageProvider,
    @inject(TYPES.LocalStorageProvider) localProvider: LocalStorageProvider
  ) {
    this.providers = new Map();
    
    // Register all providers
    this.providers.set(StorageProviderType.GCS, gcsProvider);
    this.providers.set(StorageProviderType.S3, s3Provider);
    this.providers.set(StorageProviderType.LOCAL, localProvider);
    
    // Set default provider based on environment
    const configuredProvider = process.env.DEFAULT_STORAGE_PROVIDER?.toLowerCase();
    
    if (configuredProvider === 'aws' || configuredProvider === 's3') {
      this.defaultProvider = StorageProviderType.S3;
    } else if (configuredProvider === 'local') {
      this.defaultProvider = StorageProviderType.LOCAL;
    } else {
      // Default to GCS if not specified
      this.defaultProvider = StorageProviderType.GCS;
    }
    
    // Use local provider in development by default
    if (process.env.NODE_ENV === 'development' && !configuredProvider) {
      this.defaultProvider = StorageProviderType.LOCAL;
    }
  }

  /**
   * Get the default provider
   */
  public getDefaultProvider(): StorageProvider {
    return this.providers.get(this.defaultProvider)!;
  }

  /**
   * Get a specific provider
   */
  public getProvider(type: StorageProviderType): StorageProvider {
    const provider = this.providers.get(type);
    
    if (!provider) {
      throw new Error(`Storage provider "${type}" not found`);
    }
    
    return provider;
  }

  /**
   * Upload a file using the default provider
   */
  public async uploadFile(
    file: Buffer,
    filename: string,
    options?: UploadOptions
  ): Promise<FileInfo> {
    return this.getDefaultProvider().uploadFile(file, filename, options);
  }

  /**
   * Delete a file using the appropriate provider
   */
  public async deleteFile(filePathOrUrl: string, providerType?: StorageProviderType): Promise<boolean> {
    // If provider type is specified, use that provider
    if (providerType) {
      return this.getProvider(providerType).deleteFile(filePathOrUrl);
    }
    
    // Otherwise, try to determine provider from the URL
    if (filePathOrUrl.includes('storage.googleapis.com')) {
      return this.getProvider(StorageProviderType.GCS).deleteFile(filePathOrUrl);
    } else if (filePathOrUrl.includes('amazonaws.com')) {
      return this.getProvider(StorageProviderType.S3).deleteFile(filePathOrUrl);
    } else {
      // Default to the default provider
      return this.getDefaultProvider().deleteFile(filePathOrUrl);
    }
  }

  /**
   * Get a signed URL using the default provider
   */
  public async getSignedUrl(
    filepath: string,
    options: SignedUrlOptions
  ): Promise<string> {
    return this.getDefaultProvider().getSignedUrl(filepath, options);
  }

  /**
   * Get file metadata using the appropriate provider
   */
  public async getFileMetadata(filePathOrUrl: string, providerType?: StorageProviderType): Promise<FileMetadata | null> {
    // If provider type is specified, use that provider
    if (providerType) {
      return this.getProvider(providerType).getFileMetadata(filePathOrUrl);
    }
    
    // Otherwise, try to determine provider from the URL
    if (filePathOrUrl.includes('storage.googleapis.com')) {
      return this.getProvider(StorageProviderType.GCS).getFileMetadata(filePathOrUrl);
    } else if (filePathOrUrl.includes('amazonaws.com')) {
      return this.getProvider(StorageProviderType.S3).getFileMetadata(filePathOrUrl);
    } else {
      // Default to the default provider
      return this.getDefaultProvider().getFileMetadata(filePathOrUrl);
    }
  }

  /**
   * List files using the appropriate provider
   */
  public async listFiles(
    folder?: string,
    options?: { prefix?: string; limit?: number; marker?: string },
    providerType?: StorageProviderType
  ): Promise<{ files: FileMetadata[]; nextMarker?: string }> {
    // If provider type is specified, use that provider
    if (providerType) {
      return this.getProvider(providerType).listFiles(folder, options);
    }
    
    // Otherwise, use the default provider
    return this.getDefaultProvider().listFiles(folder, options);
  }
  
  /**
   * Get file content as Buffer
   * Convenience method for PDF generation service
   */
  public async getFileContent(filePathOrUrl: string, providerType?: StorageProviderType): Promise<Buffer | null> {
    try {
      // Get the appropriate provider
      const provider = providerType 
        ? this.getProvider(providerType) 
        : this.getDefaultProvider();
      
      // Get file as stream
      const fileStream = await provider.getFileStream(filePathOrUrl);
      if (!fileStream) {
        return null;
      }
      
      // Convert stream to buffer
      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        
        fileStream.on('data', (chunk: Buffer) => chunks.push(chunk));
        fileStream.on('error', (err) => reject(err));
        fileStream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      console.error('Error getting file content', { filePathOrUrl, error });
      return null;
    }
  }
  
  /**
   * Save file content (convenience method for PDF generation service)
   */
  public async saveFileContent(
    filePath: string, 
    content: Buffer, 
    options?: UploadOptions
  ): Promise<FileInfo | null> {
    try {
      return this.uploadFile(content, filePath, options);
    } catch (error) {
      console.error('Error saving file content', { filePath, error });
      return null;
    }
  }
}

// Export a singleton instance
export default new StorageService(
  new GCSStorageProvider(),
  new S3StorageProvider(),
  new LocalStorageProvider()
);