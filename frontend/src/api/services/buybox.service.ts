import api, { ApiResponse } from '../api-client';
import { PaginationParams, PaginatedResponse } from './user-management.service';

/**
 * Buy Box status
 */
export interface BuyBoxStatus {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  asin?: string;
  hasWon: boolean;
  price: number;
  buyBoxPrice: number;
  buyBoxSeller: string;
  competitors: BuyBoxCompetitor[];
  lastUpdated: string;
  priceHistory: BuyBoxPricePoint[];
  metrics: {
    winRate24h: number;
    winRate7d: number;
    winRate30d: number;
    priceTrend24h: number;
    competitorCount: number;
  };
}

/**
 * Buy Box competitor
 */
export interface BuyBoxCompetitor {
  id: string;
  name: string;
  price: number;
  shipping?: number;
  condition: string;
  isFBA?: boolean;
  isBuyBoxWinner: boolean;
  rating?: number;
  offerCount?: number;
}

/**
 * Buy Box price point
 */
export interface BuyBoxPricePoint {
  timestamp: string;
  price: number;
  buyBoxPrice: number;
  buyBoxSeller: string;
  isWinner: boolean;
}

/**
 * Repricing Rule
 */
export interface RepricingRule {
  id: string;
  name: string;
  description?: string;
  productIds: string[];
  productSkus?: string[];
  categoryIds?: string[];
  isActive: boolean;
  priority: number;
  conditions: RepricingCondition[];
  actions: RepricingAction[];
  schedule?: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    daysOfWeek?: number[];
    timeStart?: string;
    timeEnd?: string;
  };
  strategy: 'competitive' | 'maximize_profit' | 'maximize_sales' | 'custom';
  minPrice?: number;
  maxPrice?: number;
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  metrics?: {
    appliedCount: number;
    successRate: number;
    averagePriceChange: number;
    winRateChange: number;
  };
}

/**
 * Repricing condition
 */
export interface RepricingCondition {
  id: string;
  type: 'competitor_price' | 'buy_box_price' | 'lowest_price' | 'highest_price' | 'max_competitors' | 'time_since_last_sale' | 'stock_level' | 'sales_velocity';
  operator: '=' | '!=' | '<' | '>' | '<=' | '>=' | 'between' | 'contains' | 'not_contains';
  value: any;
  value2?: any; // Used for 'between' operator
  competitorType?: 'all' | 'fba' | 'fbm' | 'specific';
  specificCompetitors?: string[];
}

/**
 * Repricing action
 */
export interface RepricingAction {
  id: string;
  type: 'set_price' | 'adjust_price' | 'match_price' | 'beat_price' | 'formula';
  value: any;
  referenceType?: 'buy_box' | 'lowest_fba' | 'lowest_fbm' | 'lowest_all' | 'average' | 'custom';
  adjustment?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
  formula?: string;
}

/**
 * Repricing Event (a price change triggered by a rule)
 */
export interface RepricingEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  productId: string;
  productName: string;
  sku: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
  status: 'pending' | 'applied' | 'failed';
  timestamp: string;
  conditionsData?: any;
}

/**
 * Buy Box filter parameters
 */
export interface BuyBoxFilterParams extends PaginationParams {
  search?: string;
  status?: 'winning' | 'losing' | 'all';
  priceChange?: 'increased' | 'decreased' | 'unchanged';
  winRateMin?: number;
  competitorCountMin?: number;
  competitorCountMax?: number;
}

/**
 * Repricing rule filter parameters
 */
export interface RepricingRuleFilterParams extends PaginationParams {
  search?: string;
  status?: 'active' | 'inactive';
  strategy?: 'competitive' | 'maximize_profit' | 'maximize_sales' | 'custom';
}

/**
 * Buy Box Service
 * Handles Buy Box monitoring and repricing operations
 */
const BuyBoxService = {
  /**
   * Get paginated list of Buy Box statuses
   */
  async getBuyBoxStatuses(filters: BuyBoxFilterParams = {}): Promise<PaginatedResponse<BuyBoxStatus>> {
    const response = await api.get<PaginatedResponse<BuyBoxStatus>>('/buybox/status', {
      params: filters
    });
    return response.data as PaginatedResponse<BuyBoxStatus>;
  },

  /**
   * Get Buy Box status for a product
   */
  async getBuyBoxStatus(productId: string): Promise<BuyBoxStatus> {
    const response = await api.get<BuyBoxStatus>(`/buybox/status/${productId}`);
    return response.data as BuyBoxStatus;
  },

  /**
   * Get Buy Box status by SKU
   */
  async getBuyBoxStatusBySku(sku: string): Promise<BuyBoxStatus> {
    const response = await api.get<BuyBoxStatus>('/buybox/status/sku', {
      params: { sku }
    });
    return response.data as BuyBoxStatus;
  },

  /**
   * Refresh Buy Box status
   */
  async refreshBuyBoxStatus(productId: string): Promise<BuyBoxStatus> {
    const response = await api.post<BuyBoxStatus>(`/buybox/status/${productId}/refresh`);
    return response.data as BuyBoxStatus;
  },

  /**
   * Get Buy Box price history
   */
  async getBuyBoxPriceHistory(
    productId: string,
    timeframe: '24h' | '7d' | '30d' | '90d' = '30d'
  ): Promise<BuyBoxPricePoint[]> {
    const response = await api.get<BuyBoxPricePoint[]>(`/buybox/history/${productId}`, {
      params: { timeframe }
    });
    return response.data as BuyBoxPricePoint[];
  },

  /**
   * Update product price
   */
  async updateProductPrice(productId: string, price: number): Promise<BuyBoxStatus> {
    const response = await api.patch<BuyBoxStatus>(`/buybox/price/${productId}`, { price });
    return response.data as BuyBoxStatus;
  },

  /**
   * Get Buy Box win rate over time
   */
  async getBuyBoxWinRate(
    productId: string,
    timeframe: '7d' | '30d' | '90d' = '30d'
  ): Promise<{ timestamp: string; winRate: number }[]> {
    const response = await api.get<{ timestamp: string; winRate: number }[]>(`/buybox/win-rate/${productId}`, {
      params: { timeframe }
    });
    return response.data as { timestamp: string; winRate: number }[];
  },

  /**
   * Get competitor analysis
   */
  async getCompetitorAnalysis(productId: string): Promise<{
    competitors: BuyBoxCompetitor[];
    priceDistribution: { price: number; count: number }[];
    competitorHistory: { timestamp: string; count: number }[];
  }> {
    const response = await api.get<{
      competitors: BuyBoxCompetitor[];
      priceDistribution: { price: number; count: number }[];
      competitorHistory: { timestamp: string; count: number }[];
    }>(`/buybox/competitor-analysis/${productId}`);
    
    return response.data as {
      competitors: BuyBoxCompetitor[];
      priceDistribution: { price: number; count: number }[];
      competitorHistory: { timestamp: string; count: number }[];
    };
  },

  /**
   * Get Buy Box summary metrics
   */
  async getBuyBoxSummary(): Promise<{
    totalProducts: number;
    winningProducts: number;
    overallWinRate: number;
    averagePriceChange24h: number;
    averageCompetitorCount: number;
  }> {
    const response = await api.get<{
      totalProducts: number;
      winningProducts: number;
      overallWinRate: number;
      averagePriceChange24h: number;
      averageCompetitorCount: number;
    }>('/buybox/summary');
    
    return response.data as {
      totalProducts: number;
      winningProducts: number;
      overallWinRate: number;
      averagePriceChange24h: number;
      averageCompetitorCount: number;
    };
  },

  /**
   * Get paginated list of repricing rules
   */
  async getRepricingRules(filters: RepricingRuleFilterParams = {}): Promise<PaginatedResponse<RepricingRule>> {
    const response = await api.get<PaginatedResponse<RepricingRule>>('/buybox/repricing/rules', {
      params: filters
    });
    return response.data as PaginatedResponse<RepricingRule>;
  },

  /**
   * Get a repricing rule by ID
   */
  async getRepricingRule(id: string): Promise<RepricingRule> {
    const response = await api.get<RepricingRule>(`/buybox/repricing/rules/${id}`);
    return response.data as RepricingRule;
  },

  /**
   * Create a new repricing rule
   */
  async createRepricingRule(ruleData: Partial<RepricingRule>): Promise<RepricingRule> {
    const response = await api.post<RepricingRule>('/buybox/repricing/rules', ruleData);
    return response.data as RepricingRule;
  },

  /**
   * Update a repricing rule
   */
  async updateRepricingRule(id: string, ruleData: Partial<RepricingRule>): Promise<RepricingRule> {
    const response = await api.put<RepricingRule>(`/buybox/repricing/rules/${id}`, ruleData);
    return response.data as RepricingRule;
  },

  /**
   * Delete a repricing rule
   */
  async deleteRepricingRule(id: string): Promise<ApiResponse> {
    return api.delete(`/buybox/repricing/rules/${id}`);
  },

  /**
   * Activate a repricing rule
   */
  async activateRepricingRule(id: string): Promise<RepricingRule> {
    const response = await api.post<RepricingRule>(`/buybox/repricing/rules/${id}/activate`);
    return response.data as RepricingRule;
  },

  /**
   * Deactivate a repricing rule
   */
  async deactivateRepricingRule(id: string): Promise<RepricingRule> {
    const response = await api.post<RepricingRule>(`/buybox/repricing/rules/${id}/deactivate`);
    return response.data as RepricingRule;
  },

  /**
   * Run a repricing rule manually
   */
  async runRepricingRule(id: string): Promise<{
    ruleId: string;
    productsProcessed: number;
    priceChanges: number;
    events: RepricingEvent[];
  }> {
    const response = await api.post<{
      ruleId: string;
      productsProcessed: number;
      priceChanges: number;
      events: RepricingEvent[];
    }>(`/buybox/repricing/rules/${id}/run`);
    
    return response.data as {
      ruleId: string;
      productsProcessed: number;
      priceChanges: number;
      events: RepricingEvent[];
    };
  },

  /**
   * Get rule templates
   */
  async getRuleTemplates(): Promise<{
    id: string;
    name: string;
    description: string;
    strategy: string;
  }[]> {
    const response = await api.get<{
      id: string;
      name: string;
      description: string;
      strategy: string;
    }[]>('/buybox/repricing/templates');
    
    return response.data as {
      id: string;
      name: string;
      description: string;
      strategy: string;
    }[];
  },

  /**
   * Get rule template by ID
   */
  async getRuleTemplate(id: string): Promise<{
    id: string;
    name: string;
    description: string;
    strategy: string;
    conditions: RepricingCondition[];
    actions: RepricingAction[];
  }> {
    const response = await api.get<{
      id: string;
      name: string;
      description: string;
      strategy: string;
      conditions: RepricingCondition[];
      actions: RepricingAction[];
    }>(`/buybox/repricing/templates/${id}`);
    
    return response.data as {
      id: string;
      name: string;
      description: string;
      strategy: string;
      conditions: RepricingCondition[];
      actions: RepricingAction[];
    };
  },

  /**
   * Get repricing events
   */
  async getRepricingEvents(
    params: { ruleId?: string; productId?: string } & PaginationParams = {}
  ): Promise<PaginatedResponse<RepricingEvent>> {
    const response = await api.get<PaginatedResponse<RepricingEvent>>('/buybox/repricing/events', {
      params
    });
    return response.data as PaginatedResponse<RepricingEvent>;
  },

  /**
   * Get simulation for price change
   */
  async simulatePriceChange(
    productId: string,
    price: number
  ): Promise<{
    currentPrice: number;
    newPrice: number;
    currentIsBuyBoxWinner: boolean;
    newIsBuyBoxWinner: boolean;
    profitMarginChange: number;
    estimatedSalesImpact: string;
    competitorsBeaten: number;
  }> {
    const response = await api.post<{
      currentPrice: number;
      newPrice: number;
      currentIsBuyBoxWinner: boolean;
      newIsBuyBoxWinner: boolean;
      profitMarginChange: number;
      estimatedSalesImpact: string;
      competitorsBeaten: number;
    }>(`/buybox/simulate/${productId}`, { price });
    
    return response.data as {
      currentPrice: number;
      newPrice: number;
      currentIsBuyBoxWinner: boolean;
      newIsBuyBoxWinner: boolean;
      profitMarginChange: number;
      estimatedSalesImpact: string;
      competitorsBeaten: number;
    };
  },

  /**
   * Get optimal price recommendation
   */
  async getOptimalPriceRecommendation(
    productId: string,
    strategy: 'maximize_profit' | 'maximize_sales' | 'balanced' = 'balanced'
  ): Promise<{
    currentPrice: number;
    recommendedPrice: number;
    minPrice: number;
    maxPrice: number;
    buyBoxPrice: number;
    winProbability: number;
    profitMargin: number;
  }> {
    const response = await api.get<{
      currentPrice: number;
      recommendedPrice: number;
      minPrice: number;
      maxPrice: number;
      buyBoxPrice: number;
      winProbability: number;
      profitMargin: number;
    }>(`/buybox/recommendation/${productId}`, {
      params: { strategy }
    });
    
    return response.data as {
      currentPrice: number;
      recommendedPrice: number;
      minPrice: number;
      maxPrice: number;
      buyBoxPrice: number;
      winProbability: number;
      profitMargin: number;
    };
  }
};

export default BuyBoxService;