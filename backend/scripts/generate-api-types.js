#!/usr/bin/env node

/**
 * API Response Type Generator
 * 
 * Generates TypeScript types for consistent API responses based on the
 * controllers in the codebase. This ensures that all API responses follow
 * a standard format and have proper typing.
 * 
 * Usage:
 * ```
 * node scripts/generate-api-types.js
 * ```
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Base types to be generated
const baseTypes = `
/**
 * Standard API success response with generic data type
 */
export interface IApiResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: IApiMeta;
}

/**
 * Standard API error response
 */
export interface IApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  statusCode?: number;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = any> = IApiResponse<T> | IApiErrorResponse;

/**
 * Metadata for paginated responses
 */
export interface IApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}

/**
 * Pagination options for API requests
 */
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

/**
 * Standard paginated response
 */
export interface IPaginatedResponse<T = any> extends IApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Authentication response with token and user data
 */
export interface IAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    [key: string]: any;
  };
}
`;

// Extract controller names and response types from files
function extractControllerData() {
  console.log(chalk.blue('Analyzing controllers for response types...'));
  
  const controllerPatterns = [
    'src/controllers/*.ts',
    'src/modules/**/controllers/*.ts'
  ];
  
  let files = [];
  for (const pattern of controllerPatterns) {
    const matches = glob.sync(pattern, { cwd: process.cwd() });
    files = [...files, ...matches];
  }
  
  // Filter out test files
  files = files.filter(file => !file.includes('.test.ts'));
  
  console.log(chalk.blue(`Found ${files.length} controller files to analyze`));
  
  const controllers = [];
  
  // Process each controller file
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.basename(file, '.ts');
      
      // Extract controller name
      let controllerName = fileName.replace('.controller', '');
      controllerName = controllerName.charAt(0).toUpperCase() + controllerName.slice(1);
      
      // Extract response structures from json responses
      const responseRegex = /res\.status\(\d+\)\.json\(\s*{([^}]+)}\s*\)/g;
      const responseMatches = [...content.matchAll(responseRegex)];
      
      const responseFields = new Set();
      
      // Extract fields from each response
      for (const match of responseMatches) {
        const responseContent = match[1];
        const fieldsRegex = /(\w+):/g;
        let fieldMatch;
        
        while ((fieldMatch = fieldsRegex.exec(responseContent)) !== null) {
          responseFields.add(fieldMatch[1]);
        }
      }
      
      // Add controller information
      controllers.push({
        name: controllerName,
        fields: Array.from(responseFields),
        file
      });
      
    } catch (error) {
      console.error(chalk.red(`Error processing ${file}:`), error);
    }
  }
  
  return controllers;
}

// Generate response type for a specific controller
function generateControllerResponseType(controller) {
  // Skip if no fields found
  if (!controller.fields.length) {
    return null;
  }
  
  // Format the controller name for the type name
  const typeName = `I${controller.name}Response`;
  
  // Start the interface definition
  let typeDefinition = `/**\n * Response type for ${controller.name} API endpoints\n */\nexport interface ${typeName} {\n`;
  
  // Determine common fields vs. specialized fields
  const commonFields = ['success', 'data', 'message', 'meta', 'error', 'errors'];
  const specializedFields = controller.fields.filter(field => !commonFields.includes(field));
  
  // Add common fields with proper types
  if (controller.fields.includes('success')) {
    typeDefinition += '  success: boolean;\n';
  }
  
  if (controller.fields.includes('data')) {
    typeDefinition += '  data: any; // Replace with specific data type\n';
  }
  
  if (controller.fields.includes('message')) {
    typeDefinition += '  message?: string;\n';
  }
  
  if (controller.fields.includes('meta')) {
    typeDefinition += '  meta?: IApiMeta;\n';
  }
  
  if (controller.fields.includes('errors')) {
    typeDefinition += '  errors?: string[];\n';
  }
  
  // Add specialized fields
  for (const field of specializedFields) {
    typeDefinition += `  ${field}: any; // TODO: Replace with specific type\n`;
  }
  
  // Close the interface
  typeDefinition += '}\n\n';
  
  // Add a data interface if 'data' field exists
  if (controller.fields.includes('data')) {
    typeDefinition += `/**\n * Data type for ${controller.name} API responses\n */\nexport interface I${controller.name}Data {\n  // TODO: Add specific fields returned by ${controller.name} controller\n  id?: string;\n  [key: string]: any;\n}\n\n`;
    
    // Add a generic response type
    typeDefinition += `/**\n * Type-safe response for ${controller.name} API\n */\nexport type ${controller.name}ApiResponse = IApiResponse<I${controller.name}Data>;\n`;
  }
  
  return typeDefinition;
}

// Generate API response types file
function generateApiTypesFile(controllers) {
  console.log(chalk.blue('Generating API response types...'));
  
  // Create the types directory if it doesn't exist
  const typesDir = path.join(process.cwd(), 'src', 'types', 'api');
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  // Create base API response types
  const baseTypesPath = path.join(typesDir, 'responses.types.ts');
  fs.writeFileSync(baseTypesPath, baseTypes.trim());
  console.log(chalk.green(`Generated base API response types at ${baseTypesPath}`));
  
  // Generate controller-specific types
  for (const controller of controllers) {
    const typeDefinition = generateControllerResponseType(controller);
    
    if (typeDefinition) {
      const controllerTypePath = path.join(typesDir, `${controller.name.toLowerCase()}.types.ts`);
      
      // Add imports
      const typeFileContent = `import { IApiResponse, IApiMeta } from './responses.types';\n\n${typeDefinition}`;
      
      fs.writeFileSync(controllerTypePath, typeFileContent);
      console.log(chalk.green(`Generated ${controller.name} API types at ${controllerTypePath}`));
    }
  }
  
  // Create index.ts to export all types
  const indexPath = path.join(typesDir, 'index.ts');
  let indexContent = '// Generated API response types\n\n';
  indexContent += 'export * from \'./responses.types\';\n';
  
  for (const controller of controllers) {
    if (generateControllerResponseType(controller)) {
      indexContent += `export * from './${controller.name.toLowerCase()}.types';\n`;
    }
  }
  
  fs.writeFileSync(indexPath, indexContent);
  console.log(chalk.green(`Generated index.ts file for API type exports`));
}

// Main function
function main() {
  const controllers = extractControllerData();
  generateApiTypesFile(controllers);
  console.log(chalk.bold.green('\nAPI response types generation completed!'));
}

// Run the script
main();