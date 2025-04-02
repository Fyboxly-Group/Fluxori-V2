/**
 * API client for feedback system
 */

// Feedback types
export enum FeedbackType {
  BUG = 'bug',
  FEATURE_REQUEST = 'feature_request',
  USABILITY = 'usability',
  PERFORMANCE = 'performance',
  GENERAL = 'general'
}

// Feedback categories
export enum FeedbackCategory {
  UI = 'ui',
  DATA = 'data',
  REPORTS = 'reports',
  INVENTORY = 'inventory',
  MARKETPLACE = 'marketplace',
  SHIPPING = 'shipping',
  BILLING = 'billing',
  ACCOUNTS = 'accounts',
  OTHER = 'other'
}

// Feedback severity levels
export enum FeedbackSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Feedback status types
export enum FeedbackStatus {
  NEW = 'new',
  UNDER_REVIEW = 'under_review',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DECLINED = 'declined',
  PLANNED = 'planned'
}

// Feedback interface
export interface Feedback {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  organizationId?: string;
  title: string;
  description: string;
  type: FeedbackType;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  screenshotUrl?: string;
  systemInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    viewport?: string;
    path?: string;
  };
  adminResponse?: {
    message: string;
    respondedBy: string;
    respondedAt: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Request and response interfaces
export interface SubmitFeedbackRequest {
  title: string;
  description: string;
  type: FeedbackType;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  screenshotData?: string; // Base64 encoded image
  systemInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    viewport?: string;
    path?: string;
  };
}

export interface SubmitFeedbackResponse {
  success: boolean;
  message: string;
  feedback: Feedback;
}

export interface GetFeedbackResponse {
  success: boolean;
  feedback: Feedback[];
}

export interface GetSingleFeedbackResponse {
  success: boolean;
  feedback: Feedback;
}

export interface UpdateFeedbackRequest {
  status?: FeedbackStatus;
  adminResponse?: string;
}

export interface UpdateFeedbackResponse {
  success: boolean;
  message: string;
  feedback: Feedback;
}

export interface DeleteFeedbackResponse {
  success: boolean;
  message: string;
}

export interface FeedbackAnalytics {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
}

export interface GetFeedbackAnalyticsResponse {
  success: boolean;
  analytics: FeedbackAnalytics;
}

// API client for feedback
export const feedbackApi = {
  /**
   * Submit new feedback
   * @param data Feedback submission data
   */
  submitFeedback: async (data: SubmitFeedbackRequest): Promise<SubmitFeedbackResponse> => {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }
    
    return response.json();
  },
  
  /**
   * Get current user's feedback history
   */
  getUserFeedback: async (): Promise<GetFeedbackResponse> => {
    const response = await fetch('/api/feedback/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user feedback');
    }
    
    return response.json();
  },
  
  /**
   * Get feedback by ID
   * @param id Feedback ID
   */
  getFeedbackById: async (id: string): Promise<GetSingleFeedbackResponse> => {
    const response = await fetch(`/api/feedback/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch feedback');
    }
    
    return response.json();
  },
  
  /**
   * Update feedback (admin only)
   * @param id Feedback ID
   * @param data Update data
   */
  updateFeedback: async (id: string, data: UpdateFeedbackRequest): Promise<UpdateFeedbackResponse> => {
    const response = await fetch(`/api/feedback/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update feedback');
    }
    
    return response.json();
  },
  
  /**
   * Get all feedback (admin only)
   * @param limit Optional limit
   * @param offset Optional offset for pagination
   */
  getAllFeedback: async (limit?: number, offset?: number): Promise<GetFeedbackResponse> => {
    // Build query parameters
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response = await fetch(`/api/feedback/admin?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch all feedback');
    }
    
    return response.json();
  },
  
  /**
   * Get organization feedback (admin or organization manager)
   * @param organizationId Organization ID
   */
  getOrganizationFeedback: async (organizationId: string): Promise<GetFeedbackResponse> => {
    const response = await fetch(`/api/feedback/organization/${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch organization feedback');
    }
    
    return response.json();
  },
  
  /**
   * Delete feedback (admin only)
   * @param id Feedback ID
   */
  deleteFeedback: async (id: string): Promise<DeleteFeedbackResponse> => {
    const response = await fetch(`/api/feedback/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete feedback');
    }
    
    return response.json();
  },
  
  /**
   * Get feedback analytics (admin only)
   * @param organizationId Optional organization ID to filter by
   */
  getFeedbackAnalytics: async (organizationId?: string): Promise<GetFeedbackAnalyticsResponse> => {
    // Build query parameters
    const params = new URLSearchParams();
    if (organizationId) params.append('organizationId', organizationId);
    
    const response = await fetch(`/api/feedback/analytics?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch feedback analytics');
    }
    
    return response.json();
  },
};