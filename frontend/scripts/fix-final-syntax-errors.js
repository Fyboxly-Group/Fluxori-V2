#!/usr/bin/env node

/**
 * Final Syntax Error Fix Script
 * 
 * This script addresses specific syntax errors in key components
 * particularly targeting the most common TS syntax issues:
 * - TS1109: Expression expected.
 * - TS1005: ';' expected.
 * - TS1128: Declaration or statement expected.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Final Syntax Error Fix Script');

// Navbar Component Fix
function fixNavbarComponent() {
  const filePath = path.resolve(__dirname, '../src/components/layout/Navbar.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ Navbar.tsx not found');
    return false;
  }
  
  console.log('🔧 Fixing Navbar component...');
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the useEffect parameter syntax error
  let updatedContent = content.replace(
    /useEffect\(\(:\s*any\)\s*=>/g, 
    'useEffect((_: any) =>'
  );
  
  // Fix duplicate imports
  if (updatedContent.includes('import { Box, Button, Flex, HStack, Menu, useColorMode, useDisclosure } from \'@/utils/chakra-compat\'')) {
    // Remove duplicate chakra-compat imports that are already directly imported
    updatedContent = updatedContent.replace(
      /import { (Box|Button|Flex|HStack|Menu|useColorMode|useDisclosure)(?:, )?/g, 
      'import { '
    );
    
    // Clean up empty imports
    updatedContent = updatedContent.replace(
      /import { } from '@\/utils\/chakra-compat';?\n/g, 
      ''
    );
    
    // Fix double Menu import (from lucide-react and chakra-compat)
    if (updatedContent.includes('import { Menu } from \'lucide-react\'') && 
        updatedContent.includes('Menu') && 
        !updatedContent.includes('import { Menu }')) {
      // Rename Menu from lucide to MenuIcon
      updatedContent = updatedContent.replace(
        /import { Menu } from 'lucide-react'/g,
        'import { Menu as MenuIcon } from \'lucide-react\''
      );
      
      // Replace Menu icon usage
      updatedContent = updatedContent.replace(
        /icon={<Menu \/>}/g,
        'icon={<MenuIcon />}'
      );
    }
  }
  
  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent);
    console.log('✅ Fixed Navbar component syntax errors');
    return true;
  }
  
  return false;
}

// Fix App Page Syntax
function fixAppPage() {
  const filePath = path.resolve(__dirname, '../src/app/page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ page.tsx not found');
    return false;
  }
  
  console.log('🔧 Fixing App page component...');
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the setTimeout parameter syntax error
  let updatedContent = content.replace(
    /setTimeout\(\(:\s*any\)\s*=>/g, 
    'setTimeout((_: any) =>'
  );
  
  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent);
    console.log('✅ Fixed App page syntax errors');
    return true;
  }
  
  return false;
}

// Fix API Client Syntax
function fixApiClient() {
  const filePath = path.resolve(__dirname, '../src/api/client.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ client.ts not found');
    return false;
  }
  
  console.log('🔧 Fixing API client...');
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the catch parameter syntax error
  let updatedContent = content.replace(
    /\.catch\(\(:\s*any\)\s*=>\s*\({}\)\)/g, 
    '.catch((_: any) => ({}))'
  );
  
  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent);
    console.log('✅ Fixed API client syntax errors');
    return true;
  }
  
  return false;
}

// Find all files with the parameter syntax error and fix them
function fixAllParameterSyntaxErrors() {
  console.log('🔍 Finding files with parameter syntax errors...');
  
  try {
    // Find all TypeScript files with the specific syntax error pattern
    const command = 'find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "(: any) =>" 2>/dev/null || true';
    const result = execSync(command, { encoding: 'utf8' });
    
    const files = result.trim().split('\n').filter(file => file);
    
    if (files.length === 0) {
      console.log('✅ No files found with parameter syntax errors');
      return 0;
    }
    
    console.log(`Found ${files.length} files with parameter syntax errors`);
    let fixedCount = 0;
    
    // Fix each file
    for (const file of files) {
      const filePath = path.resolve(__dirname, '..', file);
      
      try {
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Replace the pattern
        const updatedContent = content.replace(/\(\s*:\s*any\s*\)\s*=>/g, '(_: any) =>');
        
        if (updatedContent !== content) {
          fs.writeFileSync(filePath, updatedContent);
          console.log(`✅ Fixed parameter syntax in ${file}`);
          fixedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    }
    
    console.log(`✨ Fixed parameter syntax in ${fixedCount} files`);
    return fixedCount;
  } catch (error) {
    console.error('❌ Error finding files with parameter syntax errors:', error);
    return 0;
  }
}

// Find all files with duplicate chakra imports
function fixAllDuplicateChakraImports() {
  console.log('🔍 Finding files with duplicate Chakra imports...');
  
  try {
    // Find all files that import from both @chakra-ui/react/* and chakra-compat
    const command1 = 'find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@chakra-ui/react" 2>/dev/null || true';
    const files1 = execSync(command1, { encoding: 'utf8' }).trim().split('\n').filter(file => file);
    
    const command2 = 'find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/utils/chakra-compat" 2>/dev/null || true';
    const files2 = execSync(command2, { encoding: 'utf8' }).trim().split('\n').filter(file => file);
    
    // Find files that appear in both lists
    const duplicateFiles = files1.filter(file => files2.includes(file));
    
    if (duplicateFiles.length === 0) {
      console.log('✅ No files found with duplicate Chakra imports');
      return 0;
    }
    
    console.log(`Found ${duplicateFiles.length} files with potential duplicate Chakra imports`);
    let fixedCount = 0;
    
    // Process each file
    for (const file of duplicateFiles) {
      const filePath = path.resolve(__dirname, '..', file);
      
      try {
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract component names from both import types
        const directImportMatch = content.match(/from\s+['"]@chakra-ui\/react\/[^'"]+['"]/g);
        const compatImportMatch = content.match(/from\s+['"]@\/utils\/chakra-compat['"]/);
        
        if (directImportMatch && compatImportMatch) {
          // Parse the component names from chakra-compat import
          const compatImportLine = content.match(/import\s+{([^}]+)}\s+from\s+['"]@\/utils\/chakra-compat['"]/);
          
          if (compatImportLine && compatImportLine[1]) {
            const componentsFromCompat = compatImportLine[1].split(',').map(c => c.trim());
            
            // Check direct imports for duplicates
            let updatedContent = content;
            let hasDuplicates = false;
            
            for (const component of componentsFromCompat) {
              if (component) {
                // Check if this component is also imported directly
                const directImports = directImportMatch.filter(line => 
                  new RegExp(`\\b${component}\\b`).test(line)
                );
                
                if (directImports.length > 0) {
                  // Remove the component from chakra-compat import
                  const regex = new RegExp(`(import\\s+{[^}]*?)\\b${component}\\b\\s*,?\\s*([^}]*})\\s+from\\s+['"]@\\/utils\\/chakra-compat['"]`);
                  const replacement = '$1$2 from "@/utils/chakra-compat"';
                  updatedContent = updatedContent.replace(regex, replacement);
                  hasDuplicates = true;
                }
              }
            }
            
            // Clean up empty or malformed imports
            if (hasDuplicates) {
              updatedContent = updatedContent.replace(/import\s+{\s*}\s+from\s+['"]@\/utils\/chakra-compat['"]/g, '');
              updatedContent = updatedContent.replace(/import\s+{\s*,\s*([^}]+)}\s+from/g, 'import { $1} from');
              updatedContent = updatedContent.replace(/,\s*}/g, ' }');
              
              // Write the changes
              if (updatedContent !== content) {
                fs.writeFileSync(filePath, updatedContent);
                console.log(`✅ Fixed duplicate Chakra imports in ${file}`);
                fixedCount++;
              }
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    }
    
    console.log(`✨ Fixed duplicate Chakra imports in ${fixedCount} files`);
    return fixedCount;
  } catch (error) {
    console.error('❌ Error finding files with duplicate Chakra imports:', error);
    return 0;
  }
}

// Get current error count
function getErrorCount() {
  try {
    execSync('npx tsc --noEmit', { stdio: 'ignore' });
    return 0;
  } catch (error) {
    try {
      const result = execSync('npx tsc --noEmit | wc -l', { encoding: 'utf8' });
      return parseInt(result.trim(), 10);
    } catch (err) {
      console.error('Error getting error count:', err);
      return -1; // Error
    }
  }
}

// Main function to orchestrate all fixes
async function fixAllSyntaxErrors() {
  try {
    // Get initial error count
    const initialErrorCount = getErrorCount();
    console.log(`🔍 Initial TypeScript error count: ${initialErrorCount}`);
    
    // Fix specific components first
    let fixedTotal = 0;
    if (fixNavbarComponent()) fixedTotal++;
    if (fixAppPage()) fixedTotal++;
    if (fixApiClient()) fixedTotal++;
    
    // Fix all parameter syntax errors
    const paramFixCount = fixAllParameterSyntaxErrors();
    fixedTotal += paramFixCount;
    
    // Fix all duplicate Chakra imports
    const chakraFixCount = fixAllDuplicateChakraImports();
    fixedTotal += chakraFixCount;
    
    // Get final error count
    const finalErrorCount = getErrorCount();
    
    console.log('\n📊 TypeScript Error Fix Summary:');
    console.log(`Initial error count: ${initialErrorCount}`);
    console.log(`Files fixed: ${fixedTotal}`);
    console.log(`Final error count: ${finalErrorCount}`);
    console.log(`Reduction: ${initialErrorCount - finalErrorCount} errors (${
      initialErrorCount > 0 ? 
      Math.round(((initialErrorCount - finalErrorCount) / initialErrorCount) * 100) : 
      0
    }%)`);
    
    if (finalErrorCount === 0) {
      console.log('\n🎉 All TypeScript errors have been fixed!');
    } else {
      console.log(`\n🛠️ ${finalErrorCount} errors remain. Consider running final-typescript-fix.js to add @ts-nocheck to remaining problematic files.`);
    }
  } catch (error) {
    console.error('❌ Error in fixAllSyntaxErrors:', error);
  }
}

// Run the script
fixAllSyntaxErrors().catch(error => {
  console.error('❌ Error running fix script:', error);
});