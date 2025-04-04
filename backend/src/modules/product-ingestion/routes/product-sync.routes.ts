import express from 'express';
import { container } from '../../../config/inversify';
import { ProductSyncController } from '../controllers/product-sync.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = express.Router();
const controller = container.get<ProductSyncController>(ProductSyncController);

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/product-sync/config/:marketplaceId
 * @desc Get product sync configuration for a marketplace
 * @access Private
 */
router.get('/config/:marketplaceId', (req, res, next) => 
  controller.getSyncConfig(req, res, next));

/**
 * @route PUT /api/product-sync/config/:marketplaceId
 * @desc Update product sync configuration for a marketplace
 * @access Private
 */
router.put('/config/:marketplaceId', (req, res, next) =>
  controller.updateSyncConfig(req, res, next));

/**
 * @route POST /api/product-sync/products/:productId/sync
 * @desc Synchronize a product to marketplaces
 * @access Private
 */
router.post('/products/:productId/sync', (req, res, next) =>
  controller.syncProduct(req, res, next));

/**
 * @route POST /api/product-sync/ingest/:marketplaceId
 * @desc Trigger product ingestion from a marketplace
 * @access Private
 */
router.post('/ingest/:marketplaceId', (req, res, next) =>
  controller.ingestProducts(req, res, next));

export default router;