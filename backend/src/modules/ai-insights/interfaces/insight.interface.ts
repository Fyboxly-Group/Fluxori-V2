/**
 * Interfaces for AI Insights module
 * 
 * Defines type definitions for the AI Insights feature
 */
import { Timestamp } from 'firebase-admin/firestore';

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
  NOT_HELPFUL = 'not-helpful',
  INCORRECT = 'incorrect'
}

/**
 * Frequency for scheduled insights
 */
export enum InsightFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

/**
 * Interface for insight metric
 */
export interface InsightMetric {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeDirection?: 'up' | 'down' | 'unchanged';
  unit?: string;
  description?: string;
}

/**
 * Interface for insight recommendation
 */
export interface InsightRecommendation {
  title: string;
  description: string;
  priority: InsightPriority;
  actionable: boolean;
  actionLink?: string;
  actionText?: string;
}

/**
 * Interface for insight visualization
 */
export interface InsightVisualization {
  type: 'chart' | 'table' | 'card' | 'custom';
  title: string;
  data: any;
  showOnDashboard: boolean;
  config?: Record<string, any>;
}

/**
 * Interface for analysis pipeline options
 */
export interface AnalysisPipelineOptions {
  timeRangeInDays: number;
  compareWithPrevious: boolean;
  includePredictions: boolean;
  predictionDays?: number;
  modelToUse: InsightModel;
  maxTokens?: number;
  includeRecommendations: boolean;
  includeVisualizations: boolean;
  dataPoints?: number;
  drillDownEnabled?: boolean;
  customPrompt?: string;
  customParams?: Record<string, any>;
}

/**
 * Base interface for insight
 */
export interface IInsight {
  id: string;
  organizationId: string;
  userId: string;
  type: InsightType;
  title: string;
  summary: string;
  content: string;
  status: InsightStatus;
  priority: InsightPriority;
  source: InsightSource;
  model: InsightModel;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  metrics?: InsightMetric[];
  recommendations?: InsightRecommendation[];
  visualizations?: InsightVisualization[];
  category?: string;
  tags?: string[];
  feedback?: {
    value: InsightFeedback;
    comment?: string;
    submittedAt: Timestamp | Date;
  };
  creditsUsed: number;
  tokenCount: number;
  metadata: Record<string, any>;
}

/**
 * Interface for scheduled insight job
 */
export interface IScheduledInsightJob {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  description?: string;
  insightType: InsightType;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6, Sunday is 0
  dayOfMonth?: number; // 1-31
  isActive: boolean;
  pipelineOptions: AnalysisPipelineOptions;
  nextRunTime: Timestamp | Date;
  lastRunTime?: Timestamp | Date;
  createdBy: string;
  updatedBy?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastInsightId?: string;
}

/**
 * Interface for insight repository
 */
export interface IInsightRepository {
  /**
   * Create a new insight
   */
  create(insight: Omit<IInsight, 'id' | 'createdAt' | 'updatedAt'>): Promise<IInsight>;
  
  /**
   * Get an insight by ID
   */
  getById(id: string): Promise<IInsight | null>;
  
  /**
   * Update an insight
   */
  update(id: string, data: Partial<IInsight>): Promise<IInsight | null>;
  
  /**
   * Delete an insight
   */
  delete(id: string): Promise<boolean>;
  
  /**
   * Get insights by organization ID
   */
  getByOrganization(
    organizationId: string, 
    limit?: number, 
    startAfter?: any
  ): Promise<{
    insights: IInsight[];
    lastDoc: any;
  }>;
  
  /**
   * Get insights by user ID
   */
  getByUser(
    userId: string, 
    limit?: number, 
    startAfter?: any
  ): Promise<{
    insights: IInsight[];
    lastDoc: any;
  }>;
  
  /**
   * Get insights by type
   */
  getByType(
    organizationId: string,
    type: InsightType, 
    limit?: number, 
    startAfter?: any
  ): Promise<{
    insights: IInsight[];
    lastDoc: any;
  }>;
  
  /**
   * Record feedback for an insight
   */
  recordFeedback(
    id: string, 
    feedback: InsightFeedback, 
    comment?: string
  ): Promise<IInsight | null>;
}

/**
 * Interface for scheduled job repository
 */
export interface IScheduledJobRepository {
  /**
   * Create a new scheduled job
   */
  create(job: Omit<IScheduledInsightJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<IScheduledInsightJob>;
  
  /**
   * Get a scheduled job by ID
   */
  getById(id: string): Promise<IScheduledInsightJob | null>;
  
  /**
   * Update a scheduled job
   */
  update(id: string, data: Partial<IScheduledInsightJob>): Promise<IScheduledInsightJob | null>;
  
  /**
   * Delete a scheduled job
   */
  delete(id: string): Promise<boolean>;
  
  /**
   * Get scheduled jobs by organization ID
   */
  getByOrganization(organizationId: string): Promise<IScheduledInsightJob[]>;
  
  /**
   * Get scheduled jobs that need to run
   */
  getDueJobs(): Promise<IScheduledInsightJob[]>;
  
  /**
   * Update next run time for a job
   */
  updateNextRunTime(id: string, nextRunTime: Date): Promise<IScheduledInsightJob | null>;
}

/**
 * Interface for insight generation service
 */
export interface IInsightGenerationService {
  /**
   * Generate an insight
   */
  generateInsight(
    options: {
      organizationId: string;
      userId: string;
      type: InsightType;
      pipelineOptions: AnalysisPipelineOptions;
      jobId?: string;
    }
  ): Promise<IInsight>;
  
  /**
   * Generate on-demand insight
   */
  generateOnDemandInsight(
    userId: string,
    organizationId: string,
    type: InsightType,
    options?: Partial<AnalysisPipelineOptions>
  ): Promise<IInsight>;
}

/**
 * Interface for insight data service
 */
export interface IInsightDataService {
  /**
   * Get data for insight generation
   */
  getInsightData(
    organizationId: string,
    type: InsightType,
    timeRangeInDays: number,
    compareWithPrevious: boolean
  ): Promise<Record<string, any>>;
  
  /**
   * Get performance data
   */
  getPerformanceData(
    organizationId: string,
    timeRangeInDays: number,
    compareWithPrevious: boolean
  ): Promise<Record<string, any>>;
  
  /**
   * Get competitive data
   */
  getCompetitiveData(
    organizationId: string,
    timeRangeInDays: number,
    compareWithPrevious: boolean
  ): Promise<Record<string, any>>;
  
  /**
   * Get opportunity data
   */
  getOpportunityData(
    organizationId: string,
    timeRangeInDays: number,
    compareWithPrevious: boolean
  ): Promise<Record<string, any>>;
  
  /**
   * Get risk data
   */
  getRiskData(
    organizationId: string,
    timeRangeInDays: number,
    compareWithPrevious: boolean
  ): Promise<Record<string, any>>;
}

/**
 * Interface for LLM service
 */
export interface ILlmService {
  /**
   * Generate insight content using LLM
   */
  generateInsightContent(
    data: Record<string, any>,
    type: InsightType,
    options: AnalysisPipelineOptions
  ): Promise<{
    title: string;
    summary: string;
    content: string;
    metrics: InsightMetric[];
    recommendations: InsightRecommendation[];
    visualizations?: InsightVisualization[];
    tokenCount: number;
  }>;
}

/**
 * Interface for insight scheduler service
 */
export interface IInsightSchedulerService {
  /**
   * Create a new scheduled job
   */
  createScheduledJob(
    job: Omit<IScheduledInsightJob, 'id' | 'createdAt' | 'updatedAt' | 'nextRunTime'>
  ): Promise<IScheduledInsightJob>;
  
  /**
   * Run due jobs
   */
  runDueJobs(): Promise<number>;
  
  /**
   * Run a specific job
   */
  runJob(jobId: string): Promise<IInsight | null>;
  
  /**
   * Calculate next run time for a job
   */
  calculateNextRunTime(
    frequency: 'daily' | 'weekly' | 'monthly',
    dayOfWeek?: number,
    dayOfMonth?: number
  ): Date;
}