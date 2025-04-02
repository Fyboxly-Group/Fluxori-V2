/// <reference path="../../types/module-declarations.d.ts" />
import React from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { CloseButton } from '@/components/stubs/ChakraStubs';
import { useColorMode  } from '@/utils/chakra-compat';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  X
} from 'lucide-react';

interface ToastNotificationProps {
  title: string;
  description?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
  isClosable?: boolean;
}

export function ToastNotification({
  title,
  description,
  status = 'info',
  onClose,
  isClosable = true
}: ToastNotificationProps) {
  const { colorMode } = useColorMode();
  
  // Status-based styling
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="green" />;
      case 'error':
        return <AlertCircle size={20} color="red" />;
      case 'warning':
        return <AlertTriangle size={20} color="orange" />;
      case 'info':
      default:
        return <Info size={20} color="blue" />;
    }
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return colorMode === 'light' ? 'green.500' : 'green.300';
      case 'error':
        return colorMode === 'light' ? 'red.500' : 'red.300';
      case 'warning':
        return colorMode === 'light' ? 'orange.500' : 'orange.300';
      case 'info':
      default:
        return colorMode === 'light' ? 'blue.500' : 'blue.300';
    }
  };
  
  const getBgColor = () => {
    switch (status) {
      case 'success':
        return colorMode === 'light' ? 'green.50' : 'green.900';
      case 'error':
        return colorMode === 'light' ? 'red.50' : 'red.900';
      case 'warning':
        return colorMode === 'light' ? 'orange.50' : 'orange.900';
      case 'info':
      default:
        return colorMode === 'light' ? 'blue.50' : 'blue.900';
    }
  };
  
  return (
    <Box
      p={4}
      bg={getBgColor()}
      borderLeftWidth="4px"
      borderLeftColor={getStatusColor()}
      borderRadius="md"
      boxShadow="md"
      mb={4}
      maxW="sm"
      w="100%"
    >
      <Flex justify="space-between" align="center">
        <Flex align="center">
          <Box mr={3}>
            {getStatusIcon()}
          </Box>
          <Box flex="1">
            <Text fontWeight="bold" color={getStatusColor()}>
              {title}
            </Text>
            {description && (
              <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                {description}
              </Text>
            )}
          </Box>
        </Flex>
        {isClosable && (
          <CloseButton 
            size="sm" 
            onClick={onClose} 
            color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
          />
        )}
      </Flex>
    </Box>
  );
}

export default ToastNotification;