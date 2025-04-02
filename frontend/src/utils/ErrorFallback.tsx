import React from 'react';
import { 
  Button,
  Center,
  Container,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme
} from '@mantine/core';
import { IconRefresh, IconChevronLeft, IconAlertTriangle } from '@tabler/icons-react';
import ErrorState from '@/components/ui/ErrorState';

interface DefaultFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

/**
 * Default fallback component for error boundaries
 */
export const DefaultErrorFallback: React.FC<DefaultFallbackProps> = ({
  error,
  resetErrorBoundary
}) => {
  return (
    <ErrorState
      title="Something went wrong"
      message="We're sorry, but an unexpected error occurred while rendering this component."
      error={error}
      type="client"
      retryable={!!resetErrorBoundary}
      onRetry={resetErrorBoundary}
      actionText="Return to Dashboard"
      onAction={() => window.location.href = '/dashboard'}
      animate={true}
    />
  );
};

interface FullPageFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backButtonPath?: string;
  showDetails?: boolean;
}

/**
 * Full-page error fallback for critical errors
 */
export const FullPageErrorFallback: React.FC<FullPageFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = "Something went wrong",
  message = "We're sorry, but an unexpected error occurred. Our team has been notified.",
  showBackButton = true,
  backButtonPath = '/',
  showDetails = process.env.NODE_ENV !== 'production',
}) => {
  const theme = useMantineTheme();
  
  return (
    <Container size="md" style={{ height: '100vh' }}>
      <Center style={{ height: '100%' }}>
        <Stack spacing="xl" align="center" style={{ maxWidth: 600 }}>
          <IconAlertTriangle
            size={60}
            color={theme.colors.red[6]}
            style={{ opacity: 0.8 }}
          />
          
          <Stack spacing="xs" align="center">
            <Title order={2} align="center">{title}</Title>
            <Text align="center" size="lg" color="dimmed">{message}</Text>
          </Stack>
          
          <Group>
            {resetErrorBoundary && (
              <Button
                leftIcon={<IconRefresh size={16} />}
                onClick={resetErrorBoundary}
              >
                Try Again
              </Button>
            )}
            
            {showBackButton && (
              <Button
                variant="outline"
                leftIcon={<IconChevronLeft size={16} />}
                onClick={() => {
                  window.location.href = backButtonPath;
                }}
              >
                Go Back
              </Button>
            )}
          </Group>
          
          {showDetails && error && (
            <Container size="sm" p="md" style={{ 
              background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
              borderRadius: theme.radius.md,
              maxHeight: 200,
              overflow: 'auto'
            }}>
              <Text size="sm" weight={500}>Error details:</Text>
              <Text size="xs" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                {error.stack || error.message}
              </Text>
            </Container>
          )}
        </Stack>
      </Center>
    </Container>
  );
};

export default {
  DefaultErrorFallback,
  FullPageErrorFallback
};