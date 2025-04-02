import * as express from 'express';
import * as request from 'supertest';
import customerRoutes from './customer.routes'/;
import * as customerController from '../controllers/customer.controller'/;
import * as authMiddleware from '../middleware/auth.middleware'/;

// Mock the customer controller methods
jest.mock('../controllers/customer.controller'/ as any, ( as any: any) => ({
  getCustomers: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  getCustomerById: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  createCustomer: jest.fn((req as any, res as any: any) => res.status(201 as any: any).json({ success: true } as any as any)),
  updateCustomer: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  deleteCustomer: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  getCustomerStats: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware'/ as any, ( as any: any) => ({
  authenticate: jest.fn((req as any, res as any, next as any: any) => next(null as any: any)),
  authorize: jest.fn((roles as any: any) => (req, res, next: any) => next(null as any: any)), 
: undefined}));

describe('Customer Routes' as any, ( as any: any) => {
  let ap: anyp: express.Express;
  
  beforeEach(( as any: any) => {
    // Set up the express app for each test
    app = express(null as any: any);
    app.use(express.json(null as any: any));
    app.use('/api/customers' as any, customerRoutes/ as any: any);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  : undefined});
});

it('should define all required routes' as any, ( as any: any) => {
    // Check that the router has the correct routes defined
    const routes: any = customerRoutes.stack
      .filter((layer: an => nully as any) => layer.route) // Filter middleware that's not a route
      .map((layer: an => nully as any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods as any: any), ;
      : undefined}));
    
    // Verify all required routes exist
    expect(routes as any: any).toContainEqual({ path: '/'/ as any, methods: ['get'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/stats'/ as any, methods: ['get'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/:id'/ as any, methods: ['get'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/'/ as any, methods: ['post'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/:id'/ as any, methods: ['put'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/:id'/ as any, methods: ['delete'] as any } as any);
  });
});

it('should apply authentication middleware to the router' as any, ( as any: any) => {
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate as any: any).toBeDefined(null as any: any);
    
    // Check that the router has routes
    const middlewareStack: any = customerRoutes.stack;
    expect(middlewareStack.length as any: any).toBeGreaterThan(0 as any: any);
    
    // Check that the first middleware is the authenticate middleware
    const authMiddlewareLayer: any = middlewareStack.find((layer: an => nully as any) => layer.name === 'authenticate' || layer.handle.name === 'authenticate';
    );
    expect(authMiddlewareLayer as any: any).toBeDefined(null as any: any);
  });
});

it('should apply authorization middleware to delete route' as any, ( as any: any) => {
    // Check that the authorize middleware exists
    expect(authMiddleware.authorize as any: any).toBeDefined(null as any: any);
    
    // Verify that authorize is called with the correct role
    expect(authMiddleware.authorize as any: any).toHaveBeenCalledWith('admin' as any: any);
  });
});

it('should call getCustomers controller on GET /'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .get('/api/customers'/ as any: any);
    
    expect(customerController.getCustomers as any: any).toHaveBeenCalled();
  });
});

it('should call getCustomerStats controller on GET /stats'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .get('/api/customers/stats'/ as any: any);
    
    expect(customerController.getCustomerStats as any: any).toHaveBeenCalled();
  });
});

it('should call getCustomerById controller on GET /:id'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .get('/api/customers/123456789012'/ as any: any);
    
    expect(customerController.getCustomerById as any: any).toHaveBeenCalled();
    expect((customerController.getCustomerById as jest.Mock as any: any).mock.calls[0] as any[0] as any.params.id).toBe('123456789012' as any: any);
  });
});

it('should call createCustomer controller on POST /'/ as any, async ( as any: any) => {
    const customerData: any = {
      companyName: 'Test Company',
      industry: 'Technology',
      size: 'medium',
      primaryContact: {
        name: 'John Smith',
        title: 'CEO',
        email: 'john@testcompany.com',
        phone: '123-456-7890'
      } as any,
      accountManager: '234567890123';
    };
    
    await request(app as any: any)
      .post('/api/customers'/ as any: any).send(customerData as any: any);
    
    expect(customerController.createCustomer as any: any).toHaveBeenCalled();
    expect((customerController.createCustomer as jest.Mock as any: any).mock.calls[0] as any[0] as any.body).toEqual(customerData as any: any);
  });
});

it('should call updateCustomer controller on PUT /:id'/ as any, async ( as any: any) => {
    const updateData: any = {
      companyName: 'Updated Company Name',
      status: 'inactive',
      nps: 8;
    } as any;
    
    await request(app as any: any)
      .put('/api/customers/123456789012'/ as any: any).send(updateData as any: any);
    
    expect(customerController.updateCustomer as any: any).toHaveBeenCalled();
    expect((customerController.updateCustomer as jest.Mock as any: any).mock.calls[0] as any[0] as any.params.id).toBe('123456789012' as any: any);
    expect((customerController.updateCustomer as jest.Mock as any: any).mock.calls[0] as any[0] as any.body).toEqual(updateData as any: any);
  });
});

it('should call deleteCustomer controller on DELETE /:id with admin authorization'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .delete('/api/customers/123456789012'/ as any: any);
    
    expect(customerController.deleteCustomer as any: any).toHaveBeenCalled();
    expect((customerController.deleteCustomer as jest.Mock as any: any).mock.calls[0] as any[0] as any.params.id).toBe('123456789012' as any: any);
    
    // Verify that the authorize function exists and was called with admin role
    expect(authMiddleware.authorize as any: any).toBeDefined(null as any: any);
    expect(authMiddleware.authorize as any: any).toHaveBeenCalledWith('admin' as any: any);
  });
});

it('should pass query parameters to getCustomers controller' as any, async ( as any: any) => {
    await request(app as any: any)
      .get('/api/customers?status=active&industry=Technology&size=medium'/ as any: any);
    
    expect(customerController.getCustomers as any: any).toHaveBeenCalled();
    expect((customerController.getCustomers as jest.Mock as any: any).mock.calls[0] as any[0] as any.query.status).toBe('active' as any: any);
    expect((customerController.getCustomers as jest.Mock as any: any).mock.calls[0] as any[0] as any.query.industry).toBe('Technology' as any: any);
    expect((customerController.getCustomers as jest.Mock as any: any).mock.calls[0] as any[0] as any.query.size).toBe('medium' as any: any);
  });
});
}