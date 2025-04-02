/**
 * Marketplace Connections Model (Firestore)
 */
import { Timestamp } from 'firebase-admin/firestore';
import { marketplaceConnectionsCollection } from '../../../config/firestore';

/**
 * Marketplace type enum
 */
export enum MarketplaceType {
  TAKEALOT = 'takealot',
  AMAZON = 'amazon',
  AMAZON_US = 'amazon_us',
  AMAZON_UK = 'amazon_uk',
  AMAZON_EU = 'amazon_eu',
  SHOPIFY = 'shopify',
  XERO = 'xero',
}

/**
 * Connection status enum
 */
export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending',
  EXPIRED = 'expired',
}

/**
 * Sync status enum
 */
export enum SyncStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  IN_PROGRESS = 'in_progress',
}

/**
 * Authentication type enum
 */
export enum AuthenticationType {
  API_KEY = 'api_key',
  OAUTH = 'oauth',
  JWT = 'jwt',
  USERNAME_PASSWORD = 'username_password',
}

/**
 * Marketplace connection interface for Firestore
 */
export interface IMarketplaceConnection {
  userId: string;
  organizationId: string;
  marketplaceId: string;
  marketplaceName: string;
  authenticationType: AuthenticationType;
  credentialReference: string; // Reference to the credential in Secret Manager
  credentialMetadata?: {
    storeId?: string;
    sellerId?: string;
    accountId?: string;
    tenantId?: string;
    [key: string]: any;
  };
  status: ConnectionStatus;
  syncStatus?: SyncStatus;
  lastChecked?: Date | Timestamp;
  lastSyncedAt?: Date | Timestamp;
  lastError?: string;
  expiresAt?: Date | Timestamp;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Interface for Firestore document with ID
 */
export interface IMarketplaceConnectionWithId extends IMarketplaceConnection {
  id: string;
}

/**
 * Converter for Firestore
 */
export const marketplaceConnectionConverter = {
  toFirestore(connection: IMarketplaceConnection): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    
    return {
      userId: connection.userId,
      organizationId: connection.organizationId,
      marketplaceId: connection.marketplaceId,
      marketplaceName: connection.marketplaceName,
      authenticationType: connection.authenticationType,
      credentialReference: connection.credentialReference,
      credentialMetadata: connection.credentialMetadata || {},
      status: connection.status || ConnectionStatus.PENDING,
      syncStatus: connection.syncStatus,
      lastChecked: connection.lastChecked instanceof Date 
        ? Timestamp.fromDate(connection.lastChecked) 
        : connection.lastChecked,
      lastSyncedAt: connection.lastSyncedAt instanceof Date 
        ? Timestamp.fromDate(connection.lastSyncedAt) 
        : connection.lastSyncedAt,
      lastError: connection.lastError,
      expiresAt: connection.expiresAt instanceof Date 
        ? Timestamp.fromDate(connection.expiresAt) 
        : connection.expiresAt,
      createdAt: connection.createdAt instanceof Date 
        ? Timestamp.fromDate(connection.createdAt) 
        : connection.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IMarketplaceConnectionWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      organizationId: data.organizationId,
      marketplaceId: data.marketplaceId,
      marketplaceName: data.marketplaceName,
      authenticationType: data.authenticationType,
      credentialReference: data.credentialReference,
      credentialMetadata: data.credentialMetadata,
      status: data.status,
      syncStatus: data.syncStatus,
      lastChecked: data.lastChecked,
      lastSyncedAt: data.lastSyncedAt,
      lastError: data.lastError,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IMarketplaceConnectionWithId;
  }
};

// Apply the converter to the collection
const MarketplaceConnectionsCollectionWithConverter = 
  marketplaceConnectionsCollection.withConverter(marketplaceConnectionConverter);

/**
 * Helper functions for MarketplaceConnection operations
 */
export const MarketplaceConnection = {
  /**
   * Create a new marketplace connection
   */
  async create(connection: IMarketplaceConnection): Promise<IMarketplaceConnectionWithId> {
    const docRef = await MarketplaceConnectionsCollectionWithConverter.add(connection);
    const snapshot = await docRef.get();
    return snapshot.data() as IMarketplaceConnectionWithId;
  },

  /**
   * Get a marketplace connection by ID
   */
  async findById(id: string): Promise<IMarketplaceConnectionWithId | null> {
    const snapshot = await MarketplaceConnectionsCollectionWithConverter.doc(id).get();
    return snapshot.exists ? snapshot.data() as IMarketplaceConnectionWithId : null;
  },

  /**
   * Find connections by user ID
   */
  async findByUserId(userId: string): Promise<IMarketplaceConnectionWithId[]> {
    const snapshot = await MarketplaceConnectionsCollectionWithConverter
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => doc.data() as IMarketplaceConnectionWithId);
  },

  /**
   * Find connections by organization ID
   */
  async findByOrganizationId(organizationId: string): Promise<IMarketplaceConnectionWithId[]> {
    const snapshot = await MarketplaceConnectionsCollectionWithConverter
      .where('organizationId', '==', organizationId)
      .get();
    return snapshot.docs.map(doc => doc.data() as IMarketplaceConnectionWithId);
  },

  /**
   * Find connections by marketplace ID
   */
  async findByMarketplaceId(marketplaceId: string): Promise<IMarketplaceConnectionWithId[]> {
    const snapshot = await MarketplaceConnectionsCollectionWithConverter
      .where('marketplaceId', '==', marketplaceId)
      .get();
    return snapshot.docs.map(doc => doc.data() as IMarketplaceConnectionWithId);
  },

  /**
   * Find connection by user, organization and marketplace IDs
   */
  async findByUserOrgMarketplace(
    userId: string, 
    organizationId: string, 
    marketplaceId: string
  ): Promise<IMarketplaceConnectionWithId | null> {
    const snapshot = await MarketplaceConnectionsCollectionWithConverter
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .where('marketplaceId', '==', marketplaceId)
      .limit(1)
      .get();
    
    return snapshot.empty ? null : snapshot.docs[0].data() as IMarketplaceConnectionWithId;
  },

  /**
   * Update a marketplace connection
   */
  async update(id: string, connectionData: Partial<IMarketplaceConnection>): Promise<void> {
    const now = Timestamp.now();
    await MarketplaceConnectionsCollectionWithConverter.doc(id).update({
      ...connectionData,
      updatedAt: now
    });
  },

  /**
   * Delete a marketplace connection
   */
  async delete(id: string): Promise<void> {
    await MarketplaceConnectionsCollectionWithConverter.doc(id).delete();
  }
};

// Type exports
export type IConnection = IMarketplaceConnection;
export type IConnectionWithId = IMarketplaceConnectionWithId;

export default MarketplaceConnection;