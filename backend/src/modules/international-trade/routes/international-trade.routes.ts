import { Router } from 'express';
import { 
  createShipment,
  getShipmentDetails,
  listShipments,
  createCustomsDeclaration,
  getComplianceInfo,
  getShippingRates,
  generateDocuments,
  trackShipment
} from '../controllers/international-trade.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: International Trade
 *   description: International shipping, customs, and compliance management
 */

/**
 * @swagger
 * /api/international-trade/shipments:
 *   post:
 *     summary: Create a new international shipment
 *     tags: [International Trade]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shipmentData:
 *                 type: object
 *                 description: The shipment data
 *     responses:
 *       201:
 *         description: Shipment created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/shipments', authenticate, createShipment);

/**
 * @swagger
 * /api/international-trade/shipments/{id}:
 *   get:
 *     summary: Get a shipment by ID
 *     tags: [International Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shipment details
 *       404:
 *         description: Shipment not found
 *       500:
 *         description: Server error
 */
router.get('/shipments/:id', authenticate, getShipmentDetails);

/**
 * @swagger
 * /api/international-trade/shipments:
 *   get:
 *     summary: Get shipments with filtering and pagination
 *     tags: [International Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shipments list
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/shipments', authenticate, listShipments);

/**
 * @swagger
 * /api/international-trade/shipments/{shipmentId}/customs:
 *   post:
 *     summary: Create a customs declaration for a shipment
 *     tags: [International Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               declarationData:
 *                 type: object
 *                 description: The customs declaration data
 *     responses:
 *       201:
 *         description: Customs declaration created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/shipments/:shipmentId/customs', authenticate, createCustomsDeclaration);

/**
 * @swagger
 * /api/international-trade/shipments/{id}/compliance:
 *   get:
 *     summary: Get compliance information for a shipment
 *     tags: [International Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compliance information
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/shipments/:id/compliance', authenticate, getComplianceInfo);

/**
 * @swagger
 * /api/international-trade/shipments/{id}/rates:
 *   get:
 *     summary: Get shipping rates for a shipment
 *     tags: [International Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: carrier
 *         schema:
 *           type: string
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [economy, standard, express]
 *     responses:
 *       200:
 *         description: Shipping rates retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/shipments/:id/rates', authenticate, getShippingRates);

/**
 * @swagger
 * /api/international-trade/shipments/{id}/documents:
 *   get:
 *     summary: Generate documents for a shipment
 *     tags: [International Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, docx, html]
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *       - in: query
 *         name: branding
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: signature
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Documents generated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/shipments/:id/documents', authenticate, generateDocuments);

/**
 * @swagger
 * /api/international-trade/track/{trackingNumber}:
 *   get:
 *     summary: Track a shipment
 *     tags: [International Trade]
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: carrier
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tracking information
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.get('/track/:trackingNumber', trackShipment);

// Handle tracking by shipment ID
router.get('/shipments/:id/track', authenticate, trackShipment);

// Export the router as the default export
export default router;