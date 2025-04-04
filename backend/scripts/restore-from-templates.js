#!/usr/bin/env node

/**
 * Restore From Templates
 * 
 * This script helps rebuild severely corrupted files that couldn't be restored
 * from backups by using templates and patterns from similar files.
 * 
 * Usage:
 *   node scripts/restore-from-templates.js [--module=<moduleName>] [--dry-run]
 * 
 * Options:
 *   --module     Target specific module to restore (e.g., ai-cs-agent)
 *   --dry-run    Don't make actual changes, just show what would be done
 *   --verbose    Show detailed logs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  module: args.find(arg => arg.startsWith('--module='))?.split('=')[1],
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose')
};

// Stats tracking
const stats = {
  filesIdentified: 0,
  filesRestored: 0,
  filesFailed: 0
};

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Logging utility
const log = {
  info: (message) => console.log(`${colors.blue}ℹ️ ${message}${colors.reset}`),
  success: (message) => console.log(`${colors.green}✅ ${message}${colors.reset}`),
  warning: (message) => console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`),
  error: (message) => console.log(`${colors.red}❌ ${message}${colors.reset}`),
  detail: (message) => {
    if (options.verbose) {
      console.log(`   ${message}`);
    }
  }
};

/**
 * Check if a file is corrupted based on specific patterns
 */
function isFileCorrupted(content) {
  const corruptionPatterns = [
    /import[^;]*?from\s+['"]\s+['"][^;]*?;/,       // Import with spaces in path
    /:\s*Request\s*:\s*Response\s*:/,               // Multiple colons in type definitions
    /=\s*:\s*/,                                     // Equals followed by colon
    /let\s+\w+\s*:\s*\w+\s*=\s*;/,                  // Variable declaration ending with =;
    /await\s*=\s*true\s*:/,                         // await = true:
    /\w+\s*=\s*\.[\w\.]+/,                          // Property access missing object
    /String\s*:\s*String/,                          // String: String pattern
    /type\s+\w+\s*=\s*\w+\s*:\s*{/                  // Malformed type declaration
  ];
  
  return corruptionPatterns.some(pattern => pattern.test(content));
}

/**
 * Find corrupted files in a module
 */
function findCorruptedFiles(modulePath) {
  try {
    log.info(`Finding corrupted files in ${modulePath}`);
    
    // Get all TypeScript files in the module
    const command = `find ${modulePath} -type f -name "*.ts" -not -path "*/node_modules/*"`;
    const files = execSync(command, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    log.info(`Found ${files.length} TypeScript files to check`);
    
    // Check each file for corruption
    const corruptedFiles = [];
    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (isFileCorrupted(content)) {
          corruptedFiles.push(filePath);
          log.detail(`Corrupted file: ${filePath}`);
        }
      } catch (error) {
        log.error(`Error reading ${filePath}: ${error.message}`);
      }
    }
    
    log.info(`Identified ${corruptedFiles.length} corrupted files`);
    stats.filesIdentified = corruptedFiles.length;
    return corruptedFiles;
  } catch (error) {
    log.error(`Error finding corrupted files: ${error.message}`);
    return [];
  }
}

/**
 * Create a templated file based on the file type and location
 */
function createTemplateFile(filePath) {
  // Extract file components
  const baseName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  const fileType = getFileType(filePath);
  
  log.info(`Creating template for ${fileType} file: ${baseName}`);
  
  // Create the appropriate template based on file type
  let template = '';
  
  switch (fileType) {
    case 'route':
      template = createRouteTemplate(baseName, dirName);
      break;
    case 'controller':
      template = createControllerTemplate(baseName, dirName);
      break;
    case 'service':
      template = createServiceTemplate(baseName, dirName);
      break;
    case 'model':
      template = createModelTemplate(baseName, dirName);
      break;
    case 'repository':
      template = createRepositoryTemplate(baseName, dirName);
      break;
    case 'index':
      template = createModuleIndexTemplate(dirName);
      break;
    default:
      template = createGenericTemplate(baseName, dirName);
      break;
  }
  
  if (!template) {
    log.error(`Failed to create template for ${filePath}`);
    stats.filesFailed++;
    return false;
  }
  
  // Write the template to the file
  if (options.dryRun) {
    log.warning(`Would write template to ${filePath} (dry run)`);
    log.detail(`Template content sample: ${template.substring(0, 100)}...`);
    stats.filesRestored++;
    return true;
  }
  
  try {
    // Save original as corrupted version
    const corruptedBackupPath = `${filePath}.corrupted-${Date.now()}`;
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, corruptedBackupPath);
      log.detail(`Saved corrupted version to ${corruptedBackupPath}`);
    }
    
    // Write the template
    fs.writeFileSync(filePath, template, 'utf8');
    log.success(`Restored ${filePath} with template`);
    stats.filesRestored++;
    return true;
  } catch (error) {
    log.error(`Failed to write template to ${filePath}: ${error.message}`);
    stats.filesFailed++;
    return false;
  }
}

/**
 * Determine the file type based on path and name
 */
function getFileType(filePath) {
  const baseName = path.basename(filePath);
  
  if (baseName === 'index.ts') {
    return 'index';
  }
  if (baseName.includes('.routes.')) {
    return 'route';
  }
  if (baseName.includes('.controller.')) {
    return 'controller';
  }
  if (baseName.includes('.service.')) {
    return 'service';
  }
  if (baseName.includes('.model.') || baseName.includes('.schema.')) {
    return 'model';
  }
  if (baseName.includes('.repository.')) {
    return 'repository';
  }
  
  return 'generic';
}

/**
 * Extract module name from file path
 */
function getModuleName(dirPath) {
  const parts = dirPath.split('/');
  const moduleIndex = parts.findIndex(part => part === 'modules');
  if (moduleIndex !== -1 && parts.length > moduleIndex + 1) {
    return parts[moduleIndex + 1];
  }
  return 'unknown';
}

/**
 * Create a route template
 */
function createRouteTemplate(fileName, dirPath) {
  const moduleName = getModuleName(dirPath);
  const routeName = fileName.replace('.routes.ts', '');
  
  return `import { Router } from 'express';
import { ${routeName.charAt(0).toUpperCase() + routeName.slice(1)}Controller } from '../controllers/${routeName}.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();
const controller = new ${routeName.charAt(0).toUpperCase() + routeName.slice(1)}Controller();

/**
 * @swagger
 * /api/${moduleName}/${routeName}:
 *   get:
 *     tags:
 *       - ${moduleName}
 *     summary: Get ${routeName} data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authMiddleware, (req, res, next) => controller.getAll(req, res, next));

/**
 * @swagger
 * /api/${moduleName}/${routeName}/{id}:
 *   get:
 *     tags:
 *       - ${moduleName}
 *     summary: Get ${routeName} by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', authMiddleware, (req, res, next) => controller.getById(req, res, next));

export default router;
`;
}

/**
 * Create a controller template
 */
function createControllerTemplate(fileName, dirPath) {
  const moduleName = getModuleName(dirPath);
  const controllerName = fileName.replace('.controller.ts', '');
  const serviceName = controllerName + 'Service';
  
  return `import { Request, Response, NextFunction } from 'express';
import { ${controllerName.charAt(0).toUpperCase() + controllerName.slice(1)}Service } from '../services/${controllerName}.service';

// Authenticated request type
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
};

/**
 * Controller for ${controllerName} operations
 */
export class ${controllerName.charAt(0).toUpperCase() + controllerName.slice(1)}Controller {
  private ${serviceName} = new ${controllerName.charAt(0).toUpperCase() + controllerName.slice(1)}Service();

  /**
   * Get all ${controllerName} records
   */
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      
      // Add pagination and sorting
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Get data from service
      const result = await this.${serviceName}.getAll(userId, organizationId, limit, offset);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get ${controllerName} by ID
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const itemId = req.params.id;
      
      // Get data from service
      const result = await this.${serviceName}.getById(itemId, userId, organizationId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
`;
}

/**
 * Create a service template
 */
function createServiceTemplate(fileName, dirPath) {
  const moduleName = getModuleName(dirPath);
  const serviceName = fileName.replace('.service.ts', '');
  const modelName = serviceName.includes('-') ? 
    serviceName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') : 
    serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  
  return `import * as mongoose from 'mongoose';
import { ApiError } from '../../../middleware/error.middleware';

/**
 * Service for ${serviceName} operations
 */
export class ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Service {
  /**
   * Get all ${serviceName} records
   */
  async getAll(userId: string, organizationId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    try {
      // Implementation placeholder
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, \`Error getting ${serviceName} records: \${errorMessage}\`);
    }
  }

  /**
   * Get ${serviceName} by ID
   */
  async getById(id: string, userId: string, organizationId: string): Promise<any> {
    try {
      // Implementation placeholder
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, \`Error getting ${serviceName} by ID: \${errorMessage}\`);
    }
  }
}
`;
}

/**
 * Create a model template
 */
function createModelTemplate(fileName, dirPath) {
  const modelName = fileName.replace('.model.ts', '').replace('.schema.ts', '');
  const schemaName = modelName + 'Schema';
  const interfaceName = 'I' + modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const documentName = interfaceName + 'Document';
  
  return `import * as mongoose from 'mongoose';
import { Document, Model, Schema } from 'mongoose';

/**
 * ${modelName} interface
 */
export interface ${interfaceName} {
  name?: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
}

/**
 * ${modelName} document interface
 */
export interface ${documentName} extends ${interfaceName}, Document {
  // Add document methods here
}

/**
 * ${modelName} schema
 */
const ${schemaName} = new Schema<${documentName}>(
  {
    name: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * ${modelName} model
 */
const ${modelName.charAt(0).toUpperCase() + modelName.slice(1)} = mongoose.model<${documentName}>(
  '${modelName.charAt(0).toUpperCase() + modelName.slice(1)}',
  ${schemaName}
);

export default ${modelName.charAt(0).toUpperCase() + modelName.slice(1)};
`;
}

/**
 * Create a repository template
 */
function createRepositoryTemplate(fileName, dirPath) {
  const repoName = fileName.replace('.repository.ts', '');
  const modelName = repoName.charAt(0).toUpperCase() + repoName.slice(1);
  
  return `import * as mongoose from 'mongoose';
import { ApiError } from '../../../middleware/error.middleware';

/**
 * Repository for ${repoName} operations
 */
export class ${repoName.charAt(0).toUpperCase() + repoName.slice(1)}Repository {
  /**
   * Find all ${repoName} records
   */
  async findAll(organizationId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    try {
      // Implementation placeholder
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, \`Error finding ${repoName} records: \${errorMessage}\`);
    }
  }

  /**
   * Find ${repoName} by ID
   */
  async findById(id: string, organizationId: string): Promise<any> {
    try {
      // Implementation placeholder
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, \`Error finding ${repoName} by ID: \${errorMessage}\`);
    }
  }

  /**
   * Create ${repoName}
   */
  async create(data: any, organizationId: string, userId: string): Promise<any> {
    try {
      // Implementation placeholder
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, \`Error creating ${repoName}: \${errorMessage}\`);
    }
  }

  /**
   * Update ${repoName}
   */
  async update(id: string, data: any, organizationId: string): Promise<any> {
    try {
      // Implementation placeholder
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, \`Error updating ${repoName}: \${errorMessage}\`);
    }
  }

  /**
   * Delete ${repoName}
   */
  async delete(id: string, organizationId: string): Promise<boolean> {
    try {
      // Implementation placeholder
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, \`Error deleting ${repoName}: \${errorMessage}\`);
    }
  }
}
`;
}

/**
 * Create a module index template
 */
function createModuleIndexTemplate(dirPath) {
  const moduleName = getModuleName(dirPath);
  
  return `/**
 * ${moduleName} module index
 * Exports all controllers, routes, and services from the module
 */

// Import routes
import ${moduleName}Routes from './routes/${moduleName}.routes';

// Export for use in app.ts
export default {
  routes: {
    path: '/${moduleName}',
    router: ${moduleName}Routes
  }
};
`;
}

/**
 * Create a generic template for other file types
 */
function createGenericTemplate(fileName, dirPath) {
  const moduleName = getModuleName(dirPath);
  const name = fileName.replace('.ts', '');
  
  return `/**
 * ${name} in ${moduleName} module
 * This is a placeholder implementation. Please replace with actual code.
 */

import { ApiError } from '../../../middleware/error.middleware';

/**
 * ${name} implementation
 */
export class ${name.charAt(0).toUpperCase() + name.slice(1)} {
  /**
   * Default method
   */
  async process(data: any): Promise<any> {
    try {
      // Implementation placeholder
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, \`Error in ${name}: \${errorMessage}\`);
    }
  }
}

export default ${name.charAt(0).toUpperCase() + name.slice(1)};
`;
}

/**
 * Process a module directory
 */
function processModule(moduleName) {
  const modulePath = path.join(process.cwd(), 'src', 'modules', moduleName);
  
  if (!fs.existsSync(modulePath)) {
    log.error(`Module path does not exist: ${modulePath}`);
    return;
  }
  
  log.info(`Processing module: ${moduleName}`);
  
  // Find corrupted files
  const corruptedFiles = findCorruptedFiles(modulePath);
  
  if (corruptedFiles.length === 0) {
    log.info(`No corrupted files found in ${moduleName} module`);
    return;
  }
  
  // Restore each corrupted file
  log.info(`Restoring ${corruptedFiles.length} corrupted files in ${moduleName} module`);
  
  for (const filePath of corruptedFiles) {
    createTemplateFile(filePath);
  }
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.bold}${colors.cyan}🔧 Restore From Templates${colors.reset}`);
  console.log(`${colors.cyan}========================\n${colors.reset}`);
  
  if (options.dryRun) {
    log.warning('Running in DRY RUN mode - no files will be modified');
  }
  
  // Process specific module if provided
  if (options.module) {
    processModule(options.module);
  } else {
    log.error('Please specify a module with --module=<moduleName>');
    console.log(`\nExample usage:`);
    console.log(`  node scripts/restore-from-templates.js --module=ai-cs-agent`);
    console.log(`  node scripts/restore-from-templates.js --module=ai-insights --dry-run`);
    return;
  }
  
  // Print summary
  console.log(`\n${colors.bold}${colors.cyan}=== Template Restoration Summary ===${colors.reset}`);
  console.log(`${colors.blue}Corrupted files identified: ${stats.filesIdentified}${colors.reset}`);
  
  if (options.dryRun) {
    console.log(`${colors.yellow}Files that would be restored: ${stats.filesRestored}${colors.reset}`);
  } else {
    console.log(`${colors.green}Files restored with templates: ${stats.filesRestored}${colors.reset}`);
  }
  
  console.log(`${colors.red}Files that failed: ${stats.filesFailed}${colors.reset}`);
  
  // Next steps
  console.log(`\n${colors.cyan}${colors.bold}Next steps:${colors.reset}`);
  if (options.dryRun) {
    console.log(`  1. Run without --dry-run to perform actual restoration: ${colors.yellow}node scripts/restore-from-templates.js --module=${options.module}${colors.reset}`);
  } else {
    console.log(`  1. Review and update the generated template files with actual implementations`);
    console.log(`  2. Run TypeScript check: ${colors.yellow}npx tsc --noEmit${colors.reset}`);
  }
}

// Run the script
main();