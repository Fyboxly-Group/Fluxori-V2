import { Router } from 'express';
import multer from 'multer';
import { UploadController, 
  getSignedUploadUrl, 
  uploadFile, 
  deleteFile, 
  handleTempUpload,
  getInventoryImageUploadUrls,
  updateInventoryImages,
  deleteInventoryImage
} from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { container } from '../config/inversify';
import { TYPES } from '../config/inversify.types';

const router = Router();

// Get controller with dependency injection (preferred)
const uploadController = container.get<UploadController>(UploadController);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Get a signed URL for direct upload to storage
router.get('/signed-url', authenticate, uploadController.getSignedUploadUrl.bind(uploadController));

// Upload file to storage
router.post('/', authenticate, upload.single('file'), uploadController.uploadFile.bind(uploadController));

// Delete file from storage
router.delete('/', authenticate, uploadController.deleteFile.bind(uploadController));

// Temporary upload with fallback to server
router.post('/temp', authenticate, upload.single('file'), uploadController.handleTempUpload.bind(uploadController));

// Inventory image management routes
router.get('/inventory-images', authenticate, uploadController.getInventoryImageUploadUrls.bind(uploadController));
router.post('/inventory/:id/images', authenticate, uploadController.updateInventoryImages.bind(uploadController));
router.delete('/inventory/:id/images', authenticate, uploadController.deleteInventoryImage.bind(uploadController));

// List files in a folder
router.get('/list', authenticate, uploadController.listFiles.bind(uploadController));

// For backward compatibility, keep the old routes
// Note: these will be removed in a future update
router.get('/signed-url-legacy', authenticate, getSignedUploadUrl);
router.post('/legacy', authenticate, upload.single('file'), uploadFile);
router.delete('/legacy', authenticate, deleteFile);
router.post('/temp-legacy', authenticate, upload.single('file'), handleTempUpload);
router.get('/inventory-images-legacy', authenticate, getInventoryImageUploadUrls);
router.post('/inventory/:id/images-legacy', authenticate, updateInventoryImages);
router.delete('/inventory/:id/images-legacy', authenticate, deleteInventoryImage);

export default router;