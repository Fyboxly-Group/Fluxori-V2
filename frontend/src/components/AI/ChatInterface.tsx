import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Text,
  TextInput,
  Button,
  Group,
  Box,
  ScrollArea,
  ActionIcon,
  Textarea,
  useMantineTheme,
  createStyles,
  Loader,
  Stack,
  Title,
  Card,
} from '@mantine/core';
import { IconSend, IconMicrophone, IconArrowDown, IconPaperclip, IconPhoto } from '@tabler/icons-react';
import ChatBubble from './ChatBubble';
import gsap from 'gsap';

// Styles for the chat interface
const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    padding: 0,
  },
  header: {
    borderBottom: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    padding: theme.spacing.md,
  },
  conversationContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: theme.spacing.md,
    overflowY: 'auto',
  },
  inputContainer: {
    borderTop: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    padding: theme.spacing.md,
    background: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    position: 'relative',
    zIndex: 10,
  },
  formElement: {
    width: '100%',
  },
  scrollButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 5,
    boxShadow: theme.shadows.md,
    opacity: 0,
    transform: 'translateY(10px)',
    transition: 'opacity 0.2s, transform 0.2s',
  },
  scrollButtonVisible: {
    opacity: 1,
    transform: 'translateY(0)',
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing.xl * 2,
  },
  welcomeCard: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    background: theme.fn.linearGradient(
      45,
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[2]
    ),
  },
}));

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatInterfaceProps {
  /** Messages to display */
  messages: Message[];
  /** Function to handle sending messages */
  onSendMessage: (message: string) => void;
  /** Whether the AI is currently responding */
  isResponding?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Whether to enable sending files/images */
  enableAttachments?: boolean;
  /** Function to handle file uploads */
  onFileUpload?: (file: File) => void;
  /** Whether to animate messages */
  animateMessages?: boolean;
  /** AI agent name */
  agentName?: string;
  /** Welcome message to display when no messages exist */
  welcomeMessage?: string;
  /** Whether currently streaming a response */
  isStreaming?: boolean;
  /** Current streaming message content */
  streamingContent?: string;
}

/**
 * Complete chat interface component with animations and real-time features
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isResponding = false,
  loading = false,
  enableAttachments = false,
  onFileUpload,
  animateMessages = true,
  agentName = 'Assistant',
  welcomeMessage = 'How can I help you today?',
  isStreaming = false,
  streamingContent = '',
}) => {
  const { classes, cx, theme } = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (!viewportRef.current) return;
    
    const scrollToBottom = (smooth = true) => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end',
        });
      }
    };
    
    // Scroll to bottom on new messages or when streaming updates
    scrollToBottom();
    
    // Add scroll event listener to show/hide scroll button
    const handleScroll = () => {
      if (!viewportRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setShowScrollButton(!isNearBottom);
    };
    
    viewportRef.current.addEventListener('scroll', handleScroll);
    
    return () => {
      if (viewportRef.current) {
        viewportRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messages, isStreaming, streamingContent]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue);
    setInputValue('');
    
    // Focus input after sending
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  // Handle key press (send on Ctrl+Enter or Meta+Enter)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };
  
  // Handle scroll to bottom button click
  const handleScrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };
  
  // Handle file upload
  const handleFileUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.multiple = false;
    
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0] && onFileUpload) {
        onFileUpload(target.files[0]);
      }
    };
    
    input.click();
  };
  
  // Handle text area auto resize
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.currentTarget.value);
    
    // Reset height then set to scrollHeight to properly resize
    e.currentTarget.style.height = 'auto';
    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
  };
  
  // Render the scroll to bottom button with animation
  const renderScrollButton = () => (
    <ActionIcon
      size="lg"
      radius="xl"
      color="blue"
      variant="filled"
      className={cx(classes.scrollButton, {
        [classes.scrollButtonVisible]: showScrollButton,
      })}
      onClick={handleScrollToBottom}
    >
      <IconArrowDown size={18} />
    </ActionIcon>
  );
  
  // Render all messages
  const renderMessages = () => {
    if (loading && messages.length === 0) {
      return (
        <Stack align="center" justify="center" style={{ height: '100%' }}>
          <Loader />
          <Text size="sm" color="dimmed">
            Loading conversation...
          </Text>
        </Stack>
      );
    }
    
    if (messages.length === 0) {
      return (
        <Box className={classes.emptyState}>
          <Card className={classes.welcomeCard} radius="md">
            <Title order={3} mb="md">
              Welcome to {agentName}
            </Title>
            <Text size="lg" mb="lg">
              {welcomeMessage}
            </Text>
            
            <Text size="sm" color="dimmed">
              Type a message below to get started.
            </Text>
          </Card>
        </Box>
      );
    }
    
    return (
      <>
        {messages.map((message, index) => (
          <ChatBubble
            key={message.id}
            message={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            username={message.isUser ? 'You' : agentName}
            isError={message.isError}
            animate={animateMessages}
            animationDelay={0.1 * (index % 5)} // Stagger animation for groups of 5
          />
        ))}
        
        {/* Streaming message or typing indicator */}
        {isResponding && (
          <ChatBubble
            message={isStreaming ? streamingContent : ''}
            isUser={false}
            username={agentName}
            isTyping={!isStreaming}
            isStreaming={isStreaming}
            animate={false}
          />
        )}
        
        {/* Invisible element for scroll targeting */}
        <div ref={messageEndRef} style={{ height: 1 }} />
      </>
    );
  };
  
  return (
    <Paper className={classes.container} radius="md" withBorder>
      <Box className={classes.header}>
        <Text weight={500} size="lg">
          Chat with {agentName}
        </Text>
      </Box>
      
      <ScrollArea 
        viewportRef={viewportRef} 
        scrollbarSize={8} 
        className={classes.conversationContainer}
        style={{ overflow: 'auto' }}
        ref={scrollAreaRef}
      >
        {renderMessages()}
      </ScrollArea>
      
      {renderScrollButton()}
      
      <Box className={classes.inputContainer}>
        <form onSubmit={handleSubmit}>
          <Group spacing="xs" align="flex-end" noWrap>
            {enableAttachments && (
              <ActionIcon
                variant="default"
                onClick={handleFileUploadClick}
                size="lg"
                radius="md"
                disabled={isResponding}
              >
                <IconPaperclip size={20} />
              </ActionIcon>
            )}
            
            <Textarea
              ref={inputRef}
              className={classes.formElement}
              placeholder="Type your message here..."
              autosize
              minRows={1}
              maxRows={5}
              value={inputValue}
              onChange={handleTextAreaChange}
              onKeyDown={handleKeyPress}
              disabled={isResponding}
              radius="md"
              rightSection={
                <Button
                  compact
                  radius="xl"
                  type="submit"
                  disabled={!inputValue.trim() || isResponding}
                  rightIcon={<IconSend size={16} />}
                >
                  Send
                </Button>
              }
            />
          </Group>
          
          <Text size="xs" color="dimmed" mt={4} align="center">
            Press Ctrl+Enter to send
          </Text>
        </form>
      </Box>
    </Paper>
  );
};

export default ChatInterface;