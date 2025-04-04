/**
 * Xero Sync Status Model (Firestore)
 */
import { Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { xeroSyncStatusCollection } from '../../../config/firestore';
import { SyncOperationType, SyncStatusValue } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Xero sync status interface
 */
export interface IXeroSyncStatus {
  id: string; // Custom ID
  type: SyncOperationType;
  startedAt: Date | Timestamp;
  completedAt?: Date | Timestamp;
  status: SyncStatusValue;
  progress: number;
  totalItems?: number;
  processedItems?: number;
  errorList?: string[];
  userId: string;
  organizationId: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

/**
 * Interface for Firestore document with ID
 */
export interface IXeroSyncStatusWithId extends IXeroSyncStatus {
  docId: string; // Firestore document ID
}

/**
 * Converter for Firestore
 */
export const xeroSyncStatusConverter = {
  toFirestore(syncStatus: IXeroSyncStatus): DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    
    return {
      id: syncStatus.id,
      type: syncStatus.type,
      startedAt: syncStatus.startedAt instanceof Date 
        ? Timestamp.fromDate(syncStatus.startedAt) 
        : syncStatus.startedAt || now,
      completedAt: syncStatus.completedAt instanceof Date 
        ? Timestamp.fromDate(syncStatus.completedAt) 
        : syncStatus.completedAt,
      status: syncStatus.status || 'running',
      progress: typeof syncStatus.progress === 'number' ? syncStatus.progress : 0,
      totalItems: syncStatus.totalItems,
      processedItems: syncStatus.processedItems,
      errorList: syncStatus.errorList || [],
      userId: syncStatus.userId,
      organizationId: syncStatus.organizationId,
      createdAt: syncStatus.createdAt instanceof Date 
        ? Timestamp.fromDate(syncStatus.createdAt) 
        : syncStatus.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(snapshot: QueryDocumentSnapshot): IXeroSyncStatusWithId {
    const data = snapshot.data();
    return {
      docId: snapshot.id, // Store the Firestore document ID separately
      id: data.id,
      type: data.type as SyncOperationType,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      status: data.status as SyncStatusValue,
      progress: data.progress,
      totalItems: data.totalItems,
      processedItems: data.processedItems,
      errorList: data.errorList,
      userId: data.userId,
      organizationId: data.organizationId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
};

// Apply the converter to the collection
const XeroSyncStatusCollectionWithConverter = 
  xeroSyncStatusCollection.withConverter(xeroSyncStatusConverter);

/**
 * Helper functions for XeroSyncStatus operations
 */
export const XeroSyncStatus = {
  /**
   * Create a new Xero sync status
   */
  async create(syncStatus: IXeroSyncStatus): Promise<IXeroSyncStatusWithId> {
    // Ensure we have a valid ID
    if (!syncStatus.id) {
      syncStatus.id = uuidv4();
    }
    
    // Use the provided ID as the document ID if it's unique
    const docRef = XeroSyncStatusCollectionWithConverter.doc(syncStatus.id);
    
    // Check if document already exists
    const existingDoc = await docRef.get();
    if (existingDoc.exists) {
      // Generate a new ID with timestamp
      const newId = `${syncStatus.id}_${Date.now()}`;
      syncStatus.id = newId;
      const newDocRef = await XeroSyncStatusCollectionWithConverter.add(syncStatus);
      const snapshot = await newDocRef.get();
      const data = snapshot.data();
      if (!data) {
        throw new Error('Failed to create Xero sync status');
      }
      return data;
    }
    
    // Create new document with the provided ID
    await docRef.set(syncStatus);
    const snapshot = await docRef.get();
    const data = snapshot.data();
    if (!data) {
      throw new Error('Failed to create Xero sync status');
    }
    return data;
  },

  /**
   * Get a Xero sync status by ID
   */
  async findById(id: string): Promise<IXeroSyncStatusWithId | null> {
    // Try to find by custom ID
    const snapshot = await XeroSyncStatusCollectionWithConverter
      .where('id', '==', id)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as IXeroSyncStatusWithId;
    }
    
    // If not found by custom ID, try document ID
    const docSnapshot = await XeroSyncStatusCollectionWithConverter.doc(id).get();
    return docSnapshot.exists ? docSnapshot.data() as IXeroSyncStatusWithId : null;
  },

  /**
   * Find recent Xero sync statuses
   */
  async findRecent(limit: number = 10): Promise<IXeroSyncStatusWithId[]> {
    const snapshot = await XeroSyncStatusCollectionWithConverter
      .orderBy('startedAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as IXeroSyncStatusWithId);
  },

  /**
   * Find running Xero sync statuses
   */
  async findRunning(): Promise<IXeroSyncStatusWithId[]> {
    const snapshot = await XeroSyncStatusCollectionWithConverter
      .where('status', '==', 'running')
      .get();
    return snapshot.docs.map((doc) => doc.data() as IXeroSyncStatusWithId);
  },
  
  /**
   * Find sync statuses by organization ID
   */
  async findByOrganizationId(organizationId: string, limit: number = 10): Promise<IXeroSyncStatusWithId[]> {
    const snapshot = await XeroSyncStatusCollectionWithConverter
      .where('organizationId', '==', organizationId)
      .orderBy('startedAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as IXeroSyncStatusWithId);
  },

  /**
   * Update a Xero sync status
   */
  async update(id: string, statusData: Partial<IXeroSyncStatus>): Promise<void> {
    const now = Timestamp.now();
    
    // Find document by custom ID
    const snapshot = await XeroSyncStatusCollectionWithConverter
      .where('id', '==', id)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        ...statusData,
        updatedAt: now
      });
      return;
    }
    
    // If not found by custom ID, try document ID
    await XeroSyncStatusCollectionWithConverter.doc(id).update({
      ...statusData,
      updatedAt: now
    });
  },

  /**
   * Delete a Xero sync status
   */
  async delete(id: string): Promise<void> {
    // Find document by custom ID
    const snapshot = await XeroSyncStatusCollectionWithConverter
      .where('id', '==', id)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      await snapshot.docs[0].ref.delete();
      return;
    }
    
    // If not found by custom ID, try document ID
    await XeroSyncStatusCollectionWithConverter.doc(id).delete();
  },
  
  /**
   * Mark a sync operation as completed
   */
  async markCompleted(id: string, errors?: string[]): Promise<void> {
    const now = Timestamp.now();
    
    const data: Partial<IXeroSyncStatus> = {
      status: 'completed',
      progress: 100,
      completedAt: now,
      updatedAt: now
    };
    
    if (errors && errors.length > 0) {
      data.errorList = errors;
    }
    
    await this.update(id, data);
  },
  
  /**
   * Mark a sync operation as failed
   */
  async markFailed(id: string, error: string): Promise<void> {
    const now = Timestamp.now();
    
    await this.update(id, {
      status: 'failed',
      errorList: [error],
      completedAt: now,
      updatedAt: now
    });
  },
  
  /**
   * Update sync progress
   */
  async updateProgress(id: string, progress: number, processedItems?: number): Promise<void> {
    const data: Partial<IXeroSyncStatus> = {
      progress,
      updatedAt: Timestamp.now()
    };
    
    if (processedItems !== undefined) {
      data.processedItems = processedItems;
    }
    
    await this.update(id, data);
  }
};

export default XeroSyncStatus;