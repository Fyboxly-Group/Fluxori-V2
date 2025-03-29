import express from 'express';
import request from 'supertest';
import authRoutes from './auth.routes';
import * as authController from '../controllers/auth.controller';
import * as authMiddleware from '../middleware/auth.middleware';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the auth controller methods
jest.mock('../controllers/auth.controller', () => ({
  register: jest.fn((req, res) => res.status(201).json({ success: true })),
  login: jest.fn((req, res) => res.status(200).json({ success: true })),
  logout: jest.fn((req, res) => res.status(200).json({ success: true })),
  getCurrentUser: jest.fn((req, res) => res.status(200).json({ success: true })),
  forgotPassword: jest.fn((req, res) => res.status(200).json({ success: true })),
  resetPassword: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
}));

describe('Auth Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Set up the express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should define all required routes', () => {
    // Check that the router has the correct routes defined
    const routes = authRoutes.stack.map((layer: any) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }));
    
    // Verify all required routes exist
    expect(routes).toContainEqual({ path: '/register', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/login', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/logout', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/me', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/forgot-password', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/reset-password', methods: ['post'] });
  });
  
  it('should call register controller on POST /register', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect(authController.register).toHaveBeenCalled();
  });
  
  it('should call login controller on POST /login', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect(authController.login).toHaveBeenCalled();
  });
  
  it('should call authenticate middleware and logout controller on POST /logout', async () => {
    await request(app)
      .post('/api/auth/logout');
    
    expect(authMiddleware.authenticate).toHaveBeenCalled();
    expect(authController.logout).toHaveBeenCalled();
  });
  
  it('should call authenticate middleware and getCurrentUser controller on GET /me', async () => {
    await request(app)
      .get('/api/auth/me');
    
    expect(authMiddleware.authenticate).toHaveBeenCalled();
    expect(authController.getCurrentUser).toHaveBeenCalled();
  });
  
  it('should call forgotPassword controller on POST /forgot-password', async () => {
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@example.com' });
    
    expect(authController.forgotPassword).toHaveBeenCalled();
  });
  
  it('should call resetPassword controller on POST /reset-password', async () => {
    await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'reset-token', password: 'newpassword123' });
    
    expect(authController.resetPassword).toHaveBeenCalled();
  });
});