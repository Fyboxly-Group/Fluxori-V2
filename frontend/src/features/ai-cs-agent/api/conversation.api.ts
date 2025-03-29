import { apiClient } from '@/api/client';

// Define the API response wrapper type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Define types for the API
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    tokens?: number;
    confidence?: number;
    [key: string]: any;
  };
}

export interface Conversation {
  _id: string;
  userId: string;
  organizationId?: string;
  messages: Message[];
  status: 'active' | 'escalated' | 'closed';
  topic?: string;
  metadata?: {
    escalationReason?: string;
    escalatedAt?: string;
    closedAt?: string;
    ragDocuments?: string[];
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface ProcessMessageResponse {
  conversationId: string;
  aiResponse: string;
  isEscalated: boolean;
  escalationReason?: string;
  usage: {
    tokens: number;
    credits: number;
    confidence: number;
  };
}

export interface SendMessageRequest {
  message: string;
  conversationId?: string;
  organizationId?: string;
}

// REST API client for CS Agent conversations
export const conversationApi = {
  /**
   * Send a message to the AI agent
   * @param data Message data
   * @returns API response
   */
  sendMessage: async (data: SendMessageRequest): Promise<ProcessMessageResponse> => {
    const response = await apiClient.post<ApiResponse<ProcessMessageResponse>>(
      '/ai-cs-agent/message',
      data
    );
    return response.data;
  },
  
  /**
   * Get a list of the user's conversations
   * @param params Query parameters
   * @returns List of conversations
   */
  getConversations: async (params?: {
    limit?: number;
    offset?: number;
    status?: 'active' | 'escalated' | 'closed';
  }): Promise<Conversation[]> => {
    // Create a URLSearchParams object for query parameters
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
      if (params.status) queryParams.append('status', params.status);
    }
    
    // Build the URL with query parameters
    const url = `/ai-cs-agent/conversations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await apiClient.get<ApiResponse<Conversation[]>>(url);
    return response.data;
  },
  
  /**
   * Get a single conversation by ID
   * @param id Conversation ID
   * @returns Conversation details
   */
  getConversation: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get<ApiResponse<Conversation>>(
      `/ai-cs-agent/conversations/${id}`
    );
    return response.data;
  },
  
  /**
   * Close a conversation
   * @param id Conversation ID
   * @returns Closed conversation
   */
  closeConversation: async (id: string): Promise<Conversation> => {
    const response = await apiClient.post<ApiResponse<Conversation>>(
      `/ai-cs-agent/conversations/${id}/close`
    );
    return response.data;
  }
};