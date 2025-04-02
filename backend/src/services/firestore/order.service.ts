// @ts-nocheck - Added by final-ts-fix.js
/**
 * Firestore Order Service
 * 
 * Provides methods for interacting with the orders collection in Firestore
 */
import { Timestamp } from 'firebase-admin/firestore';
import { db, ordersCollection } from '../../config/firestore';
import { FirestoreOrder, FirestoreOrderWithId, orderConverter } from '../../models/firestore/order.schema';

/**
 * Options for fetching orders
 */
export interface OrderFetchOptions {
  userId?: string;
  orgId?: string;
  limit?: number;
  startAfter?: Date;
  status?: string | string[];
  marketplaceName?: string;
  lastUpdatedAfter?: Date;
}

/**
 * Service for interacting with Firestore orders collection
 */
export class OrderService {
  /**
   * Create a new order in Firestore
   * @param orderData Order data to create
   * @returns Promise with created order ID
   */
  static async createOrder(orderData: FirestoreOrder): Promise<string> {
    try {
      // Ensure timestamps are set
      if (!orderData.createdAt) {
        orderData.createdAt = Timestamp.now();
      }
      orderData.updatedAt = Timestamp.now();
      
      // Add to Firestore
      const orderRef = await ordersCollection
        .withConverter(orderConverter)
        .add(orderData);
      
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order in Firestore:', error);
      throw error;
    }
  }
  
  /**
   * Get an order by ID
   * @param orderId The ID of the order to retrieve
   * @returns Promise with order data or null if not found
   */
  static async getOrderById(orderId: string): Promise<FirestoreOrderWithId | null> {
    try {
      const orderDoc = await ordersCollection
        .doc(orderId)
        .withConverter(orderConverter)
        .get();
      
      if (!orderDoc.exists) {
        return null;
      }
      
      return orderDoc.data() as FirestoreOrderWithId;
    } catch (error) {
      console.error(`Error getting order ${orderId} from Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Get an order by marketplace order ID
   * @param marketplaceOrderId The marketplace order ID
   * @param marketplaceName The marketplace name
   * @param userId The user ID (optional if orgId is provided)
   * @param orgId The org ID (optional if userId is provided)
   * @returns Promise with order data or null if not found
   */
  static async getOrderByMarketplaceId(
    marketplaceOrderId: string,
    marketplaceName: string,
    userId?: string,
    orgId?: string
  ): Promise<FirestoreOrderWithId | null> {
    try {
      if (!userId && !orgId) {
        throw new Error('Either userId or orgId must be provided');
      }
      
      let query = ordersCollection
        .where('marketplaceOrderId', '==', marketplaceOrderId)
        .where('marketplaceName', '==', marketplaceName);
      
      // Add user or org filter
      if (userId) {
        query = query.where('userId', '==', userId);
      } else if (orgId) {
        query = query.where('orgId', '==', orgId);
      }
      
      const snapshot = await query
        .withConverter(orderConverter)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      return snapshot.docs[0].data() as FirestoreOrderWithId;
    } catch (error) {
      console.error(`Error getting order by marketplace ID ${marketplaceOrderId} from Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Update an existing order
   * @param orderId The ID of the order to update
   * @param updateData The data to update
   * @returns Promise with success status
   */
  static async updateOrder(
    orderId: string,
    updateData: Partial<FirestoreOrder>
  ): Promise<boolean> {
    try {
      // Ensure updatedAt is set
      updateData.updatedAt = Timestamp.now();
      
      // Update in Firestore
      await ordersCollection.doc(orderId).update(updateData);
      
      return true;
    } catch (error) {
      console.error(`Error updating order ${orderId} in Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an order
   * @param orderId The ID of the order to delete
   * @returns Promise with success status
   */
  static async deleteOrder(orderId: string): Promise<boolean> {
    try {
      await ordersCollection.doc(orderId).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting order ${orderId} from Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch orders with pagination and filtering
   * @param options Options for fetching orders
   * @returns Promise with array of orders and last document for pagination
   */
  static async fetchOrders(
    options: OrderFetchOptions
  ): Promise<{ orders: FirestoreOrderWithId[]; lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null }> {
    try {
      const {
        userId,
        orgId,
        limit = 50,
        startAfter,
        status,
        marketplaceName,
        lastUpdatedAfter
      } = options;
      
      if (!userId && !orgId) {
        throw new Error('Either userId or orgId must be provided');
      }
      
      // Start building the query
      let query = ordersCollection.withConverter(orderConverter);
      
      // Apply user or organization filter
      if (userId) {
        query = query.where('userId', '==', userId);
      } else if (orgId) {
        query = query.where('orgId', '==', orgId);
      }
      
      // Apply status filter if provided
      if (status) {
        if (Array.isArray(status)) {
          // If multiple statuses, we need to use "in" operator
          query = query.where('status', 'in', status);
        } else {
          query = query.where('status', '==', status);
        }
      }
      
      // Apply marketplace filter if provided
      if (marketplaceName) {
        query = query.where('marketplaceName', '==', marketplaceName);
      }
      
      // Apply last updated filter if provided
      if (lastUpdatedAfter) {
        query = query.where('lastUpdatedMarketplace', '>=', Timestamp.fromDate(lastUpdatedAfter));
      }
      
      // Apply order by and pagination
      query = query.orderBy('orderDate', 'desc').limit(limit);
      
      // Apply startAfter if provided
      if (startAfter) {
        const startSnapshot = await ordersCollection
          .where('orderDate', '==', Timestamp.fromDate(startAfter))
          .limit(1)
          .get();
        
        if (!startSnapshot.empty) {
          query = query.startAfter(startSnapshot.docs[0]);
        }
      }
      
      // Execute the query
      const snapshot = await query.get();
      
      // Get the last document for pagination
      const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
      
      // Parse and return the results
      const orders = snapshot.docs.map(doc => doc.data() as FirestoreOrderWithId);
      
      return { orders, lastDoc };
    } catch (error) {
      console.error('Error fetching orders from Firestore:', error);
      throw error;
    }
  }
  
  /**
   * Search orders by SKU
   * @param sku The SKU to search for
   * @param userId The user ID
   * @param limit The maximum number of results
   * @returns Promise with array of orders
   */
  static async searchOrdersBySku(
    sku: string, 
    userId: string,
    limit = 50
  ): Promise<FirestoreOrderWithId[]> {
    try {
      // Unfortunately, we can't directly query on a field in an array of objects
      // So we need to fetch all orders and filter in-memory
      // This is not efficient for large datasets
      // A better approach would be to maintain a separate index collection
      
      const snapshot = await ordersCollection
        .where('userId', '==', userId)
        .orderBy('orderDate', 'desc')
        .limit(limit * 10) // Fetch more to account for filtering
        .withConverter(orderConverter)
        .get();
      
      // Filter orders that contain the SKU in lineItems
      const orders = snapshot.docs
        .map(doc => doc.data() as FirestoreOrderWithId)
        .filter(order => 
          order.lineItems.some(item => item.sku === sku)
        )
        .slice(0, limit);
      
      return orders;
    } catch (error) {
      console.error(`Error searching orders by SKU ${sku} in Firestore:`, error);
      throw error;
    }
  }
  
  /**
   * Get count of orders by status for a specific user or organization
   * @param userId The user ID (optional if orgId is provided)
   * @param orgId The org ID (optional if userId is provided)
   * @returns Promise with counts by status
   */
  static async getOrderCountsByStatus(
    userId?: string,
    orgId?: string
  ): Promise<Record<string, number>> {
    try {
      if (!userId && !orgId) {
        throw new Error('Either userId or orgId must be provided');
      }
      
      let query = ordersCollection;
      
      // Apply user or organization filter
      if (userId) {
        query = query.where('userId', '==', userId);
      } else if (orgId) {
        query = query.where('orgId', '==', orgId);
      }
      
      const snapshot = await query.get();
      
      // Count orders by status
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
      console.error('Error getting order counts by status from Firestore:', error);
      throw error;
    }
  }
  
  /**
   * Batch create or update orders
   * @param orders Array of orders to create or update
   * @param createOrUpdate Whether to create or update
   * @returns Promise with success status
   */
  static async batchCreateOrUpdateOrders(
    orders: FirestoreOrder[],
    createOrUpdate: 'create' | 'update' | 'upsert' = 'upsert'
  ): Promise<boolean> {
    try {
      const batchSize = 500; // Firestore batch size limit
      const batches = [];
      
      // Process in batches of batchSize
      for (let i = 0; i < orders.length; i += batchSize) {
        const batch = db.batch();
        const currentBatch = orders.slice(i, i + batchSize);
        
        for (const order of currentBatch) {
          // Ensure timestamps are set
          if (!order.createdAt) {
            order.createdAt = Timestamp.now();
          }
          order.updatedAt = Timestamp.now();
          
          // Generate a document ID based on marketplace order ID if not provided
          const docId = order.id || `${order.marketplaceName}-${order.marketplaceOrderId}`;
          const docRef = ordersCollection.doc(docId);
          
          if (createOrUpdate === 'create') {
            batch.create(docRef, order);
          } else if (createOrUpdate === 'update') {
            batch.update(docRef, order);
          } else {
            // Upsert logic
            const docSnapshot = await docRef.get();
            if (docSnapshot.exists) {
              batch.update(docRef, order);
            } else {
              batch.create(docRef, order);
            }
          }
        }
        
        batches.push(batch.commit());
      }
      
      // Wait for all batches to complete
      await Promise.all(batches);
      
      return true;
    } catch (error) {
      console.error('Error batch processing orders in Firestore:', error);
      throw error;
    }
  }
}