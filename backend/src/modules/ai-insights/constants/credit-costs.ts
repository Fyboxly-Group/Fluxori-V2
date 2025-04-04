/**
 * Credit costs for AI Insights module
 * Defines the credit cost for different operations
 */

/**
 * Credit cost constants for AI Insights operations
 */
export const INSIGHT_CREDIT_COSTS = {
  // Basic insight generation costs
  BASIC_INSIGHT: 5,
  
  // Advanced insights with more data processing
  ADVANCED_INSIGHT: 10,
  
  // Market analysis with competitor data
  MARKET_ANALYSIS: 15,
  
  // Predictive analytics for forecasting
  PREDICTIVE_ANALYSIS: 20,
  
  // Real-time monitoring and alerts
  REAL_TIME_MONITORING: 8,
  
  // Scheduled daily reports
  DAILY_REPORT: 5,
  
  // Weekly comprehensive analysis
  WEEKLY_ANALYSIS: 15,
  
  // Monthly performance summary
  MONTHLY_SUMMARY: 25
};

/**
 * Get credit cost for a specific insight type
 * @param insightType The type of insight to get cost for
 * @returns The credit cost
 */
export const getCreditCost = (insightType: string): number => {
  const costKey = insightType.toUpperCase().replace(/\s+/g, '_') as keyof typeof INSIGHT_CREDIT_COSTS;
  return INSIGHT_CREDIT_COSTS[costKey] || INSIGHT_CREDIT_COSTS.BASIC_INSIGHT;
};