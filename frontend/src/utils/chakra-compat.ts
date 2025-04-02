/**
 * Chakra UI Compatibility Layer
 * 
 * This file provides a compatibility layer for Chakra UI v3,
 * re-exporting components with proper direct imports.
 * 
 * It serves as a bridge to ensure code written for v2 can continue to work
 * with minimal changes when moving to v3.
 */
/// <reference path="../../types/module-declarations.d.ts" />


// Core Provider
import { ChakraProvider  } from '@/utils/chakra-compat';
export { ChakraProvider };

// Layout components
import { Box  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Center  } from '@/utils/chakra-compat';
import { Container  } from '@/utils/chakra-compat';
import { Grid, GridItem  } from '@/utils/chakra-compat';
import { HStack, VStack, Stack  } from '@/utils/chakra-compat';
import { Divider  } from '@/utils/chakra-compat';
import { Spacer  } from '@/utils/chakra-compat';
import { SimpleGrid  } from '@/utils/chakra-compat';
import { Wrap, WrapItem  } from '@/utils/chakra-compat';
import { AspectRatio  } from '@/utils/chakra-compat';
import { Link  } from '@/utils/chakra-compat';
export { 
  Box, Flex, Center, Container, Grid, GridItem, HStack, VStack, Stack, 
  Divider, Spacer, SimpleGrid, Wrap, WrapItem, AspectRatio, Link 
};

// Typography components
import { Heading  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Code  } from '@/utils/chakra-compat';
export { Heading, Text, Code };

// Form components
import { Button, IconButton, ButtonGroup  } from '@/utils/chakra-compat';
import { Input, InputGroup, InputLeftElement, InputRightElement, InputLeftAddon, InputRightAddon  } from '@/utils/chakra-compat';
import { Textarea  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { Checkbox, CheckboxGroup  } from '@/utils/chakra-compat';
import { Radio, RadioGroup  } from '@/utils/chakra-compat';
import { Switch  } from '@/utils/chakra-compat';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark  } from '@/utils/chakra-compat';
import { PinInput, PinInputField  } from '@/utils/chakra-compat';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper  } from '@/utils/chakra-compat';
import { FormControl, FormLabel, FormHelperText, FormErrorMessage  } from '@/utils/chakra-compat';
export { 
  Button, IconButton, ButtonGroup, Input, InputGroup, InputLeftElement, InputRightElement, 
  InputLeftAddon, InputRightAddon, Textarea, Select, Checkbox, CheckboxGroup, Radio, 
  RadioGroup, Switch, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark,
  PinInput, PinInputField, NumberInput, NumberInputField, NumberInputStepper, 
  NumberIncrementStepper, NumberDecrementStepper, FormControl, FormLabel, 
  FormHelperText, FormErrorMessage 
};

// Data display components
import { Badge  } from '@/utils/chakra-compat';
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableContainer, TableCaption  } from '@/utils/chakra-compat';
import { List, ListItem, ListIcon, OrderedList, UnorderedList  } from '@/utils/chakra-compat';
import { Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup  } from '@/utils/chakra-compat';
import { Card, CardHeader, CardBody, CardFooter  } from '@/utils/chakra-compat';
import { Tag, TagLabel, TagLeftIcon, TagRightIcon } from '@/utils/chakra-compat';
import { TagCloseButton } from '@/components/stubs/ChakraStubs';;
import { Avatar, AvatarBadge, AvatarGroup  } from '@/utils/chakra-compat';
import { Icon  } from '@/utils/chakra-compat';
import { Image  } from '@/utils/chakra-compat';
import { Kbd  } from '@/utils/chakra-compat';
export { 
  Badge, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableContainer, TableCaption,
  List, ListItem, ListIcon, OrderedList, UnorderedList, Stat, StatLabel, StatNumber,
  StatHelpText, StatArrow, StatGroup, Card, CardHeader, CardBody, CardFooter, Tag,
  TagLabel, TagLeftIcon, TagRightIcon, TagCloseButton, Avatar, AvatarBadge, 
  AvatarGroup, Icon, Image, Kbd
};

// Feedback components
import { Alert, AlertIcon, AlertTitle, AlertDescription  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { Progress, CircularProgress, CircularProgressLabel  } from '@/utils/chakra-compat';
import { Skeleton, SkeletonText, SkeletonCircle  } from '@/utils/chakra-compat';
export { 
  Alert, AlertIcon, AlertTitle, AlertDescription, Spinner, Progress, CircularProgress,
  CircularProgressLabel, Skeleton, SkeletonText, SkeletonCircle
};

// Overlay components
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@/components/stubs/ChakraStubs';;
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent } from '@/utils/chakra-compat';
import { DrawerCloseButton } from '@/components/stubs/ChakraStubs';;
import { Menu, MenuButton, MenuList, MenuItem, MenuItemOption, MenuGroup, MenuOptionGroup, MenuDivider  } from '@/utils/chakra-compat';
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow, PopoverAnchor } from '@/utils/chakra-compat';
import { PopoverCloseButton } from '@/components/stubs/ChakraStubs';;
import { Tooltip  } from '@/utils/chakra-compat';
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@/utils/chakra-compat';
import { AlertDialogCloseButton } from '@/components/stubs/ChakraStubs';;
export { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  Menu, MenuButton, MenuList, MenuItem, MenuItemOption, MenuGroup, MenuOptionGroup, MenuDivider,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, 
  PopoverArrow, PopoverCloseButton, PopoverAnchor, Tooltip, AlertDialog, AlertDialogBody,
  AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton
};

// Navigation components
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator  } from '@/utils/chakra-compat';
import { Tabs, TabList, TabPanels, Tab, TabPanel  } from '@/utils/chakra-compat';
export { 
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator,
  Tabs, TabList, TabPanels, Tab, TabPanel
};

// Disclosure components
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon  } from '@/utils/chakra-compat';
import { Collapse  } from '@/utils/chakra-compat';
export { 
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Collapse
};

// Hooks
import { useDisclosure } from '@/components/stubs/ChakraStubs';;
import { useColorMode, useColorModeValue } from '@/components/stubs/ChakraStubs';;
import { useToast as useChakraToast  } from '@/utils/chakra-compat';
import { useBreakpointValue  } from '@/utils/chakra-compat';
import { useMediaQuery  } from '@/utils/chakra-compat';
export { 
  useDisclosure, useColorMode, useColorModeValue, useBreakpointValue, useMediaQuery
};

// Theme utils
import { extendTheme  } from '@/utils/chakra-compat';
// Removed self-import to avoid circular reference

export { extendTheme };
export const theme = {
  colors: {}, // Basic theme stub - would need to be expanded for full compatibility
  fonts: {},
  fontSizes: {},
  space: {},
  components: {}
};

// Toast utility with show() method compatibility

/**
 * Custom toast implementation with backward compatibility
 */

/**
 * Custom toast implementation with backward compatibility for v3
 */
export const useToast = () => {
  // @ts-ignore - Import from correct source to avoid circular references
  const chakraToast = useChakraToast();
  
  return Object.assign(chakraToast, {
    show: (options: any) => chakraToast(options)
  });
};

// Also provide createToaster for compatibility
export const createToaster = () => useToast();

// Icon utility
export const createIcon = (props: any) => {
  return (iconProps: any) => {
    // Return a function that would create an Icon component (without JSX syntax)
    return { type: 'icon', props: { ...props, ...iconProps } };
  };
};

// Utilities for @chakra-ui/theme
export const createMultiStyleConfigHelpers = (parts: any) => {
  return {
    defineMultiStyleConfig: (config: any) => config,
    definePartsStyle: (config: any) => config,
  };
};

// Query and mutation enhancers
export const enhanceMutationOptions = (options: any) => options;
export const enhanceQueryOptions = (options: any) => options;

// Add missing createQueryClient function
export const createQueryClient = () => ({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
