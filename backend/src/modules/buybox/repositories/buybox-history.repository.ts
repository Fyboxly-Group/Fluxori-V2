/**
 * Buy Box History Repository
 * 
 * Repository for managing Buy Box history data in Firestore
 */
import { getFirestore, DocumentSnapshot, Query } from 'firebase-admin/firestore';
import { injectable } from 'inversify';
import { 
  BuyBoxHistory, 
  buyBoxHistoryConverter,
  RepricingRule,
  repricingRuleConverter
} from '../../../models/firestore/buybox.schema';
import { Logger } from '../../../utils/logger';

/**
 * Interface for Buy Box history repository
 */
export interface IBuyBoxHistoryRepository {
  /**
   * Get a Buy Box history by ID
   * @param id The history ID
   * @returns Buy Box history or null if not found
   */
  getById(id: string): Promise<BuyBoxHistory | null>;
  
  /**
   * Find a Buy Box history by ID
   * @param id The history ID
   * @returns Buy Box history or null if not found
   */
  findById(id: string): Promise<BuyBoxHistory | null>;
  
  /**
   * Create a new Buy Box history
   * @param history The history to create
   * @returns The created history
   */
  create(history: BuyBoxHistory): Promise<BuyBoxHistory>;
  
  /**
   * Update a Buy Box history
   * @param id The history ID
   * @param updates Partial updates to apply
   * @returns The updated history
   */
  update(id: string, updates: Partial<BuyBoxHistory>): Promise<BuyBoxHistory | null>;
  
  /**
   * Delete a Buy Box history
   * @param id The history ID
   * @returns Success status
   */
  delete(id: string): Promise<boolean>;
  
  /**
   * Get all Buy Box histories for a product
   * @param productId The product ID
   * @returns Array of Buy Box histories
   */
  getByProduct(productId: string): Promise<BuyBoxHistory[]>;
  
  /**
   * Find all Buy Box histories for a marketplace
   * @param marketplaceId The marketplace ID
   * @param limit Optional limit on number of results
   * @returns Array of Buy Box histories
   */
  findByMarketplaceId(marketplaceId: string, limit?: number): Promise<BuyBoxHistory[]>;
  
  /**
   * Get all Buy Box histories for a marketplace
   * @param marketplaceId The marketplace ID
   * @param limit Optional limit on number of results
   * @param startAfter Optional document to start after for pagination
   * @returns Object containing histories and last document for pagination
   */
  getByMarketplace(
    marketplaceId: string, 
    limit?: number, 
    startAfter?: DocumentSnapshot
  ): Promise<{
    histories: BuyBoxHistory[],
    lastDoc: DocumentSnapshot | null
  }>;
  
  /**
   * Get all repricing rules
   * @returns Array of repricing rules
   */
  getRules(): Promise<RepricingRule[]>;
  
  /**
   * Get all Buy Box histories that are set for monitoring
   * @returns Array of Buy Box histories
   */
  getMonitored(): Promise<BuyBoxHistory[]>;
  
  /**
   * Get products that need Buy Box checking based on monitoring frequency
   * @returns Array of Buy Box histories that need checking
   */
  getProductsToCheck(): Promise<BuyBoxHistory[]>;
}

/**
 * Implementation of Buy Box history repository
 */
@injectable()
export class BuyBoxHistoryRepository implements IBuyBoxHistoryRepository {
  private readonly collectionName = 'buyBoxHistories';
  private readonly rulesCollectionName = 'repricingRules';
  private readonly logger: Logger;
  
  constructor() {
    this.logger = new Logger('BuyBoxHistoryRepository');
  }
  
  /**
   * Get a Buy Box history by ID
   * @param id The history ID
   * @returns Buy Box history or null if not found
   */
  async getById(id: string): Promise<BuyBoxHistory | null> {
    try {
      const db = getFirestore();
      const docRef = db.collection(this.collectionName).doc(id).withConverter(buyBoxHistoryConverter);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return doc.data() || null;
    } catch (error) {
      this.logger.error(`Failed to get Buy Box history ${id}`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
  
  /**
   * Find a Buy Box history by ID
   * @param id The history ID
   * @returns Buy Box history or null if not found
   */
  async findById(id: string): Promise<BuyBoxHistory | null> {
    return this.getById(id);
  }
  
  /**
   * Create a new Buy Box history
   * @param history The history to create
   * @returns The created history
   */
  async create(history: BuyBoxHistory): Promise<BuyBoxHistory> {
    try {
      const db = getFirestore();
      const docRef = db.collection(this.collectionName)
        .doc(history.id)
        .withConverter(buyBoxHistoryConverter);
      
      await docRef.set(history);
      
      return history;
    } catch (error) {
      this.logger.error(`Failed to create Buy Box history`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
  
  /**
   * Update a Buy Box history
   * @param id The history ID
   * @param updates Partial updates to apply
   * @returns The updated history
   */
  async update(id: string, updates: Partial<BuyBoxHistory>): Promise<BuyBoxHistory | null> {
    try {
      const db = getFirestore();
      const docRef = db.collection(this.collectionName).doc(id);
      
      await docRef.update(updates);
      
      // Get the updated document
      return await this.getById(id);
    } catch (error) {
      this.logger.error(`Failed to update Buy Box history ${id}`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
  
  /**
   * Delete a Buy Box history
   * @param id The history ID
   * @returns Success status
   */
  async delete(id: string): Promise<boolean> {
    try {
      const db = getFirestore();
      const docRef = db.collection(this.collectionName).doc(id);
      
      await docRef.delete();
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete Buy Box history ${id}`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
  
  /**
   * Get all Buy Box histories for a product
   * @param productId The product ID
   * @returns Array of Buy Box histories
   */
  async getByProduct(productId: string): Promise<BuyBoxHistory[]> {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collectionName)
        .where('productId', '==', productId)
        .withConverter(buyBoxHistoryConverter)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as BuyBoxHistory);
    } catch (error) {
      this.logger.error(`Failed to get Buy Box histories for product ${productId}`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
  
  /**
   * Find all Buy Box histories for a marketplace
   * @param marketplaceId The marketplace ID
   * @param limit Optional limit on number of results
   * @returns Array of Buy Box histories
   */
  async findByMarketplaceId(marketplaceId: string, limit: number = 20): Promise<BuyBoxHistory[]> {
    try {
      const db = getFirestore();
      const query = db.collection(this.collectionName)
        .where('marketplaceId', '==', marketplaceId)
        .orderBy('updatedAt', 'desc')
        .limit(limit)
        .withConverter(buyBoxHistoryConverter);
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => doc.data() as BuyBoxHistory);
    } catch (error) {
      this.logger.error(`Failed to find Buy Box histories for marketplace ${marketplaceId}`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
  
  /**
   * Get all Buy Box histories for a marketplace
   * @param marketplaceId The marketplace ID
   * @param limit Optional limit on number of results
   * @param startAfter Optional document to start after for pagination
   * @returns Object containing histories and last document for pagination
   */
  async getByMarketplace(
    marketplaceId: string, 
    limit: number = 20, 
    startAfter: DocumentSnapshot | null = null
  ): Promise<{
    histories: BuyBoxHistory[],
    lastDoc: DocumentSnapshot | null
  }> {
    try {
      const db = getFirestore();
      let query = db.collection(this.collectionName)
        .where('marketplaceId', '==', marketplaceId)
        .orderBy('updatedAt', 'desc')
        .limit(limit)
        .withConverter(buyBoxHistoryConverter);
      
      if (startAfter) {
        query = query.startAfter(startAfter) as Query<BuyBoxHistory>;
      }
      
      const snapshot = await query.get();
      
      return {
        histories: snapshot.docs.map(doc => doc.data() as BuyBoxHistory),
        lastDoc: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null
      };
    } catch (error) {
      this.logger.error(`Failed to get Buy Box histories for marketplace ${marketplaceId}`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
  
  /**
   * Get all Buy Box histories that are set for monitoring
   * @returns Array of Buy Box histories
   */
  async getMonitored(): Promise<BuyBoxHistory[]> {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.collectionName)
        .where('isMonitoring', '==', true)
        .withConverter(buyBoxHistoryConverter)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as BuyBoxHistory);
    } catch (error) {
      this.logger.error(`Failed to get monitored Buy Box histories`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
  
  /**
   * Get products that need Buy Box checking based on monitoring frequency
   * @returns Array of Buy Box histories that need checking
   */
  async getProductsToCheck(): Promise<BuyBoxHistory[]> {
    try {
      const db = getFirestore();
      const now = new Date();
      
      // Get all monitored histories
      const monitoredHistories = await this.getMonitored();
      
      // Filter to those that need checking based on last update time and frequency
      return monitoredHistories.filter(history => {
        if (!history.lastSnapshot || !history.lastSnapshot.lastChecked) {
          return true; // First time checking, should check immediately
        }
        
        const lastChecked = history.lastSnapshot.lastChecked.toDate();
        const frequencyMs = history.monitoringFrequency * 60 * 1000; // Convert minutes to ms
        const nextCheckTime = new Date(lastChecked.getTime() + frequencyMs);
        
        return nextCheckTime <= now;
      });
    } catch (error) {
      this.logger.error(`Failed to get products to check`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
  
  /**
   * Get all repricing rules
   * @returns Array of repricing rules
   */
  async getRules(): Promise<RepricingRule[]> {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(this.rulesCollectionName)
        .where('isActive', '==', true)
        .orderBy('priority', 'desc')
        .withConverter(repricingRuleConverter)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as RepricingRule);
    } catch (error) {
      this.logger.error(`Failed to get repricing rules`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
}

// Singleton instance
let repository: IBuyBoxHistoryRepository | null = null;

/**
 * Get the Buy Box history repository
 * @returns Buy Box history repository
 */
export function getBuyBoxHistoryRepository(): IBuyBoxHistoryRepository {
  if (!repository) {
    repository = new BuyBoxHistoryRepository();
  }
  
  return repository;
}