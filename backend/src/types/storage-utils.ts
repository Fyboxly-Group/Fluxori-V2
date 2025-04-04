/**
 * Storage service interfaces and types
 */

/**
 * Available storage provider types
 */
export enum StorageProviderType {
  LOCAL = 'local',
  GCS = 'gcp',
  S3 = 'aws',
  AZURE = 'azure',
}

/**
 * File metadata interface
 */
export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  url: string;
  contentType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string;
  userId?: string;
  isPublic: boolean;
  tags?: string[];
  metadata?: Record<string, string>;
}

/**
 * Upload options interface
 */
export interface UploadOptions {
  folder?: string;
  isPublic?: boolean;
  customFilename?: string;
  metadata?: Record<string, string>;
  expiresAt?: Date;
  organizationId?: string;
  userId?: string;
  tags?: string[];
  contentType?: string;
}

/**
 * Signed URL options interface
 */
export interface SignedUrlOptions {
  action: 'read' | 'write';
  expires?: Date;
  contentType?: string;
  size?: number;
  filename?: string;
  folder?: string;
  responseDisposition?: string;
}

/**
 * File info returned after upload
 */
export interface FileInfo {
  id: string;
  url: string;
  name: string;
  path: string;
  size: number;
  contentType: string;
  isPublic: boolean;
  metadata?: Record<string, string>;
}

/**
 * Storage provider interface
 */
export interface StorageProvider {
  /**
   * Upload a file to storage
   */
  uploadFile(
    file: Buffer,
    filename: string,
    options?: UploadOptions
  ): Promise<FileInfo>;

  /**
   * Delete a file from storage
   */
  deleteFile(filePathOrUrl: string): Promise<boolean>;

  /**
   * Get a signed URL for direct upload or download
   */
  getSignedUrl(
    filepath: string,
    options: SignedUrlOptions
  ): Promise<string>;

  /**
   * Get file metadata
   */
  getFileMetadata(filePathOrUrl: string): Promise<FileMetadata | null>;

  /**
   * List files in a directory
   */
  listFiles(
    folder?: string,
    options?: { prefix?: string; limit?: number; marker?: string }
  ): Promise<{ files: FileMetadata[]; nextMarker?: string }>;

  /**
   * Copy a file from one location to another
   */
  copyFile(
    sourcePathOrUrl: string,
    destinationPath: string,
    options?: UploadOptions
  ): Promise<FileInfo>;

  /**
   * Move a file from one location to another
   */
  moveFile(
    sourcePathOrUrl: string,
    destinationPath: string,
    options?: UploadOptions
  ): Promise<FileInfo>;

  /**
   * Check if a file exists
   */
  fileExists(filePathOrUrl: string): Promise<boolean>;

  /**
   * Make a file public
   */
  makeFilePublic(filePathOrUrl: string): Promise<string>;

  /**
   * Make a file private
   */
  makeFilePrivate(filePathOrUrl: string): Promise<boolean>;
  
  /**
   * Get a file stream
   */
  getFileStream(filePathOrUrl: string): Promise<NodeJS.ReadableStream | null>;
}

/**
 * Storage service interface
 */
export interface StorageService {
  /**
   * Get the default provider
   */
  getDefaultProvider(): StorageProvider;

  /**
   * Get a specific provider
   */
  getProvider(type: StorageProviderType): StorageProvider;

  /**
   * Upload a file using the default provider
   */
  uploadFile(
    file: Buffer,
    filename: string,
    options?: UploadOptions
  ): Promise<FileInfo>;

  /**
   * Delete a file using the appropriate provider
   */
  deleteFile(filePathOrUrl: string, providerType?: StorageProviderType): Promise<boolean>;

  /**
   * Get a signed URL using the default provider
   */
  getSignedUrl(
    filepath: string,
    options: SignedUrlOptions
  ): Promise<string>;

  /**
   * Get file metadata
   */
  getFileMetadata(filePathOrUrl: string, providerType?: StorageProviderType): Promise<FileMetadata | null>;

  /**
   * List files in a directory
   */
  listFiles(
    folder?: string,
    options?: { prefix?: string; limit?: number; marker?: string },
    providerType?: StorageProviderType
  ): Promise<{ files: FileMetadata[]; nextMarker?: string }>;
}