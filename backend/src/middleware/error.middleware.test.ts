import { Request, Response, NextFunction } from 'express';
import { ApiError, notFound, errorHandler } from './error.middleware';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

// Mock Express request, response, and next function
const mockRequest = () => {
  return {
    originalUrl: '/test/url',
  } as Request;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('Error Middleware', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('ApiError', () => {
    it('should create an ApiError with the correct properties', () => {
      const statusCode = 404;
      const message = 'Not Found';
      const errors = { field: ['Field is required'] };
      
      const error = new ApiError(statusCode, message, errors);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(message);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ApiError');
      expect(error.stack).toBeDefined();
    });
  });
  
  describe('notFound', () => {
    it('should create a 404 error and pass it to next', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      notFound(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      
      const error = mockNext.mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not Found - /test/url');
    });
  });
  
  describe('errorHandler', () => {
    it('should handle ApiError correctly', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ApiError(400, 'Bad Request', { field: ['Invalid field'] });
      
      errorHandler(error, req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Bad Request',
        errors: { field: ['Invalid field'] },
        stack: expect.any(String),
      });
    });
    
    it('should handle regular Error correctly', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Something went wrong');
      
      errorHandler(error, req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong',
        errors: undefined,
        stack: expect.any(String),
      });
    });
    
    it('should hide stack trace in production', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Something went wrong');
      
      errorHandler(error, req, res, mockNext);
      
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong',
        errors: undefined,
        stack: undefined,
      });
      
      // Restore environment
      process.env.NODE_ENV = originalNodeEnv;
    });
    
    it('should handle mongoose validation errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      // Create error similar to mongoose validation error
      const validationError = new Error('Validation failed: Path `email` is required, Path `password` is too short');
      validationError.name = 'ValidationError';
      
      errorHandler(validationError, req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      
      // Get the actual call arguments
      const callArg = res.json.mock.calls[0][0];
      
      // Test that the result has the right structure
      expect(callArg.success).toBe(false);
      expect(callArg.message).toBe('Validation Error');
      expect(callArg.errors).toBeDefined();
      expect(callArg.stack).toBeDefined();
      
      // Check that the errors object contains our fields
      expect(Object.keys(callArg.errors).includes('email')).toBe(true);
    });
    
    it('should handle MongoDB duplicate key errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      // Create error similar to MongoDB duplicate key error
      const duplicateError = new Error('E11000 duplicate key error');
      duplicateError.name = 'MongoServerError';
      
      // Add properties that would be on a real Mongo error
      Object.assign(duplicateError, {
        code: 11000,
        keyValue: { email: 'test@example.com' },
      });
      
      errorHandler(duplicateError as any, req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Duplicate Key Error',
        errors: {
          email: ['email already exists'],
        },
        stack: expect.any(String),
      });
    });
  });
});