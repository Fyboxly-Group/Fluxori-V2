import { Router, Request, Response, NextFunction } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

/**
 * @swagger
 * /webhooks/takealot:
 *   post:
 *     summary: Handle Takealot webhook events
 *     description: Endpoint for receiving webhook notifications from Takealot
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       401:
 *         description: Invalid signature
 *       500:
 *         description: Internal server error
 */
router.post('/takealot', WebhookController.handleTakealotWebhook);

/**
 * @swagger
 * /webhooks/test:
 *   post:
 *     summary: Test webhook endpoint
 *     description: Endpoint for testing webhook functionality
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook received successfully
 *       500:
 *         description: Internal server error
 */
router.post('/test', WebhookController.testWebhook);

export default router;