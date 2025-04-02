const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Chakra UI Compatibility Layer fix script');

const chakraCompatPath = path.resolve(__dirname, '../src/utils/chakra-compat.ts');

// Backup the original file
fs.copyFileSync(chakraCompatPath, `${chakraCompatPath}.bak`);
console.log('✅ Backed up original chakra-compat.ts');

// Create a comprehensive Chakra UI v3 compatibility layer
const fixedContent = `/**
 * Chakra UI Compatibility Layer
 * 
 * This file provides a compatibility layer for Chakra UI v3,
 * re-exporting components with proper direct imports.
 * 
 * It serves as a bridge to ensure code written for v2 can continue to work
 * with minimal changes when moving to v3.
 */

// Core Provider
import { ChakraProvider } from '@chakra-ui/react/provider';
export { ChakraProvider };

// Layout components
import { Box } from '@chakra-ui/react/box';
import { Flex } from '@chakra-ui/react/flex';
import { Center } from '@chakra-ui/react/center';
import { Container } from '@chakra-ui/react/layout';
import { Grid, GridItem } from '@chakra-ui/react/layout';
import { HStack, VStack, Stack } from '@chakra-ui/react/stack';
import { Divider } from '@chakra-ui/react/divider';
import { Spacer } from '@chakra-ui/react/layout';
import { SimpleGrid } from '@chakra-ui/react/layout';
import { Wrap, WrapItem } from '@chakra-ui/react/layout';
import { AspectRatio } from '@chakra-ui/react/layout';
import { Link } from '@chakra-ui/react/link';
export { 
  Box, Flex, Center, Container, Grid, GridItem, HStack, VStack, Stack, 
  Divider, Spacer, SimpleGrid, Wrap, WrapItem, AspectRatio, Link 
};

// Typography components
import { Heading } from '@chakra-ui/react/heading';
import { Text } from '@chakra-ui/react/text';
import { Code } from '@chakra-ui/react/code';
export { Heading, Text, Code };

// Form components
import { Button, IconButton, ButtonGroup } from '@chakra-ui/react/button';
import { Input, InputGroup, InputLeftElement, InputRightElement, InputLeftAddon, InputRightAddon } from '@chakra-ui/react/input';
import { Textarea } from '@chakra-ui/react/textarea';
import { Select } from '@chakra-ui/react/select';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react/checkbox';
import { Radio, RadioGroup } from '@chakra-ui/react/radio';
import { Switch } from '@chakra-ui/react/switch';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark } from '@chakra-ui/react/slider';
import { PinInput, PinInputField } from '@chakra-ui/react/pin-input';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react/number-input';
import { FormControl, FormLabel, FormHelperText, FormErrorMessage } from '@chakra-ui/react/form-control';
export { 
  Button, IconButton, ButtonGroup, Input, InputGroup, InputLeftElement, InputRightElement, 
  InputLeftAddon, InputRightAddon, Textarea, Select, Checkbox, CheckboxGroup, Radio, 
  RadioGroup, Switch, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark,
  PinInput, PinInputField, NumberInput, NumberInputField, NumberInputStepper, 
  NumberIncrementStepper, NumberDecrementStepper, FormControl, FormLabel, 
  FormHelperText, FormErrorMessage 
};

// Data display components
import { Badge } from '@chakra-ui/react/badge';
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableContainer, TableCaption } from '@chakra-ui/react/table';
import { List, ListItem, ListIcon, OrderedList, UnorderedList } from '@chakra-ui/react/layout';
import { Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup } from '@chakra-ui/react/stat';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react/card';
import { Tag, TagLabel, TagLeftIcon, TagRightIcon, TagCloseButton } from '@chakra-ui/react/tag';
import { Avatar, AvatarBadge, AvatarGroup } from '@chakra-ui/react/avatar';
import { Icon } from '@chakra-ui/react/icon';
import { Image } from '@chakra-ui/react/image';
import { Kbd } from '@chakra-ui/react/kbd';
export { 
  Badge, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableContainer, TableCaption,
  List, ListItem, ListIcon, OrderedList, UnorderedList, Stat, StatLabel, StatNumber,
  StatHelpText, StatArrow, StatGroup, Card, CardHeader, CardBody, CardFooter, Tag,
  TagLabel, TagLeftIcon, TagRightIcon, TagCloseButton, Avatar, AvatarBadge, 
  AvatarGroup, Icon, Image, Kbd
};

// Feedback components
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react/alert';
import { Spinner } from '@chakra-ui/react/spinner';
import { Progress, CircularProgress, CircularProgressLabel } from '@chakra-ui/react/progress';
import { Skeleton, SkeletonText, SkeletonCircle } from '@chakra-ui/react/skeleton';
export { 
  Alert, AlertIcon, AlertTitle, AlertDescription, Spinner, Progress, CircularProgress,
  CircularProgressLabel, Skeleton, SkeletonText, SkeletonCircle
};

// Overlay components
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react/modal';
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton } from '@chakra-ui/react/drawer';
import { Menu, MenuButton, MenuList, MenuItem, MenuItemOption, MenuGroup, MenuOptionGroup, MenuDivider } from '@chakra-ui/react/menu';
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow, PopoverCloseButton, PopoverAnchor } from '@chakra-ui/react/popover';
import { Tooltip } from '@chakra-ui/react/tooltip';
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton } from '@chakra-ui/react/alert-dialog';
export { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  Menu, MenuButton, MenuList, MenuItem, MenuItemOption, MenuGroup, MenuOptionGroup, MenuDivider,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, 
  PopoverArrow, PopoverCloseButton, PopoverAnchor, Tooltip, AlertDialog, AlertDialogBody,
  AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton
};

// Navigation components
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@chakra-ui/react/breadcrumb';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react/tabs';
export { 
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator,
  Tabs, TabList, TabPanels, Tab, TabPanel
};

// Disclosure components
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react/accordion';
import { Collapse } from '@chakra-ui/react/transition';
export { 
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Collapse
};

// Hooks
import { useDisclosure } from '@chakra-ui/react/hooks';
import { useColorMode, useColorModeValue } from '@chakra-ui/react/color-mode';
import { useToast as useChakraToast } from '@chakra-ui/react/toast';
import { useBreakpointValue } from '@chakra-ui/react/media-query';
import { useMediaQuery } from '@chakra-ui/react/media-query';
export { 
  useDisclosure, useColorMode, useColorModeValue, useBreakpointValue, useMediaQuery
};

// Theme utils
import { extendTheme } from '@chakra-ui/react/theme';
export { extendTheme };
export const theme = {
  colors: {}, // Basic theme stub - would need to be expanded for full compatibility
  fonts: {},
  fontSizes: {},
  space: {},
  components: {}
};

// Toast utility with show() method compatibility
export const useToast = () => {
  const toast = useChakraToast();
  
  // Return the original toast function with added show method for backward compatibility
  return Object.assign(toast, {
    show: (options) => toast(options)
  });
};

// Also provide createToaster for compatibility
export const createToaster = () => useToast();

// Icon utility
export const createIcon = (props) => {
  return (iconProps) => <Icon {...props} {...iconProps} />;
};

// Utilities for @chakra-ui/theme
export const createMultiStyleConfigHelpers = (parts) => {
  return {
    defineMultiStyleConfig: (config) => config,
    definePartsStyle: (config) => config,
  };
};

// Query and mutation enhancers
export const enhanceMutationOptions = (options) => options;
export const enhanceQueryOptions = (options) => options;

// Add missing createQueryClient function
export const createQueryClient = () => ({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
`;

try {
  fs.writeFileSync(chakraCompatPath, fixedContent);
  console.log('✅ Updated chakra-compat.ts with comprehensive component exports and toast compatibility');
} catch (error) {
  console.error('❌ Error updating chakra-compat.ts:', error);
  fs.copyFileSync(`${chakraCompatPath}.bak`, chakraCompatPath);
  console.log('⚠️ Reverted to original chakra-compat.ts due to error');
}

// Find files with toast.show pattern and fix them
const findToastShowUsage = () => {
  try {
    const examplePath = path.resolve(__dirname, '../src/features/warehouse/hooks/useWarehouse.ts');
    console.log('🔍 Examining example file for toast usage pattern...');
    
    if (fs.existsSync(examplePath)) {
      const content = fs.readFileSync(examplePath, 'utf8');
      const usesToastShow = content.includes('toast.show');
      
      if (usesToastShow) {
        console.log('✅ Found toast.show usage in useWarehouse.ts');
        console.log('⚠️ No changes needed with the new chakra-compat.ts as it adds .show() compatibility');
      } else {
        console.log('⚠️ No toast.show usage found in useWarehouse.ts - might be using a different pattern');
      }
    }
  } catch (error) {
    console.error('❌ Error analyzing toast usage:', error);
  }
};

findToastShowUsage();
console.log('✅ Chakra-compat fixes applied');
