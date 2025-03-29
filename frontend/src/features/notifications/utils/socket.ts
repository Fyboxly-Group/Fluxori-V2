/**
 * WebSocket utility for Real-Time Notifications
 * Handles real-time notification delivery from the backend
 */

// Event listener types
import { Notification } from '../api/notification.api';

// Import internal utils
type UnknownError = unknown;

interface NotificationEvent {
  type: string;
  notification?: Notification;
  notificationId?: string;
  [key: string]: unknown;
}

type NotificationListener = (data: NotificationEvent) => void;
type ErrorListener = (error: Error | Event | UnknownError) => void;
type ConnectionListener = () => void;

export class NotificationSocket {
  // Singleton instance
  private static instance: NotificationSocket;
  
  // WebSocket instance
  private socket: WebSocket | null = null;
  
  // Connection state
  private isConnecting = false;
  private isConnected = false;
  private shouldReconnect = true;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // More attempts for notifications
  private reconnectInterval = 3000; // 3 seconds
  
  // Authentication token
  private authToken: string | null = null;
  
  // Event listeners
  private notificationListeners: NotificationListener[] = [];
  private errorListeners: ErrorListener[] = [];
  private connectListeners: ConnectionListener[] = [];
  private disconnectListeners: ConnectionListener[] = [];
  
  // Private constructor for singleton pattern
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): NotificationSocket {
    if (!NotificationSocket.instance) {
      NotificationSocket.instance = new NotificationSocket();
    }
    return NotificationSocket.instance;
  }
  
  /**
   * Set authentication token for the connection
   * @param token JWT token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    
    // If already connected, reconnect with new token
    if (this.isConnected) {
      this.disconnect();
      this.connect();
    }
  }
  
  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    // Don't connect if already connecting or connected
    if (this.isConnecting || this.isConnected) {
      return;
    }
    
    this.isConnecting = true;
    this.shouldReconnect = true;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // Construct WebSocket URL - adjusted for notifications
    let wsUrl = '';
    if (process.env.NODE_ENV === 'development') {
      wsUrl = `${protocol}//${process.env.NEXT_PUBLIC_API_URL || 'localhost:8080'}/api/ws/notifications`;
    } else {
      wsUrl = `${protocol}//${host}/api/ws/notifications`;
    }
    
    // Create WebSocket connection
    try {
      this.socket = new WebSocket(wsUrl);
      
      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      
      // Send auth token immediately after connection if available
      this.socket.addEventListener('open', () => {
        if (this.authToken) {
          this.socket?.send(JSON.stringify({
            type: 'auth',
            token: this.authToken
          }));
        }
      });
    } catch (error) {
      console.error('Error creating notification WebSocket connection:', error);
      this.isConnecting = false;
      this.notifyErrorListeners(error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
  }
  
  /**
   * Mark notification as read
   * @param notificationId Notification ID to mark as read
   */
  public markAsRead(notificationId: string): void {
    if (!this.isConnected || !this.socket) {
      throw new Error('WebSocket not connected');
    }
    
    // Construct message payload
    const payload = {
      type: 'mark_read',
      notificationId
    };
    
    // Send message
    this.socket.send(JSON.stringify(payload));
  }
  
  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): void {
    if (!this.isConnected || !this.socket) {
      throw new Error('WebSocket not connected');
    }
    
    // Construct message payload
    const payload = {
      type: 'mark_all_read'
    };
    
    // Send message
    this.socket.send(JSON.stringify(payload));
  }
  
  /**
   * Clear notification
   * @param notificationId Notification ID to clear
   */
  public clearNotification(notificationId: string): void {
    if (!this.isConnected || !this.socket) {
      throw new Error('WebSocket not connected');
    }
    
    // Construct message payload
    const payload = {
      type: 'clear_notification',
      notificationId
    };
    
    // Send message
    this.socket.send(JSON.stringify(payload));
  }
  
  /**
   * Add event listener for notifications
   * @param listener Function to call when a notification is received
   */
  public onNotification(listener: NotificationListener): () => void {
    this.notificationListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Add event listener for errors
   * @param listener Function to call when an error occurs
   */
  public onError(listener: ErrorListener): () => void {
    this.errorListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Add event listener for connection
   * @param listener Function to call when connection is established
   */
  public onConnect(listener: ConnectionListener): () => void {
    this.connectListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.connectListeners = this.connectListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Add event listener for disconnection
   * @param listener Function to call when connection is closed
   */
  public onDisconnect(listener: ConnectionListener): () => void {
    this.disconnectListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.disconnectListeners = this.disconnectListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Check if WebSocket is connected
   */
  public isSocketConnected(): boolean {
    return this.isConnected && this.socket !== null;
  }
  
  // Private methods for handling WebSocket events
  
  private handleOpen(): void {
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    this.notifyConnectListeners();
  }
  
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as NotificationEvent;
      if (data.type === 'new_notification' || 
          data.type === 'notifications_read_all' || 
          data.type === 'notifications_cleared' ||
          data.type === 'organization_notification' ||
          data.type === 'system_broadcast') {
        this.notifyNotificationListeners(data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      // Convert unknown error to Error object
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.notifyErrorListeners(errorObj);
    }
  }
  
  private handleError(event: Event): void {
    console.error('Notification WebSocket error:', event);
    // Use the event directly as it matches our Error | Event type
    this.notifyErrorListeners(event);
  }
  
  private handleClose(event: CloseEvent): void {
    this.isConnected = false;
    this.isConnecting = false;
    this.socket = null;
    this.notifyDisconnectListeners();
    
    // Log closure code and reason
    console.log(`Notification WebSocket closed: ${event.code} - ${event.reason}`);
    
    // Try to reconnect if needed
    if (this.shouldReconnect) {
      this.scheduleReconnect();
    }
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached, stopping reconnect');
      this.shouldReconnect = false;
      return;
    }
    
    this.reconnectAttempts++;
    
    // Exponential backoff for reconnect
    const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`Scheduling notification reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect notification socket... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }
  
  // Notify event listeners
  
  private notifyNotificationListeners(data: NotificationEvent): void {
    for (const listener of this.notificationListeners) {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    }
  }
  
  private notifyErrorListeners(error: Error | Event | UnknownError): void {
    for (const listener of this.errorListeners) {
      try {
        listener(error);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    }
  }
  
  private notifyConnectListeners(): void {
    for (const listener of this.connectListeners) {
      try {
        listener();
      } catch (error) {
        console.error('Error in connect listener:', error);
      }
    }
  }
  
  private notifyDisconnectListeners(): void {
    for (const listener of this.disconnectListeners) {
      try {
        listener();
      } catch (error) {
        console.error('Error in disconnect listener:', error);
      }
    }
  }
}