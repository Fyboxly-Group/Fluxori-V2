/**
 * Firestore schema definitions for AI Insights models
 */

import { Timestamp } from 'firebase-admin/firestore';
import { 
  InsightType, 
  InsightStatus, 
  InsightPriority, 
  InsightSource,
  InsightModel,
  InsightFeedback,
  InsightMetric,
  InsightRecommendation,
  InsightVisualization,
  AnalysisPipelineOptions,
  Insight,
  ScheduledInsightJob
} from '../interfaces/insight.interface';

/**
 * Firestore schema for insight metrics
 */
export interface InsightMetricSchema {
  name: string;
  value: number;
  unit?: string;
  change?: number;
  changeDirection?: 'up' | 'down' | 'stable';
  description?: string;
}

/**
 * Firestore schema for insight recommendations
 */
export interface InsightRecommendationSchema {
  title: string;
  description: string;
  priority: InsightPriority;
  potentialImpact?: string;
  actionItems?: string[];
}

/**
 * Firestore schema for insight visualizations
 */
export interface InsightVisualizationSchema {
  type: 'chart' | 'table' | 'indicator' | 'comparison';
  title: string;
  description?: string;
  data: any; // Visualization-specific data
}

/**
 * Firestore schema for analysis pipeline options
 */
export interface AnalysisPipelineOptionsSchema {
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
 * Firestore schema for insights
 */
export interface InsightSchema {
  id: string;
  title: string;
  summary: string;
  type: InsightType;
  status: InsightStatus;
  priority: InsightPriority;
  source: InsightSource;
  model: InsightModel;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  organizationId: string;
  metrics: InsightMetricSchema[];
  recommendations: InsightRecommendationSchema[];
  visualizations?: InsightVisualizationSchema[];
  relatedEntityIds?: string[]; // IDs of related products, marketplaces, etc.
  relatedEntityType?: string;  // Type of related entities (product, marketplace, etc.)
  feedback?: InsightFeedback;
  feedbackComments?: string;
  feedbackTimestamp?: Timestamp;
  creditCost: number;
  analysisTimeMs?: number;
  rawAnalysisData?: any;
}

/**
 * Firestore schema for scheduled insight jobs
 */
export interface ScheduledInsightJobSchema {
  id: string;
  name: string;
  description?: string;
  type: InsightType;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression?: string;
  isActive: boolean;
  options: AnalysisPipelineOptionsSchema;
  lastRun?: Timestamp;
  nextRun?: Timestamp;
  userId: string;
  organizationId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  targetEntities?: { id: string, type: string }[];
}

/**
 * Convert Firestore insight schema to interface
 */
export function convertSchemaToInsight(schema: InsightSchema): Insight {
  return {
    ...schema,
    createdAt: schema.createdAt.toDate(),
    updatedAt: schema.updatedAt.toDate(),
    feedbackTimestamp: schema.feedbackTimestamp ? schema.feedbackTimestamp.toDate() : undefined
  };
}

/**
 * Convert interface to Firestore insight schema
 */
export function convertInsightToSchema(insight: Insight): InsightSchema {
  return {
    ...insight,
    createdAt: Timestamp.fromDate(insight.createdAt instanceof Date ? insight.createdAt : new Date(insight.createdAt)),
    updatedAt: Timestamp.fromDate(insight.updatedAt instanceof Date ? insight.updatedAt : new Date(insight.updatedAt)),
    feedbackTimestamp: insight.feedbackTimestamp 
      ? Timestamp.fromDate(insight.feedbackTimestamp instanceof Date 
        ? insight.feedbackTimestamp 
        : new Date(insight.feedbackTimestamp)) 
      : undefined
  };
}

/**
 * Convert Firestore scheduled job schema to interface
 */
export function convertSchemaToScheduledJob(schema: ScheduledInsightJobSchema): ScheduledInsightJob {
  return {
    ...schema,
    createdAt: schema.createdAt.toDate(),
    updatedAt: schema.updatedAt.toDate(),
    lastRun: schema.lastRun ? schema.lastRun.toDate() : undefined,
    nextRun: schema.nextRun ? schema.nextRun.toDate() : undefined
  };
}

/**
 * Convert interface to Firestore scheduled job schema
 */
export function convertScheduledJobToSchema(job: ScheduledInsightJob): ScheduledInsightJobSchema {
  return {
    ...job,
    createdAt: Timestamp.fromDate(job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt)),
    updatedAt: Timestamp.fromDate(job.updatedAt instanceof Date ? job.updatedAt : new Date(job.updatedAt)),
    lastRun: job.lastRun ? Timestamp.fromDate(job.lastRun instanceof Date ? job.lastRun : new Date(job.lastRun)) : undefined,
    nextRun: job.nextRun ? Timestamp.fromDate(job.nextRun instanceof Date ? job.nextRun : new Date(job.nextRun)) : undefined
  };
}