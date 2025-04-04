import { Router } from 'express';
import { container } from '../../../config/inversify';
import { OrderIngestionController } from '../controllers/order-ingestion.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { validationMiddleware } from '../../../middleware/validation.middleware';
import {
  OrderQuerySchema,
  UpdateOrderStatusSchema, 
  OrderIdParamSchema,
  MarketplaceIdParamSchema,
  OrderIngestionOptionsSchema
} from '../schemas/order.schema';

const router = Router();
const orderIngestionController = container.get<OrderIngestionController>(OrderIngestionController);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders with pagination and filtering
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: marketplaceName
 *         schema:
 *           type: string
 *         description: Filter by marketplace name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by order date (from)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by order date (to)
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/',
  authMiddleware,
  validationMiddleware({ query: OrderQuerySchema }),
  orderIngestionController.getOrders.bind(orderIngestionController)
);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:orderId',
  authMiddleware,
  validationMiddleware({ params: OrderIdParamSchema }),
  orderIngestionController.getOrderById.bind(orderIngestionController)
);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, processing, shipped, delivered, canceled, on_hold, returned, refunded, completed]
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.patch(
  '/:orderId/status',
  authMiddleware,
  validationMiddleware({
    params: OrderIdParamSchema,
    body: UpdateOrderStatusSchema
  }),
  orderIngestionController.updateOrderStatus.bind(orderIngestionController)
);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderStatusCounts:
 *                       type: object
 *                     marketplaceCounts:
 *                       type: object
 *                     orderTrend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           count:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/stats',
  authMiddleware,
  orderIngestionController.getOrderStats.bind(orderIngestionController)
);

/**
 * @swagger
 * /api/orders/ingest/{marketplaceId}:
 *   post:
 *     summary: Ingest orders from a marketplace
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marketplaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: Marketplace ID (e.g., amazon, shopify)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               options:
 *                 type: object
 *                 properties:
 *                   skipExisting:
 *                     type: boolean
 *                   createXeroInvoices:
 *                     type: boolean
 *                   updateExisting:
 *                     type: boolean
 *                   sinceDate:
 *                     type: string
 *                     format: date-time
 *                   marketplaceSpecific:
 *                     type: object
 *     responses:
 *       200:
 *         description: Orders ingested successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ordersCreated:
 *                       type: integer
 *                     ordersUpdated:
 *                       type: integer
 *                     ordersSkipped:
 *                       type: integer
 *                     xeroInvoicesCreated:
 *                       type: integer
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           orderId:
 *                             type: string
 *                           message:
 *                             type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/ingest/:marketplaceId',
  authMiddleware,
  validationMiddleware({
    params: MarketplaceIdParamSchema,
    body: {
      options: {
        type: 'object',
        properties: {
          skipExisting: { type: 'boolean' },
          createXeroInvoices: { type: 'boolean' },
          updateExisting: { type: 'boolean' },
          sinceDate: { type: 'date' },
          marketplaceSpecific: { type: 'object' }
        }
      }
    }
  }),
  orderIngestionController.ingestOrders.bind(orderIngestionController)
);

export default router;