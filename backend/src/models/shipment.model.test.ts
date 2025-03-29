import mongoose from 'mongoose';
import Shipment, { IShipmentDocument } from './shipment.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Shipment Model', () => {
  let testShipment: IShipmentDocument;
  const testUserId = new mongoose.Types.ObjectId();
  const testProductId = new mongoose.Types.ObjectId();
  const testPurchaseOrderId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test shipment before each test
    testShipment = new Shipment({
      shipmentNumber: 'SHIP-12345',
      type: 'inbound',
      courier: 'FedEx',
      trackingNumber: 'FDX123456789',
      trackingUrl: 'https://fedex.com/track/FDX123456789',
      status: 'in-transit',
      origin: {
        name: 'Supplier Corp',
        address: '123 Supplier St',
        city: 'Supplier City',
        state: 'SC',
        postalCode: '12345',
        country: 'USA',
        phone: '123-456-7890',
      },
      destination: {
        name: 'Warehouse Inc',
        address: '456 Warehouse Blvd',
        city: 'Warehouse City',
        state: 'WC',
        postalCode: '54321',
        country: 'USA',
        phone: '098-765-4321',
      },
      items: [
        {
          product: testProductId,
          sku: 'WIDGET-123',
          name: 'Test Widget',
          quantity: 10,
        }
      ],
      purchaseOrder: testPurchaseOrderId,
      estimatedDeliveryDate: new Date('2025-04-15'),
      shippedDate: new Date('2025-04-10'),
      weight: 25.5,
      weightUnit: 'kg',
      dimensions: {
        length: 50,
        width: 40,
        height: 30,
        unit: 'cm',
      },
      shippingCost: 45.99,
      notes: 'Handle with care',
      deliveryInstructions: 'Leave at loading dock',
      signatureRequired: true,
      documents: [
        {
          title: 'Packing Slip',
          fileUrl: 'https://storage.example.com/packingslip-12345.pdf',
          fileType: 'application/pdf',
          uploadedBy: testUserId,
          uploadedAt: new Date('2025-04-10'),
          category: 'packing-slip',
        }
      ],
      trackingHistory: [
        {
          status: 'Picked up',
          location: 'Origin Facility',
          timestamp: new Date('2025-04-10T09:00:00Z'),
          description: 'Package picked up by courier',
        },
        {
          status: 'In Transit',
          location: 'Distribution Center',
          timestamp: new Date('2025-04-12T15:30:00Z'),
          description: 'Package arrived at distribution center',
        }
      ],
      createdBy: testUserId,
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Shipment.deleteMany({});
  });
  
  it('should create a new shipment with the correct fields', async () => {
    const savedShipment = await testShipment.save();
    
    // Verify required fields
    expect(savedShipment._id).toBeDefined();
    expect(savedShipment.shipmentNumber).toBe('SHIP-12345');
    expect(savedShipment.type).toBe('inbound');
    expect(savedShipment.courier).toBe('FedEx');
    expect(savedShipment.trackingNumber).toBe('FDX123456789');
    expect(savedShipment.trackingUrl).toBe('https://fedex.com/track/FDX123456789');
    expect(savedShipment.status).toBe('in-transit');
    
    // Verify origin
    expect(savedShipment.origin.name).toBe('Supplier Corp');
    expect(savedShipment.origin.address).toBe('123 Supplier St');
    expect(savedShipment.origin.city).toBe('Supplier City');
    expect(savedShipment.origin.state).toBe('SC');
    expect(savedShipment.origin.postalCode).toBe('12345');
    expect(savedShipment.origin.country).toBe('USA');
    expect(savedShipment.origin.phone).toBe('123-456-7890');
    
    // Verify destination
    expect(savedShipment.destination.name).toBe('Warehouse Inc');
    expect(savedShipment.destination.address).toBe('456 Warehouse Blvd');
    expect(savedShipment.destination.city).toBe('Warehouse City');
    expect(savedShipment.destination.state).toBe('WC');
    expect(savedShipment.destination.postalCode).toBe('54321');
    expect(savedShipment.destination.country).toBe('USA');
    expect(savedShipment.destination.phone).toBe('098-765-4321');
    
    // Verify items
    expect(savedShipment.items).toHaveLength(1);
    expect(savedShipment.items[0].product.toString()).toBe(testProductId.toString());
    expect(savedShipment.items[0].sku).toBe('WIDGET-123');
    expect(savedShipment.items[0].name).toBe('Test Widget');
    expect(savedShipment.items[0].quantity).toBe(10);
    
    // Verify related objects
    expect(savedShipment.purchaseOrder?.toString()).toBe(testPurchaseOrderId.toString());
    
    // Verify dates
    expect(savedShipment.estimatedDeliveryDate).toEqual(new Date('2025-04-15'));
    expect(savedShipment.shippedDate).toEqual(new Date('2025-04-10'));
    
    // Verify physical details
    expect(savedShipment.weight).toBe(25.5);
    expect(savedShipment.weightUnit).toBe('kg');
    expect(savedShipment.dimensions?.length).toBe(50);
    expect(savedShipment.dimensions?.width).toBe(40);
    expect(savedShipment.dimensions?.height).toBe(30);
    expect(savedShipment.dimensions?.unit).toBe('cm');
    expect(savedShipment.shippingCost).toBe(45.99);
    
    // Verify notes and instructions
    expect(savedShipment.notes).toBe('Handle with care');
    expect(savedShipment.deliveryInstructions).toBe('Leave at loading dock');
    expect(savedShipment.signatureRequired).toBe(true);
    
    // Verify documents
    expect(savedShipment.documents).toHaveLength(1);
    expect(savedShipment.documents?.[0].title).toBe('Packing Slip');
    expect(savedShipment.documents?.[0].fileUrl).toBe('https://storage.example.com/packingslip-12345.pdf');
    expect(savedShipment.documents?.[0].fileType).toBe('application/pdf');
    expect(savedShipment.documents?.[0].uploadedBy.toString()).toBe(testUserId.toString());
    expect(savedShipment.documents?.[0].category).toBe('packing-slip');
    
    // Verify tracking history
    expect(savedShipment.trackingHistory).toHaveLength(2);
    expect(savedShipment.trackingHistory?.[0].status).toBe('Picked up');
    expect(savedShipment.trackingHistory?.[0].location).toBe('Origin Facility');
    expect(savedShipment.trackingHistory?.[1].status).toBe('In Transit');
    expect(savedShipment.trackingHistory?.[1].description).toBe('Package arrived at distribution center');
    
    // Verify metadata
    expect(savedShipment.createdBy.toString()).toBe(testUserId.toString());
    expect(savedShipment.createdAt).toBeDefined();
    expect(savedShipment.updatedAt).toBeDefined();
  });
  
  it('should require all required fields', async () => {
    const incompleteShipment = new Shipment({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteShipment.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.shipmentNumber).toBeDefined();
    expect(error.errors.type).toBeDefined();
    expect(error.errors.courier).toBeDefined();
    expect(error.errors.trackingNumber).toBeDefined();
    expect(error.errors['origin.name']).toBeDefined();
    expect(error.errors['origin.address']).toBeDefined();
    expect(error.errors['destination.name']).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });
  
  it('should validate type is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testShipment.type = 'invalid_type';
    
    let error;
    try {
      await testShipment.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.type).toBeDefined();
    
    // Test with valid type
    testShipment.type = 'outbound';
    
    // Should not throw error
    await testShipment.validate();
  });
  
  it('should validate status is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testShipment.status = 'invalid_status';
    
    let error;
    try {
      await testShipment.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
    
    // Test with valid status
    testShipment.status = 'delivered';
    
    // Should not throw error
    await testShipment.validate();
  });
  
  it('should validate weightUnit is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testShipment.weightUnit = 'invalid_unit';
    
    let error;
    try {
      await testShipment.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.weightUnit).toBeDefined();
    
    // Test with valid unit
    testShipment.weightUnit = 'lb';
    
    // Should not throw error
    await testShipment.validate();
  });
  
  it('should validate dimensions unit is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testShipment.dimensions.unit = 'invalid_unit';
    
    let error;
    try {
      await testShipment.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['dimensions.unit']).toBeDefined();
    
    // Test with valid unit
    testShipment.dimensions!.unit = 'in';
    
    // Should not throw error
    await testShipment.validate();
  });
  
  it('should validate document category is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testShipment.documents[0].category = 'invalid_category';
    
    let error;
    try {
      await testShipment.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['documents.0.category']).toBeDefined();
    
    // Test with valid category
    testShipment.documents![0].category = 'invoice';
    
    // Should not throw error
    await testShipment.validate();
  });
  
  it('should validate required fields in items', async () => {
    // Missing required field in items
    testShipment.items.push({
      // @ts-ignore: intentionally omitting required fields
      product: testProductId,
      // Missing sku and name
      quantity: 5
    });
    
    let error;
    try {
      await testShipment.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['items.1.sku']).toBeDefined();
    expect(error.errors['items.1.name']).toBeDefined();
  });
  
  it('should validate item quantity is at least 1', async () => {
    testShipment.items[0].quantity = 0;
    
    let error;
    try {
      await testShipment.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['items.0.quantity']).toBeDefined();
    
    // Test with valid quantity
    testShipment.items[0].quantity = 1;
    
    // Should not throw error
    await testShipment.validate();
  });
  
  it('should enforce shipmentNumber uniqueness', async () => {
    // Save the first shipment
    await testShipment.save();
    
    // Try to create another shipment with the same shipmentNumber
    const duplicateShipment = new Shipment({
      shipmentNumber: 'SHIP-12345', // Same shipmentNumber as the first shipment
      type: 'outbound',
      courier: 'UPS',
      trackingNumber: 'UPS987654321',
      origin: {
        name: 'Company A',
        address: '789 Company A St',
        city: 'Company A City',
        state: 'CA',
        postalCode: '67890',
        country: 'USA',
        phone: '111-222-3333',
      },
      destination: {
        name: 'Customer B',
        address: '321 Customer B Rd',
        city: 'Customer B City',
        state: 'CB',
        postalCode: '09876',
        country: 'USA',
        phone: '444-555-6666',
      },
      items: [
        {
          product: testProductId,
          sku: 'WIDGET-123',
          name: 'Test Widget',
          quantity: 2,
        }
      ],
      createdBy: testUserId,
    });
    
    // Expect an error due to duplicate shipmentNumber
    let error;
    try {
      await duplicateShipment.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });
  
  it('should update shipment status correctly', async () => {
    // Save the initial shipment
    await testShipment.save();
    
    // Update status
    testShipment.status = 'delivered';
    testShipment.deliveredDate = new Date('2025-04-14');
    
    await testShipment.save();
    
    // Retrieve shipment from database
    const updatedShipment = await Shipment.findById(testShipment._id);
    
    expect(updatedShipment!.status).toBe('delivered');
    expect(updatedShipment!.deliveredDate).toEqual(new Date('2025-04-14'));
  });
  
  it('should add tracking events correctly', async () => {
    // Save the initial shipment
    await testShipment.save();
    
    // Add a new tracking event
    testShipment.trackingHistory?.push({
      status: 'Out for Delivery',
      location: 'Local Facility',
      timestamp: new Date('2025-04-14T08:00:00Z'),
      description: 'Package out for delivery',
    });
    
    await testShipment.save();
    
    // Retrieve shipment from database
    const updatedShipment = await Shipment.findById(testShipment._id);
    
    expect(updatedShipment!.trackingHistory).toHaveLength(3);
    expect(updatedShipment!.trackingHistory?.[2].status).toBe('Out for Delivery');
    expect(updatedShipment!.trackingHistory?.[2].location).toBe('Local Facility');
    expect(updatedShipment!.trackingHistory?.[2].description).toBe('Package out for delivery');
  });
  
  it('should set default values when not provided', async () => {
    // Create a shipment with minimal fields
    const minimalShipment = new Shipment({
      shipmentNumber: 'MIN-001',
      type: 'inbound',
      courier: 'DHL',
      trackingNumber: 'DHL123456789',
      origin: {
        name: 'Origin Company',
        address: '123 Origin St',
        city: 'Origin City',
        state: 'OC',
        postalCode: '12345',
        country: 'USA',
        phone: '111-222-3333',
      },
      destination: {
        name: 'Destination Company',
        address: '456 Destination Ave',
        city: 'Destination City',
        state: 'DC',
        postalCode: '54321',
        country: 'USA',
        phone: '444-555-6666',
      },
      items: [
        {
          product: testProductId,
          sku: 'WIDGET-123',
          name: 'Test Widget',
          quantity: 5,
        }
      ],
      createdBy: testUserId,
    });
    
    const savedShipment = await minimalShipment.save();
    
    // Default values should be set
    expect(savedShipment.status).toBe('pending');
    expect(savedShipment.signatureRequired).toBe(false);
    expect(savedShipment.weightUnit).toBe('kg');
  });
});