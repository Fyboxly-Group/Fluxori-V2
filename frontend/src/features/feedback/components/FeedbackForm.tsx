/// <reference path="../../types/module-declarations.d.ts" />
import React, { useState } from 'react';
import { Box  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { FormControl  } from '@/utils/chakra-compat';
import { FormLabel  } from '@/utils/chakra-compat';
import { FormHelperText  } from '@/utils/chakra-compat';
import { Input  } from '@/utils/chakra-compat';
import { Textarea  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { useToast  } from '@/utils/chakra-compat';

export interface FeedbackFormProps {
  onSubmit?: (feedback: any) => Promise<void>;
  onClose?: () => void;
  isOpen?: boolean;
  defaultRating?: number;
  defaultCategory?: string;
  defaultMessage?: string;
  showTitle?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  showAttachment?: boolean;
  maxWidth?: ResponsiveValue<string | number>;
  width?: ResponsiveValue<string | number>;
  p?: ResponsiveValue<number | string>;
  m?: ResponsiveValue<number | string>;
}

export function FeedbackForm({ onClose, onSubmit }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    type: 'feature_request',
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
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
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Close the form
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        status: 'error',
        duration: 5000,
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
          <FormLabel>Feedback Type</FormLabel>
          <Select 
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="feature_request">Feature Request</option>
            <option value="bug_report">Bug Report</option>
            <option value="improvement">Improvement</option>
            <option value="other">Other</option>
          </Select>
        </FormControl>
        
        <FormControl required>
          <FormLabel>Title</FormLabel>
          <Input 
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of your feedback"
           />
        </FormControl>
        
        <FormControl required>
          <FormLabel>Description</FormLabel>
          <Textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide details about your feedback"
            minHeight="150px"
           />
          <FormHelperText>
            Please be as detailed as possible to help us understand your feedback
          </FormHelperText>
        </FormControl>
        
        <Box display="flex" justifyContent="flex-end" gap={3} mt={4}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            colorScheme="blue"
            loading={loading}
          >
            Submit Feedback
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}

export default FeedbackForm;