import { Router } from 'express';
import multer from 'multer';
import { 
  getSignedUploadUrl, 
  uploadFile, 
  deleteFile, 
  handleTempUpload,
  getInventoryImageUploadUrls,
  updateInventoryImages,
  deleteInventoryImage
} from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Get a signed URL for direct upload to GCS
router.get('/signed-url', authenticate, getSignedUploadUrl);

// Upload file to GCS
router.post('/', authenticate, upload.single('file'), uploadFile);

// Delete file from GCS
router.delete('/', authenticate, deleteFile);

// Temporary upload with fallback to server
router.post('/temp', authenticate, upload.single('file'), handleTempUpload);

// Inventory image management routes
router.get('/inventory-images', authenticate, getInventoryImageUploadUrls);
router.post('/inventory/:id/images', authenticate, updateInventoryImages);
router.delete('/inventory/:id/images', authenticate, deleteInventoryImage);

export default router;