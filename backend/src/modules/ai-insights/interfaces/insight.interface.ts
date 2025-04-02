/**
 * Interfaces for AI Insights module
 */

/**
 * Insight type enum
 */
export enum InsightType {
  PERFORMANCE = 'performance',
  COMPETITIVE = 'competitive',
  OPPORTUNITY = 'opportunity',
  RISK = 'risk'
}

/**
 * Insight status enum
 */
export enum InsightStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Insight priority enum
 */
export enum InsightPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Insight source enum
 */
export enum InsightSource {
  SCHEDULED = 'scheduled',
  ON_DEMAND = 'on-demand',
  SYSTEM = 'system'
}

/**
 * Insight model used for analysis
 */
export enum InsightModel {
  DEEPSEEK_LITE = 'deepseek-lite',
  DEEPSEEK_PRO = 'deepseek-pro',
  GEMINI_PRO = 'gemini-pro',
  CLAUDE = 'claude'
}

/**
 * Insight feedback enum
 */
export enum InsightFeedback {
  HELPFUL = 'helpful',
  SOMEWHAT_HELPFUL = 'somewhat-helpful',
  NOT_HELPFUL = 'not-helpful'
}

/**
 * Insight metric interface
 */
export interface InsightMetric {
  name: string;
  value: number;
  unit?: string;
  change?: number;
  changeDirection?: 'up' | 'down' | 'stable';
  description?: string;
}

/**
 * Insight recommendation interface
 */
export interface InsightRecommendation {
  title: string;
  description: string;
  priority: InsightPriority;
  potentialImpact?: string;
  actionItems?: string[];
}

/**
 * Insight visualization interface
 */
export interface InsightVisualization {
  type: 'chart' | 'table' | 'indicator' | 'comparison';
  title: string;
  description?: string;
  data: any; // Visualization-specific data
}

/**
 * Analysis pipeline options interface
 */
export interface AnalysisPipelineOptions {
  useRag: boolean;
  ragFilter?: Record<string, any>;
  contextWindowSize?: number;
  maxTokens?: number;
  temperature?: number;
  model?: InsightModel;
  timeframeInDays?: number;
  includeMarketplaces?: string[];
  includeSKUs?: string[];
  includeCategories?: string[];
  compareWithTimeframe?: number;
}

/**
 * Base insight interface
 */
export interface Insight {
  id: string;
  title: string;
  summary: string;
  type: InsightType;
  status: InsightStatus;
  priority: InsightPriority;
  source: InsightSource;
  model: InsightModel;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  organizationId: string;
  metrics: InsightMetric[];
  recommendations: InsightRecommendation[];
  visualizations?: InsightVisualization[];
  relatedEntityIds?: string[]; // IDs of related products, marketplaces, etc.
  relatedEntityType?: string;  // Type of related entities (product, marketplace, etc.)
  feedback?: InsightFeedback;
  feedbackComments?: string;
  feedbackTimestamp?: Date;
  creditCost: number;
  analysisTimeMs?: number;
  rawAnalysisData?: any;
}

/**
 * Interface for scheduled insight job
 */
export interface ScheduledInsightJob {
  id: string;
  name: string;
  description?: string;
  type: InsightType;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression?: string;
  isActive: boolean;
  options: AnalysisPipelineOptions;
  lastRun?: Date;
  nextRun?: Date;
  userId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  targetEntities?: { id: string, type: string }[];
}

/**
 * Interface for on-demand insight request
 */
export interface OnDemandInsightRequest {
  type: InsightType;
  userId: string;
  organizationId: string;
  targetEntityIds?: string[];
  targetEntityType?: string;
  customPrompt?: string;
  options: AnalysisPipelineOptions;
}