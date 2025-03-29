import mongoose from 'mongoose';
import InventoryItem, { IInventoryItemDocument } from './inventory.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Inventory Model', () => {
  let testInventoryItem: IInventoryItemDocument;
  const testUserId = new mongoose.Types.ObjectId();
  const testSupplierId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test inventory item before each test
    testInventoryItem = new InventoryItem({
      sku: 'WIDGET-123',
      name: 'Test Widget',
      description: 'This is a test widget',
      category: 'Electronics',
      price: 29.99,
      costPrice: 15.50,
      stockQuantity: 25,
      reorderPoint: 10,
      reorderQuantity: 20,
      supplier: testSupplierId,
      location: 'Warehouse A, Shelf B4',
      dimensions: {
        width: 10,
        height: 5,
        depth: 2,
        weight: 0.5,
        unit: 'cm',
        weightUnit: 'kg',
      },
      barcode: '123456789012',
      images: ['https://storage.example.com/widget123-1.jpg', 'https://storage.example.com/widget123-2.jpg'],
      isActive: true,
      tags: ['electronic', 'gadget', 'bestseller'],
      variations: [
        {
          name: 'Color',
          values: ['Red', 'Blue', 'Green'],
        },
        {
          name: 'Size',
          values: ['Small', 'Medium', 'Large'],
        }
      ],
      createdBy: testUserId,
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await InventoryItem.deleteMany({});
  });
  
  it('should create a new inventory item with the correct fields', async () => {
    const savedItem = await testInventoryItem.save();
    
    // Verify required fields
    expect(savedItem._id).toBeDefined();
    expect(savedItem.sku).toBe('WIDGET-123');
    expect(savedItem.name).toBe('Test Widget');
    expect(savedItem.description).toBe('This is a test widget');
    expect(savedItem.category).toBe('Electronics');
    expect(savedItem.price).toBe(29.99);
    expect(savedItem.costPrice).toBe(15.50);
    expect(savedItem.stockQuantity).toBe(25);
    expect(savedItem.reorderPoint).toBe(10);
    expect(savedItem.reorderQuantity).toBe(20);
    expect(savedItem.supplier.toString()).toBe(testSupplierId.toString());
    expect(savedItem.location).toBe('Warehouse A, Shelf B4');
    
    // Verify dimensions
    expect(savedItem.dimensions?.width).toBe(10);
    expect(savedItem.dimensions?.height).toBe(5);
    expect(savedItem.dimensions?.depth).toBe(2);
    expect(savedItem.dimensions?.weight).toBe(0.5);
    expect(savedItem.dimensions?.unit).toBe('cm');
    expect(savedItem.dimensions?.weightUnit).toBe('kg');
    
    // Verify other fields
    expect(savedItem.barcode).toBe('123456789012');
    expect(savedItem.images).toHaveLength(2);
    expect(savedItem.images?.[0]).toBe('https://storage.example.com/widget123-1.jpg');
    expect(savedItem.isActive).toBe(true);
    
    // Verify arrays
    expect(savedItem.tags).toHaveLength(3);
    expect(savedItem.tags?.[0]).toBe('electronic');
    expect(savedItem.tags?.[1]).toBe('gadget');
    expect(savedItem.tags?.[2]).toBe('bestseller');
    
    // Verify variations
    expect(savedItem.variations).toHaveLength(2);
    expect(savedItem.variations?.[0].name).toBe('Color');
    expect(savedItem.variations?.[0].values).toEqual(['Red', 'Blue', 'Green']);
    expect(savedItem.variations?.[1].name).toBe('Size');
    expect(savedItem.variations?.[1].values).toEqual(['Small', 'Medium', 'Large']);
    
    // Verify metadata
    expect(savedItem.createdBy.toString()).toBe(testUserId.toString());
    expect(savedItem.createdAt).toBeDefined();
    expect(savedItem.updatedAt).toBeDefined();
  });
  
  it('should require all required fields', async () => {
    const incompleteItem = new InventoryItem({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteItem.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.sku).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.price).toBeDefined();
    expect(error.errors.costPrice).toBeDefined();
    expect(error.errors.supplier).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });
  
  it('should validate price and costPrice are not negative', async () => {
    // Test with negative price
    testInventoryItem.price = -10;
    
    let error;
    try {
      await testInventoryItem.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.price).toBeDefined();
    
    // Reset error
    error = undefined;
    
    // Test with negative costPrice
    testInventoryItem.price = 29.99; // Reset price to valid value
    testInventoryItem.costPrice = -5;
    
    try {
      await testInventoryItem.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.costPrice).toBeDefined();
    
    // Test with valid values
    testInventoryItem.costPrice = 15.50;
    
    // Should not throw error
    await testInventoryItem.validate();
  });
  
  it('should validate dimensions unit values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testInventoryItem.dimensions.unit = 'invalid_unit';
    
    let error;
    try {
      await testInventoryItem.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['dimensions.unit']).toBeDefined();
    
    // Reset to valid value
    testInventoryItem.dimensions!.unit = 'mm';
    
    // Should not throw error
    await testInventoryItem.validate();
  });
  
  it('should validate weight unit values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testInventoryItem.dimensions.weightUnit = 'invalid_weight_unit';
    
    let error;
    try {
      await testInventoryItem.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['dimensions.weightUnit']).toBeDefined();
    
    // Reset to valid value
    testInventoryItem.dimensions!.weightUnit = 'lb';
    
    // Should not throw error
    await testInventoryItem.validate();
  });
  
  it('should validate required fields in variations', async () => {
    // Test with missing values in variations
    testInventoryItem.variations?.push({
      name: 'Material',
      // @ts-ignore: intentionally missing values
      values: [],
    });
    
    let error;
    try {
      await testInventoryItem.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    
    // Test with valid variation
    testInventoryItem.variations = [
      {
        name: 'Material',
        values: ['Plastic', 'Metal'],
      }
    ];
    
    // Should not throw error
    await testInventoryItem.validate();
  });
  
  it('should trim whitespace from string fields', async () => {
    testInventoryItem.name = '  Trimmed Widget Name  ';
    testInventoryItem.description = '  Trimmed Description  ';
    testInventoryItem.category = '  Electronics  ';
    testInventoryItem.tags = ['  tag1  ', '  tag2  '];
    
    const savedItem = await testInventoryItem.save();
    
    expect(savedItem.name).toBe('Trimmed Widget Name');
    expect(savedItem.description).toBe('Trimmed Description');
    expect(savedItem.category).toBe('Electronics');
    expect(savedItem.tags[0]).toBe('tag1');
    expect(savedItem.tags[1]).toBe('tag2');
  });
  
  it('should enforce SKU uniqueness', async () => {
    // Save the first item
    await testInventoryItem.save();
    
    // Try to create another item with the same SKU
    const duplicateItem = new InventoryItem({
      sku: 'WIDGET-123', // Same SKU as the first item
      name: 'Duplicate Item',
      category: 'Test',
      price: 19.99,
      costPrice: 10.00,
      stockQuantity: 5,
      reorderPoint: 2,
      reorderQuantity: 5,
      supplier: testSupplierId,
      createdBy: testUserId,
    });
    
    // Expect an error due to duplicate SKU
    let error;
    try {
      await duplicateItem.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });
  
  it('should update stock quantity correctly', async () => {
    // Save the initial item
    await testInventoryItem.save();
    
    // Update stock quantity
    testInventoryItem.stockQuantity = 15;
    await testInventoryItem.save();
    
    // Retrieve item from database
    const updatedItem = await InventoryItem.findById(testInventoryItem._id);
    
    expect(updatedItem!.stockQuantity).toBe(15);
  });
  
  it('should update price and cost correctly', async () => {
    // Save the initial item
    await testInventoryItem.save();
    
    // Update prices
    testInventoryItem.price = 34.99;
    testInventoryItem.costPrice = 18.00;
    await testInventoryItem.save();
    
    // Retrieve item from database
    const updatedItem = await InventoryItem.findById(testInventoryItem._id);
    
    expect(updatedItem!.price).toBe(34.99);
    expect(updatedItem!.costPrice).toBe(18.00);
  });
  
  it('should set default values when not provided', async () => {
    // Create an item with minimal fields
    const minimalItem = new InventoryItem({
      sku: 'MIN-001',
      name: 'Minimal Item',
      category: 'Test',
      price: 9.99,
      costPrice: 5.00,
      supplier: testSupplierId,
      createdBy: testUserId,
    });
    
    const savedItem = await minimalItem.save();
    
    // Default values should be set
    expect(savedItem.stockQuantity).toBe(0);
    expect(savedItem.reorderPoint).toBe(5);
    expect(savedItem.reorderQuantity).toBe(10);
    expect(savedItem.isActive).toBe(true);
  });
  
  it('should update the item active status correctly', async () => {
    // Save the initial item
    await testInventoryItem.save();
    
    // Deactivate the item
    testInventoryItem.isActive = false;
    await testInventoryItem.save();
    
    // Retrieve item from database
    const updatedItem = await InventoryItem.findById(testInventoryItem._id);
    
    expect(updatedItem!.isActive).toBe(false);
  });
});