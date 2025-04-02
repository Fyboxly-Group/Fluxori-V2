#!/usr/bin/env node

/**
 * Shopify Adapter TypeScript Fixer Script
 * 
 * This script automatically fixes TypeScript errors in Shopify adapter service classes by:
 * 1. Updating import statements to use AdminRestApiClient instead of AdminApiClient
 * 2. Updating constructor parameter types
 * 3. Converting client.request calls to the appropriate REST methods (get, post, put, delete)
 * 4. Adding proper type assertions to the responses
 * 5. Fixing quote character issues (mixing ', ", and `)
 * 6. Fixing missing searchParams objects
 * 7. Fixing incorrect return statements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Main function
async function main() {
  console.log('🔧 Shopify Adapter TypeScript Fixer');
  console.log('================================');
  console.log('This script fixes client.request type issues in Shopify adapter services.\n');

  // Set the path to the Shopify adapter directory
  const adaptersDir = path.join(process.cwd(), 'src/modules/marketplaces/adapters/shopify');
  
  if (!fs.existsSync(adaptersDir)) {
    console.error(`Error: Shopify adapter directory not found: ${adaptersDir}`);
    process.exit(1);
  }
  
  // Define a function to fix quote issues in a file
  const fixQuoteIssues = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix string literals with mixed quotes
    content = content.replace(/\'([^\']*)`/g, '\'$1\'');
    content = content.replace(/`([^`]*)'/g, '`$1`');
    content = content.replace(/"([^"]*)'/g, '"$1"');
    content = content.replace(/'([^"]*)"/g, '\'$1\'');
    
    if (content !== originalContent) {
      console.log(`  Fixed quote issues in ${path.basename(filePath)}`);
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  };

  // Fix the adapter class first
  console.log('Fixing the adapter class...');
  const adapterPath = path.join(adaptersDir, 'shopify.adapter.ts');
  if (fs.existsSync(adapterPath)) {
    // Update imports in adapter file
    let adapterContent = fs.readFileSync(adapterPath, 'utf8');
    const originalAdapterContent = adapterContent;
    
    // Fix imports
    adapterContent = adapterContent.replace(
      /import\s+\{\s*createAdminApiClient,\s*AdminApiClient(?:,\s*Session)?\s*\}\s+from\s+['"]@shopify\/admin-api-client['"]/,
      'import { createAdminRestApiClient, AdminRestApiClient } from \'@shopify/admin-api-client\''
    );
    
    // Fix client type and initialization
    adapterContent = adapterContent.replace(
      /private\s+client:\s+AdminApiClient/,
      'private client: AdminRestApiClient'
    );
    
    // Fix client initialization
    adapterContent = adapterContent.replace(
      /const\s+session.*?}\);/s,
      `this.client = createAdminRestApiClient({
        apiVersion: shopifyConfig.apiVersion,
        storeDomain: this.shopDomain,
        accessToken: credentials.accessToken || '',
        formatPaths: true
      });`
    );
    
    // Fix client request calls
    adapterContent = adapterContent.replace(
      /await\s+this\.client!\.request\(\{\s*method:\s*['"]GET['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`](?:\s*,\s*query\s*:?\s*([^}]+))?\s*\}\)/g,
      (match, path, query) => {
        if (query) {
          return `await this.client!.get('${path}', {\n      searchParams: ${query.trim()}\n    })`;
        }
        return `await this.client!.get('${path}')`;
      }
    );
    
    adapterContent = adapterContent.replace(
      /await\s+this\.client!\.request\(\{\s*method:\s*['"]POST['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`](?:\s*,\s*data\s*:?\s*([^}]+))?\s*\}\)/g,
      (match, path, data) => {
        if (data) {
          return `await this.client!.post('${path}', {\n      data: ${data.trim()}\n    })`;
        }
        return `await this.client!.post('${path}')`;
      }
    );
    
    adapterContent = adapterContent.replace(
      /await\s+this\.client!\.request\(\{\s*method:\s*['"]PUT['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`](?:\s*,\s*data\s*:?\s*([^}]+))?\s*\}\)/g,
      (match, path, data) => {
        if (data) {
          return `await this.client!.put('${path}', {\n      data: ${data.trim()}\n    })`;
        }
        return `await this.client!.put('${path}')`;
      }
    );
    
    adapterContent = adapterContent.replace(
      /await\s+this\.client!\.request\(\{\s*method:\s*['"]DELETE['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`](?:\s*,\s*([^}]+))?\s*\}\)/g,
      (match, path, extra) => {
        if (extra && extra.includes('query')) {
          const queryMatch = extra.match(/query\s*:?\s*([^}]+)/);
          if (queryMatch) {
            return `await this.client!.delete('${path}', {\n      searchParams: ${queryMatch[1].trim()}\n    })`;
          }
        }
        return `await this.client!.delete('${path}')`;
      }
    );
    
    if (adapterContent !== originalAdapterContent) {
      fs.writeFileSync(adapterPath, adapterContent, 'utf8');
      console.log('  ✅ Fixed adapter class');
    } else {
      console.log('  ℹ️ No fixes needed in adapter class');
    }
  } else {
    console.warn(`Warning: Adapter file not found at ${adapterPath}`);
  }

  // Now fix the service files
  const servicesDir = path.join(adaptersDir, 'services');
  
  if (!fs.existsSync(servicesDir)) {
    console.error(`Error: Services directory not found: ${servicesDir}`);
    process.exit(1);
  }

  // Find all service files
  const serviceFiles = fs.readdirSync(servicesDir)
    .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts') && file !== 'index.ts');

  console.log(`\nFound ${serviceFiles.length} service files to process\n`);

  let totalFixedFiles = 0;
  let totalFixedImports = 0;
  let totalFixedMethods = 0;

  // Process each service file
  let totalFixedOtherIssues = 0;
  for (const file of serviceFiles) {
    const filePath = path.join(servicesDir, file);
    
    // First fix quote issues
    const quoteFixed = fixQuoteIssues(filePath);
    
    // Then process the file
    const { fixedImports, fixedMethods, fixedOtherIssues } = await processServiceFile(filePath);
    
    if (fixedImports > 0 || fixedMethods > 0 || fixedOtherIssues > 0 || quoteFixed) {
      totalFixedFiles++;
      totalFixedImports += fixedImports;
      totalFixedMethods += fixedMethods;
      totalFixedOtherIssues += fixedOtherIssues;
    }
  }

  console.log(`\n✅ Fixed ${totalFixedImports} imports, ${totalFixedMethods} methods, and ${totalFixedOtherIssues} other issues across ${totalFixedFiles} files`);
  
  // Additional manual fixes for collection.service.ts
  console.log('\nApplying manual fixes to collection.service.ts...');
  const collectionServicePath = path.join(servicesDir, 'collection.service.ts');
  
  try {
    if (fs.existsSync(collectionServicePath)) {
      let content = fs.readFileSync(collectionServicePath, 'utf8');
      
      // Replace all client.request calls with appropriate REST methods
      content = content.replace(/client\.request\(\{[\s\S]*?method:\s*['"`](GET|POST|PUT|DELETE)['"`],\s*path:\s*['"`]([^'"`]+)['"`][\s\S]*?\}\)/g, 
        (match, method, path) => {
          const methodLower = method.toLowerCase();
          if (match.includes('data:')) {
            return `client.${methodLower}(\`${path}\`, {\n      data: { ${path.split('/').pop()}: collectionData }\n    }) as any`;
          }
          return `client.${methodLower}(\`${path}\`) as any`;
        }
      );
      
      // Fix any remaining quote issues
      content = content.replace(/['"`]([^'"`]*)['"`]\s*,/g, '\'$1\',');
      content = content.replace(/client\.get\(['"`]([^'"`]+)['"`](?=[\s,)])/g, 'client.get(\'$1\')');
      
      // Fix empty searchParams objects
      content = content.replace(/searchParams:\s*\n\s*}/g, 'searchParams: query\n    }');
      
      // Add "as any" to all client method calls
      content = content.replace(/client\.(get|post|put|delete)\([^)]+\)(?!\s*as)/g, '$& as any');
      
      fs.writeFileSync(collectionServicePath, content, 'utf8');
      console.log('  ✅ Applied manual fixes to collection.service.ts');
    }
  } catch (error) {
    console.error(`  ❌ Error applying manual fixes to collection.service.ts: ${error.message}`);
  }
  
  // Run TypeScript to check for errors
  try {
    console.log('\nRunning TypeScript check on Shopify files...');
    const output = execSync('npx tsc --noEmit ./src/modules/marketplaces/adapters/shopify/**/*.ts --pretty false 2>&1', { encoding: 'utf8' });
    console.log('No TypeScript errors in Shopify files!');
  } catch (error) {
    console.log('\nRemaining TypeScript errors:');
    const errors = error.stdout.split('\n').filter(line => line.includes('error TS'));
    console.log(`${errors.length} errors remaining`);
    console.log(errors.slice(0, 5).join('\n'));
    if (errors.length > 5) {
      console.log(`... and ${errors.length - 5} more errors`);
    }
  }
}

// Process a service file and fix type issues
async function processServiceFile(filePath) {
  console.log(`Processing ${path.basename(filePath)}...`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Keep track of the number of methods fixed
  let fixedMethods = 0;
  let fixedImports = 0;
  let fixedOtherIssues = 0;

  // Fix 1: Update import statements
  if (content.includes('import { AdminApiClient }')) {
    content = content.replace(
      /import\s+\{\s*AdminApiClient\s*\}\s+from\s+['"]@shopify\/admin-api-client['"]/,
      'import { AdminRestApiClient } from \'@shopify/admin-api-client\''
    );
    fixedImports++;
  }

  // Fix 2: Update constructor parameter types
  content = content.replace(
    /constructor\(\s*private\s+client:\s+AdminApiClient/,
    'constructor(\n    private client: AdminRestApiClient'
  );

  // Fix 3: Fix empty searchParams
  content = content.replace(
    /const response = await this\.client\.get\(['"`]([^'"`]+)['"`],\s*{\s*\n\s*searchParams:\s*\n\s*}\)/g,
    (match, path) => {
      fixedOtherIssues++;
      return `const response = await this.client.get('${path}', {\n      searchParams: query\n    })`;
    }
  );

  // Fix 4: Fix incorrect backtick string in template literals
  content = content.replace(
    /(['"])([^'"]*)(\$\{[^}]+\})([^'"]*)\1/g,
    (match, quote, before, variable, after) => {
      if (variable.includes('${')) {
        fixedOtherIssues++;
        return `\`${before}${variable}${after}\``;
      }
      return match;
    }
  );
  
  // Fix 7: Fix mixed string delimiter styles
  content = content.replace(
    /(`[^`]*)'([^`]*`)/g,
    (match, before, after) => {
      fixedOtherIssues++;
      return `${before}\`${after}`;
    }
  );
  
  // Fix 8: Fix mismatched single quotes in client methods
  content = content.replace(
    /await this\.client\.(get|post|put|delete)\('([^']*)`/g,
    (match, method, path) => {
      fixedOtherIssues++;
      return `await this.client.${method}('${path}'`;
    }
  );
  
  // Fix 9: Fix mismatched backticks in client methods
  content = content.replace(
    /await this\.client\.(get|post|put|delete)\(`([^`]*)'(?!\s*\+)/g,
    (match, method, path) => {
      fixedOtherIssues++;
      return `await this.client.${method}(\`${path}\``;
    }
  );
  
  // Fix 10: Fix union types with mixed quotes
  content = content.replace(
    /sort_order\??:\s*['"`]?alpha-asc[^\n;]+;/g,
    (match) => {
      fixedOtherIssues++;
      return `sort_order?: 'alpha-asc' | 'alpha-desc' | 'best-selling' | 'created' | 'created-desc' | 'manual' | 'price-asc' | 'price-desc';`;
    }
  );
  
  // Fix 11: Fix published_status with mixed quotes
  content = content.replace(
    /published_status\??:\s*['"`]?published[^\n;]+;/g,
    (match) => {
      fixedOtherIssues++;
      return `published_status?: 'published' | 'unpublished' | 'any';`;
    }
  );
  
  // Fix 12: Fix published_scope with mixed quotes
  content = content.replace(
    /published_scope\??:\s*['"`]?web[^\n;]+;/g,
    (match) => {
      fixedOtherIssues++;
      return `published_scope?: 'web' | 'global';`;
    }
  );

  // Fix 5: Fix missing return values
  content = content.replace(
    /const response = await this\.client\.get\(['"`]([^'"`]+)['"`](?:,\s*{\s*\n\s*searchParams:[^}]+\n\s*})?\);\s*\n\s*return;/g,
    (match, path) => {
      fixedOtherIssues++;
      return match.replace('return;', 'return response;');
    }
  );

  // Fix 6: Conversion of client.request calls to appropriate REST methods with proper type casting
  
  // GET requests with query parameters
  content = content.replace(
    /((const|let|var)\s+response\s+=\s+)?await\s+this\.client\.request\(\{\s*method:\s*['"]GET['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`]\s*,\s*query\s*:?\s*([^}]+)\}\)/g,
    (match, prefix, varType, path, query) => {
      fixedMethods++;
      return `${prefix || 'const response = '}await this.client.get('${path}', {\n      searchParams: ${query.trim()}\n    }) as any`;
    }
  );
  
  // Simple GET requests without query parameters
  content = content.replace(
    /((const|let|var)\s+response\s+=\s+)?await\s+this\.client\.request\(\{\s*method:\s*['"]GET['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`]\s*\}\)/g,
    (match, prefix, varType, path) => {
      fixedMethods++;
      return `${prefix || 'const response = '}await this.client.get('${path}') as any`;
    }
  );

  // POST requests with data
  content = content.replace(
    /((const|let|var)\s+response\s+=\s+)?await\s+this\.client\.request\(\{\s*method:\s*['"]POST['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`]\s*,\s*data\s*:?\s*([^}]+)\}\)/g,
    (match, prefix, varType, path, data) => {
      fixedMethods++;
      return `${prefix || 'const response = '}await this.client.post('${path}', {\n      data: ${data.trim()}\n    }) as any`;
    }
  );
  
  // Simple POST requests without data
  content = content.replace(
    /((const|let|var)\s+response\s+=\s+)?await\s+this\.client\.request\(\{\s*method:\s*['"]POST['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`]\s*\}\)/g,
    (match, prefix, varType, path) => {
      fixedMethods++;
      return `${prefix || 'const response = '}await this.client.post('${path}') as any`;
    }
  );

  // PUT requests with data
  content = content.replace(
    /((const|let|var)\s+response\s+=\s+)?await\s+this\.client\.request\(\{\s*method:\s*['"]PUT['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`]\s*,\s*data\s*:?\s*([^}]+)\}\)/g,
    (match, prefix, varType, path, data) => {
      fixedMethods++;
      return `${prefix || 'const response = '}await this.client.put('${path}', {\n      data: ${data.trim()}\n    }) as any`;
    }
  );

  // DELETE requests
  content = content.replace(
    /await\s+this\.client\.request\(\{\s*method:\s*['"]DELETE['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`]([^}]*)\}\)/g,
    (match, path, extra) => {
      fixedMethods++;
      
      // Check if there are additional parameters like query
      if (extra && extra.includes('query')) {
        const queryMatch = extra.match(/query\s*:?\s*([^}]+)/);
        if (queryMatch) {
          return `await this.client.delete('${path}', {\n      searchParams: ${queryMatch[1].trim()}\n    })`;
        }
      }
      
      return `await this.client.delete('${path}')`;
    }
  );
  
  // Handle direct return statements (not caught by the other regexes)
  const directReturnRegex = /return\s+this\.client\.request\({[^}]+}\);/g;
  if (directReturnRegex.test(content)) {
    // First handle GET requests
    content = content.replace(
      /return\s+this\.client\.request\({\s*method:\s*['"]GET['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`](?:\s*,\s*query\s*:?\s*([^}]+))?\s*}\);/g,
      (match, path, query) => {
        fixedMethods++;
        if (query) {
          return `const response = await this.client.get('${path}', {\n      searchParams: ${query.trim()}\n    });\n\n    return response;`;
        }
        return `const response = await this.client.get('${path}');\n\n    return response;`;
      }
    );
    
    // Then handle POST requests
    content = content.replace(
      /return\s+this\.client\.request\({\s*method:\s*['"]POST['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`](?:\s*,\s*data\s*:?\s*([^}]+))?\s*}\);/g,
      (match, path, data) => {
        fixedMethods++;
        if (data) {
          return `const response = await this.client.post('${path}', {\n      data: ${data.trim()}\n    });\n\n    return response;`;
        }
        return `const response = await this.client.post('${path}');\n\n    return response;`;
      }
    );
    
    // Then handle PUT requests
    content = content.replace(
      /return\s+this\.client\.request\({\s*method:\s*['"]PUT['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`](?:\s*,\s*data\s*:?\s*([^}]+))?\s*}\);/g,
      (match, path, data) => {
        fixedMethods++;
        if (data) {
          return `const response = await this.client.put('${path}', {\n      data: ${data.trim()}\n    });\n\n    return response;`;
        }
        return `const response = await this.client.put('${path}');\n\n    return response;`;
      }
    );
    
    // Then handle DELETE requests
    content = content.replace(
      /return\s+this\.client\.request\({\s*method:\s*['"]DELETE['"]\s*,\s*path:\s*['"`]([^'"`]+)['"`](?:\s*,\s*([^}]+))?\s*}\);/g,
      (match, path, extra) => {
        fixedMethods++;
        
        // Handle void return types for DELETE
        const methodSignature = content.substring(0, content.indexOf(match)).split('\n').reverse().find(line => 
          line.includes('Promise<void>') || line.includes(': void')
        );
        
        if (methodSignature && (methodSignature.includes('Promise<void>') || methodSignature.includes(': void'))) {
          if (extra && extra.includes('query')) {
            const queryMatch = extra.match(/query\s*:?\s*([^}]+)/);
            if (queryMatch) {
              return `await this.client.delete('${path}', {\n      searchParams: ${queryMatch[1].trim()}\n    });\n\n    return;`;
            }
          }
          return `await this.client.delete('${path}');\n\n    return;`;
        }
        
        // For non-void return types
        if (extra && extra.includes('query')) {
          const queryMatch = extra.match(/query\s*:?\s*([^}]+)/);
          if (queryMatch) {
            return `const response = await this.client.delete('${path}', {\n      searchParams: ${queryMatch[1].trim()}\n    });\n\n    return response;`;
          }
        }
        return `const response = await this.client.delete('${path}');\n\n    return response;`;
      }
    );
  }

  // Only save if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Fixed imports: ${fixedImports}, methods: ${fixedMethods}, other issues: ${fixedOtherIssues} in ${path.basename(filePath)}`);
    return { fixedImports, fixedMethods, fixedOtherIssues };
  }
  
  console.log(`  ℹ️ No fixes needed in ${path.basename(filePath)}`);
  return { fixedImports: 0, fixedMethods: 0, fixedOtherIssues: 0 };
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});