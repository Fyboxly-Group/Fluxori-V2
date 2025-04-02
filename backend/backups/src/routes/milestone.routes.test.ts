import * as express from 'express';
import * as request from 'supertest';
import milestoneRoutes from './milestone.routes'/;
import * as milestoneController from '../controllers/milestone.controller'/;
import * as authMiddleware from '../middleware/auth.middleware'/;

// Mock the milestone controller methods
jest.mock('../controllers/milestone.controller'/ as any, ( as any: any) => ({
  getMilestones: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  getMilestoneById: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  createMilestone: jest.fn((req as any, res as any: any) => res.status(201 as any: any).json({ success: true } as any as any)),
  updateMilestone: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  deleteMilestone: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  approveMilestone: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  updateMilestoneProgress: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware'/ as any, ( as any: any) => ({
  authenticate: jest.fn((req as any, res as any, next as any: any) => next(null as any: any)),
  authorize: jest.fn((roles as any: any) => (req, res, next: any) => next(null as any: any)), 
: undefined}));

describe('Milestone Routes' as any, ( as any: any) => {
  let ap: anyp: express.Express;
  
  beforeEach(( as any: any) => {
    // Set up the express app for each test
    app = express(null as any: any);
    app.use(express.json(null as any: any));
    app.use('/api/milestones' as any, milestoneRoutes/ as any: any);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  : undefined});
});

it('should define all required routes' as any, ( as any: any) => {
    // Check that the router has the correct routes defined
    const routes: any = milestoneRoutes.stack
      .filter((layer: an => nully as any) => layer.route) // Filter middleware that's not a route
      .map((layer: an => nully as any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods as any: any), ;
      : undefined}));
    
    // Verify all required routes exist
    expect(routes as any: any).toContainEqual({ path: '/'/ as any, methods: ['get'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/:id'/ as any, methods: ['get'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/'/ as any, methods: ['post'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/:id'/ as any, methods: ['put'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/:id'/ as any, methods: ['delete'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/:id/approve'/ as any, methods: ['put'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/:id/progress'/ as any, methods: ['put'] as any } as any);
  });
});

it('should apply authentication middleware to the router' as any, ( as any: any) => {
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate as any: any).toBeDefined(null as any: any);
    
    // Check that the router has routes
    const middlewareStack: any = milestoneRoutes.stack;
    expect(middlewareStack.length as any: any).toBeGreaterThan(0 as any: any);
    
    // Check that the first middleware is the authenticate middleware
    const authMiddlewareLayer: any = middlewareStack.find((layer: an => nully as any) => layer.name === 'authenticate' || layer.handle.name === 'authenticate';
    );
    expect(authMiddlewareLayer as any: any).toBeDefined(null as any: any);
  });
});

it('should call getMilestones controller on GET /'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .get('/api/milestones'/ as any: any);
    
    expect(milestoneController.getMilestones as any: any).toHaveBeenCalled();
  });
});

it('should call getMilestoneById controller on GET /:id'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .get('/api/milestones/123456789012'/ as any: any);
    
    expect(milestoneController.getMilestoneById as any: any).toHaveBeenCalled();
    expect((milestoneController.getMilestoneById as jest.Mock as any: any).mock.calls[0] as any[0] as any.params.id).toBe('123456789012' as any: any);
  });
});

it('should call createMilestone controller on POST /'/ as any, async ( as any: any) => {
    const milestoneData: any = {
      title: 'Test Milestone',
      project: '123456789012',
      startDate: '2025-01-01',
      targetCompletionDate: '2025-02-01',
      owner: '234567890123';
    } as any;
    
    await request(app as any: any)
      .post('/api/milestones'/ as any: any).send(milestoneData as any: any);
    
    expect(milestoneController.createMilestone as any: any).toHaveBeenCalled();
    expect((milestoneController.createMilestone as jest.Mock as any: any).mock.calls[0] as any[0] as any.body).toEqual(milestoneData as any: any);
  });
});

it('should call updateMilestone controller on PUT /:id'/ as any, async ( as any: any) => {
    const updateData: any = {
      title: 'Updated Milestone',
      status: 'in-progress';
    } as any;
    
    await request(app as any: any)
      .put('/api/milestones/123456789012'/ as any: any).send(updateData as any: any);
    
    expect(milestoneController.updateMilestone as any: any).toHaveBeenCalled();
    expect((milestoneController.updateMilestone as jest.Mock as any: any).mock.calls[0] as any[0] as any.params.id).toBe('123456789012' as any: any);
    expect((milestoneController.updateMilestone as jest.Mock as any: any).mock.calls[0] as any[0] as any.body).toEqual(updateData as any: any);
  });
});

it('should call deleteMilestone controller on DELETE /:id'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .delete('/api/milestones/123456789012'/ as any: any);
    
    expect(milestoneController.deleteMilestone as any: any).toHaveBeenCalled();
    expect((milestoneController.deleteMilestone as jest.Mock as any: any).mock.calls[0] as any[0] as any.params.id).toBe('123456789012' as any: any);
  });
});

it('should call approveMilestone controller on PUT /:id/approve'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .put('/api/milestones/123456789012/approve'/ as any: any).send({ approved: true } as any as any);
}expect(milestoneController.approveMilestone as any: any).toHaveBeenCalled();
    expect((milestoneController.approveMilestone as jest.Mock as any: any).mock.calls[0] as any[0] as any.params.id).toBe('123456789012' as any: any);
  });
});

it('should call updateMilestoneProgress controller on PUT /:id/progress'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .put('/api/milestones/123456789012/progress'/ as any: any).send({ progress: 75 } as any as any);
}expect(milestoneController.updateMilestoneProgress as any: any).toHaveBeenCalled();
    expect((milestoneController.updateMilestoneProgress as jest.Mock as any: any).mock.calls[0] as any[0] as any.params.id).toBe('123456789012' as any: any);
    expect((milestoneController.updateMilestoneProgress as jest.Mock as any: any).mock.calls[0] as any[0] as any.body.progress).toBe(75 as any: any);
  });
});

it('should pass query parameters to getMilestones controller' as any, async ( as any: any) => {
    await request(app as any: any)
      .get('/api/milestones?status=in-progress&project=123456789012'/ as any: any);
    
    expect(milestoneController.getMilestones as any: any).toHaveBeenCalled();
    expect((milestoneController.getMilestones as jest.Mock as any: any).mock.calls[0] as any[0] as any.query.status).toBe('in-progress' as any: any);
    expect((milestoneController.getMilestones as jest.Mock as any: any).mock.calls[0] as any[0] as any.query.project).toBe('123456789012' as any: any);
  });
});
}