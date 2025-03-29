import mongoose from 'mongoose';
import ShipmentAlert, { IShipmentAlertDocument } from './shipment-alert.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Shipment Alert Model', () => {
  let testShipmentAlert: IShipmentAlertDocument;
  const testUserId = new mongoose.Types.ObjectId();
  const testShipmentId = new mongoose.Types.ObjectId();
  const testPurchaseOrderId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test shipment alert before each test
    testShipmentAlert = new ShipmentAlert({
      shipment: testShipmentId,
      shipmentNumber: 'SHP-2025-00001',
      trackingNumber: '1Z999AA10123456784',
      courier: 'UPS',
      alertType: 'delayed',
      status: 'active',
      priority: 'high',
      description: 'Shipment delayed by 2 days',
      expectedDeliveryDate: new Date('2025-03-25'),
      newExpectedDeliveryDate: new Date('2025-03-27'),
      delayReason: 'Weather conditions',
      currentLocation: 'Chicago, IL',
      purchaseOrder: testPurchaseOrderId,
      createdBy: testUserId
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await ShipmentAlert.deleteMany({});
  });
  
  it('should create a new shipment alert with the correct fields', async () => {
    const savedAlert = await testShipmentAlert.save();
    
    // Verify required fields
    expect(savedAlert._id).toBeDefined();
    expect(savedAlert.shipment.toString()).toBe(testShipmentId.toString());
    expect(savedAlert.shipmentNumber).toBe('SHP-2025-00001');
    expect(savedAlert.trackingNumber).toBe('1Z999AA10123456784');
    expect(savedAlert.courier).toBe('UPS');
    expect(savedAlert.alertType).toBe('delayed');
    expect(savedAlert.status).toBe('active');
    expect(savedAlert.priority).toBe('high');
    expect(savedAlert.description).toBe('Shipment delayed by 2 days');
    expect(savedAlert.expectedDeliveryDate).toEqual(new Date('2025-03-25'));
    expect(savedAlert.newExpectedDeliveryDate).toEqual(new Date('2025-03-27'));
    expect(savedAlert.delayReason).toBe('Weather conditions');
    expect(savedAlert.currentLocation).toBe('Chicago, IL');
    expect(savedAlert.purchaseOrder!.toString()).toBe(testPurchaseOrderId.toString());
    expect(savedAlert.createdBy.toString()).toBe(testUserId.toString());
    expect(savedAlert.createdAt).toBeDefined();
    expect(savedAlert.updatedAt).toBeDefined();
    
    // Default values should be set
    expect(savedAlert.customerNotified).toBe(false);
    expect(savedAlert.supplierNotified).toBe(false);
  });
  
  it('should require all required fields', async () => {
    const incompleteAlert = new ShipmentAlert({
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
    expect(error.errors.shipment).toBeDefined();
    expect(error.errors.shipmentNumber).toBeDefined();
    expect(error.errors.trackingNumber).toBeDefined();
    expect(error.errors.courier).toBeDefined();
    expect(error.errors.alertType).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });
  
  it('should validate alertType is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testShipmentAlert.alertType = 'invalid_type';
    
    let error;
    try {
      await testShipmentAlert.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.alertType).toBeDefined();
    
    // Test with valid alert type
    testShipmentAlert.alertType = 'delivery-exception';
    
    // Should not throw error
    await testShipmentAlert.validate();
  });
  
  it('should validate status is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testShipmentAlert.status = 'invalid_status';
    
    let error;
    try {
      await testShipmentAlert.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
    
    // Test with valid status
    testShipmentAlert.status = 'resolved';
    
    // Should not throw error
    await testShipmentAlert.validate();
  });
  
  it('should validate priority is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testShipmentAlert.priority = 'invalid_priority';
    
    let error;
    try {
      await testShipmentAlert.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.priority).toBeDefined();
    
    // Test with valid priority
    testShipmentAlert.priority = 'critical';
    
    // Should not throw error
    await testShipmentAlert.validate();
  });
  
  it('should handle resolution data correctly', async () => {
    // Update the alert to be resolved
    testShipmentAlert.status = 'resolved';
    testShipmentAlert.resolvedBy = testUserId;
    testShipmentAlert.resolvedAt = new Date();
    testShipmentAlert.resolutionNotes = 'Customer notified about delay';
    
    const savedAlert = await testShipmentAlert.save();
    
    expect(savedAlert.status).toBe('resolved');
    expect(savedAlert.resolvedBy!.toString()).toBe(testUserId.toString());
    expect(savedAlert.resolvedAt).toBeDefined();
    expect(savedAlert.resolutionNotes).toBe('Customer notified about delay');
  });
  
  it('should handle notification flags correctly', async () => {
    testShipmentAlert.customerNotified = true;
    testShipmentAlert.supplierNotified = true;
    
    const savedAlert = await testShipmentAlert.save();
    
    expect(savedAlert.customerNotified).toBe(true);
    expect(savedAlert.supplierNotified).toBe(true);
  });
});