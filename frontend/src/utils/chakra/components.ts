/**
 * Chakra UI Components Re-export
 * 
 * This file re-exports all Chakra UI components to provide a consistent
 * import path for the application.
 */

// Re-export all components from the compatibility layer
// to ensure consistent component availability
import * as ChakraCompat from '@/utils/chakra-compat';

// Layout components
export const {
  Box,
  Flex,
  Center,
  Container,
  Grid,
  GridItem,
  HStack,
  VStack,
  Stack,
  Divider,
  Spacer,
  SimpleGrid,
  Wrap,
  WrapItem,
  AspectRatio,
  Link
} = ChakraCompat;

// Typography components
export const {
  Heading,
  Text,
  Code
} = ChakraCompat;

// Form components
export const {
  Button,
  IconButton,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  InputLeftAddon,
  InputRightAddon,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  PinInput,
  PinInputField,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage
} = ChakraCompat;

// Data display components
export const {
  Badge,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Icon,
  Image,
  Kbd
} = ChakraCompat;

// Feedback components
export const {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Skeleton,
  SkeletonText,
  SkeletonCircle
} = ChakraCompat;

// Overlay components
export const {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton
} = ChakraCompat;

// Navigation components
export const {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} = ChakraCompat;

// Disclosure components
export const {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Collapse
} = ChakraCompat;

// Hooks
export const {
  useDisclosure,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
  useMediaQuery,
  useToast
} = ChakraCompat;

// Theme utils
export const {
  extendTheme,
  theme,
  createToaster,
  createIcon,
  createMultiStyleConfigHelpers,
  enhanceMutationOptions,
  enhanceQueryOptions,
  createQueryClient
} = ChakraCompat;