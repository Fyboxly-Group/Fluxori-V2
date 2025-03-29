import express from 'express';
import request from 'supertest';
import projectRoutes from './project.routes';
import * as projectController from '../controllers/project.controller';
import * as authMiddleware from '../middleware/auth.middleware';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the project controller methods
jest.mock('../controllers/project.controller', () => ({
  getProjects: jest.fn((req, res) => res.status(200).json({ success: true })),
  getProjectById: jest.fn((req, res) => res.status(200).json({ success: true })),
  createProject: jest.fn((req, res) => res.status(201).json({ success: true })),
  updateProject: jest.fn((req, res) => res.status(200).json({ success: true })),
  deleteProject: jest.fn((req, res) => res.status(200).json({ success: true })),
  addProjectDocument: jest.fn((req, res) => res.status(200).json({ success: true })),
  removeProjectDocument: jest.fn((req, res) => res.status(200).json({ success: true })),
  getProjectStats: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  authorize: jest.fn(roles => (req, res, next) => next()),
}));

describe('Project Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Set up the express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/projects', projectRoutes);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should define all required routes', () => {
    // Check that the router has the correct routes defined
    const routes = projectRoutes.stack
      .filter((layer: any) => layer.route) // Filter middleware that's not a route
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));
    
    // Verify all required routes exist
    expect(routes).toContainEqual({ path: '/', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/stats', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['put'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['delete'] });
    expect(routes).toContainEqual({ path: '/:id/documents', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/:id/documents/:documentId', methods: ['delete'] });
  });
  
  it('should apply authentication middleware to the router', () => {
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate).toBeDefined();
    
    // Check that the router has routes
    const middlewareStack = projectRoutes.stack;
    expect(middlewareStack.length).toBeGreaterThan(0);
    
    // Check that the first middleware is the authenticate middleware
    const authMiddlewareLayer = middlewareStack.find(
      (layer: any) => layer.name === 'authenticate' || layer.handle.name === 'authenticate'
    );
    expect(authMiddlewareLayer).toBeDefined();
  });
  
  it('should apply authorization middleware to delete route', () => {
    // Check that the authorize middleware exists
    expect(authMiddleware.authorize).toBeDefined();
    
    // Verify that authorize is called with the correct role
    expect(authMiddleware.authorize).toHaveBeenCalledWith('admin');
  });
  
  it('should call getProjects controller on GET /', async () => {
    await request(app)
      .get('/api/projects');
    
    expect(projectController.getProjects).toHaveBeenCalled();
  });
  
  it('should call getProjectStats controller on GET /stats', async () => {
    await request(app)
      .get('/api/projects/stats');
    
    expect(projectController.getProjectStats).toHaveBeenCalled();
  });
  
  it('should call getProjectById controller on GET /:id', async () => {
    await request(app)
      .get('/api/projects/123456789012');
    
    expect(projectController.getProjectById).toHaveBeenCalled();
    expect(projectController.getProjectById.mock.calls[0][0].params.id).toBe('123456789012');
  });
  
  it('should call createProject controller on POST /', async () => {
    const projectData = {
      name: 'Test Project',
      customer: '123456789012',
      accountManager: '234567890123',
      startDate: '2025-01-01'
    };
    
    await request(app)
      .post('/api/projects')
      .send(projectData);
    
    expect(projectController.createProject).toHaveBeenCalled();
    expect(projectController.createProject.mock.calls[0][0].body).toEqual(projectData);
  });
  
  it('should call updateProject controller on PUT /:id', async () => {
    const updateData = {
      name: 'Updated Project',
      status: 'active',
      phase: 'implementation'
    };
    
    await request(app)
      .put('/api/projects/123456789012')
      .send(updateData);
    
    expect(projectController.updateProject).toHaveBeenCalled();
    expect(projectController.updateProject.mock.calls[0][0].params.id).toBe('123456789012');
    expect(projectController.updateProject.mock.calls[0][0].body).toEqual(updateData);
  });
  
  it('should call deleteProject controller on DELETE /:id with admin authorization', async () => {
    await request(app)
      .delete('/api/projects/123456789012');
    
    expect(projectController.deleteProject).toHaveBeenCalled();
    expect(projectController.deleteProject.mock.calls[0][0].params.id).toBe('123456789012');
    
    // Verify that the authorize function exists and was called with admin role
    expect(authMiddleware.authorize).toBeDefined();
    expect(authMiddleware.authorize).toHaveBeenCalledWith('admin');
  });
  
  it('should call addProjectDocument controller on POST /:id/documents', async () => {
    const documentData = {
      title: 'Test Document',
      fileUrl: 'https://storage.example.com/test-document.pdf',
      fileType: 'application/pdf',
      category: 'specification'
    };
    
    await request(app)
      .post('/api/projects/123456789012/documents')
      .send(documentData);
    
    expect(projectController.addProjectDocument).toHaveBeenCalled();
    expect(projectController.addProjectDocument.mock.calls[0][0].params.id).toBe('123456789012');
    expect(projectController.addProjectDocument.mock.calls[0][0].body).toEqual(documentData);
  });
  
  it('should call removeProjectDocument controller on DELETE /:id/documents/:documentId', async () => {
    await request(app)
      .delete('/api/projects/123456789012/documents/abc123');
    
    expect(projectController.removeProjectDocument).toHaveBeenCalled();
    expect(projectController.removeProjectDocument.mock.calls[0][0].params.id).toBe('123456789012');
    expect(projectController.removeProjectDocument.mock.calls[0][0].params.documentId).toBe('abc123');
  });
  
  it('should pass query parameters to getProjects controller', async () => {
    await request(app)
      .get('/api/projects?status=active&customer=123456789012');
    
    expect(projectController.getProjects).toHaveBeenCalled();
    expect(projectController.getProjects.mock.calls[0][0].query.status).toBe('active');
    expect(projectController.getProjects.mock.calls[0][0].query.customer).toBe('123456789012');
  });
});