import { Storage, Bucket } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export class StorageService {
  private storage: Storage;
  private bucket: Bucket;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.GCS_BUCKET_NAME || 'fluxori-v2-bucket';
    
    if (process.env.NODE_ENV === 'production') {
      // In production, use GCP default authentication
      this.storage = new Storage();
    } else {
      // In development or test, use key file if available, otherwise default credentials
      const keyFilePath = process.env.GCS_KEY_FILE || path.join(__dirname, '../../service-account-key.json');
      try {
        if (fs.existsSync(keyFilePath)) {
          this.storage = new Storage({ keyFilename: keyFilePath });
        } else {
          console.warn('GCS key file not found, using default credentials');
          this.storage = new Storage();
        }
      } catch (error) {
        console.error('Error initializing GCS:', error);
        this.storage = new Storage();
      }
    }
    
    this.bucket = this.storage.bucket(this.bucketName);
  }

  /**
   * Get a signed URL for uploading a file directly to GCS
   * @param filename - The filename to use
   * @param contentType - The content type of the file
   * @param folder - Optional folder path inside the bucket
   * @returns Signed URL for uploading the file
   */
  async getSignedUploadUrl(filename: string, contentType: string, folder?: string): Promise<string> {
    try {
      // Generate a unique filename
      const uniqueFilename = this.generateUniqueFilename(filename);
      
      // Build the file path
      const filePath = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;
      
      // Get file object
      const file = this.bucket.file(filePath);
      
      // Generate signed URL
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
        contentType,
      });
      
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Upload a file to Google Cloud Storage
   * @param file - The file buffer to upload
   * @param filename - The filename to use
   * @param contentType - The content type of the file
   * @param folder - Optional folder path inside the bucket
   * @returns The public URL of the uploaded file
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    contentType: string,
    folder?: string
  ): Promise<string> {
    try {
      // Generate a unique filename
      const uniqueFilename = this.generateUniqueFilename(filename);
      
      // Build the file path
      const filePath = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;
      
      // Get file object
      const fileObject = this.bucket.file(filePath);
      
      // Upload file
      await fileObject.save(file, {
        contentType,
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000', // Cache for 1 year
        },
      });
      
      // Make the file publicly accessible
      await fileObject.makePublic();
      
      // Return the public URL
      return `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param fileUrl - The URL of the file to delete
   * @returns True if deletion was successful
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlObj = new URL(fileUrl);
      const pathName = urlObj.pathname;
      
      // Path is in format /bucket-name/file-path
      // We need to remove the bucket name from the path
      const parts = pathName.split('/');
      const filePath = parts.slice(2).join('/');
      
      // Delete the file
      await this.bucket.file(filePath).delete();
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Generate a unique filename to prevent collisions
   * @param originalFilename - The original filename
   * @returns A unique filename
   */
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalFilename);
    const basename = path.basename(originalFilename, extension);
    
    return `${basename}-${timestamp}-${random}${extension}`;
  }
}

export default new StorageService();