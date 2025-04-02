// @ts-nocheck - Added by final-ts-fix.js
/**
 * Firestore Inventory Service
 * 
 * Provides methods for interacting with the inventory collection in Firestore
 */
import { Timestamp } from 'firebase-admin/firestore';
import { db, inventoryCollection } from '../../config/firestore';
import { 
  FirestoreInventoryItem, 
  FirestoreInventoryItemWithId,
  inventoryConverter,
  ProductStatus,
  MarketplaceListing
} from '../../models/firestore/inventory.schema';

/**
 * Options for fetching inventory items
 */
export interface InventoryFetchOptions {
  userId?: string;
  orgId?: string;
  limit?: number;
  startAfter?: string; // SKU to start after
  status?: ProductStatus | string;
  tags?: string[];
  categories?: string[];
  searchTerm?: string;
  updatedAfter?: Date;
}

/**
 * Service for interacting with Firestore inventory collection
 */
export class InventoryService {
  /**
   * Create a new inventory item in Firestore
   * @param itemData Inventory item data to create
   * @returns Promise with created item ID
   */
  static async createInventoryItem(itemData: FirestoreInventoryItem): Promise<string> {
    try {
      // Ensure timestamps are set
      if (!itemData.createdAt) {
        itemData.createdAt = Timestamp.now();
      }
      itemData.updatedAt = Timestamp.now();
      
      // Calculate total stock
      itemData.totalStock = Object.values(itemData.stockLevels || {})
        .reduce((sum, warehouseStock) => sum + warehouseStock.quantityOnHand, 0);
      
      // Add to Firestore
      const itemRef = await inventoryCollection
        .withConverter(inventoryConverter)
        .add(itemData);
      
      return itemRef.id;
    } catch (error) {
      console.error('Error creating inventory item in Firestore:', error);
      throw error;
    }
  }
  
  /**
   * Get an inventory item by ID
   * @param itemId The ID of the inventory item to retrieve
   * @returns Promise with inventory item data or null if not found
   */
  static async getInventoryItemById(itemId: string): Promise<FirestoreInventoryItemWithId | null> {
    try {
      const itemDoc = await inventoryCollection
        .doc(itemId)
        .withConverter(inventoryConverter)
        .get();
      
      if (!itemDoc.exists) {
        return null;
      }
      
      return itemDoc.data() as FirestoreInventoryItemWithId;
    } catch (error) {
      console.error(`Error getting inventory item ${itemId} from Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Get an inventory item by SKU
   * @param sku The SKU of the inventory item
   * @param userId The user ID (optional if orgId is provided)
   * @param orgId The org ID (optional if userId is provided)
   * @returns Promise with inventory item data or null if not found
   */
  static async getInventoryItemBySku(
    sku: string,
    userId?: string,
    orgId?: string
  ): Promise<FirestoreInventoryItemWithId | null> {
    try {
      if (!userId && !orgId) {
        throw new Error('Either userId or orgId must be provided');
      }
      
      let query = inventoryCollection.where('sku', '==', sku);
      
      // Add user or org filter
      if (userId) {
        query = query.where('userId', '==', userId);
      } else if (orgId) {
        query = query.where('orgId', '==', orgId);
      }
      
      const snapshot = await query
        .withConverter(inventoryConverter)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      return snapshot.docs[0].data() as FirestoreInventoryItemWithId;
    } catch (error) {
      console.error(`Error getting inventory item by SKU ${sku} from Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Get inventory items by marketplace product ID
   * @param marketplaceId The marketplace ID (e.g., 'takealot', 'amazon_us')
   * @param marketplaceProductId The marketplace product ID
   * @param userId The user ID (optional if orgId is provided)
   * @param orgId The org ID (optional if userId is provided)
   * @returns Promise with inventory item data or null if not found
   */
  static async getInventoryItemByMarketplaceId(
    marketplaceId: string,
    marketplaceProductId: string,
    userId?: string,
    orgId?: string
  ): Promise<FirestoreInventoryItemWithId | null> {
    try {
      if (!userId && !orgId) {
        throw new Error('Either userId or orgId must be provided');
      }
      
      // For marketplace product IDs, we need to query differently
      // Use the fieldPath: `marketplaces.${marketplaceId}.marketplaceProductId`
      const fieldPath = `marketplaces.${marketplaceId}.marketplaceProductId`;
      
      let query = inventoryCollection.where(fieldPath, '==', marketplaceProductId);
      
      // Add user or org filter
      if (userId) {
        query = query.where('userId', '==', userId);
      } else if (orgId) {
        query = query.where('orgId', '==', orgId);
      }
      
      const snapshot = await query
        .withConverter(inventoryConverter)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      return snapshot.docs[0].data() as FirestoreInventoryItemWithId;
    } catch (error) {
      console.error(`Error getting inventory item by marketplace ID ${marketplaceProductId} from Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Update an existing inventory item
   * @param itemId The ID of the inventory item to update
   * @param updateData The data to update
   * @returns Promise with success status
   */
  static async updateInventoryItem(
    itemId: string,
    updateData: Partial<FirestoreInventoryItem>
  ): Promise<boolean> {
    try {
      // Ensure updatedAt is set
      updateData.updatedAt = Timestamp.now();
      
      // Recalculate total stock if stock levels were updated
      if (updateData.stockLevels) {
        updateData.totalStock = Object.values(updateData.stockLevels)
          .reduce((sum, warehouseStock) => sum + warehouseStock.quantityOnHand, 0);
      }
      
      // Update in Firestore
      await inventoryCollection.doc(itemId).update(updateData);
      
      return true;
    } catch (error) {
      console.error(`Error updating inventory item ${itemId} in Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Update inventory item stock levels for specific warehouse
   * @param itemId The ID of the inventory item
   * @param warehouseId The warehouse ID
   * @param quantityOnHand The new quantity on hand
   * @param quantityAllocated The new quantity allocated
   * @returns Promise with success status
   */
  static async updateStockLevel(
    itemId: string,
    warehouseId: string,
    quantityOnHand: number,
    quantityAllocated?: number
  ): Promise<boolean> {
    try {
      // First get the current item to ensure we have the latest stock levels
      const item = await this.getInventoryItemById(itemId);
      if (!item) {
        throw new Error(`Inventory item ${itemId} not found`);
      }
      
      // Create or update the warehouse stock entry
      const warehouseStock = item.stockLevels[warehouseId] || {
        warehouseId,
        quantityOnHand: 0,
        quantityAllocated: 0,
        lastUpdated: Timestamp.now()
      };
      
      // Update the quantities
      warehouseStock.quantityOnHand = quantityOnHand;
      if (quantityAllocated !== undefined) {
        warehouseStock.quantityAllocated = quantityAllocated;
      }
      warehouseStock.lastUpdated = Timestamp.now();
      
      // Update the stock levels map
      const stockLevels = {
        ...item.stockLevels,
        [warehouseId]: warehouseStock
      };
      
      // Calculate the new total stock
      const totalStock = Object.values(stockLevels)
        .reduce((sum, stock) => sum + stock.quantityOnHand, 0);
      
      // Update the inventory item
      await inventoryCollection.doc(itemId).update({
        stockLevels,
        totalStock,
        updatedAt: Timestamp.now()
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating stock level for item ${itemId} in Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Update marketplace listing for an inventory item
   * @param itemId The ID of the inventory item
   * @param marketplaceId The marketplace ID (e.g., 'takealot', 'amazon_us')
   * @param listingData The marketplace listing data
   * @returns Promise with success status
   */
  static async updateMarketplaceListing(
    itemId: string,
    marketplaceId: string,
    listingData: MarketplaceListing
  ): Promise<boolean> {
    try {
      // Ensure the listing has a lastSynced timestamp
      if (!listingData.lastSynced) {
        listingData.lastSynced = Timestamp.now();
      }
      
      // Update the marketplace listing
      await inventoryCollection.doc(itemId).update({
        [`marketplaces.${marketplaceId}`]: listingData,
        updatedAt: Timestamp.now()
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating marketplace listing for item ${itemId} in Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an inventory item
   * @param itemId The ID of the inventory item to delete
   * @returns Promise with success status
   */
  static async deleteInventoryItem(itemId: string): Promise<boolean> {
    try {
      await inventoryCollection.doc(itemId).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting inventory item ${itemId} from Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch inventory items with pagination and filtering
   * @param options Options for fetching inventory items
   * @returns Promise with array of inventory items and last document for pagination
   */
  static async fetchInventoryItems(
    options: InventoryFetchOptions
  ): Promise<{ items: FirestoreInventoryItemWithId[]; lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null }> {
    try {
      const {
        userId,
        orgId,
        limit = 50,
        startAfter,
        status,
        tags,
        categories,
        searchTerm,
        updatedAfter
      } = options;
      
      if (!userId && !orgId) {
        throw new Error('Either userId or orgId must be provided');
      }
      
      // Start building the query
      let query = inventoryCollection.withConverter(inventoryConverter);
      
      // Apply user or organization filter
      if (userId) {
        query = query.where('userId', '==', userId);
      } else if (orgId) {
        query = query.where('orgId', '==', orgId);
      }
      
      // Apply status filter if provided
      if (status) {
        query = query.where('status', '==', status);
      }
      
      // Apply tags filter if provided
      // Note: We can only filter on one array-contains at a time in Firestore
      if (tags && tags.length > 0) {
        query = query.where('tags', 'array-contains', tags[0]);
        // Additional tag filtering will be done in memory after fetching
      }
      
      // Apply categories filter if provided (similar limitation as tags)
      if (categories && categories.length > 0 && !tags) {
        query = query.where('categories', 'array-contains', categories[0]);
        // Additional category filtering will be done in memory after fetching
      }
      
      // Apply last updated filter if provided
      if (updatedAfter) {
        query = query.where('updatedAt', '>=', Timestamp.fromDate(updatedAfter));
      }
      
      // Apply order by
      query = query.orderBy('updatedAt', 'desc');
      
      // Apply pagination
      query = query.limit(limit);
      
      // Apply startAfter if provided
      if (startAfter) {
        const startDoc = await inventoryCollection.doc(startAfter).get();
        if (startDoc.exists) {
          query = query.startAfter(startDoc);
        }
      }
      
      // Execute the query
      const snapshot = await query.get();
      
      // Get the last document for pagination
      const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
      
      // Parse and filter the results
      let items = snapshot.docs.map(doc => doc.data() as FirestoreInventoryItemWithId);
      
      // Apply additional tag filtering if multiple tags were specified
      if (tags && tags.length > 1) {
        items = items.filter(item => 
          tags.every(tag => item.tags?.includes(tag))
        );
      }
      
      // Apply additional category filtering if multiple categories were specified
      if (categories && categories.length > 1) {
        items = items.filter(item => 
          categories.every(category => item.categories?.includes(category))
        );
      }
      
      // Apply search term filtering
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        items = items.filter(item => 
          item.title.toLowerCase().includes(term) ||
          item.sku.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.barcode?.toLowerCase().includes(term)
        );
      }
      
      return { items, lastDoc };
    } catch (error) {
      console.error('Error fetching inventory items from Firestore:', error);
      throw error;
    }
  }
  
  /**
   * Get count of inventory items by status for a specific user or organization
   * @param userId The user ID (optional if orgId is provided)
   * @param orgId The org ID (optional if userId is provided)
   * @returns Promise with counts by status
   */
  static async getInventoryCountsByStatus(
    userId?: string,
    orgId?: string
  ): Promise<Record<string, number>> {
    try {
      if (!userId && !orgId) {
        throw new Error('Either userId or orgId must be provided');
      }
      
      let query = inventoryCollection;
      
      // Apply user or organization filter
      if (userId) {
        query = query.where('userId', '==', userId);
      } else if (orgId) {
        query = query.where('orgId', '==', orgId);
      }
      
      const snapshot = await query.get();
      
      // Count items by status
      const countsByStatus: Record<string, number> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const status = data.status || 'unknown';
        
        if (!countsByStatus[status]) {
          countsByStatus[status] = 0;
        }
        
        countsByStatus[status]++;
      });
      
      return countsByStatus;
    } catch (error) {
      console.error('Error getting inventory counts by status from Firestore:', error);
      throw error;
    }
  }
  
  /**
   * Batch create or update inventory items
   * @param items Array of inventory items to create or update
   * @param createOrUpdate Whether to create or update
   * @returns Promise with success status
   */
  static async batchCreateOrUpdateInventoryItems(
    items: FirestoreInventoryItem[],
    createOrUpdate: 'create' | 'update' | 'upsert' = 'upsert'
  ): Promise<boolean> {
    try {
      const batchSize = 500; // Firestore batch size limit
      const batches = [];
      
      // Process in batches of batchSize
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = db.batch();
        const currentBatch = items.slice(i, i + batchSize);
        
        for (const item of currentBatch) {
          // Ensure timestamps are set
          if (!item.createdAt) {
            item.createdAt = Timestamp.now();
          }
          item.updatedAt = Timestamp.now();
          
          // Calculate total stock
          item.totalStock = Object.values(item.stockLevels || {})
            .reduce((sum, warehouseStock) => sum + warehouseStock.quantityOnHand, 0);
          
          // Generate a document ID based on SKU if not provided
          const docId = item.id || `${item.userId || item.orgId}-${item.sku}`;
          const docRef = inventoryCollection.doc(docId);
          
          if (createOrUpdate === 'create') {
            batch.create(docRef, item);
          } else if (createOrUpdate === 'update') {
            batch.update(docRef, item);
          } else {
            // Upsert logic
            const docSnapshot = await docRef.get();
            if (docSnapshot.exists) {
              batch.update(docRef, item);
            } else {
              batch.create(docRef, item);
            }
          }
        }
        
        batches.push(batch.commit());
      }
      
      // Wait for all batches to complete
      await Promise.all(batches);
      
      return true;
    } catch (error) {
      console.error('Error batch processing inventory items in Firestore:', error);
      throw error;
    }
  }
}