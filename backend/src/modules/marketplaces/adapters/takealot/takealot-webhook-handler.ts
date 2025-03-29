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

interface NewDropShipOrderWebhook {
  order_id: number;
  ready_for_collect_due_date: string;
  acceptance_due_date: string;
  merchant_warehouse: {
    warehouse_id: number;
    name: string;
  };
  offers: Array<{
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
    quantity_required: number;
  }>;
  event_date: string;
}

interface SaleStatusChangedWebhook {
  sale: {
    order_item_id: number;
    order_id: number;
    order_date: string;
    sale_status: string;
    offer_id: number;
    tsin: number;
    sku: string;
    customer: string;
    product_title: string;
    takealot_url_mobi: string;
    selling_price: number;
    quantity: number;
    warehouse: string;
    customer_warehouse: string;
    promotion: string;
    shipment_id: number;
    shipment_state_id: number;
    po_number: number;
    shipment_name: string;
    takealot_url: string;
  };
  event_timestamp_utc: string;
}

interface BatchCompletedWebhook {
  seller_id: number;
  batch_id: number;
  status: string;
}

interface OfferUpdatedWebhook {
  seller_id: number;
  offer_id: number;
  values_changed: Record<string, any>;
  batch_id?: number;
}

interface OfferCreatedWebhook {
  seller_id: number;
  offer_id: number;
  merchant_sku: string;
  tsin_id: number;
  gtin: string;
  minimum_leadtime_days: number;
  maximum_leadtime_days: number;
  selling_price: number;
  rrp: number;
  merchant_warehouse_stock: Record<string, any>;
  batch_id?: number;
}

type TakealotWebhookPayload = 
  | NewLeadtimeOrderWebhook
  | NewDropShipOrderWebhook
  | SaleStatusChangedWebhook
  | BatchCompletedWebhook
  | OfferUpdatedWebhook
  | OfferCreatedWebhook;

/**
 * Type for webhook handler function
 */
type WebhookHandler<T> = (payload: T) => Promise<void>;

/**
 * Takealot webhook handler
 * Handles incoming webhooks from Takealot, validates them, and dispatches to the appropriate handler
 */
export class TakealotWebhookHandler {
  private readonly secret: string;
  private readonly handlers: Map<string, WebhookHandler<any>> = new Map();

  /**
   * Constructor
   * @param secret - Webhook secret for verifying requests
   */
  constructor(secret: string) {
    this.secret = secret;
    this.setupDefaultHandlers();
  }

  /**
   * Express middleware to handle incoming webhooks
   */
  public handleWebhook = async (req: Request, res: Response): Promise<void> => {
    // Verify the request is from Takealot
    if (!this.verifyRequest(req)) {
      console.error('Invalid webhook signature');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Get the event type from headers
    const eventType = req.headers['x-takealot-event'] as string;
    if (!eventType) {
      console.error('Missing event type header');
      res.status(400).json({ error: 'Missing event type' });
      return;
    }

    // Get the payload
    const payload = req.body as TakealotWebhookPayload;

    try {
      // Process the webhook
      await this.processWebhook(eventType, payload);
      
      // Respond with success
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error processing ${eventType} webhook:`, error);
      res.status(500).json({ error: 'Error processing webhook' });
    }
  };

  /**
   * Register a handler for a specific event type
   * @param eventType - The webhook event type to handle
   * @param handler - The handler function
   */
  public registerHandler<T extends TakealotWebhookPayload>(
    eventType: string, 
    handler: WebhookHandler<T>
  ): void {
    this.handlers.set(eventType, handler);
  }

  /**
   * Process a webhook
   * @param eventType - The webhook event type
   * @param payload - The webhook payload
   */
  private async processWebhook(eventType: string, payload: TakealotWebhookPayload): Promise<void> {
    // Get the handler for this event type
    const handler = this.handlers.get(eventType);
    
    if (!handler) {
      console.warn(`No handler registered for event type: ${eventType}`);
      return;
    }
    
    // Execute the handler
    await handler(payload);
  }

  /**
   * Verify that the request is from Takealot
   * @param req - The Express request object
   */
  private verifyRequest(req: Request): boolean {
    // Get the signature from headers
    const signature = req.headers['x-takealot-signature'] as string;
    if (!signature) {
      return false;
    }
    
    // Compute the HMAC
    const hmac = crypto.createHmac('sha256', this.secret);
    const digest = hmac.update(JSON.stringify(req.body)).digest('hex');
    
    // Compare with the provided signature
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature)
    );
  }

  /**
   * Set up default handlers for common webhook events
   */
  private setupDefaultHandlers(): void {
    // Handler for new leadtime orders
    this.registerHandler<NewLeadtimeOrderWebhook>(
      'New Leadtime Order',
      async (payload) => {
        console.log(`New leadtime order received: ${payload.order_id}`);
        
        // Extract product details
        const { offer, quantity } = payload;
        
        // Log the inventory update
        console.log(`Inventory update required for SKU ${offer.sku}: -${quantity}`);
        
        // Here you would update your internal inventory system
        // Example:
        // await inventoryService.decrementStock(offer.sku, quantity);
      }
    );
    
    // Handler for new drop ship orders
    this.registerHandler<NewDropShipOrderWebhook>(
      'New Drop Ship Order',
      async (payload) => {
        console.log(`New drop ship order received: ${payload.order_id}`);
        
        // Extract product details
        for (const offerItem of payload.offers) {
          const { offer, quantity_required } = offerItem;
          
          // Log the inventory update
          console.log(`Inventory update required for SKU ${offer.sku}: -${quantity_required}`);
          
          // Here you would update your internal inventory system
          // Example:
          // await inventoryService.decrementStock(offer.sku, quantity_required);
        }
      }
    );
    
    // Handler for sale status changes
    this.registerHandler<SaleStatusChangedWebhook>(
      'Sale Status Changed',
      async (payload) => {
        const { sale } = payload;
        console.log(`Sale status changed for order ${sale.order_id}: ${sale.sale_status}`);
        
        // Here you would update your internal order tracking system
        // Example:
        // await orderService.updateOrderStatus(sale.order_id.toString(), sale.sale_status);
      }
    );
    
    // Handler for batch completions
    this.registerHandler<BatchCompletedWebhook>(
      'Batch Completed',
      async (payload) => {
        console.log(`Batch ${payload.batch_id} completed with status: ${payload.status}`);
        
        // Here you would handle the batch completion
        // Example:
        // await batchService.processBatchCompletion(payload.batch_id, payload.status);
      }
    );
    
    // Handler for offer updates
    this.registerHandler<OfferUpdatedWebhook>(
      'Offer Updated',
      async (payload) => {
        console.log(`Offer ${payload.offer_id} updated. Fields changed:`, payload.values_changed);
        
        // Here you would update your internal product catalog
        // Example:
        // await catalogService.updateProduct(payload.offer_id.toString(), payload.values_changed);
      }
    );
    
    // Handler for offer creations
    this.registerHandler<OfferCreatedWebhook>(
      'Offer Created',
      async (payload) => {
        console.log(`New offer created: ${payload.offer_id}, SKU: ${payload.merchant_sku}`);
        
        // Here you would add the new product to your internal catalog
        // Example:
        // await catalogService.createProduct({
        //   externalId: payload.offer_id.toString(),
        //   sku: payload.merchant_sku,
        //   // ... other fields
        // });
      }
    );
  }
}