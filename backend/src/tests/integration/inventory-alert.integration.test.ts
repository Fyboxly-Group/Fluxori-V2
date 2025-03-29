import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../utils/test-app';
import User from '../../models/user.model';
import InventoryItem from '../../models/inventory.model';
import InventoryAlert from '../../models/inventory-alert.model';
import * as testUtils from '../utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import mongoose from 'mongoose';

describe('Inventory Alert API Integration Tests', () => {
  let app: Express;
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;
  let testItem: any;
  
  beforeAll(async () => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await InventoryItem.deleteMany({});
    await InventoryAlert.deleteMany({});
    
    // Create test users
    adminUser = await testUtils.createTestUser('admin-alert@example.com', 'password123', 'admin');
    regularUser = await testUtils.createTestUser('user-alert@example.com', 'password123', 'user');
    
    // Generate tokens
    adminToken = testUtils.generateAuthToken(adminUser._id.toString(), 'admin');
    userToken = testUtils.generateAuthToken(regularUser._id.toString(), 'user');
    
    // Create a test inventory item
    testItem = await createTestInventoryItem(adminUser._id.toString());
  });
  
  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });
  
  // Helper function to create a test inventory item
  const createTestInventoryItem = async (userId: string, overrides = {}) => {
    const defaultItem = {
      sku: `TEST-${Date.now()}`,
      name: 'Test Product',
      description: 'Test product description',
      category: 'Test Category',
      price: 99.99,
      costPrice: 49.99,
      stockQuantity: 100,
      reorderPoint: 10,
      reorderQuantity: 50,
      supplier: new mongoose.Types.ObjectId(),
      location: 'Warehouse A',
      isActive: true,
      createdBy: userId,
    };
    
    const itemData = { ...defaultItem, ...overrides };
    const item = new InventoryItem(itemData);
    return await item.save();
  };
  
  // Helper function to create a test inventory alert
  const createTestAlert = async (userId: string, itemId: string, itemName: string, itemSku: string, overrides = {}) => {
    const defaultAlert = {
      item: itemId,
      itemName: itemName,
      itemSku: itemSku,
      alertType: 'low-stock',
      status: 'active',
      priority: 'medium',
      description: 'Stock is below reorder point',
      currentQuantity: 5,
      thresholdQuantity: 10,
      recommendedAction: 'Place purchase order',
      createdBy: userId,
    };
    
    const alertData = { ...defaultAlert, ...overrides };
    const alert = new InventoryAlert(alertData);
    return await alert.save();
  };
  
  describe('GET /api/inventory-alerts', () => {
    it('should return all inventory alerts', async () => {
      // Create multiple alerts
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'low-stock', priority: 'high'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'out-of-stock', priority: 'critical'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'expiring', priority: 'medium', status: 'resolved'
      });
      
      const response = await request(app)
        .get('/api/inventory-alerts')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2); // Only active alerts by default
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toBeDefined();
    });
    
    it('should filter alerts by status', async () => {
      // Create alerts with different statuses
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        status: 'active'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        status: 'resolved'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        status: 'dismissed'
      });
      
      // Test filtering by resolved status
      const response = await request(app)
        .get('/api/inventory-alerts?status=resolved')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('resolved');
    });
    
    it('should filter alerts by alert type', async () => {
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'low-stock'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'out-of-stock'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'expiring'
      });
      
      const response = await request(app)
        .get('/api/inventory-alerts?alertType=expiring')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].alertType).toBe('expiring');
    });
    
    it('should filter alerts by priority', async () => {
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        priority: 'low'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        priority: 'high'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        priority: 'critical'
      });
      
      const response = await request(app)
        .get('/api/inventory-alerts?priority=critical')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].priority).toBe('critical');
    });
    
    it('should filter alerts by assignee', async () => {
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        assignedTo: adminUser._id
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        assignedTo: regularUser._id
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku);
      
      // Test filtering by specific user
      const response1 = await request(app)
        .get(`/api/inventory-alerts?assignedTo=${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response1.status).toBe(200);
      expect(response1.body.data.length).toBe(1);
      expect(response1.body.data[0].assignedTo._id.toString()).toBe(regularUser._id.toString());
      
      // Test filtering by "unassigned"
      const response2 = await request(app)
        .get('/api/inventory-alerts?assignedTo=unassigned')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response2.status).toBe(200);
      expect(response2.body.data.length).toBe(1);
      expect(response2.body.data[0].assignedTo).toBeUndefined();
      
      // Test filtering by "me"
      const response3 = await request(app)
        .get('/api/inventory-alerts?assignedTo=me')
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response3.status).toBe(200);
      expect(response3.body.data.length).toBe(1);
      expect(response3.body.data[0].assignedTo._id.toString()).toBe(regularUser._id.toString());
    });
    
    it('should paginate results correctly', async () => {
      // Create 15 alerts
      for (let i = 1; i <= 15; i++) {
        await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
          description: `Paginated Alert ${i}`
        });
      }
      
      // Get first page with 5 items
      const response = await request(app)
        .get('/api/inventory-alerts?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
      expect(response.body.total).toBe(15);
      
      // Get second page
      const response2 = await request(app)
        .get('/api/inventory-alerts?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response2.status).toBe(200);
      expect(response2.body.data.length).toBe(5);
      expect(response2.body.pagination.page).toBe(2);
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/inventory-alerts');
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/inventory-alerts/:id', () => {
    it('should return a specific alert by ID', async () => {
      const alert = await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'low-stock',
        priority: 'high',
        description: 'Critical low stock situation'
      });
      
      const response = await request(app)
        .get(`/api/inventory-alerts/${alert._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.description).toBe('Critical low stock situation');
      expect(response.body.data.alertType).toBe('low-stock');
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.item).toBeDefined();
      expect(response.body.data.item._id.toString()).toBe(testItem._id.toString());
    });
    
    it('should return 404 for non-existent alert', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/inventory-alerts/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Alert not found');
    });
    
    it('should return 400 for invalid alert ID', async () => {
      const response = await request(app)
        .get('/api/inventory-alerts/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid alert ID');
    });
  });
  
  describe('POST /api/inventory-alerts', () => {
    it('should create a new inventory alert', async () => {
      const newAlert = {
        item: testItem._id.toString(),
        itemName: testItem.name,
        itemSku: testItem.sku,
        alertType: 'expiring',
        priority: 'high',
        description: 'Item expires soon',
        currentQuantity: 15,
        thresholdQuantity: 10,
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        recommendedAction: 'Discount or use in production soon',
      };
      
      const response = await request(app)
        .post('/api/inventory-alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAlert);
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.alertType).toBe(newAlert.alertType);
      expect(response.body.data.priority).toBe(newAlert.priority);
      expect(response.body.data.description).toBe(newAlert.description);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.createdBy.toString()).toBe(adminUser._id.toString());
      
      // Verify alert was created in database
      const createdAlert = await InventoryAlert.findById(response.body.data._id);
      expect(createdAlert).toBeDefined();
      expect(createdAlert!.alertType).toBe(newAlert.alertType);
    });
    
    it('should validate required fields when creating an alert', async () => {
      const incompleteAlert = {
        // Missing item, itemName, itemSku, alertType, description
        priority: 'high',
        currentQuantity: 5,
      };
      
      const response = await request(app)
        .post('/api/inventory-alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteAlert);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
    });
  });
  
  describe('PUT /api/inventory-alerts/:id', () => {
    it('should update an existing alert', async () => {
      const alert = await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku);
      
      const updates = {
        priority: 'high',
        description: 'Updated description',
        recommendedAction: 'Urgent: Place purchase order immediately',
      };
      
      const response = await request(app)
        .put(`/api/inventory-alerts/${alert._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe(updates.priority);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.recommendedAction).toBe(updates.recommendedAction);
      
      // Verify alert was updated in database
      const updatedAlert = await InventoryAlert.findById(alert._id);
      expect(updatedAlert!.priority).toBe(updates.priority);
    });
    
    it('should set resolvedBy and resolvedAt when status changes to resolved', async () => {
      const alert = await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        status: 'active'
      });
      
      const updates = {
        status: 'resolved',
        resolutionNotes: 'Stock replenished with new order',
      };
      
      const response = await request(app)
        .put(`/api/inventory-alerts/${alert._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('resolved');
      expect(response.body.data.resolutionNotes).toBe(updates.resolutionNotes);
      expect(response.body.data.resolvedBy.toString()).toBe(adminUser._id.toString());
      expect(response.body.data.resolvedAt).toBeDefined();
      
      // Verify alert was updated in database
      const updatedAlert = await InventoryAlert.findById(alert._id);
      expect(updatedAlert!.status).toBe('resolved');
      expect(updatedAlert!.resolvedBy!.toString()).toBe(adminUser._id.toString());
    });
    
    it('should return 404 for non-existent alert', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/inventory-alerts/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ priority: 'high' });
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Alert not found');
    });
  });
  
  describe('DELETE /api/inventory-alerts/:id', () => {
    it('should delete an alert', async () => {
      const alert = await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku);
      
      const response = await request(app)
        .delete(`/api/inventory-alerts/${alert._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Alert deleted successfully');
      
      // Verify alert was deleted from database
      const deletedAlert = await InventoryAlert.findById(alert._id);
      expect(deletedAlert).toBeNull();
    });
    
    it('should return 404 for non-existent alert', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/inventory-alerts/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Alert not found');
    });
  });
  
  describe('PUT /api/inventory-alerts/:id/assign', () => {
    it('should assign an alert to a user', async () => {
      const alert = await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku);
      
      const response = await request(app)
        .put(`/api/inventory-alerts/${alert._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: regularUser._id.toString() });
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedTo.toString()).toBe(regularUser._id.toString());
      
      // Verify alert was updated in database
      const updatedAlert = await InventoryAlert.findById(alert._id);
      expect(updatedAlert!.assignedTo!.toString()).toBe(regularUser._id.toString());
    });
    
    it('should validate user ID parameter', async () => {
      const alert = await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku);
      
      // Missing userId
      const response1 = await request(app)
        .put(`/api/inventory-alerts/${alert._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
        
      expect(response1.status).toBe(400);
      expect(response1.body.message).toBe('User ID is required');
      
      // Invalid userId format
      const response2 = await request(app)
        .put(`/api/inventory-alerts/${alert._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: 'invalid-id' });
        
      expect(response2.status).toBe(400);
      expect(response2.body.message).toBe('Invalid user ID');
    });
  });
  
  describe('PUT /api/inventory-alerts/:id/resolve', () => {
    it('should resolve an alert', async () => {
      const alert = await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku);
      
      const resolutionData = {
        resolutionNotes: 'Ordered new stock',
        purchaseOrderCreated: true,
        purchaseOrder: new mongoose.Types.ObjectId().toString(),
      };
      
      const response = await request(app)
        .put(`/api/inventory-alerts/${alert._id}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(resolutionData);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('resolved');
      expect(response.body.data.resolutionNotes).toBe(resolutionData.resolutionNotes);
      expect(response.body.data.purchaseOrderCreated).toBe(resolutionData.purchaseOrderCreated);
      expect(response.body.data.purchaseOrder.toString()).toBe(resolutionData.purchaseOrder);
      expect(response.body.data.resolvedBy.toString()).toBe(adminUser._id.toString());
      expect(response.body.data.resolvedAt).toBeDefined();
      
      // Verify alert was updated in database
      const updatedAlert = await InventoryAlert.findById(alert._id);
      expect(updatedAlert!.status).toBe('resolved');
      expect(updatedAlert!.resolvedBy!.toString()).toBe(adminUser._id.toString());
    });
    
    it('should resolve an alert with minimal information', async () => {
      const alert = await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku);
      
      // Only provide the bare minimum
      const response = await request(app)
        .put(`/api/inventory-alerts/${alert._id}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('resolved');
      expect(response.body.data.resolvedBy.toString()).toBe(adminUser._id.toString());
      expect(response.body.data.resolvedAt).toBeDefined();
    });
  });
  
  describe('GET /api/inventory-alerts/stats', () => {
    it('should return alert statistics', async () => {
      // Create alerts with different types, statuses, and priorities
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'low-stock', status: 'active', priority: 'high'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'low-stock', status: 'active', priority: 'medium'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'out-of-stock', status: 'active', priority: 'critical'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'expiring', status: 'resolved', priority: 'low'
      });
      await createTestAlert(adminUser._id.toString(), testItem._id.toString(), testItem.name, testItem.sku, {
        alertType: 'custom', status: 'resolved', priority: 'medium'
      });
      
      const response = await request(app)
        .get('/api/inventory-alerts/stats')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // Check alert counts
      expect(response.body.data.totalAlerts).toBe(5);
      expect(response.body.data.activeAlerts).toBe(3);
      expect(response.body.data.resolvedAlerts).toBe(2);
      
      // Check alert type breakdown
      expect(response.body.data.alertsByType['low-stock']).toBe(2);
      expect(response.body.data.alertsByType['out-of-stock']).toBe(1);
      expect(response.body.data.alertsByType['expiring']).toBe(1);
      expect(response.body.data.alertsByType['custom']).toBe(1);
      
      // Check alert priority breakdown (only active alerts)
      expect(response.body.data.alertsByPriority['high']).toBe(1);
      expect(response.body.data.alertsByPriority['medium']).toBe(1);
      expect(response.body.data.alertsByPriority['critical']).toBe(1);
      expect(response.body.data.alertsByPriority['low']).toBeUndefined(); // No active low priority alerts
    });
    
    it('should return empty statistics when no alerts exist', async () => {
      const response = await request(app)
        .get('/api/inventory-alerts/stats')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      expect(response.body.data.totalAlerts).toBe(0);
      expect(response.body.data.activeAlerts).toBe(0);
      expect(response.body.data.resolvedAlerts).toBe(0);
      expect(response.body.data.alertsByType).toEqual({});
      expect(response.body.data.alertsByPriority).toEqual({});
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/inventory-alerts/stats');
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});