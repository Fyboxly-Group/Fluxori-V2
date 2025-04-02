#!/usr/bin/env node

/**
 * Fix AIChatInterface component
 * 
 * This script provides a proper implementation of AIChatInterface.tsx which has
 * significant syntax issues.
 */

const fs = require('fs');
const path = require('path');

// Root directory
const ROOT_DIR = process.cwd();

function fixAIChatInterfaceComponent() {
  console.log('🔍 Fixing AIChatInterface component...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/ai-cs-agent/components/AIChatInterface.tsx');
  
  if (fs.existsSync(filePath)) {
    // Provide a clean implementation
    const fixedContent = `'use client';

import { useState, useRef, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { HStack, VStack } from '@chakra-ui/react/stack';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react/card';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react/alert';
import { Badge } from '@chakra-ui/react/badge';
import { Avatar } from '@chakra-ui/react/avatar';
import { Box } from '@chakra-ui/react/box';
import { Button } from '@chakra-ui/react/button';
import { Spinner } from '@chakra-ui/react/spinner';
import { Text } from '@chakra-ui/react/text';
import { Heading } from '@chakra-ui/react/heading';
import { Textarea } from '@chakra-ui/react/textarea';
import { IconButton } from '@chakra-ui/react/button';
import { Tooltip } from '@chakra-ui/react/tooltip';
import { useColorMode } from '@/utils/chakra-compat';
import { createToaster } from '@/utils/chakra-compat';
import { useConversation } from '../hooks/useConversation';
import type { Message } from '../api/conversation.api';

// Icons
const SendIcon = () => (
  <Box p="1" borderRadius="full">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  </Box>
);

const RefreshIcon = () => (
  <Box p="1" borderRadius="full">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"></polyline>
      <polyline points="23 20 23 14 17 14"></polyline>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
    </svg>
  </Box>
);

const CloseIcon = () => (
  <Box p="1" borderRadius="full">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </Box>
);

// Props
interface AIChatInterfaceProps {
  userId: string;
  initialConversationId?: string;
  organizationId?: string;
  useWebSocket?: boolean;
  title?: string;
  placeholder?: string;
  height?: string | number;
  width?: string | number;
  welcomeMessage?: string;
  onEscalation?: (reason: string, conversationId: string) => void;
}

/**
 * AI Chat Interface Component
 * 
 * A flexible chat interface component for interacting with AI assistants.
 * Supports real-time chat with WebSockets, message history, and escalation to human agents.
 */
export function AIChatInterface({
  userId,
  initialConversationId,
  organizationId,
  useWebSocket = true,
  title = 'Customer Support',
  placeholder = 'Type your message here...',
  height = '600px',
  width = '100%',
  welcomeMessage = "Hi there! I'm your AI assistant. How can I help you today?",
  onEscalation
}: AIChatInterfaceProps) {
  // State
  const [inputValue, setInputValue] = useState('');
  
  // Access theme
  const { colorMode } = useColorMode();
  
  // Create toast notification
  const toast = createToaster();
  
  // Refs
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use conversation hook
  const {
    messages,
    loading,
    isError,
    error,
    conversationId,
    isEscalated,
    escalationReason,
    isTyping,
    sendMessage,
    closeConversation,
    clearConversation,
    isConnected
  } = useConversation({
    userId,
    initialConversationId,
    organizationId,
    useWebSocket,
    onEscalation: (reason) => {
      if (onEscalation && conversationId) {
        onEscalation(reason, conversationId);
      }
    }
  });
  
  // If no messages and no initialConversationId, add welcome message
  useEffect(() => {
    if (messages.length === 0 && !initialConversationId && welcomeMessage) {
      // Create timestamp
      const timestamp = new Date().toISOString();
      
      // Add welcome message
      if (conversationId) {
        // If already has conversation ID but no messages, it's likely a new conversation
        // No need to add a duplicate welcome message
      } else {
        // Dispatch welcome message to start conversation
        sendMessage(welcomeMessage);
      }
    }
  }, [messages.length, initialConversationId, welcomeMessage, conversationId, sendMessage]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Handle form submission
  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    
    sendMessage(inputValue);
    setInputValue('');
  };
  
  // Handle key press
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Restart conversation
  const handleRestart = () => {
    if (loading) return;
    
    // If we have a conversation ID, close it; otherwise just clear the messages
    if (conversationId) {
      closeConversation();
    } else {
      clearConversation();
    }
    
    toast({
      title: 'Conversation Restarted',
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };
  
  // Render message content with proper formatting
  const renderMessageContent = (content: string) => {
    // Function to split message content into paragraphs
    // This helps with readability
    return content.split('\\n').map((paragraph, i) => (
      <Text key={i} mb={i === content.split('\\n').length - 1 ? 0 : 2}>
        {paragraph}
      </Text>
    ));
  };
  
  return (
    <Card
      width={width}
      height={height}
      overflow="hidden"
      borderRadius="lg"
      boxShadow="lg"
      variant="outline"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
    >
      {/* Header */}
      <CardHeader
        pb={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        bg={colorMode === 'light' ? 'blue.50' : 'blue.900'}
        borderBottomWidth="1px"
        borderBottomColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      >
        <HStack>
          <Avatar
            size="sm"
            bg="blue.500"
            color="white"
            name="AI Assistant"
            src="ai-assistant-avatar.png"
          />
          <VStack gap={0} align="start">
            <Heading size="sm" fontWeight="bold">
              {title}
            </Heading>
            <HStack>
              <Badge
                colorScheme={isConnected ? 'green' : 'red'}
                fontSize="xs"
                variant="subtle"
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              
              {isEscalated && (
                <Badge colorScheme="orange" fontSize="xs">
                  Escalated
                </Badge>
              )}
            </HStack>
          </VStack>
        </HStack>
        
        <HStack>
          <Tooltip label="Restart conversation">
            <IconButton
              aria-label="Restart conversation"
              icon={<RefreshIcon />}
              size="sm"
              variant="ghost"
              disabled={loading}
              onClick={handleRestart}
            />
          </Tooltip>
          <Tooltip label="Close conversation">
            <IconButton
              aria-label="Close conversation"
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              disabled={loading}
              onClick={closeConversation}
            />
          </Tooltip>
        </HStack>
      </CardHeader>
      
      {/* Chat Messages */}
      <CardBody
        ref={chatBodyRef}
        p={4}
        overflowY="auto"
        display="flex"
        flexDirection="column"
        gap={4}
      >
        {/* Connection error alert */}
        {!isConnected && useWebSocket && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Unable to connect to the chat service. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Error message */}
        {isError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || 'Something went wrong. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Escalation alert */}
        {isEscalated && (
          <Alert status="warning" mb={4} borderRadius="md">
            <AlertIcon />
            <AlertTitle>Conversation Escalated</AlertTitle>
            <AlertDescription>
              {escalationReason || 'This conversation has been escalated to a human agent.'}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Render messages */}
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          const isAI = message.role === 'assistant';
          const isSystem = message.role === 'system';
          
          if (isSystem) {
            // System messages are displayed as alerts
            return (
              <Alert
                key={index}
                status="info"
                variant="left-accent"
                size="sm"
                borderRadius="md"
              >
                <AlertIcon />
                {message.content}
              </Alert>
            );
          }
          
          return (
            <Box
              key={index}
              alignSelf={isUser ? 'flex-end' : 'flex-start'}
              maxWidth="80%"
              bg={isUser
                  ? colorMode === 'light'
                    ? 'blue.500'
                    : 'blue.700'
                  : colorMode === 'light'
                  ? 'gray.100'
                  : 'gray.700'
              }
              color={isUser ? 'white' : colorMode === 'light' ? 'gray.800' : 'white'
              }
              borderRadius={isUser ? 'lg 0 lg lg' : '0 lg lg lg'}
              px={4}
              py={3}
              position="relative"
            >
              {/* Message content */}
              <Box>
                {renderMessageContent(message.content)}
              </Box>
              
              {/* Message timestamp */}
              <Text
                fontSize="xs"
                color={isUser ? 'whiteAlpha.700' : colorMode === 'light' ? 'gray.500' : 'gray.400'}
                textAlign="right"
                mt={1}
              >
                {formatTimestamp(message.timestamp)}
                {isAI && message.metadata?.streaming && ' (typing...)'}
                {isAI && message.metadata?.confidence && 
                  \` (\${Math.round(message.metadata.confidence * 100)}% confident)\`}
              </Text>
            </Box>
          );
        })}
        
        {/* Typing indicator */}
        {isTyping && !messages.some(m => m.metadata?.streaming) && (
          <Box
            alignSelf="flex-start"
            bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
            color={colorMode === 'light' ? 'gray.800' : 'white'}
            borderRadius="0 lg lg lg"
            px={4}
            py={3}
          >
            <HStack gap={2}>
              <Spinner size="sm" />
              <Text>AI is typing...</Text>
            </HStack>
          </Box>
        )}
        
        {/* Element for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </CardBody>
      
      {/* Input area */}
      <CardFooter
        p={3}
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        borderTopWidth="1px"
        borderTopColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      >
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <HStack gap={2} width="100%">
            <Textarea
              placeholder={isEscalated ? 'This conversation has been escalated to a human agent.' : placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || isEscalated || !isConnected}
              resize="none"
              minHeight="20px"
              maxHeight="120px"
              borderRadius="lg"
              variant="filled"
              size="md"
              width="100%"
              borderWidth="1px"
              borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
              _hover={{
                borderColor: colorMode === 'light' ? 'gray.400' : 'gray.500',
              }}
              _focus={{
                borderColor: 'blue.500',
                boxShadow: 'none',
              }}
            />
            <IconButton
              aria-label="Send message"
              icon={loading ? <Spinner size="sm" /> : <SendIcon />}
              type="submit"
              colorScheme="blue"
              disabled={!inputValue.trim() || loading || isEscalated || !isConnected}
              borderRadius="full"
              minWidth="42px"
            />
          </HStack>
        </form>
      </CardFooter>
    </Card>
  );
}`;
    
    fs.writeFileSync(filePath, fixedContent, { mode: 0o644 });
    console.log(`✅ Fixed ${path.relative(process.cwd(), filePath)}`);
  }
}

function main() {
  try {
    console.log('🚀 Starting AIChatInterface component fix script');
    
    // Fix the component
    fixAIChatInterfaceComponent();
    
    console.log('✅ All fixes applied');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();