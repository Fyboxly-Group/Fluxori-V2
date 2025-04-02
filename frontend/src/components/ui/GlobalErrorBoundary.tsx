import React, { ErrorInfo } from 'react';
import { Text, Container, Stack, Button, Group, Space, useMantineTheme, Title } from '@mantine/core';
import { IconArrowBackUp, IconRefresh } from '@tabler/icons-react';
import ErrorBoundary from './ErrorBoundary';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  /** Whether to enable retry functionality */
  retryable?: boolean;
  /** Whether to show a back to home button */
  showBackToHome?: boolean;
  /** Whether to report errors to monitoring service */
  reportErrors?: boolean;
  /** CSS class for the error state */
  className?: string;
}

/**
 * A specialized error boundary for wrapping large sections of the app.
 * Provides additional navigation options and enhanced error reporting.
 */
const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({
  children,
  retryable = true,
  showBackToHome = true,
  reportErrors = true,
  className,
}) => {
  const theme = useMantineTheme();

  // Handle the error and report to monitoring service
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    if (reportErrors) {
      // In a real implementation, this would call your error reporting service
      // Example: errorReportingService.captureError(error, errorInfo);
      console.error('Global error captured for reporting:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  };

  // Custom fallback component for the global error boundary
  const renderFallback = (error: Error, errorInfo: ErrorInfo, reset: () => void) => {
    return (
      <Container size="lg" py={50}>
        <Stack align="center" spacing="xl">
          <div style={{ textAlign: 'center', maxWidth: 600 }}>
            <Title order={2} mb="md" color={theme.colors.red[6]}>
              Application Error
            </Title>
            <Text size="lg" mb="sm">
              We&apos;ve encountered an unexpected problem. Our team has been notified.
            </Text>
            <Text size="md" color="dimmed">
              {process.env.NODE_ENV !== 'production' 
                ? error.message || 'An unexpected error occurred'
                : 'Please try refreshing the page or returning to the home page.'}
            </Text>
          </div>
          
          <Space h="lg" />
          
          <Group>
            {retryable && (
              <Button
                leftIcon={<IconRefresh size={18} />}
                onClick={reset}
                color="blue"
              >
                Refresh Application
              </Button>
            )}
            
            {showBackToHome && (
              <Button
                component="a"
                href="/"
                variant="outline"
                leftIcon={<IconArrowBackUp size={18} />}
              >
                Back to Home
              </Button>
            )}
          </Group>
          
          {process.env.NODE_ENV !== 'production' && (
            <div style={{ maxWidth: '100%', overflow: 'auto' }}>
              <Text size="sm" color="dimmed" mb="xs" weight={500}>
                Debug Information (only visible in development):
              </Text>
              <pre style={{ 
                background: theme.colors.gray[0], 
                padding: theme.spacing.sm,
                borderRadius: theme.radius.sm,
                maxHeight: 200,
                overflow: 'auto',
                fontSize: 12,
                whiteSpace: 'pre-wrap'
              }}>
                {error.stack}
                {errorInfo?.componentStack}
              </pre>
            </div>
          )}
        </Stack>
      </Container>
    );
  };

  return (
    <ErrorBoundary
      fallback={renderFallback}
      onError={handleError}
      retryable={retryable}
      errorType="client"
      className={className}
    >
      {children}
    </ErrorBoundary>
  );
};

export default GlobalErrorBoundary;