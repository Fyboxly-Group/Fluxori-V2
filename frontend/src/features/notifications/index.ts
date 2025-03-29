/**
 * Notifications Feature
 * Exports components and hooks for the notification system
 */

// Export components
export { NotificationBell } from './components/NotificationBell';
export { NotificationCenter } from './components/NotificationCenter';
export { NotificationList } from './components/NotificationList';
export { useToastNotifications } from './components/ToastNotification';
export { NotificationDemo } from './components/NotificationDemo';

// Export hooks
export { 
  NotificationProvider, 
  useNotifications 
} from './hooks/useNotifications';

// Export types
export { 
  NotificationType, 
  NotificationCategory, 
  type Notification 
} from './api/notification.api';