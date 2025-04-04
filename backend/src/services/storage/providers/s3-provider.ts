import AWS from 'aws-sdk';
import * as path from 'path';
import { BaseStorageProvider } from './base-provider';
import { FileInfo, FileMetadata, SignedUrlOptions, UploadOptions } from '../../../types/storage-utils';
import { injectable } from 'inversify';

/**
 * AWS S3 Storage Provider Implementation
 */
@injectable()
export class S3StorageProvider extends BaseStorageProvider {
  private s3: AWS.S3;
  private bucketName: string;
  private region: string;

  constructor() {
    super();
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'fluxori-v2-bucket';
    this.region = process.env.AWS_REGION || 'us-east-1';
    
    // Initialize S3 with credentials from environment or AWS credential provider chain
    this.s3 = new AWS.S3({
      region: this.region,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }

  /**
   * Upload a file to S3
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
      
      // Upload params
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: filePath,
        Body: file,
        ContentType: options?.contentType || 'application/octet-stream',
        ACL: options?.isPublic !== false ? 'public-read' : 'private',
      };
      
      // Add metadata if provided
      if (options?.metadata) {
        params.Metadata = options.metadata;
      }
      
      // Add tags if provided
      if (options?.tags) {
        params.Tagging = options.tags.map(tag => `${tag}=true`).join('&');
      }
      
      // Upload the file
      await this.s3.putObject(params).promise();
      
      // Generate the URL
      const url = options?.isPublic !== false
        ? `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filePath}`
        : await this.getSignedUrl(filePath, {
            action: 'read',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          });
      
      return {
        id: filePath,
        url,
        name: path.basename(filePath),
        path: filePath,
        size: file.length,
        contentType: options?.contentType || 'application/octet-stream',
        isPublic: options?.isPublic !== false,
        metadata: options?.metadata,
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to upload file to AWS S3');
    }
  }

  /**
   * Delete a file from S3
   */
  public async deleteFile(filePathOrUrl: string): Promise<boolean> {
    try {
      // Parse the URL or path to get the file path
      const filePath = this.parseUrl(filePathOrUrl);
      
      // Delete the file
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: filePath,
      }).promise();
      
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error instanceof Error ? error.message : String(error));
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
      const operation = options.action === 'read' ? 'getObject' : 'putObject';
      
      const params: AWS.S3.PresignedPost.Params = {
        Bucket: this.bucketName,
        Key: filepath,
        Expires: options.expires 
          ? Math.floor((options.expires.getTime() - Date.now()) / 1000)
          : 900, // Default 15 minutes
      };
      
      // Add content type for uploads
      if (options.action === 'write' && options.contentType) {
        params.ContentType = options.contentType;
      }
      
      // Add response disposition for downloads
      if (options.action === 'read' && options.responseDisposition) {
        params.ResponseContentDisposition = options.responseDisposition;
      }
      
      // Generate the signed URL
      const url = this.s3.getSignedUrl(operation, params);
      
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
      
      // Get file metadata
      const headResult = await this.s3.headObject({
        Bucket: this.bucketName,
        Key: filePath,
      }).promise();
      
      // Get file ACL to check if public
      const aclResult = await this.s3.getObjectAcl({
        Bucket: this.bucketName,
        Key: filePath,
      }).promise();
      
      // Check if the file is public
      const isPublic = aclResult.Grants?.some(
        grant => grant.Grantee?.URI === 'http://acs.amazonaws.com/groups/global/AllUsers' && grant.Permission === 'READ'
      ) || false;
      
      return {
        id: filePath,
        name: path.basename(filePath),
        path: filePath,
        url: isPublic
          ? `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filePath}`
          : await this.getSignedUrl(filePath, { action: 'read', expires: new Date(Date.now() + 24 * 60 * 60 * 1000) }),
        contentType: headResult.ContentType || 'application/octet-stream',
        size: headResult.ContentLength || 0,
        createdAt: headResult.LastModified || new Date(),
        updatedAt: headResult.LastModified || new Date(),
        organizationId: headResult.Metadata?.organizationid,
        userId: headResult.Metadata?.userid,
        isPublic,
        tags: headResult.TagSet?.map(tag => tag.Key) || [],
        metadata: headResult.Metadata,
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
      
      // List objects with given options
      const listResult = await this.s3.listObjectsV2({
        Bucket: this.bucketName,
        Prefix: fullPrefix,
        MaxKeys: options?.limit,
        ContinuationToken: options?.marker,
      }).promise();
      
      // Get metadata for each file
      const fileMetadata: FileMetadata[] = await Promise.all(
        (listResult.Contents || []).map(async (object) => {
          const filePath = object.Key || '';
          
          // Get file metadata
          const metadata = await this.getFileMetadata(filePath);
          
          if (!metadata) {
            // If metadata can't be retrieved, return a minimal object
            return {
              id: filePath,
              name: path.basename(filePath),
              path: filePath,
              url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filePath}`,
              contentType: 'application/octet-stream',
              size: object.Size || 0,
              createdAt: object.LastModified || new Date(),
              updatedAt: object.LastModified || new Date(),
              isPublic: false,
            };
          }
          
          return metadata;
        })
      );
      
      return {
        files: fileMetadata,
        nextMarker: listResult.NextContinuationToken,
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
      
      // Copy the file
      await this.s3.copyObject({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourcePath}`,
        Key: destinationPath,
        ACL: options?.isPublic !== false ? 'public-read' : 'private',
        ContentType: options?.contentType,
        Metadata: options?.metadata || {},
        MetadataDirective: 'REPLACE', // Replace metadata on the destination
      }).promise();
      
      // Generate the URL
      const url = options?.isPublic !== false
        ? `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${destinationPath}`
        : await this.getSignedUrl(destinationPath, {
            action: 'read',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          });
      
      // Get file size and other metadata
      const headResult = await this.s3.headObject({
        Bucket: this.bucketName,
        Key: destinationPath,
      }).promise();
      
      return {
        id: destinationPath,
        url,
        name: path.basename(destinationPath),
        path: destinationPath,
        size: headResult.ContentLength || 0,
        contentType: headResult.ContentType || options?.contentType || 'application/octet-stream',
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
      
      // Check if file exists by attempting to get its metadata
      await this.s3.headObject({
        Bucket: this.bucketName,
        Key: filePath,
      }).promise();
      
      return true;
    } catch (error) {
      // If error code is 404, file doesn't exist
      if ((error as AWS.AWSError).statusCode === 404) {
        return false;
      }
      
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
      
      // Update ACL to make the file public
      await this.s3.putObjectAcl({
        Bucket: this.bucketName,
        Key: filePath,
        ACL: 'public-read',
      }).promise();
      
      // Return the public URL
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filePath}`;
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
      
      // Update ACL to make the file private
      await this.s3.putObjectAcl({
        Bucket: this.bucketName,
        Key: filePath,
        ACL: 'private',
      }).promise();
      
      return true;
    } catch (error) {
      console.error('Error making file private:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}