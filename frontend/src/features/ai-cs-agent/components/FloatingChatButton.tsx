'use client';

import { useState, useRef, useEffect } from 'react';
import { Box } from '@chakra-ui/react/box';
import { IconButton } from '@chakra-ui/react/button';
import { Portal } from '@chakra-ui/react/portal';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { motion, AnimatePresence } from 'framer-motion';

import { AIChatInterface } from './AIChatInterface';

// Chat icon component
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

// Close icon component
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface FloatingChatButtonProps {
  userId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  zIndex?: number;
  chatWidth?: string | number;
  chatHeight?: string | number;
}

/**
 * A floating chat button that opens an AI chat interface
 */
export function FloatingChatButton({
  userId,
  position = 'bottom-right',
  size = 'md',
  zIndex = 100,
  chatWidth = '350px',
  chatHeight = '600px'
}: FloatingChatButtonProps) {
  const { colorMode } = useColorMode();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Define position styles based on the position prop
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'top-left':
        return { top: '20px', left: '20px' };
      default:
        return { bottom: '20px', right: '20px' };
    }
  };
  
  // Define chat position based on button position
  const getChatPosition = () => {
    switch (position) {
      case 'bottom-right':
        return { bottom: '80px', right: '20px' };
      case 'bottom-left':
        return { bottom: '80px', left: '20px' };
      case 'top-right':
        return { top: '80px', right: '20px' };
      case 'top-left':
        return { top: '80px', left: '20px' };
      default:
        return { bottom: '80px', right: '20px' };
    }
  };
  
  // Size mapping
  const sizeMapping = {
    sm: { buttonSize: '40px', iconSize: '16px' },
    md: { buttonSize: '50px', iconSize: '20px' },
    lg: { buttonSize: '60px', iconSize: '24px' }
  };
  
  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.ai-chat-container')
      ) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle escalation
  const handleEscalation = (reason: string, conversationId: string) => {
    console.log(`Conversation ${conversationId} escalated: ${reason}`);
    // In a real app, you might want to notify a human agent or show a notification
  };
  
  return (
    <>
      {/* Floating Button */}
      <Box
        position="fixed"
        {...getPositionStyles()}
        zIndex={zIndex}
      >
        <IconButton
          ref={buttonRef}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          icon={isOpen ? <CloseIcon /> : <ChatIcon />}
          onClick={onToggle}
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          boxShadow="lg"
          width={sizeMapping[size].buttonSize}
          height={sizeMapping[size].buttonSize}
          fontSize={sizeMapping[size].iconSize}
        />
      </Box>
      
      {/* Chat Interface Portal */}
      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="ai-chat-container"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed',
                ...getChatPosition(),
                zIndex: zIndex - 1,
                width: chatWidth,
                height: chatHeight,
                maxHeight: '80vh',
                boxShadow: colorMode === 'light' 
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <AIChatInterface
                userId={userId}
                height="100%"
                width="100%"
                useWebSocket={true}
                onEscalation={handleEscalation}
                title="Customer Support"
                welcomeMessage="👋 Hi there! How can I help you today?"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}