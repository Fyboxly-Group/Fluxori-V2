// Type declarations for Chakra UI v3 components and modules

declare module '@chakra-ui/react' {
  export interface ChakraTheme {
    config?: {
      initialColorMode?: 'light' | 'dark'
      useSystemColorMode?: boolean
      disableTransitionOnChange?: boolean
    }
    colors?: Record<string, any>
    fonts?: Record<string, string>
    fontSizes?: Record<string, string>
    space?: Record<string, string | number>
    radii?: Record<string, string>
    components?: Record<string, any>
    styles?: Record<string, any>
    shadows?: Record<string, string>
    [key: string]: any
  }

  export interface ChakraProviderProps {
    theme?: ChakraTheme
    children: React.ReactNode
  }

  export const ChakraProvider: React.FC<ChakraProviderProps>
}

declare module '@chakra-ui/react/box' {
  export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType
    [key: string]: any
  }
  export const Box: React.FC<BoxProps>
}

declare module '@chakra-ui/react/flex' {
  export interface FlexProps extends BoxProps {
    direction?: string | Record<string, string>
    align?: string
    justify?: string
    gap?: string | number | Record<string, string | number>
    wrap?: string
    basis?: string | number
    grow?: string | number
    shrink?: string | number
    [key: string]: any
  }
  export const Flex: React.FC<FlexProps>
}

declare module '@chakra-ui/react/stack' {
  export interface StackProps extends FlexProps {
    gap?: string | number | Record<string, string | number>
    [key: string]: any
  }
  export const Stack: React.FC<StackProps>
  export const HStack: React.FC<StackProps>
  export const VStack: React.FC<StackProps>
  export { Flex } from '@chakra-ui/react/flex'
}

declare module '@chakra-ui/react/button' {
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: string
    colorScheme?: string
    size?: string
    loading?: boolean
    disabled?: boolean
    leftIcon?: React.ReactElement
    rightIcon?: React.ReactElement
    loadingText?: string
    [key: string]: any
  }
  export const Button: React.FC<ButtonProps>

  export interface IconButtonProps extends ButtonProps {
    icon?: React.ReactElement
    'aria-label': string
    [key: string]: any
  }
  export const IconButton: React.FC<IconButtonProps>
}

declare module '@chakra-ui/react/heading' {
  export interface HeadingProps {
    as?: React.ElementType
    size?: string
    [key: string]: any
  }
  export const Heading: React.FC<HeadingProps>
}

declare module '@chakra-ui/react/text' {
  export interface TextProps {
    as?: React.ElementType
    fontSize?: string | Record<string, string>
    fontWeight?: string
    lineHeight?: string
    letterSpacing?: string
    textAlign?: string
    [key: string]: any
  }
  export const Text: React.FC<TextProps>
}

declare module '@chakra-ui/react/image' {
  export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: React.ReactNode
    fallbackSrc?: string
    loading?: 'eager' | 'lazy'
    [key: string]: any
  }
  export const Image: React.FC<ImageProps>
}

declare module '@chakra-ui/react/input' {
  export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    variant?: string
    size?: string
    [key: string]: any
  }
  export const Input: React.FC<InputProps>
}

declare module '@chakra-ui/react/form-control' {
  export interface FormControlProps {
    isInvalid?: boolean
    isDisabled?: boolean
    isRequired?: boolean
    [key: string]: any
  }
  export const FormControl: React.FC<FormControlProps>
  
  export interface FormLabelProps {
    htmlFor?: string
    [key: string]: any
  }
  export const FormLabel: React.FC<FormLabelProps>
  
  export interface FormErrorMessageProps {
    children?: React.ReactNode
    [key: string]: any
  }
  export const FormErrorMessage: React.FC<FormErrorMessageProps>
}

declare module '@chakra-ui/react/checkbox' {
  export interface CheckboxProps {
    isChecked?: boolean
    isDisabled?: boolean
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    [key: string]: any
  }
  export const Checkbox: React.FC<CheckboxProps>
}

declare module '@chakra-ui/react/card' {
  export interface CardProps {
    variant?: string
    size?: string
    [key: string]: any
  }
  export const Card: React.FC<CardProps>
  
  export interface CardHeaderProps {
    [key: string]: any
  }
  export const CardHeader: React.FC<CardHeaderProps>
  
  export interface CardBodyProps {
    [key: string]: any
  }
  export const CardBody: React.FC<CardBodyProps>
  
  export interface CardFooterProps {
    [key: string]: any
  }
  export const CardFooter: React.FC<CardFooterProps>
}

declare module '@chakra-ui/react/color-mode' {
  export interface UseColorModeReturn {
    colorMode: 'light' | 'dark'
    toggleColorMode: () => void
    setColorMode: (mode: 'light' | 'dark') => void
  }
  export function useColorMode(): UseColorModeReturn
}

declare module '@chakra-ui/react/toast' {
  export interface ToastOptions {
    title?: string
    description?: string
    status?: 'info' | 'warning' | 'success' | 'error'
    duration?: number
    isClosable?: boolean
    position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left'
    onClose?: () => void
    id?: string
    [key: string]: any
  }
  
  export interface ToasterInstance {
    show: (options: ToastOptions) => void
    close: (id: string) => void
    closeAll: () => void
    update: (id: string, options: ToastOptions) => void
  }
  
  export function createToaster(): ToasterInstance
}

declare module '@chakra-ui/react/hooks' {
  export interface UseDisclosureReturn {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
    onToggle: () => void
  }
  export function useDisclosure(options?: { defaultIsOpen?: boolean }): UseDisclosureReturn
}

declare module '@chakra-ui/react/drawer' {
  export interface DrawerProps {
    isOpen: boolean
    onClose: () => void
    placement?: 'top' | 'right' | 'bottom' | 'left'
    [key: string]: any
  }
  export const Drawer: React.FC<DrawerProps>
  
  export interface DrawerOverlayProps {
    [key: string]: any
  }
  export const DrawerOverlay: React.FC<DrawerOverlayProps>
  
  export interface DrawerContentProps {
    [key: string]: any
  }
  export const DrawerContent: React.FC<DrawerContentProps>
  
  export interface DrawerHeaderProps {
    [key: string]: any
  }
  export const DrawerHeader: React.FC<DrawerHeaderProps>
  
  export interface DrawerBodyProps {
    [key: string]: any
  }
  export const DrawerBody: React.FC<DrawerBodyProps>
  
  export interface DrawerFooterProps {
    [key: string]: any
  }
  export const DrawerFooter: React.FC<DrawerFooterProps>
  
  export interface DrawerCloseButtonProps {
    [key: string]: any
  }
  export const DrawerCloseButton: React.FC<DrawerCloseButtonProps>
}

declare module '@chakra-ui/react/divider' {
  export interface DividerProps {
    orientation?: 'horizontal' | 'vertical'
    variant?: string
    [key: string]: any
  }
  export const Divider: React.FC<DividerProps>
}

declare module '@chakra-ui/react/styled-system' {
  export function createMultiStyleConfigHelpers(parts: string[]): {
    defineMultiStyleConfig: (config: any) => any
    definePartsStyle: (config: any) => any
  }
}

declare module '@chakra-ui/react/grid' {
  export interface GridProps {
    templateColumns?: string | Record<string, string>
    templateRows?: string | Record<string, string>
    gap?: number | string | Record<string, number | string>
    [key: string]: any
  }
  export const Grid: React.FC<GridProps>
  
  export interface GridItemProps {
    colSpan?: number | Record<string, number>
    rowSpan?: number | Record<string, number>
    area?: string
    [key: string]: any
  }
  export const GridItem: React.FC<GridItemProps>
}

declare module '@chakra-ui/react/stat' {
  export interface StatProps {
    [key: string]: any
  }
  export const Stat: React.FC<StatProps>
  
  export interface StatLabelProps {
    [key: string]: any
  }
  export const StatLabel: React.FC<StatLabelProps>
  
  export interface StatNumberProps {
    [key: string]: any
  }
  export const StatNumber: React.FC<StatNumberProps>
  
  export interface StatHelpTextProps {
    [key: string]: any
  }
  export const StatHelpText: React.FC<StatHelpTextProps>
  
  export interface StatArrowProps {
    type: 'increase' | 'decrease'
    [key: string]: any
  }
  export const StatArrow: React.FC<StatArrowProps>
}

// Added for Notifications Feature
declare module '@chakra-ui/react/badge' {
  export interface BadgeProps {
    colorScheme?: string
    variant?: string
    size?: string
    [key: string]: any
  }
  export const Badge: React.FC<BadgeProps>
}

declare module '@chakra-ui/react/alert' {
  export interface AlertProps {
    status?: 'info' | 'warning' | 'success' | 'error'
    variant?: string
    [key: string]: any
  }
  export const Alert: React.FC<AlertProps>
  
  export interface AlertIconProps {
    [key: string]: any
  }
  export const AlertIcon: React.FC<AlertIconProps>
  
  export interface AlertTitleProps {
    [key: string]: any
  }
  export const AlertTitle: React.FC<AlertTitleProps>
  
  export interface AlertDescriptionProps {
    [key: string]: any
  }
  export const AlertDescription: React.FC<AlertDescriptionProps>
}

declare module '@chakra-ui/react/popover' {
  export interface PopoverProps {
    isOpen?: boolean
    onClose?: () => void
    placement?: string
    closeOnBlur?: boolean
    [key: string]: any
  }
  export const Popover: React.FC<PopoverProps>
  
  export interface PopoverTriggerProps {
    children: React.ReactNode
  }
  export const PopoverTrigger: React.FC<PopoverTriggerProps>
  
  export interface PopoverContentProps {
    [key: string]: any
  }
  export const PopoverContent: React.FC<PopoverContentProps>
  
  export interface PopoverHeaderProps {
    [key: string]: any
  }
  export const PopoverHeader: React.FC<PopoverHeaderProps>
  
  export interface PopoverBodyProps {
    [key: string]: any
  }
  export const PopoverBody: React.FC<PopoverBodyProps>
  
  export interface PopoverFooterProps {
    [key: string]: any
  }
  export const PopoverFooter: React.FC<PopoverFooterProps>
  
  export interface PopoverArrowProps {
    [key: string]: any
  }
  export const PopoverArrow: React.FC<PopoverArrowProps>
  
  export interface PopoverCloseButtonProps {
    [key: string]: any
  }
  export const PopoverCloseButton: React.FC<PopoverCloseButtonProps>
}

declare module '@chakra-ui/react/spinner' {
  export interface SpinnerProps {
    size?: string
    speed?: string
    color?: string
    emptyColor?: string
    thickness?: string
    [key: string]: any
  }
  export const Spinner: React.FC<SpinnerProps>
}

declare module '@chakra-ui/react/center' {
  export interface CenterProps extends BoxProps {
    [key: string]: any
  }
  export const Center: React.FC<CenterProps>
}

declare module '@chakra-ui/react/layout' {
  export { Box } from '@chakra-ui/react/box'
  export { Flex } from '@chakra-ui/react/flex'
  export { Stack, HStack, VStack } from '@chakra-ui/react/stack'
  export { Container } from '@chakra-ui/react/container'
  export { Center } from '@chakra-ui/react/center'
  export { Divider } from '@chakra-ui/react/divider'
  export { Link } from '@chakra-ui/react/link'
  export { Text } from '@chakra-ui/react/text'
}

declare module '@chakra-ui/react/link' {
  export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
    as?: React.ElementType
    [key: string]: any
  }
  export const Link: React.FC<LinkProps>
}

declare module '@chakra-ui/react/container' {
  export interface ContainerProps extends BoxProps {
    centerContent?: boolean
    maxW?: string | Record<string, string>
    [key: string]: any
  }
  export const Container: React.FC<ContainerProps>
}

declare module '@chakra-ui/react/tooltip' {
  export interface TooltipProps {
    label: string
    placement?: string
    hasArrow?: boolean
    [key: string]: any
  }
  export const Tooltip: React.FC<TooltipProps>
}

declare module '@chakra-ui/react/avatar' {
  export interface AvatarProps {
    name?: string
    src?: string
    size?: string
    [key: string]: any
  }
  export const Avatar: React.FC<AvatarProps>
  
  export interface AvatarBadgeProps {
    [key: string]: any
  }
  export const AvatarBadge: React.FC<AvatarBadgeProps>
  
  export interface AvatarGroupProps {
    [key: string]: any
  }
  export const AvatarGroup: React.FC<AvatarGroupProps>
}

declare module '@chakra-ui/react/textarea' {
  export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
    variant?: string
    size?: string
    [key: string]: any
  }
  export const Textarea: React.FC<TextareaProps>
}

declare module '@chakra-ui/react/select' {
  export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    variant?: string
    size?: string
    [key: string]: any
  }
  export const Select: React.FC<SelectProps>
}

declare module '@chakra-ui/react/close-button' {
  export interface CloseButtonProps {
    size?: string
    [key: string]: any
  }
  export const CloseButton: React.FC<CloseButtonProps>
}

declare module '@chakra-ui/react/button-group' {
  export interface ButtonGroupProps {
    size?: string
    variant?: string
    spacing?: string | number
    isAttached?: boolean
    [key: string]: any
  }
  export const ButtonGroup: React.FC<ButtonGroupProps>
}

declare module '@chakra-ui/react/icon' {
  export interface IconProps {
    as?: React.ElementType
    viewBox?: string
    boxSize?: string | number
    color?: string
    [key: string]: any
  }
  export const Icon: React.FC<IconProps>
}

declare module '@chakra-ui/react/tabs' {
  export interface TabsProps {
    index?: number
    defaultIndex?: number
    variant?: string
    colorScheme?: string
    orientation?: 'horizontal' | 'vertical'
    isFitted?: boolean
    onChange?: (index: number) => void
    [key: string]: any
  }
  export const Tabs: React.FC<TabsProps>
  
  export interface TabListProps {
    [key: string]: any
  }
  export const TabList: React.FC<TabListProps>
  
  export interface TabProps {
    isDisabled?: boolean
    [key: string]: any
  }
  export const Tab: React.FC<TabProps>
  
  export interface TabPanelsProps {
    [key: string]: any
  }
  export const TabPanels: React.FC<TabPanelsProps>
  
  export interface TabPanelProps {
    [key: string]: any
  }
  export const TabPanel: React.FC<TabPanelProps>
}

declare module '@chakra-ui/icons' {
  export interface IconProps {
    boxSize?: string | number
    color?: string
    [key: string]: any
  }
  
  export const CheckIcon: React.FC<IconProps>
  export const CloseIcon: React.FC<IconProps>
  export const InfoIcon: React.FC<IconProps>
  export const WarningIcon: React.FC<IconProps>
  export const CheckCircleIcon: React.FC<IconProps>
  export const WarningTwoIcon: React.FC<IconProps>
  export const BellIcon: React.FC<IconProps>
  export const RepeatIcon: React.FC<IconProps>
}
declare module '@chakra-ui/react/breadcrumb' {
  export interface BreadcrumbProps {
    [key: string]: any
  }
  export const Breadcrumb: React.FC<BreadcrumbProps>
}
declare module '@chakra-ui/react/breadcrumb' {
  export interface BreadcrumbItemProps {
    isCurrentPage?: boolean
    [key: string]: any
  }
  export const BreadcrumbItem: React.FC<BreadcrumbItemProps>
}
declare module '@chakra-ui/react/breadcrumb' {
  export interface BreadcrumbLinkProps {
    [key: string]: any
  }
  export const BreadcrumbLink: React.FC<BreadcrumbLinkProps>
}
declare module '@chakra-ui/react/list' {
  export interface ListProps {
    [key: string]: any
  }
  export const List: React.FC<ListProps>
}
declare module '@chakra-ui/react/list' {
  export interface ListItemProps {
    [key: string]: any
  }
  export const ListItem: React.FC<ListItemProps>
}
declare module '@chakra-ui/react/switch' {
  export interface SwitchProps {
    [key: string]: any
  }
  export const Switch: React.FC<SwitchProps>
}