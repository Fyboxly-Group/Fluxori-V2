import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Text,
  Group,
  Button,
  Badge,
  Card,
  Grid,
  Title,
  Checkbox,
  TextInput,
  Textarea,
  Divider,
  Modal,
  SimpleGrid,
  Skeleton,
  ActionIcon,
  Menu
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconUsers,
  IconDots,
  IconCopy
} from '@tabler/icons-react';
import { useRoles } from '@/hooks/user-management/useRoles';
import { Role, Permission, PermissionScope, PermissionAction } from '@/types/user-management';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

export function RoleManagement() {
  const {
    roles,
    isLoading,
    error,
    availableScopes,
    availableActions,
    selectedRole,
    setSelectedRole,
    createRole,
    updateRole,
    deleteRole,
    createPermissionMatrix,
    matrixToPermissions,
    getDefaultRoles
  } = useRoles();
  
  const [permissionMatrix, setPermissionMatrix] = useState<Record<PermissionScope, Record<PermissionAction, boolean>>>({} as any);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const rolesListRef = useRef<HTMLDivElement>(null);
  const permissionsGridRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Initialize permission matrix when selected role changes
  useEffect(() => {
    if (selectedRole) {
      const matrix = createPermissionMatrix(selectedRole);
      setPermissionMatrix(matrix);
      setRoleName(selectedRole.name);
      setRoleDescription(selectedRole.description);
    } else {
      // Reset when no role is selected
      const emptyMatrix: Record<PermissionScope, Record<PermissionAction, boolean>> = {} as any;
      
      for (const scope of availableScopes) {
        emptyMatrix[scope] = {} as any;
        
        for (const action of availableActions) {
          emptyMatrix[scope][action] = false;
        }
      }
      
      setPermissionMatrix(emptyMatrix);
      setRoleName('');
      setRoleDescription('');
    }
  }, [selectedRole, createPermissionMatrix, availableScopes, availableActions]);
  
  // Handle permission checkbox toggle
  const handlePermissionToggle = (scope: PermissionScope, action: PermissionAction) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        [action]: !prev[scope][action]
      }
    }));
  };
  
  // Toggle all permissions for a scope
  const toggleScopePermissions = (scope: PermissionScope, value: boolean) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [scope]: Object.fromEntries(availableActions.map(action => [action, value]))
    }));
  };
  
  // Toggle all scopes for an action
  const toggleActionPermissions = (action: PermissionAction, value: boolean) => {
    const newMatrix = { ...permissionMatrix };
    
    for (const scope of availableScopes) {
      newMatrix[scope] = {
        ...newMatrix[scope],
        [action]: value
      };
    }
    
    setPermissionMatrix(newMatrix);
  };
  
  // Save role changes
  const saveRoleChanges = async () => {
    if (!roleName.trim()) {
      // Handle validation error
      console.error('Role name is required');
      return;
    }
    
    const permissions = matrixToPermissions(permissionMatrix);
    
    if (isCreateMode) {
      const success = await createRole(roleName, roleDescription, permissions);
      if (success) {
        setIsCreateMode(false);
        setSelectedRole(null);
      }
    } else if (selectedRole) {
      const success = await updateRole(selectedRole.id, {
        name: roleName,
        description: roleDescription,
        permissions
      });
      if (success) {
        setIsEditMode(false);
      }
    }
  };
  
  // Cancel edit mode
  const cancelChanges = () => {
    if (isCreateMode) {
      setIsCreateMode(false);
      setSelectedRole(null);
    } else {
      setIsEditMode(false);
      
      // Reset to original values
      if (selectedRole) {
        const matrix = createPermissionMatrix(selectedRole);
        setPermissionMatrix(matrix);
        setRoleName(selectedRole.name);
        setRoleDescription(selectedRole.description);
      }
    }
  };
  
  // Start creating a new role
  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsCreateMode(true);
    setIsEditMode(true);
    setRoleName('New Role');
    setRoleDescription('');
    
    // Initialize empty permission matrix
    const emptyMatrix: Record<PermissionScope, Record<PermissionAction, boolean>> = {} as any;
    
    for (const scope of availableScopes) {
      emptyMatrix[scope] = {} as any;
      
      for (const action of availableActions) {
        emptyMatrix[scope][action] = false;
      }
    }
    
    setPermissionMatrix(emptyMatrix);
  };
  
  // Handle role selection
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditMode(false);
    setIsCreateMode(false);
  };
  
  // Confirm delete role
  const confirmDeleteRole = async () => {
    if (selectedRole) {
      const success = await deleteRole(selectedRole.id);
      if (success) {
        setSelectedRole(null);
        setShowConfirmDelete(false);
      }
    }
  };
  
  // Apply a template (admin, manager, etc.)
  const applyTemplate = (templateName: 'admin' | 'manager' | 'user' | 'guest') => {
    const templates = getDefaultRoles();
    const templatePermissions = templates[templateName];
    
    // Create a new matrix from the template
    const newMatrix: Record<PermissionScope, Record<PermissionAction, boolean>> = {} as any;
    
    for (const scope of availableScopes) {
      newMatrix[scope] = {} as any;
      
      for (const action of availableActions) {
        // Check if the template has this permission
        const hasPermission = templatePermissions.some(p => 
          p.scope === scope && p.actions.includes(action)
        );
        
        newMatrix[scope][action] = hasPermission;
      }
    }
    
    setPermissionMatrix(newMatrix);
  };
  
  // Clone selected role
  const handleCloneRole = () => {
    if (selectedRole) {
      setIsCreateMode(true);
      setIsEditMode(true);
      setRoleName(`${selectedRole.name} (Copy)`);
      setRoleDescription(selectedRole.description);
      // Keep the current permission matrix
    }
  };
  
  // Animate roles list
  useEffect(() => {
    if (rolesListRef.current && motionLevel !== 'minimal' && !isLoading) {
      const roleCards = rolesListRef.current.querySelectorAll('.role-card');
      
      gsap.fromTo(
        roleCards,
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    }
  }, [roles, isLoading, motionLevel]);
  
  // Animate permissions grid when changing roles
  useEffect(() => {
    if (permissionsGridRef.current && motionLevel !== 'minimal' && selectedRole) {
      const checkboxes = permissionsGridRef.current.querySelectorAll('.permission-checkbox');
      
      gsap.fromTo(
        checkboxes,
        { opacity: 0, scale: 0.8 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.3, 
          stagger: { 
            amount: 0.5, 
            grid: 'auto', 
            from: 'start' 
          }, 
          ease: 'power2.out' 
        }
      );
    }
  }, [selectedRole, motionLevel]);
  
  return (
    <Box>
      <Group position="apart" mb="md">
        <Title order={2}>Role Management</Title>
        <Button 
          leftIcon={<IconPlus size={16} />}
          onClick={handleCreateRole}
        >
          Create Role
        </Button>
      </Group>
      
      <Grid>
        <Grid.Col span={4}>
          <Card p="md" withBorder>
            <Text weight={500} mb="md">Roles</Text>
            
            <Box ref={rolesListRef}>
              {isLoading ? (
                <div>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} height={60} mb="sm" />
                  ))}
                </div>
              ) : error ? (
                <Text color="red">Error: {error}</Text>
              ) : roles.length === 0 ? (
                <Text color="dimmed">No roles defined.</Text>
              ) : (
                <div>
                  {roles.map((role) => (
                    <Card
                      key={role.id}
                      p="sm"
                      mb="sm"
                      withBorder
                      className="role-card"
                      style={{
                        cursor: 'pointer',
                        border: selectedRole?.id === role.id ? '2px solid var(--mantine-primary-color)' : undefined
                      }}
                      onClick={() => handleSelectRole(role)}
                    >
                      <Group position="apart">
                        <div>
                          <Group spacing={8}>
                            <Text weight={500}>{role.name}</Text>
                            {role.isSystem && (
                              <Badge size="xs" variant="outline">System</Badge>
                            )}
                          </Group>
                          <Text size="xs" color="dimmed">{role.permissions.length} permissions</Text>
                        </div>
                        
                        <Menu position="bottom-end" withinPortal>
                          <Menu.Target>
                            <ActionIcon 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectRole(role);
                              }}
                            >
                              <IconDots size={14} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item 
                              icon={<IconEdit size={14} />}
                              onClick={() => {
                                handleSelectRole(role);
                                setIsEditMode(true);
                              }}
                            >
                              Edit Role
                            </Menu.Item>
                            <Menu.Item 
                              icon={<IconCopy size={14} />}
                              onClick={() => {
                                handleSelectRole(role);
                                handleCloneRole();
                              }}
                            >
                              Clone Role
                            </Menu.Item>
                            <Menu.Item 
                              icon={<IconUsers size={14} />}
                            >
                              Assign Users
                            </Menu.Item>
                            
                            {!role.isSystem && (
                              <>
                                <Menu.Divider />
                                <Menu.Item 
                                  icon={<IconTrash size={14} />}
                                  color="red"
                                  onClick={() => {
                                    handleSelectRole(role);
                                    setShowConfirmDelete(true);
                                  }}
                                >
                                  Delete Role
                                </Menu.Item>
                              </>
                            )}
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Card>
                  ))}
                </div>
              )}
            </Box>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={8}>
          <Card p="md" withBorder>
            {selectedRole || isCreateMode ? (
              <>
                <Group position="apart" mb="md">
                  <div>
                    {isEditMode ? (
                      <TextInput
                        placeholder="Role Name"
                        value={roleName}
                        onChange={(e) => setRoleName(e.currentTarget.value)}
                        required
                        mb="xs"
                      />
                    ) : (
                      <Text weight={500} size="lg">
                        {selectedRole?.name}
                        {selectedRole?.isSystem && (
                          <Badge ml="xs" size="sm" variant="outline">System Role</Badge>
                        )}
                      </Text>
                    )}
                    
                    {isEditMode ? (
                      <Textarea
                        placeholder="Role Description"
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.currentTarget.value)}
                        minRows={2}
                        mb="xs"
                      />
                    ) : (
                      <Text color="dimmed" size="sm">{selectedRole?.description}</Text>
                    )}
                  </div>
                  
                  {isEditMode ? (
                    <Group>
                      <Button variant="default" leftIcon={<IconX size={16} />} onClick={cancelChanges}>
                        Cancel
                      </Button>
                      <Button leftIcon={<IconCheck size={16} />} onClick={saveRoleChanges}>
                        {isCreateMode ? 'Create Role' : 'Save Changes'}
                      </Button>
                    </Group>
                  ) : (
                    <Group>
                      <Button 
                        variant="light" 
                        leftIcon={<IconEdit size={16} />}
                        onClick={() => setIsEditMode(true)}
                      >
                        Edit Role
                      </Button>
                    </Group>
                  )}
                </Group>
                
                {isEditMode && (
                  <Card p="xs" withBorder mb="md">
                    <Group position="apart">
                      <Text weight={500} size="sm">Apply Template</Text>
                      <Group>
                        <Button size="xs" variant="light" onClick={() => applyTemplate('admin')}>Admin</Button>
                        <Button size="xs" variant="light" onClick={() => applyTemplate('manager')}>Manager</Button>
                        <Button size="xs" variant="light" onClick={() => applyTemplate('user')}>User</Button>
                        <Button size="xs" variant="light" onClick={() => applyTemplate('guest')}>Guest</Button>
                      </Group>
                    </Group>
                  </Card>
                )}
                
                <Divider my="md" />
                
                <Text weight={500} mb="md">Permissions</Text>
                
                <Grid mb="xs">
                  <Grid.Col span={3}></Grid.Col>
                  {availableActions.map((action) => (
                    <Grid.Col span={2} key={action}>
                      <Text align="center" weight={500} size="sm" style={{ textTransform: 'capitalize' }}>
                        {action}
                      </Text>
                      {isEditMode && (
                        <Group position="center" mt={5}>
                          <Checkbox
                            size="xs"
                            onChange={(e) => toggleActionPermissions(action, e.currentTarget.checked)}
                            checked={availableScopes.every(scope => permissionMatrix[scope]?.[action])}
                            indeterminate={
                              availableScopes.some(scope => permissionMatrix[scope]?.[action]) &&
                              !availableScopes.every(scope => permissionMatrix[scope]?.[action])
                            }
                          />
                        </Group>
                      )}
                    </Grid.Col>
                  ))}
                </Grid>
                
                <Card p={0} withBorder>
                  <SimpleGrid cols={1} spacing={0} ref={permissionsGridRef}>
                    {availableScopes.map((scope) => (
                      <Box
                        key={scope}
                        p="xs"
                        style={(theme) => ({
                          borderBottom: `1px solid ${
                            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
                          }`
                        })}
                      >
                        <Grid align="center">
                          <Grid.Col span={3}>
                            <Group spacing={10}>
                              <Text weight={500} size="sm" style={{ textTransform: 'capitalize' }}>
                                {scope.replace('_', ' ')}
                              </Text>
                              {isEditMode && (
                                <Checkbox
                                  size="xs"
                                  onChange={(e) => toggleScopePermissions(scope, e.currentTarget.checked)}
                                  checked={availableActions.every(action => permissionMatrix[scope]?.[action])}
                                  indeterminate={
                                    availableActions.some(action => permissionMatrix[scope]?.[action]) &&
                                    !availableActions.every(action => permissionMatrix[scope]?.[action])
                                  }
                                />
                              )}
                            </Group>
                          </Grid.Col>
                          
                          {availableActions.map((action) => (
                            <Grid.Col span={2} key={action}>
                              <Group position="center">
                                {isEditMode ? (
                                  <Checkbox
                                    checked={permissionMatrix[scope]?.[action] || false}
                                    onChange={() => handlePermissionToggle(scope, action)}
                                    className="permission-checkbox"
                                  />
                                ) : (
                                  permissionMatrix[scope]?.[action] ? (
                                    <IconCheck size={18} color="green" />
                                  ) : (
                                    <IconX size={18} color="red" />
                                  )
                                )}
                              </Group>
                            </Grid.Col>
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Card>
              </>
            ) : (
              <Text color="dimmed" align="center" my="xl">
                Select a role or create a new one to view and edit permissions.
              </Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>
      
      {/* Confirm Delete Modal */}
      <Modal
        opened={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title={<Text weight={700}>Delete Role</Text>}
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be undone.
        </Text>
        
        <Group position="right">
          <Button variant="default" onClick={() => setShowConfirmDelete(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDeleteRole}>
            Delete Role
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}