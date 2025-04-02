import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AIService, {
  AIInsight,
  AIInsightFilterParams,
  AIConversation,
  AIMessage,
  AIRecommendation,
  AIAnalysis
} from '@/api/services/ai.service';

/**
 * Hook for managing AI insights
 */
export function useAIInsights(filters: AIInsightFilterParams = {}) {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ai-insights', filters],
    queryFn: () => AIService.getInsights(filters)
  });
  
  const updateInsightStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'acknowledged' | 'acted_on' | 'dismissed' }) => 
      AIService.updateInsightStatus(id, status),
    onSuccess: (updatedInsight) => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insight', updatedInsight.id] });
      queryClient.invalidateQueries({ queryKey: ['ai-summary'] });
    }
  });
  
  return {
    insights: data?.items || [],
    totalInsights: data?.total || 0,
    pagination: {
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    refetch,
    updateInsightStatus: updateInsightStatusMutation.mutateAsync,
    isUpdating: updateInsightStatusMutation.isPending
  };
}

/**
 * Hook for a specific AI insight
 */
export function useAIInsight(insightId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: insight,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ai-insight', insightId],
    queryFn: () => AIService.getInsight(insightId),
    enabled: !!insightId
  });
  
  const updateInsightStatusMutation = useMutation({
    mutationFn: (status: 'acknowledged' | 'acted_on' | 'dismissed') => 
      AIService.updateInsightStatus(insightId, status),
    onSuccess: (updatedInsight) => {
      queryClient.invalidateQueries({ queryKey: ['ai-insight', insightId] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-summary'] });
    }
  });
  
  const submitFeedbackMutation = useMutation({
    mutationFn: (feedback: {
      helpful: boolean;
      reason?: string;
      additionalComments?: string;
    }) => AIService.submitInsightFeedback(insightId, feedback),
    onSuccess: (updatedInsight) => {
      queryClient.invalidateQueries({ queryKey: ['ai-insight', insightId] });
    }
  });
  
  const executeActionMutation = useMutation({
    mutationFn: (actionId: string) => AIService.executeInsightAction(insightId, actionId)
  });
  
  return {
    insight,
    isLoading,
    error,
    refetch,
    updateInsightStatus: updateInsightStatusMutation.mutateAsync,
    submitFeedback: submitFeedbackMutation.mutateAsync,
    executeAction: executeActionMutation.mutateAsync,
    isUpdating: updateInsightStatusMutation.isPending,
    isSubmittingFeedback: submitFeedbackMutation.isPending,
    isExecutingAction: executeActionMutation.isPending,
    actionResult: executeActionMutation.data
  };
}

/**
 * Hook for AI summary metrics
 */
export function useAISummary() {
  const {
    data: summary,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ai-summary'],
    queryFn: () => AIService.getAISummary()
  });
  
  return {
    summary,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for managing AI conversations
 */
export function useAIConversations(page = 1, pageSize = 10) {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ai-conversations', page, pageSize],
    queryFn: () => AIService.getConversations({ page, pageSize })
  });
  
  const createConversationMutation = useMutation({
    mutationFn: (data: {
      title?: string;
      initialMessage?: string;
      context?: Record<string, any>;
    } = {}) => AIService.createConversation(data),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    }
  });
  
  const archiveConversationMutation = useMutation({
    mutationFn: (conversationId: string) => AIService.archiveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    }
  });
  
  const restoreConversationMutation = useMutation({
    mutationFn: (conversationId: string) => AIService.restoreConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    }
  });
  
  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: string) => AIService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    }
  });
  
  return {
    conversations: data?.items || [],
    totalConversations: data?.total || 0,
    pagination: {
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    refetch,
    createConversation: createConversationMutation.mutateAsync,
    archiveConversation: archiveConversationMutation.mutateAsync,
    restoreConversation: restoreConversationMutation.mutateAsync,
    deleteConversation: deleteConversationMutation.mutateAsync,
    isCreating: createConversationMutation.isPending,
    isArchiving: archiveConversationMutation.isPending,
    isRestoring: restoreConversationMutation.isPending,
    isDeleting: deleteConversationMutation.isPending,
    newConversation: createConversationMutation.data
  };
}

/**
 * Hook for a specific AI conversation
 */
export function useAIConversation(conversationId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: conversation,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ai-conversation', conversationId],
    queryFn: () => AIService.getConversation(conversationId),
    enabled: !!conversationId
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: (message: {
      content: string;
      attachments?: {
        type: 'image' | 'file' | 'data' | 'link';
        name: string;
        file?: File;
        url?: string;
        content?: string;
        contentType?: string;
      }[];
    }) => AIService.sendMessage(conversationId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversation', conversationId] });
    }
  });
  
  const submitFeedbackMutation = useMutation({
    mutationFn: ({ 
      messageId, 
      feedback 
    }: {
      messageId: string;
      feedback: {
        rating: 'positive' | 'negative';
        comment?: string;
        category?: string;
      };
    }) => AIService.submitMessageFeedback(conversationId, messageId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversation', conversationId] });
    }
  });
  
  const archiveConversationMutation = useMutation({
    mutationFn: () => AIService.archiveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    }
  });
  
  const restoreConversationMutation = useMutation({
    mutationFn: () => AIService.restoreConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    }
  });
  
  const deleteConversationMutation = useMutation({
    mutationFn: () => AIService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    }
  });
  
  return {
    conversation,
    messages: conversation?.messages || [],
    isLoading,
    error,
    refetch,
    sendMessage: sendMessageMutation.mutateAsync,
    submitFeedback: submitFeedbackMutation.mutateAsync,
    archiveConversation: archiveConversationMutation.mutateAsync,
    restoreConversation: restoreConversationMutation.mutateAsync,
    deleteConversation: deleteConversationMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    isSubmittingFeedback: submitFeedbackMutation.isPending,
    isArchiving: archiveConversationMutation.isPending,
    isRestoring: restoreConversationMutation.isPending,
    isDeleting: deleteConversationMutation.isPending,
    sentMessage: sendMessageMutation.data
  };
}

/**
 * Hook for AI recommendations
 */
export function useAIRecommendations(params: {
  category?: string;
  minConfidence?: number;
  limit?: number;
} = {}) {
  const queryClient = useQueryClient();
  
  const {
    data: recommendations,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ai-recommendations', params],
    queryFn: () => AIService.getRecommendations(params)
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ 
      id, 
      status 
    }: {
      id: string;
      status: 'implemented' | 'dismissed';
    }) => AIService.updateRecommendationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    }
  });
  
  return {
    recommendations: recommendations || [],
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending
  };
}

/**
 * Hook for AI analysis
 */
export function useAIAnalysis() {
  const queryClient = useQueryClient();
  
  const {
    data: analysisTypes,
    isLoading: isAnalysisTypesLoading,
    error: analysisTypesError,
    refetch: refetchAnalysisTypes
  } = useQuery({
    queryKey: ['ai-analysis-types'],
    queryFn: () => AIService.getAvailableAnalysisTypes()
  });
  
  const runAnalysisMutation = useMutation({
    mutationFn: ({ 
      analysisType, 
      parameters = {} 
    }: {
      analysisType: string;
      parameters?: Record<string, any>;
    }) => AIService.runAnalysis(analysisType, parameters)
  });
  
  const getAnalysisStatusMutation = useMutation({
    mutationFn: (analysisId: string) => AIService.getAnalysisStatus(analysisId)
  });
  
  const getAnalysisResultMutation = useMutation({
    mutationFn: (analysisId: string) => AIService.getAnalysisResult(analysisId)
  });
  
  const cancelAnalysisMutation = useMutation({
    mutationFn: (analysisId: string) => AIService.cancelAnalysis(analysisId)
  });
  
  return {
    analysisTypes: analysisTypes || [],
    isAnalysisTypesLoading,
    analysisTypesError,
    refetchAnalysisTypes,
    runAnalysis: runAnalysisMutation.mutateAsync,
    getAnalysisStatus: getAnalysisStatusMutation.mutateAsync,
    getAnalysisResult: getAnalysisResultMutation.mutateAsync,
    cancelAnalysis: cancelAnalysisMutation.mutateAsync,
    isRunningAnalysis: runAnalysisMutation.isPending,
    isGettingStatus: getAnalysisStatusMutation.isPending,
    isGettingResult: getAnalysisResultMutation.isPending,
    isCancelling: cancelAnalysisMutation.isPending,
    analysis: runAnalysisMutation.data,
    analysisStatus: getAnalysisStatusMutation.data,
    analysisResult: getAnalysisResultMutation.data
  };
}

/**
 * Hook for natural language queries
 */
export function useNLQuery() {
  const nlQueryMutation = useMutation({
    mutationFn: (query: string) => AIService.getNLQueryResult(query)
  });
  
  return {
    queryNL: nlQueryMutation.mutateAsync,
    isQuerying: nlQueryMutation.isPending,
    result: nlQueryMutation.data,
    error: nlQueryMutation.error
  };
}