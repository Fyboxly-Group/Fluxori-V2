/// <reference path="../../types/module-declarations.d.ts" />
import React, { useState } from 'react';
import { createToaster } from '@/utils/chakra-utils';
import { Card  } from '@/utils/chakra-compat';
import { CardHeader  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { CardFooter  } from '@/utils/chakra-compat';
import { Box  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Stack  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { FormControl  } from '@/utils/chakra-compat';
import { FormLabel  } from '@/utils/chakra-compat';
import { Input  } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
import { useToast  } from '@/utils/chakra-compat';
import { ResponsiveValue } from '../../utils/chakra-utils';

// Props interface
interface ChakraV3ExampleProps {
  title?: string;
  subtitle?: string;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
  showHeader?: boolean;
  showFooter?: boolean;
  children?: React.ReactNode;
  colorScheme?: string;
  variant?: string;
  size?: string;
  width?: ResponsiveValue<string | number>;
  maxWidth?: ResponsiveValue<string | number>;
  p?: ResponsiveValue<number | string>;
  m?: ResponsiveValue<number | string>;
  [key: string]: any;
}

// Example component showcasing Chakra UI V3 patterns
export function ChakraV3Example({ title = 'Chakra UI v3 Example', onSubmit }: ChakraV3ExampleProps) {
  // Component state
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  // Use Chakra hooks
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill out all fields',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Call onSubmit if provided
    if (onSubmit) {
      onSubmit(formData);
    }
    
    // Show success toast
    toast({
      title: 'Form Submitted',
      description: 'Thank you for your submission',
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };
  
  return (
    <Card width="100%" shadow="md">
      <CardHeader borderBottomWidth="1px" py={4}>
        <Heading size="md" textAlign="center">{title}</Heading>
        <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} fontSize="sm">
          Fill out the form below
        </Text>
      </CardHeader>
      
      <CardBody py={6}>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap={4}>
            <FormControl required>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
               />
            </FormControl>
            
            <FormControl required>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
               />
            </FormControl>
            
            <FormControl>
              <Flex justify="flex-end">
                {/* No loading prop in v3, use loading instead */}
                <Button type="submit" colorScheme="blue" loading={false}>
                  Submit
                </Button>
              </Flex>
            </FormControl>
          </Flex>
        </form>
      </CardBody>
      
      <CardFooter borderTopWidth="1px" py={4} justifyContent="center">
        <Button variant="ghost" size="sm">Need Help?</Button>
      </CardFooter>
    </Card>
  );
}

export default ChakraV3Example;