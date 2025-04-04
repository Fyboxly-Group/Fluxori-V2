import { Server as HttpServer } from 'http';
import { notificationRoutes } from './routes/notification.routes';
import { NotificationWebSocketManager } from './utils/websocket';
import { NotificationService } from './services/notification.service';

/**
 * Initialize the Notifications module
 * @param httpServer HTTP server instance for WebSocket
 */
export const initializeNotificationsModule = (httpServer: HttpServer) => {
  // Initialize WebSocket manager
  const websocketManager = NotificationWebSocketManager.getInstance();
  websocketManager.initialize(httpServer);
  
  console.log('Notifications module initialized');
};

// Export routes and services
export { notificationRoutes };
export { NotificationService } from './services/notification.service';
export { NotificationWebSocketManager } from './utils/websocket';
export { NotificationType, NotificationCategory } from './models/notification.model';