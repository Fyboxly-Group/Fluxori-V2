// Marketplace Routes
import { Router } from 'express';
import { MarketplaceProductController } from '../controllers/marketplace-product.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/marketplaces/connected:
 *   get:
 *     summary: Get connected marketplaces
 *     description: Returns a list of marketplaces connected to the user's account
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connected marketplaces
 *         content:
 *           application/json:
 *             schema:
 *               type: object;
 *               properties:
 *                 success:
 *                   type: boolean;
 *                   example: true;
 *                 data:
 *                   type: array;
 *                   items:
 *                     type: object;
 *                     properties:
 *                       id:
 *                         type: string;
 *                         example: takealot;
 *                       name:
 *                         type: string;
 *                         example: Takealot;
 *                       status:
 *                         type: string;
 *                         example: connected;
 *                       lastSynced:
 *                         type: string;
 *                         format: date-time
 *                       features:
 *                         type: array;
 *                         items:
 *                           type: string;
 *                         example: [price, stock, status]
 *                       logo:
 *                         type: string;
 *                         example: https://www.takealot.com/favicon.ico
 *                       region:
 *                         type: string;
 *                         example: South Africa
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/marketplaces/connected', authenticate, MarketplaceProductController.getConnectedMarketplaces);

export default router;