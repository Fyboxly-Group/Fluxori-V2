import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatSocket } from '../utils/socket';
import { Message, ChatRole, ConversationState } from '../types/chat.types';

interface UseConversationOptions {
  autoConnect?: boolean;
  onNewMessage?: (message: Message) => void;
}

export function useConversation(options: UseConversationOptions = {}) {
  const { autoConnect = true, onNewMessage } = options;
  
  // State
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConversationState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs
  const onNewMessageRef = useRef(onNewMessage);
  
  // Update ref when callback changes
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);
  
  // Handle socket connection
  useEffect(() => {
    if (autoConnect) {
      chatSocket.connect();
    }
    
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    
    const handleError = (err: Error) => {
      setError(err);
      setStatus('error');
    };
    
    // Set up socket event handlers
    chatSocket.on('connect', handleConnect);
    chatSocket.on('disconnect', handleDisconnect);
    chatSocket.on('error', handleError);
    chatSocket.on('message', handleNewMessage);
    
    // Cleanup listeners when unmounting
    return () => {
      chatSocket.off('connect', handleConnect);
      chatSocket.off('disconnect', handleDisconnect);
      chatSocket.off('error', handleError);
      chatSocket.off('message', handleNewMessage);
      
      if (autoConnect) {
        chatSocket.disconnect();
      }
    };
  }, [autoConnect]);
  
  // Handle new incoming messages
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    setStatus('idle');
    
    // Call the onNewMessage callback if provided
    if (onNewMessageRef.current) {
      onNewMessageRef.current(message);
    }
  }, []);
  
  // Start a new conversation
  const startConversation = useCallback(() => {
    // Generate a new conversation ID
    const newConversationId = uuidv4();
    setConversationId(newConversationId);
    
    // Clear messages
    setMessages([]);
    
    // Send initialization message to server
    chatSocket.emit('start_conversation', { conversationId: newConversationId });
    
    return newConversationId;
  }, []);
  
  // Send a message to the conversation
  const sendMessage = useCallback((content: string) => {
    if (!conversationId) {
      throw new Error('No active conversation. Call startConversation first.');
    }
    
    if (!content || content.trim() === '') {
      return;
    }
    
    // Create the message object
    const message: Message = {
      id: uuidv4(),
      conversationId,
      content,
      role: ChatRole.USER,
      timestamp: new Date().toISOString(),
    };
    
    // Add message to local state
    setMessages(prev => [...prev, message]);
    
    // Set status to loading while waiting for response
    setStatus('loading');
    
    // Send message to server
    chatSocket.emit('message', message);
    
    return message;
  }, [conversationId]);
  
  // Load a specific conversation by ID
  const loadConversation = useCallback(async (id: string) => {
    try {
      setStatus('loading');
      
      // TODO: Implement API call to load conversation history
      const response = await fetch(`/api/conversations/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load conversation: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setConversationId(id);
      setMessages(data.messages);
      setStatus('idle');
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus('error');
      throw err;
    }
  }, []);
  
  // Clear the current conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setStatus('idle');
    setError(null);
  }, []);
  
  return {
    conversationId,
    messages,
    status,
    error,
    isConnected,
    startConversation,
    sendMessage,
    loadConversation,
    clearConversation,
  };
}

export default useConversation;