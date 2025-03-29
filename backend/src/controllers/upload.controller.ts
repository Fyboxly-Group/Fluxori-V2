import { Request, Response, NextFunction } from 'express';
import storageService from '../services/storage.service';
import { ApiError } from '../middleware/error.middleware';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';
import InventoryItem from '../models/inventory.model';

/**
 * @desc    Get a signed URL for direct upload to Google Cloud Storage
 * @route   GET /api/upload/signed-url
 * @access  Private
 */
export const getSignedUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename, contentType, folder } = req.query;
    
    if (!filename || !contentType) {
      throw new ApiError(400, 'Filename and content type are required');
    }
    
    const url = await storageService.getSignedUploadUrl(
      filename as string,
      contentType as string,
      folder as string
    );
    
    res.status(200).json({
      success: true,
      data: {
        url,
        fileUrl: url.split('?')[0], // The public URL without query parameters
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload file to Google Cloud Storage
 * @route   POST /api/upload
 * @access  Private
 */
export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }
    
    const { folder } = req.body;
    const file = req.file;
    
    // Upload to GCS
    const fileUrl = await storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );
    
    res.status(201).json({
      success: true,
      data: {
        fileUrl,
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete file from Google Cloud Storage
 * @route   DELETE /api/upload
 * @access  Private
 */
export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      throw new ApiError(400, 'File URL is required');
    }
    
    const success = await storageService.deleteFile(fileUrl);
    
    if (!success) {
      throw new ApiError(500, 'Failed to delete file');
    }
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle temporary file upload and move to cloud storage
 * This is a fallback method for clients that can't do direct uploads
 * @route   POST /api/upload/temp
 * @access  Private
 */
export const handleTempUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }
    
    const { folder } = req.body;
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
    
    // Upload the file to GCS
    const fileBuffer = fs.readFileSync(tempFilePath);
    const fileUrl = await storageService.uploadFile(
      fileBuffer,
      file.originalname,
      file.mimetype,
      folder
    );
    
    // Delete the temporary file
    fs.unlinkSync(tempFilePath);
    
    res.status(201).json({
      success: true,
      data: {
        fileUrl,
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get multiple signed URLs for inventory item image uploads
 * @route   GET /api/upload/inventory-images
 * @access  Private
 */
export const getInventoryImageUploadUrls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { count = 1, inventoryId } = req.query;
    
    if (!inventoryId) {
      throw new ApiError(400, 'Inventory item ID is required');
    }
    
    // Validate count
    const numCount = Math.min(Math.max(parseInt(count as string) || 1, 1), 10); // Limit to 10 images
    
    // Generate signed URLs
    const urls = [];
    const fileUrls = [];
    
    for (let i = 0; i < numCount; i++) {
      // Create a filename format: inventory-{inventoryId}-{timestamp}-{random}.jpg
      const filename = `inventory-${inventoryId}-${Date.now()}-${i}-${crypto.randomBytes(4).toString('hex')}.jpg`;
      
      const url = await storageService.getSignedUploadUrl(
        filename,
        'image/jpeg',
        'inventory'
      );
      
      urls.push(url);
      fileUrls.push(url.split('?')[0]); // Extract the public URL without query parameters
    }
    
    res.status(200).json({
      success: true,
      data: {
        signedUrls: urls,
        fileUrls: fileUrls,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update inventory item images
 * @route   POST /api/upload/inventory/:id/images
 * @access  Private
 */
export const updateInventoryImages = async (req: Request, res: Response, next: NextFunction) => {
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
    
    res.status(200).json({
      success: true,
      data: {
        images: inventoryItem.images,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete inventory item image
 * @route   DELETE /api/upload/inventory/:id/images
 * @access  Private
 */
export const deleteInventoryImage = async (req: Request, res: Response, next: NextFunction) => {
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
      await storageService.deleteFile(imageUrl);
    } catch (error) {
      console.error('Error deleting file from storage:', error);
      // Continue even if file deletion fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        images: inventoryItem.images,
      },
    });
  } catch (error) {
    next(error);
  }
};