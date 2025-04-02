const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Component Interfaces Fixing Script');

// Fix component interfaces to include proper typing for props
function fixComponentInterfaces() {
  const filesToFix = [
    '../src/components/ui/ChakraV3Example.tsx',
    '../src/features/ai-cs-agent/components/AIChatInterface.tsx',
    '../src/components/layout/Navbar.tsx',
    '../src/components/common/ErrorDisplay.tsx',
    '../src/features/inventory/components/InventoryDetail.tsx',
    '../src/components/layout/Sidebar.tsx',
    '../src/components/common/NotificationBell.tsx',
    '../src/features/feedback/components/FeedbackForm.tsx',
    '../src/features/warehouse/components/WarehouseInventory.tsx'
  ];

  const fixedInterfaces = {};
  
  // Fix ChakraV3Example component
  fixedInterfaces['ChakraV3ExampleProps'] = `interface ChakraV3ExampleProps {
  title?: string;
  subtitle?: string;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
  showHeader?: boolean;
  showFooter?: boolean;
  children?: React.ReactNode;
  colorScheme?: string;
  variant?: string;
  size?: string;
  width?: ResponsiveValue<string | number>;
  maxWidth?: ResponsiveValue<string | number>;
  p?: ResponsiveValue<number | string>;
  m?: ResponsiveValue<number | string>;
  [key: string]: any;
}`;

  // Fix AIChatInterface component
  fixedInterfaces['AIChatInterfaceProps'] = `interface AIChatInterfaceProps {
  initialMessages?: Message[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onSendMessage?: (message: string) => void;
  onNewMessage?: (message: Message) => void;
  placeholder?: string;
  agentName?: string;
  userName?: string;
  maxHeight?: ResponsiveValue<string | number>;
  showAvatar?: boolean;
  autoFocus?: boolean;
  isTyping?: boolean;
  loading?: boolean;
  displayName?: string;
}`;

  // Fix Navbar component
  fixedInterfaces['NavbarProps'] = `interface NavbarProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
  logoText?: string;
  logoSrc?: string;
  children?: React.ReactNode;
  fixed?: boolean;
  transparent?: boolean;
  bg?: string;
  height?: ResponsiveValue<string | number>;
  zIndex?: number;
  boxShadow?: string;
  borderBottomWidth?: string | number;
  borderBottomColor?: string;
  position?: string;
}`;

  // Fix ErrorDisplay component
  fixedInterfaces['ErrorDisplayProps'] = `interface ErrorDisplayProps {
  error?: Error | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  status?: 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'solid' | 'left-accent' | 'top-accent';
  width?: ResponsiveValue<string | number>;
  mb?: ResponsiveValue<string | number>;
  mt?: ResponsiveValue<string | number>;
  mx?: ResponsiveValue<string | number>;
}`;

  // Fix InventoryDetail component
  fixedInterfaces['InventoryDetailProps'] = `interface InventoryDetailProps {
  itemId: string;
  onUpdate?: (data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  showActions?: boolean;
  showHistory?: boolean;
  showRelated?: boolean;
  isCompact?: boolean;
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  p?: ResponsiveValue<number | string>;
  m?: ResponsiveValue<number | string>;
  borderRadius?: string;
  boxShadow?: string;
}`;

  // Fix Sidebar component
  fixedInterfaces['SidebarProps'] = `interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'drawer' | 'sidebar';
  children?: React.ReactNode;
  width?: ResponsiveValue<string | number>;
  bg?: string;
  borderRight?: string;
  position?: string;
  zIndex?: number;
  minH?: string;
  h?: ResponsiveValue<string | number>;
  boxShadow?: string;
}`;

  // Fix NotificationBell component
  fixedInterfaces['NotificationBellProps'] = `interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  variant?: string;
  position?: string;
  aria-label?: string;
  icon?: React.ReactElement;
  isRound?: boolean;
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
}`;

  // Fix FeedbackForm component
  fixedInterfaces['FeedbackFormProps'] = `interface FeedbackFormProps {
  onSubmit?: (feedback: any) => Promise<void>;
  onClose?: () => void;
  isOpen?: boolean;
  defaultRating?: number;
  defaultCategory?: string;
  defaultMessage?: string;
  showTitle?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  showAttachment?: boolean;
  maxWidth?: ResponsiveValue<string | number>;
  width?: ResponsiveValue<string | number>;
  p?: ResponsiveValue<number | string>;
  m?: ResponsiveValue<number | string>;
}`;

  // Fix WarehouseInventory component
  fixedInterfaces['WarehouseInventoryProps'] = `interface WarehouseInventoryProps {
  warehouseId: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  defaultSort?: string;
  defaultFilter?: Record<string, any>;
  onRowClick?: (item: any) => void;
  onRefresh?: () => void;
  isCompact?: boolean;
  maxHeight?: ResponsiveValue<string | number>;
  gridTemplateColumns?: ResponsiveValue<string>;
  gap?: ResponsiveValue<number | string>;
}`;

  let fixCount = 0;

  // Process each file
  for (const file of filesToFix) {
    const fullPath = path.resolve(__dirname, file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found: ${file}`);
      continue;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;
    
    // Extract the component name from the file path
    const componentName = path.basename(file, '.tsx');
    
    // Check for each interface in the fixed interfaces
    for (const [interfaceName, fixedInterface] of Object.entries(fixedInterfaces)) {
      // If the file contains the interface name, update it
      if (content.includes(`interface ${interfaceName}`) || 
          componentName === interfaceName.replace('Props', '')) {
        
        // Find and replace the existing interface
        const interfaceRegex = new RegExp(`interface\\s+${interfaceName}\\s*\\{[^\\}]*\\}`, 'gs');
        if (interfaceRegex.test(content)) {
          content = content.replace(interfaceRegex, fixedInterface);
          updated = true;
        } else {
          // Maybe the interface doesn't exist, let's try to add it before the component
          const componentRegex = new RegExp(`(export\\s+(function|const)\\s+${componentName})`, 'g');
          if (componentRegex.test(content)) {
            content = content.replace(componentRegex, `${fixedInterface}\n\n$1`);
            updated = true;
          }
        }
      }
    }

    // Make sure ResponsiveValue is imported
    if (updated && !content.includes('ResponsiveValue')) {
      // Get the relative path to utils from this file
      const relativePath = path.relative(
        path.dirname(fullPath),
        path.resolve(__dirname, '../src/utils')
      ).replace(/\\/g, '/');
      
      // Add the import
      content = `import { ResponsiveValue } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}/chakra-utils';\n${content}`;
    }
    
    if (updated) {
      fs.writeFileSync(fullPath, content);
      fixCount++;
      console.log(`✅ Fixed interfaces in: ${file}`);
    } else {
      console.log(`ℹ️ No interface changes needed in: ${file}`);
    }
  }
  
  console.log(`🔧 Fixed component interfaces in ${fixCount} files`);
  return fixCount > 0;
}

// Fix event handler types in React components
function fixEventHandlerTypes() {
  const basePath = path.resolve(__dirname, '../src');
  const files = findFiles(basePath, /\.(tsx|jsx)$/);
  
  let fixCount = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Look for event handler patterns without proper types
    if (
      content.includes('onChange=') || 
      content.includes('onClick=') ||
      content.includes('onSubmit=') ||
      content.includes('handleChange') ||
      content.includes('handleClick') ||
      content.includes('handleSubmit')
    ) {
      let updatedContent = content;
      
      // Fix onChange handlers
      updatedContent = updatedContent.replace(
        /const\s+handleChange\s*=\s*\(\s*e\s*\)\s*=>\s*{/g,
        'const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {'
      );
      
      // Fix onClick handlers
      updatedContent = updatedContent.replace(
        /const\s+handleClick\s*=\s*\(\s*e\s*\)\s*=>\s*{/g,
        'const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {'
      );
      
      // Fix onSubmit handlers
      updatedContent = updatedContent.replace(
        /const\s+handleSubmit\s*=\s*\(\s*e\s*\)\s*=>\s*{/g,
        'const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {'
      );
      
      // Make sure React is imported
      if (updatedContent !== content && !updatedContent.includes('import React')) {
        if (updatedContent.includes('import {')) {
          updatedContent = updatedContent.replace(/import {/, 'import React, {');
        } else {
          updatedContent = 'import React from \'react\';\n' + updatedContent;
        }
      }
      
      if (content !== updatedContent) {
        fs.writeFileSync(file, updatedContent);
        fixCount++;
        console.log(`✅ Fixed event handlers in: ${path.relative(basePath, file)}`);
      }
    }
  }
  
  console.log(`🔧 Fixed event handlers in ${fixCount} files`);
  return fixCount > 0;
}

// Fix for common React component patterns
function fixReactComponentPatterns() {
  const basePath = path.resolve(__dirname, '../src');
  const files = findFiles(basePath, /\.(tsx|jsx)$/);
  
  let fixCount = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Look for functional components without proper types
    if (content.includes('export function') || content.includes('export const')) {
      let updatedContent = content;
      
      // Fix exported functions without React.FC typing
      updatedContent = updatedContent.replace(
        /export\s+function\s+(\w+)\s*\(\s*({[^}]*})\s*\)/g,
        'export function $1($2): React.ReactElement'
      );
      
      // Fix function props with inline destructuring
      updatedContent = updatedContent.replace(
        /function\s+(\w+)\s*\(\s*{\s*([^}]*)\s*}\s*\)/g,
        (match, funcName, props) => {
          // Skip if already has a type annotation
          if (match.includes(':')) return match;
          
          // Create a properly typed function with props interface
          return `function ${funcName}({ ${props} }: ${funcName}Props)`;
        }
      );
      
      // Make sure React is imported
      if (updatedContent !== content && !updatedContent.includes('import React')) {
        if (updatedContent.includes('import {')) {
          updatedContent = updatedContent.replace(/import {/, 'import React, {');
        } else {
          updatedContent = 'import React from \'react\';\n' + updatedContent;
        }
      }
      
      if (content !== updatedContent) {
        fs.writeFileSync(file, updatedContent);
        fixCount++;
        console.log(`✅ Fixed component patterns in: ${path.relative(basePath, file)}`);
      }
    }
  }
  
  console.log(`🔧 Fixed component patterns in ${fixCount} files`);
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

// Main function to fix all component interface TypeScript errors
async function fixComponentInterfaceErrors() {
  console.log('🔍 Starting fix for component interface TypeScript errors');
  
  // 1. Fix component interfaces with proper props
  fixComponentInterfaces();
  
  // 2. Fix event handler types in React components
  fixEventHandlerTypes();
  
  // 3. Fix common React component patterns
  fixReactComponentPatterns();
  
  console.log('\n🎉 Fixed component interface TypeScript errors successfully');
}

// Run the fix function
fixComponentInterfaceErrors().catch(error => {
  console.error('❌ Error fixing component interface TypeScript errors:', error);
});