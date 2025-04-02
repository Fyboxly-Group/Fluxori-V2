const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Fix TypeScript errors related to event handlers in React components
 */

// Define patterns for fixing event handlers
const EVENT_HANDLER_PATTERNS = [
  {
    // Fix onChange handlers for Checkbox components
    regex: /onChange={(e)(\s*=>\s*.*?e\.target\.checked.*?)}/g,
    fix: (match, param, handler) => `onChange={(e: React.ChangeEvent<HTMLInputElement>)${handler}}`,
    description: 'Add type to Checkbox onChange event handler'
  },
  {
    // Fix onChange handlers for Input components
    regex: /onChange={(e)(\s*=>\s*.*?e\.target\.value.*?)}/g,
    fix: (match, param, handler) => `onChange={(e: React.ChangeEvent<HTMLInputElement>)${handler}}`,
    description: 'Add type to Input onChange event handler'
  },
  {
    // Fix onSubmit handlers for forms
    regex: /onSubmit={(e)(\s*=>\s*.*?)}/g,
    fix: (match, param, handler) => `onSubmit={(e: React.FormEvent<HTMLFormElement>)${handler}}`,
    description: 'Add type to form onSubmit event handler'
  },
  {
    // Fix onClick handlers for buttons
    regex: /onClick={(e)(\s*=>\s*.*?)}/g,
    fix: (match, param, handler) => `onClick={(e: React.MouseEvent<HTMLButtonElement>)${handler}}`,
    description: 'Add type to button onClick event handler'
  }
];

// Make sure we import React in files that use these event types
const IMPORT_REACT_PATTERN = {
  regex: /^(import\s+{[^}]*}\s+from\s+['"]react['"])/gm,
  missingRegex: /import\s+.*?\s+from\s+['"]react['"]/,
  fix: (content) => {
    if (!content.match(/import\s+.*?\s+from\s+['"]react['"]/)) {
      return "import React from 'react'\n" + content;
    }
    return content;
  },
  description: 'Add React import if missing'
};

/**
 * Process the file and apply fixes to event handlers
 */
async function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;

    // Add React import if it's missing and we have event handler patterns
    const needsReactImport = EVENT_HANDLER_PATTERNS.some(pattern => 
      pattern.regex.test(content)
    );
    
    if (needsReactImport && !IMPORT_REACT_PATTERN.missingRegex.test(content)) {
      updatedContent = IMPORT_REACT_PATTERN.fix(updatedContent);
      hasChanges = true;
    }

    // Apply all event handler patterns
    for (const pattern of EVENT_HANDLER_PATTERNS) {
      if (pattern.regex.test(content)) {
        const before = updatedContent;
        updatedContent = updatedContent.replace(pattern.regex, pattern.fix);
        if (before !== updatedContent) {
          console.log(`  Applied: ${pattern.description} in ${filePath}`);
          hasChanges = true;
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
 * Find and process all React component files
 */
async function main() {
  const files = glob.sync('src/**/*.{tsx,jsx}', { cwd: process.cwd() });
  console.log(`Found ${files.length} files to process`);
  
  for (const file of files) {
    await processFile(file);
  }
  
  console.log('Completed fixing event handlers');
}

main().catch(console.error);