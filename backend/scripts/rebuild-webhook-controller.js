/**
 * Script to rebuild the webhook.controller.ts file
 * Fixing syntax errors and implementing proper TypeScript
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/controllers/webhook.controller.ts');
const backupFile = path.join(__dirname, '../src/controllers/webhook.controller.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt controller content
const newControllerContent = `import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import Activity from '../models/activity.model';
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
    } catch(error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error in Takealot webhook handler:', errorMessage);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        success: false,
        error: 'Internal server error' 
      });
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
      
      // Log the webhook for debugging
      await Activity.create({
        type: 'webhook_test',
        description: 'Test webhook received',
        details: {
          headers: req.headers,
          body: req.body
        }
      });
      
      res.status(StatusCodes.OK).json({ 
        success: true, 
        message: 'Webhook received successfully' 
      });
    } catch(error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error in test webhook handler:', errorMessage);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
}`;

// Write the new file
console.log('Writing new controller file...');
fs.writeFileSync(targetFile, newControllerContent);

console.log('Successfully rebuilt webhook.controller.ts');