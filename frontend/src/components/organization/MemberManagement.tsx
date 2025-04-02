import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  IconButton,
  Avatar,
  Flex,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@/utils/chakra-compat';
import { useOrganization } from '@/context/OrganizationContext';
import { createMutationWithToast, createQueryWithToast } from '@/utils/query.utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronDown, Mail, MoreVertical, UserPlus, X } from 'lucide-react';

interface MemberManagementProps {
  organizationId: string;
}

interface Member {
  id: string;
  userId: string;
  organizationId: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
  status: string;
  type: string;
  roles: string[];
  isDefault: boolean;
  joinedAt?: string;
  lastAccessedAt?: string;
}

interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  status: string;
  type: string;
  roles: string[];
  token: string;
  invitedBy: string;
  invitedByUser?: {
    id: string;
    displayName?: string;
    email: string;
  };
  message?: string;
  expiresAt: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
  isDefault: boolean;
}

const memberTypeLabels: Record<string, { label: string; color: string }> = {
  OWNER: { label: 'Owner', color: 'purple' },
  ADMIN: { label: 'Admin', color: 'red' },
  MEMBER: { label: 'Member', color: 'blue' },
  GUEST: { label: 'Guest', color: 'gray' },
};

const memberStatusLabels: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'green' },
  INVITED: { label: 'Invited', color: 'yellow' },
  SUSPENDED: { label: 'Suspended', color: 'orange' },
  REMOVED: { label: 'Removed', color: 'red' },
};

const MemberManagement: React.FC<MemberManagementProps> = ({ organizationId }) => {
  const toast = useToast();
  const { currentOrganization } = useOrganization();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Invitation modal
  const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    type: 'MEMBER',
    roles: [''],
    message: '',
  });
  
  // Member action modal
  const { isOpen: isMemberActionOpen, onOpen: onMemberActionOpen, onClose: onMemberActionClose } = useDisclosure();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    type: '',
    roles: [''],
  });
  
  // Delete confirmation dialog
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const cancelRef = React.useRef(null);

  // Revoke invitation dialog
  const { isOpen: isRevokeOpen, onOpen: onRevokeOpen, onClose: onRevokeClose } = useDisclosure();
  const [invitationToRevoke, setInvitationToRevoke] = useState<Invitation | null>(null);

  // Fetch members, invitations, and roles
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [membersRes, invitationsRes, rolesRes] = await Promise.all([
          axios.get(`/api/organizations/${organizationId}/members`),
          axios.get(`/api/memberships/invitations?organizationId=${organizationId}`),
          axios.get('/api/roles')
        ]);
        
        setMembers(membersRes.data);
        setInvitations(invitationsRes.data);
        setRoles(rolesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load members and invitations',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [organizationId, toast]);

  // Set up the member action modal when a member is selected
  useEffect(() => {
    if (selectedMember) {
      setMemberFormData({
        type: selectedMember.type,
        roles: selectedMember.roles || [''],
      });
    }
  }, [selectedMember]);

  const handleInviteInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInviteFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (index: number, value: string) => {
    setInviteFormData(prev => {
      const updatedRoles = [...prev.roles];
      updatedRoles[index] = value;
      return { ...prev, roles: updatedRoles };
    });
  };

  const addRoleField = () => {
    setInviteFormData(prev => ({
      ...prev,
      roles: [...prev.roles, ''],
    }));
  };

  const removeRoleField = (index: number) => {
    setInviteFormData(prev => {
      if (prev.roles.length <= 1) return prev;
      const updatedRoles = [...prev.roles];
      updatedRoles.splice(index, 1);
      return { ...prev, roles: updatedRoles };
    });
  };

  const handleMemberRoleChange = (index: number, value: string) => {
    setMemberFormData(prev => {
      const updatedRoles = [...prev.roles];
      updatedRoles[index] = value;
      return { ...prev, roles: updatedRoles };
    });
  };

  const addMemberRoleField = () => {
    setMemberFormData(prev => ({
      ...prev,
      roles: [...prev.roles, ''],
    }));
  };

  const removeMemberRoleField = (index: number) => {
    setMemberFormData(prev => {
      if (prev.roles.length <= 1) return prev;
      const updatedRoles = [...prev.roles];
      updatedRoles.splice(index, 1);
      return { ...prev, roles: updatedRoles };
    });
  };

  const handleSendInvitation = async () => {
    try {
      // Filter out empty roles
      const filteredRoles = inviteFormData.roles.filter(role => role);
      
      await axios.post('/api/memberships/invite', {
        email: inviteFormData.email,
        organizationId,
        type: inviteFormData.type,
        roles: filteredRoles,
        message: inviteFormData.message || undefined,
      });
      
      // Fetch updated invitations
      const response = await axios.get(`/api/memberships/invitations?organizationId=${organizationId}`);
      setInvitations(response.data);
      
      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${inviteFormData.email}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form and close modal
      setInviteFormData({
        email: '',
        type: 'MEMBER',
        roles: [''],
        message: '',
      });
      onInviteClose();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;
    
    try {
      // Filter out empty roles
      const filteredRoles = memberFormData.roles.filter(role => role);
      
      // Update member type if changed
      if (memberFormData.type !== selectedMember.type) {
        await axios.patch(`/api/memberships/users/${selectedMember.userId}/type`, {
          organizationId,
          type: memberFormData.type,
        });
      }
      
      // Update roles
      await axios.post(`/api/memberships/users/${selectedMember.userId}/roles`, {
        organizationId,
        roles: filteredRoles,
      });
      
      // Fetch updated members
      const response = await axios.get(`/api/organizations/${organizationId}/members`);
      setMembers(response.data);
      
      toast({
        title: 'Member updated',
        description: `${selectedMember.user.email}'s membership has been updated`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onMemberActionClose();
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      await axios.delete(`/api/memberships/users/${memberToRemove.userId}`, {
        data: { organizationId },
      });
      
      // Fetch updated members
      const response = await axios.get(`/api/organizations/${organizationId}/members`);
      setMembers(response.data);
      
      toast({
        title: 'Member removed',
        description: `${memberToRemove.user.email} has been removed from the organization`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onDeleteClose();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRevokeInvitation = async () => {
    if (!invitationToRevoke) return;
    
    try {
      await axios.delete(`/api/memberships/invitations/${invitationToRevoke.id}`);
      
      // Fetch updated invitations
      const response = await axios.get(`/api/memberships/invitations?organizationId=${organizationId}`);
      setInvitations(response.data);
      
      toast({
        title: 'Invitation revoked',
        description: `Invitation to ${invitationToRevoke.email} has been revoked`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onRevokeClose();
    } catch (error) {
      console.error('Error revoking invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke invitation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      await axios.post(`/api/memberships/invitations/${invitation.id}/resend`);
      
      toast({
        title: 'Invitation resent',
        description: `Invitation to ${invitation.email} has been resent`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openMemberActionModal = (member: Member) => {
    setSelectedMember(member);
    onMemberActionOpen();
  };

  const openDeleteModal = (member: Member) => {
    setMemberToRemove(member);
    onDeleteOpen();
  };

  const openRevokeModal = (invitation: Invitation) => {
    setInvitationToRevoke(invitation);
    onRevokeOpen();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if the current user is an owner or admin
  const canManageMembers = true; // Replace with actual permission check

  return (
    <Box>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Members ({members.length})</Tab>
          <Tab>Pending Invitations ({invitations.length})</Tab>
        </TabList>

        <TabPanels>
          {/* Members Tab */}
          <TabPanel p={0} pt={4}>
            <Card>
              <CardHeader display="flex" justifyContent="space-between" alignItems="center">
                <Heading size="md">Organization Members</Heading>
                {canManageMembers && (
                  <Button
                    leftIcon={<UserPlus size={16} />}
                    colorScheme="blue"
                    onClick={onInviteOpen}
                    size="sm"
                  >
                    Invite Member
                  </Button>
                )}
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" my={8}>
                    <Spinner />
                  </Flex>
                ) : members.length === 0 ? (
                  <Text textAlign="center" color="gray.500" py={8}>
                    No members found
                  </Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>User</Th>
                        <Th>Type</Th>
                        <Th>Status</Th>
                        <Th>Roles</Th>
                        <Th>Joined</Th>
                        <Th>Last Active</Th>
                        {canManageMembers && <Th width="60px"></Th>}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {members.map((member) => {
                        const typeInfo = memberTypeLabels[member.type] || { label: member.type, color: 'gray' };
                        const statusInfo = memberStatusLabels[member.status] || { label: member.status, color: 'gray' };
                        
                        return (
                          <Tr key={member.id}>
                            <Td>
                              <HStack spacing={3}>
                                <Avatar
                                  size="sm"
                                  name={member.user.displayName || member.user.email}
                                  src={member.user.photoURL}
                                />
                                <Box>
                                  {member.user.displayName && (
                                    <Text fontWeight="medium">{member.user.displayName}</Text>
                                  )}
                                  <Text fontSize="sm" color="gray.600">
                                    {member.user.email}
                                  </Text>
                                </Box>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge colorScheme={typeInfo.color}>{typeInfo.label}</Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={statusInfo.color}>{statusInfo.label}</Badge>
                            </Td>
                            <Td>
                              {member.roles && member.roles.length > 0 ? (
                                <HStack spacing={1} flexWrap="wrap">
                                  {member.roles.map((roleId, index) => {
                                    const role = roles.find(r => r.id === roleId);
                                    return (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        colorScheme="blue"
                                        mb={1}
                                      >
                                        {role?.name || roleId}
                                      </Badge>
                                    );
                                  })}
                                </HStack>
                              ) : (
                                <Text fontSize="sm" color="gray.500">No roles</Text>
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="sm">{formatDate(member.joinedAt)}</Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm">{formatDate(member.lastAccessedAt)}</Text>
                            </Td>
                            {canManageMembers && (
                              <Td>
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    aria-label="Options"
                                    icon={<MoreVertical size={16} />}
                                    variant="ghost"
                                    size="sm"
                                    isDisabled={member.type === 'OWNER'}
                                  />
                                  <MenuList>
                                    <MenuItem onClick={() => openMemberActionModal(member)}>
                                      Edit member
                                    </MenuItem>
                                    <MenuItem
                                      color="red.500"
                                      onClick={() => openDeleteModal(member)}
                                    >
                                      Remove member
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </Td>
                            )}
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Invitations Tab */}
          <TabPanel p={0} pt={4}>
            <Card>
              <CardHeader display="flex" justifyContent="space-between" alignItems="center">
                <Heading size="md">Pending Invitations</Heading>
                {canManageMembers && (
                  <Button
                    leftIcon={<UserPlus size={16} />}
                    colorScheme="blue"
                    onClick={onInviteOpen}
                    size="sm"
                  >
                    Invite Member
                  </Button>
                )}
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" my={8}>
                    <Spinner />
                  </Flex>
                ) : invitations.length === 0 ? (
                  <Text textAlign="center" color="gray.500" py={8}>
                    No pending invitations
                  </Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Email</Th>
                        <Th>Type</Th>
                        <Th>Roles</Th>
                        <Th>Invited By</Th>
                        <Th>Sent</Th>
                        <Th>Expires</Th>
                        {canManageMembers && <Th width="150px"></Th>}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {invitations.map((invitation) => {
                        const typeInfo = memberTypeLabels[invitation.type] || { label: invitation.type, color: 'gray' };
                        const daysUntilExpiry = Math.ceil(
                          (new Date(invitation.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const isExpiringSoon = daysUntilExpiry <= 3;
                        
                        return (
                          <Tr key={invitation.id}>
                            <Td>
                              <Text>{invitation.email}</Text>
                            </Td>
                            <Td>
                              <Badge colorScheme={typeInfo.color}>{typeInfo.label}</Badge>
                            </Td>
                            <Td>
                              {invitation.roles && invitation.roles.length > 0 ? (
                                <HStack spacing={1} flexWrap="wrap">
                                  {invitation.roles.map((roleId, index) => {
                                    const role = roles.find(r => r.id === roleId);
                                    return (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        colorScheme="blue"
                                        mb={1}
                                      >
                                        {role?.name || roleId}
                                      </Badge>
                                    );
                                  })}
                                </HStack>
                              ) : (
                                <Text fontSize="sm" color="gray.500">No roles</Text>
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                {invitation.invitedByUser?.displayName || invitation.invitedByUser?.email || invitation.invitedBy}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm">{formatDate(invitation.createdAt)}</Text>
                            </Td>
                            <Td>
                              <Text
                                fontSize="sm"
                                color={isExpiringSoon ? 'orange.500' : undefined}
                              >
                                {formatDate(invitation.expiresAt)}
                                {isExpiringSoon && ` (${daysUntilExpiry} days)`}
                              </Text>
                            </Td>
                            {canManageMembers && (
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="Resend Invitation">
                                    <IconButton
                                      aria-label="Resend invitation"
                                      icon={<Mail size={16} />}
                                      size="sm"
                                      onClick={() => handleResendInvitation(invitation)}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Revoke Invitation">
                                    <IconButton
                                      aria-label="Revoke invitation"
                                      icon={<X size={16} />}
                                      size="sm"
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => openRevokeModal(invitation)}
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                            )}
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteOpen} onClose={onInviteClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite New Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl id="email" isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={inviteFormData.email}
                  onChange={handleInviteInputChange}
                />
              </FormControl>
              
              <FormControl id="type">
                <FormLabel>Membership Type</FormLabel>
                <Select
                  name="type"
                  value={inviteFormData.type}
                  onChange={handleInviteInputChange}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  {currentOrganization?.ownerId === 'current-user-id' && (
                    <option value="OWNER">Owner</option>
                  )}
                  <option value="GUEST">Guest</option>
                </Select>
              </FormControl>
              
              <FormControl id="roles">
                <FormLabel>Roles</FormLabel>
                <VStack spacing={2} align="stretch">
                  {inviteFormData.roles.map((role, index) => (
                    <HStack key={index}>
                      <Select
                        value={role}
                        onChange={(e) => handleRoleChange(index, e.target.value)}
                      >
                        <option value="">Select Role</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </Select>
                      <IconButton
                        aria-label="Remove role"
                        icon={<X size={16} />}
                        onClick={() => removeRoleField(index)}
                        isDisabled={inviteFormData.roles.length <= 1}
                        size="sm"
                      />
                    </HStack>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addRoleField}
                  >
                    Add Role
                  </Button>
                </VStack>
              </FormControl>
              
              <FormControl id="message">
                <FormLabel>Personal Message (Optional)</FormLabel>
                <Input
                  as="textarea"
                  name="message"
                  placeholder="Add a personal message to the invitation email"
                  value={inviteFormData.message}
                  onChange={handleInviteInputChange}
                  height="100px"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onInviteClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSendInvitation}
              isDisabled={!inviteFormData.email}
            >
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Member Modal */}
      <Modal isOpen={isMemberActionOpen} onClose={onMemberActionClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMember && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={3}>
                  <Avatar
                    size="md"
                    name={selectedMember.user.displayName || selectedMember.user.email}
                    src={selectedMember.user.photoURL}
                  />
                  <Box>
                    {selectedMember.user.displayName && (
                      <Text fontWeight="medium">{selectedMember.user.displayName}</Text>
                    )}
                    <Text fontSize="sm" color="gray.600">
                      {selectedMember.user.email}
                    </Text>
                  </Box>
                </HStack>
                
                <FormControl id="type">
                  <FormLabel>Membership Type</FormLabel>
                  <Select
                    name="type"
                    value={memberFormData.type}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    {currentOrganization?.ownerId === 'current-user-id' && (
                      <option value="OWNER">Owner</option>
                    )}
                    <option value="GUEST">Guest</option>
                  </Select>
                </FormControl>
                
                <FormControl id="roles">
                  <FormLabel>Roles</FormLabel>
                  <VStack spacing={2} align="stretch">
                    {memberFormData.roles.map((role, index) => (
                      <HStack key={index}>
                        <Select
                          value={role}
                          onChange={(e) => handleMemberRoleChange(index, e.target.value)}
                        >
                          <option value="">Select Role</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </Select>
                        <IconButton
                          aria-label="Remove role"
                          icon={<X size={16} />}
                          onClick={() => removeMemberRoleField(index)}
                          isDisabled={memberFormData.roles.length <= 1}
                          size="sm"
                        />
                      </HStack>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addMemberRoleField}
                    >
                      Add Role
                    </Button>
                  </VStack>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMemberActionClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateMember}
            >
              Update Member
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Remove Member Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remove Member
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to remove{' '}
              <Text as="span" fontWeight="bold">
                {memberToRemove?.user.email}
              </Text>{' '}
              from this organization? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleRemoveMember} ml={3}>
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Revoke Invitation Confirmation */}
      <AlertDialog
        isOpen={isRevokeOpen}
        leastDestructiveRef={cancelRef}
        onClose={onRevokeClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Revoke Invitation
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to revoke the invitation sent to{' '}
              <Text as="span" fontWeight="bold">
                {invitationToRevoke?.email}
              </Text>
              ? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRevokeClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleRevokeInvitation} ml={3}>
                Revoke
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default MemberManagement;