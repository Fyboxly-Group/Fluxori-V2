/**
 * Validation middleware for Express with Joi and TypeScript
 */
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../types/error.types';

/**
 * Schema map for different validation locations
 */
export interface IValidationSchemaMap {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
  headers?: Joi.Schema;
  cookies?: Joi.Schema;
}

/**
 * Validation options
 */
export interface IValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

/**
 * Default validation options
 */
const DEFAULT_VALIDATION_OPTIONS: IValidationOptions = {
  abortEarly: false,
  stripUnknown: true,
  allowUnknown: true,
};

/**
 * Creates validation middleware for the specified schema
 * @param schema - Joi schema or schema map
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validationMiddleware(
  schema: Joi.Schema | IValidationSchemaMap,
  options: IValidationOptions = DEFAULT_VALIDATION_OPTIONS
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine what to validate based on schema type
    const schemaMap = schema as IValidationSchemaMap;
    const isSchemaMap = !schema.validate && typeof schema === 'object';
    
    if (isSchemaMap) {
      // Validate each property with its schema
      const errors: Joi.ValidationError[] = [];
      
      // Validate body
      if (schemaMap.body) {
        const { error, value } = schemaMap.body.validate(req.body, options);
        if (error) errors.push(error);
        else req.body = value;
      }
      
      // Validate query
      if (schemaMap.query) {
        const { error, value } = schemaMap.query.validate(req.query, options);
        if (error) errors.push(error);
        else req.query = value;
      }
      
      // Validate params
      if (schemaMap.params) {
        const { error, value } = schemaMap.params.validate(req.params, options);
        if (error) errors.push(error);
        else req.params = value;
      }
      
      // Validate headers
      if (schemaMap.headers) {
        const { error, value } = schemaMap.headers.validate(req.headers, options);
        if (error) errors.push(error);
        // Headers are read-only, so we don't replace them
      }
      
      // Validate cookies
      if (schemaMap.cookies) {
        const { error } = schemaMap.cookies.validate(req.cookies, options);
        if (error) errors.push(error);
        // Cookies are managed differently, so we don't replace them
      }
      
      // If any validation failed, return first error
      if (errors.length > 0) {
        const validationError = new ValidationError(
          'Validation failed',
          formatJoiErrors(errors)
        );
        return next(validationError);
      }
    } else {
      // Assume schema is for request body
      const joiSchema = schema as Joi.Schema;
      const { error, value } = joiSchema.validate(req.body, options);
      
      if (error) {
        const validationError = new ValidationError(
          'Validation failed',
          formatJoiErrors([error])
        );
        return next(validationError);
      }
      
      // Replace request body with validated value
      req.body = value;
    }
    
    return next();
  };
}

/**
 * Formats Joi errors into a clearer structure
 * @param errors - Joi validation errors
 * @returns Formatted error object
 */
function formatJoiErrors(errors: Joi.ValidationError[]): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};
  
  errors.forEach(error => {
    error.details.forEach(detail => {
      const key = detail.path.join('.');
      
      if (!formattedErrors[key]) {
        formattedErrors[key] = [];
      }
      
      formattedErrors[key].push(detail.message);
    });
  });
  
  return formattedErrors;
}