/**
 * Audit Log Service
 * Handles operations related to security audit logs
 */
import { Timestamp } from 'firebase-admin/firestore';
import {
  auditLogsCollection
} from '../../config/firestore';
import {
  IAuditLog,
  IAuditLogWithId,
  AuditCategory,
  AuditAction,
  AuditSeverity,
  createAuditLog,
  auditLogConverter
} from '../../models/firestore';

/**
 * Service for audit log management
 */
export class AuditLogService {
  /**
   * Create a new audit log entry
   * @param log Audit log data
   * @returns Created audit log with ID
   */
  async createAuditLog(log: IAuditLog): Promise<IAuditLogWithId> {
    // Add to Firestore
    const logRef = auditLogsCollection.withConverter(auditLogConverter).doc();
    await logRef.set(log);
    
    // Get the created log
    const snapshot = await logRef.get();
    return snapshot.data() as IAuditLogWithId;
  }
  
  /**
   * Log an action using the helper function
   * @param userId User ID performing the action
   * @param userEmail User email
   * @param organizationId Organization ID
   * @param category Audit category
   * @param action Audit action
   * @param resourceType Resource type
   * @param detail Detail message
   * @param options Additional options
   * @returns Created audit log with ID
   */
  async logAction(
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
  ): Promise<IAuditLogWithId> {
    const log = createAuditLog(
      userId,
      userEmail,
      organizationId,
      category,
      action,
      resourceType,
      detail,
      options
    );
    
    return await this.createAuditLog(log);
  }
  
  /**
   * Get audit log by ID
   * @param id Audit log ID
   * @returns Audit log or null if not found
   */
  async getAuditLogById(id: string): Promise<IAuditLogWithId | null> {
    const snapshot = await auditLogsCollection.withConverter(auditLogConverter).doc(id).get();
    
    if (!snapshot.exists) {
      return null;
    }
    
    return snapshot.data() as IAuditLogWithId;
  }
  
  /**
   * Get organization audit logs
   * @param organizationId Organization ID
   * @param limit Optional limit
   * @param offset Optional offset for pagination
   * @returns Array of audit logs
   */
  async getOrganizationAuditLogs(
    organizationId: string,
    limit?: number,
    offset?: number
  ): Promise<IAuditLogWithId[]> {
    let query = auditLogsCollection
      .withConverter(auditLogConverter)
      .where('organizationId', '==', organizationId)
      .orderBy('timestamp', 'desc');
    
    // Apply pagination if provided
    if (offset) {
      // Get the document at the offset
      const offsetSnapshot = await auditLogsCollection
        .withConverter(auditLogConverter)
        .where('organizationId', '==', organizationId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .offset(offset)
        .get();
      
      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[0];
        query = query.startAfter(lastDoc);
      }
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Get user audit logs
   * @param userId User ID
   * @param limit Optional limit
   * @param offset Optional offset for pagination
   * @returns Array of audit logs
   */
  async getUserAuditLogs(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<IAuditLogWithId[]> {
    let query = auditLogsCollection
      .withConverter(auditLogConverter)
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc');
    
    // Apply pagination if provided
    if (offset) {
      // Get the document at the offset
      const offsetSnapshot = await auditLogsCollection
        .withConverter(auditLogConverter)
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .offset(offset)
        .get();
      
      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[0];
        query = query.startAfter(lastDoc);
      }
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Get audit logs by category
   * @param category Audit category
   * @param organizationId Optional organization ID filter
   * @param limit Optional limit
   * @param offset Optional offset for pagination
   * @returns Array of audit logs
   */
  async getAuditLogsByCategory(
    category: AuditCategory,
    organizationId?: string,
    limit?: number,
    offset?: number
  ): Promise<IAuditLogWithId[]> {
    let query = auditLogsCollection
      .withConverter(auditLogConverter)
      .where('category', '==', category)
      .orderBy('timestamp', 'desc');
    
    // Add organization filter if provided
    if (organizationId) {
      query = query.where('organizationId', '==', organizationId) as any;
    }
    
    // Apply pagination if provided
    if (offset) {
      // For complex queries with multiple filters, startAfter with a specific document is better
      // than using offset, which can be inefficient in Firestore
      const offsetSnapshot = await query.limit(offset + 1).get();
      
      if (offsetSnapshot.docs.length > offset) {
        const lastDoc = offsetSnapshot.docs[offset];
        query = query.startAfter(lastDoc);
      }
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Get audit logs by severity
   * @param severity Audit severity
   * @param organizationId Optional organization ID filter
   * @param limit Optional limit
   * @param offset Optional offset for pagination
   * @returns Array of audit logs
   */
  async getAuditLogsBySeverity(
    severity: AuditSeverity,
    organizationId?: string,
    limit?: number,
    offset?: number
  ): Promise<IAuditLogWithId[]> {
    let query = auditLogsCollection
      .withConverter(auditLogConverter)
      .where('severity', '==', severity)
      .orderBy('timestamp', 'desc');
    
    // Add organization filter if provided
    if (organizationId) {
      query = query.where('organizationId', '==', organizationId) as any;
    }
    
    // Apply pagination if provided
    if (offset) {
      // For complex queries with multiple filters, startAfter with a specific document is better
      // than using offset, which can be inefficient in Firestore
      const offsetSnapshot = await query.limit(offset + 1).get();
      
      if (offsetSnapshot.docs.length > offset) {
        const lastDoc = offsetSnapshot.docs[offset];
        query = query.startAfter(lastDoc);
      }
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Get recent security events (high severity logs)
   * @param organizationId Optional organization ID filter
   * @param limit Optional limit (default 10)
   * @returns Array of high severity audit logs
   */
  async getRecentSecurityEvents(
    organizationId?: string,
    limit: number = 10
  ): Promise<IAuditLogWithId[]> {
    let query = auditLogsCollection
      .withConverter(auditLogConverter)
      .where('severity', 'in', [AuditSeverity.CRITICAL, AuditSeverity.ALERT])
      .orderBy('timestamp', 'desc')
      .limit(limit);
    
    // Add organization filter if provided
    if (organizationId) {
      // Note: This will create a composite query, which requires a composite index
      query = query.where('organizationId', '==', organizationId) as any;
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
  }
}