import { Request, Response, NextFunction } from 'express';
import Joi, { Schema as JoiSchema } from 'joi';
import { ApiError } from './error.middleware';
import { 
  ValidationRule, 
  ValidationRuleType, 
  RequestValidationSchema, 
  ValidatedRequest, 
  ValidationResult,
  ValidationMiddlewareOptions,
  DEFAULT_VALIDATION_OPTIONS,
  InferSchemaType
} from '../types/validation';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

/**
 * Convert a ValidationRule to a Joi schema
 * @param rule - The validation rule
 * @returns A Joi schema
 */
function ruleToJoiSchema(rule: ValidationRule): JoiSchema {
  let schema: JoiSchema;

  // Create base schema based on type
  switch (rule.type) {
    case 'string':
      schema = Joi.string();
      break;
    case 'number':
      schema = Joi.number();
      break;
    case 'boolean':
      schema = Joi.boolean();
      break;
    case 'object':
      schema = Joi.object();
      break;
    case 'array':
      schema = Joi.array();
      break;
    case 'date':
      schema = Joi.date();
      break;
    case 'any':
      schema = Joi.any();
      break;
    default:
      // Type assertion to handle potential future types
      const exhaustiveCheck: never = rule.type;
      schema = Joi.any();
  }

  // Apply constraints
  if (rule.required) {
    schema = schema.required();
  } else {
    schema = schema.optional();
  }

  if (rule.enum && ['string', 'number'].includes(rule.type)) {
    schema = schema.valid(...rule.enum);
  }

  if (rule.min !== undefined) {
    if (rule.type === 'string') {
      schema = schema.min(rule.min);
    } else if (rule.type === 'number') {
      schema = schema.min(rule.min);
    } else if (rule.type === 'array') {
      schema = schema.min(rule.min);
    }
  }

  if (rule.max !== undefined) {
    if (rule.type === 'string') {
      schema = schema.max(rule.max);
    } else if (rule.type === 'number') {
      schema = schema.max(rule.max);
    } else if (rule.type === 'array') {
      schema = schema.max(rule.max);
    }
  }

  if (rule.pattern && rule.type === 'string') {
    schema = schema.pattern(
      rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern)
    );
  }

  if (rule.default !== undefined) {
    schema = schema.default(rule.default);
  }

  // Handle nested schemas for arrays and objects
  if (rule.type === 'array' && rule.items) {
    schema = schema.items(ruleToJoiSchema(rule.items));
  }

  if (rule.type === 'object' && rule.properties) {
    const objSchema: Record<string, JoiSchema> = {};
    Object.entries(rule.properties).forEach(([key, propRule]) => {
      objSchema[key] = ruleToJoiSchema(propRule as ValidationRule);
    });
    schema = schema.keys(objSchema);
  }

  return schema;
}

/**
 * Convert a schema definition to a Joi schema
 * @param schema - The schema definition
 * @returns A Joi schema
 */
function schemaToJoi(schema: JoiSchema | Record<string, ValidationRule>): JoiSchema {
  if (Joi.isSchema(schema)) {
    return schema;
  }

  const joiSchema: Record<string, JoiSchema> = {};
  Object.entries(schema).forEach(([key, rule]) => {
    joiSchema[key] = ruleToJoiSchema(rule as ValidationRule);
  });

  return Joi.object(joiSchema);
}

/**
 * Validate data against a schema
 * @param data - The data to validate
 * @param schema - The schema to validate against
 * @param options - Validation options
 * @returns Validation result
 */
function validateData(
  data: any, 
  schema: JoiSchema | Record<string, ValidationRule>,
  options: ValidationMiddlewareOptions = DEFAULT_VALIDATION_OPTIONS
): ValidationResult {
  const joiSchema = schemaToJoi(schema);
  const joiOptions = {
    abortEarly: options.abortEarly,
    stripUnknown: options.stripUnknown,
    convert: options.convert,
    allowUnknown: options.allowUnknown
  };

  const { error, value } = joiSchema.validate(data, joiOptions);

  const result: ValidationResult = {
    errors: {},
    hasErrors: false,
    value
  };

  if (error) {
    result.hasErrors = true;
    error.details.forEach((detail) => {
      const path = detail.path.join('.');
      if (!result.errors[path]) {
        result.errors[path] = [];
      }
      result.errors[path].push(detail.message);
    });
  }

  return result;
}

/**
 * Type-safe validation middleware for request validation
 * 
 * @example
 * ```typescript
 * // Define your validation schema with type inference
 * const userCreateSchema = {
 *   body: {
 *     name: { type: 'string', required: true, min: 2 },
 *     email: { type: 'string', required: true, pattern: /^[^@]+@[^@]+\.[^@]+$/ },
 *     age: { type: 'number', required: false, min: 18 }
 *   }
 * };
 * 
 * // Type inference works with this interface helper
 * type UserCreateRequest = ValidatedRequest<
 *   InferSchemaType<typeof userCreateSchema.body>
 * >;
 * 
 * // Use in your route
 * router.post('/users', validate(userCreateSchema), (req: UserCreateRequest, res) => {
 *   // req.validatedBody is fully typed!
 *   const { name, email, age } = req.validatedBody;
 * });
 * ```
 * 
 * @param schema - The validation schema
 * @param options - Validation options
 * @returns Express middleware
 */
export function validate(
  schema: RequestValidationSchema,
  options: ValidationMiddlewareOptions = DEFAULT_VALIDATION_OPTIONS
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Cast to ValidatedRequest to attach type-safe validated properties
      const validatedReq = req as ValidatedRequest;
      
      // Collect validation errors
      const errors: Record<string, Record<string, string[]>> = {};
      let hasErrors = false;

      // Validate request body
      if (schema.body && Object.keys(req.body || {}).length > 0) {
        const bodyResult = validateData(req.body, schema.body, options);
        if (bodyResult.hasErrors) {
          errors.body = bodyResult.errors;
          hasErrors = true;
        } else {
          // Attach validated body to request
          validatedReq.validatedBody = bodyResult.value;
        }
      }

      // Validate query parameters
      if (schema.query && Object.keys(req.query || {}).length > 0) {
        const queryResult = validateData(req.query, schema.query, options);
        if (queryResult.hasErrors) {
          errors.query = queryResult.errors;
          hasErrors = true;
        } else {
          // Attach validated query to request
          validatedReq.validatedQuery = queryResult.value;
        }
      }

      // Validate path parameters
      if (schema.params && Object.keys(req.params || {}).length > 0) {
        const paramsResult = validateData(req.params, schema.params, options);
        if (paramsResult.hasErrors) {
          errors.params = paramsResult.errors;
          hasErrors = true;
        } else {
          // Attach validated params to request
          validatedReq.validatedParams = paramsResult.value;
        }
      }

      // Validate headers
      if (schema.headers) {
        const headersResult = validateData(req.headers, schema.headers, options);
        if (headersResult.hasErrors) {
          errors.headers = headersResult.errors;
          hasErrors = true;
        } else {
          // Attach validated headers to request
          validatedReq.validatedHeaders = headersResult.value;
        }
      }

      // Validate cookies
      if (schema.cookies && req.cookies) {
        const cookiesResult = validateData(req.cookies, schema.cookies, options);
        if (cookiesResult.hasErrors) {
          errors.cookies = cookiesResult.errors;
          hasErrors = true;
        } else {
          // Attach validated cookies to request
          validatedReq.validatedCookies = cookiesResult.value;
        }
      }

      // If there are validation errors, return 400 Bad Request
      if (hasErrors) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      // If validation passes, proceed to the next middleware
      next();
    } catch (error) {
      // If any unexpected error occurs during validation, pass it to the error handler
      next(new ApiError(500, 'Validation internal error'));
    }
  };
}

/**
 * Create a validation schema builder for improved type safety
 * @returns Schema builder
 */
export function createSchemaBuilder() {
  return {
    /**
     * Create a string validation rule
     */
    string(options: Omit<ValidationRule<string>, 'type'> = {}): ValidationRule<string> {
      return { type: 'string', ...options };
    },

    /**
     * Create a number validation rule
     */
    number(options: Omit<ValidationRule<number>, 'type'> = {}): ValidationRule<number> {
      return { type: 'number', ...options };
    },

    /**
     * Create a boolean validation rule
     */
    boolean(options: Omit<ValidationRule<boolean>, 'type'> = {}): ValidationRule<boolean> {
      return { type: 'boolean', ...options };
    },

    /**
     * Create an object validation rule
     */
    object<T extends Record<string, ValidationRule>>(
      properties?: T,
      options: Omit<ValidationRule<InferSchemaType<T>>, 'type' | 'properties'> = {}
    ): ValidationRule<InferSchemaType<T>> {
      return { 
        type: 'object', 
        properties, 
        ...options 
      };
    },

    /**
     * Create an array validation rule
     */
    array<T extends ValidationRule>(
      items?: T,
      options: Omit<ValidationRule<InferSchemaType<T>[]>, 'type' | 'items'> = {}
    ): ValidationRule<InferSchemaType<T>[]> {
      return { 
        type: 'array', 
        items, 
        ...options 
      };
    },

    /**
     * Create a date validation rule
     */
    date(options: Omit<ValidationRule<Date>, 'type'> = {}): ValidationRule<Date> {
      return { type: 'date', ...options };
    },

    /**
     * Create a validation rule for any type
     */
    any(options: Omit<ValidationRule<any>, 'type'> = {}): ValidationRule<any> {
      return { type: 'any', ...options };
    }
  };
}

/**
 * Create a pre-configured schema builder
 */
export const Schema = createSchemaBuilder();

/**
 * Legacy validation middleware for backward compatibility
 * @deprecated Use validate instead
 */
export function validationMiddleware(schema: RequestValidationSchema) {
  return validate(schema);
}

/**
 * Legacy validation function for backward compatibility
 * @deprecated Use validate instead
 */
export function validateRequest(schema: any) {
  return validate(schema);
}