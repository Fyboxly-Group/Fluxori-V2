import { orderIngestionService } from '../index';
import { orderMapperRegistry } from '../mappers';
import Order from '../models/order.model';
import xeroInvoiceService from '../services/xero-invoice.service';
import { MarketplaceOrder, OrderStatus, PaymentStatus, ShippingStatus } from '../../marketplaces/models/marketplace.models';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../models/order.model');
jest.mock('../services/xero-invoice.service');
jest.mock('../../../utils/logger');

describe('OrderIngestionService', () => {
  // Sample data for tests
  const userId = '60d5ec8c67d0d7e8f42a0000';
  const organizationId = '60d5ec8c67d0d7e8f42a0001';
  const marketplaceId = 'shopify';
  
  // Mock Shopify order data
  const mockShopifyOrder: MarketplaceOrder = {
    id: 'shop_123',
    marketplaceOrderId: '12345',
    customerDetails: {
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '123-456-7890',
      billingAddress: {
        line1: '123 Billing St',
        city: 'Billtown',
        postalCode: '12345',
        country: 'USA'
      }
    },
    orderItems: [
      {
        id: 'item_1',
        sku: 'PROD-001',
        marketplaceProductId: 'shopify_prod_1',
        title: 'Test Product 1',
        quantity: 2,
        unitPrice: 10.00,
        tax: 1.50,
        total: 21.50
      }
    ],
    orderStatus: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PAID,
    shippingStatus: ShippingStatus.AWAITING_FULFILLMENT,
    shippingDetails: {
      address: {
        line1: '123 Shipping St',
        city: 'Shiptown',
        postalCode: '12345',
        country: 'USA'
      },
      method: 'Standard',
      carrier: 'UPS',
      trackingNumber: '1Z999AA10123456784'
    },
    paymentDetails: {
      method: 'Credit Card',
      amount: 26.50,
      currency: 'USD'
    },
    currencyCode: 'USD',
    subtotal: 20.00,
    shippingCost: 5.00,
    tax: 1.50,
    discount: 0,
    total: 26.50,
    createdAt: new Date('2023-01-15T12:00:00Z'),
    updatedAt: new Date('2023-01-15T12:00:00Z')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mongoose
    (mongoose.startSession as jest.Mock).mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(true),
      abortTransaction: jest.fn().mockResolvedValue(true),
      endSession: jest.fn()
    });
    
    // Mock Order.findOne
    (Order.findOne as jest.Mock).mockReturnValue({
      session: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null)
    });
    
    // Mock Order constructor and save
    (Order as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        _id: 'new_order_id',
        marketplaceOrderId: mockShopifyOrder.marketplaceOrderId,
        save: jest.fn().mockResolvedValue(true)
      })
    }));
    
    // Mock Xero invoice service
    (xeroInvoiceService.shouldCreateInvoice as jest.Mock).mockReturnValue(true);
    (xeroInvoiceService.createInvoice as jest.Mock).mockResolvedValue({
      success: true,
      invoiceId: 'xero_invoice_123',
      invoiceNumber: 'INV-123'
    });
  });

  describe('processOrders', () => {
    it('should process and create new orders', async () => {
      // Setup
      const orders = [mockShopifyOrder];
      
      // Execute
      await orderIngestionService.processOrders(orders, userId, organizationId, marketplaceId);
      
      // Verify
      expect(Order).toHaveBeenCalled();
      expect(xeroInvoiceService.shouldCreateInvoice).toHaveBeenCalled();
      expect(xeroInvoiceService.createInvoice).toHaveBeenCalled();
    });

    it('should handle empty orders array', async () => {
      // Setup
      const orders: MarketplaceOrder[] = [];
      
      // Execute
      await orderIngestionService.processOrders(orders, userId, organizationId, marketplaceId);
      
      // Verify
      expect(Order).not.toHaveBeenCalled();
      expect(xeroInvoiceService.shouldCreateInvoice).not.toHaveBeenCalled();
      expect(xeroInvoiceService.createInvoice).not.toHaveBeenCalled();
    });
  });

  describe('ingestOrders', () => {
    it('should handle unsupported marketplaces', async () => {
      // Setup
      jest.spyOn(orderMapperRegistry, 'hasMapper').mockReturnValue(false);
      
      // Execute
      const result = await orderIngestionService.ingestOrders(
        'unsupported_marketplace',
        userId,
        organizationId,
        [mockShopifyOrder]
      );
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(Order).not.toHaveBeenCalled();
    });

    it('should update existing orders if they exist', async () => {
      // Setup
      const existingOrder = {
        _id: 'existing_order_id',
        marketplaceOrderId: mockShopifyOrder.marketplaceOrderId,
        orderStatus: 'new',
        paymentStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };
      
      (Order.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingOrder)
      });
      
      // Execute
      const result = await orderIngestionService.ingestOrders(
        marketplaceId,
        userId,
        organizationId,
        [mockShopifyOrder]
      );
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.ordersUpdated).toBe(1);
      expect(existingOrder.save).toHaveBeenCalled();
    });
  });

  describe('Xero integration', () => {
    it('should create Xero invoice when conditions are met', async () => {
      // Setup
      (xeroInvoiceService.shouldCreateInvoice as jest.Mock).mockReturnValue(true);
      
      // Execute
      await orderIngestionService.processOrders(
        [mockShopifyOrder],
        userId,
        organizationId,
        marketplaceId
      );
      
      // Verify
      expect(xeroInvoiceService.shouldCreateInvoice).toHaveBeenCalled();
      expect(xeroInvoiceService.createInvoice).toHaveBeenCalled();
    });

    it('should not create Xero invoice when conditions are not met', async () => {
      // Setup
      (xeroInvoiceService.shouldCreateInvoice as jest.Mock).mockReturnValue(false);
      
      // Execute
      await orderIngestionService.processOrders(
        [mockShopifyOrder],
        userId,
        organizationId,
        marketplaceId
      );
      
      // Verify
      expect(xeroInvoiceService.shouldCreateInvoice).toHaveBeenCalled();
      expect(xeroInvoiceService.createInvoice).not.toHaveBeenCalled();
    });

    it('should handle Xero invoice creation errors', async () => {
      // Setup
      (xeroInvoiceService.shouldCreateInvoice as jest.Mock).mockReturnValue(true);
      (xeroInvoiceService.createInvoice as jest.Mock).mockRejectedValue(new Error('Xero API error'));
      
      // Execute
      await orderIngestionService.processOrders(
        [mockShopifyOrder],
        userId,
        organizationId,
        marketplaceId
      );
      
      // Verify -- the process should continue despite Xero errors
      expect(xeroInvoiceService.shouldCreateInvoice).toHaveBeenCalled();
      expect(xeroInvoiceService.createInvoice).toHaveBeenCalled();
    });
  });
});