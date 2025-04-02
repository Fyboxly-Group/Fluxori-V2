/**
 * Chakra UI Hooks Re-export
 * 
 * This file re-exports all Chakra UI hooks to provide a consistent
 * import path for the application.
 */

// Re-export hooks from the compatibility layer
import * as ChakraCompat from '@/utils/chakra-compat';

export const {
  useDisclosure,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
  useMediaQuery,
  useToast
} = ChakraCompat;