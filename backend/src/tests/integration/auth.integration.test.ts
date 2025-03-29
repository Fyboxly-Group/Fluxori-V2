import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../utils/test-app';
import User from '../../models/user.model';
import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import mongoose from 'mongoose';

describe('Auth API Integration Tests', () => {
  let app: Express;
  
  beforeAll(async () => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear the users collection before each test
    await User.deleteMany({});
  });
  
  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
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
      expect(response.body.data.role).toBe('user'); // Default role
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
      
      // Verify token is provided
      expect(response.body.token).toBeDefined();
      expect(response.body.token.length).toBeGreaterThan(10);
      
      // Verify user was saved in database
      const createdUser = await User.findOne({ email: userData.email });
      expect(createdUser).toBeDefined();
      expect(createdUser!.firstName).toBe(userData.firstName);
    });
    
    it('should return validation error for missing fields', async () => {
      const incompleteUserData = {
        email: 'test@example.com',
        // Missing password, firstName, lastName
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUserData);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.password).toBeDefined();
    });
    
    it('should return error for invalid email format', async () => {
      const invalidEmailData = {
        email: 'invalidEmail',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailData);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.email).toBeDefined();
    });
    
    it('should return error for duplicate email', async () => {
      // First create a user
      const userData = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        firstName: 'First',
        lastName: 'User',
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(userData);
        
      // Try to register with the same email
      const duplicateUserData = {
        email: 'duplicate@example.com',
        password: 'DifferentPass123!',
        firstName: 'Second',
        lastName: 'User',
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUserData);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      // First create a user
      const userData = {
        email: 'login-test@example.com',
        password: 'Password123!',
        firstName: 'Login',
        lastName: 'Test',
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(userData);
        
      // Try to login
      const loginData = {
        email: 'login-test@example.com',
        password: 'Password123!',
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.firstName).toBe(userData.firstName);
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
      
      // Verify token is provided
      expect(response.body.token).toBeDefined();
      expect(response.body.token.length).toBeGreaterThan(10);
    });
    
    it('should return error for non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });
    
    it('should return error for incorrect password', async () => {
      // First create a user
      const userData = {
        email: 'password-test@example.com',
        password: 'Password123!',
        firstName: 'Password',
        lastName: 'Test',
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(userData);
        
      // Try to login with wrong password
      const loginData = {
        email: 'password-test@example.com',
        password: 'WrongPassword123!',
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });
    
    it('should return validation error for missing fields', async () => {
      const incompleteLoginData = {
        // Missing email and password
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteLoginData);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide email and password');
    });
  });
  
  describe('GET /api/auth/me', () => {
    it('should return current user details with valid token', async () => {
      // First create and login a user
      const userData = {
        email: 'me-test@example.com',
        password: 'Password123!',
        firstName: 'Current',
        lastName: 'User',
      };
      
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
        
      const token = registerResponse.body.token;
      
      // Get current user
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.firstName).toBe(userData.firstName);
      expect(response.body.data.lastName).toBe(userData.lastName);
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
    });
    
    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/me');
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });
    
    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});