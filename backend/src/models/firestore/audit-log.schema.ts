/**
 * Audit log schema for tracking security-relevant actions
 * Using Firestore data model
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Audit event categories
 */
export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  ORGANIZATION = 'organization',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  INVITATION = 'invitation',
  BILLING = 'billing',
  SYSTEM = 'system',
  DATA = 'data'
}

/**
 * Audit event types
 */
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ASSIGN = 'assign',
  REVOKE = 'revoke',
  INVITE = 'invite',
  JOIN = 'join',
  LEAVE = 'leave',
  SUSPEND = 'suspend',
  ACTIVATE = 'activate',
  IMPORT = 'import',
  EXPORT = 'export',
  ACCESS = 'access',
  SHARE = 'share'
}

/**
 * Severity levels for audit events
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ALERT = 'alert',
  CRITICAL = 'critical'
}

/**
 * Interface for Audit Log
 */
export interface IAuditLog {
  userId: string;
  userEmail?: string;
  organizationId: string;
  category: AuditCategory;
  action: AuditAction;
  severity: AuditSeverity;
  resourceType: string;
  resourceId?: string;
  detail: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    location?: string;
    before?: any;
    after?: any;
    diff?: any;
    sessionId?: string;
    subjectUserId?: string;
    subjectEmail?: string;
    targetOrganizationId?: string;
    targetRoleId?: string;
    [key: string]: any;
  };
  timestamp: Date | Timestamp;
}

/**
 * Audit Log with ID field
 */
export interface IAuditLogWithId extends IAuditLog {
  id: string; // Document ID
}

/**
 * Converter for Firestore
 */
export const auditLogConverter = {
  toFirestore(auditLog: IAuditLog): FirebaseFirestore.DocumentData {
    // Ensure timestamp is correct
    const now = Timestamp.now();
    return {
      userId: auditLog.userId,
      userEmail: auditLog.userEmail,
      organizationId: auditLog.organizationId,
      category: auditLog.category,
      action: auditLog.action,
      severity: auditLog.severity,
      resourceType: auditLog.resourceType,
      resourceId: auditLog.resourceId,
      detail: auditLog.detail,
      metadata: auditLog.metadata || {},
      timestamp: auditLog.timestamp instanceof Date 
        ? Timestamp.fromDate(auditLog.timestamp) 
        : auditLog.timestamp || now
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): IAuditLogWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      userEmail: data.userEmail,
      organizationId: data.organizationId,
      category: data.category,
      action: data.action,
      severity: data.severity,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      detail: data.detail,
      metadata: data.metadata,
      timestamp: data.timestamp
    } as IAuditLogWithId;
  }
};

/**
 * Helper function to create an audit log entry
 */
export function createAuditLog(
  userId: string,
  userEmail: string,
  organizationId: string,
  category: AuditCategory,
  action: AuditAction,
  resourceType: string,
  detail: string,
  options?: {
    resourceId?: string;
    severity?: AuditSeverity;
    metadata?: Record<string, any>;
  }
): IAuditLog {
  return {
    userId,
    userEmail,
    organizationId,
    category,
    action,
    severity: options?.severity || AuditSeverity.INFO,
    resourceType,
    resourceId: options?.resourceId,
    detail,
    metadata: options?.metadata || {},
    timestamp: Timestamp.now()
  };
}