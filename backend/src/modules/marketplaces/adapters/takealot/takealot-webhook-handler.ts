import * as crypto from 'crypto';
import { Request, Response } from 'express';

/**
 * Types for Takealot webhook payloads
 */
interface NewLeadtimeOrderWebhook {
  order_id: number;
  order_item_id: number;
  offer: {
    offer_id: number;
    sku: string;
    barcode: string;
    leadtime_stock: Array<{
      merchant_warehouse: {
        warehouse_id: number;
        name: string;
      };
      quantity_available: number;
    }>;
  };
  warehouse: string;
  total_selling_price: number;
  quantity: number;
  event_date: string;
  facility: {
    code: string;
    address: string;
  };
}

interface OrderStatusUpdateWebhook {
  order_id: number;
  order_item_id: number;
  offer: {
    offer_id: number;
    sku: string;
    barcode: string;
  };
  status: string;
  tracking_number: string;
  tracking_url: string;
  courier: string;
  event_date: string;
}

interface InventoryUpdateWebhook {
  offer_id: number;
  sku: string;
  barcode: string;
  quantity_available: number;
  event_date: string;
  warehouse: {
    warehouse_id: number;
    name: string;
  };
}

interface ProductContentUpdateWebhook {
  offer_id: number;
  sku: string;
  barcode: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  approval_status: string;
  event_date: string;
}

interface PriceUpdateWebhook {
  offer_id: number;
  sku: string;
  barcode: string;
  original_price: number;
  selling_price: number;
  event_date: string;
}

interface PromoticStatusUpdateWebhook {
  promo_id: number;
  sku: string;
  barcode: string;
  status: string;
  start_date: string;
  end_date: string;
  discount_percentage: number;
  event_date: string;
}

interface ReviewWebhook {
  offer_id: number;
  sku: string;
  barcode: string;
  review_id: number;
  rating: number;
  content: string;
  customer_name: string;
  event_date: string;
}

interface ReturnRequestWebhook {
  order_id: number;
  order_item_id: number;
  offer: {
    offer_id: number;
    sku: string;
    barcode: string;
  };
  reason: string;
  status: string;
  quantity: number;
  event_date: string;
}

/**
 * Takealot Webhook Handler
 * Processes webhook events from Takealot marketplace
 */
export class TakealotWebhookHandler {
  private readonly webhookSecret: string;
  
  constructor(webhookSecret: string) {
    this.webhookSecret = webhookSecret;
  }
  
  /**
   * Handle incoming webhook from Takealot
   * @param req Express request
   * @param res Express response
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    // Verify webhook signature
    const signature = req.headers['x-takealot-signature'] as string;
    
    if (!signature || !this.verifySignature(signature, JSON.stringify(req.body))) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }
    
    // Process based on webhook type
    const eventType = req.headers['x-takealot-event-type'] as string;
    
    try {
      switch (eventType) {
        case 'new_leadtime_order':
          await this.handleNewLeadtimeOrder(req.body as NewLeadtimeOrderWebhook);
          break;
          
        case 'order_status_update':
          await this.handleOrderStatusUpdate(req.body as OrderStatusUpdateWebhook);
          break;
          
        case 'inventory_update':
          await this.handleInventoryUpdate(req.body as InventoryUpdateWebhook);
          break;
          
        case 'product_content_update':
          await this.handleProductContentUpdate(req.body as ProductContentUpdateWebhook);
          break;
          
        case 'price_update':
          await this.handlePriceUpdate(req.body as PriceUpdateWebhook);
          break;
          
        case 'promo_status_update':
          await this.handlePromoStatusUpdate(req.body as PromoticStatusUpdateWebhook);
          break;
          
        case 'review':
          await this.handleReview(req.body as ReviewWebhook);
          break;
          
        case 'return_request':
          await this.handleReturnRequest(req.body as ReturnRequestWebhook);
          break;
          
        default:
          console.warn(`Unhandled Takealot webhook event type: ${eventType}`);
      }
      
      // Send success response
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error processing Takealot webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Verify webhook signature
   * @param signature Signature from webhook header
   * @param payload Webhook payload
   */
  private verifySignature(signature: string, payload: string): boolean {
    // In a real implementation, verify the signature using HMAC
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const calculatedSignature = hmac.update(payload).digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  }
  
  /**
   * Handle new leadtime order webhook
   * @param data Webhook payload
   */
  private async handleNewLeadtimeOrder(data: NewLeadtimeOrderWebhook): Promise<void> {
    // Implementation would process the leadtime order
    console.log('Processing new leadtime order:', data.order_id);
  }
  
  /**
   * Handle order status update webhook
   * @param data Webhook payload
   */
  private async handleOrderStatusUpdate(data: OrderStatusUpdateWebhook): Promise<void> {
    // Implementation would update order status
    console.log('Processing order status update:', data.order_id, data.status);
  }
  
  /**
   * Handle inventory update webhook
   * @param data Webhook payload
   */
  private async handleInventoryUpdate(data: InventoryUpdateWebhook): Promise<void> {
    // Implementation would update inventory
    console.log('Processing inventory update for SKU:', data.sku, data.quantity_available);
  }
  
  /**
   * Handle product content update webhook
   * @param data Webhook payload
   */
  private async handleProductContentUpdate(data: ProductContentUpdateWebhook): Promise<void> {
    // Implementation would update product content
    console.log('Processing product content update for SKU:', data.sku);
  }
  
  /**
   * Handle price update webhook
   * @param data Webhook payload
   */
  private async handlePriceUpdate(data: PriceUpdateWebhook): Promise<void> {
    // Implementation would update price
    console.log('Processing price update for SKU:', data.sku, data.selling_price);
  }
  
  /**
   * Handle promotion status update webhook
   * @param data Webhook payload
   */
  private async handlePromoStatusUpdate(data: PromoticStatusUpdateWebhook): Promise<void> {
    // Implementation would update promotion status
    console.log('Processing promo status update for SKU:', data.sku, data.status);
  }
  
  /**
   * Handle review webhook
   * @param data Webhook payload
   */
  private async handleReview(data: ReviewWebhook): Promise<void> {
    // Implementation would process review
    console.log('Processing review for SKU:', data.sku, data.rating);
  }
  
  /**
   * Handle return request webhook
   * @param data Webhook payload
   */
  private async handleReturnRequest(data: ReturnRequestWebhook): Promise<void> {
    // Implementation would process return request
    console.log('Processing return request for order:', data.order_id, data.status);
  }
}