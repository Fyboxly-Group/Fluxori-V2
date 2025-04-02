/**
 * Credit costs for AI Insights module
 */

import { InsightModel, InsightType } from '../interfaces/insight.interface';

/**
 * Base credit cost for different insight types
 */
export const BASE_INSIGHT_CREDIT_COST: Record<InsightType, number> = {
  [InsightType.PERFORMANCE]: 5,  // Performance analysis - basic complexity
  [InsightType.COMPETITIVE]: 8,  // Competitive analysis - medium complexity
  [InsightType.OPPORTUNITY]: 7,  // Opportunity identification - medium complexity
  [InsightType.RISK]: 6          // Risk detection - medium complexity
};

/**
 * Model-specific multipliers for credit costs
 */
export const MODEL_CREDIT_MULTIPLIER: Record<InsightModel, number> = {
  [InsightModel.DEEPSEEK_LITE]: 1.0,  // Base model (lowest cost)
  [InsightModel.DEEPSEEK_PRO]: 1.5,   // More sophisticated model
  [InsightModel.GEMINI_PRO]: 2.0,     // Premium model
  [InsightModel.CLAUDE]: 2.5          // Most expensive premium model
};

/**
 * Additional credit cost for using RAG
 */
export const RAG_ADDITIONAL_COST = 2;

/**
 * Credit cost for creating a scheduled insight job
 */
export const SCHEDULED_INSIGHT_JOB_CREATION_COST = 10;

/**
 * Calculate credit cost for an insight based on type and model
 * @param type Insight type
 * @param model LLM model used
 * @param useRag Whether RAG was used
 * @returns Total credit cost
 */
export function calculateInsightCreditCost(
  type: InsightType,
  model: InsightModel,
  useRag: boolean = false
): number {
  const baseCost = BASE_INSIGHT_CREDIT_COST[type];
  const modelMultiplier = MODEL_CREDIT_MULTIPLIER[model];
  const ragCost = useRag ? RAG_ADDITIONAL_COST : 0;
  
  return Math.round((baseCost * modelMultiplier) + ragCost);
}