import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BuyBoxService, {
  BuyBoxStatus,
  BuyBoxFilterParams,
  RepricingRule,
  RepricingRuleFilterParams,
  RepricingEvent,
  BuyBoxPricePoint,
} from '@/api/services/buybox.service';

/**
 * Hook for managing Buy Box statuses
 */
export function useBuyBoxStatuses(filters: BuyBoxFilterParams = {}) {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['buybox-statuses', filters],
    queryFn: () => BuyBoxService.getBuyBoxStatuses(filters)
  });
  
  const refreshStatusMutation = useMutation({
    mutationFn: (productId: string) => BuyBoxService.refreshBuyBoxStatus(productId),
    onSuccess: (updatedStatus) => {
      queryClient.invalidateQueries({ queryKey: ['buybox-statuses'] });
      queryClient.invalidateQueries({ queryKey: ['buybox-status', updatedStatus.productId] });
    }
  });
  
  const updatePriceMutation = useMutation({
    mutationFn: ({ productId, price }: { productId: string; price: number }) => 
      BuyBoxService.updateProductPrice(productId, price),
    onSuccess: (updatedStatus) => {
      queryClient.invalidateQueries({ queryKey: ['buybox-statuses'] });
      queryClient.invalidateQueries({ queryKey: ['buybox-status', updatedStatus.productId] });
    }
  });
  
  return {
    statuses: data?.items || [],
    totalStatuses: data?.total || 0,
    pagination: {
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    refetch,
    refreshStatus: refreshStatusMutation.mutateAsync,
    updatePrice: updatePriceMutation.mutateAsync,
    isRefreshing: refreshStatusMutation.isPending,
    isUpdatingPrice: updatePriceMutation.isPending
  };
}

/**
 * Hook for a specific Buy Box status
 */
export function useBuyBoxStatus(productId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: status,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['buybox-status', productId],
    queryFn: () => BuyBoxService.getBuyBoxStatus(productId),
    enabled: !!productId
  });
  
  const refreshStatusMutation = useMutation({
    mutationFn: () => BuyBoxService.refreshBuyBoxStatus(productId),
    onSuccess: (updatedStatus) => {
      queryClient.invalidateQueries({ queryKey: ['buybox-status', productId] });
      queryClient.invalidateQueries({ queryKey: ['buybox-statuses'] });
    }
  });
  
  const updatePriceMutation = useMutation({
    mutationFn: (price: number) => BuyBoxService.updateProductPrice(productId, price),
    onSuccess: (updatedStatus) => {
      queryClient.invalidateQueries({ queryKey: ['buybox-status', productId] });
      queryClient.invalidateQueries({ queryKey: ['buybox-statuses'] });
    }
  });
  
  const simulatePriceMutation = useMutation({
    mutationFn: (price: number) => BuyBoxService.simulatePriceChange(productId, price)
  });
  
  const getOptimalPriceMutation = useMutation({
    mutationFn: (strategy: 'maximize_profit' | 'maximize_sales' | 'balanced' = 'balanced') => 
      BuyBoxService.getOptimalPriceRecommendation(productId, strategy)
  });
  
  return {
    status,
    isLoading,
    error,
    refetch,
    refreshStatus: refreshStatusMutation.mutateAsync,
    updatePrice: updatePriceMutation.mutateAsync,
    simulatePrice: simulatePriceMutation.mutateAsync,
    getOptimalPrice: getOptimalPriceMutation.mutateAsync,
    isRefreshing: refreshStatusMutation.isPending,
    isUpdatingPrice: updatePriceMutation.isPending,
    isSimulating: simulatePriceMutation.isPending,
    isCalculatingOptimalPrice: getOptimalPriceMutation.isPending,
    simulationResults: simulatePriceMutation.data,
    optimalPriceResults: getOptimalPriceMutation.data
  };
}

/**
 * Hook for Buy Box price history
 */
export function useBuyBoxPriceHistory(productId: string, timeframe: '24h' | '7d' | '30d' | '90d' = '30d') {
  const {
    data: priceHistory,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['buybox-price-history', productId, timeframe],
    queryFn: () => BuyBoxService.getBuyBoxPriceHistory(productId, timeframe),
    enabled: !!productId
  });
  
  return {
    priceHistory: priceHistory || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for Buy Box win rate
 */
export function useBuyBoxWinRate(productId: string, timeframe: '7d' | '30d' | '90d' = '30d') {
  const {
    data: winRateData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['buybox-win-rate', productId, timeframe],
    queryFn: () => BuyBoxService.getBuyBoxWinRate(productId, timeframe),
    enabled: !!productId
  });
  
  return {
    winRateData: winRateData || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for competitor analysis
 */
export function useCompetitorAnalysis(productId: string) {
  const {
    data: competitorAnalysis,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['competitor-analysis', productId],
    queryFn: () => BuyBoxService.getCompetitorAnalysis(productId),
    enabled: !!productId
  });
  
  return {
    competitorAnalysis,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for Buy Box summary metrics
 */
export function useBuyBoxSummary() {
  const {
    data: summary,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['buybox-summary'],
    queryFn: () => BuyBoxService.getBuyBoxSummary()
  });
  
  return {
    summary,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for managing repricing rules
 */
export function useRepricingRules(filters: RepricingRuleFilterParams = {}) {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['repricing-rules', filters],
    queryFn: () => BuyBoxService.getRepricingRules(filters)
  });
  
  const createRuleMutation = useMutation({
    mutationFn: (ruleData: Partial<RepricingRule>) => BuyBoxService.createRepricingRule(ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repricing-rules'] });
    }
  });
  
  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RepricingRule> }) => 
      BuyBoxService.updateRepricingRule(id, data),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['repricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['repricing-rule', updatedRule.id] });
    }
  });
  
  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) => BuyBoxService.deleteRepricingRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repricing-rules'] });
    }
  });
  
  const activateRuleMutation = useMutation({
    mutationFn: (ruleId: string) => BuyBoxService.activateRepricingRule(ruleId),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['repricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['repricing-rule', updatedRule.id] });
    }
  });
  
  const deactivateRuleMutation = useMutation({
    mutationFn: (ruleId: string) => BuyBoxService.deactivateRepricingRule(ruleId),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['repricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['repricing-rule', updatedRule.id] });
    }
  });
  
  const runRuleMutation = useMutation({
    mutationFn: (ruleId: string) => BuyBoxService.runRepricingRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['repricing-events'] });
      queryClient.invalidateQueries({ queryKey: ['buybox-statuses'] });
    }
  });
  
  return {
    rules: data?.items || [],
    totalRules: data?.total || 0,
    pagination: {
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    refetch,
    createRule: createRuleMutation.mutateAsync,
    updateRule: updateRuleMutation.mutateAsync,
    deleteRule: deleteRuleMutation.mutateAsync,
    activateRule: activateRuleMutation.mutateAsync,
    deactivateRule: deactivateRuleMutation.mutateAsync,
    runRule: runRuleMutation.mutateAsync,
    isCreating: createRuleMutation.isPending,
    isUpdating: updateRuleMutation.isPending,
    isDeleting: deleteRuleMutation.isPending,
    isActivating: activateRuleMutation.isPending,
    isDeactivating: deactivateRuleMutation.isPending,
    isRunning: runRuleMutation.isPending,
    runResults: runRuleMutation.data
  };
}

/**
 * Hook for a specific repricing rule
 */
export function useRepricingRule(ruleId: string) {
  const queryClient = useQueryClient();
  
  const {
    data: rule,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['repricing-rule', ruleId],
    queryFn: () => BuyBoxService.getRepricingRule(ruleId),
    enabled: !!ruleId
  });
  
  const updateRuleMutation = useMutation({
    mutationFn: (ruleData: Partial<RepricingRule>) => BuyBoxService.updateRepricingRule(ruleId, ruleData),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['repricing-rule', ruleId] });
      queryClient.invalidateQueries({ queryKey: ['repricing-rules'] });
    }
  });
  
  const activateRuleMutation = useMutation({
    mutationFn: () => BuyBoxService.activateRepricingRule(ruleId),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['repricing-rule', ruleId] });
      queryClient.invalidateQueries({ queryKey: ['repricing-rules'] });
    }
  });
  
  const deactivateRuleMutation = useMutation({
    mutationFn: () => BuyBoxService.deactivateRepricingRule(ruleId),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['repricing-rule', ruleId] });
      queryClient.invalidateQueries({ queryKey: ['repricing-rules'] });
    }
  });
  
  const runRuleMutation = useMutation({
    mutationFn: () => BuyBoxService.runRepricingRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repricing-events'] });
      queryClient.invalidateQueries({ queryKey: ['buybox-statuses'] });
    }
  });
  
  return {
    rule,
    isLoading,
    error,
    refetch,
    updateRule: updateRuleMutation.mutateAsync,
    activateRule: activateRuleMutation.mutateAsync,
    deactivateRule: deactivateRuleMutation.mutateAsync,
    runRule: runRuleMutation.mutateAsync,
    isUpdating: updateRuleMutation.isPending,
    isActivating: activateRuleMutation.isPending,
    isDeactivating: deactivateRuleMutation.isPending,
    isRunning: runRuleMutation.isPending,
    runResults: runRuleMutation.data
  };
}

/**
 * Hook for rule templates
 */
export function useRuleTemplates() {
  const {
    data: templates,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['rule-templates'],
    queryFn: () => BuyBoxService.getRuleTemplates()
  });
  
  return {
    templates: templates || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for a specific rule template
 */
export function useRuleTemplate(templateId: string) {
  const {
    data: template,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['rule-template', templateId],
    queryFn: () => BuyBoxService.getRuleTemplate(templateId),
    enabled: !!templateId
  });
  
  return {
    template,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for repricing events
 */
export function useRepricingEvents(params: { 
  ruleId?: string; 
  productId?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const { 
    ruleId, 
    productId, 
    page = 1, 
    pageSize = 10 
  } = params;
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['repricing-events', ruleId, productId, page, pageSize],
    queryFn: () => BuyBoxService.getRepricingEvents({
      ruleId,
      productId,
      page,
      pageSize
    })
  });
  
  return {
    events: data?.items || [],
    totalEvents: data?.total || 0,
    pagination: {
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    refetch
  };
}