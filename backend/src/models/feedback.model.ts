/**
 * Feedback schema for user feedback system
 * Using Firestore data model
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Feedback types supported by the system
 */
export enum FeedbackType {
  BUG = 'bug',
  FEATURE_REQUEST = 'feature_request',
  USABILITY = 'usability',
  PERFORMANCE = 'performance',
  GENERAL = 'general'
}

/**
 * Feedback severity levels for prioritization
 */
export enum FeedbackSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * Feedback status for tracking
 */
export enum FeedbackStatus {
  NEW = 'new',
  UNDER_REVIEW = 'under_review',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DECLINED = 'declined',
  PLANNED = 'planned'
}

/**
 * Feedback categories for organization
 */
export enum FeedbackCategory {
  UI = 'ui',
  DATA = 'data',
  REPORTS = 'reports',
  INVENTORY = 'inventory',
  MARKETPLACE = 'marketplace',
  SHIPPING = 'shipping',
  BILLING = 'billing',
  ACCOUNTS = 'accounts',
  OTHER = 'other'
}

/**
 * Interface for Feedback
 */
export interface IFeedback {
  userId: string;
  userEmail?: string;
  userName?: string;
  organizationId?: string;
  title: string;
  description: string;
  type: FeedbackType;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  screenshotUrl?: string;
  systemInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    viewport?: string;
    path?: string;
  };
  adminResponse?: {
    message: string;
    respondedBy: string;
    respondedAt: Date | Timestamp;
  };
  metadata?: Record<string, any>;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Feedback with ID field
 */
export interface IFeedbackWithId extends IFeedback {
  id: string; // Document ID
}

/**
 * Converter for Firestore
 */
export const feedbackConverter = {
  toFirestore(feedback: IFeedback): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    return {
      userId: feedback.userId,
      userEmail: feedback.userEmail,
      userName: feedback.userName,
      organizationId: feedback.organizationId,
      title: feedback.title,
      description: feedback.description,
      type: feedback.type,
      category: feedback.category,
      severity: feedback.severity,
      status: feedback.status,
      screenshotUrl: feedback.screenshotUrl,
      systemInfo: feedback.systemInfo,
      adminResponse: feedback.adminResponse ? {
        message: feedback.adminResponse.message,
        respondedBy: feedback.adminResponse.respondedBy,
        respondedAt: feedback.adminResponse.respondedAt instanceof Date
          ? Timestamp.fromDate(feedback.adminResponse.respondedAt)
          : feedback.adminResponse.respondedAt
      } : undefined,
      metadata: feedback.metadata,
      createdAt: feedback.createdAt instanceof Date
        ? Timestamp.fromDate(feedback.createdAt)
        : feedback.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): IFeedbackWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      organizationId: data.organizationId,
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      severity: data.severity,
      status: data.status,
      screenshotUrl: data.screenshotUrl,
      systemInfo: data.systemInfo,
      adminResponse: data.adminResponse,
      metadata: data.metadata,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IFeedbackWithId;
  }
};