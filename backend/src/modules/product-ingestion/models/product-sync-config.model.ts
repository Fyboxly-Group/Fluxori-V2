/**
 * Product Sync Configuration Model (Firestore)
 */
import { Timestamp, FirebaseFirestore } from 'firebase-admin/firestore';
import { db } from '../../../config/firestore';

/**
 * Sync direction enum
 */
export enum SyncDirection {
  TO_MARKETPLACE = 'to_marketplace', // Fluxori -> Marketplace
  FROM_MARKETPLACE = 'from_marketplace', // Marketplace -> Fluxori
  BOTH = 'both', // Both directions
  NONE = 'none' // No sync
}

/**
 * Sync frequency enum
 */
export enum SyncFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MANUAL = 'manual'
}

/**
 * Sync fields type
 */
export type SyncField = 'price' | 'stock' | 'status' | 'title' | 'description' | 'images' | 'attributes';

/**
 * Product sync configuration interface
 */
export interface IProductSyncConfig {
  id?: string;
  userId: string;
  organizationId: string;
  marketplaceId: string;
  syncEnabled?: boolean;
  syncDirection?: SyncDirection | 'both';
  syncFrequency?: SyncFrequency | 'daily';
  syncFields?: SyncField[];
  defaultWarehouseId?: string;
  lastSyncTimestamp?: Timestamp | Date | null;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/**
 * Converter for Firestore
 */
export const productSyncConfigConverter = {
  toFirestore(config: IProductSyncConfig): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    
    return {
      userId: config.userId,
      organizationId: config.organizationId,
      marketplaceId: config.marketplaceId,
      syncEnabled: typeof config.syncEnabled === 'boolean' ? config.syncEnabled : true,
      syncDirection: config.syncDirection || 'both',
      syncFrequency: config.syncFrequency || 'daily',
      syncFields: config.syncFields || ['price', 'stock', 'status'],
      defaultWarehouseId: config.defaultWarehouseId || 'default',
      lastSyncTimestamp: config.lastSyncTimestamp instanceof Date 
        ? Timestamp.fromDate(config.lastSyncTimestamp)
        : config.lastSyncTimestamp || null,
      createdAt: config.createdAt instanceof Date 
        ? Timestamp.fromDate(config.createdAt) 
        : config.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IProductSyncConfig {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      organizationId: data.organizationId,
      marketplaceId: data.marketplaceId,
      syncEnabled: data.syncEnabled,
      syncDirection: data.syncDirection,
      syncFrequency: data.syncFrequency,
      syncFields: data.syncFields,
      defaultWarehouseId: data.defaultWarehouseId,
      lastSyncTimestamp: data.lastSyncTimestamp,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
};

/**
 * Helper functions for ProductSyncConfig operations
 */
export class ProductSyncConfig {
  private static readonly collection = db.collection('productSyncConfigs')
    .withConverter(productSyncConfigConverter);

  /**
   * Create a new product sync configuration
   */
  static async create(config: Omit<IProductSyncConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProductSyncConfig> {
    const now = Timestamp.now();
    const docRef = await this.collection.add({
      ...config,
      createdAt: now,
      updatedAt: now
    } as IProductSyncConfig);
    
    const snapshot = await docRef.get();
    return snapshot.data() as IProductSyncConfig;
  }

  /**
   * Get a product sync configuration by ID
   */
  static async findById(id: string): Promise<IProductSyncConfig | null> {
    const snapshot = await this.collection.doc(id).get();
    return snapshot.exists ? snapshot.data() as IProductSyncConfig : null;
  }

  /**
   * Find product sync configuration by user, organization and marketplace IDs
   */
  static async findByUserOrgMarketplace(
    userId: string, 
    organizationId: string, 
    marketplaceId: string
  ): Promise<IProductSyncConfig | null> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .where('marketplaceId', '==', marketplaceId)
      .limit(1)
      .get();
    
    return snapshot.empty ? null : snapshot.docs[0].data() as IProductSyncConfig;
  }

  /**
   * Find product sync configurations by marketplace ID
   */
  static async findByMarketplaceId(marketplaceId: string): Promise<IProductSyncConfig[]> {
    const snapshot = await this.collection
      .where('marketplaceId', '==', marketplaceId)
      .get();
      
    return snapshot.docs.map(doc => doc.data() as IProductSyncConfig);
  }

  /**
   * Update a product sync configuration
   */
  static async update(id: string, configData: Partial<IProductSyncConfig>): Promise<void> {
    const now = Timestamp.now();
    await this.collection.doc(id).update({
      ...configData,
      updatedAt: now
    });
  }

  /**
   * Delete a product sync configuration
   */
  static async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}

export default ProductSyncConfig;