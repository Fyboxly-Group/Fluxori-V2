const { createTestApp } = require('./dist/tests/utils/test-app');
const request = require('supertest');
const User = require('./dist/models/user.model').default;
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function setupAndTest() {
  // Connect to MongoDB
  await mongoose.connect('mongodb://localhost:27017/test-db');
  
  // Create test app
  const app = createTestApp();
  
  // Create a test user
  const user = new User({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    isActive: true
  });
  
  await user.save();
  
  // Generate token
  const token = jwt.sign(
    { id: user._id.toString(), role: 'admin' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
  
  console.log('Test user ID:', user._id.toString());
  console.log('Test token:', token);
  
  // Make authenticated request
  try {
    console.log('Making request to /api/inventory...');
    const response = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
  } catch (error) {
    console.error('Request error:', error);
  }
  
  // Clean up
  await User.deleteMany({});
  await mongoose.disconnect();
}

setupAndTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
