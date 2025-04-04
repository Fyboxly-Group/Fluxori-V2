import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { DecodedJwtPayload } from '../../../middleware/auth.middleware';

// Connected clients map
interface ConnectedClient {
  userId: string;
  organizationId: string | null;
  socket: Socket;
  lastActivity: Date;
}

/**
 * NotificationWebSocketManager
 * Manages WebSocket connections for real-time notifications
 */
export class NotificationWebSocketManager {
  private static instance: NotificationWebSocketManager;
  private io: Server | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): NotificationWebSocketManager {
    if (!NotificationWebSocketManager.instance) {
      NotificationWebSocketManager.instance = new NotificationWebSocketManager();
    }
    return NotificationWebSocketManager.instance;
  }
  
  /**
   * Initialize WebSocket server for notifications
   * @param httpServer HTTP server instance
   */
  public initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      path: '/api/ws/notifications',
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });
    
    // Middleware for authentication
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        // Skip auth in development if flag is set
        if (process.env.NODE_ENV === 'development' && process.env.SKIP_WS_AUTH === 'true') {
          // Set a mock user ID for development
          socket.data.user = { id: 'dev-user-id', organizationId: 'dev-org-id' };
          return next();
        }
        
        if (!token) {
          return next(new Error('Authentication token is required'));
        }
        
        // Verify the token
        const secret = process.env.JWT_SECRET || 'default_secret';
        const secretKey = Buffer.from(secret, 'utf-8');
        
        jwt.verify(token, secretKey, (err, decoded) => {
          if (err) {
            return next(new Error('Invalid authentication token'));
          }
          
          // Store the user information in socket for later use
          socket.data.user = decoded as DecodedJwtPayload;
          next();
        });
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
    
    // Handle connections
    this.io.on('connection', (socket: any) => {
      const userId = socket.data.user?.id || socket.data.user?._id;
      const organizationId = socket.data.user?.organizationId;
      
      if (!userId) {
        socket.disconnect();
        return;
      }
      
      console.log(`User connected to notification WebSocket: ${userId}`);
      
      // Register client in our clients map
      this.clients.set(socket.id, {
        userId,
        organizationId: organizationId || null,
        socket,
        lastActivity: new Date()
      });
      
      // Handle acknowledgment events
      socket.on('notification_ack', (notificationId: any) => {
        // Update last activity
        const client = this.clients.get(socket.id);
        if (client) {
          client.lastActivity = new Date();
        }
        
        // Log acknowledgment (can be extended to update notification status in DB)
        console.log(`User ${userId} acknowledged notification ${notificationId}`);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected from notification WebSocket: ${userId}`);
        this.clients.delete(socket.id);
      });
    });
    
    console.log('Notification WebSocket server initialized');
    
    // Set up periodic cleanup of stale connections
    setInterval(() => this.cleanupStaleConnections(), 300000); // Every 5 minutes
  }
  
  /**
   * Send a notification to a specific user
   * @param userId User ID to send notification to
   * @param event Event name
   * @param data Notification data
   * @returns True if sent to at least one client, false otherwise
   */
  public sendToUser(userId: string, event: string, data: any): boolean {
    if (!this.io) {
      console.error('WebSocket server not initialized');
      return false;
    }
    
    let sent = false;
    
    for (const [socketId, client] of this.clients.entries()) {
      if (client.userId === userId) {
        client.socket.emit(event, data);
        sent = true;
        
        // Log the notification (for debugging)
        console.log(`Sent ${event} to user ${userId}`);
      }
    }
    
    return sent;
  }
  
  /**
   * Send a notification to all users in an organization
   * @param organizationId Organization ID
   * @param event Event name
   * @param data Notification data
   * @returns Number of clients the notification was sent to
   */
  public sendToOrganization(organizationId: string, event: string, data: any): number {
    if (!this.io) {
      console.error('WebSocket server not initialized');
      return 0;
    }
    
    let sentCount = 0;
    
    for (const [socketId, client] of this.clients.entries()) {
      if (client.organizationId === organizationId) {
        client.socket.emit(event, data);
        sentCount++;
      }
    }
    
    // Log the notification (for debugging)
    console.log(`Sent ${event} to ${sentCount} users in organization ${organizationId}`);
    
    return sentCount;
  }
  
  /**
   * Broadcast a notification to all connected clients
   * @param event Event name
   * @param data Notification data
   * @returns Number of clients the notification was sent to
   */
  public broadcast(event: string, data: any): number {
    if (!this.io) {
      console.error('WebSocket server not initialized');
      return 0;
    }
    
    this.io.emit(event, data);
    
    // Log the notification (for debugging)
    console.log(`Broadcast ${event} to all users`);
    
    return this.clients.size;
  }
  
  /**
   * Get count of connected clients
   */
  public getConnectedClientCount(): number {
    return this.clients.size;
  }
  
  /**
   * Get count of unique connected users
   */
  public getUniqueConnectedUserCount(): number {
    const uniqueUserIds = new Set<string>();
    
    for (const [socketId, client] of this.clients.entries()) {
      uniqueUserIds.add(client.userId);
    }
    
    return uniqueUserIds.size;
  }
  
  /**
   * Cleanup stale connections
   * @returns Number of connections cleaned up
   */
  private cleanupStaleConnections(): number {
    const now = new Date();
    const staleThreshold = 3600000; // 1 hour
    let cleanedCount = 0;
    
    for (const [socketId, client] of this.clients.entries()) {
      const timeSinceLastActivity = now.getTime() - client.lastActivity.getTime();
      
      if (timeSinceLastActivity > staleThreshold) {
        // Disconnect the socket
        client.socket.disconnect(true);
        
        // Remove from our clients map
        this.clients.delete(socketId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} stale WebSocket connections`);
    }
    
    return cleanedCount;
  }
}