/**
 * A script to migrate from Chakra UI icons to Lucide React icons
 * 
 * Usage: node scripts/migrate-icons.js [file or directory path]
 * If no path is provided, scans all .tsx files in src/
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

// Icon mapping (same as in the ESLint rule)
const iconMap = {
  // Basic shapes and actions
  'CheckIcon': 'Check',
  'CloseIcon': 'X',
  'AddIcon': 'Plus',
  'MinusIcon': 'Minus',
  'SmallAddIcon': 'Plus',
  'SmallCloseIcon': 'X',
  
  // Chevrons and arrows
  'ChevronDownIcon': 'ChevronDown',
  'ChevronUpIcon': 'ChevronUp',
  'ChevronLeftIcon': 'ChevronLeft',
  'ChevronRightIcon': 'ChevronRight',
  'ArrowBackIcon': 'ArrowLeft',
  'ArrowForwardIcon': 'ArrowRight',
  'ArrowUpIcon': 'ArrowUp',
  'ArrowDownIcon': 'ArrowDown',
  'ArrowLeftIcon': 'ArrowLeft',
  'ArrowRightIcon': 'ArrowRight',
  
  // Common UI actions
  'SearchIcon': 'Search',
  'EditIcon': 'Edit',
  'DeleteIcon': 'Trash',
  'ViewIcon': 'Eye',
  'ViewOffIcon': 'EyeOff',
  'DownloadIcon': 'Download',
  'UploadIcon': 'Upload',
  'RepeatIcon': 'RotateCw',
  'RepeatClockIcon': 'RotateClockwise',
  'CalendarIcon': 'Calendar',
  'TimeIcon': 'Clock',
  'SpinnerIcon': 'Loader',
  'StarIcon': 'Star',
  'LinkIcon': 'Link',
  'ExternalLinkIcon': 'ExternalLink',
  'EmailIcon': 'Mail',
  'PhoneIcon': 'Phone',
  'AttachmentIcon': 'Paperclip',
  'LockIcon': 'Lock',
  'UnlockIcon': 'Unlock',
  
  // Notifications and statuses
  'WarningIcon': 'AlertTriangle',
  'InfoIcon': 'Info',
  'InfoOutlineIcon': 'Info',
  'QuestionIcon': 'HelpCircle',
  'QuestionOutlineIcon': 'HelpCircle',
  'WarningTwoIcon': 'AlertCircle',
  'NotAllowedIcon': 'XCircle',
  'TriangleDownIcon': 'ChevronDown',
  'TriangleUpIcon': 'ChevronUp',
  'BellIcon': 'Bell',
  
  // Media and content
  'CopyIcon': 'Copy',
  'HamburgerIcon': 'Menu',
  'SunIcon': 'Sun',
  'MoonIcon': 'Moon',
  'SettingsIcon': 'Settings',
  'ChatIcon': 'MessageSquare',
  'AtSignIcon': 'AtSign',
  'PlusSquareIcon': 'PlusSquare',
  'MinusSquareIcon': 'MinusSquare',
};

// Reverse map for quick lookup
const reverseIconMap = {};
Object.entries(iconMap).forEach(([chakra, lucide]) => {
  reverseIconMap[lucide] = chakra;
});

async function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    
    // Check if file uses Chakra icons
    if (!content.includes('@chakra-ui/icons')) {
      console.log(`  No Chakra icons found in ${filePath}, skipping.`);
      return false;
    }
    
    // Find all Chakra icon imports - both direct imports and dynamic requires
    const hasChakraIcons = content.includes('@chakra-ui/icons');
    
    // Look for direct imports
    const chakraIconImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@chakra-ui\/icons['"]/g;
    const iconImportMatches = [...content.matchAll(chakraIconImportRegex)];
    
    // Look for dynamic requires
    const requireIconRegex = /const\s+(\w+Icon)\s+=.*require\(['"]@chakra-ui\/icons['"]\)\.(\w+Icon)/g;
    const requireIconMatches = [...content.matchAll(requireIconRegex)];
    
    if (iconImportMatches.length === 0 && requireIconMatches.length === 0) {
      console.log(`  No Chakra icon imports found in ${filePath}, skipping.`);
      return false;
    }
    
    let updatedContent = content;
    let changes = 0;
    let allKnownIcons = [];
    let allLucideIcons = [];
    
    // Process each direct import statement
    for (const match of iconImportMatches) {
      const importStatement = match[0];
      const importedIcons = match[1].split(',').map(i => i.trim());
      
      // Filter to only include known icons
      const knownIcons = importedIcons.filter(icon => iconMap[icon]);
      allKnownIcons = [...allKnownIcons, ...knownIcons];
      
      if (knownIcons.length === 0) {
        console.log(`  No mappable icons found in import: ${importStatement}`);
        continue;
      }
      
      // Map Chakra icons to Lucide icons
      const lucideIcons = knownIcons.map(icon => iconMap[icon]).sort();
      allLucideIcons = [...allLucideIcons, ...lucideIcons];
      
      // Create the new import statement
      const newImportStatement = `import { ${lucideIcons.join(', ')} } from 'lucide-react'`;
      
      // Replace the Chakra import with Lucide import
      updatedContent = updatedContent.replace(importStatement, newImportStatement);
      
      console.log(`  Replaced: ${importStatement}`);
      console.log(`  With: ${newImportStatement}`);
      changes++;
    }
    
    // Process each dynamic require
    if (requireIconMatches.length > 0) {
      // Collect all required icons
      const requiredIcons = [];
      for (const match of requireIconMatches) {
        const iconVar = match[1];
        // Check if this icon is in our map
        if (iconMap[iconVar]) {
          requiredIcons.push(iconVar);
        }
      }
      
      if (requiredIcons.length > 0) {
        // Add these to our list of icons to process
        allKnownIcons = [...allKnownIcons, ...requiredIcons];
        
        // Map to Lucide equivalents
        const lucideRequiredIcons = requiredIcons.map(icon => iconMap[icon]).sort();
        allLucideIcons = [...allLucideIcons, ...lucideRequiredIcons];
        
        // Remove the dynamic require code
        const requireSetupRegex = /\/\/ Use the ChakraProvider import to reference the full package\s*\nconst ChakraReact = .*\n/;
        updatedContent = updatedContent.replace(requireSetupRegex, '');
        
        // Remove all the requires
        for (const icon of requiredIcons) {
          const requireLine = new RegExp(`const ${icon} = .*require\\(['"]@chakra-ui\\/icons['"]\\).*\\n`, 'g');
          updatedContent = updatedContent.replace(requireLine, '');
        }
        
        // Add imports for Lucide icons at the top
        // Find the last import statement
        const lastImportRegex = /^import.*from.*;$/gm;
        const lastImportMatch = [...updatedContent.matchAll(lastImportRegex)].pop();
        
        if (lastImportMatch) {
          const lastImport = lastImportMatch[0];
          const uniqueLucideIcons = [...new Set(allLucideIcons)].sort();
          const lucideImport = `import { ${uniqueLucideIcons.join(', ')} } from 'lucide-react';`;
          
          // Insert after the last import
          updatedContent = updatedContent.replace(
            lastImport,
            `${lastImport}\n${lucideImport}`
          );
          
          console.log(`  Added: ${lucideImport}`);
          changes++;
        }
      }
    }
    
    // Replace icon usage in JSX for all known icons
    if (allKnownIcons.length > 0) {
      for (const chakraIcon of allKnownIcons) {
        const lucideIcon = iconMap[chakraIcon];
        
        // Replace <ChakraIcon /> with <LucideIcon size={16} />
        const chakraIconJsxRegex = new RegExp(`<${chakraIcon}(\\s+[^>]*)?\\s*\\/?>`, 'g');
        updatedContent = updatedContent.replace(chakraIconJsxRegex, (match, props) => {
          return `<${lucideIcon}${props ? props : ''} size={16} />`;
        });
        
        // Also handle cases with children: <ChakraIcon>...</ChakraIcon>
        const chakraIconWithChildrenRegex = new RegExp(`<${chakraIcon}(\\s+[^>]*)?>(.*?)<\\/${chakraIcon}>`, 'g');
        updatedContent = updatedContent.replace(chakraIconWithChildrenRegex, (match, props, children) => {
          return `<${lucideIcon}${props ? props : ''} size={16}>${children}</${lucideIcon}>`;
        });
      }
    }
    
    // Write updated content back to file if changes were made
    if (changes > 0) {
      await writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath} with ${changes} changes`);
      return true;
    } else {
      console.log(`  No changes made to ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

async function walkDirectory(dirPath) {
  const entries = await readdir(dirPath);
  let changedFiles = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry === 'node_modules' || entry === '.next' || entry === 'public') {
        continue;
      }
      changedFiles += await walkDirectory(fullPath);
    } else if (stats.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx'))) {
      const changed = await processFile(fullPath);
      if (changed) changedFiles++;
    }
  }
  
  return changedFiles;
}

async function main() {
  try {
    console.log('🔍 Starting Chakra to Lucide icon migration...');
    
    // Get the target from command line args or default to src/
    const target = process.argv[2] || 'src';
    const targetPath = path.resolve(process.cwd(), target);
    
    const stats = await stat(targetPath);
    let changedFiles = 0;
    
    if (stats.isDirectory()) {
      console.log(`📁 Processing directory: ${targetPath}`);
      changedFiles = await walkDirectory(targetPath);
    } else if (stats.isFile()) {
      console.log(`📄 Processing file: ${targetPath}`);
      const changed = await processFile(targetPath);
      if (changed) changedFiles++;
    } else {
      console.error(`❌ Target is neither a file nor a directory: ${targetPath}`);
      process.exit(1);
    }
    
    console.log(`✨ Migration complete! Changed ${changedFiles} files.`);
    
    if (changedFiles > 0) {
      console.log('');
      console.log('🔍 NOTE: Please review the changes manually to ensure correctness.');
      console.log('   The script adds size={16} to all icons, but you may want to adjust');
      console.log('   this based on your design requirements.');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();