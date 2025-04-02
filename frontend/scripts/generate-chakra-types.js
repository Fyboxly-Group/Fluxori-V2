#!/usr/bin/env node

/**
 * This script analyzes the codebase for Chakra UI component usage
 * and automatically updates the type declaration files with
 * comprehensive type declarations for Chakra UI V3 components
 * 
 * It addresses the common TypeScript errors:
 * - TS2300: Duplicate identifier issues
 * - TS2304: Missing imports
 * - TS2305: Module import issues
 * - Interface definition errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SCAN_DIR = path.resolve(__dirname, '../src');
const TYPES_FILE = path.resolve(__dirname, '../src/types/chakra-ui-modules.d.ts');
const UTILITY_TYPES_FILE = path.resolve(__dirname, '../src/types/chakra-ui-enhanced.d.ts');

// Components to map and their import paths
const COMPONENT_MAP = {
  // Layout
  Box: '@chakra-ui/react/box',
  Container: '@chakra-ui/react/container',
  Flex: '@chakra-ui/react/flex',
  Grid: '@chakra-ui/react/grid',
  GridItem: '@chakra-ui/react/grid',
  SimpleGrid: '@chakra-ui/react/simple-grid',
  Stack: '@chakra-ui/react/stack',
  HStack: '@chakra-ui/react/stack',
  VStack: '@chakra-ui/react/stack',
  Center: '@chakra-ui/react/center',
  Wrap: '@chakra-ui/react/wrap',
  WrapItem: '@chakra-ui/react/wrap',
  
  // Typography
  Text: '@chakra-ui/react/text',
  Heading: '@chakra-ui/react/heading',
  
  // Forms
  Button: '@chakra-ui/react/button',
  IconButton: '@chakra-ui/react/button',
  ButtonGroup: '@chakra-ui/react/button-group',
  Checkbox: '@chakra-ui/react/checkbox',
  FormControl: '@chakra-ui/react/form-control',
  FormLabel: '@chakra-ui/react/form-control',
  FormErrorMessage: '@chakra-ui/react/form-control',
  FormHelperText: '@chakra-ui/react/form-control',
  Input: '@chakra-ui/react/input',
  InputGroup: '@chakra-ui/react/input',
  InputLeftAddon: '@chakra-ui/react/input',
  InputRightAddon: '@chakra-ui/react/input',
  InputLeftElement: '@chakra-ui/react/input',
  InputRightElement: '@chakra-ui/react/input',
  Select: '@chakra-ui/react/select',
  Radio: '@chakra-ui/react/radio',
  RadioGroup: '@chakra-ui/react/radio',
  Switch: '@chakra-ui/react/switch',
  Textarea: '@chakra-ui/react/textarea',
  
  // Data Display
  Badge: '@chakra-ui/react/badge',
  Card: '@chakra-ui/react/card',
  CardHeader: '@chakra-ui/react/card',
  CardBody: '@chakra-ui/react/card',
  CardFooter: '@chakra-ui/react/card',
  Divider: '@chakra-ui/react/divider',
  List: '@chakra-ui/react/list',
  ListItem: '@chakra-ui/react/list',
  ListIcon: '@chakra-ui/react/list',
  OrderedList: '@chakra-ui/react/list',
  UnorderedList: '@chakra-ui/react/list',
  Stat: '@chakra-ui/react/stat',
  StatLabel: '@chakra-ui/react/stat',
  StatNumber: '@chakra-ui/react/stat',
  StatHelpText: '@chakra-ui/react/stat',
  StatArrow: '@chakra-ui/react/stat',
  StatGroup: '@chakra-ui/react/stat',
  Table: '@chakra-ui/react/table',
  Thead: '@chakra-ui/react/table',
  Tbody: '@chakra-ui/react/table',
  Tfoot: '@chakra-ui/react/table',
  Tr: '@chakra-ui/react/table',
  Th: '@chakra-ui/react/table',
  Td: '@chakra-ui/react/table',
  TableCaption: '@chakra-ui/react/table',
  TableContainer: '@chakra-ui/react/table',
  
  // Navigation
  Breadcrumb: '@chakra-ui/react/breadcrumb',
  BreadcrumbItem: '@chakra-ui/react/breadcrumb',
  BreadcrumbLink: '@chakra-ui/react/breadcrumb',
  BreadcrumbSeparator: '@chakra-ui/react/breadcrumb',
  Link: '@chakra-ui/react/link',
  Menu: '@chakra-ui/react/menu',
  MenuButton: '@chakra-ui/react/menu',
  MenuList: '@chakra-ui/react/menu',
  MenuItem: '@chakra-ui/react/menu',
  MenuDivider: '@chakra-ui/react/menu',
  MenuGroup: '@chakra-ui/react/menu',
  MenuOptionGroup: '@chakra-ui/react/menu',
  MenuItemOption: '@chakra-ui/react/menu',
  
  // Feedback
  Alert: '@chakra-ui/react/alert',
  AlertIcon: '@chakra-ui/react/alert',
  AlertTitle: '@chakra-ui/react/alert',
  AlertDescription: '@chakra-ui/react/alert',
  CircularProgress: '@chakra-ui/react/circular-progress',
  CircularProgressLabel: '@chakra-ui/react/circular-progress',
  Progress: '@chakra-ui/react/progress',
  Spinner: '@chakra-ui/react/spinner',
  Skeleton: '@chakra-ui/react/skeleton',
  SkeletonCircle: '@chakra-ui/react/skeleton',
  SkeletonText: '@chakra-ui/react/skeleton',
  
  // Overlay
  Modal: '@chakra-ui/react/modal',
  ModalOverlay: '@chakra-ui/react/modal',
  ModalContent: '@chakra-ui/react/modal',
  ModalHeader: '@chakra-ui/react/modal',
  ModalCloseButton: '@chakra-ui/react/modal',
  ModalBody: '@chakra-ui/react/modal',
  ModalFooter: '@chakra-ui/react/modal',
  Popover: '@chakra-ui/react/popover',
  PopoverTrigger: '@chakra-ui/react/popover',
  PopoverContent: '@chakra-ui/react/popover',
  PopoverHeader: '@chakra-ui/react/popover',
  PopoverBody: '@chakra-ui/react/popover',
  PopoverFooter: '@chakra-ui/react/popover',
  PopoverArrow: '@chakra-ui/react/popover',
  PopoverCloseButton: '@chakra-ui/react/popover',
  PopoverAnchor: '@chakra-ui/react/popover',
  Tooltip: '@chakra-ui/react/tooltip',
  
  // Disclosure
  Accordion: '@chakra-ui/react/accordion',
  AccordionItem: '@chakra-ui/react/accordion',
  AccordionButton: '@chakra-ui/react/accordion',
  AccordionPanel: '@chakra-ui/react/accordion',
  AccordionIcon: '@chakra-ui/react/accordion',
  Tabs: '@chakra-ui/react/tabs',
  TabList: '@chakra-ui/react/tabs',
  Tab: '@chakra-ui/react/tabs',
  TabPanels: '@chakra-ui/react/tabs',
  TabPanel: '@chakra-ui/react/tabs',
  
  // Media
  Avatar: '@chakra-ui/react/avatar',
  AvatarBadge: '@chakra-ui/react/avatar',
  AvatarGroup: '@chakra-ui/react/avatar',
  Image: '@chakra-ui/react/image',
  Icon: '@chakra-ui/react/icon',
  
  // Other
  CloseButton: '@chakra-ui/react/close-button',
  Portal: '@chakra-ui/react/portal',
  Drawer: '@chakra-ui/react/drawer',
  DrawerBody: '@chakra-ui/react/drawer',
  DrawerFooter: '@chakra-ui/react/drawer',
  DrawerHeader: '@chakra-ui/react/drawer',
  DrawerOverlay: '@chakra-ui/react/drawer',
  DrawerContent: '@chakra-ui/react/drawer',
  DrawerCloseButton: '@chakra-ui/react/drawer',
};

// Common props shared by many components
const commonProps = {
  margin: 'ResponsiveValue<string | number>',
  m: 'ResponsiveValue<string | number>',
  marginTop: 'ResponsiveValue<string | number>',
  mt: 'ResponsiveValue<string | number>',
  marginRight: 'ResponsiveValue<string | number>',
  mr: 'ResponsiveValue<string | number>',
  marginBottom: 'ResponsiveValue<string | number>',
  mb: 'ResponsiveValue<string | number>',
  marginLeft: 'ResponsiveValue<string | number>',
  ml: 'ResponsiveValue<string | number>',
  marginX: 'ResponsiveValue<string | number>',
  mx: 'ResponsiveValue<string | number>',
  marginY: 'ResponsiveValue<string | number>',
  my: 'ResponsiveValue<string | number>',
  
  padding: 'ResponsiveValue<string | number>',
  p: 'ResponsiveValue<string | number>',
  paddingTop: 'ResponsiveValue<string | number>',
  pt: 'ResponsiveValue<string | number>',
  paddingRight: 'ResponsiveValue<string | number>',
  pr: 'ResponsiveValue<string | number>',
  paddingBottom: 'ResponsiveValue<string | number>',
  pb: 'ResponsiveValue<string | number>',
  paddingLeft: 'ResponsiveValue<string | number>',
  pl: 'ResponsiveValue<string | number>',
  paddingX: 'ResponsiveValue<string | number>',
  px: 'ResponsiveValue<string | number>',
  paddingY: 'ResponsiveValue<string | number>',
  py: 'ResponsiveValue<string | number>',
  
  color: 'ResponsiveValue<string>',
  bg: 'ResponsiveValue<string>',
  backgroundColor: 'ResponsiveValue<string>',
  
  width: 'ResponsiveValue<string | number>',
  w: 'ResponsiveValue<string | number>',
  minWidth: 'ResponsiveValue<string | number>',
  minW: 'ResponsiveValue<string | number>',
  maxWidth: 'ResponsiveValue<string | number>',
  maxW: 'ResponsiveValue<string | number>',
  
  height: 'ResponsiveValue<string | number>',
  h: 'ResponsiveValue<string | number>',
  minHeight: 'ResponsiveValue<string | number>',
  minH: 'ResponsiveValue<string | number>',
  maxHeight: 'ResponsiveValue<string | number>',
  maxH: 'ResponsiveValue<string | number>',
  
  textAlign: 'ResponsiveValue<string>',
  fontWeight: 'ResponsiveValue<string | number>',
  lineHeight: 'ResponsiveValue<string | number>',
  fontSize: 'ResponsiveValue<string | number>',
  
  display: 'ResponsiveValue<string>',
  position: 'ResponsiveValue<string>',
  top: 'ResponsiveValue<string | number>',
  right: 'ResponsiveValue<string | number>',
  bottom: 'ResponsiveValue<string | number>',
  left: 'ResponsiveValue<string | number>',
  
  borderRadius: 'ResponsiveValue<string | number>',
  borderWidth: 'ResponsiveValue<string | number>',
  borderColor: 'ResponsiveValue<string>',
  boxShadow: 'ResponsiveValue<string>',
  
  opacity: 'ResponsiveValue<number | string>',
  
  flex: 'ResponsiveValue<string | number>',
  flexDirection: 'ResponsiveValue<string>',
  flexWrap: 'ResponsiveValue<string>',
  alignItems: 'ResponsiveValue<string>',
  justifyContent: 'ResponsiveValue<string>',
  justify: 'ResponsiveValue<string>',
  gap: 'ResponsiveValue<string | number>',
  
  overflow: 'ResponsiveValue<string>',
  overflowX: 'ResponsiveValue<string>',
  overflowY: 'ResponsiveValue<string>',
};

// Component-specific additional props
const specificProps = {
  Box: {},
  
  Flex: {
    direction: 'ResponsiveValue<string>',
    wrap: 'ResponsiveValue<string>',
    basis: 'ResponsiveValue<string | number>',
    grow: 'ResponsiveValue<string | number>',
    shrink: 'ResponsiveValue<string | number>',
  },
  
  Grid: {
    templateColumns: 'ResponsiveValue<string>',
    templateRows: 'ResponsiveValue<string>',
    templateAreas: 'ResponsiveValue<string>',
    autoColumns: 'ResponsiveValue<string>',
    autoRows: 'ResponsiveValue<string>',
    autoFlow: 'ResponsiveValue<string>',
    gridGap: 'ResponsiveValue<string | number>',
    gridColumnGap: 'ResponsiveValue<string | number>',
    gridRowGap: 'ResponsiveValue<string | number>',
  },
  
  GridItem: {
    colSpan: 'ResponsiveValue<number>',
    rowSpan: 'ResponsiveValue<number>',
    colStart: 'ResponsiveValue<number>',
    colEnd: 'ResponsiveValue<number>',
    rowStart: 'ResponsiveValue<number>',
    rowEnd: 'ResponsiveValue<number>',
  },
  
  Stack: {
    direction: 'ResponsiveValue<"row" | "column" | "row-reverse" | "column-reverse">',
  },
  
  Button: {
    variant: 'string',
    colorScheme: 'string',
    size: 'string',
    loading: 'boolean',
    disabled: 'boolean',
    leftIcon: 'React.ReactElement',
    rightIcon: 'React.ReactElement',
    spinner: 'React.ReactElement',
    spinnerPlacement: '"start" | "end"',
    isFullWidth: 'boolean',
    loadingText: 'string',
    iconSpacing: 'string | number',
  },
  
  IconButton: {
    'aria-label': 'string',
    icon: 'React.ReactElement',
  },
  
  Text: {
    as: 'React.ElementType',
    noOfLines: 'ResponsiveValue<number>',
    isTruncated: 'boolean',
    letterSpacing: 'ResponsiveValue<string>',
    textTransform: 'ResponsiveValue<string>',
  },
  
  Heading: {
    as: 'React.ElementType',
    size: 'ResponsiveValue<"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl">',
  },
  
  Input: {
    focusBorderColor: 'string',
    errorBorderColor: 'string',
    invalid: 'boolean',
    disabled: 'boolean',
    readOnly: 'boolean',
    variant: 'string',
    size: 'string',
    htmlSize: 'number',
  },
  
  Textarea: {
    focusBorderColor: 'string',
    errorBorderColor: 'string',
    invalid: 'boolean',
    disabled: 'boolean',
    readOnly: 'boolean',
    variant: 'string',
    size: 'string',
    resize: 'ResponsiveValue<"none" | "horizontal" | "vertical" | "both">',
  },
  
  FormControl: {
    invalid: 'boolean',
    disabled: 'boolean',
    required: 'boolean',
    htmlFor: 'string',
  },
  
  Select: {
    focusBorderColor: 'string',
    errorBorderColor: 'string',
    invalid: 'boolean',
    disabled: 'boolean',
    readOnly: 'boolean',
    variant: 'string',
    size: 'string',
    placeholder: 'string',
  },
  
  Checkbox: {
    checked: 'boolean',
    defaultChecked: 'boolean',
    disabled: 'boolean',
    colorScheme: 'string',
    size: 'string',
    spacing: 'string | number',
    iconColor: 'string',
    iconSize: 'string | number',
  },
  
  Switch: {
    checked: 'boolean',
    defaultChecked: 'boolean',
    disabled: 'boolean',
    colorScheme: 'string',
    size: 'string',
  },
  
  Card: {
    variant: 'string',
    size: 'string',
    direction: 'ResponsiveValue<"row" | "column">',
  },
  
  Alert: {
    status: '"info" | "warning" | "success" | "error" | "loading"',
    variant: 'string',
    colorScheme: 'string',
  },
  
  Spinner: {
    size: 'string',
    thickness: 'string',
    speed: 'string',
    emptyColor: 'string',
    color: 'string',
  },
  
  Modal: {
    open: 'boolean',
    onClose: '() => void',
    initialFocusRef: 'React.RefObject<HTMLElement>',
    finalFocusRef: 'React.RefObject<HTMLElement>',
    isCentered: 'boolean',
    closeOnOverlayClick: 'boolean',
    closeOnEsc: 'boolean',
    scrollBehavior: '"inside" | "outside"',
    size: 'string',
    motionPreset: '"scale" | "slideInBottom" | "slideInRight" | "none"',
    blockScrollOnMount: 'boolean',
  },
  
  Tabs: {
    index: 'number',
    defaultIndex: 'number',
    onChange: '(index: number) => void',
    variant: 'string',
    colorScheme: 'string',
    orientation: '"horizontal" | "vertical"',
    size: 'string',
    isFitted: 'boolean',
    isLazy: 'boolean',
    lazyBehavior: '"keepMounted" | "unmount"',
  },
  
  Avatar: {
    size: 'string',
    name: 'string',
    src: 'string',
    srcSet: 'string',
    showBorder: 'boolean',
    borderRadius: 'string',
    bg: 'string',
  },
  
  Popover: {
    open: 'boolean',
    onClose: '() => void',
    initialFocusRef: 'React.RefObject<HTMLElement>',
    closeOnBlur: 'boolean',
    closeOnEsc: 'boolean',
    placement: 'string',
    strategy: '"fixed" | "absolute"',
    offset: 'number[]',
    gutter: 'number',
  },
  
  Menu: {
    open: 'boolean',
    onClose: '() => void',
    closeOnSelect: 'boolean',
    closeOnBlur: 'boolean',
    placement: 'string',
    offset: 'number[]',
  },
  
  Drawer: {
    open: 'boolean',
    onClose: '() => void',
    placement: '"top" | "right" | "bottom" | "left"',
    size: 'string',
    isFullHeight: 'boolean',
  },
};

// HTML element types for components
const htmlElementTypes = {
  Box: 'HTMLDivElement',
  Flex: 'HTMLDivElement',
  Stack: 'HTMLDivElement',
  HStack: 'HTMLDivElement',
  VStack: 'HTMLDivElement',
  Button: 'HTMLButtonElement',
  Text: 'HTMLParagraphElement',
  Heading: 'HTMLHeadingElement',
  Input: 'HTMLInputElement',
  Textarea: 'HTMLTextAreaElement',
  Select: 'HTMLSelectElement',
  Checkbox: 'HTMLInputElement',
  Radio: 'HTMLInputElement',
  Switch: 'HTMLInputElement',
  Link: 'HTMLAnchorElement',
  Image: 'HTMLImageElement',
};

// Find all TypeScript and TSX files in the project
const findTsFiles = () => {
  try {
    const result = execSync(`find ${SCAN_DIR} -type f -name "*.ts*" | grep -v ".d.ts" | grep -v "node_modules"`).toString().trim();
    return result.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding TS files:', error);
    return [];
  }
};

// Find Chakra UI components used in a file
const findChakraComponents = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const usedComponents = new Set();
  
  // Look for import statements from @chakra-ui/react
  const barrelImportRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@chakra-ui\/react['"]/g;
  let match;
  
  while ((match = barrelImportRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(part => part.trim());
    for (const importName of imports) {
      const cleanName = importName.split(' as ')[0].trim();
      if (COMPONENT_MAP[cleanName]) {
        usedComponents.add(cleanName);
      }
    }
  }
  
  // Look for direct imports from @chakra-ui/react/component
  const directImportRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@chakra-ui\/react\/([^'"]+)['"]/g;
  while ((match = directImportRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(part => part.trim());
    for (const importName of imports) {
      const cleanName = importName.split(' as ')[0].trim();
      if (COMPONENT_MAP[cleanName]) {
        usedComponents.add(cleanName);
      }
    }
  }
  
  // Look for JSX components
  for (const component of Object.keys(COMPONENT_MAP)) {
    const componentRegex = new RegExp(`<${component}[\\s/>]`, 'g');
    if (componentRegex.test(content)) {
      usedComponents.add(component);
    }
  }
  
  return [...usedComponents];
};

// Generate utility types for responsive values
const generateUtilityTypes = () => {
  const content = `/**
 * Utility types for Chakra UI components
 */

// Type for responsive values
export type ResponsiveValue<T> = T | Record<string, T>;

// Type for style props
export interface StyleProps {
  margin?: ResponsiveValue<string | number>;
  m?: ResponsiveValue<string | number>;
  marginTop?: ResponsiveValue<string | number>;
  mt?: ResponsiveValue<string | number>;
  marginRight?: ResponsiveValue<string | number>;
  mr?: ResponsiveValue<string | number>;
  marginBottom?: ResponsiveValue<string | number>;
  mb?: ResponsiveValue<string | number>;
  marginLeft?: ResponsiveValue<string | number>;
  ml?: ResponsiveValue<string | number>;
  marginX?: ResponsiveValue<string | number>;
  mx?: ResponsiveValue<string | number>;
  marginY?: ResponsiveValue<string | number>;
  my?: ResponsiveValue<string | number>;
  
  padding?: ResponsiveValue<string | number>;
  p?: ResponsiveValue<string | number>;
  paddingTop?: ResponsiveValue<string | number>;
  pt?: ResponsiveValue<string | number>;
  paddingRight?: ResponsiveValue<string | number>;
  pr?: ResponsiveValue<string | number>;
  paddingBottom?: ResponsiveValue<string | number>;
  pb?: ResponsiveValue<string | number>;
  paddingLeft?: ResponsiveValue<string | number>;
  pl?: ResponsiveValue<string | number>;
  paddingX?: ResponsiveValue<string | number>;
  px?: ResponsiveValue<string | number>;
  paddingY?: ResponsiveValue<string | number>;
  py?: ResponsiveValue<string | number>;
  
  width?: ResponsiveValue<string | number>;
  w?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  h?: ResponsiveValue<string | number>;
  
  color?: ResponsiveValue<string>;
  bg?: ResponsiveValue<string>;
  backgroundColor?: ResponsiveValue<string>;
  
  display?: ResponsiveValue<string>;
  flex?: ResponsiveValue<string | number>;
  flexDirection?: ResponsiveValue<string>;
  alignItems?: ResponsiveValue<string>;
  justifyContent?: ResponsiveValue<string>;
  gap?: ResponsiveValue<string | number>;
}

// Type for grid template columns
export interface GridTemplateColumns {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  [key: string]: string | undefined;
}

// Type for responsive flex props
export interface FlexProps extends StyleProps {
  direction?: ResponsiveValue<string>;
  wrap?: ResponsiveValue<string>;
  basis?: ResponsiveValue<string | number>;
  grow?: ResponsiveValue<string | number>;
  shrink?: ResponsiveValue<string | number>;
}
`;

  return content;
};

// Generate type declaration for a component
const generateComponentDeclaration = (component, modulePath) => {
  // Skip if not in map
  if (!modulePath) return '';
  
  // Get HTML element type for component
  const htmlElementType = htmlElementTypes[component] || 'HTMLElement';
  const htmlProps = `React.HTMLAttributes<${htmlElementType}>`;
  
  // Get component-specific props
  const componentSpecificProps = specificProps[component] || {};
  
  switch (component) {
    case 'Box':
      return `
declare module '${modulePath}' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface BoxProps extends ${htmlProps}, StyleProps {
    as?: React.ElementType;
    [key: string]: any;
  }
  
  export const Box: React.FC<BoxProps>;
}`;
      
    case 'Flex':
      return `
declare module '${modulePath}' {
  import { ResponsiveValue, FlexProps } from '../types/chakra-ui-enhanced';
  
  export interface FlexProps extends ${htmlProps}, FlexProps {
    as?: React.ElementType;
    [key: string]: any;
  }
  
  export const Flex: React.FC<FlexProps>;
}`;
      
    case 'Button':
      return `
declare module '${modulePath}' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
    variant?: string;
    colorScheme?: string;
    size?: string;
    loading?: boolean;  // Changed from isLoading
    disabled?: boolean; // Changed from isDisabled
    leftIcon?: React.ReactElement;
    rightIcon?: React.ReactElement;
    spinner?: React.ReactElement;
    spinnerPlacement?: "start" | "end";
    loadingText?: string;
    isFullWidth?: boolean;
    [key: string]: any;
  }
  
  export const Button: React.FC<ButtonProps>;
  
  export interface IconButtonProps extends ButtonProps {
    icon?: React.ReactElement;
    'aria-label': string;
    [key: string]: any;
  }
  
  export const IconButton: React.FC<IconButtonProps>;
}`;
      
    case 'Stack':
    case 'HStack':
    case 'VStack':
      return `
declare module '${modulePath}' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface StackProps extends ${htmlProps}, StyleProps {
    direction?: ResponsiveValue<"row" | "column" | "row-reverse" | "column-reverse">;
    gap?: ResponsiveValue<string | number>;
    divider?: React.ReactElement;
    as?: React.ElementType;
    [key: string]: any;
  }
  
  export const Stack: React.FC<StackProps>;
  export const HStack: React.FC<StackProps>;
  export const VStack: React.FC<StackProps>;
}`;
      
    case 'Grid':
      return `
declare module '${modulePath}' {
  import { ResponsiveValue, StyleProps, GridTemplateColumns } from '../types/chakra-ui-enhanced';
  
  export interface GridProps extends ${htmlProps}, StyleProps {
    templateColumns?: ResponsiveValue<string | GridTemplateColumns>;
    templateRows?: ResponsiveValue<string>;
    templateAreas?: ResponsiveValue<string>;
    autoColumns?: ResponsiveValue<string>;
    autoRows?: ResponsiveValue<string>;
    autoFlow?: ResponsiveValue<string>;
    gridGap?: ResponsiveValue<string | number>;
    gridColumnGap?: ResponsiveValue<string | number>;
    gridRowGap?: ResponsiveValue<string | number>;
    as?: React.ElementType;
    [key: string]: any;
  }
  
  export const Grid: React.FC<GridProps>;
  
  export interface GridItemProps extends ${htmlProps}, StyleProps {
    colSpan?: ResponsiveValue<number>;
    rowSpan?: ResponsiveValue<number>;
    colStart?: ResponsiveValue<number>;
    colEnd?: ResponsiveValue<number>;
    rowStart?: ResponsiveValue<number>;
    rowEnd?: ResponsiveValue<number>;
    as?: React.ElementType;
    [key: string]: any;
  }
  
  export const GridItem: React.FC<GridItemProps>;
}`;
      
    case 'FormControl':
      return `
declare module '${modulePath}' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface FormControlProps extends ${htmlProps}, StyleProps {
    invalid?: boolean; // Changed from isInvalid
    disabled?: boolean; // Changed from isDisabled
    required?: boolean;
    as?: React.ElementType;
    [key: string]: any;
  }
  
  export const FormControl: React.FC<FormControlProps>;
  
  export interface FormLabelProps extends ${htmlProps}, StyleProps {
    htmlFor?: string;
    [key: string]: any;
  }
  
  export const FormLabel: React.FC<FormLabelProps>;
  
  export interface FormErrorMessageProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const FormErrorMessage: React.FC<FormErrorMessageProps>;
  
  export interface FormHelperTextProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const FormHelperText: React.FC<FormHelperTextProps>;
}`;
      
    case 'Input':
      return `
declare module '${modulePath}' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, StyleProps {
    focusBorderColor?: string;
    errorBorderColor?: string;
    invalid?: boolean; // Changed from isInvalid
    disabled?: boolean; // Changed from isDisabled
    readOnly?: boolean; // Changed from isReadOnly
    variant?: string;
    size?: string;
    htmlSize?: number;
    [key: string]: any;
  }
  
  export const Input: React.FC<InputProps>;
  
  export interface InputGroupProps extends ${htmlProps}, StyleProps {
    size?: string;
    [key: string]: any;
  }
  
  export const InputGroup: React.FC<InputGroupProps>;
  
  export interface InputLeftElementProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const InputLeftElement: React.FC<InputLeftElementProps>;
  
  export interface InputRightElementProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const InputRightElement: React.FC<InputRightElementProps>;
  
  export interface InputLeftAddonProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const InputLeftAddon: React.FC<InputLeftAddonProps>;
  
  export interface InputRightAddonProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const InputRightAddon: React.FC<InputRightAddonProps>;
}`;
      
    case 'Card':
      return `
declare module '${modulePath}' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface CardProps extends ${htmlProps}, StyleProps {
    variant?: string;
    size?: string;
    direction?: ResponsiveValue<"row" | "column">;
    [key: string]: any;
  }
  
  export const Card: React.FC<CardProps>;
  
  export interface CardHeaderProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const CardHeader: React.FC<CardHeaderProps>;
  
  export interface CardBodyProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const CardBody: React.FC<CardBodyProps>;
  
  export interface CardFooterProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const CardFooter: React.FC<CardFooterProps>;
}`;
      
    case 'Modal':
      return `
declare module '${modulePath}' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface ModalProps {
    open?: boolean; // Changed from isOpen
    onClose: () => void;
    initialFocusRef?: React.RefObject<HTMLElement>;
    finalFocusRef?: React.RefObject<HTMLElement>;
    isCentered?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
    scrollBehavior?: "inside" | "outside";
    size?: string;
    motionPreset?: "scale" | "slideInBottom" | "slideInRight" | "none";
    blockScrollOnMount?: boolean;
    children: React.ReactNode;
    [key: string]: any;
  }
  
  export const Modal: React.FC<ModalProps>;
  
  export interface ModalOverlayProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const ModalOverlay: React.FC<ModalOverlayProps>;
  
  export interface ModalContentProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const ModalContent: React.FC<ModalContentProps>;
  
  export interface ModalHeaderProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const ModalHeader: React.FC<ModalHeaderProps>;
  
  export interface ModalFooterProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const ModalFooter: React.FC<ModalFooterProps>;
  
  export interface ModalBodyProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const ModalBody: React.FC<ModalBodyProps>;
  
  export interface ModalCloseButtonProps extends ${htmlProps}, StyleProps {
    [key: string]: any;
  }
  
  export const ModalCloseButton: React.FC<ModalCloseButtonProps>;
}`;
      
    // Default case for simpler components
    default:
      return `
declare module '${modulePath}' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface ${component}Props extends ${htmlProps}, StyleProps {
    ${Object.entries(componentSpecificProps)
      .map(([prop, type]) => `${prop}?: ${type};`)
      .join('\n    ')}
    [key: string]: any;
  }
  
  export const ${component}: React.FC<${component}Props>;
}`;
  }
};

// Generate initial import for type file
const generateImportStatements = () => {
  return `/**
 * Type declarations for Chakra UI v3 components
 * Generated by generate-chakra-types.js
 */

// Import utility types
import { ResponsiveValue, StyleProps } from './chakra-ui-enhanced';

// This file contains module declarations for all Chakra UI v3 components
// when using the direct import pattern: import { Box } from '@chakra-ui/react/box'

`;
};

// Check if declaration already exists in types file
const declarationExists = (typesContent, modulePath) => {
  return typesContent.includes(`declare module '${modulePath}'`);
};

// Main function
const main = async () => {
  console.log('🔍 Scanning for Chakra UI component usage...');
  
  // First, ensure utility types file exists
  try {
    fs.writeFileSync(UTILITY_TYPES_FILE, generateUtilityTypes());
    console.log(`✅ Created utility types at ${UTILITY_TYPES_FILE}`);
  } catch (error) {
    console.error(`❌ Error creating utility types file: ${error.message}`);
  }
  
  // Find all TS/TSX files
  const tsFiles = findTsFiles();
  console.log(`🔍 Found ${tsFiles.length} TypeScript files to scan`);
  
  // Track all used components
  const usedComponents = new Set();
  
  // Scan each file for Chakra components
  for (const file of tsFiles) {
    const components = findChakraComponents(file);
    components.forEach(component => usedComponents.add(component));
  }
  
  console.log(`✨ Found ${usedComponents.size} Chakra UI components in use`);
  
  // Read existing types file or create new one
  let typesContent = '';
  try {
    typesContent = fs.readFileSync(TYPES_FILE, 'utf8');
  } catch (error) {
    console.log('Types file not found, creating a new one');
    typesContent = generateImportStatements();
  }
  
  // Generate declarations for components
  let updatedContent = typesContent;
  let addedCount = 0;
  
  // Add all components to the declarations (even unused ones)
  // This ensures we have a comprehensive type system
  for (const component of Object.keys(COMPONENT_MAP)) {
    const modulePath = COMPONENT_MAP[component];
    if (modulePath && !declarationExists(typesContent, modulePath)) {
      const declaration = generateComponentDeclaration(component, modulePath);
      updatedContent += declaration;
      addedCount++;
    }
  }
  
  // Only update file if changes were made
  if (addedCount > 0) {
    fs.writeFileSync(TYPES_FILE, updatedContent);
    console.log(`✅ Added ${addedCount} new type declarations to ${TYPES_FILE}`);
  } else {
    console.log('✅ No new type declarations needed');
  }
  
  // Create a summary of components and their paths
  const componentSummary = Object.entries(COMPONENT_MAP)
    .map(([component, modulePath]) => `${component}: ${modulePath}`)
    .join('\n');
  
  // Save summary for reference
  fs.writeFileSync(
    path.resolve(__dirname, '../chakra-components-map.txt'),
    componentSummary
  );
  
  console.log('✅ Created component path mapping for reference');
  console.log('✅ Generated comprehensive type declarations for Chakra UI V3 components');
};

// Run the script
main().catch(error => {
  console.error(`❌ Script execution failed: ${error.message}`);
  process.exit(1);
});