/**
 * Insight Schemas for Firestore
 * 
 * Defines schemas and converters for Firestore collections
 */
import { 
  Timestamp, 
  DocumentData, 
  QueryDocumentSnapshot,
  SnapshotOptions
} from 'firebase-admin/firestore';
import { 
  IInsight, 
  InsightType, 
  InsightStatus, 
  InsightPriority, 
  InsightSource, 
  InsightModel,
  InsightMetric,
  InsightRecommendation,
  InsightVisualization,
  InsightFeedback,
  IScheduledInsightJob,
  AnalysisPipelineOptions
} from '../interfaces/insight.interface';

/**
 * Insight schema for Firestore
 */
export interface InsightSchema extends Omit<IInsight, 'createdAt' | 'updatedAt' | 'feedback'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  feedback?: {
    value: InsightFeedback;
    comment?: string;
    submittedAt: Timestamp;
  };
}

/**
 * Scheduled Insight Job schema for Firestore
 */
export interface ScheduledInsightJobSchema extends Omit<IScheduledInsightJob, 'createdAt' | 'updatedAt' | 'nextRunTime' | 'lastRunTime'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  nextRunTime: Timestamp;
  lastRunTime?: Timestamp;
}

/**
 * Converter for Insight documents in Firestore
 */
export const insightConverter = {
  toFirestore(insight: IInsight): DocumentData {
    const { createdAt, updatedAt, feedback, ...data } = insight;
    
    const firestoreData: any = {
      ...data,
      createdAt: createdAt instanceof Date ? Timestamp.fromDate(createdAt) : createdAt,
      updatedAt: updatedAt instanceof Date ? Timestamp.fromDate(updatedAt) : updatedAt
    };
    
    if (feedback) {
      firestoreData.feedback = {
        ...feedback,
        submittedAt: feedback.submittedAt instanceof Date 
          ? Timestamp.fromDate(feedback.submittedAt) 
          : feedback.submittedAt
      };
    }
    
    return firestoreData;
  },
  
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): IInsight {
    const data = snapshot.data(options);
    const insight: IInsight = {
      id: snapshot.id,
      organizationId: data.organizationId,
      userId: data.userId,
      type: data.type as InsightType,
      title: data.title,
      summary: data.summary,
      content: data.content,
      status: data.status as InsightStatus,
      priority: data.priority as InsightPriority,
      source: data.source as InsightSource,
      model: data.model as InsightModel,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      metrics: data.metrics as InsightMetric[],
      recommendations: data.recommendations as InsightRecommendation[],
      visualizations: data.visualizations as InsightVisualization[],
      category: data.category,
      tags: data.tags,
      feedback: data.feedback ? {
        value: data.feedback.value as InsightFeedback,
        comment: data.feedback.comment,
        submittedAt: data.feedback.submittedAt
      } : undefined,
      creditsUsed: data.creditsUsed,
      tokenCount: data.tokenCount,
      metadata: data.metadata || {}
    };
    
    return insight;
  }
};

/**
 * Converter for Scheduled Insight Job documents in Firestore
 */
export const scheduledInsightJobConverter = {
  toFirestore(job: IScheduledInsightJob): DocumentData {
    const { createdAt, updatedAt, nextRunTime, lastRunTime, ...data } = job;
    
    return {
      ...data,
      createdAt: createdAt instanceof Date ? Timestamp.fromDate(createdAt) : createdAt,
      updatedAt: updatedAt instanceof Date ? Timestamp.fromDate(updatedAt) : updatedAt,
      nextRunTime: nextRunTime instanceof Date ? Timestamp.fromDate(nextRunTime) : nextRunTime,
      lastRunTime: lastRunTime instanceof Date ? Timestamp.fromDate(lastRunTime) : lastRunTime
    };
  },
  
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): IScheduledInsightJob {
    const data = snapshot.data(options);
    const job: IScheduledInsightJob = {
      id: snapshot.id,
      organizationId: data.organizationId,
      userId: data.userId,
      name: data.name,
      description: data.description,
      insightType: data.insightType as InsightType,
      frequency: data.frequency as 'daily' | 'weekly' | 'monthly',
      dayOfWeek: data.dayOfWeek,
      dayOfMonth: data.dayOfMonth,
      isActive: data.isActive,
      pipelineOptions: data.pipelineOptions as AnalysisPipelineOptions,
      nextRunTime: data.nextRunTime,
      lastRunTime: data.lastRunTime,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastInsightId: data.lastInsightId
    };
    
    return job;
  }
};