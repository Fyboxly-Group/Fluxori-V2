/// <reference path="../../types/module-declarations.d.ts" />
'use client';

import React, { useState } from 'react';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
import { Send } from 'lucide-react';
;
import { useAuth } from '@/context/AuthContext';
import { FeedbackForm } from '@/features/feedback/components/FeedbackForm';

// Fix for Next.js module resolution
import { ChakraProvider } from "@chakra-ui/react";
import { Box, Heading, Text, Button, Card, CardBody, CardHeader, Stack } from '@/utils/chakra/components';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure } from '@/components/stubs/ChakraStubs';



export default function FeedbackPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, loading } = useAuth();
  
  const handleSubmitFeedback = async (feedback: any) => {
    // In a real app, you would submit this to your API
    console.log('Submitting feedback:', feedback);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };
  
  return (
    <Box maxWidth="1200px" mx="auto" p={6}>
      <Heading mb={6}>Feedback</Heading>
      
      <Text mb={6}>
        We value your feedback! Please let us know how we can improve the platform
        or report any issues you encounter.
      </Text>
      
      <Stack gap={6} direction={{ base: 'column', md: 'row' }} align="stretch">
        <Card flex="1">
          <CardHeader>
            <Heading size="md">Submit Feedback</Heading>
          </CardHeader>
          <CardBody>
            <Text mb={4}>
              Have a suggestion or found a bug? Let us know by submitting feedback.
              Your input helps us improve the platform for everyone.
            </Text>
            <Button
              leftIcon={<Send size={16} />}
              colorScheme="blue"
              onClick={onOpen}
              disabled={loading}
            >
              Submit Feedback
            </Button>
          </CardBody>
        </Card>
        
        <Card flex="1">
          <CardHeader>
            <Heading size="md">Feature Requests</Heading>
          </CardHeader>
          <CardBody>
            <Text mb={4}>
              Have an idea for a new feature? Submit a feature request and our team
              will review it. We're always looking for ways to improve!
            </Text>
            <Button 
              variant="outline" 
              colorScheme="blue" 
              disabled={loading}
              onClick={onOpen}
            >
              Request Feature
            </Button>
          </CardBody>
        </Card>
      </Stack>
      
      {/* Feedback Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit Feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FeedbackForm onClose={onClose} onSubmit={handleSubmitFeedback} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}