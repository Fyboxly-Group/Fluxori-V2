/**
 * Fix specific component-level issues
 *
 * This script addresses component-specific TypeScript errors, including:
 * - Props mismatch between components
 * - Missing required props
 * - Duplicate interface declarations
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Root directory
const ROOT_DIR = process.cwd();

function fixConnectionFormIssues() {
  console.log('🔍 Fixing ConnectionForm component issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/connections/components/ConnectionForm.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix duplicate isOpen and onClose props
    if (content.includes('isOpen?: boolean;') && content.match(/isOpen\??:\s*boolean;/g).length > 1) {
      // Find the interface definition
      const interfaceRegex = /interface ConnectionFormProps {([^}]+)}/;
      const interfaceMatch = content.match(interfaceRegex);
      
      if (interfaceMatch) {
        // Clean up the interface by removing duplicate properties
        const interfaceContent = interfaceMatch[1];
        const props = interfaceContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        // Remove duplicates
        const uniqueProps = [];
        const propKeys = new Set();
        
        props.forEach(prop => {
          const propKey = prop.split(':')[0].trim().replace('?', '');
          if (!propKeys.has(propKey)) {
            propKeys.add(propKey);
            uniqueProps.push(prop);
          }
        });
        
        // Rebuild the interface
        const newInterfaceContent = `interface ConnectionFormProps {\n  ${uniqueProps.join('\n  ')}\n}`;
        content = content.replace(interfaceRegex, newInterfaceContent);
      }
    }
    
    // Fix onConnect function type error
    if (content.includes('onConnect(formData)')) {
      content = content.replace(
        /onConnect\(formData\)/g,
        'onConnect && onConnect(formData)'
      );
    }
    
    // Fix import for Flex
    if (content.includes('@chakra-ui/react/stack') && content.includes('Flex')) {
      content = content.replace(
        /import { (.*), Flex } from '@chakra-ui\/react\/stack'/,
        'import { $1 } from \'@chakra-ui/react/stack\'\nimport { Flex } from \'@chakra-ui/react/flex\''
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ConnectionForm issues`);
  }
}

function fixDisconnectAlertDialogIssues() {
  console.log('🔍 Fixing DisconnectAlertDialog component issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/connections/components/DisconnectAlertDialog.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix props mismatch (open -> isOpen)
    if (content.includes('<AlertDialog') && content.includes('open={')) {
      // Fix props in the component interface
      content = content.replace(
        /interface DisconnectAlertDialogProps {([^}]+)}/,
        `interface DisconnectAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  marketplaceName: string;
  isLoading: boolean;
}`
      );
      
      // Fix usage of open prop in AlertDialog component
      content = content.replace(
        /open={(\w+)}/g,
        'isOpen={$1}'
      );
      
      // Fix the destructuring assignment in function params
      content = content.replace(
        /\{\s*open,\s*onClose,\s*onConfirm,\s*marketplaceName,\s*loading\s*\}: DisconnectAlertDialogProps/,
        '{ isOpen, onClose, onConfirm, marketplaceName, isLoading }: DisconnectAlertDialogProps'
      );
      
      // Fix any other references to the old props
      content = content.replace(/\bopen\b/g, 'isOpen');
      content = content.replace(/\bloading\b/g, 'isLoading');
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed DisconnectAlertDialog issues`);
  }
}

function fixMarketplaceCardIssues() {
  console.log('🔍 Fixing MarketplaceCard component issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/connections/components/MarketplaceCard.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix Link2Off import
    if (content.includes('Link2Off')) {
      content = content.replace(
        /import { ([^}]*?)Link2Off([^}]*?) } from ['"]lucide-react['"];/,
        'import { $1Unlink$2 } from "lucide-react";'
      );
      
      // Replace usage of Link2Off with Unlink
      content = content.replace(/Link2Off/g, 'Unlink');
    }
    
    // Fix DisconnectAlertDialog prop mismatch
    if (content.includes('<DisconnectAlertDialog') && content.includes('open={')) {
      content = content.replace(
        /<DisconnectAlertDialog\s+open={([^}]+)}\s+onClose={([^}]+)}\s+onConfirm={([^}]+)}\s+marketplaceName={([^}]+)}\s+loading={([^}]+)}/g,
        '<DisconnectAlertDialog isOpen={$1} onClose={$2} onConfirm={$3} marketplaceName={$4} isLoading={$5}'
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed MarketplaceCard issues`);
  }
}

function fixFeedbackListIssues() {
  console.log('🔍 Fixing FeedbackList component issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/feedback/components/FeedbackList.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix FeedbackViewModal prop mismatch (open -> isOpen)
    if (content.includes('<FeedbackViewModal') && content.includes('open={')) {
      content = content.replace(
        /<FeedbackViewModal\s+feedback={([^}]+)}\s+open={([^}]+)}\s+onClose={([^}]+)}\s+isAdmin={([^}]+)}/g,
        '<FeedbackViewModal feedback={$1} isOpen={$2} onClose={$3} isAdmin={$4}'
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed FeedbackList issues`);
  }
}

function fixFeedbackAnalyticsIssues() {
  console.log('🔍 Fixing FeedbackAnalytics component issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/feedback/components/FeedbackAnalytics.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix BarChart3 import
    if (content.includes('BarChart3')) {
      content = content.replace(
        /import { ([^}]*?)BarChart3([^}]*?) } from ['"]lucide-react['"];/,
        'import { $1BarChart$2 } from "lucide-react";'
      );
      
      // Replace usage of BarChart3 with BarChart
      content = content.replace(/BarChart3/g, 'BarChart');
    }
    
    // Fix Grid import
    if (content.includes('import { Grid,')) {
      content = content.replace(
        /import { Grid,([^}]+) } from ['"]@chakra-ui\/react['"];/,
        `import {$1 } from '@chakra-ui/react';\nimport { Grid } from '@chakra-ui/react/grid';`
      );
    }
    
    // Add chart.js and react-chartjs-2 module reference
    if (content.includes('chart.js') || content.includes('react-chartjs-2')) {
      if (!content.includes('/// <reference')) {
        content = `/// <reference path="../../../types/module-declarations.d.ts" />\n${content}`;
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed FeedbackAnalytics issues`);
  }
}

function fixInventoryDetailIssues() {
  console.log('🔍 Fixing InventoryDetail component issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/inventory/components/InventoryDetail.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix isLoading -> loading prop change
    if (content.includes('isLoading')) {
      content = content.replace(/isLoading/g, 'loading');
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed InventoryDetail issues`);
  }
}

function fixWarehouseInventoryIssues() {
  console.log('🔍 Fixing WarehouseInventory component issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/warehouse/components/WarehouseInventory.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix isLoading -> loading prop change
    if (content.includes('isLoading')) {
      content = content.replace(/isLoading/g, 'loading');
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed WarehouseInventory issues`);
  }
}

function fixNotificationCenterIssues() {
  console.log('🔍 Fixing NotificationCenter component issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/notifications/components/NotificationCenter.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix loading -> isLoading prop mismatch
    if (content.includes('loading={isLoading}')) {
      content = content.replace(
        /notifications={[^}]+}\s+loading={([^}]+)}/g,
        'notifications={$1} isLoading={$1}'
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed NotificationCenter issues`);
  }
}

function fixAICustomerServiceDemoIssues() {
  console.log('🔍 Fixing AICustomerServiceDemo component issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/ai-cs-agent/components/AICustomerServiceDemo.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add Switch import
    if (content.includes('<Switch') && !content.includes('@chakra-ui/react/switch')) {
      // Check if we need to add the import
      if (!content.includes('@chakra-ui/react/switch')) {
        // Find a good position to add the import
        const importSection = content.match(/import\s+{[^}]+}\s+from\s+['"]@chakra-ui\/react[^'"]+['"]/g);
        if (importSection && importSection.length > 0) {
          const newImport = `import { Switch } from '@chakra-ui/react/switch';`;
          content = content.replace(
            importSection[0],
            `${importSection[0]}\n${newImport}`
          );
        }
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed AICustomerServiceDemo issues`);
  }
}

function fixConversationListIssues() {
  console.log('🔍 Fixing ConversationList component issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/ai-cs-agent/components/ConversationList.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix Flex import
    if (content.includes('@chakra-ui/react/stack') && content.includes('Flex')) {
      content = content.replace(
        /import { ([^}]*?)Flex([^}]*?) } from ['"]@chakra-ui\/react\/stack['"];/,
        'import { $1$2 } from \'@chakra-ui/react/stack\';\nimport { Flex } from \'@chakra-ui/react/flex\';'
      );
    }
    
    // Add List import
    if (content.includes('<List') && !content.includes('@chakra-ui/react/list')) {
      // Check if we need to add the import
      if (!content.includes('@chakra-ui/react/list')) {
        // Find a good position to add the import
        const importSection = content.match(/import\s+{[^}]+}\s+from\s+['"]@chakra-ui\/react[^'"]+['"]/g);
        if (importSection && importSection.length > 0) {
          const newImport = `import { List, ListItem } from '@chakra-ui/react/list';`;
          content = content.replace(
            importSection[0],
            `${importSection[0]}\n${newImport}`
          );
        }
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ConversationList issues`);
  }
}

function fixBuyBoxComponentIssues() {
  console.log('🔍 Fixing BuyBox component issues...');
  
  // Handle BuyBoxDashboardPage.tsx
  const dashboardPath = path.join(ROOT_DIR, 'src/features/buybox/pages/BuyBoxDashboardPage.tsx');
  if (fs.existsSync(dashboardPath)) {
    let content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Add Chakra icon imports
    if (!content.includes('/// <reference')) {
      content = `/// <reference path="../../../types/module-declarations.d.ts" />\n${content}`;
    }
    
    // Fix Grid/GridItem/SimpleGrid imports
    if (content.includes('import { Grid,') || content.includes('import { SimpleGrid')) {
      // Replace with direct imports
      content = content.replace(
        /import { Grid, GridItem(.*?) } from ['"]@chakra-ui\/react['"];/,
        `import { $1 } from '@chakra-ui/react';\nimport { Grid } from '@chakra-ui/react/grid';\nimport { GridItem } from '@chakra-ui/react/grid';`
      );
      
      content = content.replace(
        /import { SimpleGrid(.*?) } from ['"]@chakra-ui\/react['"];/,
        `import { $1 } from '@chakra-ui/react';\nimport { SimpleGrid } from '@chakra-ui/react/simple-grid';`
      );
    }
    
    fs.writeFileSync(dashboardPath, content);
    console.log(`✅ Fixed BuyBoxDashboardPage issues`);
  }
  
  // Handle BuyBoxTimeline.tsx
  const timelinePath = path.join(ROOT_DIR, 'src/features/buybox/components/BuyBoxTimeline.tsx');
  if (fs.existsSync(timelinePath)) {
    let content = fs.readFileSync(timelinePath, 'utf8');
    
    // Add Chakra icon imports
    if (!content.includes('/// <reference')) {
      content = `/// <reference path="../../../types/module-declarations.d.ts" />\n${content}`;
    }
    
    // Fix Circle import
    if (content.includes('import { Circle,')) {
      content = content.replace(
        /import { Circle,(.*?) } from ['"]@chakra-ui\/react['"];/,
        `import { $1 } from '@chakra-ui/react';\nimport { Circle } from '@chakra-ui/react/circle';`
      );
    }
    
    fs.writeFileSync(timelinePath, content);
    console.log(`✅ Fixed BuyBoxTimeline issues`);
  }
  
  // Handle BuyBoxStatusCard.tsx and CompetitorTable.tsx
  const componentPaths = [
    path.join(ROOT_DIR, 'src/features/buybox/components/BuyBoxStatusCard.tsx'),
    path.join(ROOT_DIR, 'src/features/buybox/components/CompetitorTable.tsx')
  ];
  
  componentPaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Add Chakra icon imports
      if (!content.includes('/// <reference')) {
        content = `/// <reference path="../../../types/module-declarations.d.ts" />\n${content}`;
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${path.basename(filePath)} issues`);
    }
  });
  
  // Fix BuyBox API
  const apiPath = path.join(ROOT_DIR, 'src/features/buybox/api/buybox.api.ts');
  if (fs.existsSync(apiPath)) {
    let content = fs.readFileSync(apiPath, 'utf8');
    
    // Fix import conflict
    if (content.includes('import { ApiResponse }')) {
      content = content.replace(
        /import { ApiResponse } from ['"]@\/types\/api['"];/,
        `import { ApiResponse as BaseApiResponse } from '@/types/api';`
      );
      
      // Update references
      content = content.replace(/ApiResponse</g, 'BaseApiResponse<');
    }
    
    fs.writeFileSync(apiPath, content);
    console.log(`✅ Fixed BuyBox API issues`);
  }
}

function fixAdminPageIssues() {
  console.log('🔍 Fixing Admin page issues...');
  
  const filePath = path.join(ROOT_DIR, 'src/app/admin/feedback/page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix User type usage
    if (content.includes('isAdmin')) {
      // Add user type reference
      if (!content.includes('/// <reference')) {
        content = `/// <reference path="../../../types/user.d.ts" />\n${content}`;
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed Admin page issues`);
  }
}

function fixThemeIssues() {
  console.log('🔍 Fixing theme configuration issues...');
  
  const themePath = path.join(ROOT_DIR, 'src/theme/index.ts');
  
  if (fs.existsSync(themePath)) {
    let content = fs.readFileSync(themePath, 'utf8');
    
    // Fix import for createMultiStyleConfigHelpers
    if (content.includes('createMultiStyleConfigHelpers')) {
      // Add a reference to the module declarations
      if (!content.includes('/// <reference')) {
        content = `/// <reference path="../types/module-declarations.d.ts" />\n${content}`;
      }
    }
    
    // Update the theme export to include missing properties
    if (content.includes('export const theme')) {
      // Add the missing theme properties
      content = content.replace(
        /export const theme = {/,
        `export const theme = {
  // Add the missing properties needed by ChakraTheme
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    normal: 'normal',
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: '2',
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  sizes: {
    ...space,
    max: 'max-content',
    min: 'min-content',
    full: '100%',
    '3xs': '14rem',
    '2xs': '16rem',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    '8xl': '90rem',
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    outline: '0 0 0 3px rgba(66, 153, 225, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
    none: 'none',
    'dark-lg': 'rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 5px 10px, rgba(0, 0, 0, 0.4) 0px 15px 40px',
  },`
      );
    }
    
    // Fix export, make it a named export
    if (content.includes('export default theme')) {
      content = content.replace(
        'export default theme',
        'export { theme }'
      );
    }
    
    fs.writeFileSync(themePath, content);
    console.log(`✅ Fixed theme issues`);
  }
  
  // Also fix providers.tsx to use named import
  const providersPath = path.join(ROOT_DIR, 'src/app/providers.tsx');
  if (fs.existsSync(providersPath)) {
    let content = fs.readFileSync(providersPath, 'utf8');
    
    if (content.includes('import theme from')) {
      content = content.replace(
        "import theme from",
        "import { theme } from"
      );
      
      fs.writeFileSync(providersPath, content);
      console.log(`✅ Fixed providers theme import`);
    }
  }
}

function main() {
  try {
    console.log('🚀 Starting component fix script');
    
    // Create the necessary directories
    const typesDir = path.join(ROOT_DIR, 'src/types');
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }
    
    // Fix specific component issues
    fixConnectionFormIssues();
    fixDisconnectAlertDialogIssues();
    fixMarketplaceCardIssues();
    fixFeedbackListIssues();
    fixFeedbackAnalyticsIssues();
    fixInventoryDetailIssues();
    fixWarehouseInventoryIssues();
    fixNotificationCenterIssues();
    fixAICustomerServiceDemoIssues();
    fixConversationListIssues();
    fixBuyBoxComponentIssues();
    fixAdminPageIssues();
    fixThemeIssues();
    
    console.log('✅ All component fixes applied successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();