/**
 * Type declarations for Chakra UI v3 direct import modules
 * This file provides TypeScript support for the direct module import pattern.
 */
/// <reference path="../../types/module-declarations.d.ts" />


declare module '@chakra-ui/react/layout' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface FlexProps extends BoxProps {
    align?: string;
    justify?: string;
    wrap?: string;
    direction?: string;
    gap?: string | number;
  }
  export const Flex: React.FC<FlexProps>;
  
  export interface StackProps extends FlexProps {
    spacing?: string | number;
    direction?: string;
  }
  export const Stack: React.FC<StackProps>;
  export const HStack: React.FC<StackProps>;
  export const VStack: React.FC<StackProps>;
  export const Spacer: React.FC<BoxProps>;
  
  export interface GridProps extends BoxProps {
    templateColumns?: string;
    templateRows?: string;
    templateAreas?: string;
    gap?: string | number;
    rowGap?: string | number;
    columnGap?: string | number;
    autoFlow?: string;
    autoRows?: string;
    autoColumns?: string;
    gridArea?: string;
    gridColumn?: string;
    gridRow?: string;
  }
  export const Grid: React.FC<GridProps>;
  
  // Re-export Box
  export { Box, BoxProps } from '@chakra-ui/react/box';
}

declare module '@chakra-ui/react/simple-grid' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface SimpleGridProps extends BoxProps {
    columns?: number | Record<string, number>;
    spacing?: string | number;
    spacingX?: string | number;
    spacingY?: string | number;
    minChildWidth?: string;
  }
  export const SimpleGrid: React.FC<SimpleGridProps>;
}

declare module '@chakra-ui/react/table' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';

  export interface TableProps extends BoxProps {
    variant?: string;
    size?: string;
    colorScheme?: string;
  }
  export const Table: React.FC<TableProps>;
  
  export interface TheadProps extends BoxProps {}
  export const Thead: React.FC<TheadProps>;
  
  export interface TbodyProps extends BoxProps {}
  export const Tbody: React.FC<TbodyProps>;
  
  export interface TfootProps extends BoxProps {}
  export const Tfoot: React.FC<TfootProps>;
  
  export interface TrProps extends BoxProps {}
  export const Tr: React.FC<TrProps>;
  
  export interface ThProps extends BoxProps {
    isNumeric?: boolean;
  }
  export const Th: React.FC<ThProps>;
  
  export interface TdProps extends BoxProps {
    isNumeric?: boolean;
  }
  export const Td: React.FC<TdProps>;
  
  export interface TableCaptionProps extends BoxProps {
    placement?: 'top' | 'bottom';
  }
  export const TableCaption: React.FC<TableCaptionProps>;
}

declare module '@chakra-ui/react/table-container' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';

  export interface TableContainerProps extends BoxProps {
    overflowX?: string;
    overflowY?: string;
  }
  export const TableContainer: React.FC<TableContainerProps>;
  
  // Re-export Table components
  export { 
    Table, TableProps,
    Thead, TheadProps,
    Tbody, TbodyProps,
    Tfoot, TfootProps,
    Tr, TrProps,
    Th, ThProps,
    Td, TdProps,
    TableCaption, TableCaptionProps
  } from '@chakra-ui/react/table';
}

declare module '@chakra-ui/react/input-group' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';

  export interface InputGroupProps extends BoxProps {}
  export const InputGroup: React.FC<InputGroupProps>;
  
  export interface InputLeftElementProps extends BoxProps {}
  export const InputLeftElement: React.FC<InputLeftElementProps>;
  
  export interface InputRightElementProps extends BoxProps {}
  export const InputRightElement: React.FC<InputRightElementProps>;
  
  export interface InputLeftAddonProps extends BoxProps {}
  export const InputLeftAddon: React.FC<InputLeftAddonProps>;
  
  export interface InputRightAddonProps extends BoxProps {}
  export const InputRightAddon: React.FC<InputRightAddonProps>;

  // Re-export Input components
  export { Input, InputProps } from '@chakra-ui/react/input';
}

declare module '@chakra-ui/react/alert-dialog' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';

  export interface AlertDialogProps {
    open?: boolean;
    onClose: () => void;
    leastDestructiveRef?: React.RefObject<any>;
    finalFocusRef?: React.RefObject<any>;
    size?: string;
    children: React.ReactNode;
    [key: string]: any;
  }

  export interface AlertDialogOverlayProps extends BoxProps {}
  export const AlertDialogOverlay: React.FC<AlertDialogOverlayProps>;
  
  export interface AlertDialogContentProps extends BoxProps {}
  export const AlertDialogContent: React.FC<AlertDialogContentProps>;
  
  export interface AlertDialogHeaderProps extends BoxProps {}
  export const AlertDialogHeader: React.FC<AlertDialogHeaderProps>;
  
  export interface AlertDialogBodyProps extends BoxProps {}
  export const AlertDialogBody: React.FC<AlertDialogBodyProps>;
  
  export interface AlertDialogFooterProps extends BoxProps {}
  export const AlertDialogFooter: React.FC<AlertDialogFooterProps>;
  
  export interface AlertDialogCloseButtonProps {
    [key: string]: any;
  }
  
  export const AlertDialog: React.FC<AlertDialogProps>;
  export const AlertDialogCloseButton: React.FC<AlertDialogCloseButtonProps>;
}

declare module '@chakra-ui/react/progress' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';

  export interface ProgressProps extends BoxProps {
    value?: number;
    max?: number;
    min?: number;
    isIndeterminate?: boolean;
    colorScheme?: string;
  }
  export const Progress: React.FC<ProgressProps>;
  
  export interface CircularProgressProps extends BoxProps {
    value?: number;
    max?: number;
    min?: number;
    isIndeterminate?: boolean;
    colorScheme?: string;
    size?: string | number;
    thickness?: string | number;
    capIsRound?: boolean;
  }
  export const CircularProgress: React.FC<CircularProgressProps>;
  
  export interface CircularProgressLabelProps extends BoxProps {}
  export const CircularProgressLabel: React.FC<CircularProgressLabelProps>;
}

declare module '@chakra-ui/react/menu' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';

  export interface MenuProps extends BoxProps {
    open?: boolean;
    onClose?: () => void;
    autoSelect?: boolean;
  }
  export const Menu: React.FC<MenuProps>;
  
  export interface MenuButtonProps extends BoxProps {}
  export const MenuButton: React.FC<MenuButtonProps>;
  
  export interface MenuListProps extends BoxProps {}
  export const MenuList: React.FC<MenuListProps>;
  
  export interface MenuItemProps extends BoxProps {
    icon?: React.ReactElement;
    command?: string;
    color?: string;
  }
  export const MenuItem: React.FC<MenuItemProps>;
  
  export interface MenuDividerProps extends BoxProps {}
  export const MenuDivider: React.FC<MenuDividerProps>;
  
  export interface MenuGroupProps extends BoxProps {
    title?: string;
  }
  export const MenuGroup: React.FC<MenuGroupProps>;
  
  export interface MenuOptionGroupProps extends BoxProps {
    title?: string;
    type?: 'radio' | 'checkbox';
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
  }
  export const MenuOptionGroup: React.FC<MenuOptionGroupProps>;
  
  export interface MenuItemOptionProps extends BoxProps {
    value?: string;
    checked?: boolean;
    type?: 'radio' | 'checkbox';
  }
  export const MenuItemOption: React.FC<MenuItemOptionProps>;
}

declare module '@chakra-ui/react/color-mode' {
  import * as React from 'react';
  
  export interface ColorModeContextType {
    colorMode: 'light' | 'dark';
    toggleColorMode: () => void;
    setColorMode: (mode: 'light' | 'dark') => void;
  }
  
  export const ColorModeContext: React.Context<ColorModeContextType>;
  export const useColorMode: () => ColorModeContextType;
  export const ColorModeProvider: React.FC<{ value: ColorModeContextType, children: React.ReactNode }>;
  export const useColorModeValue: <T>(lightValue: T, darkValue: T) => T;
}

declare module '@chakra-ui/react/divider' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface DividerProps extends BoxProps {
    orientation?: 'horizontal' | 'vertical';
  }
  export const Divider: React.FC<DividerProps>;
}

declare module '@chakra-ui/react/heading' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface HeadingProps extends BoxProps {
    as?: React.ElementType;
    size?: string;
  }
  export const Heading: React.FC<HeadingProps>;
}

declare module '@chakra-ui/react/text' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface TextProps extends BoxProps {
    as?: React.ElementType;
    fontSize?: string | number;
    fontWeight?: string | number;
  }
  export const Text: React.FC<TextProps>;
}

declare module '@chakra-ui/react/hooks' {
  export const useToast: () => {
    (options: any): string;
    close: (id: string) => void;
    closeAll: () => void;
    update: (id: string, options: any) => void;
    isActive: (id: string) => boolean;
  };
  
  export const useDisclosure: (options?: {
    defaultIsOpen?: boolean;
    onClose?: () => void;
    onOpen?: () => void;
  }) => {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onToggle: () => void;
  };
  
  export const useClipboard: (text: string) => {
    value: string;
    onCopy: () => void;
    hasCopied: boolean;
  };
  
  export const useBreakpointValue: <T>(values: T | Record<string, T>) => T;
  export const useMediaQuery: (query: string) => boolean[];
  export const useBoolean: (initialValue?: boolean) => [boolean, { toggle: () => void; on: () => void; off: () => void }];
  export const useBreakpoint: () => string;
  export const useConst: <T>(value: T | ((_: any) => T)) => T;
  export const useControllable: <T>(props: { value?: T; defaultValue?: T; onChange?: (value: T) => void }) => [T, (value: T) => void];
  export const useControllableState: <T>(props: { value?: T; defaultValue?: T; onChange?: (value: T) => void }) => [T, (value: T) => void];
  export const useMergeRefs: <T extends any[]>(...refs: T) => React.RefCallback<T extends (infer R)[] ? R : never>;
  export const useOutsideClick: (ref: React.RefObject<HTMLElement>, handler: () => void) => void;
  export const usePrefersReducedMotion: () => boolean;
  export const useToken: <T extends string | number>(scale: string, token: T | T[]) => T extends any[] ? string[] : string;
}

declare module '@chakra-ui/react/box' {
  import * as React from 'react';
  
  export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType;
    [key: string]: any;
  }
  export const Box: React.FC<BoxProps>;
}

declare module '@chakra-ui/react/theme' {
  export interface Theme {
    colors: Record<string, any>;
    fonts: Record<string, string>;
    fontSizes: Record<string, string>;
    fontWeights: Record<string, number>;
    lineHeights: Record<string, string | number>;
    letterSpacings: Record<string, string>;
    breakpoints: Record<string, string>;
    sizes: Record<string, string | number>;
    shadows: Record<string, string>;
    space: Record<string, string | number>;
    borders: Record<string, string>;
    radii: Record<string, string | number>;
    zIndices: Record<string, number>;
    components: Record<string, any>;
  }
  
  export interface Dict {
    [key: string]: any;
  }
  
  export interface ChakraProviderProps {
    children: React.ReactNode;
    theme?: Theme | Dict;
    resetCSS?: boolean;
  }
  
  export const ChakraProvider: React.FC<ChakraProviderProps>;
  export const useTheme: () => Theme;
  export const ThemeProvider: React.FC<{ theme: Theme; children: React.ReactNode }>;
}

declare module '@chakra-ui/react/toast' {
  import * as React from 'react';
  
  export interface UseToastOptions {
    title?: string;
    description?: string;
    status?: 'info' | 'warning' | 'success' | 'error';
    duration?: number;
    isClosable?: boolean;
    position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';
    onClose?: () => void;
    id?: string;
    render?: (props: any) => React.ReactNode;
  }
  
  export const useToast: () => ((options: UseToastOptions) => string) & {
    close: (id: string) => void;
    closeAll: () => void;
    update: (id: string, options: UseToastOptions) => void;
    isActive: (id: string) => boolean;
  };
  
  export const createToaster: () => {
    toast: (options: UseToastOptions) => string;
    closeAll: () => void;
    close: (id: string) => void;
    update: (id: string, options: UseToastOptions) => void;
    isActive: (id: string) => boolean;
  };
}

declare module '@chakra-ui/react/card' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface CardProps extends BoxProps {
    variant?: string;
    size?: string;
    colorScheme?: string;
  }
  export const Card: React.FC<CardProps>;
  
  export interface CardHeaderProps extends BoxProps {}
  export const CardHeader: React.FC<CardHeaderProps>;
  
  export interface CardBodyProps extends BoxProps {}
  export const CardBody: React.FC<CardBodyProps>;
  
  export interface CardFooterProps extends BoxProps {}
  export const CardFooter: React.FC<CardFooterProps>;
}

declare module '@chakra-ui/react/avatar' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface AvatarProps extends BoxProps {
    name?: string;
    src?: string;
    size?: string;
    showBorder?: boolean;
    borderColor?: string;
  }
  export const Avatar: React.FC<AvatarProps>;
  
  export interface AvatarBadgeProps extends BoxProps {}
  export const AvatarBadge: React.FC<AvatarBadgeProps>;
  
  export interface AvatarGroupProps extends BoxProps {
    size?: string;
    max?: number;
    spacing?: string | number;
  }
  export const AvatarGroup: React.FC<AvatarGroupProps>;
}

declare module '@chakra-ui/react/button' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface ButtonProps extends BoxProps {
    type?: 'button' | 'submit' | 'reset';
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: React.ReactElement;
    rightIcon?: React.ReactElement;
    variant?: string;
    size?: string;
    colorScheme?: string;
    loadingText?: string;
    iconSpacing?: string | number;
    spinnerPlacement?: 'start' | 'end';
  }
  export const Button: React.FC<ButtonProps>;
  
  export interface ButtonGroupProps extends BoxProps {
    variant?: string;
    size?: string;
    colorScheme?: string;
    spacing?: string | number;
    attached?: boolean;
  }
  export const ButtonGroup: React.FC<ButtonGroupProps>;
  
  export interface IconButtonProps extends ButtonProps {
    icon: React.ReactElement;
    'aria-label': string;
  }
  export const IconButton: React.FC<IconButtonProps>;
}

declare module '@chakra-ui/react/input' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface InputProps extends BoxProps {
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    readOnly?: boolean;
    focusBorderColor?: string;
    errorBorderColor?: string;
    variant?: string;
    size?: string;
    type?: string;
    htmlSize?: number;
    value?: string;
    defaultValue?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
  }
  export const Input: React.FC<InputProps>;
  
  export interface InputElementProps extends BoxProps {
    placement?: 'left' | 'right';
    children?: React.ReactNode;
  }
  export const InputElement: React.FC<InputElementProps>;
}

declare module '@chakra-ui/react/form-control' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface FormControlProps extends BoxProps {
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
  }
  export const FormControl: React.FC<FormControlProps>;
  
  export interface FormLabelProps extends BoxProps {
    htmlFor?: string;
  }
  export const FormLabel: React.FC<FormLabelProps>;
  
  export interface FormHelperTextProps extends BoxProps {}
  export const FormHelperText: React.FC<FormHelperTextProps>;
  
  export interface FormErrorMessageProps extends BoxProps {}
  export const FormErrorMessage: React.FC<FormErrorMessageProps>;
}

declare module '@chakra-ui/react/select' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface SelectProps extends BoxProps {
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    readOnly?: boolean;
    variant?: string;
    size?: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    onFocus?: React.FocusEventHandler<HTMLSelectElement>;
    onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  }
  export const Select: React.FC<SelectProps>;
}

declare module '@chakra-ui/react/textarea' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface TextareaProps extends BoxProps {
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    readOnly?: boolean;
    focusBorderColor?: string;
    errorBorderColor?: string;
    variant?: string;
    size?: string;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
    value?: string;
    defaultValue?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  }
  export const Textarea: React.FC<TextareaProps>;
}

declare module '@chakra-ui/react/checkbox' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface CheckboxProps extends BoxProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    readOnly?: boolean;
    colorScheme?: string;
    size?: string;
    spacing?: string | number;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  }
  export const Checkbox: React.FC<CheckboxProps>;
  
  export interface CheckboxGroupProps extends BoxProps {
    value?: string[];
    defaultValue?: string[];
    onChange?: (values: string[]) => void;
    colorScheme?: string;
    size?: string;
    children?: React.ReactNode;
  }
  export const CheckboxGroup: React.FC<CheckboxGroupProps>;
}

declare module '@chakra-ui/react/radio' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface RadioProps extends BoxProps {
    value?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    readOnly?: boolean;
    colorScheme?: string;
    size?: string;
    spacing?: string | number;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  }
  export const Radio: React.FC<RadioProps>;
  
  export interface RadioGroupProps extends BoxProps {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    colorScheme?: string;
    size?: string;
    children?: React.ReactNode;
  }
  export const RadioGroup: React.FC<RadioGroupProps>;
}

declare module '@chakra-ui/react/modal' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface ModalProps {
    open?: boolean;
    onClose: () => void;
    finalFocusRef?: React.RefObject<any>;
    initialFocusRef?: React.RefObject<any>;
    blockScrollOnMount?: boolean;
    closeOnEsc?: boolean;
    closeOnOverlayClick?: boolean;
    isCentered?: boolean;
    motionPreset?: 'slideInBottom' | 'slideInRight' | 'scale' | 'none';
    scrollBehavior?: 'inside' | 'outside';
    size?: string;
    children: React.ReactNode;
  }
  export const Modal: React.FC<ModalProps>;
  
  export interface ModalOverlayProps extends BoxProps {}
  export const ModalOverlay: React.FC<ModalOverlayProps>;
  
  export interface ModalContentProps extends BoxProps {}
  export const ModalContent: React.FC<ModalContentProps>;
  
  export interface ModalHeaderProps extends BoxProps {}
  export const ModalHeader: React.FC<ModalHeaderProps>;
  
  export interface ModalBodyProps extends BoxProps {
    scrollBehavior?: 'inside' | 'outside';
  }
  export const ModalBody: React.FC<ModalBodyProps>;
  
  export interface ModalFooterProps extends BoxProps {}
  export const ModalFooter: React.FC<ModalFooterProps>;
  
  export interface ModalCloseButtonProps extends BoxProps {}
  export const ModalCloseButton: React.FC<ModalCloseButtonProps>;
}

declare module '@chakra-ui/react/tabs' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface TabsProps extends BoxProps {
    variant?: string;
    colorScheme?: string;
    size?: string;
    orientation?: 'horizontal' | 'vertical';
    index?: number;
    defaultIndex?: number;
    onChange?: (index: number) => void;
  }
  export const Tabs: React.FC<TabsProps>;
  
  export interface TabListProps extends BoxProps {}
  export const TabList: React.FC<TabListProps>;
  
  export interface TabProps extends BoxProps {
    disabled?: boolean;
  }
  export const Tab: React.FC<TabProps>;
  
  export interface TabPanelsProps extends BoxProps {}
  export const TabPanels: React.FC<TabPanelsProps>;
  
  export interface TabPanelProps extends BoxProps {}
  export const TabPanel: React.FC<TabPanelProps>;
}

declare module '@chakra-ui/react/skeleton' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface SkeletonProps extends BoxProps {
    loading?: boolean;
    fadeDuration?: number;
    speed?: number;
    startColor?: string;
    endColor?: string;
  }
  export const Skeleton: React.FC<SkeletonProps>;
  
  export interface SkeletonTextProps extends BoxProps {
    loading?: boolean;
    fadeDuration?: number;
    speed?: number;
    startColor?: string;
    endColor?: string;
    noOfLines?: number;
    spacing?: string | number;
  }
  export const SkeletonText: React.FC<SkeletonTextProps>;
  
  export interface SkeletonCircleProps extends BoxProps {
    loading?: boolean;
    fadeDuration?: number;
    speed?: number;
    startColor?: string;
    endColor?: string;
    size?: string | number;
  }
  export const SkeletonCircle: React.FC<SkeletonCircleProps>;
}

declare module '@chakra-ui/react/stack' {
  export { HStack, VStack, Stack, StackProps } from '@chakra-ui/react/layout';
}

declare module '@chakra-ui/react/tag' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface TagProps extends BoxProps {
    size?: string;
    variant?: string;
    colorScheme?: string;
  }
  export const Tag: React.FC<TagProps>;
  
  export interface TagLabelProps extends BoxProps {}
  export const TagLabel: React.FC<TagLabelProps>;
  
  export interface TagLeftIconProps extends BoxProps {}
  export const TagLeftIcon: React.FC<TagLeftIconProps>;
  
  export interface TagRightIconProps extends BoxProps {}
  export const TagRightIcon: React.FC<TagRightIconProps>;
  
  export interface TagCloseButtonProps extends BoxProps {}
  export const TagCloseButton: React.FC<TagCloseButtonProps>;
}

declare module '@chakra-ui/react/portal' {
  import * as React from 'react';
  
  export interface PortalProps {
    children: React.ReactNode;
  }
  export const Portal: React.FC<PortalProps>;
}

declare module '@chakra-ui/react/tooltip' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface TooltipProps extends BoxProps {
    label?: React.ReactNode;
    'aria-label'?: string;
    placement?: string;
    hasArrow?: boolean;
    showDelay?: number;
    hideDelay?: number;
    open?: boolean;
    defaultOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    closeOnClick?: boolean;
    closeOnEsc?: boolean;
    closeOnMouseDown?: boolean;
    children: React.ReactNode;
  }
  export const Tooltip: React.FC<TooltipProps>;
}

declare module '@chakra-ui/react/stat' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface StatProps extends BoxProps {}
  export const Stat: React.FC<StatProps>;
  
  export interface StatLabelProps extends BoxProps {}
  export const StatLabel: React.FC<StatLabelProps>;
  
  export interface StatNumberProps extends BoxProps {}
  export const StatNumber: React.FC<StatNumberProps>;
  
  export interface StatHelpTextProps extends BoxProps {}
  export const StatHelpText: React.FC<StatHelpTextProps>;
  
  export interface StatArrowProps extends BoxProps {
    type: 'increase' | 'decrease';
  }
  export const StatArrow: React.FC<StatArrowProps>;
  
  export interface StatGroupProps extends BoxProps {}
  export const StatGroup: React.FC<StatGroupProps>;
}

declare module '@chakra-ui/react/popover' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface PopoverProps extends BoxProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    closeOnBlur?: boolean;
    closeOnEsc?: boolean;
    trigger?: 'click' | 'hover';
    placement?: string;
    arrowSize?: number;
    arrowShadowColor?: string;
    gutter?: number;
    autoFocus?: boolean;
    returnFocusOnClose?: boolean;
  }
  export const Popover: React.FC<PopoverProps>;
  
  export interface PopoverTriggerProps {
    children: React.ReactElement;
  }
  export const PopoverTrigger: React.FC<PopoverTriggerProps>;
  
  export interface PopoverContentProps extends BoxProps {
    arrowSize?: number;
    arrowShadowColor?: string;
  }
  export const PopoverContent: React.FC<PopoverContentProps>;
  
  export interface PopoverHeaderProps extends BoxProps {}
  export const PopoverHeader: React.FC<PopoverHeaderProps>;
  
  export interface PopoverBodyProps extends BoxProps {}
  export const PopoverBody: React.FC<PopoverBodyProps>;
  
  export interface PopoverFooterProps extends BoxProps {}
  export const PopoverFooter: React.FC<PopoverFooterProps>;
  
  export interface PopoverArrowProps extends BoxProps {}
  export const PopoverArrow: React.FC<PopoverArrowProps>;
  
  export interface PopoverCloseButtonProps extends BoxProps {}
  export const PopoverCloseButton: React.FC<PopoverCloseButtonProps>;
}

declare module '@chakra-ui/react/flex' {
  export { Flex, FlexProps } from '@chakra-ui/react/layout';
}

declare module '@chakra-ui/react/accordion' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface AccordionProps extends BoxProps {
    allowMultiple?: boolean;
    allowToggle?: boolean;
    index?: number | number[];
    defaultIndex?: number | number[];
    onChange?: (expandedIndex: number | number[]) => void;
  }
  export const Accordion: React.FC<AccordionProps>;
  
  export interface AccordionItemProps extends BoxProps {
    disabled?: boolean;
    isFocusable?: boolean;
  }
  export const AccordionItem: React.FC<AccordionItemProps>;
  
  export interface AccordionButtonProps extends BoxProps {}
  export const AccordionButton: React.FC<AccordionButtonProps>;
  
  export interface AccordionPanelProps extends BoxProps {}
  export const AccordionPanel: React.FC<AccordionPanelProps>;
  
  export interface AccordionIconProps extends BoxProps {}
  export const AccordionIcon: React.FC<AccordionIconProps>;
}

declare module '@chakra-ui/react/center' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface CenterProps extends BoxProps {}
  export const Center: React.FC<CenterProps>;
  
  export interface SquareProps extends BoxProps {
    size?: string | number;
  }
  export const Square: React.FC<SquareProps>;
  
  export interface CircleProps extends BoxProps {
    size?: string | number;
  }
  export const Circle: React.FC<CircleProps>;
}

declare module '@chakra-ui/react/spinner' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface SpinnerProps extends BoxProps {
    size?: string;
    color?: string;
    thickness?: string;
    speed?: string;
    emptyColor?: string;
  }
  export const Spinner: React.FC<SpinnerProps>;
}

declare module '@chakra-ui/react/close-button' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface CloseButtonProps extends BoxProps {
    size?: string;
    disabled?: boolean;
  }
  export const CloseButton: React.FC<CloseButtonProps>;
}

declare module '@chakra-ui/react/badge' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface BadgeProps extends BoxProps {
    variant?: string;
    colorScheme?: string;
  }
  export const Badge: React.FC<BadgeProps>;
}

declare module '@chakra-ui/react/image' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface ImageProps extends BoxProps {
    src?: string;
    fallbackSrc?: string;
    alt?: string;
    loading?: 'eager' | 'lazy';
    onLoad?: React.ReactEventHandler<HTMLImageElement>;
    onError?: React.ReactEventHandler<HTMLImageElement>;
  }
  export const Image: React.FC<ImageProps>;
}

declare module '@chakra-ui/react/icon' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface IconProps extends BoxProps {
    viewBox?: string;
    boxSize?: string | number;
    color?: string;
    focusable?: boolean;
  }
  export const Icon: React.FC<IconProps>;
  
  export interface CreateIconOptions {
    viewBox?: string;
    d?: string;
    path?: React.ReactElement;
    displayName?: string;
    defaultProps?: Record<string, any>;
  }
  export function createIcon(options: CreateIconOptions): React.FC<IconProps>;
}

declare module '@chakra-ui/react/drawer' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface DrawerProps {
    open?: boolean;
    onClose: () => void;
    finalFocusRef?: React.RefObject<any>;
    placement?: 'top' | 'right' | 'bottom' | 'left';
    size?: string;
    children: React.ReactNode;
  }
  export const Drawer: React.FC<DrawerProps>;
  
  export interface DrawerOverlayProps extends BoxProps {}
  export const DrawerOverlay: React.FC<DrawerOverlayProps>;
  
  export interface DrawerContentProps extends BoxProps {}
  export const DrawerContent: React.FC<DrawerContentProps>;
  
  export interface DrawerHeaderProps extends BoxProps {}
  export const DrawerHeader: React.FC<DrawerHeaderProps>;
  
  export interface DrawerBodyProps extends BoxProps {}
  export const DrawerBody: React.FC<DrawerBodyProps>;
  
  export interface DrawerFooterProps extends BoxProps {}
  export const DrawerFooter: React.FC<DrawerFooterProps>;
  
  export interface DrawerCloseButtonProps extends BoxProps {}
  export const DrawerCloseButton: React.FC<DrawerCloseButtonProps>;
}

declare module '@chakra-ui/react/alert' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface AlertProps extends BoxProps {
    status?: 'info' | 'warning' | 'success' | 'error';
    variant?: string;
  }
  export const Alert: React.FC<AlertProps>;
  
  export interface AlertIconProps extends BoxProps {}
  export const AlertIcon: React.FC<AlertIconProps>;
  
  export interface AlertTitleProps extends BoxProps {}
  export const AlertTitle: React.FC<AlertTitleProps>;
  
  export interface AlertDescriptionProps extends BoxProps {}
  export const AlertDescription: React.FC<AlertDescriptionProps>;
}

declare module '@chakra-ui/react/switch' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface SwitchProps extends BoxProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    readOnly?: boolean;
    colorScheme?: string;
    size?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  }
  export const Switch: React.FC<SwitchProps>;
}

declare module '@chakra-ui/react/breadcrumb' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface BreadcrumbProps extends BoxProps {
    separator?: React.ReactNode;
    spacing?: string | number;
  }
  export const Breadcrumb: React.FC<BreadcrumbProps>;
  
  export interface BreadcrumbItemProps extends BoxProps {
    isCurrentPage?: boolean;
    isLastChild?: boolean;
  }
  export const BreadcrumbItem: React.FC<BreadcrumbItemProps>;
  
  export interface BreadcrumbLinkProps extends BoxProps {
    isCurrentPage?: boolean;
    href?: string;
  }
  export const BreadcrumbLink: React.FC<BreadcrumbLinkProps>;
  
  export interface BreadcrumbSeparatorProps extends BoxProps {}
  export const BreadcrumbSeparator: React.FC<BreadcrumbSeparatorProps>;
}

declare module '@chakra-ui/react/link' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface LinkProps extends BoxProps {
    external?: boolean;
    href?: string;
  }
  export const Link: React.FC<LinkProps>;
  
  export interface LinkBoxProps extends BoxProps {}
  export const LinkBox: React.FC<LinkBoxProps>;
  
  export interface LinkOverlayProps extends LinkProps {}
  export const LinkOverlay: React.FC<LinkOverlayProps>;
}

declare module '@chakra-ui/react/list' {
  import { BoxProps  } from '@/utils/chakra-compat';
  import * as React from 'react';
  
  export interface ListProps extends BoxProps {
    spacing?: string | number;
    styleType?: string;
    stylePosition?: string;
  }
  export const List: React.FC<ListProps>;
  
  export interface ListItemProps extends BoxProps {}
  export const ListItem: React.FC<ListItemProps>;
  
  export interface ListIconProps extends BoxProps {}
  export const ListIcon: React.FC<ListIconProps>;
  
  export interface OrderedListProps extends ListProps {}
  export const OrderedList: React.FC<OrderedListProps>;
  
  export interface UnorderedListProps extends ListProps {}
  export const UnorderedList: React.FC<UnorderedListProps>;
}
declare module '@chakra-ui/react/container' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface ContainerProps extends React.HTMLAttributes<HTMLElement>, StyleProps {
    
    [key: string]: any;
  }
  
  export const Container: React.FC<ContainerProps>;
}
declare module '@chakra-ui/react/grid' {
  import { ResponsiveValue, StyleProps, GridTemplateColumns } from '../types/chakra-ui-enhanced';
  
  export interface GridProps extends React.HTMLAttributes<HTMLElement>, StyleProps {
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
  
  export interface GridItemProps extends React.HTMLAttributes<HTMLElement>, StyleProps {
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
}
declare module '@chakra-ui/react/grid' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface GridItemProps extends React.HTMLAttributes<HTMLElement>, StyleProps {
    colSpan?: ResponsiveValue<number>;
    rowSpan?: ResponsiveValue<number>;
    colStart?: ResponsiveValue<number>;
    colEnd?: ResponsiveValue<number>;
    rowStart?: ResponsiveValue<number>;
    rowEnd?: ResponsiveValue<number>;
    [key: string]: any;
  }
  
  export const GridItem: React.FC<GridItemProps>;
}
declare module '@chakra-ui/react/wrap' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface WrapProps extends React.HTMLAttributes<HTMLElement>, StyleProps {
    
    [key: string]: any;
  }
  
  export const Wrap: React.FC<WrapProps>;
}
declare module '@chakra-ui/react/wrap' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface WrapItemProps extends React.HTMLAttributes<HTMLElement>, StyleProps {
    
    [key: string]: any;
  }
  
  export const WrapItem: React.FC<WrapItemProps>;
}
declare module '@chakra-ui/react/button-group' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface ButtonGroupProps extends React.HTMLAttributes<HTMLElement>, StyleProps {
    
    [key: string]: any;
  }
  
  export const ButtonGroup: React.FC<ButtonGroupProps>;
}
declare module '@chakra-ui/react/circular-progress' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface CircularProgressProps extends React.HTMLAttributes<HTMLElement>, StyleProps {
    
    [key: string]: any;
  }
  
  export const CircularProgress: React.FC<CircularProgressProps>;
}
declare module '@chakra-ui/react/circular-progress' {
  import { ResponsiveValue, StyleProps } from '../types/chakra-ui-enhanced';
  
  export interface CircularProgressLabelProps extends React.HTMLAttributes<HTMLElement>, StyleProps {
    
    [key: string]: any;
  }
  
  export const CircularProgressLabel: React.FC<CircularProgressLabelProps>;
}