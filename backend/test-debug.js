const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./src/models/user.model').default;
const InventoryItem = require('./src/models/inventory.model').default;
const jwt = require('jsonwebtoken');

async function runTest() {
  // Create MongoDB memory server
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  console.log('MongoDB Memory Server running at ' + mongoUri);
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  try {
    // Create a test user
    const user = new User({
      email: 'debug@example.com',
      password: 'password123',
      firstName: 'Debug',
      lastName: 'Tester',
      role: 'admin',
      isActive: true
    });
    
    await user.save();
    console.log('Created test user with ID:', user._id.toString());
    
    // Create a test inventory item
    const item = new InventoryItem({
      name: 'Test Item',
      sku: 'TEST-001',
      description: 'A test item',
      category: 'Test',
      price: 9.99,
      costPrice: 5.99,
      stockQuantity: 100,
      reorderPoint: 10,
      supplier: new mongoose.Types.ObjectId(),
      createdBy: user._id
    });
    
    await item.save();
    console.log('Created test inventory item with ID:', item._id.toString());
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id.toString(), role: 'admin' },
      'test-secret',
      { expiresIn: '1h' }
    );
    
    console.log('Generated token:', token);
    
    // Create an Express app for testing
    const { createTestApp } = require('./src/tests/utils/test-app');
    const app = createTestApp();
    
    // Make authenticated request
    console.log('Making authenticated GET request to /api/inventory');
    const response = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Response status:', response.status);
    if (response.status >= 400) {
      console.error('Error response:', response.body);
    } else {
      console.log('Response successful:', {
        success: response.body.success,
        count: response.body.count,
        data: response.body.data ? response.body.data.length + ' items' : 'None'
      });
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Disconnect and stop MongoDB server
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

// Set environment variable
process.env.JWT_SECRET = 'test-secret';

// Run the test
runTest().catch(console.error);
