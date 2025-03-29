import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createTestApp } from '../tests/utils/test-app';
import User from '../models/user.model';
import * as testUtils from '../tests/utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';

describe('Auth Controller', () => {
  let app: Express;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.firstName).toBe(userData.firstName);
      expect(response.body.data.lastName).toBe(userData.lastName);
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
      
      // Verify the user was created in the database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
      expect(user!.email).toBe(userData.email);
      expect(user!.firstName).toBe(userData.firstName);
      expect(user!.lastName).toBe(userData.lastName);
      
      // Password should be hashed
      expect(user!.password).not.toBe(userData.password);
    });
    
    it('should return an error if user already exists', async () => {
      // Create a user first
      await User.create({
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      });
      
      // Try to register with the same email
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
    });
    
    it('should require all required fields', async () => {
      // Missing email
      let response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });
      
      expect(response.status).toBe(400);
      
      // Missing password
      response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        });
      
      expect(response.status).toBe(400);
      
      // Missing firstName
      response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          lastName: 'User',
        });
      
      expect(response.status).toBe(400);
      
      // Missing lastName
      response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });
    });
    
    it('should login a user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
      
      // Verify lastLogin was updated
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user!.lastLogin).toBeDefined();
    });
    
    it('should return an error with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
    
    it('should return an error with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
    
    it('should require email and password', async () => {
      // Missing email
      let response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });
      
      expect(response.status).toBe(400);
      
      // Missing password
      response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/auth/me', () => {
    let user: any;
    let token: string;
    
    beforeEach(async () => {
      // Create a user and generate a token
      user = await testUtils.createTestUser();
      token = testUtils.generateAuthToken(user._id.toString());
    });
    
    it('should return the current user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.firstName).toBe(user.firstName);
      expect(response.body.data.lastName).toBe(user.lastName);
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
    });
    
    it('should return an error if no token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    it('should return an error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });
    });
    
    it('should handle forgot password request for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('If your email exists');
      
      // In test/dev environments, it should include the reset token
      if (process.env.NODE_ENV !== 'production') {
        expect(response.body.resetToken).toBeDefined();
      }
    });
    
    it('should handle forgot password request for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('If your email exists');
      
      // Should not leak information about user existence
      expect(response.body.resetToken).toBeUndefined();
    });
    
    it('should require an email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  // More tests for resetPassword and logout can be added similarly
});