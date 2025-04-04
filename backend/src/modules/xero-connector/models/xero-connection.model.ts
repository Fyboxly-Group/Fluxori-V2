/**
 * Xero Connection Model (Firestore)
 */
import { Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { xeroConnectionsCollection } from '../../../config/firestore';
import * as crypto from 'crypto';

/**
 * Xero connection status
 */
export type XeroConnectionStatus = 'connected' | 'disconnected' | 'expired';

/**
 * Xero connection interface
 */
export interface IXeroConnection {
  userId: string;
  organizationId: string;
  tenantId: string;
  tenantName: string;
  refreshToken: string;
  tokenSetExpiresAt: Date | Timestamp;
  status: XeroConnectionStatus;
  lastSyncedAt?: Date | Timestamp;
  lastError?: string;
  additionalData?: Record<string, any>;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Interface for Firestore document with ID
 */
export interface IXeroConnectionWithId extends IXeroConnection {
  id: string;
}

/**
 * Encryption utilities for sensitive data
 */
const encryptValue = (value: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'a-very-secure-32-char-encryption-key', 'utf-8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

const decryptValue = (value: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'a-very-secure-32-char-encryption-key', 'utf-8');
  const parts = value.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Converter for Firestore
 */
export const xeroConnectionConverter = {
  toFirestore(connection: IXeroConnection): DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    
    return {
      userId: connection.userId,
      organizationId: connection.organizationId,
      tenantId: connection.tenantId,
      tenantName: connection.tenantName,
      refreshToken: encryptValue(connection.refreshToken),
      tokenSetExpiresAt: connection.tokenSetExpiresAt instanceof Date 
        ? Timestamp.fromDate(connection.tokenSetExpiresAt) 
        : connection.tokenSetExpiresAt,
      status: connection.status || 'connected',
      lastSyncedAt: connection.lastSyncedAt instanceof Date 
        ? Timestamp.fromDate(connection.lastSyncedAt) 
        : connection.lastSyncedAt,
      lastError: connection.lastError,
      additionalData: connection.additionalData || {},
      createdAt: connection.createdAt instanceof Date 
        ? Timestamp.fromDate(connection.createdAt) 
        : connection.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(snapshot: QueryDocumentSnapshot): IXeroConnectionWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      organizationId: data.organizationId,
      tenantId: data.tenantId,
      tenantName: data.tenantName,
      refreshToken: decryptValue(data.refreshToken),
      tokenSetExpiresAt: data.tokenSetExpiresAt,
      status: data.status as XeroConnectionStatus,
      lastSyncedAt: data.lastSyncedAt,
      lastError: data.lastError,
      additionalData: data.additionalData,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
};

// Apply the converter to the collection
const XeroConnectionsCollectionWithConverter = 
  xeroConnectionsCollection.withConverter(xeroConnectionConverter);

/**
 * Helper functions for XeroConnection operations
 */
export const XeroConnection = {
  /**
   * Create a new Xero connection
   */
  async create(connection: IXeroConnection): Promise<IXeroConnectionWithId> {
    const docRef = await XeroConnectionsCollectionWithConverter.add(connection);
    const snapshot = await docRef.get();
    const data = snapshot.data();
    if (!data) {
      throw new Error('Failed to create Xero connection');
    }
    return data;
  },

  /**
   * Get a Xero connection by ID
   */
  async findById(id: string): Promise<IXeroConnectionWithId | null> {
    const snapshot = await XeroConnectionsCollectionWithConverter.doc(id).get();
    return snapshot.exists ? snapshot.data() as IXeroConnectionWithId : null;
  },

  /**
   * Find Xero connection by tenant ID
   */
  async findByTenantId(tenantId: string): Promise<IXeroConnectionWithId | null> {
    const snapshot = await XeroConnectionsCollectionWithConverter
      .where('tenantId', '==', tenantId)
      .limit(1)
      .get();
    
    return snapshot.empty ? null : snapshot.docs[0].data() as IXeroConnectionWithId;
  },

  /**
   * Find Xero connections by user ID
   */
  async findByUserId(userId: string): Promise<IXeroConnectionWithId[]> {
    const snapshot = await XeroConnectionsCollectionWithConverter
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map((doc) => doc.data() as IXeroConnectionWithId);
  },

  /**
   * Find Xero connections by organization ID
   */
  async findByOrganizationId(organizationId: string): Promise<IXeroConnectionWithId[]> {
    const snapshot = await XeroConnectionsCollectionWithConverter
      .where('organizationId', '==', organizationId)
      .get();
    return snapshot.docs.map((doc) => doc.data() as IXeroConnectionWithId);
  },

  /**
   * Update a Xero connection
   */
  async update(id: string, connectionData: Partial<IXeroConnection>): Promise<void> {
    const now = Timestamp.now();
    
    // Create a copy to avoid modifying the original
    const dataToUpdate: Record<string, any> = { ...connectionData };
    
    // Need to handle the refreshToken specially for encryption
    if (dataToUpdate.refreshToken) {
      dataToUpdate.refreshToken = encryptValue(dataToUpdate.refreshToken);
    }
    
    await XeroConnectionsCollectionWithConverter.doc(id).update({
      ...dataToUpdate,
      updatedAt: now
    });
  },

  /**
   * Delete a Xero connection
   */
  async delete(id: string): Promise<void> {
    await XeroConnectionsCollectionWithConverter.doc(id).delete();
  }
};

export default XeroConnection;