import { useEffect, useRef, useState } from 'react';
import { 
  Paper, 
  Text, 
  Group, 
  Button, 
  Stack, 
  Title, 
  ThemeIcon, 
  Box, 
  useMantineTheme,
  Code,
  Collapse,
  Divider
} from '@mantine/core';
import { 
  IconAlertTriangle, 
  IconRefresh, 
  IconX, 
  IconFileAlert, 
  IconExclamationMark, 
  IconBug, 
  IconChevronDown, 
  IconChevronUp, 
  IconBuildingEstate
} from '@tabler/icons-react';
import gsap from 'gsap';
import { useMotionPreference } from '@/hooks/useMotionPreference';

export type ErrorType = 'api' | 'network' | 'validation' | 'permission' | 'notFound' | 'server' | 'client' | 'unknown';

export interface ErrorStateProps {
  /** Title of the error */
  title?: string;
  /** Error message to display */
  message: string;
  /** Error object for technical details (optional) */
  error?: Error | unknown;
  /** Type of error that occurred */
  type?: ErrorType;
  /** Whether to show retry button */
  retryable?: boolean;
  /** Function called when retry button is clicked */
  onRetry?: () => void;
  /** Whether to show close/dismiss button */
  dismissible?: boolean;
  /** Function called when dismiss button is clicked */
  onDismiss?: () => void;
  /** Custom action button text */
  actionText?: string;
  /** Function called when custom action button is clicked */
  onAction?: () => void;
  /** Whether to show or hide technical details by default */
  showDetails?: boolean;
  /** Whether to auto-animate the component on mount */
  animate?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Enhanced error state component with animated feedback
 * Displays user-friendly error messages with optional technical details
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  error,
  type = 'unknown',
  retryable = false,
  onRetry,
  dismissible = false,
  onDismiss,
  actionText,
  onAction,
  showDetails = false,
  animate = true,
  className
}) => {
  const theme = useMantineTheme();
  const paperRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const { motionLevel, reduced: reducedMotion } = useMotionPreference();
  const [detailsOpen, setDetailsOpen] = useState(showDetails);
  
  // Get the error icon based on type
  const getErrorIcon = () => {
    switch (type) {
      case 'api':
      case 'network':
        return <IconFileAlert size={28} />;
      case 'validation':
        return <IconExclamationMark size={28} />;
      case 'permission':
        return <IconBuildingEstate size={28} />;
      case 'notFound':
        return <IconX size={28} />;
      case 'server':
      case 'client':
        return <IconBug size={28} />;
      default:
        return <IconAlertTriangle size={28} />;
    }
  };
  
  // Get color based on error type
  const getErrorColor = () => {
    switch (type) {
      case 'api':
      case 'network':
        return 'blue';
      case 'validation':
        return 'yellow';
      case 'permission':
        return 'orange';
      case 'notFound':
        return 'cyan';
      case 'server':
        return 'red';
      case 'client':
        return 'pink';
      default:
        return 'red';
    }
  };
  
  // Get title based on error type if not provided
  const getErrorTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'api':
        return 'API Error';
      case 'network':
        return 'Network Error';
      case 'validation':
        return 'Validation Error';
      case 'permission':
        return 'Permission Denied';
      case 'notFound':
        return 'Not Found';
      case 'server':
        return 'Server Error';
      case 'client':
        return 'Application Error';
      default:
        return 'An Error Occurred';
    }
  };
  
  // Format error details
  const getErrorDetails = () => {
    if (!error) return null;
    
    // If error is an Error object
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    // If error is another type, try to stringify it
    try {
      return JSON.stringify(error, null, 2);
    } catch (e) {
      return 'Error details cannot be displayed';
    }
  };
  
  // Handle retry button click with animation
  const handleRetry = () => {
    if (!onRetry) return;
    
    if (paperRef.current && animate && motionLevel !== 'minimal' && !reducedMotion) {
      // Create a small shake animation using GSAP
      gsap.timeline()
        .to(paperRef.current, { 
          x: -5, 
          duration: 0.1, 
          ease: 'power1.inOut' 
        })
        .to(paperRef.current, { 
          x: 5, 
          duration: 0.1, 
          ease: 'power1.inOut' 
        })
        .to(paperRef.current, { 
          x: -3, 
          duration: 0.1, 
          ease: 'power1.inOut' 
        })
        .to(paperRef.current, { 
          x: 3, 
          duration: 0.1, 
          ease: 'power1.inOut' 
        })
        .to(paperRef.current, { 
          x: 0, 
          duration: 0.1, 
          ease: 'power1.inOut',
          onComplete: onRetry
        });
    } else {
      onRetry();
    }
  };
  
  // Entrance animation on mount
  useEffect(() => {
    if (paperRef.current && iconRef.current && animate && motionLevel !== 'minimal' && !reducedMotion) {
      // Create entrance animation
      gsap.fromTo(
        paperRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
      
      // Animate icon with a bounce effect
      gsap.fromTo(
        iconRef.current,
        { scale: 0.5, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.6, 
          delay: 0.2,
          ease: 'back.out(1.7)' 
        }
      );
    }
  }, [animate, motionLevel, reducedMotion]);
  
  // Toggle details with animation
  const toggleDetails = () => {
    setDetailsOpen(!detailsOpen);
  };
  
  // Format technical details for display
  const errorDetails = getErrorDetails();
  const formattedDetails = typeof errorDetails === 'string' 
    ? errorDetails 
    : errorDetails && JSON.stringify(errorDetails, null, 2);
  
  return (
    <Paper
      ref={paperRef}
      p="lg"
      radius="md"
      withBorder
      shadow="md"
      className={className}
      sx={(theme) => ({
        borderColor: theme.colors[getErrorColor()][5],
        borderLeftWidth: 4,
        position: 'relative',
        overflow: 'hidden'
      })}
    >
      <Stack spacing="md">
        <Group position="apart">
          <Group spacing="md">
            <Box ref={iconRef}>
              <ThemeIcon 
                size="xl" 
                radius="xl" 
                color={getErrorColor()}
                variant="light"
              >
                {getErrorIcon()}
              </ThemeIcon>
            </Box>
            <Title order={4}>{getErrorTitle()}</Title>
          </Group>
          
          {dismissible && onDismiss && (
            <Button 
              variant="subtle" 
              color="gray" 
              compact 
              onClick={onDismiss}
              rightIcon={<IconX size={16} />}
            >
              Dismiss
            </Button>
          )}
        </Group>
        
        <Text>{message}</Text>
        
        <Group position={error ? 'apart' : 'right'}>
          {error && (
            <Button 
              variant="subtle" 
              color="gray" 
              compact
              onClick={toggleDetails}
              rightIcon={detailsOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            >
              {detailsOpen ? 'Hide Details' : 'Show Technical Details'}
            </Button>
          )}
          
          <Group spacing="xs">
            {actionText && onAction && (
              <Button 
                variant="outline" 
                onClick={onAction}
              >
                {actionText}
              </Button>
            )}
            
            {retryable && onRetry && (
              <Button 
                leftIcon={<IconRefresh size={16} />}
                onClick={handleRetry}
              >
                Retry
              </Button>
            )}
          </Group>
        </Group>
        
        {error && (
          <Collapse in={detailsOpen}>
            <Divider mt="xs" mb="md" />
            <Text size="sm" weight={500} mb="xs">Technical Details</Text>
            <Code block>{formattedDetails}</Code>
          </Collapse>
        )}
      </Stack>
    </Paper>
  );
};

export default ErrorState;