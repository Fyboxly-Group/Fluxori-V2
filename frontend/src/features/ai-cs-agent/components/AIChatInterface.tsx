/// <reference path="../../types/module-declarations.d.ts" />
import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '../../../utils/chakra-utils';
import React, { useState, useRef, useEffect } from 'react';
import { Box  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Input  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Avatar  } from '@/utils/chakra-compat';
import { Card  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { Send, Bot } from 'lucide-react';
import { Message } from '../types/chat.types';
import { ResponsiveValue } from '../../../utils/chakra-utils';

// Interface for component props
interface AIChatInterfaceProps {
  initialMessages?: Message[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onSendMessage?: (message: string) => void;
  onNewMessage?: (message: Message) => void;
  placeholder?: string;
  agentName?: string;
  userName?: string;
  maxHeight?: ResponsiveValue<string | number>;
  showAvatar?: boolean;
  autoFocus?: boolean;
  isTyping?: boolean;
  loading?: boolean;
  displayName?: string;
}

export function AIChatInterface({
  initialMessages = [],
  onSendMessage,
  isTyping = false,
  displayName = 'AI Assistant'
}: AIChatInterfaceProps) {
  // State for messages and current input
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Create new message
    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Add to messages list
    setMessages([...messages, newMessage]);
    
    // Call onSendMessage if provided
    if (onSendMessage) {
      onSendMessage(input);
    }
    
    // Clear input
    setInput('');
  };
  
  // Handle pressing Enter to send
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  return (
    <Card height="100%" boxShadow="md">
      <CardBody padding={0} display="flex" flexDirection="column">
        {/* Chat messages area */}
        <Box 
          flex="1" 
          overflowY="auto" 
          p={4}
          borderBottomWidth="1px"
        >
          <VStack gap={4} align="stretch">
            {messages.map((msg) => (
              <Box
                key={msg.id}
                alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                maxWidth="80%"
              >
                <HStack align="start" gap={2}>
                  {msg.role !== 'user' && (
                    <Avatar size="sm" name={displayName} bg="blue.500"                                                                                       />
                  )}
                  <Box
                    bg={msg.role === 'user' ? 'blue.500' : 'gray.100'}
                    color={msg.role === 'user' ? 'white' : 'gray.800'}
                    px={4}
                    py={2}
                    borderRadius="lg"
                  >
                    <Text>{msg.content}</Text>
                  </Box>
                  {msg.role === 'user' && (
                    <Avatar size="sm" name="User" bg="green.500"                                                                                       />
                  )}
                </HStack>
              </Box>
            ))}
            
            {isTyping && (
              <Box alignSelf="flex-start" maxWidth="80%">
                <HStack align="start" gap={2}>
                  <Avatar size="sm" name={displayName} bg="blue.500"                                                                                       />
                  <Box
                    bg="gray.100"
                    color="gray.800"
                    px={4}
                    py={2}
                    borderRadius="lg"
                  >
                    <Spinner size="sm" mr={2}                                                                                       />
                    <Text as="span">Typing...</Text>
                  </Box>
                </HStack>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </VStack>
        </Box>
        
        {/* Input area */}
        <HStack p={4} gap={2}>
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            variant="filled"
                                                                                                />
          <Button
            colorScheme="blue"
            onClick={handleSendMessage}
            disabled={!input.trim()}
            leftIcon={<Send size={16} />}
          >
            Send
          </Button>
        </HStack>
      </CardBody>
    </Card>
  );
}

export default AIChatInterface;