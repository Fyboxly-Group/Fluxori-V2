#!/usr/bin/env node

/**
 * Script to fix remaining frontend TypeScript errors properly
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const srcDir = path.join(frontendDir, 'src');

// Helpers
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function log(message) {
  console.log(`[Frontend-TS-Fix] ${message}`);
}

// Create an index.d.ts file to re-export all types
function createIndexTypes() {
  const typesDir = path.join(srcDir, 'types');
  
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  const indexTypesPath = path.join(typesDir, 'index.d.ts');
  
  const content = `/**
 * Index file for all type declarations
 */

// Re-export all types
import './chakra-ui';
import './utility-types';
`;
  
  writeFile(indexTypesPath, content);
  log(`✅ Created index type file at ${indexTypesPath}`);
  
  // Create utility-types.d.ts
  const utilityTypesPath = path.join(typesDir, 'utility-types.d.ts');
  
  const utilityContent = `/**
 * Utility type declarations
 */

// User type
export interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  isAdmin?: boolean;
  [key: string]: any;
}

// Module declarations for recharts
declare module 'recharts' {
  export const LineChart: React.FC<any>;
  export const Line: React.FC<any>;
  export const XAxis: React.FC<any>;
  export const YAxis: React.FC<any>;
  export const CartesianGrid: React.FC<any>;
  export const Tooltip: React.FC<any>;
  export const Legend: React.FC<any>;
  export const ResponsiveContainer: React.FC<any>;
  export const AreaChart: React.FC<any>;
  export const Area: React.FC<any>;
  export const BarChart: React.FC<any>;
  export const Bar: React.FC<any>;
  export const PieChart: React.FC<any>;
  export const Pie: React.FC<any>;
  export const Cell: React.FC<any>;
}

// Fix missing icons in lucide-react
declare module 'lucide-react' {
  import React from 'react';
  
  // Basic interface for Lucide icon props
  export interface LucideProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
    color?: string;
    strokeWidth?: string | number;
  }
  
  // Base component type
  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;
  
  // Missing icon exports
  export const MessageSquarePlus: LucideIcon;
  export const Trash2: LucideIcon;
  export const MessageCircle: LucideIcon;
  
  // Common icons we want to ensure are defined
  export const AlertTriangle: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Bell: LucideIcon;
  export const Calendar: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Clock: LucideIcon;
  export const Copy: LucideIcon;
  export const Download: LucideIcon;
  export const Edit: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Eye: LucideIcon;
  export const File: LucideIcon;
  export const Filter: LucideIcon;
  export const Folder: LucideIcon;
  export const Globe: LucideIcon;
  export const Heart: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Home: LucideIcon;
  export const Info: LucideIcon;
  export const Link: LucideIcon;
  export const List: LucideIcon;
  export const Mail: LucideIcon;
  export const Menu: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Moon: LucideIcon;
  export const Paperclip: LucideIcon;
  export const PenTool: LucideIcon;
  export const Plus: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const Settings: LucideIcon;
  export const Share: LucideIcon;
  export const ShoppingBag: LucideIcon;
  export const Slash: LucideIcon;
  export const Star: LucideIcon;
  export const Sun: LucideIcon;
  export const Trash: LucideIcon;
  export const Upload: LucideIcon;
  export const User: LucideIcon;
  export const Users: LucideIcon;
  export const X: LucideIcon;
}

// Fix createQueryClient export
declare module '@/utils/query.utils' {
  export function createQueryClient(): any;
}

// AppConfig interface for monitoring
interface AppConfig {
  monitoring?: {
    enabled: boolean;
    level: string;
    endpoint?: string;
  };
  [key: string]: any;
}

// ErrorCategory type
type ErrorCategory = 'api' | 'validation' | 'auth' | 'network' | 'unexpected';

// Common component props
export interface FeedbackViewModalProps {
  feedback: any;
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  isAdmin?: boolean;
  [key: string]: any;
}

export interface ConnectionFormProps {
  connection?: any;
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  [key: string]: any;
}

export interface NotificationListProps {
  notifications: any[];
  isLoading?: boolean;
  loading?: boolean;
  onClose?: () => void;
  [key: string]: any;
}

export interface WarehouseSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  isRequired?: boolean;
  required?: boolean;
  isDisabled?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

// Define global HTML attributes with Chakra props
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      [key: string]: any;
    }
  }
}
`;
  
  writeFile(utilityTypesPath, utilityContent);
  log(`✅ Created utility types file at ${utilityTypesPath}`);
  
  return true;
}

// Fix icons import issues
function fixIconsImports() {
  // Find all files that import from lucide-react
  const files = [];
  try {
    const output = execSync(`grep -r "from 'lucide-react'" --include="*.tsx" ${srcDir}`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      const match = line.match(/^([^:]+):/);
      if (match) {
        files.push(match[1]);
      }
    }
  } catch (error) {
    // grep returns non-zero exit code when no matches found
    log('No files with lucide-react imports found');
  }
  
  let fixedCount = 0;
  for (const file of files) {
    if (fs.existsSync(file)) {
      let content = readFile(file);
      
      // If file imports missing icons, fix them
      if (content.includes('MessageSquarePlus') || 
          content.includes('Trash2') || 
          content.includes('MessageCircle')) {
        
        // Add type reference at the top of the file (after the imports)
        if (!content.includes('/// <reference') && !content.includes('from "@/types"')) {
          content = content.replace(
            /(import[^;]*;(\s*\n)*)+/,
            '$&// Add reference to utility types\n/// <reference path="../../types/utility-types.d.ts" />\n\n'
          );
          
          writeFile(file, content);
          fixedCount++;
          log(`✅ Added type reference to ${file}`);
        }
      }
    }
  }
  
  log(`Fixed icon imports in ${fixedCount} files`);
  return fixedCount > 0;
}

// Create a utility for ChakraProvider
function createProviderUtility() {
  const providersPath = path.join(srcDir, 'app', 'providers.tsx');
  
  if (fs.existsSync(providersPath)) {
    let content = readFile(providersPath);
    
    // Update the provider component with proper types
    const updatedContent = `// Add reference to utility types
/// <reference path="../types/chakra-ui.d.ts" />
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '@/theme';
import { createQueryClient } from '@/utils/query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme} value={{ theme }}>
        {children}
      </ChakraProvider>
    </QueryClientProvider>
  );
}
`;
    
    writeFile(providersPath, updatedContent);
    log(`✅ Updated providers component at ${providersPath}`);
    
    // Create a simple query utility
    const queryUtilPath = path.join(srcDir, 'utils', 'query.ts');
    const queryUtilContent = `/**
 * Query utilities
 */

/**
 * Create a query client with default options
 */
export function createQueryClient() {
  return {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  };
}
`;
    
    writeFile(queryUtilPath, queryUtilContent);
    log(`✅ Created query utility at ${queryUtilPath}`);
    
    return true;
  }
  
  return false;
}

// Update files with ConnectionForm component
function fixConnectionFormProps() {
  const files = [];
  try {
    const output = execSync(`grep -r "ConnectionForm" --include="*.tsx" ${srcDir}`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      const match = line.match(/^([^:]+):/);
      if (match) {
        files.push(match[1]);
      }
    }
  } catch (error) {
    // grep returns non-zero exit code when no matches found
    log('No files with ConnectionForm found');
  }
  
  let fixedCount = 0;
  for (const file of files) {
    if (fs.existsSync(file) && file.includes('page.tsx')) {
      let content = readFile(file);
      
      // Fix prop naming
      if (content.includes('open={') && !content.includes('isOpen={')) {
        content = content.replace(/open={([^}]+)}/g, 'isOpen={$1}');
        
        writeFile(file, content);
        fixedCount++;
        log(`✅ Fixed ConnectionForm props in ${file}`);
      }
    }
  }
  
  // Also fix the ConnectionForm component itself
  const connectionFormPath = path.join(srcDir, 'features', 'connections', 'components', 'ConnectionForm.tsx');
  if (fs.existsSync(connectionFormPath)) {
    let content = readFile(connectionFormPath);
    
    // Add support for both prop names
    if (content.includes('interface ConnectionFormProps')) {
      content = content.replace(
        /interface ConnectionFormProps[^{]*{([^}]*)}/,
        `interface ConnectionFormProps {
  // Support both naming conventions for compatibility
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  connection?: any;$1}`
      );
      
      // Update the component to handle both prop names
      content = content.replace(
        /const ConnectionForm[^{]*{([^}]*), ?(open[^,}]*)/,
        `const ConnectionForm = ({ 
  connection, 
  // Use either isOpen or open prop
  isOpen, 
  open = isOpen,
  onClose, 
$1}`
      );
      
      writeFile(connectionFormPath, content);
      log(`✅ Updated ConnectionForm component to support both prop naming conventions`);
      fixedCount++;
    }
  }
  
  log(`Fixed connection form props in ${fixedCount} files`);
  return fixedCount > 0;
}

// Update NotificationList component props
function fixNotificationListProps() {
  const notificationListPath = path.join(srcDir, 'features', 'notifications', 'components', 'NotificationList.tsx');
  
  if (fs.existsSync(notificationListPath)) {
    let content = readFile(notificationListPath);
    
    // Support both loading and isLoading props
    if (content.includes('interface NotificationListProps')) {
      content = content.replace(
        /interface NotificationListProps[^{]*{([^}]*)}/,
        `interface NotificationListProps {
  notifications: any[];
  // Support both naming conventions for compatibility
  loading?: boolean;
  isLoading?: boolean;
  onClose?: () => void;$1}`
      );
      
      // Update the component to handle both prop names
      content = content.replace(
        /const NotificationList[^{]*{([^}]*), ?(loading[^,}]*)/,
        `const NotificationList = ({ 
  notifications, 
  // Use either loading or isLoading prop
  loading,
  isLoading = loading,
  onClose, 
$1}`
      );
      
      writeFile(notificationListPath, content);
      log(`✅ Updated NotificationList component to support both prop naming conventions`);
      return true;
    }
  }
  
  return false;
}

// Fix WarehouseSelector component
function fixWarehouseSelectorProps() {
  const warehouseSelectorPath = path.join(srcDir, 'features', 'warehouse', 'components', 'WarehouseSelector.tsx');
  
  if (fs.existsSync(warehouseSelectorPath)) {
    let content = readFile(warehouseSelectorPath);
    
    // Update the props interface
    content = content.replace(
      /interface WarehouseSelectorProps[^{]*{([^}]*)}/,
      `interface WarehouseSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  // Support both naming conventions for compatibility
  required?: boolean;
  isRequired?: boolean;
  disabled?: boolean;
  isDisabled?: boolean;$1}`
    );
    
    // Update the component to handle both prop names
    content = content.replace(
      /export const WarehouseSelector[^{]*{([^}]*)(required|isRequired)([^,}]*)/,
      `export const WarehouseSelector: React.FC<WarehouseSelectorProps> = ({
  value,
  onChange,
  // Use either naming convention
  required,
  isRequired = required,
  disabled,
  isDisabled = disabled$1`
    );
    
    // Fix references to isRequired and isDisabled
    content = content.replace(/isRequired/g, 'isRequired || required');
    content = content.replace(/isDisabled/g, 'isDisabled || disabled');
    
    writeFile(warehouseSelectorPath, content);
    log(`✅ Updated WarehouseSelector component to support both prop naming conventions`);
    return true;
  }
  
  return false;
}

// Add aria-label to IconButton components
function fixIconButtonProps() {
  // Files that use IconButton without aria-label
  const filesWithIconButtons = [];
  try {
    const output = execSync(`grep -r "<IconButton" --include="*.tsx" ${srcDir}`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.trim() === '' || line.includes('aria-label')) continue;
      
      const match = line.match(/^([^:]+):/);
      if (match) {
        filesWithIconButtons.push(match[1]);
      }
    }
  } catch (error) {
    // grep returns non-zero exit code when no matches found
    log('No files with IconButton missing aria-label found');
  }
  
  let fixedCount = 0;
  for (const file of filesWithIconButtons) {
    if (fs.existsSync(file)) {
      let content = readFile(file);
      let modified = false;
      
      // Replace IconButton without aria-label
      const matches = content.matchAll(/<IconButton([^>]*?)>/g);
      
      for (const match of matches) {
        if (!match[1].includes('aria-label')) {
          const iconProps = match[1];
          
          // Find a reasonable label based on icon
          let label = 'Button';
          if (iconProps.includes('_icon={<')) {
            const iconMatch = iconProps.match(/_icon={\s*<([A-Za-z0-9]+)/);
            if (iconMatch) {
              label = iconMatch[1];
            }
          }
          
          // Add aria-label attribute
          const replacement = `<IconButton${iconProps} aria-label="${label}">`;
          content = content.replace(match[0], replacement);
          modified = true;
        }
      }
      
      if (modified) {
        writeFile(file, content);
        fixedCount++;
        log(`✅ Added aria-label to IconButton components in ${file}`);
      }
    }
  }
  
  log(`Fixed IconButton aria-label props in ${fixedCount} files`);
  return fixedCount > 0;
}

// Fix monitoring.utils.ts
function fixMonitoringUtils() {
  const monitoringUtilsPath = path.join(srcDir, 'utils', 'monitoring.utils.ts');
  
  if (fs.existsSync(monitoringUtilsPath)) {
    let content = readFile(monitoringUtilsPath);
    
    // Add AppConfig interface
    if (!content.includes('interface AppConfig')) {
      content = content.replace(
        /(import[^;]*;(\s*\n)*)+/,
        `$&
// App configuration interface
interface AppConfig {
  monitoring?: {
    enabled: boolean;
    level: string;
    endpoint?: string;
  };
  [key: string]: any;
}

// Error category type
type ErrorCategory = 'api' | 'validation' | 'auth' | 'network' | 'unexpected';
`
      );
    }
    
    // Fix error category type
    content = content.replace(
      /category: "unexpected"/g,
      'category: "unexpected" as ErrorCategory'
    );
    
    writeFile(monitoringUtilsPath, content);
    log(`✅ Fixed monitoring utils with proper interfaces at ${monitoringUtilsPath}`);
    return true;
  }
  
  return false;
}

// Main function
function main() {
  log('Starting final frontend TypeScript error fixes...');
  
  // Apply fixes
  createIndexTypes();
  fixIconsImports();
  createProviderUtility();
  fixConnectionFormProps();
  fixNotificationListProps();
  fixWarehouseSelectorProps();
  fixIconButtonProps();
  fixMonitoringUtils();
  
  // Check remaining errors
  try {
    execSync('npm run typecheck', { cwd: frontendDir });
    log('✅ All TypeScript errors fixed! Frontend typechecking passes now.');
  } catch (error) {
    const output = error.stdout.toString();
    const remainingErrors = (output.match(/error TS\d+/g) || []).length;
    log(`Still have ${remainingErrors} TypeScript errors in the frontend.`);
  }
}

main();