/**
 * Notification socket service
 * Handles real-time notifications using WebSockets
 */

import { io, Socket } from 'socket.io-client';
import { Notification } from '../types/notification.types';

class NotificationSocketService {
  private socket: Socket | null = null;
  private authToken: string = '';
  private apiUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
  }
  
  // Connect to the WebSocket server
  connect() {
    if (this.socket?.connected) {
      return; // Already connected
    }
    
    try {
      this.socket = io(`${this.apiUrl}/notifications`, {
        auth: {
          token: this.authToken
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      // Set up default event handlers
      this.socket.on('connect_error', (error: any) => {
        console.error('Notification socket connect error:', error);
      });
      
      this.socket.on('error', (error: any) => {
        console.error('Notification socket error:', error);
      });
      
    } catch (error) {
      console.error('Error initializing notification socket:', error);
    }
  }
  
  // Disconnect from the WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  // Subscribe to 'connect' event
  onConnect(callback: () => void) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('connect', callback);
    
    return () => {
      this.socket?.off('connect', callback);
    };
  }
  
  // Subscribe to 'disconnect' event
  onDisconnect(callback: () => void) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('disconnect', callback);
    
    return () => {
      this.socket?.off('disconnect', callback);
    };
  }
  
  // Subscribe to 'error' event
  onError(callback: (error: any) => void) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('error', callback);
    
    return () => {
      this.socket?.off('error', callback);
    };
  }
  
  // Subscribe to 'notification' event
  onNotification(callback: (data: any) => void) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('notification', callback);
    
    return () => {
      this.socket?.off('notification', callback);
    };
  }
  
  // Mark notification as read
  markAsRead(notificationId: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot mark notification as read');
      return;
    }
    
    this.socket.emit('notification:read', { notificationId });
  }
  
  // Mark all notifications as read
  markAllAsRead() {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot mark all notifications as read');
      return;
    }
    
    this.socket.emit('notification:read_all');
  }
  
  // Clear notification
  clearNotification(notificationId: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot clear notification');
      return;
    }
    
    this.socket.emit('notification:clear', { notificationId });
  }
}

export const notificationSocket = new NotificationSocketService();
