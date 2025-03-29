import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { beforeAll, afterAll, afterEach } from '@jest/globals';
import path from 'path';

// Load environment variables from .env.test file
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// Ensure JWT_SECRET is set consistently for tests
process.env.JWT_SECRET = 'test-secret';

console.log('Test setup - JWT_SECRET:', process.env.JWT_SECRET);
console.log('Test setup - NODE_ENV:', process.env.NODE_ENV);

// MongoDB memory server instance
let mongoServer: MongoMemoryServer;

// Setup before tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect Mongoose to the in-memory database
  await mongoose.connect(mongoUri);
  
  console.log(`MongoDB Memory Server running at ${mongoUri}`);
});

// Cleanup after tests
afterAll(async () => {
  // Disconnect Mongoose
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Stop MongoDB memory server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clear all collections after each test
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});
