/// <reference path="../../types/module-declarations.d.ts" />
import React, { useState } from 'react';
import { Box  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { FormControl  } from '@/utils/chakra-compat';
import { FormLabel  } from '@/utils/chakra-compat';
import { FormHelperText  } from '@/utils/chakra-compat';
import { Input  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { ButtonGroup  } from '@/utils/chakra-compat';
import { useToast  } from '@/utils/chakra-compat';

export interface ConnectionFormProps {
  onClose: () => void;
  onSubmit?: (connectionData: any) => Promise<void>;
  connection?: any;
  open?: boolean;
}

export function ConnectionForm({ onClose, onSubmit, connection }: ConnectionFormProps) {
  const [formData, setFormData] = useState({
    name: connection?.name || '',
    type: connection?.type || 'api',
    apiKey: connection?.apiKey || '',
    url: connection?.url || '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast({
        title: 'Error',
        description: 'Please fill out all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (onSubmit) {
        await onSubmit(formData);
      }
      
      toast({
        title: 'Success',
        description: 'Connection saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save connection',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack gap={4} align="stretch">
        <FormControl required>
          <FormLabel>Connection Name</FormLabel>
          <Input 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter a name for this connection"
           />
        </FormControl>
        
        <FormControl required>
          <FormLabel>Connection Type</FormLabel>
          <Select 
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="api">API</option>
            <option value="database">Database</option>
            <option value="oauth">OAuth</option>
            <option value="webhook">Webhook</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>API Key</FormLabel>
          <Input 
            name="apiKey"
            value={formData.apiKey}
            onChange={handleChange}
            placeholder="Enter API key"
            type="password"
           />
          <FormHelperText>
            Leave blank if not applicable
          </FormHelperText>
        </FormControl>
        
        <FormControl>
          <FormLabel>URL</FormLabel>
          <Input 
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="Enter connection URL"
           />
        </FormControl>
        
        <ButtonGroup display="flex" justifyContent="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            colorScheme="blue"
            loading={loading}
          >
            {connection ? 'Update' : 'Create'} Connection
          </Button>
        </ButtonGroup>
      </VStack>
    </Box>
  );
}

export default ConnectionForm;