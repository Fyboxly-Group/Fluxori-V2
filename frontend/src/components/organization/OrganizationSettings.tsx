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
  Input,
  Select,
  Switch,
  VStack,
  HStack,
  Text,
  Divider,
  useToast,
  Badge,
  Heading,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@/utils/chakra-compat';
import { Organization } from '@/context/OrganizationContext';
import { useOrganization } from '@/context/OrganizationContext';
import { createMutationWithToast } from '@/utils/query.utils';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';

interface OrganizationSettingsProps {
  organization: Organization;
}

const OrganizationTypeInfo: Record<string, { color: string; label: string; description: string }> = {
  BASIC: {
    color: 'gray',
    label: 'Basic',
    description: 'For individuals and small teams with limited feature access.',
  },
  PROFESSIONAL: {
    color: 'blue',
    label: 'Professional',
    description: 'For growing businesses with expanded feature access and priority support.',
  },
  ENTERPRISE: {
    color: 'purple',
    label: 'Enterprise',
    description: 'For large organizations with full feature access, custom integrations, and dedicated support.',
  },
  AGENCY: {
    color: 'teal',
    label: 'Agency',
    description: 'For service providers managing multiple client organizations.',
  },
};

const OrganizationStatusInfo: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'green', label: 'Active' },
  TRIAL: { color: 'blue', label: 'Trial' },
  SUSPENDED: { color: 'orange', label: 'Suspended' },
  EXPIRED: { color: 'red', label: 'Expired' },
};

const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ organization }) => {
  const toast = useToast();
  const router = useRouter();
  const { updateOrganization, deleteOrganization, loading } = useOrganization();
  const [formData, setFormData] = useState({
    name: organization.name,
    domains: organization.metadata?.domains || [],
    settings: {
      allowSuborganizations: organization.settings?.allowSuborganizations || false,
      maxUsers: organization.settings?.maxUsers || 0,
      maxSuborganizations: organization.settings?.maxSuborganizations || 0,
      defaultUserRole: organization.settings?.defaultUserRole || '',
      theme: organization.settings?.theme || 'light',
    },
  });
  
  const [isEdited, setIsEdited] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const cancelRef = React.useRef(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsEdited(true);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: value,
      },
    }));
    setIsEdited(true);
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: checked,
      },
    }));
    setIsEdited(true);
  };

  const addDomain = () => {
    if (!domainInput || formData.domains.includes(domainInput)) return;
    
    setFormData(prev => ({
      ...prev,
      domains: [...prev.domains, domainInput],
    }));
    setDomainInput('');
    setIsEdited(true);
  };

  const removeDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      domains: prev.domains.filter(d => d !== domain),
    }));
    setIsEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateOrganization(organization.id, {
        name: formData.name,
        metadata: {
          ...organization.metadata,
          domains: formData.domains,
        },
        settings: formData.settings,
      });
      
      setIsEdited(false);
      toast({
        title: "Organization updated",
        description: "Organization settings have been updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating organization:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the organization settings",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrganization(organization.id);
      onDeleteClose();
      toast({
        title: "Organization deleted",
        description: "The organization has been deleted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push('/app/dashboard');
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the organization",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const typeInfo = OrganizationTypeInfo[organization.type] || { color: 'gray', label: organization.type, description: '' };
  const statusInfo = OrganizationStatusInfo[organization.status] || { color: 'gray', label: organization.status };
  
  const canEdit = organization.ownerId === 'current-user-id'; // Replace with actual auth check
  const isSubscribed = organization.metadata?.subscription?.active;
  const subscriptionEndDate = organization.metadata?.subscription?.endDate;

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Organization Information</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <FormControl id="name" mb={4}>
                <FormLabel>Organization Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isDisabled={!canEdit || loading}
                />
              </FormControl>
              
              <HStack spacing={6} mb={4}>
                <Box>
                  <Text fontWeight="medium" mb={1}>Organization Type</Text>
                  <Badge colorScheme={typeInfo.color}>{typeInfo.label}</Badge>
                  <Text fontSize="sm" mt={1}>{typeInfo.description}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="medium" mb={1}>Status</Text>
                  <Badge colorScheme={statusInfo.color}>{statusInfo.label}</Badge>
                </Box>
              </HStack>
              
              {isSubscribed && (
                <Box mb={4}>
                  <Text fontWeight="medium" mb={1}>Subscription</Text>
                  <HStack>
                    <Calendar size={16} />
                    <Text fontSize="sm">
                      {subscriptionEndDate 
                        ? `Renews on ${new Date(subscriptionEndDate).toLocaleDateString()}`
                        : 'Active subscription'
                      }
                    </Text>
                  </HStack>
                </Box>
              )}

              {organization.parentId && (
                <Box mb={4}>
                  <Text fontWeight="medium" mb={1}>Parent Organization</Text>
                  <Text fontSize="sm">{organization.metadata?.parentName || organization.parentId}</Text>
                </Box>
              )}
            </Box>
            
            <Divider />
            
            {/* Domains Management */}
            <Box>
              <Text fontWeight="medium" mb={4}>Allowed Email Domains</Text>
              <FormHelperText mb={3}>
                Users with these email domains will be automatically added to your organization when they sign up
              </FormHelperText>
              
              <HStack mb={3}>
                <Input
                  placeholder="example.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  isDisabled={!canEdit || loading}
                />
                <Button
                  onClick={addDomain}
                  isDisabled={!domainInput || !canEdit || loading}
                >
                  Add
                </Button>
              </HStack>
              
              <HStack spacing={2} flexWrap="wrap">
                {formData.domains.map((domain) => (
                  <Badge
                    key={domain}
                    colorScheme="blue"
                    mb={2}
                    pl={2}
                    pr={1}
                    py={1}
                  >
                    {domain}
                    {canEdit && (
                      <Box
                        as="span"
                        ml={1}
                        cursor="pointer"
                        onClick={() => removeDomain(domain)}
                      >
                        ✕
                      </Box>
                    )}
                  </Badge>
                ))}
                {formData.domains.length === 0 && (
                  <Text fontSize="sm" color="gray.500">No domains added</Text>
                )}
              </HStack>
            </Box>
            
            <Divider />
            
            {/* Organization Settings */}
            <Box>
              <Text fontWeight="medium" mb={4}>Settings</Text>
              
              {organization.type === 'AGENCY' && (
                <FormControl 
                  display="flex" 
                  alignItems="center" 
                  mb={4}
                >
                  <FormLabel htmlFor="allowSuborganizations" mb="0">
                    Allow Client Organizations
                  </FormLabel>
                  <Switch
                    id="allowSuborganizations"
                    name="allowSuborganizations"
                    isChecked={formData.settings.allowSuborganizations}
                    onChange={handleSwitchChange}
                    isDisabled={!canEdit || loading}
                  />
                </FormControl>
              )}
              
              <FormControl id="theme" mb={4}>
                <FormLabel>Theme</FormLabel>
                <Select
                  name="theme"
                  value={formData.settings.theme}
                  onChange={handleSettingsChange}
                  isDisabled={!canEdit || loading}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Select>
              </FormControl>
              
              <FormControl id="defaultUserRole" mb={4}>
                <FormLabel>Default User Role</FormLabel>
                <Select
                  name="defaultUserRole"
                  value={formData.settings.defaultUserRole}
                  onChange={handleSettingsChange}
                  isDisabled={!canEdit || loading}
                >
                  <option value="">Select a default role</option>
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </Select>
                <FormHelperText>
                  This role will be assigned to new users by default
                </FormHelperText>
              </FormControl>
            </Box>
          </VStack>
        </CardBody>
      </Card>
      
      <HStack spacing={4} justify="space-between">
        <Button
          colorScheme="red"
          variant="outline"
          onClick={onDeleteOpen}
          isDisabled={!canEdit || loading}
        >
          Delete Organization
        </Button>
        
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          isDisabled={!isEdited || !canEdit || loading}
        >
          Save Changes
        </Button>
      </HStack>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Organization
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this organization? This action cannot be undone.
              All data associated with this organization will be permanently deleted.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default OrganizationSettings;