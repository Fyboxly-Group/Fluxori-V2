import { useState } from 'react';
import {
  Box,
  Tabs,
  Group,
  Title,
  Modal
} from '@mantine/core';
import {
  IconUsers,
  IconShield,
  IconClipboardList,
  IconBuildingCommunity
} from '@tabler/icons-react';
import { UserList } from './UserList';
import { UserForm } from './UserForm';
import { RoleManagement } from './RoleManagement';
import { ActivityLog } from './ActivityLog';
import { OrganizationSettings } from './OrganizationSettings';
import { User } from '@/types/user-management';

export function UserManagement() {
  const [activeTab, setActiveTab] = useState<string | null>('users');
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [inviteUserModalOpen, setInviteUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Handle edit user button click
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserModalOpen(true);
  };
  
  // Handle invite user button click
  const handleInviteUser = () => {
    setSelectedUser(null);
    setInviteUserModalOpen(true);
  };
  
  // Handle form submission
  const handleFormSubmit = (values: any) => {
    console.log('Form submitted:', values);
    
    // Close the modal
    setEditUserModalOpen(false);
    setInviteUserModalOpen(false);
  };
  
  return (
    <Box>
      <Title order={2} mb="xl">User Management</Title>
      
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List mb="xl">
          <Tabs.Tab value="users" icon={<IconUsers size={16} />}>Users</Tabs.Tab>
          <Tabs.Tab value="roles" icon={<IconShield size={16} />}>Roles</Tabs.Tab>
          <Tabs.Tab value="activity" icon={<IconClipboardList size={16} />}>Activity Log</Tabs.Tab>
          <Tabs.Tab value="organization" icon={<IconBuildingCommunity size={16} />}>Organization</Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="users">
          <UserList 
            onEditUser={handleEditUser} 
            onInviteUser={handleInviteUser}
          />
        </Tabs.Panel>
        
        <Tabs.Panel value="roles">
          <RoleManagement />
        </Tabs.Panel>
        
        <Tabs.Panel value="activity">
          <ActivityLog />
        </Tabs.Panel>
        
        <Tabs.Panel value="organization">
          <OrganizationSettings />
        </Tabs.Panel>
      </Tabs>
      
      {/* Edit User Modal */}
      <Modal
        opened={editUserModalOpen}
        onClose={() => setEditUserModalOpen(false)}
        title={<Title order={3}>Edit User</Title>}
        size="xl"
        scrollAreaComponent={Box}
      >
        <UserForm 
          user={selectedUser || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setEditUserModalOpen(false)}
        />
      </Modal>
      
      {/* Invite User Modal */}
      <Modal
        opened={inviteUserModalOpen}
        onClose={() => setInviteUserModalOpen(false)}
        title={<Title order={3}>Invite New User</Title>}
        size="xl"
        scrollAreaComponent={Box}
      >
        <UserForm 
          isCreating
          onSubmit={handleFormSubmit}
          onCancel={() => setInviteUserModalOpen(false)}
        />
      </Modal>
    </Box>
  );
}