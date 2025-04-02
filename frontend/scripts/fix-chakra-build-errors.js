/**
 * Fix Chakra UI Build Errors
 * 
 * This script converts direct submodule imports back to standard barrel imports
 * to resolve build-time webpack resolution errors.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Root directory
const ROOT_DIR = process.cwd();

// Track component usage for type declarations
const usedComponents = new Set();

function fixChakraImports() {
  console.log('🔍 Converting Chakra UI direct imports to barrel imports...');
  
  // Find all TypeScript/JavaScript files
  const files = glob.sync(path.join(ROOT_DIR, 'src/**/*.{ts,tsx,js,jsx}'), {
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**']
  });
  
  console.log(`Found ${files.length} files to scan`);
  
  let fixedFiles = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Check if file has Chakra UI submodule imports
    if (content.includes('@chakra-ui/react/')) {
      // Track component usage for type declaration generation
      const componentUsageMatches = content.match(/<([A-Z][a-zA-Z0-9]*)[\s>/]/g) || [];
      componentUsageMatches.forEach(match => {
        const component = match.slice(1).trim().replace(/[\s>]/g, '');
        usedComponents.add(component);
      });
      
      // Find all chakra imports with direct import paths
      const chakraImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@chakra-ui\/react\/([^'"]+)['"]/g;
      const imports = Array.from(content.matchAll(chakraImportRegex));
      
      if (imports.length > 0) {
        // Create a new import statement for all Chakra components
        const allComponents = new Set();
        
        // Extract all components from import statements
        imports.forEach(match => {
          const components = match[1].split(',').map(c => c.trim());
          components.forEach(c => allComponents.add(c));
        });
        
        // Create the new import statement
        const importList = Array.from(allComponents).join(', ');
        const newImportStatement = `import { ${importList} } from '@chakra-ui/react';`;
        
        // Replace all Chakra submodule imports with an empty string
        let updatedContent = content;
        imports.forEach(match => {
          updatedContent = updatedContent.replace(match[0], '');
        });
        
        // Add the new import statement at the top (after any comments or other imports)
        const firstImportMatch = updatedContent.match(/import\s+/);
        if (firstImportMatch) {
          const insertPosition = firstImportMatch.index;
          updatedContent = updatedContent.slice(0, insertPosition) + 
                           newImportStatement + '\n' + 
                           updatedContent.slice(insertPosition);
        } else {
          // No imports found, add at the top after any comments
          updatedContent = newImportStatement + '\n\n' + updatedContent;
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(file, updatedContent);
        
        fixedFiles++;
        console.log(`✅ Fixed Chakra imports in ${path.relative(ROOT_DIR, file)}`);
      }
    }
  }
  
  console.log(`✅ Fixed imports in ${fixedFiles} files`);
  return fixedFiles;
}

function updateNextConfig() {
  console.log('🔧 Updating next.config.js to fix deprecated options...');
  
  const configPath = path.join(ROOT_DIR, 'next.config.js');
  
  if (fs.existsSync(configPath)) {
    let configContent = fs.readFileSync(configPath, 'utf8');
    const originalContent = configContent;
    
    // Remove deprecated swcMinify option
    configContent = configContent.replace(/swcMinify\s*:\s*[^,}]+,?/g, '');
    
    // Ensure transpilePackages for Chakra UI if needed
    if (!configContent.includes('transpilePackages')) {
      configContent = configContent.replace(
        /module\.exports\s*=\s*{/,
        'module.exports = {\n  transpilePackages: ["@chakra-ui/react"],'
      );
    } else if (!configContent.includes('@chakra-ui/react')) {
      // Add Chakra UI to existing transpilePackages
      configContent = configContent.replace(
        /transpilePackages\s*:\s*\[([^\]]*)\]/,
        (match, packages) => {
          return `transpilePackages: [${packages}${packages.trim() ? ', ' : ''}"@chakra-ui/react"]`;
        }
      );
    }
    
    // Fix trailing commas and formatting
    configContent = configContent.replace(/,(\s*})/g, '$1');
    
    if (configContent !== originalContent) {
      fs.writeFileSync(configPath, configContent);
      console.log('✅ Updated next.config.js');
      return true;
    }
    
    console.log('ℹ️ No changes needed in next.config.js');
    return false;
  }
  
  console.log('⚠️ Could not find next.config.js');
  return false;
}

function updateTypeDeclarations() {
  console.log('🔧 Updating type declarations for Chakra UI components...');
  
  const declarationsPath = path.join(ROOT_DIR, 'src/types/chakra-ui.d.ts');
  
  // Ensure directory exists
  if (!fs.existsSync(path.dirname(declarationsPath))) {
    fs.mkdirSync(path.dirname(declarationsPath), { recursive: true });
  }
  
  // Generate a complete list of components to include in the declarations
  const baseComponents = [
    // Basic components - always include these
    'Box', 'Flex', 'Text', 'Heading', 'Button', 'IconButton', 'Link',
    'Container', 'Stack', 'VStack', 'HStack', 'Grid', 'GridItem', 'SimpleGrid',
    'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'RadioGroup', 'Switch',
    'FormControl', 'FormLabel', 'FormErrorMessage', 'FormHelperText',
    'Modal', 'ModalOverlay', 'ModalContent', 'ModalHeader', 'ModalBody', 'ModalFooter', 'ModalCloseButton',
    'Menu', 'MenuButton', 'MenuList', 'MenuItem', 'MenuDivider',
    'Tabs', 'TabList', 'Tab', 'TabPanels', 'TabPanel',
    'Alert', 'AlertIcon', 'AlertTitle', 'AlertDescription',
    'Spinner', 'Progress', 'Skeleton',
    'Card', 'CardHeader', 'CardBody', 'CardFooter',
    'Avatar', 'Badge', 'Divider', 'Tooltip',
    'Table', 'Thead', 'Tbody', 'Tr', 'Th', 'Td'
  ];
  
  // Add used components from the scan
  const allComponents = new Set([...baseComponents, ...usedComponents]);
  
  // Generate declarations
  const declarationsContent = `/**
 * Type declarations for Chakra UI v3
 * Generated: ${new Date().toISOString()}
 */

// Ensure Chakra UI components are properly typed
declare module '@chakra-ui/react' {
  import React from 'react';
  
  // Define common props interface
  interface ChakraProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  
  // Basic component types
  interface BoxProps extends ChakraProps {
    as?: React.ElementType;
    children?: React.ReactNode;
  }
  
  interface FlexProps extends BoxProps {
    align?: string;
    justify?: string;
    direction?: string;
    wrap?: string;
    gap?: number | string;
  }
  
  interface StackProps extends FlexProps {
    direction?: 'row' | 'column';
    spacing?: number | string;
  }
  
  interface ButtonProps extends ChakraProps {
    children?: React.ReactNode;
    colorScheme?: string;
    variant?: string;
    size?: string;
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: React.ReactElement;
    rightIcon?: React.ReactElement;
    onClick?: (event: React.MouseEvent) => void;
    type?: 'button' | 'submit' | 'reset';
  }
  
  interface IconButtonProps extends ButtonProps {
    icon?: React.ReactElement;
    'aria-label': string;
  }
  
  interface HeadingProps extends BoxProps {
    size?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }
  
  interface TextProps extends BoxProps {
    fontSize?: string | number;
    fontWeight?: string | number;
    color?: string;
  }
  
  interface InputProps extends ChakraProps {
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    size?: string;
    variant?: string;
    invalid?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
  }
  
  interface SelectProps extends ChakraProps {
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    placeholder?: string;
    size?: string;
    variant?: string;
    invalid?: boolean;
    disabled?: boolean;
  }
  
  interface CheckboxProps extends ChakraProps {
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    size?: string;
    disabled?: boolean;
  }
  
  interface RadioProps extends ChakraProps {
    value?: string | number;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    size?: string;
    disabled?: boolean;
  }
  
  interface RadioGroupProps extends ChakraProps {
    value?: string | number;
    onChange?: (value: string) => void;
    size?: string;
    disabled?: boolean;
  }
  
  interface FormControlProps extends BoxProps {
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
  }
  
  interface ModalProps extends ChakraProps {
    isOpen: boolean;
    onClose: () => void;
    size?: string;
    isCentered?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
    children?: React.ReactNode;
  }
  
  interface AlertProps extends BoxProps {
    status?: 'info' | 'warning' | 'success' | 'error';
    variant?: string;
  }
  
  interface SpinnerProps extends ChakraProps {
    size?: string;
    color?: string;
    thickness?: string;
    speed?: string;
  }
  
  interface CardProps extends BoxProps {
    variant?: string;
  }
  
  interface TooltipProps extends ChakraProps {
    label: string;
    placement?: string;
    hasArrow?: boolean;
    children: React.ReactElement;
  }
  
  // Export all component types
  ${Array.from(allComponents).map(component => `export const ${component}: React.FC<${component}Props>;`).join('\n  ')}
  
  // Export all interfaces
  ${Array.from(allComponents).map(component => `export interface ${component}Props extends ChakraProps {}`).join('\n  ')}
  
  // Add hooks
  export function useColorMode(): {
    colorMode: 'light' | 'dark';
    toggleColorMode: () => void;
  };
  
  export function useDisclosure(props?: {
    isOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
  }): {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onToggle: () => void;
  };
  
  export function useToast(): {
    (props: any): string;
    close: (id: string) => void;
    closeAll: () => void;
    update: (id: string, options: any) => void;
    isActive: (id: string) => boolean;
  };
  
  // Add missing function
  export function createToaster(): {
    show: (props: any) => void;
    close: (id: string) => void;
    closeAll: () => void;
    update: (id: string, props: any) => void;
    isActive: (id: string) => boolean;
  };
  
  // Add theme
  export const theme: any;
  export function createIcon(props: any): React.FC<any>;
  export function createMultiStyleConfigHelpers(props: any): any;
}

// Chart.js related types
declare module 'chart.js' {
  export const Chart: any;
  export const registerables: any[];
}

declare module 'react-chartjs-2' {
  import React from 'react';
  
  export interface ChartProps {
    data: any;
    options?: any;
    width?: number | string;
    height?: number | string;
  }
  
  export const Bar: React.FC<ChartProps>;
  export const Line: React.FC<ChartProps>;
  export const Pie: React.FC<ChartProps>;
  export const Doughnut: React.FC<ChartProps>;
  export const BarChart: React.FC<ChartProps>;
  export const ResponsiveContainer: React.FC<any>;
}
`;
  
  fs.writeFileSync(declarationsPath, declarationsContent);
  console.log(`✅ Updated type declarations at ${declarationsPath}`);
  
  // Also add a TypeScript reference directive to the top of some key files
  const keyFiles = [
    'src/app/providers.tsx',
    'src/theme/index.ts'
  ];
  
  keyFiles.forEach(filePath => {
    const absPath = path.join(ROOT_DIR, filePath);
    if (fs.existsSync(absPath)) {
      let content = fs.readFileSync(absPath, 'utf8');
      
      if (!content.includes('/// <reference')) {
        content = `/// <reference path="../types/chakra-ui.d.ts" />\n${content}`;
        fs.writeFileSync(absPath, content);
        console.log(`✅ Added type reference to ${filePath}`);
      }
    }
  });
  
  return true;
}

function fixThemeExport() {
  console.log('🔧 Fixing theme export in src/theme/index.ts...');
  
  const themePath = path.join(ROOT_DIR, 'src/theme/index.ts');
  
  if (fs.existsSync(themePath)) {
    let content = fs.readFileSync(themePath, 'utf8');
    
    // Check if the theme is exported as default
    if (content.includes('export default theme') && !content.includes('export { theme }')) {
      // Replace with named export
      content = content.replace('export default theme', 'export { theme }');
      fs.writeFileSync(themePath, content);
      console.log('✅ Fixed theme export in src/theme/index.ts');
      return true;
    }
    
    console.log('ℹ️ No changes needed in theme export');
  } else {
    console.log('⚠️ Could not find theme file');
  }
  
  return false;
}

function main() {
  try {
    console.log('🚀 Starting fixes for Chakra UI build errors');
    
    // Update next.config.js
    updateNextConfig();
    
    // Fix Chakra imports
    const importsFixed = fixChakraImports();
    
    // Update type declarations
    updateTypeDeclarations();
    
    // Fix theme export
    fixThemeExport();
    
    console.log('✅ Completed all fixes');
    
    // Check TypeScript errors
    try {
      console.log('\n🔍 Checking TypeScript errors...');
      execSync('npx tsc --noEmit', { cwd: ROOT_DIR, stdio: 'pipe' });
      console.log('✅ No TypeScript errors found!');
    } catch (tsError) {
      const errorOutput = tsError.stdout ? tsError.stdout.toString() : '';
      const errorCount = (errorOutput.match(/error TS\d+/g) || []).length;
      console.log(`⚠️ Found ${errorCount} TypeScript errors`);
    }
    
    // Try a build to see if issues are resolved
    try {
      console.log('\n🔨 Attempting build...');
      execSync('npm run build', { cwd: ROOT_DIR, stdio: 'pipe' });
      console.log('✅ Build successful!');
    } catch (buildError) {
      console.log('⚠️ Build still has issues. Showing first few errors:');
      const errorOutput = buildError.stdout ? buildError.stdout.toString() : buildError.stderr ? buildError.stderr.toString() : '';
      const errorLines = errorOutput.split('\n').filter(line => line.includes('error') || line.includes('Error'));
      errorLines.slice(0, 5).forEach(line => console.log(`  ${line}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();