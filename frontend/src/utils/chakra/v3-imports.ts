/**
 * Direct Chakra UI V3 Imports
 * 
 * This file provides direct imports from Chakra UI v3 packages
 * to avoid circular dependencies.
 */

// Import directly from the specific Chakra UI packages
import { Button, IconButton, ButtonGroup, CloseButton } from '@chakra-ui/react/button';
import { Box, Flex, Container, Center, Grid, GridItem } from '@chakra-ui/react/layout';
import { useColorMode, useColorModeValue } from '@chakra-ui/react/color-mode';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { Checkbox } from '@chakra-ui/react/checkbox';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react/modal';
import { Link } from '@chakra-ui/react/link';
import { Image } from '@chakra-ui/react/image';
import { FormControl, FormLabel, FormHelperText, FormErrorMessage } from '@chakra-ui/react/form-control';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react/tabs';
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton } from '@chakra-ui/react/drawer';

// Re-export all components
export {
  Button, IconButton, ButtonGroup, CloseButton,
  Box, Flex, Container, Center, Grid, GridItem,
  useColorMode, useColorModeValue,
  useDisclosure,
  Checkbox,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Link,
  Image,
  FormControl, FormLabel, FormHelperText, FormErrorMessage,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton
};

// Provide a simple useToast implementation
export const useToast = () => {
  // Simple implementation that logs messages for now
  const toast = (options: any) => {
    console.log(`Toast: ${options.title}`, options);
    return 123; // Return a placeholder ID
  };
  
  return Object.assign(toast, {
    close: (id: number) => console.log(`Closing toast ${id}`),
    closeAll: () => console.log('Closing all toasts'),
    isActive: (id: number) => false,
    update: (id: number, options: any) => console.log(`Updating toast ${id}`, options),
    show: (options: any) => toast(options)
  });
};
