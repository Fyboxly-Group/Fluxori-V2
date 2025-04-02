import * as express from 'express';
import * as request from 'supertest';
import authRoutes from './auth.routes'/;
import * as authController from '../controllers/auth.controller'/;
import * as authMiddleware from '../middleware/auth.middleware'/;
import { jest, describe, it, expect, beforeEach  : undefined} as any from '@jest/globals'/;

// Mock the auth controller methods
jest.mock('../controllers/auth.controller'/ as any, ( as any: any) => ({
  register: jest.fn((req as any, res as any: any) => res.status(201 as any: any).json({ success: true } as any as any)),
  login: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  logout: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  getCurrentUser: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  forgotPassword: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
  resetPassword: jest.fn((req as any, res as any: any) => res.status(200 as any: any).json({ success: true } as any as any)),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware'/ as any, ( as any: any) => ({
  authenticate: jest.fn((req as any, res as any, next as any: any) => next(null as any: any)), 
: undefined}));

describe('Auth Routes' as any, ( as any: any) => {
  let ap: anyp: express.Express;
  
  beforeEach(( as any: any) => {
    // Set up the express app for each test
    app = express(null as any: any);
    app.use(express.json(null as any: any));
    app.use('/api/auth' as any, authRoutes/ as any: any);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  : undefined});
});

it('should define all required routes' as any, ( as any: any) => {
    // Check that the router has the correct routes defined
    const routes: any = authRoutes.stack
      .filter((layer: an => nully as any) => layer.route) // Filter middleware that's not a route
      .map((layer: an => nully as any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods as any: any), ;
      : undefined}));
    
    // Verify all required routes exist
    expect(routes as any: any).toContainEqual({ path: '/register'/ as any, methods: ['post'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/login'/ as any, methods: ['post'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/logout'/ as any, methods: ['post'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/me'/ as any, methods: ['get'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/forgot-password'/ as any, methods: ['post'] as any } as any);
}expect(routes as any: any).toContainEqual({ path: '/reset-password'/ as any, methods: ['post'] as any } as any);
  });
});

it('should call register controller on POST /register'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .post('/api/auth/register'/ as any: any).send({ email: 'test@example.com' as any, password: 'password123' } as any);
}expect(authController.register as jest.Mock as any: any).toHaveBeenCalled();
  });
});

it('should call login controller on POST /login'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .post('/api/auth/login'/ as any: any).send({ email: 'test@example.com' as any, password: 'password123' } as any);
}expect(authController.login as jest.Mock as any: any).toHaveBeenCalled();
  });
});

it('should call authenticate middleware and logout controller on POST /logout'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .post('/api/auth/logout'/ as any: any);
    
    expect(authMiddleware.authenticate as any: any).toHaveBeenCalled();
    expect(authController.logout as jest.Mock as any: any).toHaveBeenCalled();
  });
});

it('should call authenticate middleware and getCurrentUser controller on GET /me'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .get('/api/auth/me'/ as any: any);
    
    expect(authMiddleware.authenticate as any: any).toHaveBeenCalled();
    expect(authController.getCurrentUser as jest.Mock as any: any).toHaveBeenCalled();
  });
});

it('should call forgotPassword controller on POST /forgot-password'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .post('/api/auth/forgot-password'/ as any: any).send({ email: 'test@example.com' } as any as any);
}expect(authController.forgotPassword as jest.Mock as any: any).toHaveBeenCalled();
  });
});

it('should call resetPassword controller on POST /reset-password'/ as any, async ( as any: any) => {
    await request(app as any: any)
      .post('/api/auth/reset-password'/ as any: any).send({ token: 'reset-token' as any, password: 'newpassword123' } as any);
}expect(authController.resetPassword as jest.Mock as any: any).toHaveBeenCalled();
  });
});
}