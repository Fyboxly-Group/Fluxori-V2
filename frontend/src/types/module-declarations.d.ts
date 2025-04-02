/**
 * Global module declarations for missing TypeScript types
 * 
 * This file contains declarations for modules that don't have their own type declarations
 * or where we need to augment the existing declarations.
 * 
 * Generated: 2025-04-01T21:56:02.716Z
 */
/// <reference path="../../types/module-declarations.d.ts" />


// ChakraUI components that need specific paths

declare module '@chakra-ui/react/grid' {
  import { FC, ReactNode } from 'react';
  
  export interface GridProps {
    children?: ReactNode;
    [key: string]: any;
  }
  
  export const Grid: FC<GridProps>;
}

declare module '@chakra-ui/react/grid' {
  import { FC, ReactNode } from 'react';
  
  export interface GridItemProps {
    children?: ReactNode;
    [key: string]: any;
  }
  
  export const GridItem: FC<GridItemProps>;
}

declare module '@chakra-ui/react/simple-grid' {
  import { FC, ReactNode } from 'react';
  
  export interface SimpleGridProps {
    children?: ReactNode;
    [key: string]: any;
  }
  
  export const SimpleGrid: FC<SimpleGridProps>;
}

declare module '@chakra-ui/react/circle' {
  import { FC, ReactNode } from 'react';
  
  export interface CircleProps {
    children?: ReactNode;
    [key: string]: any;
  }
  
  export const Circle: FC<CircleProps>;
}

declare module '@chakra-ui/react/switch' {
  import { FC, ReactNode } from 'react';
  
  export interface SwitchProps {
    children?: ReactNode;
    [key: string]: any;
  }
  
  export const Switch: FC<SwitchProps>;
}

declare module '@chakra-ui/react/list' {
  import { FC, ReactNode } from 'react';
  
  export interface ListProps {
    children?: ReactNode;
    [key: string]: any;
  }
  
  export const List: FC<ListProps>;
}

declare module '@chakra-ui/react/list' {
  import { FC, ReactNode } from 'react';
  
  export interface ListItemProps {
    children?: ReactNode;
    [key: string]: any;
  }
  
  export const ListItem: FC<ListItemProps>;
}

declare module '@chakra-ui/react/flex' {
  import { FC, ReactNode } from 'react';
  
  export interface FlexProps {
    children?: ReactNode;
    [key: string]: any;
  }
  
  export const Flex: FC<FlexProps>;
}

// Chakra UI theme utilities
declare module '@chakra-ui/react/styled-system' {
  export const createMultiStyleConfigHelpers: any;
}

// Chakra UI theme augmentation
import { ChakraTheme } from '@/utils/chakra-compat';

declare module '@chakra-ui/react' {
  export const theme: ChakraTheme;
  export const createIcon: any;
  export const toast: any;
}

// Chart.js and react-chartjs-2
declare module 'chart.js' {
  export const Chart: any;
  export const registerables: any[];
}

declare module 'react-chartjs-2' {
  export const Bar: React.FC<any>;
  export const Line: React.FC<any>;
  export const Pie: React.FC<any>;
  export const Doughnut: React.FC<any>;
}

// Chakra UI icons
declare module '@chakra-ui/icons' {
  import { FC } from 'react';
  
  interface IconProps {
    color?: string;
    boxSize?: string | number;
    [key: string]: any;
  }
  
  export const ChevronDownIcon: FC<IconProps>;
  export const ChevronUpIcon: FC<IconProps>;
  export const ChevronLeftIcon: FC<IconProps>;
  export const ChevronRightIcon: FC<IconProps>;
  export const SearchIcon: FC<IconProps>;
  export const CheckIcon: FC<IconProps>;
  export const CloseIcon: FC<IconProps>;
  export const AddIcon: FC<IconProps>;
  export const MinusIcon: FC<IconProps>;
  export const InfoIcon: FC<IconProps>;
  export const WarningIcon: FC<IconProps>;
  export const DeleteIcon: FC<IconProps>;
  export const EditIcon: FC<IconProps>;
  export const ViewIcon: FC<IconProps>;
  export const ExternalLinkIcon: FC<IconProps>;
  export const HamburgerIcon: FC<IconProps>;
  export const SunIcon: FC<IconProps>;
  export const MoonIcon: FC<IconProps>;
  export const InfoOutlineIcon: FC<IconProps>;
  export const WarningTwoIcon: FC<IconProps>;
  export const CheckCircleIcon: FC<IconProps>;
  export const TimeIcon: FC<IconProps>;
  export const DownloadIcon: FC<IconProps>;
  export const UploadIcon: FC<IconProps>;
  export const CopyIcon: FC<IconProps>;
  export const PlusSquareIcon: FC<IconProps>;
  export const MinusSquareIcon: FC<IconProps>;
  export const ArrowUpIcon: FC<IconProps>;
  export const ArrowDownIcon: FC<IconProps>;
  export const ArrowLeftIcon: FC<IconProps>;
  export const ArrowRightIcon: FC<IconProps>;
  export const ArrowUpDownIcon: FC<IconProps>;
  export const ArrowBackIcon: FC<IconProps>;
  export const ArrowForwardIcon: FC<IconProps>;
  export const TriangleDownIcon: FC<IconProps>;
  export const TriangleUpIcon: FC<IconProps>;
}
