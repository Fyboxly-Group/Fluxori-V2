#!/usr/bin/env node

/**
 * Module Generator
 * 
 * This script generates a new module with all necessary files based on templates.
 * It handles the following:
 * - Creates the module directory structure
 * - Generates model, controller, service, schema and routes files
 * - Replaces placeholders with actual entity names
 * 
 * Usage: 
 * node scripts/generate-module.js --name=EntityName
 * 
 * Example:
 * node scripts/generate-module.js --name=Product
 * 
 * This will generate:
 * - src/modules/products/models/product.model.ts
 * - src/modules/products/controllers/product.controller.ts
 * - src/modules/products/services/product.service.ts
 * - src/modules/products/schemas/product.schema.ts
 * - src/modules/products/routes/product.routes.ts
 * - src/modules/products/index.ts
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const nameArg = args.find(arg => arg.startsWith('--name='));

if (!nameArg) {
  console.error('\x1b[31mError: Please provide an entity name with --name=EntityName\x1b[0m');
  console.log('Example: node scripts/generate-module.js --name=Product');
  process.exit(1);
}

// Get entity name and prepare variations
const entityName = nameArg.split('=')[1];
const entityNameLower = entityName.toLowerCase();
const entityNamePlural = entityNameLower + 's';

console.log(`\x1b[36mGenerating module for entity: ${entityName}\x1b[0m`);

// Define paths
const srcPath = path.join(process.cwd(), 'src');
const modulesPath = path.join(srcPath, 'modules');
const modulePath = path.join(modulesPath, entityNamePlural);
const templatesPath = path.join(process.cwd(), 'templates');

// Create module directory structure
const directories = [
  modulePath,
  path.join(modulePath, 'models'),
  path.join(modulePath, 'controllers'),
  path.join(modulePath, 'services'),
  path.join(modulePath, 'schemas'),
  path.join(modulePath, 'routes'),
  path.join(modulePath, 'tests')
];

// Create directories
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`\x1b[32mCreated directory: ${dir}\x1b[0m`);
  }
});

// Template file mappings
const templates = [
  {
    source: path.join(templatesPath, 'model.template.ts'),
    destination: path.join(modulePath, 'models', `${entityNameLower}.model.ts`),
    type: 'model'
  },
  {
    source: path.join(templatesPath, 'controller.template.ts'),
    destination: path.join(modulePath, 'controllers', `${entityNameLower}.controller.ts`),
    type: 'controller'
  },
  {
    source: path.join(templatesPath, 'service.template.ts'),
    destination: path.join(modulePath, 'services', `${entityNameLower}.service.ts`),
    type: 'service'
  },
  {
    source: path.join(templatesPath, 'schema.template.ts'),
    destination: path.join(modulePath, 'schemas', `${entityNameLower}.schema.ts`),
    type: 'schema'
  },
  {
    source: path.join(templatesPath, 'route.template.ts'),
    destination: path.join(modulePath, 'routes', `${entityNameLower}.routes.ts`),
    type: 'route'
  }
];

// Generate module index file
const indexTemplate = `import { Router } from 'express';
import ${entityNameLower}Routes from './routes/${entityNameLower}.routes';

/**
 * ${entityName} module
 */
export default {
  routes: {
    path: '/${entityNamePlural}',
    router: ${entityNameLower}Routes
  }
};
`;

fs.writeFileSync(path.join(modulePath, 'index.ts'), indexTemplate);
console.log(`\x1b[32mCreated module index: ${path.join(modulePath, 'index.ts')}\x1b[0m`);

// Process each template
templates.forEach(template => {
  try {
    // Read template file
    let content = fs.readFileSync(template.source, 'utf8');
    
    // Replace placeholders
    content = content.replace(/\{\{EntityName\}\}/g, entityName);
    content = content.replace(/\{\{entityName\}\}/g, entityNameLower);
    content = content.replace(/\{\{entityNamePlural\}\}/g, entityNamePlural);
    
    // Write to destination
    fs.writeFileSync(template.destination, content);
    console.log(`\x1b[32mCreated ${template.type}: ${template.destination}\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31mError generating ${template.type}: ${error.message}\x1b[0m`);
  }
});

// Create basic test file
const testTemplate = `import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ${entityName}Service } from '../services/${entityNameLower}.service';
import ${entityName} from '../models/${entityNameLower}.model';

// Mock the model
jest.mock('../models/${entityNameLower}.model');

describe('${entityName}Service', () => {
  let service;
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ${entityName}Service(mockLogger);
  });

  describe('getAll', () => {
    it('should return a list of ${entityNameLower}s with pagination', async () => {
      // Arrange
      const organizationId = '60d21b4667d0d8992e610c85';
      const mockItems = [{ name: 'Test ${entityName}' }];
      const mockCount = 1;
      
      ${entityName}.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockItems)
      });
      
      ${entityName}.countDocuments = jest.fn().mockResolvedValue(mockCount);
      
      // Act
      const result = await service.getAll(organizationId);
      
      // Assert
      expect(result.items).toEqual(mockItems);
      expect(result.total).toEqual(mockCount);
      expect(${entityName}.find).toHaveBeenCalledWith(expect.objectContaining({
        organizationId: expect.anything()
      }));
    });
  });
});
`;

fs.writeFileSync(path.join(modulePath, 'tests', `${entityNameLower}.service.test.ts`), testTemplate);
console.log(`\x1b[32mCreated service test: ${path.join(modulePath, 'tests', `${entityNameLower}.service.test.ts`)}\x1b[0m`);

console.log(`\x1b[36m\nModule generation complete!\x1b[0m`);
console.log(`\x1b[36m${entityName} module is available at: ${modulePath}\x1b[0m`);
console.log('\x1b[36mNext steps:\x1b[0m');
console.log('1. Update the model properties to match your entity requirements');
console.log('2. Register the module in src/app.ts');
console.log('3. Register the service in the DI container');
console.log('4. Add the entity to the Swagger definitions');
console.log(`5. Run tests: npm test -- ${entityNamePlural}`);