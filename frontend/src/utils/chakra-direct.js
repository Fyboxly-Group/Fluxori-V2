/**
 * Direct Chakra UI imports
 * This module provides direct access to Chakra UI components without circular dependencies
 */

// Import from Chakra UI directly to avoid circular dependencies
const ChakraUI = require('@chakra-ui/react');

// Export components that are causing circular dependency issues
exports.CloseButton = ChakraUI.CloseButton;
exports.useToast = ChakraUI.useToast;
exports.useColorMode = ChakraUI.useColorMode;
exports.useDisclosure = ChakraUI.useDisclosure;
exports.Modal = ChakraUI.Modal;
exports.ModalOverlay = ChakraUI.ModalOverlay;
exports.ModalContent = ChakraUI.ModalContent;
exports.ModalHeader = ChakraUI.ModalHeader;
exports.ModalFooter = ChakraUI.ModalFooter;
exports.ModalBody = ChakraUI.ModalBody;
exports.ModalCloseButton = ChakraUI.ModalCloseButton;
exports.Image = ChakraUI.Image;
exports.Checkbox = ChakraUI.Checkbox;
exports.AlertIcon = ChakraUI.AlertIcon;
exports.FormControl = ChakraUI.FormControl;
exports.FormLabel = ChakraUI.FormLabel;
exports.DrawerOverlay = ChakraUI.DrawerOverlay;
exports.DrawerCloseButton = ChakraUI.DrawerCloseButton;
exports.Tabs = ChakraUI.Tabs;
exports.TabList = ChakraUI.TabList;
exports.TabPanels = ChakraUI.TabPanels;
exports.Tab = ChakraUI.Tab;
exports.TabPanel = ChakraUI.TabPanel;

// Mock hooks needed
exports.useCredits = () => {
  return {
    balance: 0,
    history: [],
    loading: false,
    error: null,
    refetch: () => {},
    purchaseCredits: async (id) => ({ success: true, redirectUrl: '' })
  };
};

exports.useToastNotifications = () => {
  const toast = exports.useToast();
  return {
    showSuccess: (title, description) => 
      toast({ title, description, status: 'success', duration: 3000 }),
    showError: (title, description) => 
      toast({ title, description, status: 'error', duration: 5000 }),
    showInfo: (title, description) => 
      toast({ title, description, status: 'info', duration: 3000 }),
    showWarning: (title, description) => 
      toast({ title, description, status: 'warning', duration: 4000 })
  };
};