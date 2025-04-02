import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import { AppError, ErrorCategory } from '@/api/api-client';

/**
 * Show a success notification with a custom message
 */
export const showSuccessNotification = (
  title: string,
  message: string,
  options: {
    autoClose?: number | boolean;
    withCloseButton?: boolean;
  } = {}
) => {
  const { autoClose = 5000, withCloseButton = true } = options;
  
  return notifications.show({
    title,
    message,
    color: 'green',
    icon: <IconCheck size={18} />,
    autoClose,
    withCloseButton,
  });
};

/**
 * Show an error notification with a custom message or from an AppError
 */
export const showErrorNotification = (
  errorOrTitle: string | AppError | Error,
  message?: string,
  options: {
    autoClose?: number | boolean;
    withCloseButton?: boolean;
    includeTechnicalDetails?: boolean;
  } = {}
) => {
  const { autoClose = 10000, withCloseButton = true, includeTechnicalDetails = false } = options;
  
  let title: string;
  let errorMessage: string;
  let additionalDetails: string | undefined;
  
  if (typeof errorOrTitle === 'string') {
    title = errorOrTitle;
    errorMessage = message || 'An unexpected error occurred';
  } else if (errorOrTitle instanceof AppError) {
    // Handle AppError with category
    title = getCategoryErrorTitle(errorOrTitle.category) || 'Error';
    errorMessage = errorOrTitle.message;
    
    if (includeTechnicalDetails && errorOrTitle.details) {
      try {
        additionalDetails = typeof errorOrTitle.details === 'string' 
          ? errorOrTitle.details 
          : JSON.stringify(errorOrTitle.details, null, 2);
      } catch (e) {
        // Ignore if we can't stringify
      }
    }
  } else {
    // Handle standard Error
    title = 'Error';
    errorMessage = errorOrTitle.message || 'An unexpected error occurred';
  }
  
  return notifications.show({
    title,
    message: additionalDetails 
      ? `${errorMessage}\n\n${additionalDetails}`
      : errorMessage,
    color: 'red',
    icon: <IconX size={18} />,
    autoClose,
    withCloseButton,
  });
};

/**
 * Show an info notification with a custom message
 */
export const showInfoNotification = (
  title: string,
  message: string,
  options: {
    autoClose?: number | boolean;
    withCloseButton?: boolean;
  } = {}
) => {
  const { autoClose = 5000, withCloseButton = true } = options;
  
  return notifications.show({
    title,
    message,
    color: 'blue',
    icon: <IconInfoCircle size={18} />,
    autoClose,
    withCloseButton,
  });
};

/**
 * Show a warning notification with a custom message
 */
export const showWarningNotification = (
  title: string,
  message: string,
  options: {
    autoClose?: number | boolean;
    withCloseButton?: boolean;
  } = {}
) => {
  const { autoClose = 7000, withCloseButton = true } = options;
  
  return notifications.show({
    title,
    message,
    color: 'yellow',
    icon: <IconAlertCircle size={18} />,
    autoClose,
    withCloseButton,
  });
};

/**
 * Get a user-friendly title based on error category
 */
const getCategoryErrorTitle = (category?: ErrorCategory): string => {
  if (!category) return 'Error';
  
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication Error';
    case ErrorCategory.AUTHORIZATION:
      return 'Permission Denied';
    case ErrorCategory.VALIDATION:
      return 'Validation Error';
    case ErrorCategory.NETWORK:
      return 'Connection Error';
    case ErrorCategory.API_LIMIT:
      return 'Rate Limit Exceeded';
    case ErrorCategory.MARKETPLACE:
      return 'Marketplace Error';
    case ErrorCategory.SERVER:
      return 'Server Error';
    default:
      return 'Error';
  }
};

/**
 * Handle API errors automatically
 */
export const handleApiError = (
  error: unknown,
  options: {
    defaultTitle?: string;
    defaultMessage?: string;
    includeTechnicalDetails?: boolean;
  } = {}
) => {
  const { 
    defaultTitle = 'Error', 
    defaultMessage = 'Something went wrong. Please try again.',
    includeTechnicalDetails = false
  } = options;
  
  if (error instanceof AppError) {
    return showErrorNotification(
      error,
      undefined,
      { includeTechnicalDetails }
    );
  } else if (error instanceof Error) {
    return showErrorNotification(
      defaultTitle,
      error.message || defaultMessage
    );
  } else {
    return showErrorNotification(
      defaultTitle,
      defaultMessage
    );
  }
};

export default {
  showSuccessNotification,
  showErrorNotification,
  showInfoNotification,
  showWarningNotification,
  handleApiError,
};