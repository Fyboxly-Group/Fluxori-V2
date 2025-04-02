/**
 * Buy Box Routes
 * 
 * API routes for Buy Box functionality
 */
import { Router } from 'express';
import { container } from '../../../config/inversify';
import { BuyBoxController } from '../controllers/buybox.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();
const buyBoxController = container.get(BuyBoxController);

/**
 * @swagger
 * tags:
 *   name: BuyBox
 *   description: API endpoints for Buy Box monitoring
 */

/**
 * @swagger
 * /api/buybox/init:
 *   post:
 *     summary: Initialize Buy Box monitoring for a product
 *     tags: [BuyBox]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - marketplaceId
 *               - sku
 *             properties:
 *               productId:
 *                 type: string
 *               marketplaceId:
 *                 type: string
 *               marketplaceProductId:
 *                 type: string
 *               sku:
 *                 type: string
 *               monitoringFrequency:
 *                 type: integer
 *                 default: 60
 *     responses:
 *       200:
 *         description: Buy Box monitoring initialized
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
router.post('/init', authMiddleware, buyBoxController.initializeMonitoring);

/**
 * @swagger
 * /api/buybox/stop:
 *   post:
 *     summary: Stop Buy Box monitoring for a product
 *     tags: [BuyBox]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - marketplaceId
 *             properties:
 *               productId:
 *                 type: string
 *               marketplaceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Buy Box monitoring stopped
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Monitoring not found
 *       500:
 *         description: Server Error
 */
router.post('/stop', authMiddleware, buyBoxController.stopMonitoring);

/**
 * @swagger
 * /api/buybox/init-marketplace:
 *   post:
 *     summary: Initialize Buy Box monitoring for all products on a marketplace
 *     tags: [BuyBox]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marketplaceId
 *             properties:
 *               marketplaceId:
 *                 type: string
 *               monitoringFrequency:
 *                 type: integer
 *                 default: 60
 *     responses:
 *       200:
 *         description: Buy Box monitoring initialized for all products
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
router.post('/init-marketplace', authMiddleware, buyBoxController.initializeMonitoringForMarketplace);

/**
 * @swagger
 * /api/buybox/check:
 *   post:
 *     summary: Check Buy Box status for a product
 *     tags: [BuyBox]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - marketplaceId
 *             properties:
 *               productId:
 *                 type: string
 *               marketplaceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Buy Box status
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server Error
 */
router.post('/check', authMiddleware, buyBoxController.checkBuyBoxStatus);

/**
 * @swagger
 * /api/buybox/history/{productId}/{marketplaceId}:
 *   get:
 *     summary: Get Buy Box history for a product
 *     tags: [BuyBox]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: marketplaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Buy Box history
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: History not found
 *       500:
 *         description: Server Error
 */
router.get('/history/:productId/:marketplaceId', authMiddleware, buyBoxController.getBuyBoxHistory);

/**
 * @swagger
 * /api/buybox/marketplace/{marketplaceId}:
 *   get:
 *     summary: Get Buy Box histories for a marketplace
 *     tags: [BuyBox]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marketplaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Buy Box histories
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
router.get('/marketplace/:marketplaceId', authMiddleware, buyBoxController.getBuyBoxHistoriesByMarketplace);

/**
 * @swagger
 * /api/buybox/apply-rules:
 *   post:
 *     summary: Apply repricing rules
 *     tags: [BuyBox]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - marketplaceId
 *             properties:
 *               productId:
 *                 type: string
 *               marketplaceId:
 *                 type: string
 *               ruleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Repricing rules applied
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
router.post('/apply-rules', authMiddleware, buyBoxController.applyRepricingRules);

export default router;