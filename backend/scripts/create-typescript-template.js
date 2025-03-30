#!/usr/bin/env node

/**
 * TypeScript Template Generator
 * 
 * This script generates TypeScript templates for controllers, services, models,
 * middleware, and tests, following the project's best practices and type patterns.
 * 
 * Usage:
 * ```
 * node scripts/create-typescript-template.js --type=controller --name=user
 * node scripts/create-typescript-template.js --type=service --name=email
 * node scripts/create-typescript-template.js --type=model --name=product
 * node scripts/create-typescript-template.js --type=middleware --name=rateLimit
 * node scripts/create-typescript-template.js --type=test --name=auth --testType=controller
 * ```
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Templates for different file types
const templates = {
  controller: (name) => {
    const Name = name.charAt(0).toUpperCase() + name.slice(1);
    return `import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as ${Name}Service from '../services/${name}.service';
import { I${Name}, I${Name}Document } from '../types/models/${name}.types';
import { ApiResponse } from '../types/api';

/**
 * Get all ${name}s
 * @route GET /api/${name}s
 */
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ${name}s = await ${Name}Service.findAll();
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: ${name}s,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(new Error(\`Error retrieving ${name}s: \${errorMessage}\`));
  }
};

/**
 * Get ${name} by ID
 * @route GET /api/${name}s/:id
 */
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const ${name} = await ${Name}Service.findById(id);
    
    if (!${name}) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '${Name} not found',
      });
      return;
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: ${name},
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(new Error(\`Error retrieving ${name}: \${errorMessage}\`));
  }
};

/**
 * Create new ${name}
 * @route POST /api/${name}s
 */
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ${name}Data = req.body as I${Name};
    const new${Name} = await ${Name}Service.create(${name}Data);
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: new${Name},
      message: '${Name} created successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(new Error(\`Error creating ${name}: \${errorMessage}\`));
  }
};

/**
 * Update ${name}
 * @route PUT /api/${name}s/:id
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const ${name}Data = req.body;
    
    const updated${Name} = await ${Name}Service.update(id, ${name}Data);
    
    if (!updated${Name}) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '${Name} not found',
      });
      return;
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: updated${Name},
      message: '${Name} updated successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(new Error(\`Error updating ${name}: \${errorMessage}\`));
  }
};

/**
 * Delete ${name}
 * @route DELETE /api/${name}s/:id
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await ${Name}Service.remove(id);
    
    if (!deleted) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '${Name} not found',
      });
      return;
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: '${Name} deleted successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(new Error(\`Error deleting ${name}: \${errorMessage}\`));
  }
};
`;
  },
  
  service: (name) => {
    const Name = name.charAt(0).toUpperCase() + name.slice(1);
    return `import { Types } from 'mongoose';
import ${Name} from '../models/${name}.model';
import { I${Name}, I${Name}Document } from '../types/models/${name}.types';

/**
 * Find all ${name}s
 * @returns Promise resolving to array of ${name} documents
 */
export const findAll = async (): Promise<I${Name}Document[]> => {
  try {
    return await ${Name}.find().exec();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(\`Error finding ${name}s: \${errorMessage}\`);
  }
};

/**
 * Find ${name} by ID
 * @param id ${Name} ID
 * @returns Promise resolving to ${name} document or null if not found
 */
export const findById = async (id: string): Promise<I${Name}Document | null> => {
  try {
    return await ${Name}.findById(new Types.ObjectId(id)).exec();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(\`Error finding ${name} by ID: \${errorMessage}\`);
  }
};

/**
 * Create new ${name}
 * @param ${name}Data ${Name} data
 * @returns Promise resolving to created ${name} document
 */
export const create = async (${name}Data: I${Name}): Promise<I${Name}Document> => {
  try {
    const new${Name} = new ${Name}(${name}Data);
    return await new${Name}.save();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(\`Error creating ${name}: \${errorMessage}\`);
  }
};

/**
 * Update ${name}
 * @param id ${Name} ID
 * @param ${name}Data Updated ${name} data
 * @returns Promise resolving to updated ${name} document or null if not found
 */
export const update = async (
  id: string, 
  ${name}Data: Partial<I${Name}>
): Promise<I${Name}Document | null> => {
  try {
    return await ${Name}.findByIdAndUpdate(
      new Types.ObjectId(id),
      ${name}Data,
      { new: true }
    ).exec();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(\`Error updating ${name}: \${errorMessage}\`);
  }
};

/**
 * Delete ${name}
 * @param id ${Name} ID
 * @returns Promise resolving to true if deleted, false if not found
 */
export const remove = async (id: string): Promise<boolean> => {
  try {
    const result = await ${Name}.findByIdAndDelete(new Types.ObjectId(id)).exec();
    return !!result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(\`Error deleting ${name}: \${errorMessage}\`);
  }
};
`;
  },
  
  model: (name) => {
    const Name = name.charAt(0).toUpperCase() + name.slice(1);
    return `import * as mongoose from 'mongoose';
import { Schema, Document, Model } from 'mongoose';

// Interface for ${name} document
export interface I${Name} {
  // TODO: Define your model properties here
  name: string;
  description?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for ${name} document (includes Mongoose document methods)
export interface I${Name}Document extends I${Name}, Document {
  // Add document methods here if needed
}

// Interface for ${name} model with static methods
export interface ${Name}Model extends Model<I${Name}Document> {
  // Add static model methods here if needed
}

// Create the schema
const ${name}Schema = new Schema<I${Name}Document>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add methods to the schema if needed
// ${name}Schema.methods.someMethod = function(): string { ... };

// Add static methods to the schema if needed
// ${name}Schema.statics.someStaticMethod = function(): Promise<I${Name}Document[]> { ... };

// Create and export the model
const ${Name} = mongoose.model<I${Name}Document, ${Name}Model>('${Name}', ${name}Schema);

export default ${Name};
`;
  },
  
  middleware: (name) => {
    const Name = name.charAt(0).toUpperCase() + name.slice(1);
    return `import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * ${Name} middleware
 * @description ${Name} middleware description
 */
export const ${name}Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // TODO: Implement middleware logic here
    
    // Example: Check for required headers
    const requiredHeader = req.headers['x-required-header'];
    
    if (!requiredHeader) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Required header is missing',
      });
      return;
    }
    
    // Add data to request for use in controllers
    (req as any).${name}Data = {
      processedAt: new Date(),
      // Add more properties as needed
    };
    
    // Continue to the next middleware or controller
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    next(new Error(\`${Name} middleware error: \${errorMessage}\`));
  }
};

export default ${name}Middleware;
`;
  },
  
  controllerTest: (name) => {
    const Name = name.charAt(0).toUpperCase() + name.slice(1);
    return `import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as ${Name}Controller from '../controllers/${name}.controller';
import * as ${Name}Service from '../services/${name}.service';
import { I${Name} } from '../types/models/${name}.types';

// Mock the service
jest.mock('../services/${name}.service');

describe('${Name} Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    mockNext = jest.fn();
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all ${name}s', async () => {
      // Setup mock data
      const mock${Name}s = [
        { _id: 'id1', name: '${Name} 1' },
        { _id: 'id2', name: '${Name} 2' },
      ];
      
      // Setup mock implementation
      (${Name}Service.findAll as jest.Mock).mockResolvedValue(mock${Name}s);
      
      // Call the controller
      await ${Name}Controller.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mock${Name}s,
      });
    });

    it('should handle errors', async () => {
      // Setup error case
      const error = new Error('Database error');
      (${Name}Service.findAll as jest.Mock).mockRejectedValue(error);
      
      // Call the controller
      await ${Name}Controller.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getById', () => {
    it('should return a ${name} by id', async () => {
      // Setup mock data
      const ${name}Id = 'test-id';
      const mock${Name} = { _id: ${name}Id, name: 'Test ${Name}' };
      
      // Setup request params
      mockRequest.params = { id: ${name}Id };
      
      // Setup mock implementation
      (${Name}Service.findById as jest.Mock).mockResolvedValue(mock${Name});
      
      // Call the controller
      await ${Name}Controller.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mock${Name},
      });
    });

    // Add more tests for getById, create, update, remove
  });
});
`;
  },
  
  serviceTest: (name) => {
    const Name = name.charAt(0).toUpperCase() + name.slice(1);
    return `import mongoose from 'mongoose';
import * as ${Name}Service from '../services/${name}.service';
import ${Name} from '../models/${name}.model';
import { I${Name} } from '../types/models/${name}.types';

// Mock the model
jest.mock('../models/${name}.model');

describe('${Name} Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all ${name}s', async () => {
      // Setup mock data
      const mock${Name}s = [
        { _id: 'id1', name: '${Name} 1' },
        { _id: 'id2', name: '${Name} 2' },
      ];
      
      // Setup mock implementation
      (${Name}.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mock${Name}s),
      });
      
      // Call the service
      const result = await ${Name}Service.findAll();
      
      // Assertions
      expect(result).toEqual(mock${Name}s);
      expect(${Name}.find).toHaveBeenCalled();
    });
    
    it('should throw an error if database query fails', async () => {
      // Setup error case
      const error = new Error('Database error');
      (${Name}.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });
      
      // Call the service and expect it to throw
      await expect(${Name}Service.findAll()).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return a ${name} by id', async () => {
      // Setup mock data
      const ${name}Id = 'test-id';
      const mock${Name} = { _id: ${name}Id, name: 'Test ${Name}' };
      
      // Setup mock implementation
      (${Name}.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mock${Name}),
      });
      
      // Call the service
      const result = await ${Name}Service.findById(${name}Id);
      
      // Assertions
      expect(result).toEqual(mock${Name});
      expect(${Name}.findById).toHaveBeenCalledWith(expect.any(mongoose.Types.ObjectId));
    });
    
    // Add more tests for create, update, remove
  });
});
`;
  },
  
  routeTest: (name) => {
    const Name = name.charAt(0).toUpperCase() + name.slice(1);
    return `import * as request from 'supertest';
import { Express } from 'express';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as config from '../config';

// Import app but handle type issues
const app = require('../app').default;

// Mock user model for authentication if needed
jest.mock('../models/user.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue({
      _id: 'mockUserId',
      email: 'test@example.com',
      role: 'user',
    }),
  },
}));

// Mock the ${name} model
jest.mock('../models/${name}.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([
      {
        _id: 'mock${Name}Id',
        name: 'Test ${Name}',
        description: 'Test Description',
        active: true,
      },
    ]),
  },
}));

describe('${Name} Routes', () => {
  let authToken: string;
  
  beforeAll(() => {
    // Setup test user and authentication
    const userId = new mongoose.Types.ObjectId().toString();
    authToken = jwt.sign({ id: userId }, config.jwtSecret || 'test-secret', { expiresIn: '1d' });
  });
  
  describe('GET /api/${name}s', () => {
    it('should return list of ${name}s', async () => {
      const response = await request(app)
        .get('/api/${name}s')
        .set('Authorization', \`Bearer \${authToken}\`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should handle unauthenticated requests', async () => {
      const response = await request(app).get('/api/${name}s');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/${name}s/:id', () => {
    it('should return a ${name} by id', async () => {
      const ${name}Id = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .get(\`/api/${name}s/\${${name}Id}\`)
        .set('Authorization', \`Bearer \${authToken}\`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
  
  describe('POST /api/${name}s', () => {
    it('should create a new ${name}', async () => {
      const new${Name}Data = {
        name: 'New ${Name}',
        description: 'New Description',
        active: true,
      };
      
      const response = await request(app)
        .post('/api/${name}s')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(new${Name}Data);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
  
  // Add more tests for PUT, DELETE endpoints
});
`;
  },
};

// Get command line arguments
const args = process.argv.slice(2);
const typeArg = args.find(arg => arg.startsWith('--type='));
const nameArg = args.find(arg => arg.startsWith('--name='));
const testTypeArg = args.find(arg => arg.startsWith('--testType='));

// Parse arguments
const type = typeArg ? typeArg.split('=')[1] : null;
const name = nameArg ? nameArg.split('=')[1] : null;
const testType = testTypeArg ? testTypeArg.split('=')[1] : 'controller';

// Validate arguments
if (!type || !name) {
  console.error(chalk.red('Error: Missing required arguments'));
  console.log(chalk.yellow('Usage: node scripts/create-typescript-template.js --type=<type> --name=<name> [--testType=<testType>]'));
  console.log(chalk.yellow('Available types: controller, service, model, middleware, test'));
  process.exit(1);
}

// Determine template and output path
let template;
let outputPath;

switch (type) {
  case 'controller':
    template = templates.controller(name);
    outputPath = path.join(process.cwd(), 'src', 'controllers', `${name}.controller.ts`);
    break;
  case 'service':
    template = templates.service(name);
    outputPath = path.join(process.cwd(), 'src', 'services', `${name}.service.ts`);
    break;
  case 'model':
    template = templates.model(name);
    outputPath = path.join(process.cwd(), 'src', 'models', `${name}.model.ts`);
    break;
  case 'middleware':
    template = templates.middleware(name);
    outputPath = path.join(process.cwd(), 'src', 'middleware', `${name}.middleware.ts`);
    break;
  case 'test':
    // Handle different test types
    switch (testType) {
      case 'controller':
        template = templates.controllerTest(name);
        outputPath = path.join(process.cwd(), 'src', 'controllers', `${name}.controller.test.ts`);
        break;
      case 'service':
        template = templates.serviceTest(name);
        outputPath = path.join(process.cwd(), 'src', 'services', `${name}.service.test.ts`);
        break;
      case 'route':
        template = templates.routeTest(name);
        outputPath = path.join(process.cwd(), 'src', 'routes', `${name}.routes.test.ts`);
        break;
      default:
        console.error(chalk.red(`Error: Unknown test type: ${testType}`));
        console.log(chalk.yellow('Available test types: controller, service, route'));
        process.exit(1);
    }
    break;
  default:
    console.error(chalk.red(`Error: Unknown template type: ${type}`));
    console.log(chalk.yellow('Available types: controller, service, model, middleware, test'));
    process.exit(1);
}

// Create directory if it doesn't exist
const dirPath = path.dirname(outputPath);
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Check if file already exists
if (fs.existsSync(outputPath)) {
  console.error(chalk.red(`Error: File already exists: ${outputPath}`));
  process.exit(1);
}

// Write file
fs.writeFileSync(outputPath, template);
console.log(chalk.green(`✓ Created ${type} template at ${outputPath}`));

// If controller or service was created, suggest creating corresponding tests
if (type === 'controller' || type === 'service') {
  console.log(chalk.blue(`\nTip: Don't forget to create tests for your ${type}:`));
  console.log(chalk.blue(`node scripts/create-typescript-template.js --type=test --name=${name} --testType=${type}`));
}

// If model was created, suggest running the type generator
if (type === 'model') {
  console.log(chalk.blue('\nTip: Generate TypeScript interfaces for your model:'));
  console.log(chalk.blue('npm run generate:types'));
}