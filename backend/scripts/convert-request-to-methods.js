const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Script to convert client.request() calls to specific method calls (get, post, put, delete)
 * This helps fix Shopify adapter compatibility issues
 */

// Regex to match client.request with method specification
const REGEX_REQUEST_GET = /this\.client\.request\(\{\s*method:\s*['"]GET['"]/g;
const REGEX_REQUEST_POST = /this\.client\.request\(\{\s*method:\s*['"]POST['"]/g;
const REGEX_REQUEST_PUT = /this\.client\.request\(\{\s*method:\s*['"]PUT['"]/g;
const REGEX_REQUEST_DELETE = /this\.client\.request\(\{\s*method:\s*['"]DELETE['"]/g;

// Map of regexes to replacement methods
const REPLACEMENTS = [
  {
    regex: REGEX_REQUEST_GET,
    method: 'get',
    processor: convertToMethod
  },
  {
    regex: REGEX_REQUEST_POST,
    method: 'post',
    processor: convertToMethod
  },
  {
    regex: REGEX_REQUEST_PUT,
    method: 'put',
    processor: convertToMethod
  },
  {
    regex: REGEX_REQUEST_DELETE,
    method: 'delete',
    processor: convertToMethod
  }
];

// Function to convert request to specific method
function convertToMethod(content, regex, method) {
  // This is a simplified approach - a full parser would be more robust
  // The actual conversion is complex and would require AST parsing for full accuracy
  
  // Replace the method part
  let modifiedContent = content.replace(regex, `this.client.${method}(`);
  
  // Replace the structure from object format to the REST client format
  // This is a simplified transformation and might need adjustment
  modifiedContent = modifiedContent
    .replace(/path:\s*['"]([^'"]+)['"]/g, '"$1"')
    .replace(/query:\s*(\{[^}]+\})/g, 'searchParams: $1')
    .replace(/data:\s*(\{[^}]+\})/g, 'data: $1');
  
  // Remove the closing parenthesis and add 'as any'
  modifiedContent = modifiedContent.replace(/\}\)/g, '}) as any');
  
  return modifiedContent;
}

// Function to process a file
function processFile(filePath) {
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Apply all replacements
  for (const replacement of REPLACEMENTS) {
    content = replacement.processor(content, replacement.regex, replacement.method);
  }
  
  // If content changed, write it back
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Modified ${filePath}`);
    return true;
  }
  
  return false;
}

// Main function
function main() {
  console.log('Starting to convert client.request() calls to specific methods...');
  
  // Find all TypeScript files in the Shopify adapter services directory
  const servicesDir = path.join(__dirname, '../src/modules/marketplaces/adapters/shopify/services');
  const files = glob.sync(path.join(servicesDir, '*.ts'));
  
  console.log(`Found ${files.length} service files to check`);
  
  let filesModified = 0;
  
  // Process each file
  for (const file of files) {
    const wasModified = processFile(file);
    if (wasModified) {
      filesModified++;
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`- Files processed: ${files.length}`);
  console.log(`- Files modified: ${filesModified}`);
  
  console.log('\nConversion completed!');
}

// Run the script
main();