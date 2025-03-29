'use client';

import { Box } from '@chakra-ui/react/box';
import { Container } from '@chakra-ui/react/container';
import { NotificationProvider } from '../../features/notifications/hooks/useNotifications';
import { NotificationDemo } from '../../features/notifications/components/NotificationDemo';

export default function NotificationsPage() {
  // In a real implementation, we would get the token from auth context
  
  return (
    <Container maxW="1200px" py={8}>
      <NotificationProvider authToken={null} showToasts={true}>
        <Box p={4}>
          <NotificationDemo />
        </Box>
      </NotificationProvider>
    </Container>
  );
}