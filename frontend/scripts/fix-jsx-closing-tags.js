#!/usr/bin/env node

/**
 * Fix JSX closing tags and structure issues
 * 
 * This script specifically targets components with unclosed JSX tags and
 * structural syntax errors in JSX, focusing on resolving TypeScript errors
 * related to JSX structure.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root directory
const ROOT_DIR = process.cwd();

// Files with the most JSX structure issues
const PROBLEM_FILES = [
  // Components with severe JSX structure issues
  'src/components/layout/Sidebar.tsx',
  'src/components/common/QueryStateHandler.tsx',
  'src/components/layout/Navbar.tsx',
  'src/features/warehouse/components/WarehouseForm.tsx',
  'src/features/warehouse/components/WarehouseManagement.tsx', 
  'src/features/warehouse/components/WarehouseStats.tsx',
  'src/features/ai-cs-agent/components/AIChatInterface.tsx',
  'src/features/ai-cs-agent/components/FloatingChatButton.tsx',
  'src/features/buybox/contexts/BuyBoxContext.tsx',
  'src/features/buybox/pages/BuyBoxDashboardPage.tsx'
];

// Function to check TypeScript errors in a file
function getFileErrors(filePath) {
  try {
    const output = execSync(`npx tsc --noEmit ${filePath} 2>&1`, { 
      cwd: ROOT_DIR,
      encoding: 'utf8'
    });
    return { errors: [] };
  } catch (error) {
    // Extract errors from the error output
    const errors = [];
    const lines = error.stdout.toString().split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([^(]+)\((\d+),(\d+)\): error TS(\d+): (.+)$/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5]
        });
      }
    }
    
    return { errors };
  }
}

// Function to fix self-closing tags
function fixSelfClosingTags(content) {
  // Find JSX elements that are missing their self-closing slash
  const selfClosingRegex = /<(Spinner|Input|Textarea|Avatar|Image|AlertIcon|Divider|Spacer|Icon|CheckCircle|AlertTriangle|Plus|Search|Eye|Edit|Trash|RefreshCcw)([^>]*?)>(?!\s*<\/\1>)/g;
  return content.replace(selfClosingRegex, '<$1$2 />');
}

// Function to fix JSX fragment issues
function fixJSXFragments(content) {
  // Fix unclosed JSX fragments
  let updatedContent = content.replace(/<>([^<]*?)<([^>\/]+)(?!\s*\/>|>)/g, '<>$1<$2>');
  
  // Fix open fragments without closing
  const openFragmentCount = (updatedContent.match(/<>/g) || []).length;
  const closeFragmentCount = (updatedContent.match(/<\/>/g) || []).length;
  
  if (openFragmentCount > closeFragmentCount) {
    // Find the last return statement and add missing fragment closings
    const lastReturnIndex = updatedContent.lastIndexOf('return (');
    if (lastReturnIndex >= 0) {
      // Find the closing parenthesis of the return statement
      let depth = 0;
      let returnCloseIndex = -1;
      
      for (let i = lastReturnIndex + 7; i < updatedContent.length; i++) {
        if (updatedContent[i] === '(') {
          depth++;
        } else if (updatedContent[i] === ')') {
          if (depth === 0) {
            returnCloseIndex = i;
            break;
          }
          depth--;
        }
      }
      
      if (returnCloseIndex > 0) {
        // Add missing fragment closings before the return's closing parenthesis
        const missingClosings = openFragmentCount - closeFragmentCount;
        const closingTags = '</>\n'.repeat(missingClosings);
        updatedContent = updatedContent.slice(0, returnCloseIndex) + closingTags + updatedContent.slice(returnCloseIndex);
      }
    }
  }
  
  return updatedContent;
}

// Function to fix unclosed JSX tags
function fixUnclosedJSXTags(content, componentName) {
  const jsxTagRegex = /<([A-Z][A-Za-z0-9]*)([^>]*?)>/g;
  const selfClosingTags = ['Spinner', 'Input', 'Textarea', 'Avatar', 'Image', 'AlertIcon', 'Divider', 'Spacer', 'Icon', 'CheckCircle', 'AlertTriangle', 'Plus', 'Search', 'Eye', 'Edit', 'Trash', 'RefreshCcw'];
  
  // Extract all opening tags
  const openingTags = [];
  let match;
  while ((match = jsxTagRegex.exec(content)) !== null) {
    const tagName = match[1];
    const isSelfClosing = selfClosingTags.includes(tagName) || match[2].endsWith('/');
    
    if (!isSelfClosing) {
      openingTags.push({
        name: tagName,
        position: match.index + match[0].length
      });
    }
  }
  
  // Check for closing tags
  for (let i = openingTags.length - 1; i >= 0; i--) {
    const tag = openingTags[i];
    const closingTagRegex = new RegExp(`<\\/${tag.name}>`, 'g');
    
    // Reset the regex lastIndex to search from the opening tag position
    closingTagRegex.lastIndex = tag.position;
    
    if (!closingTagRegex.exec(content)) {
      // No closing tag found, add it before the nearest closing tag of a parent
      const parentClosingIndex = findAppropriateClosingPosition(content, tag.position);
      if (parentClosingIndex > 0) {
        content = content.slice(0, parentClosingIndex) + `</${tag.name}>` + content.slice(parentClosingIndex);
      }
    }
  }
  
  return content;
}

// Helper function to find appropriate position for a closing tag
function findAppropriateClosingPosition(content, startPosition) {
  // Look for closing JSX tags or closing braces after the start position
  const closingPattern = /(<\/[A-Z][A-Za-z0-9]*>|}|\))/g;
  closingPattern.lastIndex = startPosition;
  
  const match = closingPattern.exec(content);
  return match ? match.index : content.length - 1;
}

// Function to fix specific component issues
function applyComponentSpecificFixes(content, filePath) {
  // Extract the component name from the file path
  const componentName = path.basename(filePath, path.extname(filePath));
  
  // Apply fixes based on component name
  switch (componentName) {
    case 'QueryStateHandler.tsx':
      // Fix specific issues in QueryStateHandler component
      content = content.replace(
        /const\s+\{\s*children\s*,\s*isLoading\s*,\s*loading\s*,\s*isError\s*,\s*error\s*,\s*useSkeleton\s*,\s*skeletonHeight\s*,\s*skeletonLines\s*,\s*\.\.\.props\s*\}\s*=\s*props;/,
        'const { children, isLoading, loading, isError, error, useSkeleton, skeletonHeight, skeletonLines, ...props } = props;'
      );
      // Fix missing closing parenthesis and JSX tags
      content = content.replace(
        /return\s*\(\s*<>/,
        'return ('
      );
      
      // Fix the return block by making sure it's properly closed
      if (content.includes('return (') && !content.includes('return (\n  {')) {
        content = content.replace(
          /return\s*\(([^)]*)\)/s,
          (match, inside) => {
            // Check if the return block has proper JSX structure
            if (!inside.trim().startsWith('<') || !inside.trim().endsWith('>')) {
              return `return (\n  ${inside}\n)`;
            }
            return match;
          }
        );
      }
      break;
      
    case 'Sidebar.tsx':
      // Fix specific issues in Sidebar component
      // Replace the problematic Flex component
      content = content.replace(
        /<Flex([^>]*)>/g,
        '<Flex$1>'
      );
      
      // Add missing closing tags for Link and VStack
      content = content.replace(
        /(<Link[^>]*>[^<]*?)(<\/VStack>)/g,
        '$1</Link>$2'
      );
      break;
      
    case 'BuyBoxContext.tsx':
      // Fix BuyBoxContext closing parenthesis/brackets
      content = content.replace(
        /export\s+const\s+BuyBoxContext\s*=\s*createContext\s*\(\s*{([^}]*?)}\s*\)/s,
        'export const BuyBoxContext = createContext({\n$1\n})'
      );
      break;
      
    case 'BuyBoxDashboardPage.tsx':
      // Fix self-closing tags for icons
      content = content.replace(/<(RefreshCcw|CheckCircle|AlertTriangle|Plus)([^>]*?)>/g, '<$1$2 />');
      break;
      
    case 'WarehouseForm.tsx':
      // Fix unclosed Input and Textarea elements
      content = content.replace(/<(Input|Textarea)([^>]*?)>/g, '<$1$2 />');
      // Fix string literal issues
      content = content.replace(/(?<=")(?:\\"|[^"])*?(?=[^"]*$)/g, (match) => match + '"');
      break;
      
    case 'WarehouseManagement.tsx':
      // Fix self-closing tags for icons
      content = content.replace(/<(Search|Eye|Edit|Trash|Spinner)([^>]*?)>/g, '<$1$2 />');
      // Fix missing closing </WarehouseInventory> and </WarehouseStats> tags
      if (content.includes('<WarehouseInventory') && !content.includes('</WarehouseInventory>')) {
        content = content.replace(
          /(<WarehouseInventory[^>]*>)([^<]*?)(?=<WarehouseStats|<\/Card>)/,
          '$1$2</WarehouseInventory>'
        );
      }
      if (content.includes('<WarehouseStats') && !content.includes('</WarehouseStats>')) {
        content = content.replace(
          /(<WarehouseStats[^>]*>)([^<]*?)(?=<\/Card>)/,
          '$1$2</WarehouseStats>'
        );
      }
      break;
  }
  
  return content;
}

// Fix bracket balance for broken JSX expressions
function fixBracketBalance(content) {
  // Fix missing curly braces in JSX expressions
  let fixedContent = content;
  
  // Find JSX attribute expressions with unbalanced braces
  const attrRegex = /=\s*{\s*([^{}]*?)(?<!\})\s*(?=\S|\/|>)/g;
  fixedContent = fixedContent.replace(attrRegex, '={$1}');
  
  // Fix missing closing brackets in JSX expressions
  const exprRegex = /{([^{}]*?)(?<!\})(?=\s*[,;]|\s*\/|"|\s*>|\s*\))/g;
  fixedContent = fixedContent.replace(exprRegex, '{$1}');
  
  return fixedContent;
}

// Process a single file
function processFile(filePath) {
  console.log(`🔧 Processing ${filePath}...`);
  
  try {
    // Get original content
    const fullPath = path.join(ROOT_DIR, filePath);
    const originalContent = fs.readFileSync(fullPath, 'utf8');
    let updatedContent = originalContent;
    
    // Apply fixes
    updatedContent = fixSelfClosingTags(updatedContent);
    updatedContent = fixJSXFragments(updatedContent);
    updatedContent = fixUnclosedJSXTags(updatedContent, path.basename(filePath));
    updatedContent = fixBracketBalance(updatedContent);
    updatedContent = applyComponentSpecificFixes(updatedContent, filePath);
    
    // Write updated content if changes were made
    if (updatedContent !== originalContent) {
      fs.writeFileSync(fullPath, updatedContent);
      console.log(`✅ Fixed JSX structure in ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ No changes made to ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  try {
    console.log('🚀 Starting JSX closing tags fix script');
    
    // Process each file in the problem list
    let fixedFiles = 0;
    for (const filePath of PROBLEM_FILES) {
      const fixed = processFile(filePath);
      if (fixed) fixedFiles++;
    }
    
    console.log(`\n📊 Fixed JSX structure in ${fixedFiles} of ${PROBLEM_FILES.length} files`);
    
    // Run TypeScript check to see if we fixed the errors
    console.log('\n🔍 Checking for remaining TypeScript errors...');
    let remainingErrors = 0;
    
    try {
      execSync('npx tsc --noEmit', { 
        cwd: ROOT_DIR 
      });
      console.log('✅ All TypeScript errors fixed!');
    } catch (error) {
      // Count remaining errors
      const errorMatches = error.stdout.toString().match(/error TS\d+/g);
      remainingErrors = errorMatches ? errorMatches.length : 0;
      console.log(`⚠️ ${remainingErrors} TypeScript errors remain`);
    }
    
    return remainingErrors;
  } catch (error) {
    console.error('❌ Error:', error);
    return -1;
  }
}

// Run the script
const remainingErrors = main();
process.exit(remainingErrors > 0 ? 1 : 0);