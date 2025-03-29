# Real-Time Notifications Feature

This feature provides a real-time notification system for the Fluxori V2 application, enabling push notifications from the backend to the frontend via WebSockets.

## Components

### 1. WebSocket Client

The notification system uses a WebSocket connection to receive real-time updates from the backend:

- **NotificationSocket**: Singleton class that manages the WebSocket connection
- Features automatic reconnection with exponential backoff
- Authenticates using JWT tokens
- Provides event-based interfaces for notifications, errors, and connection state

### 2. Notification Context

A React Context provider for managing notification state:

- **NotificationProvider**: Context provider component
- **useNotifications**: Hook for accessing notification state and methods
- Manages notification fetching, reading, and clearing
- Handles WebSocket connection state

### 3. UI Components

Several UI components for displaying and interacting with notifications:

- **NotificationBell**: Bell icon with unread count badge for navbar
- **NotificationList**: List of notifications with read/clear actions
- **NotificationCenter**: Full-page notification management interface
- **ToastNotification**: Toast notifications for immediate alerts

## Usage

### Basic Setup

Add the NotificationProvider to your application layout:

```tsx
import { NotificationProvider } from '@/features/notifications';

function AppLayout({ children }) {
  const { token } = useAuth();
  
  return (
    <NotificationProvider authToken={token}>
      {children}
    </NotificationProvider>
  );
}
```

### Adding the Notification Bell to Navigation

```tsx
import { NotificationBell } from '@/features/notifications';

function Navbar() {
  return (
    <HStack>
      <Logo />
      <Spacer />
      <NotificationBell />
      <UserMenu />
    </HStack>
  );
}
```

### Creating a Notification Page

```tsx
import { NotificationCenter } from '@/features/notifications';

function NotificationsPage() {
  return (
    <Container>
      <Heading>Notifications</Heading>
      <NotificationCenter />
    </Container>
  );
}
```

### Using Toast Notifications

```tsx
import { useToastNotifications } from '@/features/notifications';

function App() {
  // This will automatically show toast notifications for new notifications
  useToastNotifications();
  
  return <>{/* App content */}</>;
}
```

## Notification Types

The system supports different types of notifications:

- **Alert**: Critical notifications that require immediate attention
- **Info**: Informational notifications
- **Success**: Success notifications
- **Warning**: Warning notifications
- **Error**: Error notifications
- **Sync Status**: Updates about synchronization status
- **System**: System-level notifications

## Notification Categories

Notifications are organized by category:

- **Inventory**: Inventory-related notifications
- **Marketplace**: Marketplace-related notifications
- **Shipping**: Shipping-related notifications
- **System**: System-level notifications
- **Task**: Task-related notifications
- **AI**: AI-related notifications
- **Security**: Security-related notifications
- **Billing**: Billing-related notifications

## Backend Integration

The frontend notification system connects to the backend WebSocket server at `/api/ws/notifications` and handles the following events:

- `new_notification`: New notification received
- `notifications_read_all`: All notifications marked as read
- `notifications_cleared`: Notification(s) cleared
- `organization_notification`: Organization-wide notification
- `system_broadcast`: System-wide broadcast

## REST API Fallback

The notification system includes REST API fallback for environments where WebSockets are not available:

- `GET /api/notifications`: Get all notifications
- `PUT /api/notifications/:id/read`: Mark notification as read
- `PUT /api/notifications/read-all`: Mark all notifications as read
- `DELETE /api/notifications/:id`: Clear a notification
- `DELETE /api/notifications/clear-all`: Clear all notifications