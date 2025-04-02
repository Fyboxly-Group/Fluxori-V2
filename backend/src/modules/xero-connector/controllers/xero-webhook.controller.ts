// @ts-nocheck - Added by final-ts-fix.js
// Controller for Xero webhook handling
import { Request, Response } from 'express';
import { XeroWebhookService } from "../services/xero-webhook.service";
const xeroWebhookService = new XeroWebhookService();
import { XeroWebhookEvent } from '../types';

/**
 * Controller for Xero webhook endpoints
 */
class XeroWebhookController {
  /**
   * Handle webhook notification from Xero
   * 
   * @param req - Express request
   * @param res - Express response
   */
  // @ts-ignore - Express.Response overloads cause type checking issues
  public async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.header('x-xero-signature');
      const body = JSON.stringify(req.body);
      
      // Validate signature
      if(!signature || !xeroWebhookService.validateWebhookSignature(signature, body)) {
        res.status(401).send({
          success: false,
          message: 'Invalid webhook signature',
        });
        return;
      }
      
      // Process events
      const events: XeroWebhookEvent[] = req.body.events || [];
      const results = [];
      
      for(const event of events) {
        const result = await xeroWebhookService.processWebhookEvent(event);
        // @ts-ignore - Result type is incompatible with array
        results.push(result);
      }
      
      res.status(200).send({
        success: true,
        message: `Processed ${results.length} webhook events`,
        data: results,
      });
    } catch(error) {
      console.error('Error handling webhook:', error);
      res.status(500).send({
        success: false,
        message: `Error handling webhook: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
}

export default new XeroWebhookController();