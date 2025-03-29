import { Router } from 'express';
import { 
  addShipmentDocument, 
  removeShipmentDocument, 
  getShipmentDocuments 
} from '../controllers/shipment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Document management routes
router.get('/:id/documents', authenticate, getShipmentDocuments);
router.post('/:id/documents', authenticate, addShipmentDocument);
router.delete('/:id/documents/:documentId', authenticate, removeShipmentDocument);

export default router;