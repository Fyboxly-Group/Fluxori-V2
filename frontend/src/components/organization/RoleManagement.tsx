import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  FormHelperText,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Skeleton,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack
} from '@/utils/chakra-compat';
import { Edit, Trash, Plus, Shield, Users } from 'lucide-react';
import { useOrganization } from '@/context/OrganizationContext';

// Defined permission types
interface Permission {
  resource: string;
  action: string;
  description?: string;
}

// Define role type
interface Role {
  id: string;
  name: string;
  description: string;
  scope: 'system' | 'organization' | 'suborganization';
  organizationId?: string;
  isDefault?: boolean;
  isBuiltIn?: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

// Define props
interface RoleManagementProps {
  showBuiltInRoles?: boolean;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  showBuiltInRoles = true
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<{
    resources: string[];
    actions: string[];
    resourceCategories: Record<string, string[]>;
    examples: Permission[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: ''
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentOrganization } = useOrganization();
  const toast = useToast();
  
  // Colors
  const headerBgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Load roles and available permissions
  useEffect(() => {
    if (currentOrganization) {
      fetchRoles();
      fetchAvailablePermissions();
    }
  }, [currentOrganization]);
  
  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching roles',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch available permissions
  const fetchAvailablePermissions = async () => {
    try {
      const response = await fetch('/api/roles/permissions/available', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      
      const data = await response.json();
      setAvailablePermissions(data);
    } catch (error: any) {
      toast({
        title: 'Error fetching permissions',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  // Handle opening the create/edit role modal
  const handleOpenRoleModal = (role?: Role) => {
    if (role) {
      // Edit mode
      setSelectedRole(role);
      setRoleFormData({
        name: role.name,
        description: role.description
      });
      setSelectedPermissions(role.permissions);
    } else {
      // Create mode
      setSelectedRole(null);
      setRoleFormData({
        name: '',
        description: ''
      });
      setSelectedPermissions([]);
    }
    onOpen();
  };
  
  // Handle form field changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRoleFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Add a permission to selected permissions
  const handleAddPermission = (resource: string, action: string) => {
    // Check if permission already exists
    const exists = selectedPermissions.some(
      p => p.resource === resource && p.action === action
    );
    
    if (!exists) {
      const newPermission: Permission = {
        resource,
        action,
        description: `${resource}:${action}`
      };
      
      setSelectedPermissions(prev => [...prev, newPermission]);
    }
  };
  
  // Remove a permission from selected permissions
  const handleRemovePermission = (index: number) => {
    setSelectedPermissions(prev => prev.filter((_, i) => i !== index));
  };
  
  // Save role (create or update)
  const handleSaveRole = async () => {
    try {
      const payload = {
        ...roleFormData,
        permissions: selectedPermissions
      };
      
      let url = '/api/roles';
      let method = 'POST';
      
      if (selectedRole) {
        url = `/api/roles/${selectedRole.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${selectedRole ? 'update' : 'create'} role`);
      }
      
      toast({
        title: selectedRole ? 'Role updated' : 'Role created',
        description: `${roleFormData.name} has been ${selectedRole ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Refresh roles
      fetchRoles();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  // Delete a role
  const handleDeleteRole = async (role: Role) => {
    if (role.isBuiltIn) {
      toast({
        title: 'Cannot delete built-in role',
        description: 'System-defined roles cannot be deleted',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      try {
        const response = await fetch(`/api/roles/${role.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete role');
        }
        
        toast({
          title: 'Role deleted',
          description: `${role.name} has been deleted successfully`,
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        
        // Refresh roles
        fetchRoles();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    }
  };
  
  // Filter roles by type
  const filteredRoles = roles.filter(role => {
    if (!showBuiltInRoles && role.isBuiltIn) {
      return false;
    }
    return true;
  });
  
  // Group roles by scope
  const groupedRoles = {
    system: filteredRoles.filter(role => role.scope === 'system'),
    organization: filteredRoles.filter(role => role.scope === 'organization'),
    custom: filteredRoles.filter(role => role.scope === 'organization' && !role.isBuiltIn)
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Role Management</Heading>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="blue"
          onClick={() => handleOpenRoleModal()}
        >
          Create Role
        </Button>
      </Flex>
      
      {isLoading ? (
        <Stack spacing={4}>
          <Skeleton height="50px" />
          <Skeleton height="50px" />
          <Skeleton height="50px" />
        </Stack>
      ) : (
        <VStack spacing={6} align="stretch">
          {/* Custom Roles */}
          <Card>
            <CardHeader bg={headerBgColor} py={3}>
              <HStack>
                <Shield size={18} />
                <Heading size="sm">Custom Roles</Heading>
              </HStack>
            </CardHeader>
            <CardBody p={0}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Permissions</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {groupedRoles.custom.length === 0 ? (
                    <Tr>
                      <Td colSpan={4} textAlign="center" py={4}>
                        <Text color="gray.500">No custom roles found</Text>
                      </Td>
                    </Tr>
                  ) : (
                    groupedRoles.custom.map(role => (
                      <Tr key={role.id}>
                        <Td fontWeight="medium">{role.name}</Td>
                        <Td fontSize="sm">{role.description}</Td>
                        <Td>
                          <Flex flexWrap="wrap" gap={2}>
                            {role.permissions.slice(0, 3).map((perm, index) => (
                              <Tag key={index} size="sm" variant="subtle" colorScheme="blue">
                                <TagLabel>
                                  {perm.resource}:{perm.action}
                                </TagLabel>
                              </Tag>
                            ))}
                            {role.permissions.length > 3 && (
                              <Tag size="sm" variant="subtle" colorScheme="gray">
                                <TagLabel>+{role.permissions.length - 3} more</TagLabel>
                              </Tag>
                            )}
                          </Flex>
                        </Td>
                        <Td>
                          <HStack>
                            <IconButton
                              aria-label="Edit role"
                              icon={<Edit size={16} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenRoleModal(role)}
                            />
                            <IconButton
                              aria-label="Delete role"
                              icon={<Trash size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteRole(role)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
          
          {/* System Roles */}
          {showBuiltInRoles && (
            <Card>
              <CardHeader bg={headerBgColor} py={3}>
                <HStack>
                  <Shield size={18} />
                  <Heading size="sm">System Roles</Heading>
                </HStack>
              </CardHeader>
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Description</Th>
                      <Th>Permissions</Th>
                      <Th>Type</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {groupedRoles.system.map(role => (
                      <Tr key={role.id}>
                        <Td fontWeight="medium">{role.name}</Td>
                        <Td fontSize="sm">{role.description}</Td>
                        <Td>
                          <Flex flexWrap="wrap" gap={2}>
                            {role.permissions.slice(0, 3).map((perm, index) => (
                              <Tag key={index} size="sm" variant="subtle" colorScheme="purple">
                                <TagLabel>
                                  {perm.resource}:{perm.action}
                                </TagLabel>
                              </Tag>
                            ))}
                            {role.permissions.length > 3 && (
                              <Tag size="sm" variant="subtle" colorScheme="gray">
                                <TagLabel>+{role.permissions.length - 3} more</TagLabel>
                              </Tag>
                            )}
                          </Flex>
                        </Td>
                        <Td>
                          <Tag size="sm" colorScheme="purple">
                            <TagLabel>System</TagLabel>
                          </Tag>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          )}
        </VStack>
      )}
      
      {/* Create/Edit Role Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedRole ? `Edit Role: ${selectedRole.name}` : 'Create New Role'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Role Name */}
              <FormControl isRequired>
                <FormLabel>Role Name</FormLabel>
                <Input
                  name="name"
                  value={roleFormData.name}
                  onChange={handleFormChange}
                  placeholder="Enter role name"
                />
              </FormControl>
              
              {/* Role Description */}
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={roleFormData.description}
                  onChange={handleFormChange}
                  placeholder="Enter role description"
                />
                <FormHelperText>
                  Describe what this role is used for
                </FormHelperText>
              </FormControl>
              
              {/* Permissions Section */}
              <Box>
                <FormLabel>Permissions</FormLabel>
                
                {/* Permission Selector */}
                {availablePermissions && (
                  <HStack mb={4}>
                    <Select
                      placeholder="Select Resource"
                      id="resource-select"
                    >
                      <option value="*">All Resources (*)</option>
                      {availablePermissions.resources.map(resource => (
                        <option key={resource} value={resource}>
                          {resource}
                        </option>
                      ))}
                    </Select>
                    
                    <Select
                      placeholder="Select Action"
                      id="action-select"
                    >
                      <option value="*">All Actions (*)</option>
                      {availablePermissions.actions.map(action => (
                        <option key={action} value={action}>
                          {action}
                        </option>
                      ))}
                    </Select>
                    
                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        const resourceSelect = document.getElementById('resource-select') as HTMLSelectElement;
                        const actionSelect = document.getElementById('action-select') as HTMLSelectElement;
                        
                        if (resourceSelect?.value && actionSelect?.value) {
                          handleAddPermission(resourceSelect.value, actionSelect.value);
                        }
                      }}
                    >
                      Add
                    </Button>
                  </HStack>
                )}
                
                {/* Selected Permissions List */}
                <Box
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  p={3}
                  maxH="200px"
                  overflowY="auto"
                >
                  {selectedPermissions.length === 0 ? (
                    <Text color="gray.500" textAlign="center">
                      No permissions selected
                    </Text>
                  ) : (
                    <VStack align="stretch" spacing={2}>
                      {selectedPermissions.map((permission, index) => (
                        <Flex
                          key={index}
                          justify="space-between"
                          align="center"
                          p={2}
                          bg={useColorModeValue('gray.50', 'gray.700')}
                          borderRadius="md"
                        >
                          <Text fontSize="sm">
                            {permission.resource}:{permission.action}
                          </Text>
                          <IconButton
                            aria-label="Remove permission"
                            icon={<Trash size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleRemovePermission(index)}
                          />
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </Box>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveRole}>
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RoleManagement;