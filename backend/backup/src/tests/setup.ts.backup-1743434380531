import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { beforeAll, afterAll, afterEach } from '@jest/globals';

// Load environment variables from .env file
dotenv.config();

// Set JWT_SECRET for tests if not already set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
  console.log('Set JWT_SECRET for tests:', process.env.JWT_SECRET);
}

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