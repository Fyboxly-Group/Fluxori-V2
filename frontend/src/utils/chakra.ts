/**
 * Barrel file for Chakra UI components to fix import issues
 */
/// <reference path="../../types/module-declarations.d.ts" />

import { Box  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Center  } from '@/utils/chakra-compat';
import { Container  } from '@/utils/chakra-compat';
import { HStack, VStack, Stack  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Button, IconButton  } from '@/utils/chakra-compat';
import { Input, InputGroup, InputLeftElement, InputRightElement  } from '@/utils/chakra-compat';
import { Textarea  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { Checkbox  } from '@/utils/chakra-compat';
import { Radio, RadioGroup  } from '@/utils/chakra-compat';
import { FormControl, FormLabel, FormHelperText, FormErrorMessage  } from '@/utils/chakra-compat';
import { Tabs, TabList, TabPanels, Tab, TabPanel  } from '@/utils/chakra-compat';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@/components/stubs/ChakraStubs';;
import { Menu, MenuButton, MenuList, MenuItem, MenuDivider  } from '@/utils/chakra-compat';
import { Avatar, AvatarBadge  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Tooltip  } from '@/utils/chakra-compat';
import { Alert, AlertIcon, AlertTitle, AlertDescription  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { Progress  } from '@/utils/chakra-compat';
import { Skeleton, SkeletonText, SkeletonCircle  } from '@/utils/chakra-compat';
import { Switch  } from '@/utils/chakra-compat';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer  } from '@/utils/chakra-compat';
import { Card, CardHeader, CardBody, CardFooter  } from '@/utils/chakra-compat';
import { Divider  } from '@/utils/chakra-compat';
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow } from '@/utils/chakra-compat';
import { PopoverCloseButton } from '@/components/stubs/ChakraStubs';;
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator  } from '@/utils/chakra-compat';
import { Tag, TagLabel, TagLeftIcon, TagRightIcon } from '@/utils/chakra-compat';
import { TagCloseButton } from '@/components/stubs/ChakraStubs';;
import { Code  } from '@/utils/chakra-compat';
import { Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup  } from '@/utils/chakra-compat';
import { useDisclosure } from '@/components/stubs/ChakraStubs';;
import { useColorMode, useColorModeValue } from '@/components/stubs/ChakraStubs';;
import { Icon  } from '@/utils/chakra-compat';;

import { toast  } from '@/utils/chakra-compat';

// Export all components
export {
  ChakraProvider,
  Box,
  Flex,
  Center,
  Container,
  HStack,
  VStack,
  Stack,
  Heading,
  Text,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  AvatarBadge,
  Badge,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Progress,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Switch,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Collapse,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
  Code,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  useToast,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
  useMediaQuery,
  theme,
  createIcon,
  Icon,
  toast
};

// Also provide individual exports for direct imports
export { toast } from '@chakra-ui/react/toast';

// Add missing createQueryClient function
export const createQueryClient = () => ({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
