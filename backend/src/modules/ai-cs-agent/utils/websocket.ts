import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { WebSocketHandler } from '../controllers/conversation.controller';

/**
 * Initialize WebSocket server for AI Customer Service Agent
 * @param httpServer HTTP server instance
 */
export const initializeWebSocket = (httpServer: HttpServer): void => {
  const io = new Server(httpServer, {
    path: '/api/ws/ai-cs-agent',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Middleware for authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      // Skip auth in development if flag is set
      if (process.env.NODE_ENV === 'development' && process.env.SKIP_WS_AUTH === 'true') {
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
        socket.data.user = decoded;
        next();
      });
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });
  
  // Handle connections
  io.on('connection', (socket) => {
    console.log('Client connected to AI Customer Service WebSocket:', socket.id);
    
    // Handle message events
    socket.on('message', async (data) => {
      try {
        // Add user ID from authentication if not provided
        if (socket.data.user && !data.userId) {
          data.userId = socket.data.user.id || socket.data.user.userId;
        }
        
        // Pass to the handler
        await WebSocketHandler.handleMessage(socket, data);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        socket.emit('error', { message: 'Error processing message' });
      }
    });
    
    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('Client disconnected from AI Customer Service WebSocket:', socket.id);
    });
  });
  
  console.log('AI Customer Service WebSocket server initialized');
};