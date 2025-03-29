import express from 'express';
import request from 'supertest';
import milestoneRoutes from './milestone.routes';
import * as milestoneController from '../controllers/milestone.controller';
import * as authMiddleware from '../middleware/auth.middleware';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the milestone controller methods
jest.mock('../controllers/milestone.controller', () => ({
  getMilestones: jest.fn((req, res) => res.status(200).json({ success: true })),
  getMilestoneById: jest.fn((req, res) => res.status(200).json({ success: true })),
  createMilestone: jest.fn((req, res) => res.status(201).json({ success: true })),
  updateMilestone: jest.fn((req, res) => res.status(200).json({ success: true })),
  deleteMilestone: jest.fn((req, res) => res.status(200).json({ success: true })),
  approveMilestone: jest.fn((req, res) => res.status(200).json({ success: true })),
  updateMilestoneProgress: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  authorize: jest.fn((roles) => (req, res, next) => next()),
}));

describe('Milestone Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Set up the express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/milestones', milestoneRoutes);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should define all required routes', () => {
    // Check that the router has the correct routes defined
    const routes = milestoneRoutes.stack
      .filter((layer: any) => layer.route) // Filter middleware that's not a route
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));
    
    // Verify all required routes exist
    expect(routes).toContainEqual({ path: '/', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['put'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['delete'] });
    expect(routes).toContainEqual({ path: '/:id/approve', methods: ['put'] });
    expect(routes).toContainEqual({ path: '/:id/progress', methods: ['put'] });
  });
  
  it('should apply authentication middleware to the router', () => {
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate).toBeDefined();
    
    // Check that the router has routes
    const middlewareStack = milestoneRoutes.stack;
    expect(middlewareStack.length).toBeGreaterThan(0);
    
    // Check that the first middleware is the authenticate middleware
    const authMiddlewareLayer = middlewareStack.find(
      (layer: any) => layer.name === 'authenticate' || layer.handle.name === 'authenticate'
    );
    expect(authMiddlewareLayer).toBeDefined();
  });
  
  it('should call getMilestones controller on GET /', async () => {
    await request(app)
      .get('/api/milestones');
    
    expect(milestoneController.getMilestones).toHaveBeenCalled();
  });
  
  it('should call getMilestoneById controller on GET /:id', async () => {
    await request(app)
      .get('/api/milestones/123456789012');
    
    expect(milestoneController.getMilestoneById).toHaveBeenCalled();
    expect(milestoneController.getMilestoneById.mock.calls[0][0].params.id).toBe('123456789012');
  });
  
  it('should call createMilestone controller on POST /', async () => {
    const milestoneData = {
      title: 'Test Milestone',
      project: '123456789012',
      startDate: '2025-01-01',
      targetCompletionDate: '2025-02-01',
      owner: '234567890123'
    };
    
    await request(app)
      .post('/api/milestones')
      .send(milestoneData);
    
    expect(milestoneController.createMilestone).toHaveBeenCalled();
    expect(milestoneController.createMilestone.mock.calls[0][0].body).toEqual(milestoneData);
  });
  
  it('should call updateMilestone controller on PUT /:id', async () => {
    const updateData = {
      title: 'Updated Milestone',
      status: 'in-progress'
    };
    
    await request(app)
      .put('/api/milestones/123456789012')
      .send(updateData);
    
    expect(milestoneController.updateMilestone).toHaveBeenCalled();
    expect(milestoneController.updateMilestone.mock.calls[0][0].params.id).toBe('123456789012');
    expect(milestoneController.updateMilestone.mock.calls[0][0].body).toEqual(updateData);
  });
  
  it('should call deleteMilestone controller on DELETE /:id', async () => {
    await request(app)
      .delete('/api/milestones/123456789012');
    
    expect(milestoneController.deleteMilestone).toHaveBeenCalled();
    expect(milestoneController.deleteMilestone.mock.calls[0][0].params.id).toBe('123456789012');
  });
  
  it('should call approveMilestone controller on PUT /:id/approve', async () => {
    await request(app)
      .put('/api/milestones/123456789012/approve')
      .send({ approved: true });
    
    expect(milestoneController.approveMilestone).toHaveBeenCalled();
    expect(milestoneController.approveMilestone.mock.calls[0][0].params.id).toBe('123456789012');
  });
  
  it('should call updateMilestoneProgress controller on PUT /:id/progress', async () => {
    await request(app)
      .put('/api/milestones/123456789012/progress')
      .send({ progress: 75 });
    
    expect(milestoneController.updateMilestoneProgress).toHaveBeenCalled();
    expect(milestoneController.updateMilestoneProgress.mock.calls[0][0].params.id).toBe('123456789012');
    expect(milestoneController.updateMilestoneProgress.mock.calls[0][0].body.progress).toBe(75);
  });
  
  it('should pass query parameters to getMilestones controller', async () => {
    await request(app)
      .get('/api/milestones?status=in-progress&project=123456789012');
    
    expect(milestoneController.getMilestones).toHaveBeenCalled();
    expect(milestoneController.getMilestones.mock.calls[0][0].query.status).toBe('in-progress');
    expect(milestoneController.getMilestones.mock.calls[0][0].query.project).toBe('123456789012');
  });
});