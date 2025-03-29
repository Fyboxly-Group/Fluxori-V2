import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../utils/test-app';
import User from '../../models/user.model';
import InventoryItem from '../../models/inventory.model';
import InventoryAlert from '../../models/inventory-alert.model';
import * as testUtils from '../utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import mongoose from 'mongoose';

describe('Inventory API Integration Tests', () => {
  let app: Express;
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;
  
  beforeAll(async () => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await InventoryItem.deleteMany({});
    await InventoryAlert.deleteMany({});
    
    // Create test users
    adminUser = await testUtils.createTestUser('admin-inventory@example.com', 'password123', 'admin');
    regularUser = await testUtils.createTestUser('user-inventory@example.com', 'password123', 'user');
    
    // Generate tokens
    adminToken = testUtils.generateAuthToken(adminUser._id.toString(), 'admin');
    userToken = testUtils.generateAuthToken(regularUser._id.toString(), 'user');
  });
  
  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });
  
  // Helper function to create a test inventory item
  const createTestInventoryItem = async (overrides = {}) => {
    const supplierId = new mongoose.Types.ObjectId();
    
    const defaultItem = {
      sku: `TEST-SKU-${Date.now()}`,
      name: 'Test Product',
      description: 'Test product description',
      category: 'Test Category',
      price: 99.99,
      costPrice: 49.99,
      stockQuantity: 100,
      reorderPoint: 10,
      reorderQuantity: 50,
      supplier: supplierId,
      location: 'Warehouse A',
      isActive: true,
      createdBy: adminUser._id,
    };
    
    const itemData = { ...defaultItem, ...overrides };
    const item = new InventoryItem(itemData);
    return await item.save();
  };
  
  describe('GET /api/inventory', () => {
    it('should return all inventory items with pagination', async () => {
      // Create test items
      await createTestInventoryItem({ name: 'Item A' });
      await createTestInventoryItem({ name: 'Item B' });
      await createTestInventoryItem({ name: 'Item C' });
      
      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.total).toBe(3);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
    });
    
    it('should filter inventory items by search term', async () => {
      await createTestInventoryItem({ name: 'Widget', sku: 'WDG-001' });
      await createTestInventoryItem({ name: 'Gadget', sku: 'GDG-001' });
      await createTestInventoryItem({ name: 'Another Widget', sku: 'WDG-002' });
      
      const response = await request(app)
        .get('/api/inventory?search=widget')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.map(item => item.name)).toContain('Widget');
      expect(response.body.data.map(item => item.name)).toContain('Another Widget');
    });
    
    it('should filter inventory items by category', async () => {
      await createTestInventoryItem({ category: 'Electronics' });
      await createTestInventoryItem({ category: 'Furniture' });
      await createTestInventoryItem({ category: 'Electronics' });
      
      const response = await request(app)
        .get('/api/inventory?category=Electronics')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.every(item => item.category === 'Electronics')).toBe(true);
    });
    
    it('should filter inventory items by low stock', async () => {
      await createTestInventoryItem({ 
        name: 'Low Stock Item', 
        stockQuantity: 5, 
        reorderPoint: 10
      });
      await createTestInventoryItem({
        name: 'Good Stock Item',
        stockQuantity: 50,
        reorderPoint: 10
      });
      
      const response = await request(app)
        .get('/api/inventory?lowStock=true')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].name).toBe('Low Stock Item');
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/inventory');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/inventory/:id', () => {
    it('should return a single inventory item by ID', async () => {
      const item = await createTestInventoryItem({ 
        name: 'Detailed Item', 
        sku: 'TEST-123' 
      });
      
      const response = await request(app)
        .get(`/api/inventory/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('Detailed Item');
      expect(response.body.data.sku).toBe('TEST-123');
    });
    
    it('should return 404 for non-existent inventory item', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/inventory/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Inventory item not found');
    });
  });
  
  describe('POST /api/inventory', () => {
    it('should create a new inventory item', async () => {
      const supplierId = new mongoose.Types.ObjectId();
      const newItem = {
        sku: 'TEST-NEW-001',
        name: 'New Test Item',
        description: 'Description of new test item',
        category: 'Test Category',
        price: 100,
        costPrice: 50,
        stockQuantity: 20,
        reorderPoint: 5,
        reorderQuantity: 10,
        supplier: supplierId.toString(),
        location: 'Warehouse A',
        isActive: true,
        tags: ['test', 'new'],
      };
      
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newItem);
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.sku).toBe(newItem.sku);
      expect(response.body.data.name).toBe(newItem.name);
      expect(response.body.data.price).toBe(newItem.price);
      expect(response.body.data.createdBy.toString()).toBe(adminUser._id.toString());
      
      // Verify item was saved to database
      const savedItem = await InventoryItem.findOne({ sku: newItem.sku });
      expect(savedItem).toBeDefined();
      expect(savedItem!.name).toBe(newItem.name);
    });
    
    it('should create a low stock alert when item is created with stock below reorder point', async () => {
      const supplierId = new mongoose.Types.ObjectId();
      const newItem = {
        sku: 'LOW-STOCK-001',
        name: 'Low Stock Item',
        description: 'Item with low initial stock',
        category: 'Test Category',
        price: 100,
        costPrice: 50,
        stockQuantity: 3, // Below reorder point
        reorderPoint: 5,
        reorderQuantity: 10,
        supplier: supplierId.toString(),
      };
      
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newItem);
        
      expect(response.status).toBe(201);
      
      // Verify alert was created
      const alerts = await InventoryAlert.find({ itemSku: 'LOW-STOCK-001' });
      expect(alerts.length).toBe(1);
      expect(alerts[0].alertType).toBe('low-stock');
      expect(alerts[0].status).toBe('active');
    });
    
    it('should return 400 for missing required fields', async () => {
      const incompleteItem = {
        name: 'Incomplete Item',
        description: 'Missing required fields',
      };
      
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteItem);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
    });
  });
  
  describe('PUT /api/inventory/:id', () => {
    it('should update an existing inventory item', async () => {
      const item = await createTestInventoryItem();
      
      const updates = {
        name: 'Updated Item Name',
        description: 'Updated description',
        price: 120,
      };
      
      const response = await request(app)
        .put(`/api/inventory/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.price).toBe(updates.price);
      
      // Verify item was updated in database
      const updatedItem = await InventoryItem.findById(item._id);
      expect(updatedItem!.name).toBe(updates.name);
    });
    
    it('should create an alert when stock falls below reorder point', async () => {
      // Create item with good stock level
      const item = await createTestInventoryItem({
        stockQuantity: 20,
        reorderPoint: 10,
      });
      
      // Update to reduce stock below reorder point
      const updates = {
        stockQuantity: 5,
      };
      
      const response = await request(app)
        .put(`/api/inventory/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      
      // Verify alert was created
      const alerts = await InventoryAlert.find({ item: item._id });
      expect(alerts.length).toBe(1);
      expect(alerts[0].alertType).toBe('low-stock');
    });
  });
  
  describe('DELETE /api/inventory/:id', () => {
    it('should delete an inventory item', async () => {
      const item = await createTestInventoryItem();
      
      const response = await request(app)
        .delete(`/api/inventory/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify item was deleted from database
      const deletedItem = await InventoryItem.findById(item._id);
      expect(deletedItem).toBeNull();
    });
    
    it('should delete associated alerts when deleting an item', async () => {
      // Create item
      const item = await createTestInventoryItem({
        stockQuantity: 0,
        reorderPoint: 10,
      });
      
      // Create an alert manually
      const alert = new InventoryAlert({
        item: item._id,
        itemName: item.name,
        itemSku: item.sku,
        alertType: 'out-of-stock',
        status: 'active',
        priority: 'high',
        description: `Item ${item.name} (${item.sku}) is out of stock.`,
        currentQuantity: 0,
        thresholdQuantity: 10,
        recommendedAction: `Order ${item.reorderQuantity} units from supplier.`,
        createdBy: adminUser._id,
      });
      
      await alert.save();
      
      // Verify alert was created 
      let alerts = await InventoryAlert.find({ item: item._id });
      expect(alerts.length).toBe(1);
      
      // Delete the item
      await request(app)
        .delete(`/api/inventory/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Verify alerts were deleted
      alerts = await InventoryAlert.find({ item: item._id });
      expect(alerts.length).toBe(0);
    });
  });
  
  describe('PUT /api/inventory/:id/stock', () => {
    it('should update inventory stock by setting a specific value', async () => {
      const item = await createTestInventoryItem({ 
        stockQuantity: 10,
        reorderPoint: 5, 
      });
      
      const stockUpdate = {
        quantity: 20,
        adjustmentType: 'set',
        reason: 'Inventory count adjustment',
      };
      
      const response = await request(app)
        .put(`/api/inventory/${item._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.previousQuantity).toBe(10);
      expect(response.body.data.newQuantity).toBe(20);
      
      // Verify item was updated in database
      const updatedItem = await InventoryItem.findById(item._id);
      expect(updatedItem!.stockQuantity).toBe(20);
    });
    
    it('should update inventory stock by adding to current value', async () => {
      const item = await createTestInventoryItem({ 
        stockQuantity: 10,
      });
      
      const stockUpdate = {
        quantity: 5,
        adjustmentType: 'add',
        reason: 'Received new shipment',
      };
      
      const response = await request(app)
        .put(`/api/inventory/${item._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate);
        
      expect(response.status).toBe(200);
      expect(response.body.data.previousQuantity).toBe(10);
      expect(response.body.data.newQuantity).toBe(15);
      
      // Verify item was updated in database
      const updatedItem = await InventoryItem.findById(item._id);
      expect(updatedItem!.stockQuantity).toBe(15);
    });
    
    it('should create an alert when stock falls below reorder point', async () => {
      const item = await createTestInventoryItem({
        stockQuantity: 20,
        reorderPoint: 10,
      });
      
      const stockUpdate = {
        quantity: 15,
        adjustmentType: 'subtract',
        reason: 'Sales order',
      };
      
      const response = await request(app)
        .put(`/api/inventory/${item._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate);
        
      expect(response.status).toBe(200);
      
      // Verify alert was created
      const alerts = await InventoryAlert.find({ item: item._id });
      expect(alerts.length).toBe(1);
      expect(alerts[0].alertType).toBe('low-stock');
    });
  });
  
  describe('GET /api/inventory/stats', () => {
    it('should return inventory statistics', async () => {
      // Create items with various properties
      await createTestInventoryItem({ 
        category: 'Electronics',
        stockQuantity: 20,
        costPrice: 50,
        price: 100,
        isActive: true,
      });
      
      await createTestInventoryItem({ 
        category: 'Electronics',
        stockQuantity: 5,
        reorderPoint: 10,  // Low stock
        costPrice: 30,
        price: 60,
        isActive: true,
      });
      
      await createTestInventoryItem({ 
        category: 'Furniture',
        stockQuantity: 0,  // Out of stock
        costPrice: 200,
        price: 400,
        isActive: true,
      });
      
      const response = await request(app)
        .get('/api/inventory/stats')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // Total counts
      expect(response.body.data.totalItems).toBe(3);
      expect(response.body.data.activeItems).toBe(3);
      expect(response.body.data.lowStockItems).toBe(1);
      expect(response.body.data.outOfStockItems).toBe(1);
      
      // Inventory value
      expect(response.body.data.inventoryValue).toBeDefined();
      
      // Calculate expected values
      const expectedCost = 20*50 + 5*30 + 0*200; // 1150
      const expectedRetail = 20*100 + 5*60 + 0*400; // 2300
      
      expect(response.body.data.inventoryValue.cost).toBe(expectedCost);
      expect(response.body.data.inventoryValue.retail).toBe(expectedRetail);
      
      // Category breakdown
      expect(response.body.data.categoryBreakdown).toBeDefined();
      expect(Object.keys(response.body.data.categoryBreakdown).length).toBe(2);
      expect(response.body.data.categoryBreakdown.Electronics).toBe(2);
      expect(response.body.data.categoryBreakdown.Furniture).toBe(1);
    });
  });
  
  describe('GET /api/inventory/low-stock', () => {
    it('should return all low stock items', async () => {
      // Create items with various stock levels
      await createTestInventoryItem({ 
        name: 'Good Stock Item',
        stockQuantity: 20,
        reorderPoint: 10,
      });
      
      await createTestInventoryItem({ 
        name: 'Low Stock Item 1',
        stockQuantity: 5,
        reorderPoint: 10,
      });
      
      await createTestInventoryItem({ 
        name: 'Out of Stock Item',
        stockQuantity: 0,
        reorderPoint: 10,
      });
      
      const response = await request(app)
        .get('/api/inventory/low-stock')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.length).toBe(2);
      
      // Should contain low stock and out of stock items
      const names = response.body.data.map(item => item.name);
      expect(names).toContain('Low Stock Item 1');
      expect(names).toContain('Out of Stock Item');
      
      // Verify sorting order (lowest stock first)
      const sortedItems = [...response.body.data].sort((a, b) => a.stockQuantity - b.stockQuantity);
      expect(response.body.data).toEqual(sortedItems);
    });
  });
});