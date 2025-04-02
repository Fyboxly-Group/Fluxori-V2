#!/usr/bin/env node

/**
 * Script to replace Chakra UI icons with Lucide React icons
 * This script will:
 * 1. Find imports from '@chakra-ui/icons'
 * 2. Replace them with equivalent imports from 'lucide-react'
 * 3. Update the icon usage in JSX
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const { execSync } = require('child_process');

// Map of Chakra UI icons to Lucide React icons
const ICON_MAP = {
  'BellIcon': 'Bell',
  'CheckIcon': 'Check',
  'CheckCircleIcon': 'CheckCircle',
  'CloseIcon': 'X',
  'InfoIcon': 'Info',
  'WarningIcon': 'AlertTriangle',
  'WarningTwoIcon': 'AlertTriangle',
  'RepeatIcon': 'RefreshCcw',
  'SearchIcon': 'Search',
  'ArrowUpIcon': 'ArrowUp',
  'ArrowDownIcon': 'ArrowDown',
  'ArrowForwardIcon': 'ArrowRight',
  'ChevronDownIcon': 'ChevronDown',
  'ChevronUpIcon': 'ChevronUp',
  'ChevronRightIcon': 'ChevronRight',
  'ChevronLeftIcon': 'ChevronLeft',
  'ExternalLinkIcon': 'ExternalLink',
  'PlusSquareIcon': 'PlusSquare',
  'MinusIcon': 'Minus',
  'AddIcon': 'Plus',
  'StarIcon': 'Star',
  'DownloadIcon': 'Download',
  'SettingsIcon': 'Settings',
  'DeleteIcon': 'Trash',
  'EditIcon': 'Edit',
  'TimeIcon': 'Clock',
  'EmailIcon': 'Mail',
  'PhoneIcon': 'Phone',
  'LockIcon': 'Lock',
  'UnlockIcon': 'Unlock',
  'ViewIcon': 'Eye',
  'ViewOffIcon': 'EyeOff',
  'CalendarIcon': 'Calendar',
  'AttachmentIcon': 'Paperclip',
  'ClockIcon': 'Clock',
  'CopyIcon': 'Copy',
  'LinkIcon': 'Link',
  'QuestionIcon': 'HelpCircle',
  'QuestionOutlineIcon': 'HelpCircle',
  'SpinnerIcon': 'Loader',
};

// Stats tracking
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  iconsReplaced: 0,
};

/**
 * Process a file to replace Chakra icons with Lucide icons
 */
async function processFile(filePath) {
  try {
    let fileModified = false;
    
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    let updatedContent = content;
    
    // Check if the file imports from '@chakra-ui/icons'
    const chakraIconsImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@chakra-ui\/icons['"]/g;
    const chakraIconsImportMatch = chakraIconsImportRegex.exec(updatedContent);
    
    if (chakraIconsImportMatch) {
      const importedIcons = chakraIconsImportMatch[1]
        .split(',')
        .map(icon => icon.trim())
        .filter(Boolean);
      
      // Track which Lucide icons we need to import
      const lucideIcons = [];
      
      // Replace each icon usage
      for (const chakraIcon of importedIcons) {
        const lucideIcon = ICON_MAP[chakraIcon];
        
        if (lucideIcon) {
          // Add to our list of lucide icons to import
          lucideIcons.push(lucideIcon);
          
          // Replace JSX usage
          const jsxRegex = new RegExp(`<${chakraIcon}([^>]*)>`, 'g');
          updatedContent = updatedContent.replace(jsxRegex, `<${lucideIcon}$1>`);
          
          // Replace JSX self-closing tags
          const jsxSelfClosingRegex = new RegExp(`<${chakraIcon}([^>/]*)\/>`, 'g');
          updatedContent = updatedContent.replace(jsxSelfClosingRegex, `<${lucideIcon}$1/>`);
          
          // Replace variable references (like icon={BellIcon})
          const propsRegex = new RegExp(`icon={${chakraIcon}}`, 'g');
          updatedContent = updatedContent.replace(propsRegex, `icon={<${lucideIcon} />}`);
          
          // Replace other types of references that might appear
          const refRegex = new RegExp(`([^\\w])${chakraIcon}([^\\w])`, 'g');
          updatedContent = updatedContent.replace(refRegex, `$1${lucideIcon}$2`);
          
          stats.iconsReplaced++;
        }
      }
      
      // Add the Lucide React import
      if (lucideIcons.length > 0) {
        const lucideImport = `import { ${lucideIcons.join(', ')} } from 'lucide-react';`;
        updatedContent = updatedContent.replace(chakraIconsImportMatch[0], lucideImport);
        fileModified = true;
      }
    }
    
    // Write changes back to file if needed
    if (fileModified) {
      await writeFile(filePath, updatedContent, 'utf8');
      stats.filesModified++;
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
    }
    
    stats.filesProcessed++;
    return fileModified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Process all TypeScript/JavaScript files in a directory recursively
 */
async function walkDirectory(dirPath) {
  const entries = await readdir(dirPath);
  let modifiedFiles = 0;
  
  for (const entry of entries) {
    // Skip hidden files and directories
    if (entry.startsWith('.')) continue;
    
    const fullPath = path.join(dirPath, entry);
    const statInfo = await stat(fullPath);
    
    if (statInfo.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry === 'node_modules' || entry === '.next' || entry === 'public') {
        continue;
      }
      modifiedFiles += await walkDirectory(fullPath);
    } else if (statInfo.isFile() && /\.(jsx?|tsx?)$/.test(fullPath)) {
      const modified = await processFile(fullPath);
      if (modified) modifiedFiles++;
    }
  }
  
  return modifiedFiles;
}

/**
 * Print statistics about the fixes applied
 */
function printStats() {
  console.log('\n📊 Chakra UI Icons Replacement Statistics:');
  console.log('----------------------------------------');
  console.log(`📄 Files Processed: ${stats.filesProcessed}`);
  console.log(`✨ Files Modified: ${stats.filesModified}`);
  console.log(`🔄 Icons Replaced: ${stats.iconsReplaced}`);
  console.log('----------------------------------------');
}

/**
 * After fixing imports, try to build the project to see if we've addressed all issues
 */
async function runBuild() {
  console.log('\n🔨 Running build to verify fixes...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful!');
    return true;
  } catch (error) {
    console.log('❌ Build failed. Some issues might still need to be addressed.');
    return false;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    console.log('🚀 Starting Chakra UI Icons replacement...');
    
    // Get the target from command line args or default to src/
    const target = process.argv[2] || 'src';
    const targetPath = path.resolve(process.cwd(), target);
    
    const statInfo = await stat(targetPath);
    
    if (statInfo.isDirectory()) {
      console.log(`📁 Processing directory: ${targetPath}`);
      await walkDirectory(targetPath);
    } else if (statInfo.isFile()) {
      console.log(`📄 Processing file: ${targetPath}`);
      await processFile(targetPath);
    } else {
      console.error(`❌ Target is neither a file nor a directory: ${targetPath}`);
      process.exit(1);
    }
    
    printStats();
    
    // Verify fixes by running a build
    await runBuild();
    
    console.log('✨ Chakra UI icons replacement completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();