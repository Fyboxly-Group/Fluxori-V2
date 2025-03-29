import mongoose from 'mongoose';
import InventoryAlert, { IInventoryAlertDocument } from './inventory-alert.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Inventory Alert Model', () => {
  let testInventoryAlert: IInventoryAlertDocument;
  const testUserId = new mongoose.Types.ObjectId();
  const testInventoryItemId = new mongoose.Types.ObjectId();
  const testPurchaseOrderId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test inventory alert before each test
    testInventoryAlert = new InventoryAlert({
      item: testInventoryItemId,
      itemName: 'Test Product',
      itemSku: 'TEST-SKU-001',
      alertType: 'low-stock',
      status: 'active',
      priority: 'high',
      description: 'Low stock level alert',
      currentQuantity: 5,
      thresholdQuantity: 10,
      recommendedAction: 'Reorder product',
      createdBy: testUserId
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await InventoryAlert.deleteMany({});
  });
  
  it('should create a new inventory alert with the correct fields', async () => {
    const savedAlert = await testInventoryAlert.save();
    
    // Verify required fields
    expect(savedAlert._id).toBeDefined();
    expect(savedAlert.item.toString()).toBe(testInventoryItemId.toString());
    expect(savedAlert.itemName).toBe('Test Product');
    expect(savedAlert.itemSku).toBe('TEST-SKU-001');
    expect(savedAlert.alertType).toBe('low-stock');
    expect(savedAlert.status).toBe('active');
    expect(savedAlert.priority).toBe('high');
    expect(savedAlert.description).toBe('Low stock level alert');
    expect(savedAlert.currentQuantity).toBe(5);
    expect(savedAlert.thresholdQuantity).toBe(10);
    expect(savedAlert.recommendedAction).toBe('Reorder product');
    expect(savedAlert.createdBy.toString()).toBe(testUserId.toString());
    expect(savedAlert.createdAt).toBeDefined();
    expect(savedAlert.updatedAt).toBeDefined();
    
    // Default values should be set
    expect(savedAlert.purchaseOrderCreated).toBe(false);
  });
  
  it('should require all required fields', async () => {
    const incompleteAlert = new InventoryAlert({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteAlert.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.item).toBeDefined();
    expect(error.errors.itemName).toBeDefined();
    expect(error.errors.itemSku).toBeDefined();
    expect(error.errors.alertType).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });
  
  it('should validate alertType is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testInventoryAlert.alertType = 'invalid_type';
    
    let error;
    try {
      await testInventoryAlert.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.alertType).toBeDefined();
    
    // Test with valid alert type
    testInventoryAlert.alertType = 'out-of-stock';
    
    // Should not throw error
    await testInventoryAlert.validate();
  });
  
  it('should validate status is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testInventoryAlert.status = 'invalid_status';
    
    let error;
    try {
      await testInventoryAlert.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
    
    // Test with valid status
    testInventoryAlert.status = 'resolved';
    
    // Should not throw error
    await testInventoryAlert.validate();
  });
  
  it('should validate priority is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testInventoryAlert.priority = 'invalid_priority';
    
    let error;
    try {
      await testInventoryAlert.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.priority).toBeDefined();
    
    // Test with valid priority
    testInventoryAlert.priority = 'critical';
    
    // Should not throw error
    await testInventoryAlert.validate();
  });
  
  it('should handle resolution data correctly', async () => {
    // Update the alert to be resolved
    testInventoryAlert.status = 'resolved';
    testInventoryAlert.resolvedBy = testUserId;
    testInventoryAlert.resolvedAt = new Date();
    testInventoryAlert.resolutionNotes = 'Ordered new stock';
    testInventoryAlert.purchaseOrderCreated = true;
    testInventoryAlert.purchaseOrder = testPurchaseOrderId;
    
    const savedAlert = await testInventoryAlert.save();
    
    expect(savedAlert.status).toBe('resolved');
    expect(savedAlert.resolvedBy!.toString()).toBe(testUserId.toString());
    expect(savedAlert.resolvedAt).toBeDefined();
    expect(savedAlert.resolutionNotes).toBe('Ordered new stock');
    expect(savedAlert.purchaseOrderCreated).toBe(true);
    expect(savedAlert.purchaseOrder!.toString()).toBe(testPurchaseOrderId.toString());
  });
  
  it('should handle assignment correctly', async () => {
    const assigneeId = new mongoose.Types.ObjectId();
    testInventoryAlert.assignedTo = assigneeId;
    
    const savedAlert = await testInventoryAlert.save();
    
    expect(savedAlert.assignedTo!.toString()).toBe(assigneeId.toString());
  });
  
  it('should allow expiry date for expiring alerts', async () => {
    testInventoryAlert.alertType = 'expiring';
    testInventoryAlert.expiryDate = new Date('2025-12-31');
    
    const savedAlert = await testInventoryAlert.save();
    
    expect(savedAlert.alertType).toBe('expiring');
    expect(savedAlert.expiryDate).toEqual(new Date('2025-12-31'));
  });
});