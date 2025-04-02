import React, { useEffect, useRef } from 'react';
import { Paper, Text, Avatar, Group, Box, Loader, useMantineTheme, createStyles, rem } from '@mantine/core';
import gsap from 'gsap';

// Styles for the chat component
const useStyles = createStyles((theme) => ({
  userBubble: {
    backgroundColor: theme.colorScheme === 'dark' 
      ? theme.colors.blue[9] 
      : theme.colors.blue[5],
    color: theme.white,
    marginLeft: 'auto',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 8,
      right: -8,
      width: 0,
      height: 0,
      border: '8px solid transparent',
      borderTopColor: theme.colorScheme === 'dark' 
        ? theme.colors.blue[9] 
        : theme.colors.blue[5],
      borderBottom: 0,
      borderRight: 0,
    }
  },
  agentBubble: {
    backgroundColor: theme.colorScheme === 'dark' 
      ? theme.colors.dark[6] 
      : theme.colors.gray[0],
    borderColor: theme.colorScheme === 'dark' 
      ? theme.colors.dark[4] 
      : theme.colors.gray[3],
    marginRight: 'auto',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 8,
      left: -8,
      width: 0,
      height: 0,
      border: '8px solid transparent',
      borderTopColor: theme.colorScheme === 'dark' 
        ? theme.colors.dark[6] 
        : theme.colors.gray[0],
      borderBottom: 0,
      borderLeft: 0,
    }
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.colorScheme === 'dark' 
      ? theme.colors.dark[0] 
      : theme.colors.gray[7],
    opacity: 0.6,
  },
  errorBubble: {
    backgroundColor: theme.fn.rgba(theme.colors.red[theme.colorScheme === 'dark' ? 9 : 6], 0.15),
    borderColor: theme.colors.red[theme.colorScheme === 'dark' ? 9 : 6],
    color: theme.colors.red[theme.colorScheme === 'dark' ? 5 : 7],
  },
  streamingText: {
    '&::after': {
      content: '"|"',
      animation: 'blink 1s infinite',
      marginLeft: 2,
    }
  },
  codeBlock: {
    backgroundColor: theme.colorScheme === 'dark' 
      ? theme.colors.dark[8] 
      : theme.colors.gray[1],
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    fontFamily: 'monospace',
    fontSize: theme.fontSizes.sm,
    margin: `${theme.spacing.xs} 0`,
    whiteSpace: 'pre-wrap',
  }
}));

export interface ChatBubbleProps {
  /** Message content */
  message: string;
  /** Whether this is from the user or the AI agent */
  isUser: boolean;
  /** Timestamp for the message */
  timestamp?: Date;
  /** Username to display */
  username?: string;
  /** User avatar URL or element */
  avatar?: string | React.ReactNode;
  /** Whether the agent is currently typing */
  isTyping?: boolean;
  /** Whether there was an error */
  isError?: boolean;
  /** Whether to animate message appearance */
  animate?: boolean;
  /** Whether the message is streaming in (render with typing effect) */
  isStreaming?: boolean;
  /** Animation delay in seconds */
  animationDelay?: number;
}

/**
 * Chat bubble component with animations and typing indicator
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  timestamp = new Date(),
  username = isUser ? 'You' : 'Assistant',
  avatar,
  isTyping = false,
  isError = false,
  animate = true,
  isStreaming = false,
  animationDelay = 0,
}) => {
  const { classes, cx, theme } = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Process the message content to handle code blocks and line breaks
  const processedMessage = React.useMemo(() => {
    if (!message) return '';
    
    // Split the message by code blocks
    const parts = message.split(/```([\s\S]*?)```/);
    
    if (parts.length === 1) {
      // No code blocks, just handle line breaks
      return message.split('\\n').map((line, i) => (
        <span key={i}>
          {line}
          {i < message.split('\\n').length - 1 && <br />}
        </span>
      ));
    }
    
    // Process parts into code blocks and regular text
    return parts.map((part, i) => {
      // Even indices are regular text, odd indices are code blocks
      if (i % 2 === 0) {
        return part.split('\\n').map((line, j) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < part.split('\\n').length - 1 && <br />}
          </span>
        ));
      } else {
        // Code block
        return (
          <div key={i} className={classes.codeBlock}>
            {part}
          </div>
        );
      }
    });
  }, [message, classes.codeBlock]);
  
  // Animation effect for new messages
  useEffect(() => {
    if (!containerRef.current || !animate) return;
    
    // Create the animation
    const tl = gsap.timeline({ delay: animationDelay });
    
    if (isUser) {
      // User message slides in from right
      tl.fromTo(
        containerRef.current,
        { 
          opacity: 0, 
          x: 20, 
          scale: 0.95
        },
        { 
          opacity: 1, 
          x: 0, 
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        }
      );
    } else {
      // Agent message slides in from left
      tl.fromTo(
        containerRef.current,
        { 
          opacity: 0, 
          x: -20,
          scale: 0.95 
        },
        { 
          opacity: 1, 
          x: 0, 
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        }
      );
    }
    
    return () => {
      tl.kill();
    };
  }, [animate, isUser, animationDelay]);
  
  // Typing animation effect
  useEffect(() => {
    if (!messageRef.current || !isStreaming || isTyping) return;
    
    const elementToAnimate = messageRef.current;
    
    // Reset any existing animation
    gsap.killTweensOf(elementToAnimate);
    
    // Ensure no animation is running but content is visible
    gsap.set(elementToAnimate, { opacity: 1 });
  }, [isStreaming, isTyping]);
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get the appropriate avatar
  const getAvatar = () => {
    if (avatar && typeof avatar === 'string') {
      return <Avatar src={avatar} radius="xl" size="md" />;
    } else if (avatar) {
      return avatar;
    } else if (isUser) {
      return (
        <Avatar color="blue" radius="xl" size="md">
          {username.charAt(0).toUpperCase()}
        </Avatar>
      );
    } else {
      return (
        <Avatar color="cyan" radius="xl" size="md">
          AI
        </Avatar>
      );
    }
  };
  
  return (
    <Box
      ref={containerRef}
      mb="md"
      style={{ maxWidth: '85%', alignSelf: isUser ? 'flex-end' : 'flex-start' }}
    >
      <Group spacing="xs" align="flex-start" noWrap mb={4}>
        {!isUser && getAvatar()}
        <div>
          <Text size="xs" color="dimmed">
            {username} • {formatTime(timestamp)}
          </Text>
          <Paper
            p="sm"
            withBorder={!isUser && !isError}
            radius="md"
            className={cx({
              [classes.userBubble]: isUser,
              [classes.agentBubble]: !isUser && !isError,
              [classes.errorBubble]: isError,
            })}
            style={{ maxWidth: rem(500) }}
          >
            {isTyping ? (
              <div className={classes.typingIndicator}>
                <div className={classes.dot} style={{ animationDelay: '0s' }} />
                <div className={classes.dot} style={{ animationDelay: '0.2s' }} />
                <div className={classes.dot} style={{ animationDelay: '0.4s' }} />
              </div>
            ) : (
              <Text 
                ref={messageRef} 
                className={isStreaming ? classes.streamingText : undefined}
                size="sm"
              >
                {processedMessage}
              </Text>
            )}
          </Paper>
        </div>
        {isUser && getAvatar()}
      </Group>
    </Box>
  );
};

export default ChatBubble;