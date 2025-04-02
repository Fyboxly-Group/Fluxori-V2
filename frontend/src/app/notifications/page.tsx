/// <reference path="../../types/module-declarations.d.ts" />
'use client';

import React from 'react';
import { Container } from '@/utils/chakra-compat';;
;
import { NotificationProvider } from '../../features/notifications/hooks/useNotifications';
import { NotificationDemo } from '../../features/notifications/components/NotificationDemo';
;

// Fix for Next.js module resolution
import { ChakraProvider } from "@chakra-ui/react";
import { Box } from '@/utils/chakra/components';



export default function NotificationsPage() {
  // In a real implementation, we would get the token from auth context
  
  return (
    <Container maxW="1200px" py={8}>
      <NotificationProvider authToken={null as unknown as string} showToasts={true}>
        <Box p={4}>
          <NotificationDemo />
        </Box>
      </NotificationProvider>
    </Container>
  );
}