/**
 * Type declarations for Chakra UI v3 components
 * Generated automatically by fix-frontend-ts-errors.js
 */
/// <reference path="../../types/module-declarations.d.ts" />


// Tag component declarations
declare module '@chakra-ui/react/tag' {
  export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: string;
    size?: string;
    colorScheme?: string;
    [key: string]: any;
  }
  
  export const Tag: React.FC<TagProps>;
  export const TagLabel: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const TagLeftIcon: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const TagRightIcon: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const TagCloseButton: React.FC<React.HTMLAttributes<HTMLButtonElement>>;
}

// Table component declarations
declare module '@chakra-ui/react/table' {
  export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    variant?: string;
    size?: string;
    colorScheme?: string;
    [key: string]: any;
  }
  
  export const Table: React.FC<TableProps>;
  export const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>>;
  export const Tbody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>>;
  export const Tfoot: React.FC<React.HTMLAttributes<HTMLTableSectionElement>>;
  export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>>;
  export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>>;
  export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>>;
  export const TableCaption: React.FC<React.HTMLAttributes<HTMLTableCaptionElement>>;
  export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

// Progress component declarations
declare module '@chakra-ui/react/progress' {
  export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    max?: number;
    min?: number;
    size?: string;
    colorScheme?: string;
    hasStripe?: boolean;
    isAnimated?: boolean;
    [key: string]: any;
  }
  
  export const Progress: React.FC<ProgressProps>;
  export const ProgressLabel: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

// Menu component declarations
declare module '@chakra-ui/react/menu' {
  export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    defaultOpen?: boolean;
    placement?: string;
    strategy?: string;
    [key: string]: any;
  }
  
  export interface MenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    icon?: React.ReactNode;
    command?: string;
    [key: string]: any;
  }
  
  export const Menu: React.FC<MenuProps>;
  export const MenuButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  export const MenuList: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const MenuItem: React.FC<MenuItemProps>;
  export const MenuDivider: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const MenuGroup: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const MenuOptionGroup: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const MenuItemOption: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

// Modal component declarations
declare module '@chakra-ui/react/modal' {
  export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    defaultOpen?: boolean;
    [key: string]: any;
  }
  
  export const Modal: React.FC<ModalProps>;
  export const ModalOverlay: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const ModalContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const ModalHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const ModalBody: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const ModalFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const ModalCloseButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
}

// Other utility declarations
declare module '@chakra-ui/react/collapse' {
  export interface CollapseProps extends React.HTMLAttributes<HTMLDivElement> {
    in?: boolean;
    animateOpacity?: boolean;
    unmountOnExit?: boolean;
    [key: string]: any;
  }
  
  export const Collapse: React.FC<CollapseProps>;
}

declare module '@chakra-ui/react/divider' {
  export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    [key: string]: any;
  }
  
  export const Divider: React.FC<DividerProps>;
}

// Layout components
declare module '@chakra-ui/react/skeleton' {
  export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    isLoaded?: boolean;
    fadeDuration?: number;
    speed?: number;
    startColor?: string;
    endColor?: string;
    [key: string]: any;
  }
  
  export interface SkeletonTextProps extends SkeletonProps {
    noOfLines?: number;
    spacing?: string | number;
    skeletonHeight?: string | number;
    [key: string]: any;
  }
  
  export const Skeleton: React.FC<SkeletonProps>;
  export const SkeletonCircle: React.FC<SkeletonProps>;
  export const SkeletonText: React.FC<SkeletonTextProps>;
}

// Form components
declare module '@chakra-ui/react/form-control' {
  export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    [key: string]: any;
  }
  
  export const FormControl: React.FC<FormControlProps>;
  export const FormLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>>;
  export const FormHelperText: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const FormErrorMessage: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

declare module '@chakra-ui/react/input' {
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: string;
    size?: string;
    invalid?: boolean;
    focusBorderColor?: string;
    [key: string]: any;
  }
  
  export const Input: React.FC<InputProps>;
  export const InputGroup: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const InputLeftElement: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const InputRightElement: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const InputLeftAddon: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const InputRightAddon: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

// Theme utility
declare module '@chakra-ui/react/utils' {
  export function useColorModeValue<T>(light: T, dark: T): T;
}

// Add declarations for missing React Chartjs 2 types
declare module 'react-chartjs-2' {
  import { ChartData, ChartOptions } from 'chart.js';
  
  export interface ChartProps {
    data: ChartData;
    options?: ChartOptions;
    width?: number;
    height?: number;
    id?: string;
  }
  
  export class Doughnut extends React.Component<ChartProps> {}
  export class Bar extends React.Component<ChartProps> {}
  export class Line extends React.Component<ChartProps> {}
  export class Pie extends React.Component<ChartProps> {}
  export class PolarArea extends React.Component<ChartProps> {}
  export class Radar extends React.Component<ChartProps> {}
  export class Scatter extends React.Component<ChartProps> {}
}

// Add declarations for missing chart.js types
declare module 'chart.js' {
  export function Chart(ctx: CanvasRenderingContext2D, config: any): any;
  
  export interface ChartData {
    labels?: string[];
    datasets: any[];
  }
  
  export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: any;
    scales?: any;
    [key: string]: any;
  }
  
  export const registerables: any[];
  export function register(...items: any[]): void;
}