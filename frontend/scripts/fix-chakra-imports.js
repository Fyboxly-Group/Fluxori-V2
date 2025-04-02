/**
 * Fix Chakra UI Imports
 * 
 * This script updates imports from @chakra-ui/react to use the compatibility layer
 * in order to resolve issues with Chakra UI v3 direct imports.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper to get all TypeScript/TSX files
function getTypeScriptFiles() {
  const tsFiles = execSync('find src -type f -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  return tsFiles;
}

// Update imports in files
function updateChakraImports() {
  const files = getTypeScriptFiles();
  let totalFilesUpdated = 0;
  let totalImportsFixed = 0;

  for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Fix direct imports from @chakra-ui/react
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@chakra-ui\/react['"]/g;
    let match;
    let hasChanges = false;

    while ((match = importRegex.exec(originalContent)) !== null) {
      hasChanges = true;
      totalImportsFixed++;
      
      // Change @chakra-ui/react to @/utils/chakra-compat
      content = content.replace(
        `import {${match[1]}} from '@chakra-ui/react'`,
        `import {${match[1]}} from '@/utils/chakra-compat'`
      );
    }

    // Update specific hook imports
    if (content.includes('useColorMode') || content.includes('useDisclosure') || content.includes('useToast')) {
      content = content.replace(
        /import\s+\{\s*useColorMode\s*\}\s+from\s+['"]@chakra-ui\/react['"]/g,
        `import { useColorMode } from '@/utils/chakra-compat'`
      );
      
      content = content.replace(
        /import\s+\{\s*useDisclosure\s*\}\s+from\s+['"]@chakra-ui\/react['"]/g,
        `import { useDisclosure } from '@/utils/chakra-compat'`
      );
      
      content = content.replace(
        /import\s+\{\s*useToast\s*\}\s+from\s+['"]@chakra-ui\/react['"]/g,
        `import { useToast } from '@/utils/chakra-compat'`
      );
      
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated imports in ${filePath}`);
      totalFilesUpdated++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   - Files updated: ${totalFilesUpdated}`);
  console.log(`   - Import statements fixed: ${totalImportsFixed}`);
}

// Run the import fix function
console.log('🔄 Fixing Chakra UI imports...');
updateChakraImports();
console.log('✅ Chakra UI import fix complete!');