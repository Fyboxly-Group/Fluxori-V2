/**
 * TypeScript Issue Analyzer
 * 
 * This script analyzes the TypeScript files in the codebase to identify files with
 * @ts-nocheck directives and categorize them for prioritized fixing based on the
 * sustainable TypeScript strategy.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration - adjust these to change the analysis
const CRITICAL_MODULES = [
  'src/controllers',
  'src/middleware',
  'src/models',
  'src/routes',
  'src/modules/auth',
  'src/modules/connections',
  'src/modules/users',
];

// File classification
function classifyFile(filePath) {
  // Check if file is in a critical module
  const isCritical = CRITICAL_MODULES.some(criticalPath => 
    filePath.startsWith(criticalPath)
  );
  
  // Identify module from file path
  const pathParts = filePath.split('/');
  let module = 'core';
  
  if (pathParts.includes('modules') && pathParts.length > pathParts.indexOf('modules') + 1) {
    module = pathParts[pathParts.indexOf('modules') + 1];
  }
  
  // Determine file type
  let fileType = 'other';
  
  if (filePath.includes('controller')) {
    fileType = 'controller';
  } else if (filePath.includes('service')) {
    fileType = 'service';
  } else if (filePath.includes('model')) {
    fileType = 'model';
  } else if (filePath.includes('route')) {
    fileType = 'route';
  } else if (filePath.includes('middleware')) {
    fileType = 'middleware';
  } else if (filePath.includes('utils')) {
    fileType = 'utility';
  }
  
  return {
    path: filePath,
    module,
    fileType,
    priority: isCritical ? 'high' : 'medium',
  };
}

// Analyze errors in the file
function analyzeFileErrors(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Check for @ts-nocheck directives
    const hasNoCheck = content.includes('// @ts-nocheck');
    
    // Extract imports to understand dependencies
    const imports = [];
    const importRegex = /import\s+([^;]+?)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        importStatement: match[1],
        importPath: match[2],
      });
    }
    
    // Identify any usage of 'any' type
    const anyTypeCount = (content.match(/:\s*any/g) || []).length;
    
    // Check for mongoose models
    const isMongooseModel = content.includes('mongoose.model') || 
                            content.includes('mongoose.Schema');
    
    // Check for controller methods
    const controllerMethodCount = (content.match(/static\s+async\s+\w+/g) || []).length;
    
    return {
      hasNoCheck,
      imports,
      importCount: imports.length,
      anyTypeCount,
      isMongooseModel,
      controllerMethodCount,
      lineCount: lines.length,
    };
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
    return {
      hasNoCheck: false,
      imports: [],
      importCount: 0,
      anyTypeCount: 0,
      isMongooseModel: false,
      controllerMethodCount: 0,
      lineCount: 0,
      error: error.message,
    };
  }
}

// Main function to analyze the codebase
async function analyzeCodebase() {
  // Find all TypeScript files
  const tsFiles = glob.sync('src/**/*.ts');
  console.log(`Found ${tsFiles.length} TypeScript files`);
  
  // Analyze each file
  const fileAnalysis = [];
  
  for (const file of tsFiles) {
    const classification = classifyFile(file);
    const errors = analyzeFileErrors(file);
    
    fileAnalysis.push({
      ...classification,
      ...errors,
    });
  }
  
  // Generate statistics
  const stats = {
    totalFiles: fileAnalysis.length,
    filesWithNoCheck: fileAnalysis.filter(f => f.hasNoCheck).length,
    filesByPriority: {
      high: fileAnalysis.filter(f => f.priority === 'high').length,
      medium: fileAnalysis.filter(f => f.priority === 'medium').length,
      low: fileAnalysis.filter(f => f.priority === 'low').length,
    },
    filesByType: {
      controller: fileAnalysis.filter(f => f.fileType === 'controller').length,
      service: fileAnalysis.filter(f => f.fileType === 'service').length,
      model: fileAnalysis.filter(f => f.fileType === 'model').length,
      route: fileAnalysis.filter(f => f.fileType === 'route').length,
      middleware: fileAnalysis.filter(f => f.fileType === 'middleware').length,
      utility: fileAnalysis.filter(f => f.fileType === 'utility').length,
      other: fileAnalysis.filter(f => f.fileType === 'other').length,
    },
    filesWithAny: fileAnalysis.filter(f => f.anyTypeCount > 0).length,
    totalAnyUsage: fileAnalysis.reduce((sum, f) => sum + f.anyTypeCount, 0),
    mongooseModels: fileAnalysis.filter(f => f.isMongooseModel).length,
  };
  
  // Generate prioritized fix list
  const highPriorityFixes = fileAnalysis
    .filter(f => f.hasNoCheck && f.priority === 'high')
    .sort((a, b) => {
      // Sort by file type importance (models and controllers first)
      const typeOrder = { model: 0, controller: 1, middleware: 2, route: 3, service: 4, utility: 5, other: 6 };
      return typeOrder[a.fileType] - typeOrder[b.fileType];
    });
    
  const mediumPriorityFixes = fileAnalysis
    .filter(f => f.hasNoCheck && f.priority === 'medium')
    .sort((a, b) => {
      // Sort by file type importance
      const typeOrder = { model: 0, controller: 1, middleware: 2, route: 3, service: 4, utility: 5, other: 6 };
      return typeOrder[a.fileType] - typeOrder[b.fileType];
    });
  
  // Write analysis to files
  const outputDir = './typescript-analysis';
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  // Write statistics
  fs.writeFileSync(
    path.join(outputDir, 'stats.json'), 
    JSON.stringify(stats, null, 2)
  );
  
  // Write high priority fixes
  fs.writeFileSync(
    path.join(outputDir, 'high-priority-fixes.json'),
    JSON.stringify(highPriorityFixes, null, 2)
  );
  
  // Write medium priority fixes
  fs.writeFileSync(
    path.join(outputDir, 'medium-priority-fixes.json'),
    JSON.stringify(mediumPriorityFixes, null, 2)
  );
  
  // Write complete analysis
  fs.writeFileSync(
    path.join(outputDir, 'complete-analysis.json'),
    JSON.stringify(fileAnalysis, null, 2)
  );
  
  // Generate human-readable report
  const report = `# TypeScript Analysis Report
  
## Summary

- Total TypeScript files: ${stats.totalFiles}
- Files with @ts-nocheck: ${stats.filesWithNoCheck} (${Math.round(stats.filesWithNoCheck / stats.totalFiles * 100)}%)
- Files with 'any' type usage: ${stats.filesWithAny} (${Math.round(stats.filesWithAny / stats.totalFiles * 100)}%)
- Total 'any' type usages: ${stats.totalAnyUsage}
- Mongoose models: ${stats.mongooseModels}

## Files by Priority

- High priority: ${stats.filesByPriority.high}
- Medium priority: ${stats.filesByPriority.medium}
- Low priority: ${stats.filesByPriority.low}

## Files by Type

- Controllers: ${stats.filesByType.controller}
- Services: ${stats.filesByType.service}
- Models: ${stats.filesByType.model}
- Routes: ${stats.filesByType.route}
- Middleware: ${stats.filesByType.middleware}
- Utilities: ${stats.filesByType.utility}
- Other: ${stats.filesByType.other}

## High Priority Fixes (${highPriorityFixes.length} files)

${highPriorityFixes.slice(0, 20).map(f => 
  `- ${f.path} (${f.fileType}, ${f.anyTypeCount} any types)`
).join('\n')}
${highPriorityFixes.length > 20 ? `\n... and ${highPriorityFixes.length - 20} more` : ''}

## Medium Priority Fixes (${mediumPriorityFixes.length} files)

${mediumPriorityFixes.slice(0, 20).map(f => 
  `- ${f.path} (${f.fileType}, ${f.anyTypeCount} any types)`
).join('\n')}
${mediumPriorityFixes.length > 20 ? `\n... and ${mediumPriorityFixes.length - 20} more` : ''}

## Next Steps

1. Start with high priority model files
2. Then address high priority controllers
3. Fix route files
4. Work through services and middleware
5. Finally address utility and other files

See the JSON files in this directory for complete details on each file.
`;

  fs.writeFileSync(
    path.join(outputDir, 'report.md'),
    report
  );
  
  console.log(`
Analysis complete!
Statistics saved to ${path.join(outputDir, 'stats.json')}
High priority fixes saved to ${path.join(outputDir, 'high-priority-fixes.json')}
Medium priority fixes saved to ${path.join(outputDir, 'medium-priority-fixes.json')}
Complete analysis saved to ${path.join(outputDir, 'complete-analysis.json')}
Human-readable report saved to ${path.join(outputDir, 'report.md')}
  `);
}

// Run the analysis
analyzeCodebase().catch(error => {
  console.error('Error analyzing codebase:', error);
});