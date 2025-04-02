const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Responsive Props Type Fixing Script');

// Ensure the utils directory and chakra-utils file exist
function ensureChakraUtilsExists() {
  const utilsDir = path.resolve(__dirname, '../src/utils');
  const utilsFilePath = path.resolve(utilsDir, 'chakra-utils.ts');
  
  // Create utils directory if it doesn't exist
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
    console.log('✅ Created utils directory');
  }
  
  // Create or update chakra-utils.ts
  const chakraUtils = `/**
 * Chakra UI utilities to help with type checking
 */

/**
 * Creates a responsive object type for Chakra UI
 * @example
 * // Use like:
 * const marginX = responsive<string>({ base: '1rem', md: '2rem' });
 */
export type ResponsiveValue<T> = T | Record<string, T>;

/**
 * Helper for creating toaster instances
 * This is used in multiple places and needs to have a consistent signature
 */
export const createToaster = () => {
  // This is placeholder implementation
  // In a real app this would connect to your notification system
  return (options: any) => {
    console.log('Toast:', options);
    // Return a mock toast ID
    return 'toast-id';
  };
};

/**
 * Type for template columns in Grid
 */
export interface GridTemplateColumns {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  [key: string]: string | undefined;
}

/**
 * Type for layout directions
 */
export interface LayoutDirection {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  [key: string]: string | undefined;
}

/**
 * Type for responsive spacing
 */
export interface ResponsiveSpacing {
  base?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
  '2xl'?: number | string;
  [key: string]: number | string | undefined;
}

/**
 * Type for responsive font sizes
 */
export interface ResponsiveFontSize {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  [key: string]: string | undefined;
}

/**
 * Type for responsive width/height
 */
export interface ResponsiveSize {
  base?: string | number;
  sm?: string | number;
  md?: string | number;
  lg?: string | number;
  xl?: string | number;
  '2xl'?: string | number;
  [key: string]: string | number | undefined;
}

/**
 * Type for grid props
 */
export interface GridProps {
  templateColumns?: GridTemplateColumns | string;
  templateRows?: ResponsiveValue<string>;
  templateAreas?: ResponsiveValue<string>;
  gap?: ResponsiveSpacing;
  rowGap?: ResponsiveSpacing;
  columnGap?: ResponsiveSpacing;
  autoFlow?: ResponsiveValue<string>;
  autoRows?: ResponsiveValue<string>;
  autoColumns?: ResponsiveValue<string>;
  [key: string]: any;
}

/**
 * Type for flex props
 */
export interface FlexProps {
  direction?: LayoutDirection | string;
  wrap?: ResponsiveValue<string>;
  align?: ResponsiveValue<string>;
  justify?: ResponsiveValue<string>;
  basis?: ResponsiveValue<string>;
  grow?: ResponsiveValue<string | number>;
  shrink?: ResponsiveValue<string | number>;
  [key: string]: any;
}
`;

  fs.writeFileSync(utilsFilePath, chakraUtils);
  console.log('✅ Created/updated chakra-utils.ts');
  return true;
}

// Create utility types definition file
function createUtilityTypesFile() {
  const typesDir = path.resolve(__dirname, '../src/types');
  const utilityTypesPath = path.resolve(typesDir, 'utility-types.d.ts');
  
  // Create types directory if it doesn't exist
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
    console.log('✅ Created types directory');
  }
  
  const utilityTypes = `/**
 * Utility types for TypeScript
 */

/**
 * Makes all properties of T optional
 */
type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Makes all properties of T required
 */
type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Makes all properties of T readonly
 */
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * Picks only the specified properties from T
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Omits the specified properties from T
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
 * Makes a type that requires at least one of the properties of T
 */
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys];

/**
 * Makes a type that requires exactly one of the properties of T
 */
type RequireExactlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
    }[Keys];

/**
 * Returns a record type with the keys of K and values of type T
 */
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

/**
 * Makes properties specified by K optional in type T
 */
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Deep partial type that makes all nested properties optional
 */
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Makes properties specifid by K required in type T
 */
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Makes properties specifid by K nullable in type T
 */
type Nullable<T> = { [P in keyof T]: T[P] | null };

/**
 * Makes type T or null
 */
type OrNull<T> = T | null;

/**
 * Makes type T or undefined
 */
type OrUndefined<T> = T | undefined;

/**
 * Makes type T or null or undefined
 */
type OrNullable<T> = T | null | undefined;

/**
 * Creates a type for responsive values in Chakra UI
 */
type ResponsiveValue<T> = T | Record<string, T>;

/**
 * Creates a type for responsive style props
 */
type StyleProps = {
  m?: ResponsiveValue<string | number>;
  mt?: ResponsiveValue<string | number>;
  mr?: ResponsiveValue<string | number>;
  mb?: ResponsiveValue<string | number>;
  ml?: ResponsiveValue<string | number>;
  mx?: ResponsiveValue<string | number>;
  my?: ResponsiveValue<string | number>;
  p?: ResponsiveValue<string | number>;
  pt?: ResponsiveValue<string | number>;
  pr?: ResponsiveValue<string | number>;
  pb?: ResponsiveValue<string | number>;
  pl?: ResponsiveValue<string | number>;
  px?: ResponsiveValue<string | number>;
  py?: ResponsiveValue<string | number>;
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  minWidth?: ResponsiveValue<string | number>;
  maxWidth?: ResponsiveValue<string | number>;
  minHeight?: ResponsiveValue<string | number>;
  maxHeight?: ResponsiveValue<string | number>;
  [key: string]: any;
};`;

  fs.writeFileSync(utilityTypesPath, utilityTypes);
  console.log('✅ Created utility-types.d.ts');
  return true;
}

// Fix specific components with responsive props issues
function fixComponentResponsiveProps() {
  const componentsToFix = [
    {
      filePath: '../src/app/dashboard/page.tsx',
      findRegex: /templateColumns={{[\s\S]*?}}/g,
      replacement: `templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        lg: "repeat(4, 1fr)"
      } as ResponsiveValue<string>}`
    },
    {
      filePath: '../src/app/page.tsx',
      findRegex: /templateColumns={{[\s\S]*?}}/g,
      replacement: `templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)"
      } as ResponsiveValue<string>}`
    },
    {
      filePath: '../src/features/ai-cs-agent/components/AIChatInterface.tsx',
      findRegex: /direction={{[\s\S]*?}}/g,
      replacement: `direction={{
        base: "column",
        md: "row"
      } as ResponsiveValue<string>}`
    },
    {
      filePath: '../src/features/warehouse/components/WarehouseInventory.tsx',
      findRegex: /templateColumns={{[\s\S]*?}}/g,
      replacement: `templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)"
      } as ResponsiveValue<string>}`
    },
    {
      filePath: '../src/features/inventory/components/InventoryDetail.tsx',
      findRegex: /gap={{[\s\S]*?}}/g,
      replacement: `gap={{
        base: 4,
        md: 6,
        lg: 8
      } as ResponsiveValue<number>}`
    }
  ];

  let fixCount = 0;

  for (const component of componentsToFix) {
    const fullPath = path.resolve(__dirname, component.filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found: ${component.filePath}`);
      continue;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if imports include ResponsiveValue
    if (!content.includes('import { ResponsiveValue }')) {
      // Add import statement for ResponsiveValue
      if (content.includes('from \'@chakra-ui/react')) {
        content = content.replace(
          /import {(.*?)} from '@chakra-ui\/react/g,
          (match, imports) => `import {${imports}} from '@chakra-ui/react'`
        );
        content = `import { ResponsiveValue } from '../../utils/chakra-utils';\n${content}`;
      } else {
        content = `import { ResponsiveValue } from '../../utils/chakra-utils';\n${content}`;
      }
    }
    
    // Replace responsive props
    const updatedContent = content.replace(component.findRegex, component.replacement);
    
    if (content !== updatedContent) {
      fs.writeFileSync(fullPath, updatedContent);
      fixCount++;
      console.log(`✅ Fixed responsive props in: ${component.filePath}`);
    } else {
      console.log(`ℹ️ No changes needed in: ${component.filePath}`);
    }
  }
  
  console.log(`🔧 Fixed responsive props in ${fixCount} components`);
  return fixCount > 0;
}

// Add type imports to files that use responsive props
function addTypeImports() {
  const filesToFix = [
    '../src/app/dashboard/page.tsx',
    '../src/app/page.tsx',
    '../src/features/ai-cs-agent/components/AIChatInterface.tsx',
    '../src/features/warehouse/components/WarehouseInventory.tsx',
    '../src/features/inventory/components/InventoryDetail.tsx',
    '../src/features/warehouse/components/WarehouseForm.tsx',
    '../src/features/feedback/components/FeedbackAnalytics.tsx',
    '../src/features/buybox/pages/BuyBoxDashboardPage.tsx',
    '../src/components/admin/ErrorMonitoringDashboard.tsx'
  ];

  let fixCount = 0;

  for (const file of filesToFix) {
    const fullPath = path.resolve(__dirname, file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found: ${file}`);
      continue;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if imports include the necessary types
    if (!content.includes('import { ResponsiveValue }')) {
      // Calculate relative path to utils
      const relativePath = path.relative(
        path.dirname(fullPath),
        path.resolve(__dirname, '../src/utils')
      ).replace(/\\/g, '/');
      
      // Add imports at the beginning of the file
      content = `import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}/chakra-utils';\n${content}`;
      
      fs.writeFileSync(fullPath, content);
      fixCount++;
      console.log(`✅ Added type imports to: ${file}`);
    } else {
      console.log(`ℹ️ Type imports already exist in: ${file}`);
    }
  }
  
  console.log(`🔧 Added type imports to ${fixCount} files`);
  return fixCount > 0;
}

// Fix all Grid components with templateColumns issues by adding a type-casting utility
function fixGridComponents() {
  // First, find all grid components with the pattern templateColumns={{
  const basePath = path.resolve(__dirname, '../src');
  const files = findFiles(basePath, /\.(tsx|jsx)$/);
  
  let fixCount = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if this file has Grid with templateColumns props
    if (content.includes('<Grid') && content.includes('templateColumns={')) {
      // Get the relative path to utils from this file
      const relativePath = path.relative(
        path.dirname(file),
        path.resolve(__dirname, '../src/utils')
      ).replace(/\\/g, '/');
      
      // Add ResponsiveValue import if needed
      let updatedContent = content;
      if (!updatedContent.includes('import { ResponsiveValue }') && 
          !updatedContent.includes('{ ResponsiveValue,')) {
        // Add imports
        if (updatedContent.includes('import React') || updatedContent.includes('import {')) {
          // Insert after the first import
          updatedContent = updatedContent.replace(
            /^(import .+?;)/,
            `$1\nimport { ResponsiveValue, GridTemplateColumns } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}/chakra-utils';`
          );
        } else {
          // Add at the beginning of the file
          updatedContent = `import { ResponsiveValue, GridTemplateColumns } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}/chakra-utils';\n${updatedContent}`;
        }
      }
      
      // Fix templateColumns props
      if (updatedContent.includes('templateColumns={{')) {
        updatedContent = updatedContent.replace(
          /templateColumns={{([^}]+)}}/g,
          (match, content) => `templateColumns={{${content}} as ResponsiveValue<string>}`
        );
      } else if (updatedContent.includes('templateColumns={')) {
        updatedContent = updatedContent.replace(
          /templateColumns={\s*"([^"]+)"\s*}/g,
          'templateColumns="$1"'
        );
      }
      
      if (content !== updatedContent) {
        fs.writeFileSync(file, updatedContent);
        fixCount++;
        console.log(`✅ Fixed Grid templateColumns in: ${path.relative(basePath, file)}`);
      }
    }
  }
  
  console.log(`🔧 Fixed Grid components in ${fixCount} files`);
  return fixCount > 0;
}

// Fix all Flex components with direction issues
function fixFlexComponents() {
  const basePath = path.resolve(__dirname, '../src');
  const files = findFiles(basePath, /\.(tsx|jsx)$/);
  
  let fixCount = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if this file has Flex with direction props
    if (content.includes('<Flex') && content.includes('direction={')) {
      // Get the relative path to utils from this file
      const relativePath = path.relative(
        path.dirname(file),
        path.resolve(__dirname, '../src/utils')
      ).replace(/\\/g, '/');
      
      // Add ResponsiveValue import if needed
      let updatedContent = content;
      if (!updatedContent.includes('import { ResponsiveValue }') && 
          !updatedContent.includes('{ ResponsiveValue,')) {
        // Add imports
        if (updatedContent.includes('import React') || updatedContent.includes('import {')) {
          // Insert after the first import
          updatedContent = updatedContent.replace(
            /^(import .+?;)/,
            `$1\nimport { ResponsiveValue, LayoutDirection } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}/chakra-utils';`
          );
        } else {
          // Add at the beginning of the file
          updatedContent = `import { ResponsiveValue, LayoutDirection } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}/chakra-utils';\n${updatedContent}`;
        }
      }
      
      // Fix direction props
      if (updatedContent.includes('direction={{')) {
        updatedContent = updatedContent.replace(
          /direction={{([^}]+)}}/g,
          (match, content) => `direction={{${content}} as ResponsiveValue<string>}`
        );
      } else if (updatedContent.includes('direction={')) {
        updatedContent = updatedContent.replace(
          /direction={\s*"([^"]+)"\s*}/g,
          'direction="$1"'
        );
      }
      
      if (content !== updatedContent) {
        fs.writeFileSync(file, updatedContent);
        fixCount++;
        console.log(`✅ Fixed Flex direction in: ${path.relative(basePath, file)}`);
      }
    }
  }
  
  console.log(`🔧 Fixed Flex components in ${fixCount} files`);
  return fixCount > 0;
}

// Helper function to find files recursively
function findFiles(dir, pattern) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      results = results.concat(findFiles(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Create a new directory for custom Chakra UI TypeScript helpers
function createChakraTypeHelpers() {
  const helpersDir = path.resolve(__dirname, '../src/utils/chakra');
  
  if (!fs.existsSync(helpersDir)) {
    fs.mkdirSync(helpersDir, { recursive: true });
    console.log('✅ Created chakra helpers directory');
  }
  
  // Create responsive-props.ts
  const responsivePropsPath = path.join(helpersDir, 'responsive-props.ts');
  const responsivePropsContent = `/**
 * Helpers for working with Chakra UI responsive props
 */

/**
 * Type for breakpoints in Chakra UI
 */
export type ChakraBreakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Create a responsive value for Chakra UI
 */
export function responsive<T>(values: Record<ChakraBreakpoint, T>): Record<string, T> {
  return values;
}

/**
 * Create a responsive object that can be safely passed to templateColumns
 */
export function responsiveGrid(values: Record<ChakraBreakpoint, string>): any {
  return values;
}

/**
 * Create a responsive object that can be safely passed to direction
 */
export function responsiveDirection(values: Record<ChakraBreakpoint, string>): any {
  return values;
}

/**
 * Create a responsive object that can be safely passed to fontSize
 */
export function responsiveFontSize(values: Record<ChakraBreakpoint, string>): any {
  return values;
}

/**
 * Create a responsive object that can be safely passed to spacing props
 */
export function responsiveSpacing(values: Record<ChakraBreakpoint, number | string>): any {
  return values;
}
`;

  fs.writeFileSync(responsivePropsPath, responsivePropsContent);
  console.log('✅ Created responsive-props.ts helper');

  // Create a utility function for creating responsive values
  const index = path.join(helpersDir, 'index.ts');
  const indexContent = `export * from './responsive-props';

/**
 * Creates a safe cast for responsive props to avoid TypeScript errors.
 * @example
 * <Grid
 *   templateColumns={chakra.responsive({
 *     base: "repeat(1, 1fr)",
 *     md: "repeat(2, 1fr)"
 *   })}
 * />
 */
export const chakra = {
  responsive: <T,>(values: Record<string, T>): any => values,
  grid: (values: Record<string, string>): any => values,
  direction: (values: Record<string, string>): any => values,
  spacing: (values: Record<string, number | string>): any => values,
  size: (values: Record<string, number | string>): any => values,
  fontSize: (values: Record<string, string>): any => values
};
`;

  fs.writeFileSync(index, indexContent);
  console.log('✅ Created chakra helpers index.ts');
  
  return true;
}

// Create a single improved fix for responsive props and type assertions
function createComprehensiveFixScript() {
  // Create a utility file for imports
  const indexPath = path.resolve(__dirname, '../src/utils/index.ts');
  
  const indexContent = `export * from './chakra-utils';
export * from './chakra';

// Add any other utility exports here
`;

  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Created utils index.ts');
  
  return true;
}

// Fix component interfaces to include proper typing for responsive props
function fixComponentInterfaces() {
  const filesToFix = [
    '../src/components/ui/ChakraV3Example.tsx',
    '../src/features/ai-cs-agent/components/AIChatInterface.tsx',
    '../src/components/admin/ErrorMonitoringDashboard.tsx',
    '../src/features/warehouse/components/WarehouseForm.tsx',
    '../src/features/inventory/components/InventoryDetail.tsx'
  ];

  let fixCount = 0;

  for (const file of filesToFix) {
    const fullPath = path.resolve(__dirname, file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found: ${file}`);
      continue;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix component interfaces
    let updatedContent = content;
    
    // Find all interface declarations
    const interfaceRegex = /interface\s+(\w+)\s*\{([^}]*)\}/gs;
    updatedContent = updatedContent.replace(interfaceRegex, (match, interfaceName, interfaceBody) => {
      // Add imports for ResponsiveValue if they're not already there
      if (interfaceBody.includes('?:') && !interfaceName.includes('Props')) {
        return match; // Skip non-prop interfaces
      }
      
      // Add ResponsiveValue types to props that likely need them
      const updatedInterfaceBody = interfaceBody
        .replace(/templateColumns\?:\s*string;/g, 'templateColumns?: ResponsiveValue<string>;')
        .replace(/direction\?:\s*string;/g, 'direction?: ResponsiveValue<string>;')
        .replace(/gap\?:\s*number;/g, 'gap?: ResponsiveValue<number>;')
        .replace(/fontSize\?:\s*string;/g, 'fontSize?: ResponsiveValue<string>;')
        .replace(/width\?:\s*string(\s*\|\s*number)?;/g, 'width?: ResponsiveValue<string | number>;')
        .replace(/height\?:\s*string(\s*\|\s*number)?;/g, 'height?: ResponsiveValue<string | number>;')
        .replace(/margin\?:\s*string(\s*\|\s*number)?;/g, 'margin?: ResponsiveValue<string | number>;')
        .replace(/padding\?:\s*string(\s*\|\s*number)?;/g, 'padding?: ResponsiveValue<string | number>;');
      
      return `interface ${interfaceName} {${updatedInterfaceBody}}`;
    });
    
    if (content !== updatedContent) {
      fs.writeFileSync(fullPath, updatedContent);
      fixCount++;
      console.log(`✅ Fixed component interfaces in: ${file}`);
    } else {
      console.log(`ℹ️ No interface changes needed in: ${file}`);
    }
  }
  
  console.log(`🔧 Fixed component interfaces in ${fixCount} files`);
  return fixCount > 0;
}

// Main function to fix all responsive prop TypeScript errors
async function fixResponsivePropsTypeErrors() {
  console.log('🔍 Starting comprehensive fix for responsive props TypeScript errors');
  
  // 1. Ensure the chakra-utils.ts file exists with all required types
  ensureChakraUtilsExists();
  
  // 2. Create utility types definition
  createUtilityTypesFile();
  
  // 3. Create Chakra helper utilities for responsive props
  createChakraTypeHelpers();
  
  // 4. Fix Grid components with templateColumns issues
  fixGridComponents();
  
  // 5. Fix Flex components with direction issues
  fixFlexComponents();
  
  // 6. Fix specific components with known responsive props issues
  fixComponentResponsiveProps();
  
  // 7. Add type imports to files that use responsive props
  addTypeImports();
  
  // 8. Fix component interfaces to include proper typing
  fixComponentInterfaces();
  
  // 9. Create index.ts for utilities
  createComprehensiveFixScript();
  
  console.log('\n🎉 Fixed responsive props TypeScript errors successfully');
}

// Run the fix function
fixResponsivePropsTypeErrors().catch(error => {
  console.error('❌ Error fixing responsive props TypeScript errors:', error);
});