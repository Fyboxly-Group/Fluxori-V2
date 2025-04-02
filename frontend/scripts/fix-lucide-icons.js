const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Fix Lucide React icon imports
 * This script replaces missing Lucide icon imports with available ones.
 */

// Map of unavailable icon names to available alternatives
const ICON_REPLACEMENTS = {
  'SendHorizontal': 'Send',
  'MessageCircleMore': 'MessageCircle',
  'PanelRightClose': 'PanelRight',
  'BellRing': 'Bell',
  'ArrowUpRightFromSquare': 'ExternalLink',
  'ClipboardCheck': 'Clipboard',
  'TimelineIcon': 'Clock',
  'Timeline': 'LineChart'
  // Add more as needed
};

// Regex patterns to find and replace icon imports
const LUCIDE_IMPORT_REGEX = /import\s+{([^}]*)}\s+from\s+['"]lucide-react['"]/g;
const ICON_USAGE_REGEX = /<([A-Z][a-zA-Z0-9]*)(\s|\/>|>)/g;

/**
 * Process a file to fix icon imports and usages
 */
async function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;

    // First check if the file uses Lucide React icons
    if (content.includes('from \'lucide-react\'')) {
      // Extract all icon imports
      const importMatches = [...content.matchAll(LUCIDE_IMPORT_REGEX)];
      
      for (const importMatch of importMatches) {
        const importStatement = importMatch[0];
        const importedIcons = importMatch[1].split(',').map(icon => icon.trim());
        
        // Check each imported icon
        let needsUpdate = false;
        let updatedIcons = [];
        
        for (const icon of importedIcons) {
          const iconName = icon.trim();
          if (ICON_REPLACEMENTS[iconName]) {
            console.log(`  Replacing icon: ${iconName} → ${ICON_REPLACEMENTS[iconName]}`);
            updatedIcons.push(ICON_REPLACEMENTS[iconName]);
            needsUpdate = true;
          } else {
            updatedIcons.push(iconName);
          }
        }
        
        if (needsUpdate) {
          // Create updated import statement
          const updatedImport = `import { ${updatedIcons.join(', ')} } from 'lucide-react'`;
          updatedContent = updatedContent.replace(importStatement, updatedImport);
          hasChanges = true;
          
          // Now update any JSX usage of these icons
          for (const [oldIcon, newIcon] of Object.entries(ICON_REPLACEMENTS)) {
            const iconRegex = new RegExp(`<${oldIcon}(\\s|\\/>|>)`, 'g');
            updatedContent = updatedContent.replace(iconRegex, `<${newIcon}$1`);
            
            // Also update closing tags if any
            const closingTagRegex = new RegExp(`</${oldIcon}>`, 'g');
            updatedContent = updatedContent.replace(closingTagRegex, `</${newIcon}>`);
          }
        }
      }
    }

    // Save the file if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`  Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Find and process all files
 */
async function main() {
  const files = glob.sync('src/**/*.{tsx,jsx,ts,js}', { cwd: process.cwd() });
  console.log(`Found ${files.length} files to process`);
  
  for (const file of files) {
    await processFile(file);
  }
  
  console.log('Completed fixing Lucide React icon imports');
}

main().catch(console.error);