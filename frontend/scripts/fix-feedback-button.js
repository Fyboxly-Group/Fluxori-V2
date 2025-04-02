const fs = require('fs');
const path = require('path');

console.log('🚀 Starting FeedbackButton fix script');

const sourceFilePath = path.resolve(__dirname, '../src/features/feedback/components/FeedbackButton.tsx');

// Completely rebuild the file with proper TypeScript and Chakra UI v3 patterns
const fixedContent = `/**
 * Floating Feedback Button Component
 */
import React, { useState } from 'react';
import { Button } from '@chakra-ui/react/button';
import { IconButton } from '@chakra-ui/react/button';
import { Modal } from '@chakra-ui/react/modal';
import { ModalOverlay } from '@chakra-ui/react/modal';
import { ModalContent } from '@chakra-ui/react/modal';
import { ModalBody } from '@chakra-ui/react/modal';
import { Tooltip } from '@chakra-ui/react/tooltip';
import { Box } from '@chakra-ui/react/box';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackForm } from './FeedbackForm';

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type Variant = 'icon' | 'button';

interface FeedbackButtonProps {
  position?: Position;
  variant?: Variant;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ 
  position = 'bottom-right',
  variant = 'icon'
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  
  // Determine positioning styles based on the position prop
  let positionStyles = {};
  switch(position) {
    case 'bottom-right':
      positionStyles = { bottom: '20px', right: '20px' };
      break;
    case 'bottom-left':
      positionStyles = { bottom: '20px', left: '20px' };
      break;
    case 'top-right':
      positionStyles = { top: '20px', right: '20px' };
      break;
    case 'top-left':
      positionStyles = { top: '20px', left: '20px' };
      break;
  }
  
  return (
    <>
      <Box
        position="fixed"
        zIndex={1000}
        {...positionStyles}
      >
        <Tooltip
          label="Share your feedback"
          open={tooltipOpen} 
          placement="top"
        >
          {variant === 'icon' ? (
            <IconButton
              icon={<MessageSquarePlus size={18} />}
              colorScheme="blue"
              size="lg"
              borderRadius="full"
              boxShadow="md"
              onClick={onOpen}
              onMouseEnter={() => setTooltipOpen(true)}
              onMouseLeave={() => setTooltipOpen(false)}
              aria-label="Share your feedback"
            />
          ) : (
            <Button
              leftIcon={<MessageSquarePlus size={16} />}
              colorScheme="blue"
              onClick={onOpen}
              boxShadow="md"
              onMouseEnter={() => setTooltipOpen(true)}
              onMouseLeave={() => setTooltipOpen(false)}
            >
              Feedback
            </Button>
          )}
        </Tooltip>
      </Box>
      
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={0}>
            <FeedbackForm onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FeedbackButton;`;

try {
  fs.writeFileSync(sourceFilePath, fixedContent);
  console.log('✅ Fixed src/features/feedback/components/FeedbackButton.tsx');
} catch (error) {
  console.error('❌ Error fixing FeedbackButton.tsx:', error);
}

console.log('✅ All fixes applied');