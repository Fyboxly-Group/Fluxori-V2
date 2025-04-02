/**
 * Xero Sync Status Model (Firestore)
 */
import { Timestamp } from 'firebase-admin/firestore';
import { xeroSyncStatusCollection } from '../../../config/firestore';
import { SyncOperationType, SyncStatus } from '../types';

/**
 * Xero sync status interface
 */
export interface IXeroSyncStatus {
  id: string; // Custom ID
  type: SyncOperationType;
  startedAt: Date | Timestamp;
  completedAt?: Date | Timestamp;
  status: SyncStatus;
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
  toFirestore(syncStatus: IXeroSyncStatus): FirebaseFirestore.DocumentData {
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
  
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IXeroSyncStatusWithId {
    const data = snapshot.data();
    return {
      docId: snapshot.id, // Store the Firestore document ID separately
      id: data.id,
      type: data.type,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      status: data.status,
      progress: data.progress,
      totalItems: data.totalItems,
      processedItems: data.processedItems,
      errorList: data.errorList,
      userId: data.userId,
      organizationId: data.organizationId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IXeroSyncStatusWithId;
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
      return snapshot.data() as IXeroSyncStatusWithId;
    }
    
    // Create new document with the provided ID
    await docRef.set(syncStatus);
    const snapshot = await docRef.get();
    return snapshot.data() as IXeroSyncStatusWithId;
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
    return snapshot.docs.map(doc => doc.data() as IXeroSyncStatusWithId);
  },

  /**
   * Find running Xero sync statuses
   */
  async findRunning(): Promise<IXeroSyncStatusWithId[]> {
    const snapshot = await XeroSyncStatusCollectionWithConverter
      .where('status', '==', 'running')
      .get();
    return snapshot.docs.map(doc => doc.data() as IXeroSyncStatusWithId);
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
  }
};

export default XeroSyncStatus;