#!/usr/bin/env node

/**
 * TypeScript Error Fixer Script
 * 
 * This script automatically fixes common TypeScript errors in the backend codebase
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Helpers
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function log(message) {
  console.log(`[TS-Fixer] ${message}`);
}

// Specific fixers
function fixMultiTenantAuthMiddleware() {
  const filePath = path.join(srcDir, 'middleware', 'multi-tenant-auth.middleware.ts');
  log(`Fixing multi-tenant auth middleware: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = readFile(filePath);

  // Fix 1: Fix the namespace declaration to extend types instead of redefining
  content = content.replace(
    /declare global {\s*namespace Express {\s*interface Request {\s*user\?: MultiTenantUser;\s*}\s*}\s*}/g,
    `declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | MultiTenantUser;
    }
  }
}`
  );

  // Fix 2: Add toMillis and toDate to the Date type
  let dateFixAdded = false;
  if (!content.includes('interface DateWithFirestoreMethods extends Date')) {
    const interfaceDeclaration = `
// Helper interface to handle Firebase Timestamp methods
interface DateWithFirestoreMethods extends Date {
  toMillis(): number;
  toDate(): Date;
}`;

    // Add after imports
    const importsEndIndex = content.lastIndexOf('import');
    const importsEndLineIndex = content.indexOf('\n', importsEndIndex);
    
    if (importsEndLineIndex !== -1) {
      content = content.slice(0, importsEndLineIndex + 1) + 
                interfaceDeclaration + 
                content.slice(importsEndLineIndex + 1);
      dateFixAdded = true;
    }
  }
  
  // Fix 3: Update type references to use DateWithFirestoreMethods
  if (dateFixAdded) {
    content = content.replace(/Date \| Timestamp/g, 'DateWithFirestoreMethods | Timestamp');
  }
  
  // Fix 4: Fix the organizationId property in req.user assignment
  content = content.replace(
    /req\.user = {\s*id: userId,\s*email: user\.email,\s*firstName: user\.firstName,\s*lastName: user\.lastName,/g,
    `req.user = {
      id: userId,
      organizationId: organizationId, // Add the organizationId property
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,`
  );
  
  writeFile(filePath, content);
  log(`✅ Fixed multi-tenant auth middleware: ${filePath}`);
  return true;
}

function fixIdMissingInModels() {
  const modelsPaths = [
    path.join(srcDir, 'models', 'firestore', 'organization.schema.ts'),
    path.join(srcDir, 'models', 'firestore', 'role.schema.ts'),
    path.join(srcDir, 'models', 'firestore', 'user-organization.schema.ts'),
    path.join(srcDir, 'models', 'firestore', 'invitation.schema.ts'),
    path.join(srcDir, 'models', 'firestore', 'audit-log.schema.ts'),
    path.join(srcDir, 'models', 'firestore', 'resource-sharing.schema.ts')
  ];

  modelsPaths.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      log(`❌ File not found: ${filePath}`);
      return;
    }

    log(`Fixing model file: ${filePath}`);
    let content = readFile(filePath);
    
    // Extract interface names
    const interfaceMatches = content.match(/export interface I([a-zA-Z0-9_]+) {/g) || [];
    const interfaceNames = interfaceMatches.map(match => match.match(/I([a-zA-Z0-9_]+)/)[0]);
    
    // For each interface, create a WithId interface extending the base interface
    interfaceNames.forEach(interfaceName => {
      const withIdInterfaceName = `${interfaceName}WithId`;
      
      // Only add if not already defined
      if (!content.includes(`export interface ${withIdInterfaceName}`)) {
        // Find the last export in the file to add after it
        const lastExportIndex = content.lastIndexOf('export ');
        const lastExportEndIndex = content.indexOf('\n', lastExportIndex + content.substr(lastExportIndex).indexOf('}'));
        
        if (lastExportEndIndex !== -1) {
          const withIdInterface = `
export interface ${withIdInterfaceName} extends ${interfaceName} {
  id: string;
}`;
          content = content.slice(0, lastExportEndIndex + 1) + withIdInterface + content.slice(lastExportEndIndex + 1);
        }
      }
    });
    
    writeFile(filePath, content);
    log(`✅ Fixed model file: ${filePath}`);
  });
  
  return true;
}

function fixMembershipController() {
  const filePath = path.join(srcDir, 'modules', 'organizations', 'controllers', 'membership.controller.ts');
  
  if (!fs.existsSync(filePath)) {
    log(`❌ File not found: ${filePath}`);
    return false;
  }

  log(`Fixing membership controller: ${filePath}`);
  let content = readFile(filePath);
  
  // Get the existing class methods
  const existingMethodsMatch = content.match(/(\w+)\(.*?\).*?{/g) || [];
  const existingMethods = existingMethodsMatch.map(match => match.match(/(\w+)\(/)[1]);
  
  // Methods to check
  const methodsToCheck = [
    'getOrganizationUsers',
    'getUserMemberships',
    'getOrganizationInvitations',
    'cancelInvitation',
    'resendInvitation',
    'getUserMembershipDetails',
    'updateUserRoles',
    'updateUserCustomPermissions',
    'updateMembershipType',
    'removeUserFromOrganization',
    'leaveOrganization'
  ];
  
  const methodsToAdd = methodsToCheck.filter(method => !existingMethods.includes(method));
  
  if (methodsToAdd.length > 0) {
    // Find the last method in the class to add after it
    const lastMethodMatch = content.match(/\n\s*\w+\(.*?\).*?\{[\s\S]*?\n\s*\}\s*\n/g);
    let lastMethodEndIndex = content.lastIndexOf('}');
    
    if (lastMethodMatch && lastMethodMatch.length > 0) {
      const lastMethod = lastMethodMatch[lastMethodMatch.length - 1];
      lastMethodEndIndex = content.lastIndexOf(lastMethod) + lastMethod.length;
    }
    
    // Add missing methods
    let methodsImplementation = '';
    
    methodsToAdd.forEach(method => {
      // Convert changeXxx to updateXxx
      const mappedMethod = method === 'changeMembershipType' ? 'updateMembershipType' : method;
      const normalizedName = mappedMethod.replace(/^getUserMembershipDetails$/, 'getUserMembership');
      
      methodsImplementation += `
  /**
   * ${mappedMethod}
   * ${method === 'getUserMemberships' ? 'Get all memberships for the current user' :
         method === 'getOrganizationUsers' ? 'Get all users in the current organization' :
         method === 'getOrganizationInvitations' ? 'Get all invitations for the current organization' :
         method === 'cancelInvitation' ? 'Cancel a pending invitation' :
         method === 'resendInvitation' ? 'Resend an invitation email' :
         method === 'getUserMembershipDetails' ? 'Get detailed membership information for a user' :
         method === 'updateUserRoles' ? 'Update a user\'s roles in the organization' :
         method === 'updateUserCustomPermissions' ? 'Update a user\'s custom permissions' :
         method === 'updateMembershipType' ? 'Change a user\'s membership type' :
         method === 'removeUserFromOrganization' ? 'Remove a user from the organization' :
         method === 'leaveOrganization' ? 'Leave the current organization' : 'Placeholder description'}
   */
  async ${mappedMethod}(req: Request, res: Response): Promise<void> {
    try {
      // Method implementation will go here
      res.status(501).json({
        success: false,
        message: 'Method not implemented yet'
      });
    } catch (error) {
      console.error(\`Error in ${mappedMethod}:\`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
`;
    });
    
    content = content.slice(0, lastMethodEndIndex) + methodsImplementation + content.slice(lastMethodEndIndex);
    writeFile(filePath, content);
    log(`✅ Added ${methodsToAdd.length} missing methods to membership controller`);
  } else {
    log(`✓ Membership controller has all required methods`);
  }
  
  return true;
}

function fixOrganizationController() {
  const filePath = path.join(srcDir, 'modules', 'organizations', 'controllers', 'organization.controller.ts');
  
  if (!fs.existsSync(filePath)) {
    log(`❌ File not found: ${filePath}`);
    return false;
  }

  log(`Fixing organization controller: ${filePath}`);
  let content = readFile(filePath);
  
  // Get the existing class methods
  const existingMethodsMatch = content.match(/(\w+)\(.*?\).*?{/g) || [];
  const existingMethods = existingMethodsMatch.map(match => match.match(/(\w+)\(/)[1]);
  
  // Methods to check
  const methodsToCheck = [
    'getOrganizationHierarchy',
    'createClientOrganization',
    'getCurrentOrganization',
    'updateOrganizationType',
    'transferOwnership'
  ];
  
  const methodsToAdd = methodsToCheck.filter(method => !existingMethods.includes(method));
  
  if (methodsToAdd.length > 0) {
    // Find the last method in the class to add after it
    const lastMethodMatch = content.match(/\n\s*\w+\(.*?\).*?\{[\s\S]*?\n\s*\}\s*\n/g);
    let lastMethodEndIndex = content.lastIndexOf('}');
    
    if (lastMethodMatch && lastMethodMatch.length > 0) {
      const lastMethod = lastMethodMatch[lastMethodMatch.length - 1];
      lastMethodEndIndex = content.lastIndexOf(lastMethod) + lastMethod.length;
    }
    
    // Add missing methods
    let methodsImplementation = '';
    
    methodsToAdd.forEach(method => {
      methodsImplementation += `
  /**
   * ${method}
   * ${method === 'getOrganizationHierarchy' ? 'Get the hierarchy of organizations for the current organization' :
         method === 'createClientOrganization' ? 'Create a new client organization (Agency only)' :
         method === 'getCurrentOrganization' ? 'Get details of the current organization' :
         method === 'updateOrganizationType' ? 'Update the type of an organization (Admin only)' :
         method === 'transferOwnership' ? 'Transfer ownership of an organization to another user' : 'Placeholder description'}
   */
  async ${method}(req: Request, res: Response): Promise<void> {
    try {
      // Method implementation will go here
      res.status(501).json({
        success: false,
        message: 'Method not implemented yet'
      });
    } catch (error) {
      console.error(\`Error in ${method}:\`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
`;
    });
    
    content = content.slice(0, lastMethodEndIndex) + methodsImplementation + content.slice(lastMethodEndIndex);
    writeFile(filePath, content);
    log(`✅ Added ${methodsToAdd.length} missing methods to organization controller`);
  } else {
    log(`✓ Organization controller has all required methods`);
  }
  
  return true;
}

function fixRoleController() {
  const filePath = path.join(srcDir, 'modules', 'organizations', 'controllers', 'role.controller.ts');
  
  if (!fs.existsSync(filePath)) {
    log(`❌ File not found: ${filePath}`);
    return false;
  }

  log(`Fixing role controller: ${filePath}`);
  let content = readFile(filePath);
  
  // Get the existing class methods
  const existingMethodsMatch = content.match(/(\w+)\(.*?\).*?{/g) || [];
  const existingMethods = existingMethodsMatch.map(match => match.match(/(\w+)\(/)[1]);
  
  // Methods to check
  const methodsToCheck = [
    'getRoles',
    'getAvailablePermissions',
    'getUserPermissions'
  ];
  
  const methodsToAdd = methodsToCheck.filter(method => !existingMethods.includes(method));
  
  if (methodsToAdd.length > 0) {
    // Find the last method in the class to add after it
    const lastMethodMatch = content.match(/\n\s*\w+\(.*?\).*?\{[\s\S]*?\n\s*\}\s*\n/g);
    let lastMethodEndIndex = content.lastIndexOf('}');
    
    if (lastMethodMatch && lastMethodMatch.length > 0) {
      const lastMethod = lastMethodMatch[lastMethodMatch.length - 1];
      lastMethodEndIndex = content.lastIndexOf(lastMethod) + lastMethod.length;
    }
    
    // Add missing methods
    let methodsImplementation = '';
    
    methodsToAdd.forEach(method => {
      methodsImplementation += `
  /**
   * ${method}
   * ${method === 'getRoles' ? 'Get all roles for the current organization' :
         method === 'getAvailablePermissions' ? 'Get all available permissions' :
         method === 'getUserPermissions' ? 'Get permissions for a specific user' : 'Placeholder description'}
   */
  async ${method}(req: Request, res: Response): Promise<void> {
    try {
      // Method implementation will go here
      res.status(501).json({
        success: false,
        message: 'Method not implemented yet'
      });
    } catch (error) {
      console.error(\`Error in ${method}:\`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
`;
    });
    
    content = content.slice(0, lastMethodEndIndex) + methodsImplementation + content.slice(lastMethodEndIndex);
    writeFile(filePath, content);
    log(`✅ Added ${methodsToAdd.length} missing methods to role controller`);
  } else {
    log(`✓ Role controller has all required methods`);
  }
  
  return true;
}

function fixFirestoreServiceErrors() {
  const servicesPaths = [
    path.join(srcDir, 'services', 'firestore', 'organization.service.ts'),
    path.join(srcDir, 'services', 'firestore', 'role.service.ts'),
    path.join(srcDir, 'services', 'firestore', 'user-organization.service.ts'),
    path.join(srcDir, 'services', 'firestore', 'invitation.service.ts')
  ];
  
  servicesPaths.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      log(`❌ File not found: ${filePath}`);
      return;
    }

    log(`Fixing service file: ${filePath}`);
    let content = readFile(filePath);
    
    // Fix missing ID property errors in arrays
    const baseFileName = path.basename(filePath);
    const entityName = baseFileName.split('.')[0];
    
    // Get the base interface name (e.g., IOrganization)
    let baseInterfaceName = '';
    if (entityName === 'organization') baseInterfaceName = 'IOrganization';
    else if (entityName === 'role') baseInterfaceName = 'IRole';
    else if (entityName === 'user-organization') baseInterfaceName = 'IUserOrganization';
    else if (entityName === 'invitation') baseInterfaceName = 'IInvitation';
    
    if (baseInterfaceName) {
      const withIdInterfaceName = `${baseInterfaceName}WithId`;
      
      // Add as any type assertion to array return values
      content = content.replace(
        new RegExp(`(return (?:[^;]+) as )${baseInterfaceName}\\[\\];`, 'g'),
        `$1${withIdInterfaceName}[];`
      );
      
      // Add as any type assertion to individual return values
      content = content.replace(
        new RegExp(`(return (?:[^;]+) as )${baseInterfaceName};`, 'g'),
        `$1${withIdInterfaceName};`
      );
      
      // Add id property to mapped objects
      content = content.replace(
        new RegExp(`((?:const|let) [\\w]+ = )(?:{[\r\n\s]*\\.\\.\\.doc\\.data\\(\\)[\r\n\s]*})`, 'g'),
        `$1{
      ...doc.data(),
      id: doc.id
    }`
      );
      
      // Add id to array map operations
      content = content.replace(
        /docs\.map\(doc => doc\.data\(\)\)/g,
        `docs.map(doc => ({ ...doc.data(), id: doc.id }))`
      );
      
      // Handle Timestamp toDate and toMillis methods
      if (content.includes('toMillis') || content.includes('toDate')) {
        content = content.replace(
          /(const|let) (\w+) = \(([^)]+) as any\)\.(\w+)/g,
          `$1 $2 = ($3 as any).$4`
        );
      }
    }
    
    writeFile(filePath, content);
    log(`✅ Fixed service file: ${filePath}`);
  });
  
  return true;
}

function fixBuyboxModuleIssues() {
  // Fix auth middleware import issue in buybox.routes.ts
  const buyboxRoutesPath = path.join(srcDir, 'modules', 'buybox', 'routes', 'buybox.routes.ts');
  
  if (fs.existsSync(buyboxRoutesPath)) {
    log(`Fixing Buybox routes file: ${buyboxRoutesPath}`);
    let content = readFile(buyboxRoutesPath);
    
    // Replace authMiddleware with authenticate
    content = content.replace(
      /import { authMiddleware } from '\.\.\/\.\.\/\.\.\/middleware\/auth\.middleware';/g,
      `import { authenticate } from '../../../middleware/auth.middleware';`
    );
    
    content = content.replace(/authMiddleware/g, 'authenticate');
    
    writeFile(buyboxRoutesPath, content);
    log(`✅ Fixed Buybox routes file: ${buyboxRoutesPath}`);
  }
  
  // Fix feedback routes auth middleware issue
  const feedbackRoutesPath = path.join(srcDir, 'modules', 'feedback', 'routes', 'feedback.routes.ts');
  
  if (fs.existsSync(feedbackRoutesPath)) {
    log(`Fixing Feedback routes file: ${feedbackRoutesPath}`);
    let content = readFile(feedbackRoutesPath);
    
    // Replace authMiddleware with authenticate
    content = content.replace(
      /import { authMiddleware } from '\.\.\/\.\.\/\.\.\/middleware\/auth\.middleware';/g,
      `import { authenticate } from '../../../middleware/auth.middleware';`
    );
    
    content = content.replace(/authMiddleware/g, 'authenticate');
    
    writeFile(feedbackRoutesPath, content);
    log(`✅ Fixed Feedback routes file: ${feedbackRoutesPath}`);
  }
  
  return true;
}

function fixQueryIssues() {
  const firestoreServicesDir = path.join(srcDir, 'services', 'firestore');
  const firestoreServices = fs.readdirSync(firestoreServicesDir)
    .filter(file => file.endsWith('.service.ts'))
    .map(file => path.join(firestoreServicesDir, file));
  
  firestoreServices.forEach(filePath => {
    const content = readFile(filePath);
    
    // Check if the file has Query type issues
    if (content.includes('Type \'Query<') && content.includes('is missing the following properties')) {
      log(`Fixing Query type issues in: ${filePath}`);
      
      // Add a cast to any to fix Query type mismatch with CollectionReference
      let updatedContent = content.replace(
        /(query =.*?)\s*return query;/g,
        '$1\n    // Cast to any to fix type issues with Query vs CollectionReference\n    return query as any;'
      );
      
      // Fix specific issues in inventory.service.ts and order.service.ts
      if (filePath.endsWith('inventory.service.ts') || filePath.endsWith('order.service.ts')) {
        updatedContent = updatedContent.replace(
          /(let query =.*?)\s*(if\s*\(.*?\)\s*{)/g,
          '$1\n    // Cast query as any to fix TypeScript errors\n    $2'
        );
      }
      
      writeFile(filePath, updatedContent);
      log(`✅ Fixed Query type issues in: ${filePath}`);
    }
  });
  
  return true;
}

// Main execution
function runFixes() {
  log('Starting TypeScript error fixing process...');
  
  // Run specific fixers
  const fixers = [
    fixMultiTenantAuthMiddleware,
    fixIdMissingInModels,
    fixMembershipController,
    fixOrganizationController,
    fixRoleController,
    fixFirestoreServiceErrors,
    fixBuyboxModuleIssues,
    fixQueryIssues
  ];
  
  const results = fixers.map(fixer => fixer());
  const successCount = results.filter(result => result).length;
  
  log(`Completed TypeScript error fixing: ${successCount}/${fixers.length} fixes applied`);
  
  // Run TypeScript typecheck to see if we fixed the errors
  log('Running TypeScript type check...');
  try {
    execSync('npm run typecheck', { cwd: rootDir, stdio: 'inherit' });
    log('✅ TypeScript type check passed successfully');
    return true;
  } catch (error) {
    log('❌ TypeScript type check still has errors. Review the output above.');
    return false;
  }
}

runFixes();