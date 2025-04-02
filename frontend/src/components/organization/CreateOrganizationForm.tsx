import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  Badge
} from '@/utils/chakra-compat';
import { useRouter } from 'next/router';
import { useOrganization } from '@/context/OrganizationContext';

interface OrganizationType {
  value: string;
  label: string;
  description: string;
  features: string[];
  color: string;
}

const organizationTypes: OrganizationType[] = [
  {
    value: 'basic',
    label: 'Basic',
    description: 'For individual users or small teams getting started with the platform.',
    features: ['Up to 5 users', 'Standard features', 'Email support'],
    color: 'gray'
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'For growing businesses with more advanced needs.',
    features: ['Up to 20 users', 'Advanced features', 'Priority support', 'API access'],
    color: 'blue'
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: 'For larger organizations with complex requirements.',
    features: ['Unlimited users', 'Enterprise features', 'Dedicated support', 'Custom integrations', 'Advanced reporting'],
    color: 'purple'
  },
  {
    value: 'agency',
    label: 'Agency',
    description: 'For agencies managing multiple client accounts.',
    features: ['Client organization management', 'White-labeling options', 'Agency dashboard', 'Client reporting'],
    color: 'green'
  }
];

interface CreateOrganizationFormProps {
  onSuccess?: (organizationId: string) => void;
}

const CreateOrganizationForm: React.FC<CreateOrganizationFormProps> = ({
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'basic',
    description: '',
    parentId: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useToast();
  const router = useRouter();
  const { refreshOrganizations, organizations } = useOrganization();
  
  // Filter for agencies only (for parent organization dropdown)
  const agencyOrganizations = organizations.filter(org => org.type === 'agency');
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle type selection via radio group
  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
    if (formErrors.type) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.type;
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Organization name is required';
    }
    
    if (!formData.type) {
      errors.type = 'Please select an organization type';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create organization');
      }
      
      const data = await response.json();
      
      // Refresh organizations list
      await refreshOrganizations();
      
      toast({
        title: 'Organization created',
        description: `${formData.name} has been created successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Call success callback or redirect
      if (onSuccess) {
        onSuccess(data.organization.id);
      } else {
        router.push('/organizations/manage');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Create New Organization</Heading>
      </CardHeader>
      
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Organization Name */}
            <FormControl isRequired isInvalid={!!formErrors.name}>
              <FormLabel>Organization Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter organization name"
              />
              {formErrors.name ? (
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              ) : (
                <FormHelperText>This will be the display name for your organization</FormHelperText>
              )}
            </FormControl>
            
            {/* Organization Description */}
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your organization"
                resize="vertical"
                rows={3}
              />
              <FormHelperText>Optional description of your organization</FormHelperText>
            </FormControl>
            
            {/* Organization Type */}
            <FormControl isRequired isInvalid={!!formErrors.type}>
              <FormLabel>Organization Type</FormLabel>
              <RadioGroup
                value={formData.type}
                onChange={handleTypeChange}
              >
                <Stack spacing={4} direction="column">
                  {organizationTypes.map(type => (
                    <Box
                      key={type.value}
                      borderWidth="1px"
                      borderRadius="md"
                      p={4}
                      cursor="pointer"
                      borderColor={formData.type === type.value ? `${type.color}.500` : 'gray.200'}
                      bgColor={formData.type === type.value ? `${type.color}.50` : 'transparent'}
                      _hover={{ 
                        borderColor: `${type.color}.300`,
                        bgColor: formData.type === type.value ? `${type.color}.50` : 'gray.50'
                      }}
                      onClick={() => handleTypeChange(type.value)}
                    >
                      <Stack direction="row" justify="space-between" align="center">
                        <Radio value={type.value} colorScheme={type.color}>
                          <Text fontWeight="medium" fontSize="md">{type.label}</Text>
                        </Radio>
                        <Badge colorScheme={type.color} variant="subtle" px={2}>
                          {type.label}
                        </Badge>
                      </Stack>
                      
                      <Text fontSize="sm" mt={2} color="gray.600">
                        {type.description}
                      </Text>
                      
                      <Stack direction="column" mt={3} spacing={1}>
                        {type.features.map((feature, index) => (
                          <Text key={index} fontSize="xs" color="gray.500">
                            • {feature}
                          </Text>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </RadioGroup>
              
              {formErrors.type && (
                <FormErrorMessage>{formErrors.type}</FormErrorMessage>
              )}
            </FormControl>
            
            {/* Parent Organization (for Agency relationships) */}
            {agencyOrganizations.length > 0 && (
              <FormControl>
                <FormLabel>Parent Organization (Optional)</FormLabel>
                <Select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleChange}
                  placeholder="Select a parent organization"
                >
                  {agencyOrganizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </Select>
                <FormHelperText>
                  Connect this organization to an agency for management
                </FormHelperText>
              </FormControl>
            )}
            
            {/* Submit Button */}
            <Box pt={4}>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText="Creating..."
                size="md"
                width="full"
              >
                Create Organization
              </Button>
            </Box>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
};

export default CreateOrganizationForm;