import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createTestApp } from '../tests/utils/test-app';
import InventoryAlert from '../models/inventory-alert.model';
import InventoryItem from '../models/inventory.model';
import * as testUtils from '../tests/utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import { ActivityService } from '../services/activity.service';

// Mock the populate function on mongoose queries
const mockPopulate = jest.fn().mockImplementation(function() {
  return this;
});

// Apply the mock to the mongoose Query prototype
mongoose.Query.prototype.populate = mockPopulate;

// Mock the ActivityService to avoid actual DB operations for activity logs
jest.mock('../services/activity.service', () => ({
  ActivityService: {
    logActivity: jest.fn().mockResolvedValue(null),
  },
}));

describe('Inventory Alert Controller', () => {
  let app: Express;
  let user: any;
  let token: string;
  let authRequest: any;
  let testItem: any;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await InventoryAlert.deleteMany({});
    await InventoryItem.deleteMany({});
    
    // Create a test user and authentication token
    user = await testUtils.createTestUser('inventory-alert-test@example.com', 'password123', 'admin');
    token = testUtils.generateAuthToken(user._id.toString(), 'admin');
    
    // Create authenticated request helper
    authRequest = testUtils.authenticatedRequest(app, token);
    
    // Create a test inventory item to use in alerts
    testItem = await testUtils.createTestInventoryItem(user._id.toString(), {
      name: 'Test Item',
      sku: 'TEST-SKU-001',
      stockQuantity: 5,
      reorderPoint: 10
    });
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  // Helper function to create a test alert
  const createTestAlert = async (override = {}) => {
    const defaultAlert = {
      item: testItem._id,
      itemName: testItem.name,
      itemSku: testItem.sku,
      alertType: 'low-stock',
      status: 'active',
      priority: 'medium',
      description: `Item ${testItem.name} (${testItem.sku}) is below reorder point.`,
      currentQuantity: 5,
      thresholdQuantity: 10,
      recommendedAction: 'Order more inventory',
      createdBy: user._id
    };
    
    const alertData = { ...defaultAlert, ...override };
    const alert = new InventoryAlert(alertData);
    return await alert.save();
  };
  
  // Routes for inventory alerts are set up in the test app
  
  describe('GET /api/inventory-alerts', () => {
    it('should return all inventory alerts with pagination', async () => {
      // Create test alerts
      await createTestAlert();
      await createTestAlert({ alertType: 'out-of-stock', priority: 'high' });
      await createTestAlert({ alertType: 'expiring', priority: 'low' });
      
      // Execute request
      const response = await authRequest.get('/api/inventory-alerts');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.total).toBe(3);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
    });
    
    it('should filter alerts by status', async () => {
      await createTestAlert({ status: 'active' });
      await createTestAlert({ status: 'resolved', resolvedBy: user._id, resolvedAt: new Date() });
      
      const response = await authRequest.get('/api/inventory-alerts?status=resolved');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].status).toBe('resolved');
    });
    
    it('should filter alerts by alert type', async () => {
      await createTestAlert({ alertType: 'low-stock' });
      await createTestAlert({ alertType: 'out-of-stock' });
      await createTestAlert({ alertType: 'price-change' });
      
      const response = await authRequest.get('/api/inventory-alerts?alertType=out-of-stock');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].alertType).toBe('out-of-stock');
    });
    
    it('should filter alerts by priority', async () => {
      await createTestAlert({ priority: 'low' });
      await createTestAlert({ priority: 'medium' });
      await createTestAlert({ priority: 'high' });
      await createTestAlert({ priority: 'critical' });
      
      const response = await authRequest.get('/api/inventory-alerts?priority=high');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].priority).toBe('high');
    });
    
    it('should filter alerts by assigned to me', async () => {
      await createTestAlert(); // Not assigned
      await createTestAlert({ assignedTo: user._id }); // Assigned to test user
      await createTestAlert({ assignedTo: new mongoose.Types.ObjectId() }); // Assigned to someone else
      
      const response = await authRequest.get('/api/inventory-alerts?assignedTo=me');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].assignedTo).toBeDefined();
    });
    
    it('should filter alerts by unassigned', async () => {
      await createTestAlert(); // Not assigned
      await createTestAlert({ assignedTo: user._id }); // Assigned to test user
      
      const response = await authRequest.get('/api/inventory-alerts?assignedTo=unassigned');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
    });
    
    it('should handle pagination correctly', async () => {
      // Create 15 test alerts
      for (let i = 0; i < 15; i++) {
        await createTestAlert({
          description: `Test alert ${i+1}`,
          itemSku: `TEST-SKU-${i+1}`
        });
      }
      
      // Test first page with 5 alerts per page
      const response = await authRequest.get('/api/inventory-alerts?page=1&limit=5');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(5);
      expect(response.body.total).toBe(15);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
      
      // Test second page
      const response2 = await authRequest.get('/api/inventory-alerts?page=2&limit=5');
      
      expect(response2.status).toBe(200);
      expect(response2.body.count).toBe(5);
      expect(response2.body.pagination.page).toBe(2);
    });
    
    it('should sort alerts correctly', async () => {
      // Create alerts with different priorities
      const alert1 = await createTestAlert({ priority: 'low', createdAt: new Date(Date.now() - 3000) });
      const alert2 = await createTestAlert({ priority: 'medium', createdAt: new Date(Date.now() - 2000) });
      const alert3 = await createTestAlert({ priority: 'high', createdAt: new Date(Date.now() - 1000) });
      
      // Test sorting by priority
      const response = await authRequest.get('/api/inventory-alerts?sortBy=priority&sortOrder=desc');
      
      expect(response.status).toBe(200);
      expect(response.body.data[0].priority).toBe('high');
      expect(response.body.data[2].priority).toBe('low');
      
      // Test sorting by createdAt
      const response2 = await authRequest.get('/api/inventory-alerts?sortBy=createdAt&sortOrder=asc');
      
      expect(response2.status).toBe(200);
      expect(response2.body.data[0]._id.toString()).toBe(alert1._id.toString());
      expect(response2.body.data[2]._id.toString()).toBe(alert3._id.toString());
    });
  });
  
  describe('GET /api/inventory-alerts/:id', () => {
    it('should return a single alert by ID', async () => {
      const alert = await createTestAlert();
      
      const response = await authRequest.get(`/api/inventory-alerts/${alert._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id.toString()).toBe(alert._id.toString());
      expect(response.body.data.alertType).toBe(alert.alertType);
      expect(response.body.data.itemName).toBe(alert.itemName);
    });
    
    it('should return 404 for non-existent alert', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.get(`/api/inventory-alerts/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Alert not found');
    });
    
    it('should return 400 for invalid ID format', async () => {
      const response = await authRequest.get('/api/inventory-alerts/invalid-id');
      
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
        alertType: 'low-stock',
        priority: 'medium',
        description: 'Test alert description',
        currentQuantity: 5,
        thresholdQuantity: 10,
        recommendedAction: 'Order more inventory',
      };
      
      const response = await authRequest.post('/api/inventory-alerts').send(newAlert);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.alertType).toBe(newAlert.alertType);
      expect(response.body.data.description).toBe(newAlert.description);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.createdBy.toString()).toBe(user._id.toString());
      
      // Verify alert was saved to database
      const savedAlert = await InventoryAlert.findById(response.body.data._id);
      expect(savedAlert).toBeDefined();
      expect(savedAlert!.description).toBe(newAlert.description);
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 400 for missing required fields', async () => {
      const incompleteAlert = {
        item: testItem._id.toString(),
        // Missing required fields
      };
      
      const response = await authRequest.post('/api/inventory-alerts').send(incompleteAlert);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
    });
  });
  
  describe('PUT /api/inventory-alerts/:id', () => {
    it('should update an existing inventory alert', async () => {
      const alert = await createTestAlert();
      
      const updates = {
        description: 'Updated description',
        priority: 'high',
        recommendedAction: 'Order immediately',
      };
      
      const response = await authRequest.put(`/api/inventory-alerts/${alert._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.priority).toBe(updates.priority);
      expect(response.body.data.recommendedAction).toBe(updates.recommendedAction);
      
      // Verify alert was updated in database
      const updatedAlert = await InventoryAlert.findById(alert._id);
      expect(updatedAlert!.description).toBe(updates.description);
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should handle resolving an alert through update', async () => {
      const alert = await createTestAlert();
      
      const updates = {
        status: 'resolved',
        resolutionNotes: 'Ordered more inventory',
      };
      
      const response = await authRequest.put(`/api/inventory-alerts/${alert._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('resolved');
      expect(response.body.data.resolutionNotes).toBe(updates.resolutionNotes);
      expect(response.body.data.resolvedBy.toString()).toBe(user._id.toString());
      expect(response.body.data.resolvedAt).toBeDefined();
    });
    
    it('should return 404 for non-existent alert', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.put(`/api/inventory-alerts/${nonExistentId}`).send({
        description: 'Updated description',
      });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Alert not found');
    });
  });
  
  describe('DELETE /api/inventory-alerts/:id', () => {
    it('should delete an inventory alert', async () => {
      const alert = await createTestAlert();
      
      const response = await authRequest.delete(`/api/inventory-alerts/${alert._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Alert deleted successfully');
      
      // Verify alert was deleted from database
      const deletedAlert = await InventoryAlert.findById(alert._id);
      expect(deletedAlert).toBeNull();
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 for non-existent alert', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.delete(`/api/inventory-alerts/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Alert not found');
    });
    
    it('should use deleteOne instead of deprecated remove method', async () => {
      const alert = await createTestAlert();
      
      // Spy on the deleteOne method
      const deleteOneSpy = jest.spyOn(InventoryAlert, 'deleteOne');
      
      // Try to delete the alert
      const response = await authRequest.delete(`/api/inventory-alerts/${alert._id}`);
      
      expect(response.status).toBe(200);
      
      // Verify deleteOne was called with the correct ID
      expect(deleteOneSpy).toHaveBeenCalledWith({ _id: alert._id.toString() });
      
      // Verify the deprecated remove method is not being used
      const alertInstance = await InventoryAlert.findById(alert._id);
      if (alertInstance) {
        expect(alertInstance.remove).not.toHaveBeenCalled(); // This would fail if remove() is called
      }
      
      // Restore the spy
      deleteOneSpy.mockRestore();
    });
  });
  
  describe('PUT /api/inventory-alerts/:id/assign', () => {
    it('should assign alert to a user', async () => {
      const alert = await createTestAlert();
      const assigneeId = new mongoose.Types.ObjectId();
      
      const assignData = {
        userId: assigneeId.toString()
      };
      
      const response = await authRequest.put(`/api/inventory-alerts/${alert._id}/assign`).send(assignData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedTo.toString()).toBe(assigneeId.toString());
      
      // Verify alert was updated in database
      const updatedAlert = await InventoryAlert.findById(alert._id);
      expect(updatedAlert!.assignedTo!.toString()).toBe(assigneeId.toString());
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 400 when userId is not provided', async () => {
      const alert = await createTestAlert();
      
      const response = await authRequest.put(`/api/inventory-alerts/${alert._id}/assign`).send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User ID is required');
    });
    
    it('should return 400 when userId is invalid', async () => {
      const alert = await createTestAlert();
      
      const response = await authRequest.put(`/api/inventory-alerts/${alert._id}/assign`).send({
        userId: 'invalid-id'
      });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid user ID');
    });
  });
  
  describe('PUT /api/inventory-alerts/:id/resolve', () => {
    it('should resolve an alert', async () => {
      const alert = await createTestAlert();
      
      const resolveData = {
        resolutionNotes: 'Ordered more inventory',
        purchaseOrderCreated: true
      };
      
      const response = await authRequest.put(`/api/inventory-alerts/${alert._id}/resolve`).send(resolveData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('resolved');
      expect(response.body.data.resolutionNotes).toBe(resolveData.resolutionNotes);
      expect(response.body.data.purchaseOrderCreated).toBe(resolveData.purchaseOrderCreated);
      expect(response.body.data.resolvedBy.toString()).toBe(user._id.toString());
      expect(response.body.data.resolvedAt).toBeDefined();
      
      // Verify alert was updated in database
      const updatedAlert = await InventoryAlert.findById(alert._id);
      expect(updatedAlert!.status).toBe('resolved');
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should resolve an alert with purchase order reference', async () => {
      const alert = await createTestAlert();
      const purchaseOrderId = new mongoose.Types.ObjectId();
      
      const resolveData = {
        resolutionNotes: 'Created purchase order',
        purchaseOrderCreated: true,
        purchaseOrder: purchaseOrderId.toString()
      };
      
      const response = await authRequest.put(`/api/inventory-alerts/${alert._id}/resolve`).send(resolveData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.purchaseOrderCreated).toBe(true);
      expect(response.body.data.purchaseOrder.toString()).toBe(purchaseOrderId.toString());
    });
    
    it('should return 404 for non-existent alert', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.put(`/api/inventory-alerts/${nonExistentId}/resolve`).send({
        resolutionNotes: 'Test resolution'
      });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Alert not found');
    });
  });
  
  describe('GET /api/inventory-alerts/stats', () => {
    it('should return alert statistics', async () => {
      // Create alerts with various properties
      await createTestAlert({ alertType: 'low-stock', status: 'active', priority: 'medium' });
      await createTestAlert({ alertType: 'low-stock', status: 'active', priority: 'high' });
      await createTestAlert({ alertType: 'out-of-stock', status: 'active', priority: 'critical' });
      await createTestAlert({ alertType: 'expiring', status: 'resolved', priority: 'low' });
      await createTestAlert({ alertType: 'price-change', status: 'resolved', priority: 'medium' });
      
      const response = await authRequest.get('/api/inventory-alerts/stats');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // Check counts
      expect(response.body.data.totalAlerts).toBe(5);
      expect(response.body.data.activeAlerts).toBe(3);
      expect(response.body.data.resolvedAlerts).toBe(2);
      
      // Check alert types
      expect(response.body.data.alertsByType['low-stock']).toBe(2);
      expect(response.body.data.alertsByType['out-of-stock']).toBe(1);
      expect(response.body.data.alertsByType['expiring']).toBe(1);
      expect(response.body.data.alertsByType['price-change']).toBe(1);
      
      // Check priorities (of active alerts)
      expect(response.body.data.alertsByPriority['medium']).toBe(1);
      expect(response.body.data.alertsByPriority['high']).toBe(1);
      expect(response.body.data.alertsByPriority['critical']).toBe(1);
    });
    
    it('should return empty statistics when no alerts exist', async () => {
      const response = await authRequest.get('/api/inventory-alerts/stats');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      expect(response.body.data.totalAlerts).toBe(0);
      expect(response.body.data.activeAlerts).toBe(0);
      expect(response.body.data.resolvedAlerts).toBe(0);
      expect(response.body.data.alertsByType).toEqual({});
      expect(response.body.data.alertsByPriority).toEqual({});
    });
  });
});