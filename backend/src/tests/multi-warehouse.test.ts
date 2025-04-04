/**
 * Multi-Warehouse Inventory Management System Test
 * 
 * This test suite verifies the functionality of the multi-warehouse
 * inventory management system by testing all major API endpoints.
 */

import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import Warehouse from '../models/warehouse.model';
import InventoryItem from '../models/inventory.model';
import InventoryStock from '../models/inventory-stock.model';
import Supplier from '../models/supplier.model';
import { createJwtToken } from '../utils/auth';

let mongoServer: MongoMemoryServer;

// Test user data
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  id: new mongoose.Types.ObjectId().toString(),
  email: 'test@example.com',
  role: 'admin',
  organizationId: 'test-org',
};

// Test objects
let warehouseIds: string[] = [];
let inventoryItemIds: string[] = [];
let supplierId: string;
let testToken: string;

beforeAll(async() => {
  // Set up MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Create test token
  testToken = createJwtToken({
    userId: testUser.id,
    role: testUser.role,
  });
  
  // Seed test data
  await seedTestData();
});

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Seed test data for the tests
async function seedTestData() {
  // Create test supplier
  const supplier = await Supplier.create({
    name: 'Test Supplier',
    contactPerson: 'Test Contact',
    email: 'supplier@example.com',
    phone: '555-123-4567',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'Test Country',
    },
    isActive: true,
    categories: ['Test'],
    createdBy: testUser._id,
  });
  supplierId = supplier._id.toString();
  
  // Create test inventory items
  const items = await InventoryItem.create([
    {
      sku: 'TEST-001',
      name: 'Test Item 1',
      description: 'Test Description 1',
      category: 'Test Category',
      price: 100,
      costPrice: 50,
      stockQuantity: 0, // Will be updated from warehouse stock
      reorderPoint: 10,
      reorderQuantity: 20,
      supplier: supplier._id,
      isActive: true,
      createdBy: testUser._id,
    },
    {
      sku: 'TEST-002',
      name: 'Test Item 2',
      description: 'Test Description 2',
      category: 'Test Category',
      price: 200,
      costPrice: 100,
      stockQuantity: 0, // Will be updated from warehouse stock
      reorderPoint: 15,
      reorderQuantity: 30,
      supplier: supplier._id,
      isActive: true,
      createdBy: testUser._id,
    },
  ]);
  
  inventoryItemIds = items.map(item => item._id.toString());
}

// Warehouse Tests
describe('Warehouse Management', () => {
  test('Should create a warehouse', async() => {
    const response = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Test Warehouse',
        code: 'TEST',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'Test Country',
        },
        isActive: true,
        isDefault: true,
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBeDefined();
    expect(response.body.data.name).toBe('Test Warehouse');
    expect(response.body.data.isDefault).toBe(true);
    
    warehouseIds.push(response.body.data._id);
  });
  
  test('Should create a second warehouse', async() => {
    const response = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Second Warehouse',
        code: 'SEC',
        address: {
          street: '456 Test Ave',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'Test Country',
        },
        isActive: true,
        isDefault: false,
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    
    warehouseIds.push(response.body.data._id);
  });
  
  test('Should get all warehouses', async() => {
    const response = await request(app)
      .get('/api/warehouses')
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(2);
    expect(response.body.data.length).toBe(2);
  });
  
  test('Should get a warehouse by ID', async() => {
    const response = await request(app)
      .get(`/api/warehouses/${warehouseIds[0]}`)
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(warehouseIds[0]);
  });
  
  test('Should update a warehouse', async() => {
    const response = await request(app)
      .put(`/api/warehouses/${warehouseIds[0]}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Updated Warehouse Name',
        contactPerson: 'New Contact',
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Updated Warehouse Name');
    expect(response.body.data.contactPerson).toBe('New Contact');
  });
});

// Inventory Stock Tests
describe('Inventory Stock Management', () => {
  test('Should update inventory stock in a warehouse', async() => {
    const response = await request(app)
      .put(`/api/inventory/${inventoryItemIds[0]}/stock/${warehouseIds[0]}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        quantityOnHand: 50,
        quantityAllocated: 5,
        reorderPoint: 10,
        reorderQuantity: 20,
        binLocation: 'A1-B2',
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.quantityOnHand).toBe(50);
    expect(response.body.data.quantityAllocated).toBe(5);
    expect(response.body.data.availableQuantity).toBe(45);
  });
  
  test('Should update inventory stock in another warehouse', async() => {
    const response = await request(app)
      .put(`/api/inventory/${inventoryItemIds[0]}/stock/${warehouseIds[1]}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        quantityOnHand: 30,
        quantityAllocated: 0,
        reorderPoint: 15,
        reorderQuantity: 25,
        binLocation: 'C3-D4',
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.quantityOnHand).toBe(30);
  });
  
  test('Should update second item stock', async() => {
    const response = await request(app)
      .put(`/api/inventory/${inventoryItemIds[1]}/stock/${warehouseIds[0]}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        quantityOnHand: 5,
        quantityAllocated: 0,
        reorderPoint: 15,
        reorderQuantity: 30,
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.quantityOnHand).toBe(5);
    // This should be below reorder point and trigger an alert
  });
  
  test('Should get inventory stock by item ID', async() => {
    const response = await request(app)
      .get(`/api/inventory/${inventoryItemIds[0]}/stock`)
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalQuantity).toBe(80); // 50 + 30
    expect(response.body.data.stockLevels.length).toBe(2);
  });
  
  test('Should transfer inventory between warehouses', async() => {
    const response = await request(app)
      .post(`/api/inventory/${inventoryItemIds[0]}/transfer`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        sourceWarehouseId: warehouseIds[0],
        destinationWarehouseId: warehouseIds[1],
        quantity: 10,
        notes: 'Test transfer',
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.sourceWarehouse.newQuantity).toBe(40); // 50 - 10
    expect(response.body.data.destinationWarehouse.newQuantity).toBe(40); // 30 + 10
  });
});

// Low Stock Detection Tests
describe('Low Stock Detection', () => {
  test('Should get low stock items', async() => {
    const response = await request(app)
      .get('/api/inventory/low-stock/warehouse')
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThan(0);
    
    // Item 2 should be in the low stock items since it's below reorder point
    const lowStockItemIds = response.body.data.items.map((item: any) => item.item._id);
    expect(lowStockItemIds).toContain(inventoryItemIds[1]);
  });
});

// Warehouse Inventory Tests
describe('Warehouse Inventory', () => {
  test('Should get warehouse inventory', async() => {
    const response = await request(app)
      .get(`/api/warehouses/${warehouseIds[0]}/inventory`)
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
  
  test('Should get warehouse statistics', async() => {
    const response = await request(app)
      .get(`/api/warehouses/${warehouseIds[0]}/stats`)
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalItems).toBeGreaterThan(0);
    expect(response.body.data.totalStockValue).toBeGreaterThan(0);
  });
});

// Legacy Endpoints Tests
describe('Legacy Endpoints', () => {
  test('Should update inventory stock using legacy endpoint', async() => {
    const response = await request(app)
      .put(`/api/inventory/${inventoryItemIds[0]}/stock`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        stockQuantity: 60,
        warehouseId: warehouseIds[0],
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalStockQuantity).toBe(100); // 60 + 40 from second warehouse
  });
  
  test('Should get legacy low stock items', async() => {
    const response = await request(app)
      .get('/api/inventory/low-stock')
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // Should include items that are below reorder point in any warehouse
  });
});