'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Spinner } from '@chakra-ui/react/spinner';
import { List, ListItem } from '@chakra-ui/react/list';
import { Button } from '@chakra-ui/react/button';
import { Badge } from '@chakra-ui/react/badge';
import { Flex, HStack, VStack } from '@chakra-ui/react/stack';
import { useColorMode } from '@chakra-ui/react/color-mode';

import { conversationApi, Conversation } from '../api/conversation.api';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
  limit?: number;
  status?: 'active' | 'escalated' | 'closed';
}

export function ConversationList({ 
  onSelectConversation, 
  selectedConversationId,
  limit = 10,
  status
}: ConversationListProps) {
  const { colorMode } = useColorMode();
  
  // Fetch conversations
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['conversations', { limit, status }],
    queryFn: () => conversationApi.getConversations({ limit, status }),
    refetchOnWindowFocus: false
  });
  
  // Format conversation date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // If today, show time
    if (isToday(date)) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day of week
    if (isThisWeek(date)) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  // Helper to check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Helper to check if date is this week
  const isThisWeek = (date: Date) => {
    const today = new Date();
    const firstDayOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    firstDayOfWeek.setHours(0, 0, 0, 0);
    
    return date >= firstDayOfWeek;
  };
  
  // Get conversation preview text (last message content or default text)
  const getPreviewText = (conversation: Conversation) => {
    if (conversation.messages.length === 0) {
      return 'No messages';
    }
    
    // Get the last non-system message
    const lastMessage = [...conversation.messages]
      .reverse()
      .find(msg => msg.role !== 'system');
    
    if (!lastMessage) {
      return 'No messages';
    }
    
    const prefix = lastMessage.role === 'user' ? 'You: ' : 'AI: ';
    const content = lastMessage.content.length > 50
      ? `${lastMessage.content.substring(0, 50)}...`
      : lastMessage.content;
    
    return `${prefix}${content}`;
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'escalated':
        return 'orange';
      case 'closed':
        return 'gray';
      default:
        return 'gray';
    }
  };
  
  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontWeight="bold" fontSize="lg">Conversations</Text>
        <Button 
          size="xs" 
          variant="outline" 
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </HStack>
      
      {isLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner />
        </Flex>
      ) : error ? (
        <Box 
          p={4} 
          bg={colorMode === 'light' ? 'red.50' : 'red.900'} 
          color={colorMode === 'light' ? 'red.500' : 'red.200'} 
          borderRadius="md"
        >
          <Text>Error loading conversations</Text>
        </Box>
      ) : data && data.length > 0 ? (
        <List spacing={2}>
          {data.map((conversation) => (
            <ListItem 
              key={conversation._id}
              onClick={() => onSelectConversation(conversation._id)}
              bg={selectedConversationId === conversation._id 
                ? (colorMode === 'light' ? 'blue.50' : 'blue.900')
                : (colorMode === 'light' ? 'white' : 'gray.800')
              }
              borderRadius="md"
              borderWidth="1px"
              borderColor={selectedConversationId === conversation._id
                ? 'blue.400'
                : (colorMode === 'light' ? 'gray.200' : 'gray.700')
              }
              p={3}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                bg: colorMode === 'light' ? 'gray.50' : 'gray.700',
                borderColor: colorMode === 'light' ? 'gray.300' : 'gray.600',
              }}
            >
              <VStack align="start" spacing={1}>
                <HStack justify="space-between" width="100%">
                  <Text fontWeight="medium" fontSize="sm">
                    {conversation.topic || `Conversation ${conversation._id.substring(0, 6)}...`}
                  </Text>
                  <Badge colorScheme={getStatusColor(conversation.status)} fontSize="xs">
                    {conversation.status}
                  </Badge>
                </HStack>
                
                <Text fontSize="xs" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                  {getPreviewText(conversation)}
                </Text>
                
                <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.500'}>
                  {formatDate(conversation.lastMessageAt)}
                </Text>
              </VStack>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box 
          p={4} 
          bg={colorMode === 'light' ? 'gray.50' : 'gray.800'} 
          borderRadius="md"
          textAlign="center"
        >
          <Text>No conversations found</Text>
        </Box>
      )}
    </Box>
  );
}