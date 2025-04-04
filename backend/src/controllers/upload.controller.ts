import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/inversify.types';
import { StorageService } from '../services/storage/storage.service';
import { ApiError } from '../middleware/error.middleware';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';
import InventoryItem from '../models/inventory.model';
import { FileInfo, UploadOptions, SignedUrlOptions, StorageProviderType } from '../types/storage-utils';
import { ILoggerService } from '../services/logger.service';
import { AuthenticatedRequest } from '../types/express-extensions';

/**
 * Upload Controller
 * Handles file upload and management operations
 */
@injectable()
export class UploadController {
  constructor(
    @inject(TYPES.StorageService) private storageService: StorageService,
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {}

  /**
   * @desc    Get a signed URL for direct upload to storage
   * @route   GET /api/upload/signed-url
   * @access  Private
   */
  public async getSignedUploadUrl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filename, contentType, folder, provider } = req.query;
      
      if (!filename || !contentType) {
        throw new ApiError(400, 'Filename and content type are required');
      }
      
      // Get the appropriate provider
      const storageProvider = provider 
        ? this.storageService.getProvider(provider as StorageProviderType)
        : this.storageService.getDefaultProvider();
      
      // Generate a unique filename
      const uniqueFilename = this.generateUniqueFilename(filename as string);
      
      // Build the file path
      const filePath = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;
      
      // Get signed URL
      const url = await storageProvider.getSignedUrl(
        filePath,
        {
          action: 'write',
          expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          contentType: contentType as string
        }
      );
      
      // Add organization context if available
      const metadata: Record<string, string> = {};
      if (req.user?.organizationId) {
        metadata.organizationId = req.user.organizationId;
      }
      
      if (req.user?.id) {
        metadata.userId = req.user.id;
      }
      
      res.status(200).json({
        success: true,
        data: {
          url,
          fileUrl: url.split('?')[0], // The public URL without query parameters
          filename: uniqueFilename,
          filePath,
          metadata
        },
      });
    } catch (error) {
      this.logger.error('Error generating signed URL', { error });
      next(error);
    }
  }

  /**
   * @desc    Upload file to storage
   * @route   POST /api/upload
   * @access  Private
   */
  public async uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
      }
      
      const { folder, isPublic, provider } = req.body;
      const file = req.file;
      
      // Prepare upload options
      const options: UploadOptions = {
        folder,
        isPublic: isPublic !== 'false',
        contentType: file.mimetype,
        metadata: {}
      };
      
      // Add organization context if available
      if (req.user?.organizationId) {
        options.organizationId = req.user.organizationId;
        options.metadata!.organizationId = req.user.organizationId;
      }
      
      if (req.user?.id) {
        options.userId = req.user.id;
        options.metadata!.userId = req.user.id;
      }
      
      // Upload to storage
      const fileInfo = await (provider 
        ? this.storageService.getProvider(provider as StorageProviderType).uploadFile(file.buffer, file.originalname, options)
        : this.storageService.uploadFile(file.buffer, file.originalname, options));
      
      // Log the upload
      this.logger.info('File uploaded successfully', { 
        filename: file.originalname,
        size: file.size,
        path: fileInfo.path,
        userId: req.user?.id
      });
      
      res.status(201).json({
        success: true,
        data: {
          ...fileInfo,
          originalName: file.originalname,
          size: file.size
        },
      });
    } catch (error) {
      this.logger.error('Error uploading file', { error });
      next(error);
    }
  }

  /**
   * @desc    Delete file from storage
   * @route   DELETE /api/upload
   * @access  Private
   */
  public async deleteFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileUrl, provider } = req.body;
      
      if (!fileUrl) {
        throw new ApiError(400, 'File URL is required');
      }
      
      // Delete from storage
      const success = await this.storageService.deleteFile(
        fileUrl,
        provider ? provider as StorageProviderType : undefined
      );
      
      if (!success) {
        throw new ApiError(500, 'Failed to delete file');
      }
      
      // Log the deletion
      this.logger.info('File deleted successfully', { 
        fileUrl,
        userId: req.user?.id
      });
      
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      this.logger.error('Error deleting file', { error });
      next(error);
    }
  }

  /**
   * @desc    Handle temporary file upload and move to cloud storage
   * This is a fallback method for clients that can't do direct uploads
   * @route   POST /api/upload/temp
   * @access  Private
   */
  public async handleTempUpload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
      }
      
      const { folder, isPublic, provider } = req.body;
      const file = req.file;
      
      // Create a temporary directory if it doesn't exist
      const tempDir = path.join(os.tmpdir(), 'fluxori-uploads');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Generate a unique temporary filename
      const tempFilename = `${crypto.randomBytes(16).toString('hex')}${path.extname(file.originalname)}`;
      const tempFilePath = path.join(tempDir, tempFilename);
      
      // Write the file to disk
      fs.writeFileSync(tempFilePath, file.buffer);
      
      // Prepare upload options
      const options: UploadOptions = {
        folder,
        isPublic: isPublic !== 'false',
        contentType: file.mimetype,
        metadata: {}
      };
      
      // Add organization context if available
      if (req.user?.organizationId) {
        options.organizationId = req.user.organizationId;
        options.metadata!.organizationId = req.user.organizationId;
      }
      
      if (req.user?.id) {
        options.userId = req.user.id;
        options.metadata!.userId = req.user.id;
      }
      
      // Read the file from disk
      const fileBuffer = fs.readFileSync(tempFilePath);
      
      // Upload to storage
      const fileInfo = await (provider 
        ? this.storageService.getProvider(provider as StorageProviderType).uploadFile(fileBuffer, file.originalname, options)
        : this.storageService.uploadFile(fileBuffer, file.originalname, options));
      
      // Delete the temporary file
      fs.unlinkSync(tempFilePath);
      
      // Log the upload
      this.logger.info('Temporary file uploaded successfully', { 
        filename: file.originalname,
        size: file.size,
        path: fileInfo.path,
        userId: req.user?.id
      });
      
      res.status(201).json({
        success: true,
        data: {
          ...fileInfo,
          originalName: file.originalname,
          size: file.size
        },
      });
    } catch (error) {
      this.logger.error('Error handling temporary upload', { error });
      next(error);
    }
  }

  /**
   * @desc    Get multiple signed URLs for inventory item image uploads
   * @route   GET /api/upload/inventory-images
   * @access  Private
   */
  public async getInventoryImageUploadUrls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { count = 1, inventoryId, provider } = req.query;
      
      if (!inventoryId) {
        throw new ApiError(400, 'Inventory item ID is required');
      }
      
      // Validate count
      const numCount = Math.min(Math.max(parseInt(count as string) || 1, 1), 10); // Limit to 10 images
      
      // Get the appropriate provider
      const storageProvider = provider 
        ? this.storageService.getProvider(provider as StorageProviderType)
        : this.storageService.getDefaultProvider();
      
      // Generate signed URLs
      const urls: string[] = [];
      const fileUrls: string[] = [];
      const filePaths: string[] = [];
      
      for (let i = 0; i < numCount; i++) {
        // Create a filename format: inventory-{inventoryId}-{timestamp}-{random}.jpg
        const uniqueFilename = `inventory-${inventoryId}-${Date.now()}-${i}-${crypto.randomBytes(4).toString('hex')}.jpg`;
        const filePath = `inventory/${uniqueFilename}`;
        
        const url = await storageProvider.getSignedUrl(
          filePath,
          {
            action: 'write',
            expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            contentType: 'image/jpeg'
          }
        );
        
        urls.push(url);
        fileUrls.push(url.split('?')[0]); // Extract the public URL without query parameters
        filePaths.push(filePath);
      }
      
      res.status(200).json({
        success: true,
        data: {
          signedUrls: urls,
          fileUrls,
          filePaths
        },
      });
    } catch (error) {
      this.logger.error('Error generating inventory image URLs', { error });
      next(error);
    }
  }

  /**
   * @desc    Update inventory item images
   * @route   POST /api/upload/inventory/:id/images
   * @access  Private
   */
  public async updateInventoryImages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { images, primaryImage } = req.body;
      
      if (!images || !Array.isArray(images)) {
        throw new ApiError(400, 'Images array is required');
      }
      
      // Find the inventory item
      const inventoryItem = await InventoryItem.findById(id);
      
      if (!inventoryItem) {
        throw new ApiError(404, 'Inventory item not found');
      }
      
      // Verify user has access to this inventory item
      if (inventoryItem.organizationId.toString() !== req.user!.organizationId && !req.user!.isSystemAdmin) {
        throw new ApiError(403, 'You do not have permission to update this inventory item');
      }
      
      // Update the images array
      inventoryItem.images = images;
      
      // If primaryImage is provided, ensure it's the first in the array
      if (primaryImage && images.includes(primaryImage)) {
        // Remove primary image from its current position
        const filteredImages = images.filter(img => img !== primaryImage);
        // Add it to the beginning of the array
        inventoryItem.images = [primaryImage, ...filteredImages];
      }
      
      await inventoryItem.save();
      
      this.logger.info('Inventory images updated', { 
        inventoryId: id,
        imageCount: images.length,
        userId: req.user?.id
      });
      
      res.status(200).json({
        success: true,
        data: {
          images: inventoryItem.images,
        },
      });
    } catch (error) {
      this.logger.error('Error updating inventory images', { error });
      next(error);
    }
  }

  /**
   * @desc    Delete inventory item image
   * @route   DELETE /api/upload/inventory/:id/images
   * @access  Private
   */
  public async deleteInventoryImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        throw new ApiError(400, 'Image URL is required');
      }
      
      // Find the inventory item
      const inventoryItem = await InventoryItem.findById(id);
      
      if (!inventoryItem) {
        throw new ApiError(404, 'Inventory item not found');
      }
      
      // Verify user has access to this inventory item
      if (inventoryItem.organizationId.toString() !== req.user!.organizationId && !req.user!.isSystemAdmin) {
        throw new ApiError(403, 'You do not have permission to update this inventory item');
      }
      
      // Check if image exists in the item's images array
      if (!inventoryItem.images?.includes(imageUrl)) {
        throw new ApiError(404, 'Image not found in inventory item');
      }
      
      // Remove image from array
      inventoryItem.images = inventoryItem.images.filter(img => img !== imageUrl);
      
      // Save the updated inventory item
      await inventoryItem.save();
      
      // Delete the file from storage
      try {
        await this.storageService.deleteFile(imageUrl);
      } catch (error) {
        this.logger.warn('Error deleting file from storage', { error, imageUrl });
        // Continue even if file deletion fails
      }
      
      this.logger.info('Inventory image deleted', { 
        inventoryId: id,
        imageUrl,
        userId: req.user?.id
      });
      
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        data: {
          images: inventoryItem.images,
        },
      });
    } catch (error) {
      this.logger.error('Error deleting inventory image', { error });
      next(error);
    }
  }

  /**
   * @desc    List files in a folder
   * @route   GET /api/upload/list
   * @access  Private
   */
  public async listFiles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { folder, prefix, limit, marker, provider } = req.query;
      
      const options = {
        prefix: prefix as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        marker: marker as string | undefined
      };
      
      // List files
      const result = await this.storageService.listFiles(
        folder as string,
        options,
        provider ? provider as StorageProviderType : undefined
      );
      
      res.status(200).json({
        success: true,
        data: result.files,
        nextMarker: result.nextMarker
      });
    } catch (error) {
      this.logger.error('Error listing files', { error });
      next(error);
    }
  }

  /**
   * Generate a unique filename to prevent collisions
   */
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalFilename);
    const basename = path.basename(originalFilename, extension);
    
    return `${basename}-${timestamp}-${random}${extension}`;
  }
}

// Exporting singleton instance for backwards compatibility
export const uploadController = new UploadController(
  new StorageService(
    // @ts-ignore - These are initialized later by inversify
    null, null, null
  ),
  // @ts-ignore - This is initialized later by inversify
  { error: console.error, info: console.info, warn: console.warn } 
);

// Exporting functions for backwards compatibility
export const getSignedUploadUrl = uploadController.getSignedUploadUrl.bind(uploadController);
export const uploadFile = uploadController.uploadFile.bind(uploadController);
export const deleteFile = uploadController.deleteFile.bind(uploadController);
export const handleTempUpload = uploadController.handleTempUpload.bind(uploadController);
export const getInventoryImageUploadUrls = uploadController.getInventoryImageUploadUrls.bind(uploadController);
export const updateInventoryImages = uploadController.updateInventoryImages.bind(uploadController);
export const deleteInventoryImage = uploadController.deleteInventoryImage.bind(uploadController);