# TypeScript Patterns for Fluxori-V2 Backend

This document outlines the common TypeScript patterns and utility types used throughout the Fluxori-V2 backend codebase. Following these patterns ensures consistency and type safety across the application.

## Table of Contents

- [Model Patterns](#model-patterns)
- [Controller Patterns](#controller-patterns)
- [Service Patterns](#service-patterns)
- [Middleware Patterns](#middleware-patterns)
- [Test Patterns](#test-patterns)
- [Utility Types](#utility-types)
- [Error Handling](#error-handling)

## Model Patterns

### MongoDB Documents

For MongoDB models, we use a three-tier typing approach:

```typescript
// 1. Base interface (plain object properties)
export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
}

// 2. Document interface (adds Mongoose document properties and methods)
export interface IUserDocument extends IUser, Document {
  // Document methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): Promise<string>;
}

// 3. Model interface (adds static methods)
export interface UserModel extends Model<IUserDocument> {
  // Static methods
  findByEmail(email: string): Promise<IUserDocument | null>;
  findActive(): Promise<IUserDocument[]>;
}

// Model definition
const userSchema = new Schema<IUserDocument>({
  // Schema definition...
});

// Add methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  // Implementation...
};

// Add statics
userSchema.statics.findByEmail = async function(email: string): Promise<IUserDocument | null> {
  // Implementation...
};

// Create and export the model
const User = mongoose.model<IUserDocument, UserModel>('User', userSchema);
export default User;
```

### ObjectId Handling

Always use proper typing for MongoDB ObjectIds:

```typescript
// In parameters
function findUserById(userId: mongoose.Types.ObjectId | string): Promise<IUserDocument | null> {
  const objectId = typeof userId === 'string' 
    ? new mongoose.Types.ObjectId(userId) 
    : userId;
  return User.findById(objectId).exec();
}

// In document creation
const newUser = new User({
  name: 'John Doe',
  email: 'john@example.com',
  organizationId: new mongoose.Types.ObjectId(orgId),
  // Other properties...
});

// In queries
const user = await User.findOne({ 
  _id: new mongoose.Types.ObjectId(userId) 
}).exec();
```

## Controller Patterns

### Request and Response Typing

Controllers use typed Express requests and responses:

```typescript
import { Request, Response, NextFunction } from 'express';

// For authenticated routes
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    organizationId?: string;
    role?: string;
  };
};

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  try {
    const user = await User.findById(req.user.id).exec();
    
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message: `Error fetching profile: ${errorMessage}` });
  }
}
```

### API Response Pattern

For consistent API responses, we use a standard response format:

```typescript
// Generic API response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

// Usage in controller
function createResponse<T>(data: T, status = 200): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

function createErrorResponse(message: string, errors?: string[]): ApiResponse<never> {
  return {
    success: false,
    message,
    errors
  };
}

// In controller
res.status(200).json(createResponse(user));
// or
res.status(400).json(createErrorResponse('Invalid input', ['Email is required']));
```

## Service Patterns

### Promise Return Types

Services explicitly define return types for async functions:

```typescript
export class UserService {
  /**
   * Finds a user by email
   * @param email User's email address
   * @returns The user document or null if not found
   */
  public async findByEmail(email: string): Promise<IUserDocument | null> {
    try {
      return await User.findOne({ email }).exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error finding user by email: ${errorMessage}`);
    }
  }

  /**
   * Creates a new user
   * @param userData User data to create
   * @returns The created user document
   */
  public async createUser(userData: IUser): Promise<IUserDocument> {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error creating user: ${errorMessage}`);
    }
  }
}
```

### Generic Service Methods

For reusable services, use generics to enforce type safety:

```typescript
export class BaseService<T extends Document, CreateDTO, UpdateDTO = Partial<CreateDTO>> {
  constructor(
    protected readonly model: Model<T>,
    protected readonly modelName: string
  ) {}
  
  async findAll(): Promise<T[]> {
    try {
      return await this.model.find().exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error finding all ${this.modelName}s: ${errorMessage}`);
    }
  }
  
  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error finding ${this.modelName} by ID: ${errorMessage}`);
    }
  }
  
  async create(data: CreateDTO): Promise<T> {
    try {
      return await this.model.create(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error creating ${this.modelName}: ${errorMessage}`);
    }
  }
  
  async update(id: string, data: UpdateDTO): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error updating ${this.modelName}: ${errorMessage}`);
    }
  }
  
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error deleting ${this.modelName}: ${errorMessage}`);
    }
  }
}

// Usage
interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

class UserService extends BaseService<IUserDocument, CreateUserDTO, UpdateUserDTO> {
  constructor() {
    super(User, 'User');
  }
  
  // Add user-specific methods...
}
```

## Middleware Patterns

### Typed Middleware

Express middleware uses proper typing:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Authenticated request type
export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role?: string;
    organizationId?: string;
  };
};

// Authentication middleware
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role?: string;
      organizationId?: string;
    };

    // Add user info to request
    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      role: decoded.role,
      organizationId: decoded.organizationId
    };

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(401).json({ success: false, message: `Authentication failed: ${errorMessage}` });
  }
}

// Role-based authorization middleware
export function authorize(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!authReq.user.role || !allowedRoles.includes(authReq.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
```

## Test Patterns

### Mocking with TypeScript

Proper typing for Jest mocks:

```typescript
// Mock User model
jest.mock('../models/user.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    create: jest.fn().mockImplementation((data) => ({ 
      ...data, 
      _id: 'mockedId',
      save: jest.fn().mockResolvedValue({ ...data, _id: 'mockedId' })
    })),
    exec: jest.fn().mockResolvedValue({
      _id: 'mockedId',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      toObject: () => ({
        _id: 'mockedId',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      })
    })
  }
}));

// Type-safe mock functions
const mockFindById = jest.fn<Promise<IUserDocument | null>, [string]>()
  .mockResolvedValue({
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  } as IUserDocument);

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockImplementation(() => ({ 
    id: 'mockUserId', 
    role: 'user' 
  })),
  sign: jest.fn().mockReturnValue('mock.jwt.token')
}));
```

### Testing API Routes

Type-safe API tests with supertest:

```typescript
import * as request from 'supertest';
import { Express } from 'express';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';

// Import app
const app = require('../app').default;

describe('User Routes', () => {
  let authToken: string;
  let userId: string;

  beforeAll(() => {
    // Setup test user and authentication
    userId = new mongoose.Types.ObjectId().toString();
    authToken = jwt.sign({ id: userId }, 'test-secret', { expiresIn: '1d' });
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

## Utility Types

### Common Utility Types

```typescript
// Pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: Record<string, any>;
}

// Recursive partial (for deep partial updates)
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

// Omit nested property
export type OmitNested<T, K extends string> = T extends object
  ? { [P in keyof T as P extends K ? never : P]: OmitNested<T[P], K> }
  : T;

// Pick only some properties deeply
export type DeepPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

## Error Handling

### Type-Safe Error Handling

```typescript
// Base application error
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Derived errors
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, code);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    public readonly errors?: string[],
    code?: string
  ) {
    super(message, 400, code);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', code?: string) {
    super(message, 401, code);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', code?: string) {
    super(message, 403, code);
  }
}

// Type guard for error handling
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Error handling in controllers
try {
  // Operation that might throw
} catch (error) {
  if (isAppError(error)) {
    // We know it's an AppError with statusCode, message, etc.
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code
    });
  } else {
    // Unknown error
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: `An unexpected error occurred: ${errorMessage}`
    });
  }
}
```

These patterns ensure consistent, type-safe code throughout the Fluxori-V2 backend application. By following these patterns, developers can maintain code quality and reduce TypeScript errors in the codebase.