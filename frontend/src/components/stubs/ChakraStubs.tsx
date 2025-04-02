/**
 * Chakra UI Component Stubs
 * 
 * This file provides stub implementations of Chakra UI components
 * to break circular dependencies in the build process.
 */

import React from 'react';

// CloseButton stub
export const CloseButton: React.FC<any> = ({ onClick, children, ...props }) => (
  <button 
    onClick={onClick} 
    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
    {...props}
  >
    ✕
    {children}
  </button>
);

// Simple useToast stub
export const useToast = () => {
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

// Mock useCredits hook
export const useCredits = () => {
  return {
    balance: 0,
    history: [],
    loading: false,
    error: null,
    refetch: () => {},
    purchaseCredits: async (id: string) => ({ success: true, redirectUrl: '' })
  };
};

// Mock toast notifications
export const useToastNotifications = () => {
  return {
    showSuccess: (title: string, description?: string) => 
      console.log(`Success Toast: ${title}`, description),
    showError: (title: string, description?: string) => 
      console.log(`Error Toast: ${title}`, description),
    showInfo: (title: string, description?: string) => 
      console.log(`Info Toast: ${title}`, description),
    showWarning: (title: string, description?: string) => 
      console.log(`Warning Toast: ${title}`, description)
  };
};

// Checkbox stub
export const Checkbox: React.FC<any> = ({ children, ...props }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <input type="checkbox" {...props} />
    {children}
  </label>
);

// Image stub
export const Image: React.FC<any> = ({ src, alt, ...props }) => (
  <img src={src} alt={alt} {...props} style={{ maxWidth: '100%', height: 'auto', ...props.style }} />
);

// Modal stubs
export const Modal: React.FC<any> = ({ isOpen, children, ...props }) => (
  isOpen ? <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} {...props}>{children}</div> : null
);
export const ModalOverlay: React.FC<any> = ({ children, ...props }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} {...props}>{children}</div>
);
export const ModalContent: React.FC<any> = ({ children, ...props }) => (
  <div style={{ position: 'relative', margin: '3rem auto', maxWidth: '500px', background: 'white', borderRadius: '0.25rem' }} {...props}>{children}</div>
);
export const ModalHeader: React.FC<any> = ({ children, ...props }) => (
  <div style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.25rem' }} {...props}>{children}</div>
);
export const ModalCloseButton: React.FC<any> = (props) => (
  <CloseButton style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }} {...props} />
);
export const ModalBody: React.FC<any> = ({ children, ...props }) => (
  <div style={{ padding: '1rem' }} {...props}>{children}</div>
);
export const ModalFooter: React.FC<any> = ({ children, ...props }) => (
  <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }} {...props}>{children}</div>
);

// Tab stubs
export const Tabs: React.FC<any> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
export const TabList: React.FC<any> = ({ children, ...props }) => (
  <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }} {...props}>{children}</div>
);
export const Tab: React.FC<any> = ({ children, ...props }) => (
  <button style={{ padding: '0.5rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer' }} {...props}>{children}</button>
);
export const TabPanels: React.FC<any> = ({ children, ...props }) => (
  <div style={{ padding: '1rem 0' }} {...props}>{children}</div>
);
export const TabPanel: React.FC<any> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

// Form stubs
export const FormControl: React.FC<any> = ({ children, ...props }) => (
  <div style={{ marginBottom: '1rem' }} {...props}>{children}</div>
);
export const FormLabel: React.FC<any> = ({ children, ...props }) => (
  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }} {...props}>{children}</label>
);
export const FormHelperText: React.FC<any> = ({ children, ...props }) => (
  <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem' }} {...props}>{children}</div>
);
export const FormErrorMessage: React.FC<any> = ({ children, ...props }) => (
  <div style={{ fontSize: '0.85rem', color: '#E53E3E', marginTop: '0.25rem' }} {...props}>{children}</div>
);

// Drawer stubs
export const Drawer: React.FC<any> = ({ isOpen, children, ...props }) => (
  isOpen ? <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} {...props}>{children}</div> : null
);
export const DrawerOverlay: React.FC<any> = ({ children, ...props }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} {...props}>{children}</div>
);
export const DrawerContent: React.FC<any> = ({ children, ...props }) => (
  <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '300px', background: 'white' }} {...props}>{children}</div>
);
export const DrawerHeader: React.FC<any> = ({ children, ...props }) => (
  <div style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.25rem' }} {...props}>{children}</div>
);
export const DrawerBody: React.FC<any> = ({ children, ...props }) => (
  <div style={{ padding: '1rem' }} {...props}>{children}</div>
);
export const DrawerFooter: React.FC<any> = ({ children, ...props }) => (
  <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }} {...props}>{children}</div>
);
export const DrawerCloseButton: React.FC<any> = (props) => (
  <CloseButton style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }} {...props} />
);

// Popover stubs
export const Popover: React.FC<any> = ({ children, isOpen, ...props }) => (
  isOpen ? <div {...props}>{children}</div> : null
);
export const PopoverTrigger: React.FC<any> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
export const PopoverContent: React.FC<any> = ({ children, ...props }) => (
  <div style={{ position: 'absolute', zIndex: 1000, background: 'white', borderRadius: '4px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} {...props}>{children}</div>
);
export const PopoverHeader: React.FC<any> = ({ children, ...props }) => (
  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }} {...props}>{children}</div>
);
export const PopoverBody: React.FC<any> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
export const PopoverFooter: React.FC<any> = ({ children, ...props }) => (
  <div style={{ marginTop: '0.5rem' }} {...props}>{children}</div>
);
export const PopoverArrow: React.FC<any> = (props) => (
  <div style={{ width: '10px', height: '10px', position: 'absolute', transform: 'rotate(45deg)', background: 'white' }} {...props} />
);
export const PopoverCloseButton: React.FC<any> = (props) => (
  <CloseButton style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }} {...props} />
);
export const PopoverAnchor: React.FC<any> = ({ children, ...props }) => (
  <span {...props}>{children}</span>
);

// AlertDialog stubs
export const AlertDialog: React.FC<any> = ({ isOpen, children, ...props }) => (
  isOpen ? <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} {...props}>{children}</div> : null
);
export const AlertDialogOverlay: React.FC<any> = ({ children, ...props }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} {...props}>{children}</div>
);
export const AlertDialogContent: React.FC<any> = ({ children, ...props }) => (
  <div style={{ position: 'relative', margin: '3rem auto', maxWidth: '500px', background: 'white', borderRadius: '0.25rem' }} {...props}>{children}</div>
);
export const AlertDialogHeader: React.FC<any> = ({ children, ...props }) => (
  <div style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.25rem' }} {...props}>{children}</div>
);
export const AlertDialogBody: React.FC<any> = ({ children, ...props }) => (
  <div style={{ padding: '1rem' }} {...props}>{children}</div>
);
export const AlertDialogFooter: React.FC<any> = ({ children, ...props }) => (
  <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }} {...props}>{children}</div>
);
export const AlertDialogCloseButton: React.FC<any> = (props) => (
  <CloseButton style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }} {...props} />
);

// Tag components
export const Tag: React.FC<any> = ({ children, ...props }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '4px', padding: '0.25rem 0.5rem', background: '#E2E8F0' }} {...props}>{children}</span>
);
export const TagLabel: React.FC<any> = ({ children, ...props }) => (
  <span {...props}>{children}</span>
);
export const TagLeftIcon: React.FC<any> = ({ children, ...props }) => (
  <span style={{ marginRight: '0.25rem' }} {...props}>{children}</span>
);
export const TagRightIcon: React.FC<any> = ({ children, ...props }) => (
  <span style={{ marginLeft: '0.25rem' }} {...props}>{children}</span>
);
export const TagCloseButton: React.FC<any> = (props) => (
  <button style={{ marginLeft: '0.25rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} {...props}>✕</button>
);

// Hook stubs
export const useColorMode = () => ({
  colorMode: 'light',
  toggleColorMode: () => console.log('Toggle color mode'),
  setColorMode: (mode: string) => console.log(`Set color mode to ${mode}`),
});

export const useColorModeValue = (lightValue: any, darkValue: any) => lightValue;

export const useDisclosure = () => ({
  isOpen: false,
  onOpen: () => console.log('Open'),
  onClose: () => console.log('Close'),
  onToggle: () => console.log('Toggle'),
});
