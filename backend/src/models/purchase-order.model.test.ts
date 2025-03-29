import mongoose from 'mongoose';
import PurchaseOrder, { IPurchaseOrderDocument } from './purchase-order.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Purchase Order Model', () => {
  let testPurchaseOrder: IPurchaseOrderDocument;
  const testUserId = new mongoose.Types.ObjectId();
  const testSupplierId = new mongoose.Types.ObjectId();
  const testProductId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test purchase order before each test
    testPurchaseOrder = new PurchaseOrder({
      orderNumber: 'PO-2025-00001',
      supplier: testSupplierId,
      status: 'draft',
      orderDate: new Date('2025-03-20'),
      expectedDeliveryDate: new Date('2025-04-05'),
      items: [
        {
          product: testProductId,
          sku: 'TEST-SKU-001',
          name: 'Test Product',
          quantity: 10,
          costPrice: 25.50,
          total: 255.00,
          receivedQuantity: 0
        }
      ],
      shippingCost: 15.00,
      taxAmount: 27.00,
      totalAmount: 297.00,
      paymentStatus: 'unpaid',
      paymentDueDate: new Date('2025-04-20'),
      paymentMethod: 'bank transfer',
      notes: 'Test purchase order',
      createdBy: testUserId
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await PurchaseOrder.deleteMany({});
  });
  
  it('should create a new purchase order with the correct fields', async () => {
    const savedOrder = await testPurchaseOrder.save();
    
    // Verify required fields
    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.orderNumber).toBe('PO-2025-00001');
    expect(savedOrder.supplier.toString()).toBe(testSupplierId.toString());
    expect(savedOrder.status).toBe('draft');
    expect(savedOrder.orderDate).toEqual(new Date('2025-03-20'));
    expect(savedOrder.expectedDeliveryDate).toEqual(new Date('2025-04-05'));
    
    // Verify items
    expect(savedOrder.items).toHaveLength(1);
    expect(savedOrder.items[0].product.toString()).toBe(testProductId.toString());
    expect(savedOrder.items[0].sku).toBe('TEST-SKU-001');
    expect(savedOrder.items[0].name).toBe('Test Product');
    expect(savedOrder.items[0].quantity).toBe(10);
    expect(savedOrder.items[0].costPrice).toBe(25.50);
    expect(savedOrder.items[0].total).toBe(255.00);
    
    // Verify other fields
    expect(savedOrder.shippingCost).toBe(15.00);
    expect(savedOrder.taxAmount).toBe(27.00);
    expect(savedOrder.totalAmount).toBe(297.00);
    expect(savedOrder.paymentStatus).toBe('unpaid');
    expect(savedOrder.paymentDueDate).toEqual(new Date('2025-04-20'));
    expect(savedOrder.paymentMethod).toBe('bank transfer');
    expect(savedOrder.notes).toBe('Test purchase order');
    expect(savedOrder.createdBy.toString()).toBe(testUserId.toString());
    expect(savedOrder.createdAt).toBeDefined();
    expect(savedOrder.updatedAt).toBeDefined();
  });
  
  it('should require all required fields', async () => {
    const incompleteOrder = new PurchaseOrder({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteOrder.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.orderNumber).toBeDefined();
    expect(error.errors.supplier).toBeDefined();
    expect(error.errors.totalAmount).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });
  
  it('should validate item quantity is at least 1', async () => {
    // Test with quantity below minimum
    testPurchaseOrder.items[0].quantity = 0;
    
    let error;
    try {
      await testPurchaseOrder.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['items.0.quantity']).toBeDefined();
    
    // Test with valid quantity
    testPurchaseOrder.items[0].quantity = 1;
    
    // Should not throw error
    await testPurchaseOrder.validate();
  });
  
  it('should validate item cost price is not negative', async () => {
    testPurchaseOrder.items[0].costPrice = -1;
    
    let error;
    try {
      await testPurchaseOrder.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['items.0.costPrice']).toBeDefined();
    
    // Test with valid cost price
    testPurchaseOrder.items[0].costPrice = 0;
    
    // Should not throw error
    await testPurchaseOrder.validate();
  });
  
  it('should validate totalAmount is not negative', async () => {
    testPurchaseOrder.totalAmount = -1;
    
    let error;
    try {
      await testPurchaseOrder.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.totalAmount).toBeDefined();
    
    // Test with valid total amount
    testPurchaseOrder.totalAmount = 0;
    
    // Should not throw error
    await testPurchaseOrder.validate();
  });
  
  it('should validate status is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testPurchaseOrder.status = 'invalid_status';
    
    let error;
    try {
      await testPurchaseOrder.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
    
    // Test with valid status
    testPurchaseOrder.status = 'confirmed';
    
    // Should not throw error
    await testPurchaseOrder.validate();
  });
  
  it('should validate paymentStatus is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testPurchaseOrder.paymentStatus = 'invalid_status';
    
    let error;
    try {
      await testPurchaseOrder.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.paymentStatus).toBeDefined();
    
    // Test with valid payment status
    testPurchaseOrder.paymentStatus = 'partial';
    
    // Should not throw error
    await testPurchaseOrder.validate();
  });
  
  it('should require item.product, item.sku, item.name, and item.quantity', async () => {
    // Create a purchase order with an incomplete item
    testPurchaseOrder.items = [
      {
        // @ts-ignore: intentionally omitting required fields
        costPrice: 25.50,
        total: 255.00,
      }
    ];
    
    let error;
    try {
      await testPurchaseOrder.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['items.0.product']).toBeDefined();
    expect(error.errors['items.0.sku']).toBeDefined();
    expect(error.errors['items.0.name']).toBeDefined();
    expect(error.errors['items.0.quantity']).toBeDefined();
  });
});