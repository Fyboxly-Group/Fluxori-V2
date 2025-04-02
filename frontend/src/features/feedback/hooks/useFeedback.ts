/**
 * Custom hook for feedback functionality
 */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  feedbackApi,
  SubmitFeedbackRequest,
  UpdateFeedbackRequest,
  Feedback,
  FeedbackAnalytics
} from '../api/feedback.api';

interface useFeedbackProps {}


// Query keys
const FEEDBACK_KEYS = {
  all: ['feedback'] as const,
  user: () => [...FEEDBACK_KEYS.all, 'user'] as const,
  admin: () => [...FEEDBACK_KEYS.all, 'admin'] as const,
  detail: (id: string) => [...FEEDBACK_KEYS.all, 'detail', id] as const,
  organization: (id: string) => [...FEEDBACK_KEYS.all, 'organization', id] as const,
  analytics: (organizationId?: string) => [...FEEDBACK_KEYS.all, 'analytics', organizationId ?? 'all'] as const
};

export const useFeedback = () => {
  const queryClient = useQueryClient();
  const [activeItem, setActiveItem] = useState<Feedback | null>(null);

  // Get user's feedback
  const getUserFeedback = () => useQuery({
    queryKey: FEEDBACK_KEYS.user(),
    queryFn: () => feedbackApi.getUserFeedback().then(res => res.feedback),
    staleTime: 60000 // 1 minute
  });

  // Get feedback by ID
  const getFeedbackById = (id: string) => useQuery({
    queryKey: FEEDBACK_KEYS.detail(id),
    queryFn: () => feedbackApi.getFeedbackById(id).then(res => res.feedback),
    enabled: !!id,
    staleTime: 60000 // 1 minute
  });

  // Get all feedback (admin)
  const getAllFeedback = (limit?: number, offset?: number) => useQuery({
    queryKey: [...FEEDBACK_KEYS.admin(), { limit, offset }],
    queryFn: () => feedbackApi.getAllFeedback(limit, offset).then(res => res.feedback),
    staleTime: 60000 // 1 minute
  });

  // Get organization feedback
  const getOrganizationFeedback = (organizationId: string) => useQuery({
    queryKey: FEEDBACK_KEYS.organization(organizationId),
    queryFn: () => feedbackApi.getOrganizationFeedback(organizationId).then(res => res.feedback),
    enabled: !!organizationId,
    staleTime: 60000 // 1 minute
  });

  // Get feedback analytics
  const getFeedbackAnalytics = (organizationId?: string) => useQuery<FeedbackAnalytics>({
    queryKey: FEEDBACK_KEYS.analytics(organizationId),
    queryFn: () => feedbackApi.getFeedbackAnalytics(organizationId).then(res => res.analytics),
    staleTime: 60000 // 1 minute
  });

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: (data: SubmitFeedbackRequest) => feedbackApi.submitFeedback(data),
    onSuccess: () => {
      // Invalidate user feedback cache to refresh the list
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.user() });
    }
  });

  // Update feedback mutation (admin)
  const updateFeedback = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeedbackRequest }) => 
      feedbackApi.updateFeedback(id, data),
    onSuccess: (_: any, variables: any) => {
      // Invalidate specific feedback cache
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.detail(variables.id) });
      // Invalidate lists that might contain this feedback
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.user() });
      // Also invalidate analytics
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.all });
    }
  });

  // Delete feedback mutation (admin)
  const deleteFeedback = useMutation({
    mutationFn: (id: string) => feedbackApi.deleteFeedback(id),
    onSuccess: (_: any, id: any) => {
      // Invalidate all feedback caches
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.all });
      // If the deleted item was active, clear it
      if (activeItem && activeItem.id === id) {
        setActiveItem(null);
      }
    }
  });

  return {
    // Queries
    getUserFeedback,
    getFeedbackById,
    getAllFeedback,
    getOrganizationFeedback,
    getFeedbackAnalytics,
    
    // Mutations
    submitFeedback,
    updateFeedback,
    deleteFeedback,
    
    // State management
    activeItem,
    setActiveItem
  };
};