import { Request, Response, NextFunction } from 'express';
import { validate, Schema } from './validation.middleware';
import { MockRequest, MockResponse } from 'jest-mock-express';

describe('Validation Middleware', () => {
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
      headers: {},
      cookies: {},
    } as MockRequest;
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as MockResponse;
    
    mockNext = jest.fn();
  });

  test('should pass validation when schema matches request', () => {
    // Arrange
    const schema = {
      body: {
        name: Schema.string({ required: true, min: 2 }),
        email: Schema.string({ required: true })
      }
    };

    mockRequest.body = { name: 'John', email: 'john@example.com' };

    const middleware = validate(schema);

    // Act
    middleware(mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockRequest.validatedBody).toEqual({ name: 'John', email: 'john@example.com' });
  });

  test('should fail validation when required field is missing', () => {
    // Arrange
    const schema = {
      body: {
        name: Schema.string({ required: true }),
        email: Schema.string({ required: true })
      }
    };

    mockRequest.body = { name: 'John' };

    const middleware = validate(schema);

    // Act
    middleware(mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    // Assert
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation error',
        errors: expect.objectContaining({
          body: expect.any(Object)
        })
      })
    );
  });

  test('should validate query parameters', () => {
    // Arrange
    const schema = {
      query: {
        page: Schema.number({ required: false, min: 1, default: 1 }),
        limit: Schema.number({ required: false, min: 1, max: 100, default: 10 })
      }
    };

    mockRequest.query = { page: '2', limit: '20' };

    const middleware = validate(schema);

    // Act
    middleware(mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.validatedQuery).toEqual({ page: 2, limit: 20 });
  });

  test('should validate path parameters', () => {
    // Arrange
    const schema = {
      params: {
        id: Schema.string({ required: true, pattern: /^[0-9a-f]{24}$/ })
      }
    };

    mockRequest.params = { id: '507f1f77bcf86cd799439011' };

    const middleware = validate(schema);

    // Act
    middleware(mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.validatedParams).toEqual({ id: '507f1f77bcf86cd799439011' });
  });

  test('should validate array fields', () => {
    // Arrange
    const schema = {
      body: {
        tags: Schema.array(Schema.string({ min: 2 }), { required: true, min: 1 })
      }
    };

    mockRequest.body = { tags: ['javascript', 'typescript', 'node'] };

    const middleware = validate(schema);

    // Act
    middleware(mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.validatedBody).toEqual({ tags: ['javascript', 'typescript', 'node'] });
  });

  test('should validate nested objects', () => {
    // Arrange
    const schema = {
      body: {
        user: Schema.object({
          name: Schema.string({ required: true }),
          address: Schema.object({
            street: Schema.string({ required: true }),
            city: Schema.string({ required: true })
          }, { required: true })
        }, { required: true })
      }
    };

    mockRequest.body = {
      user: {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'New York'
        }
      }
    };

    const middleware = validate(schema);

    // Act
    middleware(mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.validatedBody).toEqual({
      user: {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'New York'
        }
      }
    });
  });

  test('should fail validation for enum field with invalid value', () => {
    // Arrange
    const schema = {
      body: {
        role: Schema.string({ required: true, enum: ['admin', 'user', 'guest'] as const })
      }
    };

    mockRequest.body = { role: 'superuser' };

    const middleware = validate(schema);

    // Act
    middleware(mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    // Assert
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation error',
        errors: expect.objectContaining({
          body: expect.any(Object)
        })
      })
    );
  });
});