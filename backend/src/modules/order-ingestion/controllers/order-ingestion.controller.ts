import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { Firestore } from 'firebase-admin/firestore';
import { Logger } from 'winston';

import { ApiError } from '../../../middleware/error.middleware';
import orderIngestionService, { OrderIngestionService, OrderIngestionOptions, OrderIngestionResponse } from '../services/order-ingestion.service';
import { MarketplaceAdapter } from '../../marketplaces/adapters/marketplace-adapter.factory';
import { MarketplaceAdapterFactoryService } from '../../marketplaces/services/marketplace-adapter-factory.service';
import { MarketplaceOrder } from '../../marketplaces/models/marketplace.models';
import { IOrderWithId } from '../models/order.model';
import { orderConverter } from '../models/order.model';

// Import the extended Express Request interface with user property
import '../../../middleware/auth.middleware';

/**
 * Authenticated request type
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
}

/**
 * Controller for order ingestion operations
 */
@injectable()
export class OrderIngestionController {
  private orderIngestionService: OrderIngestionService;
  private db: Firestore;
  private logger: Logger;
  private adapterFactory: MarketplaceAdapterFactoryService;

  /**
   * Constructor
   * @param db - Firestore database instance
   * @param logger - Logger instance
   * @param adapterFactory - Marketplace adapter factory
   */
  constructor(
    @inject('Firestore') db: Firestore,
    @inject('Logger') logger: Logger,
    @inject(MarketplaceAdapterFactoryService) adapterFactory: MarketplaceAdapterFactoryService
  ) {
    this.db = db;
    this.logger = logger;
    this.adapterFactory = adapterFactory;
    this.orderIngestionService = orderIngestionService;
  }

  /**
   * Ingest orders from a marketplace
   * @route POST /api/orders/ingest/:marketplaceId
   */
  public async ingestOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(401, 'Unauthorized');
      }

      const { marketplaceId } = req.params;
      const options: OrderIngestionOptions = req.body.options || {};
      
      // Default to the current user's ID and organization
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      this.logger.info(`Ingesting orders from ${marketplaceId} for user ${userId} and organization ${organizationId}`);

      // Get marketplace adapter
      const adapter = await this.adapterFactory.getAdapter(marketplaceId, userId);
      if (!adapter) {
        return res.status(400).json({
          success: false,
          message: `No adapter available for marketplace: ${marketplaceId}`
        });
      }

      // Fetch recent orders from the marketplace
      // Default to last 7 days if not specified
      const sinceDate = options.sinceDate 
        ? new Date(options.sinceDate) 
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const ordersResponse = await adapter.getRecentOrders(sinceDate, 0, 100);
      
      if (!ordersResponse.data || ordersResponse.data.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No new orders found to ingest',
          data: {
            ordersCreated: 0,
            ordersUpdated: 0,
            ordersSkipped: 0,
            xeroInvoicesCreated: 0
          }
        });
      }

      // Process the orders
      const result = await this.orderIngestionService.ingestOrders(
        marketplaceId,
        userId,
        organizationId,
        ordersResponse.data,
        options
      );

      return res.status(200).json({
        success: true,
        message: `Successfully processed ${ordersResponse.data.length} orders from ${marketplaceId}`,
        data: {
          ordersCreated: result.ordersCreated,
          ordersUpdated: result.ordersUpdated,
          ordersSkipped: result.ordersSkipped,
          xeroInvoicesCreated: result.xeroInvoicesCreated,
          errors: result.errors.length > 0 ? result.errors : undefined
        }
      });
    } catch (error) {
      this.logger.error('Error in ingestOrders:', error);
      
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }

  /**
   * Get orders with pagination and filtering
   * @route GET /api/orders
   */
  public async getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(401, 'Unauthorized');
      }

      const { 
        page = '1', 
        limit = '50', 
        status, 
        marketplaceName, 
        startDate, 
        endDate 
      } = req.query;

      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      
      // Parse pagination params
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      
      if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters. Page must be ≥ 1 and limit must be between 1 and 100.'
        });
      }

      // Build query
      let query = this.db.collection('orders')
        .where('userId', '==', userId)
        .where('organizationId', '==', organizationId)
        .withConverter(orderConverter);
      
      // Apply filters
      if (status) {
        query = query.where('orderStatus', '==', status);
      }
      
      if (marketplaceName) {
        query = query.where('marketplaceName', '==', marketplaceName);
      }
      
      // Apply date filters
      if (startDate) {
        const startDateObj = new Date(startDate as string);
        if (!isNaN(startDateObj.getTime())) {
          query = query.where('orderDate', '>=', startDateObj);
        }
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate as string);
        if (!isNaN(endDateObj.getTime())) {
          query = query.where('orderDate', '<=', endDateObj);
        }
      }
      
      // Order by date (descending)
      query = query.orderBy('orderDate', 'desc');
      
      // Apply pagination
      const startAt = (pageNum - 1) * limitNum;
      query = query.offset(startAt).limit(limitNum);
      
      // Execute query
      const snapshot = await query.get();
      const orders = snapshot.docs.map(doc => doc.data());
      
      // Get total count for pagination
      const countQuery = this.db.collection('orders')
        .where('userId', '==', userId)
        .where('organizationId', '==', organizationId);
      
      // Apply the same filters to the count query
      if (status) {
        query = query.where('orderStatus', '==', status);
      }
      
      if (marketplaceName) {
        query = query.where('marketplaceName', '==', marketplaceName);
      }
      
      const countSnapshot = await countQuery.count().get();
      const totalCount = countSnapshot.data().count;
      
      return res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limitNum)
          }
        }
      });
    } catch (error) {
      this.logger.error('Error in getOrders:', error);
      
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }

  /**
   * Get order by ID
   * @route GET /api/orders/:orderId
   */
  public async getOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(401, 'Unauthorized');
      }

      const { orderId } = req.params;
      
      // Get order by ID
      const orderDoc = await this.db.collection('orders')
        .doc(orderId)
        .withConverter(orderConverter)
        .get();
      
      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: `Order with ID ${orderId} not found`
        });
      }
      
      const order = orderDoc.data() as IOrderWithId;
      
      // Verify ownership
      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this order'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      this.logger.error('Error in getOrderById:', error);
      
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }

  /**
   * Update order status
   * @route PATCH /api/orders/:orderId/status
   */
  public async updateOrderStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(401, 'Unauthorized');
      }

      const { orderId } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Order status is required'
        });
      }
      
      // Get order by ID
      const orderDoc = await this.db.collection('orders')
        .doc(orderId)
        .withConverter(orderConverter)
        .get();
      
      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: `Order with ID ${orderId} not found`
        });
      }
      
      const order = orderDoc.data() as IOrderWithId;
      
      // Verify ownership
      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this order'
        });
      }
      
      // Update order status
      await this.db.collection('orders')
        .doc(orderId)
        .update({
          orderStatus: status,
          updatedAt: new Date()
        });
      
      return res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: { orderId, status }
      });
    } catch (error) {
      this.logger.error('Error in updateOrderStatus:', error);
      
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }

  /**
   * Get order statistics
   * @route GET /api/orders/stats
   */
  public async getOrderStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(401, 'Unauthorized');
      }

      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      
      // Get counts by status
      const orderStatusCounts = await this.getOrderStatusCounts(userId, organizationId);
      
      // Get counts by marketplace
      const marketplaceCounts = await this.getMarketplaceCounts(userId, organizationId);
      
      // Get recent order trend (last 7 days)
      const orderTrend = await this.getOrderTrend(userId, organizationId);
      
      return res.status(200).json({
        success: true,
        data: {
          orderStatusCounts,
          marketplaceCounts,
          orderTrend
        }
      });
    } catch (error) {
      this.logger.error('Error in getOrderStats:', error);
      
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }

  /**
   * Get order counts by status
   */
  private async getOrderStatusCounts(userId: string, organizationId: string): Promise<Record<string, number>> {
    const snapshot = await this.db.collection('orders')
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .get();
    
    const counts: Record<string, number> = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const status = data.orderStatus;
      
      if (!counts[status]) {
        counts[status] = 0;
      }
      
      counts[status]++;
    });
    
    return counts;
  }

  /**
   * Get order counts by marketplace
   */
  private async getMarketplaceCounts(userId: string, organizationId: string): Promise<Record<string, number>> {
    const snapshot = await this.db.collection('orders')
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .get();
    
    const counts: Record<string, number> = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const marketplace = data.marketplaceName;
      
      if (!counts[marketplace]) {
        counts[marketplace] = 0;
      }
      
      counts[marketplace]++;
    });
    
    return counts;
  }

  /**
   * Get order trend for the last 7 days
   */
  private async getOrderTrend(userId: string, organizationId: string): Promise<Array<{ date: string; count: number }>> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const snapshot = await this.db.collection('orders')
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .where('orderDate', '>=', sevenDaysAgo)
      .get();
    
    const trend: Record<string, number> = {};
    
    // Initialize the trend object with dates for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend[date.toISOString().split('T')[0]] = 0;
    }
    
    // Populate with actual counts
    snapshot.forEach(doc => {
      const data = doc.data();
      const orderDate = data.orderDate.toDate();
      const dateString = orderDate.toISOString().split('T')[0];
      
      if (trend[dateString] !== undefined) {
        trend[dateString]++;
      }
    });
    
    // Convert to array format sorted by date
    return Object.entries(trend)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export default OrderIngestionController;