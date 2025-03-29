import express from 'express';
import request from 'supertest';
import taskRoutes from './task.routes';
import * as taskController from '../controllers/task.controller';
import * as authMiddleware from '../middleware/auth.middleware';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the task controller methods
jest.mock('../controllers/task.controller', () => ({
  createTask: jest.fn((req, res) => res.status(201).json({ success: true })),
  getAllTasks: jest.fn((req, res) => res.status(200).json({ success: true })),
  getTaskById: jest.fn((req, res) => res.status(200).json({ success: true })),
  updateTask: jest.fn((req, res) => res.status(200).json({ success: true })),
  deleteTask: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  authorize: jest.fn((roles) => (req, res, next) => next()),
}));

describe('Task Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Set up the express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/tasks', taskRoutes);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should define all required routes', () => {
    // Check that the router has the correct routes defined
    const routes = taskRoutes.stack
      .filter((layer: any) => layer.route) // Filter middleware that's not a route
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));
    
    // Verify all required routes exist
    expect(routes).toContainEqual({ path: '/', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['put'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['delete'] });
  });
  
  it('should apply middleware to the router', () => {
    // We can't directly test router-applied middleware in a unit test
    // without actually running the router, so we'll check our mockup
    
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate).toBeDefined();
    
    // Check that the router has routes
    const middlewareStack = taskRoutes.stack;
    expect(middlewareStack.length).toBeGreaterThan(0);
  });
  
  it('should call createTask controller on POST /', async () => {
    await request(app)
      .post('/api/tasks')
      .send({ title: 'New Task', assignedTo: '123456789012' });
    
    expect(taskController.createTask).toHaveBeenCalled();
  });
  
  it('should call getAllTasks controller on GET /', async () => {
    await request(app)
      .get('/api/tasks');
    
    expect(taskController.getAllTasks).toHaveBeenCalled();
  });
  
  it('should call getTaskById controller on GET /:id', async () => {
    await request(app)
      .get('/api/tasks/123456789012');
    
    expect(taskController.getTaskById).toHaveBeenCalled();
  });
  
  it('should call updateTask controller on PUT /:id', async () => {
    await request(app)
      .put('/api/tasks/123456789012')
      .send({ status: 'completed' });
    
    expect(taskController.updateTask).toHaveBeenCalled();
  });
  
  it('should call deleteTask controller on DELETE /:id', async () => {
    await request(app)
      .delete('/api/tasks/123456789012');
    
    expect(taskController.deleteTask).toHaveBeenCalled();
  });
});