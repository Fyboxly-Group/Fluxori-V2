/**
 * Custom build script that ignores TypeScript errors
 * Used by the build:ts-node npm script
 */
import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';

console.log('🔧 Building Fluxori-V2 Backend (ignoring TypeScript errors)');

// Function to execute command with error handling
function execCommand(command: string): void {
  try {
    childProcess.execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`⚠️ Command failed: ${command}`);
    process.exit(1);
  }
}

// Clean build directory
console.log('Cleaning build directory...');
if (fs.existsSync('dist')) {
  execCommand('rimraf dist');
}

// Create build directory
fs.mkdirSync('dist', { recursive: true });

// Transpile TypeScript files
console.log('Transpiling TypeScript files...');
execCommand('TS_NODE_TRANSPILE_ONLY=true tsc --skipLibCheck');

// Copy package.json to dist
console.log('Copying package.json to dist...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
// Remove development dependencies
delete packageJson.devDependencies;
// Remove development scripts
const prodScripts = {
  start: packageJson.scripts.start,
};
packageJson.scripts = prodScripts;
fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Build completed successfully!');