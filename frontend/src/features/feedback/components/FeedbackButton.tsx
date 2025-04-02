/**
 * Floating Feedback Button Component
 */
/// <reference path="../../types/module-declarations.d.ts" />

import React, { useState } from 'react';
import { Button  } from '@/utils/chakra-compat';
import { IconButton  } from '@/utils/chakra-compat';
import { Modal } from '@/components/stubs/ChakraStubs';;
import { ModalOverlay } from '@/components/stubs/ChakraStubs';;
import { ModalContent } from '@/components/stubs/ChakraStubs';;
import { ModalBody } from '@/components/stubs/ChakraStubs';;
import { Tooltip  } from '@/utils/chakra-compat';
import { Box  } from '@/utils/chakra-compat';
import { useDisclosure } from '@/components/stubs/ChakraStubs';;
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
          isOpen={tooltipOpen} 
          placement="top"
        >
          {variant === 'icon' ? (
            <IconButton
              icon={<MessageSquarePlus size={18}  />}
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

export default FeedbackButton;