import { io, Socket } from 'socket.io-client';
import { Message } from '../types/chat.types';

// Create a singleton socket instance for the AI chat
class ChatSocket {
  private socket: Socket | null = null;
  private authToken: string | null = null;
  private url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';
  
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
  
  // Emit an event to the server
  emit(event: string, data: any) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    
    this.socket?.emit(event, data);
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
  
  // Register an event handler for incoming messages
  onMessage(callback: (message: Message) => void) {
    this.socket?.on('message', callback);
    return () => {
      this.socket?.off('message', callback);
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
export const chatSocket = new ChatSocket();
