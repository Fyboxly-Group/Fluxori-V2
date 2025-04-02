import api, { ApiResponse } from '../api-client';
import { PaginationParams, PaginatedResponse } from './user-management.service';

/**
 * AI Insight model
 */
export interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'inventory' | 'pricing' | 'customer' | 'marketplace' | 'operations';
  type: 'discovery' | 'anomaly' | 'prediction' | 'recommendation' | 'trend';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1 scale
  data: {
    metrics: Record<string, any>;
    charts?: Record<string, any>;
    relevantItems?: Array<any>;
  };
  source: string;
  timestamp: string;
  expiry?: string;
  status: 'new' | 'acknowledged' | 'acted_on' | 'dismissed';
  relatedInsights?: string[];
  tags?: string[];
  actionable: boolean;
  actions?: AIInsightAction[];
  feedbackSubmitted?: boolean;
}

/**
 * AI Insight action
 */
export interface AIInsightAction {
  id: string;
  label: string;
  description?: string;
  type: 'api_call' | 'navigation' | 'modal' | 'notification';
  endpoint?: string;
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  payload?: any;
  url?: string;
  confirmation?: {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
  };
}

/**
 * AI Conversation model
 */
export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
  tags?: string[];
  context?: Record<string, any>;
}

/**
 * AI Message model
 */
export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: AIAttachment[];
  action?: AIAction;
  feedback?: AIFeedback;
}

/**
 * AI Attachment model
 */
export interface AIAttachment {
  id: string;
  type: 'image' | 'file' | 'data' | 'link';
  name: string;
  url?: string;
  content?: string;
  contentType?: string;
  size?: number;
}

/**
 * AI Action model
 */
export interface AIAction {
  id: string;
  type: 'api_call' | 'navigation' | 'data_visualization' | 'custom';
  status: 'pending' | 'completed' | 'failed';
  data?: any;
  result?: any;
  error?: string;
}

/**
 * AI Feedback model
 */
export interface AIFeedback {
  id: string;
  rating?: 'positive' | 'negative';
  comment?: string;
  category?: string;
  timestamp: string;
}

/**
 * AI Recommendation model
 */
export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: {
    area: string;
    value: number;
    metric: string;
  };
  data?: any;
  timestamp: string;
  status: 'new' | 'implemented' | 'dismissed';
  implementedAt?: string;
}

/**
 * AI Analysis model
 */
export interface AIAnalysis {
  id: string;
  type: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  startedAt: string;
  completedAt?: string;
  parameters?: Record<string, any>;
  result?: any;
  error?: string;
}

/**
 * AI filter parameters
 */
export interface AIInsightFilterParams extends PaginationParams {
  category?: string | string[];
  type?: string | string[];
  priority?: string | string[];
  status?: string | string[];
  minConfidence?: number;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  actionable?: boolean;
}

/**
 * AI Service
 * Handles AI-related operations
 */
const AIService = {
  /**
   * Get paginated list of AI insights
   */
  async getInsights(filters: AIInsightFilterParams = {}): Promise<PaginatedResponse<AIInsight>> {
    const response = await api.get<PaginatedResponse<AIInsight>>('/ai/insights', {
      params: filters
    });
    return response.data as PaginatedResponse<AIInsight>;
  },

  /**
   * Get an AI insight by ID
   */
  async getInsight(id: string): Promise<AIInsight> {
    const response = await api.get<AIInsight>(`/ai/insights/${id}`);
    return response.data as AIInsight;
  },

  /**
   * Update AI insight status
   */
  async updateInsightStatus(id: string, status: 'acknowledged' | 'acted_on' | 'dismissed'): Promise<AIInsight> {
    const response = await api.patch<AIInsight>(`/ai/insights/${id}/status`, { status });
    return response.data as AIInsight;
  },

  /**
   * Submit feedback for an AI insight
   */
  async submitInsightFeedback(
    id: string,
    feedback: {
      helpful: boolean;
      reason?: string;
      additionalComments?: string;
    }
  ): Promise<AIInsight> {
    const response = await api.post<AIInsight>(`/ai/insights/${id}/feedback`, feedback);
    return response.data as AIInsight;
  },

  /**
   * Execute an action on an AI insight
   */
  async executeInsightAction(insightId: string, actionId: string): Promise<any> {
    const response = await api.post<any>(`/ai/insights/${insightId}/actions/${actionId}/execute`);
    return response.data;
  },

  /**
   * Get AI summary metrics
   */
  async getAISummary(): Promise<{
    totalInsights: number;
    criticalInsights: number;
    newInsights: number;
    actedOnInsights: number;
    insightsByCategory: Record<string, number>;
    averageConfidence: number;
    topPriorityInsight?: AIInsight;
  }> {
    const response = await api.get<{
      totalInsights: number;
      criticalInsights: number;
      newInsights: number;
      actedOnInsights: number;
      insightsByCategory: Record<string, number>;
      averageConfidence: number;
      topPriorityInsight?: AIInsight;
    }>('/ai/summary');
    
    return response.data as {
      totalInsights: number;
      criticalInsights: number;
      newInsights: number;
      actedOnInsights: number;
      insightsByCategory: Record<string, number>;
      averageConfidence: number;
      topPriorityInsight?: AIInsight;
    };
  },

  /**
   * Get all AI conversations
   */
  async getConversations(params: PaginationParams = {}): Promise<PaginatedResponse<AIConversation>> {
    const response = await api.get<PaginatedResponse<AIConversation>>('/ai/conversations', {
      params
    });
    return response.data as PaginatedResponse<AIConversation>;
  },

  /**
   * Get a specific AI conversation
   */
  async getConversation(id: string): Promise<AIConversation> {
    const response = await api.get<AIConversation>(`/ai/conversations/${id}`);
    return response.data as AIConversation;
  },

  /**
   * Create a new AI conversation
   */
  async createConversation(
    data: {
      title?: string;
      initialMessage?: string;
      context?: Record<string, any>;
    } = {}
  ): Promise<AIConversation> {
    const response = await api.post<AIConversation>('/ai/conversations', data);
    return response.data as AIConversation;
  },

  /**
   * Send a message to an AI conversation
   */
  async sendMessage(
    conversationId: string,
    message: {
      content: string;
      attachments?: {
        type: 'image' | 'file' | 'data' | 'link';
        name: string;
        file?: File;
        url?: string;
        content?: string;
        contentType?: string;
      }[];
    }
  ): Promise<AIMessage> {
    // Handle file uploads if present
    if (message.attachments?.some(a => a.file)) {
      const formData = new FormData();
      formData.append('content', message.content);
      
      message.attachments.forEach((attachment, index) => {
        if (attachment.file) {
          formData.append(`attachments[${index}][file]`, attachment.file);
          formData.append(`attachments[${index}][type]`, attachment.type);
          formData.append(`attachments[${index}][name]`, attachment.name);
        } else if (attachment.url) {
          formData.append(`attachments[${index}][url]`, attachment.url);
          formData.append(`attachments[${index}][type]`, attachment.type);
          formData.append(`attachments[${index}][name]`, attachment.name);
        } else if (attachment.content) {
          formData.append(`attachments[${index}][content]`, attachment.content);
          formData.append(`attachments[${index}][contentType]`, attachment.contentType || '');
          formData.append(`attachments[${index}][type]`, attachment.type);
          formData.append(`attachments[${index}][name]`, attachment.name);
        }
      });
      
      const response = await api.post<AIMessage>(`/ai/conversations/${conversationId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data as AIMessage;
    } else {
      // Regular JSON request if no files
      const response = await api.post<AIMessage>(`/ai/conversations/${conversationId}/messages`, message);
      return response.data as AIMessage;
    }
  },

  /**
   * Get AI message stream
   */
  async getMessageStream(conversationId: string, messageId: string): Promise<ReadableStream> {
    // This needs to be handled specially to work with streaming
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/conversations/${conversationId}/messages/${messageId}/stream`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    if (!response.ok || !response.body) {
      throw new Error(`Failed to get message stream: ${response.statusText}`);
    }
    
    return response.body;
  },

  /**
   * Submit feedback for an AI message
   */
  async submitMessageFeedback(
    conversationId: string,
    messageId: string,
    feedback: {
      rating: 'positive' | 'negative';
      comment?: string;
      category?: string;
    }
  ): Promise<AIMessage> {
    const response = await api.post<AIMessage>(
      `/ai/conversations/${conversationId}/messages/${messageId}/feedback`,
      feedback
    );
    return response.data as AIMessage;
  },

  /**
   * Archive an AI conversation
   */
  async archiveConversation(id: string): Promise<AIConversation> {
    const response = await api.post<AIConversation>(`/ai/conversations/${id}/archive`);
    return response.data as AIConversation;
  },

  /**
   * Restore an archived AI conversation
   */
  async restoreConversation(id: string): Promise<AIConversation> {
    const response = await api.post<AIConversation>(`/ai/conversations/${id}/restore`);
    return response.data as AIConversation;
  },

  /**
   * Delete an AI conversation
   */
  async deleteConversation(id: string): Promise<ApiResponse> {
    return api.delete(`/ai/conversations/${id}`);
  },

  /**
   * Get AI recommendations
   */
  async getRecommendations(
    params: {
      category?: string;
      minConfidence?: number;
      limit?: number;
    } = {}
  ): Promise<AIRecommendation[]> {
    const response = await api.get<AIRecommendation[]>('/ai/recommendations', {
      params
    });
    return response.data as AIRecommendation[];
  },

  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(
    id: string,
    status: 'implemented' | 'dismissed'
  ): Promise<AIRecommendation> {
    const response = await api.patch<AIRecommendation>(`/ai/recommendations/${id}/status`, { status });
    return response.data as AIRecommendation;
  },

  /**
   * Run a custom AI analysis
   */
  async runAnalysis(
    analysisType: string,
    parameters: Record<string, any> = {}
  ): Promise<AIAnalysis> {
    const response = await api.post<AIAnalysis>('/ai/analysis', {
      type: analysisType,
      parameters
    });
    return response.data as AIAnalysis;
  },

  /**
   * Get analysis status
   */
  async getAnalysisStatus(id: string): Promise<AIAnalysis> {
    const response = await api.get<AIAnalysis>(`/ai/analysis/${id}`);
    return response.data as AIAnalysis;
  },

  /**
   * Cancel an ongoing analysis
   */
  async cancelAnalysis(id: string): Promise<ApiResponse> {
    return api.post(`/ai/analysis/${id}/cancel`);
  },

  /**
   * Get analysis result
   */
  async getAnalysisResult(id: string): Promise<any> {
    const response = await api.get<any>(`/ai/analysis/${id}/result`);
    return response.data;
  },

  /**
   * Get available analysis types
   */
  async getAvailableAnalysisTypes(): Promise<{
    id: string;
    name: string;
    description: string;
    parameters: {
      name: string;
      type: string;
      description: string;
      required: boolean;
      default?: any;
      options?: any[];
    }[];
    estimatedTime: {
      min: number;
      max: number;
      unit: string;
    };
  }[]> {
    const response = await api.get<{
      id: string;
      name: string;
      description: string;
      parameters: {
        name: string;
        type: string;
        description: string;
        required: boolean;
        default?: any;
        options?: any[];
      }[];
      estimatedTime: {
        min: number;
        max: number;
        unit: string;
      };
    }[]>('/ai/analysis/types');
    
    return response.data as {
      id: string;
      name: string;
      description: string;
      parameters: {
        name: string;
        type: string;
        description: string;
        required: boolean;
        default?: any;
        options?: any[];
      }[];
      estimatedTime: {
        min: number;
        max: number;
        unit: string;
      };
    }[];
  },

  /**
   * Get natural language query result
   */
  async getNLQueryResult(query: string): Promise<{
    answer: string;
    data?: any;
    visualization?: {
      type: string;
      data: any;
      options?: any;
    };
    relatedInsights?: string[];
  }> {
    const response = await api.post<{
      answer: string;
      data?: any;
      visualization?: {
        type: string;
        data: any;
        options?: any;
      };
      relatedInsights?: string[];
    }>('/ai/query', { query });
    
    return response.data as {
      answer: string;
      data?: any;
      visualization?: {
        type: string;
        data: any;
        options?: any;
      };
      relatedInsights?: string[];
    };
  }
};

export default AIService;