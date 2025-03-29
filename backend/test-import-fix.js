// Fix for imports in debug test
require('dotenv').config();

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const path = require('path');

async function main() {
  console.log('Starting MongoDB memory server...');
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  console.log('Connecting to MongoDB at', mongoUri);
  await mongoose.connect(mongoUri);
  
  console.log('Loading models...');
  const User = require(path.join(__dirname, 'src/models/user.model')).default;
  const InventoryItem = require(path.join(__dirname, 'src/models/inventory.model')).default;
  const { testAuthenticate, createTestApp } = require(path.join(__dirname, 'src/tests/utils/test-app'));
  
  try {
    // Create a test user
    console.log('Creating test user...');
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });
    
    await user.save();
    console.log('Created user with ID:', user._id.toString());
    
    // Create a test inventory item
    console.log('Creating test inventory item...');
    const item = new InventoryItem({
      sku: 'TEST-SKU-001',
      name: 'Test Item',
      description: 'Test description',
      category: 'Test Category',
      price: 99.99,
      costPrice: 49.99,
      stockQuantity: 100,
      reorderPoint: 10,
      supplier: new mongoose.Types.ObjectId(),
      createdBy: user._id
    });
    
    await item.save();
    console.log('Created inventory item with ID:', item._id.toString());
    
    // Generate token
    console.log('Generating token...');
    const token = jwt.sign(
      { id: user._id.toString(), role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    
    console.log('Generated token:', token);
    
    // Create test app
    console.log('Creating test Express app...');
    const app = createTestApp();
    
    // Test authentication directly
    console.log('Testing testAuthenticate function...');
    const mockReq = {
      headers: {
        authorization: `Bearer ${token}`
      },
      user: null
    };
    
    const mockRes = {
      status: function(code) {
        console.log('Status code:', code);
        return this;
      },
      json: function(data) {
        console.log('Response data:', data);
        return this;
      }
    };
    
    const mockNext = function() {
      console.log('Next function called, user attached:', !!mockReq.user);
    };
    
    await testAuthenticate(mockReq, mockRes, mockNext);
    
    // Make real request
    console.log('Making authenticated request to /api/inventory...');
    const response = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    console.log('Cleaning up...');
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('Done.');
  }
}

// Set JWT_SECRET for tests
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// Run the test
main().catch(console.error);