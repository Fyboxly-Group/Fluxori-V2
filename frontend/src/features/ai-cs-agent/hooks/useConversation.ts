import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AiCsAgentSocket } from '../utils/socket';
import { conversationApi, Conversation, Message, ProcessMessageResponse } from '../api/conversation.api';
import { createToaster } from '@chakra-ui/react/toast';

// Types for the useConversation hook
interface ConversationState {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  conversationId: string | null;
  isEscalated: boolean;
  escalationReason: string | null;
  isTyping: boolean;
}

interface StreamingResponse {
  type: string;
  data?: any;
  error?: string;
  message?: string;
  conversationId?: string;
  token?: string;
}

interface UseConversationOptions {
  userId: string;
  conversationId?: string;
  organizationId?: string;
  useWebSocket?: boolean;
  onEscalation?: (reason: string) => void;
}

/**
 * Hook for managing conversation with the AI Customer Service Agent
 * Supports both WebSocket and REST API communication
 */
export function useConversation({
  userId,
  conversationId: initialConversationId,
  organizationId,
  useWebSocket = true,
  onEscalation
}: UseConversationOptions) {
  // State for the conversation
  const [state, setState] = useState<ConversationState>({
    messages: [],
    isLoading: false,
    isError: false,
    error: null,
    conversationId: initialConversationId || null,
    isEscalated: false,
    escalationReason: null,
    isTyping: false
  });
  
  // References
  const socketRef = useRef<AiCsAgentSocket | null>(null);
  const messageQueueRef = useRef<string[]>([]);
  const streamBufferRef = useRef<string>('');
  const queryClient = useQueryClient();
  const toast = createToaster();
  
  // Get auth token from localStorage
  const getAuthToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }, []);
  
  // Initialize socket connection
  useEffect(() => {
    if (!useWebSocket) return;
    
    const token = getAuthToken();
    if (!token) {
      console.error('Auth token not found, WebSocket communication will not be authenticated');
    }
    
    socketRef.current = AiCsAgentSocket.getInstance();
    socketRef.current.setAuthToken(token || '');
    
    // Set up event listeners
    const messageUnsubscribe = socketRef.current.onMessage(handleSocketMessage);
    const errorUnsubscribe = socketRef.current.onError(handleSocketError);
    const connectUnsubscribe = socketRef.current.onConnect(handleSocketConnect);
    const disconnectUnsubscribe = socketRef.current.onDisconnect(handleSocketDisconnect);
    
    // Connect to socket
    socketRef.current.connect();
    
    // Cleanup on unmount
    return () => {
      messageUnsubscribe();
      errorUnsubscribe();
      connectUnsubscribe();
      disconnectUnsubscribe();
    };
  }, [useWebSocket, getAuthToken]);
  
  // Handler for socket messages
  const handleSocketMessage = useCallback((data: StreamingResponse) => {
    switch (data.type) {
      case 'ack':
        // Acknowledgment received, message is being processed
        if (data.conversationId && !state.conversationId) {
          setState(prev => ({
            ...prev,
            conversationId: data.conversationId || null
          }));
        }
        setState(prev => ({ ...prev, isTyping: true }));
        break;
        
      case 'token':
        // Update the streaming buffer with the new token
        if (data.token) {
          streamBufferRef.current += data.token;
          
          // Show the streaming response in real-time by updating the last message
          setState(prev => {
            const messages = [...prev.messages];
            const lastMessageIndex = messages.findIndex(m => m.role === 'assistant' && m.metadata?.streaming);
            
            if (lastMessageIndex >= 0) {
              // Update existing streaming message
              messages[lastMessageIndex] = {
                ...messages[lastMessageIndex],
                content: streamBufferRef.current
              };
            } else {
              // Add new streaming message
              messages.push({
                role: 'assistant',
                content: streamBufferRef.current,
                timestamp: new Date().toISOString(),
                metadata: { streaming: true }
              });
            }
            
            return {
              ...prev,
              messages,
              isTyping: true
            };
          });
        }
        break;
        
      case 'end_stream':
        // End of streaming response
        setState(prev => {
          const messages = [...prev.messages];
          const lastMessageIndex = messages.findIndex(m => m.role === 'assistant' && m.metadata?.streaming);
          
          if (lastMessageIndex >= 0) {
            // Update the streaming message to remove the streaming flag
            messages[lastMessageIndex] = {
              ...messages[lastMessageIndex],
              metadata: { ...messages[lastMessageIndex].metadata, streaming: false }
            };
          }
          
          return {
            ...prev,
            messages,
            isTyping: false
          };
        });
        
        // Clear the streaming buffer
        streamBufferRef.current = '';
        break;
        
      case 'response':
        // Full response received
        if (data.data) {
          const response = data.data as ProcessMessageResponse;
          const timestamp = new Date().toISOString();
          
          setState(prev => {
            // Find if we already have a streaming message that needs to be replaced
            const messages = [...prev.messages];
            const streamingIndex = messages.findIndex(m => m.role === 'assistant' && m.metadata?.streaming);
            
            if (streamingIndex >= 0) {
              // Replace the streaming message with the final response
              messages[streamingIndex] = {
                role: 'assistant',
                content: response.aiResponse,
                timestamp,
                metadata: {
                  tokens: response.usage.tokens,
                  confidence: response.usage.confidence
                }
              };
            } else {
              // Add new message
              messages.push({
                role: 'assistant',
                content: response.aiResponse,
                timestamp,
                metadata: {
                  tokens: response.usage.tokens,
                  confidence: response.usage.confidence
                }
              });
            }
            
            return {
              ...prev,
              messages,
              conversationId: response.conversationId,
              isEscalated: response.isEscalated,
              escalationReason: response.escalationReason || null,
              isLoading: false,
              isTyping: false
            };
          });
          
          // Handle escalation if needed
          if (response.isEscalated && onEscalation) {
            onEscalation(response.escalationReason || 'Unknown reason');
          }
          
          // Invalidate queries to get the updated conversation
          if (response.conversationId) {
            queryClient.invalidateQueries({
              queryKey: ['conversation', response.conversationId]
            });
          }
        }
        break;
        
      case 'error':
        // Error from the backend
        const errorMessage = data.message || data.error || 'Unknown error';
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          isError: true,
          error: new Error(errorMessage),
          isTyping: false
        }));
        
        toast.show({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        
        // Handle insufficient credits error
        if (data.error === 'INSUFFICIENT_CREDITS') {
          // You might want to handle this specially, e.g. redirect to billing page
          toast.show({
            title: 'Insufficient Credits',
            description: 'You have run out of credits. Please purchase more to continue.',
            status: 'warning',
            duration: 10000,
            isClosable: true
          });
        }
        break;
      
      default:
        console.warn('Unknown message type received:', data.type);
    }
  }, [state, onEscalation, queryClient, toast]);
  
  // Socket error handler
  const handleSocketError = useCallback((error: any) => {
    console.error('WebSocket error:', error);
    
    setState(prev => ({
      ...prev,
      isError: true,
      error: error instanceof Error ? error : new Error('WebSocket error'),
      isLoading: false,
      isTyping: false
    }));
    
    toast.show({
      title: 'Connection Error',
      description: 'Failed to connect to the chat service. Please try again.',
      status: 'error',
      duration: 5000,
      isClosable: true
    });
  }, [toast]);
  
  // Socket connect handler
  const handleSocketConnect = useCallback(() => {
    console.log('WebSocket connected');
    
    // Process any queued messages
    if (messageQueueRef.current.length > 0) {
      const messagesToSend = [...messageQueueRef.current];
      messageQueueRef.current = [];
      
      messagesToSend.forEach(message => {
        sendMessageViaWebSocket(message);
      });
    }
  }, []);
  
  // Socket disconnect handler
  const handleSocketDisconnect = useCallback(() => {
    console.log('WebSocket disconnected');
    
    setState(prev => ({
      ...prev,
      isTyping: false
    }));
  }, []);
  
  // Function to send message via WebSocket
  const sendMessageViaWebSocket = useCallback((messageText: string) => {
    if (!socketRef.current || !userId) {
      // Queue message for when socket connects
      messageQueueRef.current.push(messageText);
      return;
    }
    
    try {
      if (!socketRef.current.isSocketConnected()) {
        // Reconnect and queue the message
        messageQueueRef.current.push(messageText);
        socketRef.current.connect();
        return;
      }
      
      // Send message via WebSocket
      socketRef.current.sendMessage(
        userId,
        messageText,
        state.conversationId || undefined,
        organizationId
      );
      
      // Add user message to state
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
          }
        ],
        isLoading: true,
        isError: false,
        error: null
      }));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      
      // Fall back to REST API
      sendMessageViaRest(messageText);
    }
  }, [userId, state.conversationId, organizationId, sendMessageViaRest]);
  
  // REST API mutation for sending messages
  const messageMutation = useMutation({
    mutationFn: conversationApi.sendMessage,
    onSuccess: (data) => {
      const timestamp = new Date().toISOString();
      
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content: data.aiResponse,
            timestamp,
            metadata: {
              tokens: data.usage.tokens,
              confidence: data.usage.confidence
            }
          }
        ],
        conversationId: data.conversationId,
        isEscalated: data.isEscalated,
        escalationReason: data.escalationReason || null,
        isLoading: false,
        isTyping: false
      }));
      
      // Handle escalation if needed
      if (data.isEscalated && onEscalation) {
        onEscalation(data.escalationReason || 'Unknown reason');
      }
      
      // Invalidate queries to get the updated conversation
      if (data.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['conversation', data.conversationId]
        });
      }
    },
    onError: (error: any) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error,
        isTyping: false
      }));
      
      toast.show({
        title: 'Error',
        description: error?.message || 'Failed to send message',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  });
  
  // Function to send message via REST API
  function sendMessageViaRest(messageText: string) {
    // Add user message to state immediately
    setState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          role: 'user',
          content: messageText,
          timestamp: new Date().toISOString()
        }
      ],
      isLoading: true,
      isError: false,
      error: null,
      isTyping: true
    }));
    
    // Send to the API
    messageMutation.mutate({
      message: messageText,
      conversationId: state.conversationId || undefined,
      organizationId
    });
  }
  
  // Query to load conversation if ID is provided
  const { data: conversationData } = useQuery({
    queryKey: ['conversation', state.conversationId],
    queryFn: () => state.conversationId ? conversationApi.getConversation(state.conversationId) : null,
    enabled: !!state.conversationId && state.messages.length === 0, // Only load if we have an ID and no messages
    refetchOnWindowFocus: false
  });
  
  // Use conversation data from query if available
  useEffect(() => {
    if (conversationData && state.messages.length === 0) {
      setState(prev => ({
        ...prev,
        messages: conversationData.messages,
        isEscalated: conversationData.status === 'escalated',
        escalationReason: conversationData.metadata?.escalationReason || null
      }));
    }
  }, [conversationData]);
  
  // Function to send a message (uses WebSocket or REST API based on preference)
  const sendMessage = useCallback((messageText: string) => {
    if (!messageText.trim()) return;
    
    if (useWebSocket) {
      sendMessageViaWebSocket(messageText);
    } else {
      sendMessageViaRest(messageText);
    }
  }, [useWebSocket, sendMessageViaWebSocket]);
  
  // Function to clear conversation
  const clearConversation = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      isError: false,
      error: null,
      conversationId: null,
      isEscalated: false,
      escalationReason: null,
      isTyping: false
    });
  }, []);
  
  // Mutation for closing a conversation
  const closeMutation = useMutation({
    mutationFn: conversationApi.closeConversation,
    onSuccess: () => {
      clearConversation();
      
      toast.show({
        title: 'Conversation Closed',
        description: 'The conversation has been closed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Invalidate all conversation queries
      queryClient.invalidateQueries({
        queryKey: ['conversations']
      });
    },
    onError: (error: any) => {
      toast.show({
        title: 'Error',
        description: error?.message || 'Failed to close conversation',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  });
  
  // Function to close the conversation
  const closeConversation = useCallback(() => {
    if (!state.conversationId) {
      clearConversation();
      return;
    }
    
    closeMutation.mutate(state.conversationId);
  }, [state.conversationId, clearConversation, closeMutation]);
  
  return {
    // State
    messages: state.messages,
    isLoading: state.isLoading,
    isError: state.isError,
    error: state.error,
    conversationId: state.conversationId,
    isEscalated: state.isEscalated,
    escalationReason: state.escalationReason,
    isTyping: state.isTyping,
    
    // Actions
    sendMessage,
    closeConversation,
    clearConversation,
    
    // Connection state
    isConnected: useWebSocket ? socketRef.current?.isSocketConnected() || false : true
  };
}