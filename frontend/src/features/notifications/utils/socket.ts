import { io, Socket } from 'socket.io-client';
import { Notification } from '../api/notification.api';

// Create a singleton socket instance for notifications
class NotificationSocket {
  private socket: Socket | null = null;
  private authToken: string | null = null;
  private url = process.env.NEXT_PUBLIC_NOTIFICATION_WEBSOCKET_URL || 'ws://localhost:3002';
  
  // Connect to the socket
  connect() {
    if (this.socket) {
      return this.socket;
    }
    
    this.socket = io(this.url, {
      auth: {
        token: this.authToken
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    return this.socket;
  }
  
  // Disconnect from the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
  }
  
  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }
  
  // Mark a notification as read
  markAsRead(notificationId: string) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    
    this.socket?.emit('mark_as_read', { notificationId });
  }
  
  // Mark all notifications as read
  markAllAsRead() {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    
    this.socket?.emit('mark_all_as_read');
  }
  
  // Clear a notification
  clearNotification(notificationId: string) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    
    this.socket?.emit('clear_notification', { notificationId });
  }
  
  // Register an event handler for the 'connect' event
  onConnect(callback: () => void) {
    this.socket?.on('connect', callback);
    return () => {
      this.socket?.off('connect', callback);
    };
  }
  
  // Register an event handler for the 'disconnect' event
  onDisconnect(callback: () => void) {
    this.socket?.on('disconnect', callback);
    return () => {
      this.socket?.off('disconnect', callback);
    };
  }
  
  // Register an event handler for the 'error' event
  onError(callback: (error: Error) => void) {
    this.socket?.on('error', callback);
    return () => {
      this.socket?.off('error', callback);
    };
  }
  
  // Register an event handler for incoming notifications
  onNotification(callback: (data: { type: string; notification?: Notification; notificationId?: string }) => void) {
    this.socket?.on('notification', callback);
    return () => {
      this.socket?.off('notification', callback);
    };
  }
  
  // Generic event handler registration
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
    return () => {
      this.socket?.off(event, callback);
    };
  }
  
  // Remove event handler
  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }
}

// Export a singleton instance
export const notificationSocket = new NotificationSocket();
