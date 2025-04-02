/**
 * Fix Chakra UI v3 prop naming issues
 * 
 * This script replaces old v2 prop names (isLoading, isOpen, etc.) with v3 names (loading, open, etc.)
 * It also fixes components that expect v3 prop names but are being passed v2 prop names
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Prop mappings from v2 to v3
const PROP_MAPPINGS = {
  'isLoading': 'loading',
  'isOpen': 'open',
  'isDisabled': 'disabled',
  'isChecked': 'checked',
  'isActive': 'active',
  'isFocused': 'focused',
  'isAttached': 'attached',
  'isInvalid': 'invalid',
  'isReadOnly': 'readOnly',
  'isTruncated': 'truncated',
  'isFullWidth': 'fullWidth',
  'isExternal': 'external',
};

// This will run the script on the entire src directory
const SEARCH_PATTERN = path.join(process.cwd(), 'src/**/*.{tsx,jsx,ts,js}');

// Skip node_modules and any files in .gitignore
const ROOT_DIR = process.cwd();
const IGNORED_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
];

function main() {
  console.log('🔍 Scanning for Chakra UI v2 prop naming patterns...');
  
  let filesWithChanges = 0;
  let totalChanges = 0;
  
  // Get all files matching the pattern
  const files = glob.sync(SEARCH_PATTERN, {
    ignore: IGNORED_DIRS.map(dir => `**/${dir}/**`),
  });
  
  console.log(`Found ${files.length} files to check`);
  
  files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix prop names in JSX attributes
    let propChanges = 0;
    
    // Replace prop names in JSX/TSX component usage
    Object.entries(PROP_MAPPINGS).forEach(([oldProp, newProp]) => {
      // Match prop usage in JSX attributes (including spacing variations)
      const propRegex = new RegExp(`(\\s+)${oldProp}(\\s*=\\s*{[^}]+})`, 'g');
      
      // Count occurrences before replacement
      const matches = content.match(propRegex);
      if (matches) {
        propChanges += matches.length;
      }
      
      // Replace with new prop name
      content = content.replace(propRegex, `$1${newProp}$2`);
    });
    
    // Fix component prop type issues in interfaces and types
    let typeChanges = 0;
    Object.entries(PROP_MAPPINGS).forEach(([oldProp, newProp]) => {
      // Match in interface/type declarations
      const typeRegex = new RegExp(`(\\s+)${oldProp}(\\??:\\s*[^;\\n]+)`, 'g');
      
      // Count occurrences
      const matches = content.match(typeRegex);
      if (matches) {
        typeChanges += matches.length;
      }
      
      // Replace with new prop name
      content = content.replace(typeRegex, `$1${newProp}$2`);
    });
    
    // Fix spacing prop for Stack components
    let spacingChanges = 0;
    const stackSpacingRegex = /(<(?:Stack|HStack|VStack)[^>]*\s+)spacing(\s*=\s*{[^}]+})/g;
    const stackSpacingMatches = content.match(stackSpacingRegex);
    
    if (stackSpacingMatches) {
      spacingChanges = stackSpacingMatches.length;
      content = content.replace(stackSpacingRegex, '$1gap$2');
    }
    
    // Fix references to old prop names in code
    let variableRefs = 0;
    Object.entries(PROP_MAPPINGS).forEach(([oldProp, newProp]) => {
      // Only replace standalone references to avoid changing other variables
      const variableRegex = new RegExp(`(?<![a-zA-Z0-9_])${oldProp}(?![a-zA-Z0-9_])`, 'g');
      
      // Count occurrences in comments, strings, and variable names
      const matches = [...content.matchAll(variableRegex)];
      
      // Skip replacement if it's a variable name in assignment or declaration
      const filteredMatches = matches.filter(match => {
        const position = match.index;
        const preContext = content.substring(Math.max(0, position - 20), position);
        
        // Skip if it's part of a declaration or assignment
        return !preContext.match(/(?:const|let|var)\s+$/) &&
               !preContext.match(/:\s+$/) &&
               !preContext.match(/=\s+$/);
      });
      
      variableRefs += filteredMatches.length;
      
      // Replace variable references, but be selective
      for (const match of filteredMatches) {
        const position = match.index;
        const matchText = match[0];
        
        // Replace only if it's not causing issues
        const preContext = content.substring(Math.max(0, position - 20), position);
        const postContext = content.substring(position + matchText.length, position + matchText.length + 20);
        
        // Skip if inside a comment
        if (preContext.includes('//') && !preContext.includes('\n')) {
          continue;
        }
        
        // Skip if part of a property access
        if (preContext.match(/\.\s*$/) || postContext.match(/^\s*\./)) {
          continue;
        }
        
        // Apply replacement at specific position
        content = 
          content.substring(0, position) + 
          newProp + 
          content.substring(position + matchText.length);
      }
    });
    
    // Fix specific component props passed to NotificationList
    if (content.includes('NotificationList') && content.includes('loading={')) {
      const notificationListRegex = /(<NotificationList[^>]*\s+)loading(\s*=\s*{[^}]+})/g;
      content = content.replace(notificationListRegex, '$1isLoading$2');
    }
    
    // Fix QueryStateHandler props
    if (content.includes('QueryStateHandler') && content.includes('loading={')) {
      const queryStateHandlerRegex = /(<QueryStateHandler[^>]*\s+)loading(\s*=\s*{[^}]+})/g;
      content = content.replace(queryStateHandlerRegex, '$1isLoading$2');
    }
    
    // Fix Modal props
    if (content.includes('<Modal') && content.includes('open={')) {
      const modalRegex = /(<Modal[^>]*\s+)open(\s*=\s*{[^}]+})/g;
      content = content.replace(modalRegex, '$1isOpen$2');
    }
    
    // Fix AlertDialog props
    if (content.includes('<AlertDialog') && content.includes('open={')) {
      const alertDialogRegex = /(<AlertDialog[^>]*\s+)open(\s*=\s*{[^}]+})/g;
      content = content.replace(alertDialogRegex, '$1isOpen$2');
    }
    
    // Fix DisconnectAlertDialog props
    if (content.includes('DisconnectAlertDialog') && content.includes('loading={')) {
      const disconnectAlertDialogRegex = /loading:\s*([^,}]+)/g;
      content = content.replace(disconnectAlertDialogRegex, 'isLoading: $1');
    }
    
    // Fix Sidebar component using isActive
    if (filePath.includes('Sidebar.tsx') && content.includes('isActive')) {
      content = content.replace(/isActive/g, 'active');
    }
    
    // Only write to the file if changes were made
    const totalFileChanges = propChanges + typeChanges + spacingChanges + variableRefs;
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesWithChanges++;
      totalChanges += totalFileChanges;
      
      console.log(`✅ Updated ${path.relative(process.cwd(), filePath)} (${totalFileChanges} changes)`);
    }
  });
  
  console.log(`\n✅ Completed! Updated ${filesWithChanges} files with ${totalChanges} changes.`);
}

main();