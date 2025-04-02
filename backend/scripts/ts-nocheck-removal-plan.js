#!/usr/bin/env node
/**
 * TypeScript @ts-nocheck Removal Plan Generator
 * 
 * This script scans the codebase for @ts-nocheck directives and creates
 * a prioritized plan for removing them incrementally.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const PRODUCTION_DIRS = [
  'src/modules/international-trade',  // Start with the most recently modified module
  'src/modules/buybox',
  'src/modules/ai-insights', 
  'src/types', 
  'src/middleware'
];

function scanForTsNoCheck() {
  console.log('Scanning for @ts-nocheck directives...');
  let filesByModule = {};
  
  // Find all files with @ts-nocheck by module
  for (const dir of PRODUCTION_DIRS) {
    const dirPath = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory ${dir} does not exist, skipping...`);
      continue;
    }
    
    const pattern = path.join(dirPath, '**/*.ts');
    const files = glob.sync(pattern);
    
    const dirFiles = [];
    
    for (const file of files) {
      // Skip test files and declaration files
      if (file.includes('.test.ts') || file.includes('/tests/') || file.endsWith('.d.ts')) {
        continue;
      }
      
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('@ts-nocheck')) {
        const relativePath = path.relative(ROOT_DIR, file);
        
        // Check file complexity to help with prioritization
        const lineCount = content.split('\n').length;
        const importCount = (content.match(/import\s+/g) || []).length;
        const exportCount = (content.match(/export\s+/g) || []).length;
        const anyCount = (content.match(/:\s*any/g) || []).length;
        
        dirFiles.push({
          path: relativePath,
          lineCount,
          importCount,
          exportCount,
          anyCount,
          complexity: lineCount + (importCount * 2) + (exportCount * 2) + (anyCount * 3)
        });
      }
    }
    
    if (dirFiles.length > 0) {
      // Save by module/directory
      const moduleKey = dir.split('/').pop();
      filesByModule[moduleKey] = dirFiles;
    }
  }
  
  return filesByModule;
}

function createRemovalPlan(filesByModule) {
  console.log('Creating removal plan...');
  
  let allPhases = [];
  
  // Phase 1: Simple files with few 'any' types (lowest complexity first)
  const phase1Files = [];
  
  // Phase 2: Medium complexity files
  const phase2Files = [];
  
  // Phase 3: High complexity files (likely require more extensive work)
  const phase3Files = [];
  
  // For each module, sort files by complexity and assign to phases
  Object.entries(filesByModule).forEach(([module, files]) => {
    // Sort files by complexity (ascending)
    const sortedFiles = [...files].sort((a, b) => a.complexity - b.complexity);
    
    // Divide into phases based on complexity
    sortedFiles.forEach(file => {
      if (file.complexity < 100 && file.anyCount < 5) {
        phase1Files.push({ ...file, module });
      } else if (file.complexity < 300 && file.anyCount < 20) {
        phase2Files.push({ ...file, module });
      } else {
        phase3Files.push({ ...file, module });
      }
    });
  });
  
  // Sort each phase by complexity (ascending)
  phase1Files.sort((a, b) => a.complexity - b.complexity);
  phase2Files.sort((a, b) => a.complexity - b.complexity);
  phase3Files.sort((a, b) => a.complexity - b.complexity);
  
  allPhases.push(phase1Files);
  allPhases.push(phase2Files);
  allPhases.push(phase3Files);
  
  return allPhases;
}

function generateMarkdownPlan(phases) {
  const phaseNames = ['Simple Files (Low Complexity)', 'Medium Complexity Files', 'Complex Files (Require Extensive Work)'];
  let markdown = '# TypeScript @ts-nocheck Removal Plan\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += '## Overview\n\n';
  
  const totalFiles = phases.reduce((sum, phase) => sum + phase.length, 0);
  markdown += `This plan outlines the incremental removal of ${totalFiles} \`@ts-nocheck\` directives from the codebase.\n\n`;
  markdown += '## Approach\n\n';
  markdown += '1. Start with the simplest files first\n';
  markdown += '2. Focus on one module at a time\n';
  markdown += '3. Run TypeScript validator after each file is fixed\n';
  markdown += '4. Update tests as needed\n\n';
  
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    if (phase.length === 0) continue;
    
    markdown += `## Phase ${i + 1}: ${phaseNames[i]}\n\n`;
    
    // Group by module
    const moduleGroups = {};
    phase.forEach(file => {
      if (!moduleGroups[file.module]) {
        moduleGroups[file.module] = [];
      }
      moduleGroups[file.module].push(file);
    });
    
    Object.entries(moduleGroups).forEach(([module, files]) => {
      markdown += `### Module: ${module}\n\n`;
      markdown += '| File | Lines | Types | Complexity |\n';
      markdown += '|------|-------|-------|------------|\n';
      
      files.forEach(file => {
        markdown += `| ${file.path} | ${file.lineCount} | ${file.anyCount} | ${file.complexity} |\n`;
      });
      
      markdown += '\n';
    });
  }
  
  markdown += '## Next Steps\n\n';
  markdown += '1. Start with Phase 1 files from the international-trade module\n';
  markdown += '2. Remove @ts-nocheck directive from each file\n';
  markdown += '3. Fix TypeScript errors one by one\n';
  markdown += '4. Run TypeScript validator to confirm fixes\n';
  markdown += '5. Move to the next file\n\n';
  
  markdown += '## Common Fixes\n\n';
  markdown += '- Replace `any` with proper type definitions\n';
  markdown += '- Add proper parameter and return types to functions\n';
  markdown += '- Fix error handling patterns as shown in international-trade.service.ts\n';
  markdown += '- Add interfaces for complex objects\n';
  markdown += '- Use type guards for conditional logic\n';
  
  return markdown;
}

// Main function
function main() {
  console.log('Generating @ts-nocheck Removal Plan...');
  
  const filesByModule = scanForTsNoCheck();
  const phases = createRemovalPlan(filesByModule);
  const markdown = generateMarkdownPlan(phases);
  
  // Write to file
  const outputPath = path.join(ROOT_DIR, 'TS-NOCHECK-REMOVAL-PLAN.md');
  fs.writeFileSync(outputPath, markdown, 'utf8');
  
  console.log(`Plan generated and saved to ${outputPath}`);
  
  // Print summary
  const totalFiles = phases.reduce((sum, phase) => sum + phase.length, 0);
  console.log(`\nSummary:`);
  console.log(`- Total files with @ts-nocheck: ${totalFiles}`);
  console.log(`- Phase 1 (Simple): ${phases[0].length} files`);
  console.log(`- Phase 2 (Medium): ${phases[1].length} files`);
  console.log(`- Phase 3 (Complex): ${phases[2].length} files`);
}

main();