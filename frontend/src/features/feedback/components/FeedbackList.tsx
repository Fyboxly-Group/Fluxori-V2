/// <reference path="../../types/module-declarations.d.ts" />
'use client';
import React, { useState } from 'react';
import { HStack, VStack  } from '@/utils/chakra-compat';
import { Tag, TagLabel  } from '@/utils/chakra-compat';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer  } from '@/utils/chakra-compat';
import { Menu, MenuButton, MenuList, MenuItem  } from '@/utils/chakra-compat';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@/components/stubs/ChakraStubs';;
import { MoreVertical, AlertTriangle, ExternalLink, Trash2, MessageCircle } from 'lucide-react';
import { 
  Feedback, 
  FeedbackSeverity, 
  FeedbackStatus, 
  FeedbackType, 
  FeedbackCategory
} from '../api/feedback.api';
import { Box  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Button, IconButton  } from '@/utils/chakra-compat';
import { Input  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { Avatar  } from '@/utils/chakra-compat';
import { useFeedback } from '../hooks/useFeedback';
import { useDisclosure } from '@/components/stubs/ChakraStubs';;
import { useToast  } from '@/utils/chakra-compat';


// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

// Badge color helper functions
const getStatusColor = (status: FeedbackStatus) => {
  switch (status) {
    case FeedbackStatus.NEW:
      return 'gray';
    case FeedbackStatus.UNDER_REVIEW:
      return 'purple';
    case FeedbackStatus.IN_PROGRESS:
      return 'blue';
    case FeedbackStatus.COMPLETED:
      return 'green';
    case FeedbackStatus.DECLINED:
      return 'red';
    case FeedbackStatus.PLANNED:
      return 'orange';
    default:
      return 'gray';
  }
};

const getSeverityColor = (severity: FeedbackSeverity) => {
  switch (severity) {
    case FeedbackSeverity.CRITICAL:
      return 'red';
    case FeedbackSeverity.HIGH:
      return 'orange';
    case FeedbackSeverity.MEDIUM:
      return 'yellow';
    case FeedbackSeverity.LOW:
      return 'green';
    default:
      return 'gray';
  }
};

const getTypeColor = (type: FeedbackType) => {
  switch (type) {
    case FeedbackType.BUG:
      return 'red';
    case FeedbackType.FEATURE_REQUEST:
      return 'blue';
    case FeedbackType.USABILITY:
      return 'teal';
    case FeedbackType.PERFORMANCE:
      return 'orange';
    case FeedbackType.GENERAL:
      return 'purple';
    default:
      return 'gray';
  }
};

interface FeedbackViewModalProps {
  feedback: Feedback | null;
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

const FeedbackViewModal: React.FC<FeedbackViewModalProps> = ({ 
  feedback, 
  open, 
  onClose,
  isAdmin = false
}) => {
  const toast = useToast();
  const { updateFeedback } = useFeedback();
  const [adminResponse, setAdminResponse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | ''>('');
  
  const handleUpdateStatus = async () => {
    if (!feedback || !selectedStatus) return;
    
    try {
      await updateFeedback.mutateAsync({
        id: feedback.id,
        data: { status: selectedStatus }
      });
      
      toast({
        title: "Status updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: "Failed to update status",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  const handleSendResponse = async () => {
    if (!feedback || !adminResponse.trim()) return;
    
    try {
      await updateFeedback.mutateAsync({
        id: feedback.id,
        data: { 
          adminResponse: adminResponse.trim(),
          status: !feedback.adminResponse ? FeedbackStatus.UNDER_REVIEW : undefined
        }
      });
      
      toast({
        title: "Response sent successfully",
        status: "success",
        duration: 3000,
        isClosable: true
      });
      
      setAdminResponse('');
    } catch (error) {
      toast({
        title: "Failed to send response",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  if (!feedback) return null;
  
  return (
    <Modal isOpen={open} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Text>{feedback.title}</Text>
            <Badge colorScheme={getStatusColor(feedback.status)}>
              {feedback.status.replace('_', ' ')}
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Flex gap={4} mb={4} flexWrap="wrap">
            <Tag size="md" colorScheme={getTypeColor(feedback.type)}>
              <TagLabel>{feedback.type.replace('_', ' ')}</TagLabel>
            </Tag>
            
            <Tag size="md" colorScheme={getSeverityColor(feedback.severity)}>
              <TagLabel>{feedback.severity}</TagLabel>
            </Tag>
            
            <Tag size="md">
              <TagLabel>{feedback.category.replace('_', ' ')}</TagLabel>
            </Tag>
            
            <Tag size="md" colorScheme="gray">
              <TagLabel>{formatDate(feedback.createdAt)}</TagLabel>
            </Tag>
          </Flex>
          
          <Box mb={4}>
            <Text fontWeight="bold" mb={1}>Description</Text>
            <Box 
              p={3} 
              bg="gray.50"
              borderRadius="md"
              whiteSpace="pre-wrap"
            >
              {feedback.description}
            </Box>
          </Box>
          
          {feedback.screenshotUrl && (
            <Box mb={4}>
              <Text fontWeight="bold" mb={1}>Screenshot</Text>
              <Box maxH="300px" overflow="auto" borderRadius="md">
                <img 
                  src={feedback.screenshotUrl} 
                  alt="Feedback screenshot"
                  style={{ maxWidth: '100%' }} 
                />
              </Box>
            </Box>
          )}
          
          {feedback.systemInfo && (
            <Box mb={4}>
              <Text fontWeight="bold" mb={1}>System Information</Text>
              <Box p={2} bg="gray.50" borderRadius="md" fontSize="sm">
                <Text>Browser: {feedback.systemInfo.browser}</Text>
                <Text>OS: {feedback.systemInfo.os}</Text>
                <Text>Device: {feedback.systemInfo.device}</Text>
                <Text>Viewport: {feedback.systemInfo.viewport}</Text>
                <Text>Path: {feedback.systemInfo.path}</Text>
              </Box>
            </Box>
          )}
          
          {feedback.adminResponse && (
            <Box mb={4} p={3} bg="blue.50" borderRadius="md">
              <Flex align="center" mb={2}>
                <Avatar size="xs" mr={2}                                                                                       />
                <Text fontWeight="bold">Admin Response</Text>
                <Text ml="auto" fontSize="xs" color="gray.600">
                  {formatDate(feedback.adminResponse.respondedAt)}
                </Text>
              </Flex>
              <Text>{feedback.adminResponse.message}</Text>
            </Box>
          )}
          
          {isAdmin && (
            <Box mt={6}>
              <Flex gap={4} mb={3}>
                <Box flex="1">
                  <Text fontWeight="bold" mb={1}>Update Status</Text>
                  <Flex>
                    <Select 
                      placeholder="Select status"
                      value={selectedStatus}
                      onChange={(e: any) => setSelectedStatus(e.target.value as FeedbackStatus)}
                      mr={2}
                    >
                      <option value={FeedbackStatus.NEW}>New</option>
                      <option value={FeedbackStatus.UNDER_REVIEW}>Under Review</option>
                      <option value={FeedbackStatus.IN_PROGRESS}>In Progress</option>
                      <option value={FeedbackStatus.COMPLETED}>Completed</option>
                      <option value={FeedbackStatus.DECLINED}>Declined</option>
                      <option value={FeedbackStatus.PLANNED}>Planned</option>
                    </Select>
                    <Button 
                      disabled={!selectedStatus} 
                      onClick={handleUpdateStatus}
                      loading={updateFeedback.isPending}
                    >
                      Update
                    </Button>
                  </Flex>
                </Box>
              </Flex>
              
              <Box>
                <Text fontWeight="bold" mb={1}>Add Response</Text>
                <Flex direction="column">
                  <Input 
                    placeholder="Enter your response"
                    mb={2}
                    value={adminResponse}
                    onChange={(e: any) => setAdminResponse(e.target.value)}
                  />
                  <Button 
                    colorScheme="blue"
                    alignSelf="flex-end"
                    disabled={!adminResponse.trim()}
                    onClick={handleSendResponse}
                    loading={updateFeedback.isPending}
                    leftIcon={<MessageCircle size={16} />}
                  >
                    Send Response
                  </Button>
                </Flex>
              </Box>
            </Box>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface FeedbackListProps {
  isAdmin?: boolean;
  organizationId?: string;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ 
  isAdmin = false,
  organizationId
}) => {
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { 
    getUserFeedback,
    getAllFeedback,
    getOrganizationFeedback,
    deleteFeedback,
    activeItem,
    setActiveItem
  } = useFeedback();
  
  // Determine which feedback query to use
  const feedbackQuery = isAdmin
    ? organizationId 
      ? getOrganizationFeedback(organizationId)
      : getAllFeedback()
    : getUserFeedback();
  
  // Apply filters
  const filteredFeedback = feedbackQuery.data
    ? feedbackQuery.data.filter(item => {
        // Search filter
        const matchesSearch = searchTerm
          ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
          
        // Type filter
        const matchesType = filterType
          ? item.type === filterType
          : true;
          
        // Status filter
        const matchesStatus = filterStatus
          ? item.status === filterStatus
          : true;
          
        return matchesSearch && matchesType && matchesStatus;
      })
    : [];
  
  const handleViewItem = (item: Feedback) => {
    setActiveItem(item);
    onOpen();
  };
  
  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      try {
        await deleteFeedback.mutateAsync(id);
        toast({
          title: "Feedback deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true
        });
      } catch (error) {
        toast({
          title: "Failed to delete feedback",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }
    }
  };
  
  if (feedbackQuery.isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="lg"                                                                                       />
      </Flex>
    );
  }
  
  if (feedbackQuery.isError) {
    return (
      <Flex 
        justify="center"
        align="center"
        h="200px"
        direction="column"
        color="red.500"
      >
        <AlertTriangle size={40} strokeWidth={1.5} />
        <Text mt={2}>Error loading feedback</Text>
      </Flex>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
        <Heading size="md">
          {isAdmin 
            ? organizationId 
              ? 'Organization Feedback' 
              : 'All Feedback'
            : 'My Feedback'
          }
        </Heading>
        
        <HStack gap={3} flexWrap="wrap">
          <Input 
            placeholder="Search feedback..."
            maxW="250px"
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
          
          <Select 
            placeholder="Filter by type"
            maxW="180px"
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {Object.values(FeedbackType).map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </Select>
          
          <Select 
            placeholder="Filter by status"
            maxW="180px"
            value={filterStatus}
            onChange={(e: any) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.values(FeedbackStatus).map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </HStack>
      </Flex>
      
      {filteredFeedback.length === 0 ? (
        <Box textAlign="center" py={10} px={6} bg="gray.50" borderRadius="md">
          <Text fontSize="lg">No feedback found</Text>
          <Text color="gray.500" mt={1}>
            {searchTerm || filterType || filterStatus 
              ? 'Try adjusting your filters'
              : 'Submit feedback to see it here'}
          </Text>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th width="80px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFeedback.map(item => (
                <Tr key={item.id}>
                  <Td>
                    <Text 
                      fontWeight="medium"
                      cursor="pointer"
                      onClick={() => handleViewItem(item)}
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {item.title}
                    </Text>
                    
                    {isAdmin && (
                      <Flex mt={1} alignItems="center">
                        <Avatar size="xs" mr={1}                                                                                       />
                        <Text fontSize="xs" color="gray.600">{item.userEmail || item.userId}</Text>
                      </Flex>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme={getTypeColor(item.type)}>
                      {item.type.replace('_', ' ')}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getSeverityColor(item.severity)}>
                      {item.severity}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{formatDate(item.createdAt)}</Text>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton 
                        as={IconButton}
                        aria-label="Actions"
                        icon={<MoreVertical size={16} />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<ExternalLink size={16} />}
                          onClick={() => handleViewItem(item)}
                        >
                          View Details
                        </MenuItem>
                        
                        {isAdmin && (
                          <MenuItem 
                            icon={<Trash2 size={16} />}
                            color="red.500"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      <FeedbackViewModal 
        feedback={activeItem}
        open={isOpen}
        onClose={onClose}
        isAdmin={isAdmin}
      />
    </Box>
  );
};

export default FeedbackList;