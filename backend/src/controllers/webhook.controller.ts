import { Request, Response } from 'express';
import { TakealotWebhookHandler } from '../modules/marketplaces/adapters/takealot/takealot-webhook-handler';

// Environment variables or config should be used for secrets in production
const TAKEALOT_WEBHOOK_SECRET = process.env.TAKEALOT_WEBHOOK_SECRET || 'default-secret-replace-in-production';

// Create webhook handlers
const takealotWebhookHandler = new TakealotWebhookHandler(TAKEALOT_WEBHOOK_SECRET);

/**
 * Webhook controller for handling marketplace webhook callbacks
 */
export class WebhookController {
  /**
   * Handle Takealot webhooks
   * @param req - Express request
   * @param res - Express response
   */
  public static async handleTakealotWebhook(req: Request, res: Response): Promise<void> {
    try {
      await takealotWebhookHandler.handleWebhook(req, res);
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error in Takealot webhook handler:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Generic webhook handler for testing
   * @param req - Express request
   * @param res - Express response
   */
  public static async testWebhook(req: Request, res: Response): Promise<void> {
    try {
      console.log('Received test webhook:', {
        headers: req.headers,
        body: req.body
      });
      
      res.status(200).json({ success: true, message: 'Webhook received successfully' });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error in test webhook handler:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}