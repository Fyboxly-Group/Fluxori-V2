/**
 * Inventory Service Implementation
 * Provides business logic for inventory operations with TypeScript support
 */
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/container';
import { ID } from '@/types/base.types';
import { BadRequestError, ConflictError, NotFoundError } from '@/types/error.types';
import { 
  IInventoryService,
  IInventoryItem,
  IInventoryLevel,
  IInventoryTransaction,
  IInventoryReservation,
  IStockCount,
  IStockCountItem,
  IStockAlert,
  StockAlertType,
  InventoryTransactionType
} from '../interfaces/inventory.interface';
import { 
  IInventoryItemRepository,
  IInventoryLevelRepository,
  IInventoryTransactionRepository,
  IStockAlertRepository
} from '../repositories/inventory.repository';
import { IWarehouseRepository } from '../repositories/warehouse.repository';
import { logger } from '@/utils/logger';

/**
 * Inventory service implementation
 */
@injectable()
export class InventoryService implements IInventoryService {
  /**
   * Constructor
   * @param inventoryItemRepository - Inventory item repository
   * @param inventoryLevelRepository - Inventory level repository
   * @param inventoryTransactionRepository - Inventory transaction repository
   * @param stockAlertRepository - Stock alert repository
   * @param warehouseRepository - Warehouse repository
   */
  constructor(
    @inject(TYPES.InventoryItemRepository) private inventoryItemRepository: IInventoryItemRepository,
    @inject(TYPES.InventoryLevelRepository) private inventoryLevelRepository: IInventoryLevelRepository,
    @inject(TYPES.InventoryTransactionRepository) private inventoryTransactionRepository: IInventoryTransactionRepository,
    @inject(TYPES.StockAlertRepository) private stockAlertRepository: IStockAlertRepository,
    @inject(TYPES.WarehouseRepository) private warehouseRepository: IWarehouseRepository
  ) {}

  /**
   * Creates a warehouse
   * @param data - Warehouse data
   * @returns Created warehouse
   */
  public async createWarehouse(
    data: Omit<IWarehouse, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IWarehouse> {
    try {
      // Check if a warehouse with this code already exists
      const existingWarehouse = await this.warehouseRepository.findByCode(
        data.code, 
        data.organizationId
      );
      
      if (existingWarehouse) {
        throw new ConflictError(`Warehouse with code ${data.code} already exists`);
      }
      
      // Create warehouse
      return this.warehouseRepository.create(data);
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error creating warehouse:', error);
      throw new BadRequestError('Failed to create warehouse');
    }
  }

  /**
   * Gets a warehouse by ID
   * @param id - Warehouse ID
   * @returns Warehouse or null
   */
  public async getWarehouseById(id: ID): Promise<IWarehouse | null> {
    return this.warehouseRepository.findById(id);
  }

  /**
   * Updates a warehouse
   * @param id - Warehouse ID
   * @param data - Warehouse update data
   * @returns Updated warehouse
   */
  public async updateWarehouse(
    id: ID, 
    data: Partial<Omit<IWarehouse, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<IWarehouse> {
    try {
      // Get the warehouse to check existence and get the organizationId
      const warehouse = await this.warehouseRepository.findByIdOrFail(id);
      
      // If code is being updated, check for uniqueness
      if (data.code && data.code !== warehouse.code) {
        const existingWarehouse = await this.warehouseRepository.findByCode(
          data.code, 
          warehouse.organizationId
        );
        
        if (existingWarehouse && existingWarehouse.id.toString() !== id.toString()) {
          throw new ConflictError(`Warehouse with code ${data.code} already exists`);
        }
      }
      
      // Update the warehouse
      return this.warehouseRepository.update(id, data);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error updating warehouse:', error);
      throw new BadRequestError('Failed to update warehouse');
    }
  }

  /**
   * Deletes a warehouse
   * @param id - Warehouse ID
   * @returns Whether warehouse was deleted
   */
  public async deleteWarehouse(id: ID): Promise<boolean> {
    try {
      // Check for inventory in this warehouse
      // In a real implementation, we'd check inventory levels for this warehouse
      
      return this.warehouseRepository.delete(id);
    } catch (error) {
      logger.error('Error deleting warehouse:', error);
      throw new BadRequestError('Failed to delete warehouse');
    }
  }

  /**
   * Creates an inventory item
   * @param data - Inventory item data
   * @returns Created inventory item
   */
  public async createInventoryItem(
    data: Omit<IInventoryItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IInventoryItem> {
    try {
      // Check if an item with this SKU already exists
      const existingItem = await this.inventoryItemRepository.findBySku(
        data.sku, 
        data.organizationId
      );
      
      if (existingItem) {
        throw new ConflictError(`Inventory item with SKU ${data.sku} already exists`);
      }
      
      // Check if default warehouse exists
      await this.warehouseRepository.findByIdOrFail(data.defaultWarehouseId);
      
      // Create inventory item
      return this.inventoryItemRepository.create(data);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error creating inventory item:', error);
      throw new BadRequestError('Failed to create inventory item');
    }
  }

  /**
   * Gets an inventory item by ID
   * @param id - Inventory item ID
   * @returns Inventory item or null
   */
  public async getInventoryItemById(id: ID): Promise<IInventoryItem | null> {
    return this.inventoryItemRepository.findById(id);
  }

  /**
   * Gets an inventory item by SKU
   * @param sku - Inventory item SKU
   * @param organizationId - Organization ID
   * @returns Inventory item or null
   */
  public async getInventoryItemBySku(sku: string, organizationId: ID): Promise<IInventoryItem | null> {
    return this.inventoryItemRepository.findBySku(sku, organizationId);
  }

  /**
   * Updates an inventory item
   * @param id - Inventory item ID
   * @param data - Inventory item update data
   * @returns Updated inventory item
   */
  public async updateInventoryItem(
    id: ID, 
    data: Partial<Omit<IInventoryItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<IInventoryItem> {
    try {
      // Get the item to check existence and get the organizationId
      const item = await this.inventoryItemRepository.findByIdOrFail(id);
      
      // If SKU is being updated, check for uniqueness
      if (data.sku && data.sku !== item.sku) {
        const existingItem = await this.inventoryItemRepository.findBySku(
          data.sku, 
          item.organizationId
        );
        
        if (existingItem && existingItem.id.toString() !== id.toString()) {
          throw new ConflictError(`Inventory item with SKU ${data.sku} already exists`);
        }
      }
      
      // If default warehouse is being updated, check if it exists
      if (data.defaultWarehouseId && data.defaultWarehouseId.toString() !== item.defaultWarehouseId.toString()) {
        await this.warehouseRepository.findByIdOrFail(data.defaultWarehouseId);
      }
      
      // Update the item
      return this.inventoryItemRepository.update(id, data);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error updating inventory item:', error);
      throw new BadRequestError('Failed to update inventory item');
    }
  }

  /**
   * Deletes an inventory item
   * @param id - Inventory item ID
   * @returns Whether inventory item was deleted
   */
  public async deleteInventoryItem(id: ID): Promise<boolean> {
    try {
      // Check for inventory levels or transactions
      // In a real implementation, we'd check for dependencies
      
      return this.inventoryItemRepository.delete(id);
    } catch (error) {
      logger.error('Error deleting inventory item:', error);
      throw new BadRequestError('Failed to delete inventory item');
    }
  }

  /**
   * Gets inventory level by item and warehouse
   * @param itemId - Inventory item ID
   * @param warehouseId - Warehouse ID
   * @returns Inventory level or null
   */
  public async getInventoryLevelByItemAndWarehouse(
    itemId: ID,
    warehouseId: ID
  ): Promise<IInventoryLevel | null> {
    try {
      // Find the inventory level
      const level = await this.inventoryLevelRepository.findByItemAndWarehouse(
        itemId, 
        warehouseId
      );
      
      // If it doesn't exist, create it
      if (!level) {
        // Check if item and warehouse exist
        const item = await this.inventoryItemRepository.findByIdOrFail(itemId);
        const warehouse = await this.warehouseRepository.findByIdOrFail(warehouseId);
        
        // Create a new inventory level with zero quantities
        return this.inventoryLevelRepository.create({
          inventoryItemId: itemId,
          warehouseId: warehouseId,
          onHand: 0,
          available: 0,
          reserved: 0,
          incoming: 0,
          outgoing: 0,
          lastUpdatedAt: new Date()
        });
      }
      
      return level;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error getting inventory level:', error);
      throw new BadRequestError('Failed to get inventory level');
    }
  }

  /**
   * Updates an inventory level
   * @param id - Inventory level ID
   * @param data - Inventory level update data
   * @returns Updated inventory level
   */
  public async updateInventoryLevel(
    id: ID,
    data: Partial<Omit<IInventoryLevel, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<IInventoryLevel> {
    try {
      // Include last updated date
      data.lastUpdatedAt = new Date();
      
      // Update the level
      return this.inventoryLevelRepository.update(id, data);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error updating inventory level:', error);
      throw new BadRequestError('Failed to update inventory level');
    }
  }

  /**
   * Creates an inventory transaction
   * @param data - Inventory transaction data
   * @returns Created inventory transaction
   */
  public async createTransaction(
    data: Omit<IInventoryTransaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IInventoryTransaction> {
    try {
      // Check if item and warehouse exist
      await this.inventoryItemRepository.findByIdOrFail(data.inventoryItemId);
      await this.warehouseRepository.findByIdOrFail(data.warehouseId);
      
      // Create the transaction
      return this.inventoryTransactionRepository.create(data);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error creating inventory transaction:', error);
      throw new BadRequestError('Failed to create inventory transaction');
    }
  }

  /**
   * Gets transactions by item ID
   * @param itemId - Inventory item ID
   * @param options - Options
   * @returns Paginated transactions
   */
  public async getTransactionsByItemId(
    itemId: ID,
    options?: { limit?: number; page?: number }
  ): Promise<{
    items: IInventoryTransaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      return this.inventoryTransactionRepository.findByItem(itemId, options);
    } catch (error) {
      logger.error('Error getting inventory transactions:', error);
      throw new BadRequestError('Failed to get inventory transactions');
    }
  }

  /**
   * Adjusts stock
   * @param itemId - Inventory item ID
   * @param warehouseId - Warehouse ID
   * @param quantity - Quantity to adjust (can be negative)
   * @param reason - Reason for adjustment
   * @param userId - User ID
   * @param metadata - Optional metadata
   * @returns Created transaction
   */
  public async adjustStock(
    itemId: ID,
    warehouseId: ID,
    quantity: number,
    reason: string,
    userId: ID,
    metadata?: Record<string, unknown>
  ): Promise<IInventoryTransaction> {
    try {
      // Get the inventory level
      const level = await this.getInventoryLevelByItemAndWarehouse(itemId, warehouseId);
      if (!level) {
        throw new NotFoundError(`Inventory level not found for item: ${itemId} and warehouse: ${warehouseId}`);
      }
      
      // Calculate new quantity
      const previousQuantity = level.onHand;
      const newQuantity = previousQuantity + quantity;
      
      // Create transaction
      const transaction = await this.createTransaction({
        inventoryItemId: itemId,
        warehouseId,
        type: 'adjustment',
        quantity,
        previousQuantity,
        newQuantity,
        userId,
        notes: reason,
        metadata
      });
      
      // Update inventory level
      await this.updateInventoryLevel(level.id, {
        onHand: newQuantity,
        available: newQuantity - (level.reserved || 0)
      });
      
      // Update item status if needed
      await this.updateItemStatusBasedOnLevels(itemId);
      
      // Check for low stock
      await this.checkLowStock(itemId, warehouseId);
      
      return transaction;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error adjusting stock:', error);
      throw new BadRequestError('Failed to adjust stock');
    }
  }

  /**
   * Transfers stock between warehouses
   * @param itemId - Inventory item ID
   * @param fromWarehouseId - Source warehouse ID
   * @param toWarehouseId - Destination warehouse ID
   * @param quantity - Quantity to transfer
   * @param userId - User ID
   * @param reference - Optional reference
   * @param notes - Optional notes
   * @returns Created transactions
   */
  public async transferStock(
    itemId: ID,
    fromWarehouseId: ID,
    toWarehouseId: ID,
    quantity: number,
    userId: ID,
    reference?: { type: string; id: ID },
    notes?: string
  ): Promise<IInventoryTransaction[]> {
    try {
      if (quantity <= 0) {
        throw new BadRequestError('Quantity must be greater than zero');
      }
      
      if (fromWarehouseId.toString() === toWarehouseId.toString()) {
        throw new BadRequestError('Source and destination warehouses must be different');
      }
      
      // Get source inventory level
      const sourceLevel = await this.getInventoryLevelByItemAndWarehouse(itemId, fromWarehouseId);
      if (!sourceLevel) {
        throw new NotFoundError(`Inventory level not found for item: ${itemId} and warehouse: ${fromWarehouseId}`);
      }
      
      // Check if source has enough stock
      if (sourceLevel.available < quantity) {
        throw new BadRequestError(`Not enough available stock in source warehouse. Available: ${sourceLevel.available}, Requested: ${quantity}`);
      }
      
      // Get destination inventory level (creates it if it doesn't exist)
      const destLevel = await this.getInventoryLevelByItemAndWarehouse(itemId, toWarehouseId);
      if (!destLevel) {
        throw new NotFoundError(`Inventory level not found for item: ${itemId} and warehouse: ${toWarehouseId}`);
      }
      
      // Create transactions
      const transactions: IInventoryTransaction[] = [];
      
      // Source transaction (decrease)
      const sourceTransaction = await this.createTransaction({
        inventoryItemId: itemId,
        warehouseId: fromWarehouseId,
        type: 'transfer',
        quantity: -quantity,
        previousQuantity: sourceLevel.onHand,
        newQuantity: sourceLevel.onHand - quantity,
        reference,
        userId,
        notes: notes || 'Stock transfer to another warehouse'
      });
      
      transactions.push(sourceTransaction);
      
      // Destination transaction (increase)
      const destTransaction = await this.createTransaction({
        inventoryItemId: itemId,
        warehouseId: toWarehouseId,
        type: 'transfer',
        quantity: quantity,
        previousQuantity: destLevel.onHand,
        newQuantity: destLevel.onHand + quantity,
        reference,
        userId,
        notes: notes || 'Stock transfer from another warehouse'
      });
      
      transactions.push(destTransaction);
      
      // Update levels
      await this.updateInventoryLevel(sourceLevel.id, {
        onHand: sourceLevel.onHand - quantity,
        available: sourceLevel.available - quantity
      });
      
      await this.updateInventoryLevel(destLevel.id, {
        onHand: destLevel.onHand + quantity,
        available: destLevel.available + quantity
      });
      
      // Update item status if needed
      await this.updateItemStatusBasedOnLevels(itemId);
      
      // Check for low stock
      await this.checkLowStock(itemId, fromWarehouseId);
      
      return transactions;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      
      logger.error('Error transferring stock:', error);
      throw new BadRequestError('Failed to transfer stock');
    }
  }

  /**
   * Reserves stock
   * @param itemId - Inventory item ID
   * @param warehouseId - Warehouse ID
   * @param quantity - Quantity to reserve
   * @param orderId - Optional order ID
   * @param expiresAt - Optional expiration date
   * @param notes - Optional notes
   * @returns Created reservation
   */
  public async reserveStock(
    itemId: ID,
    warehouseId: ID,
    quantity: number,
    orderId?: ID,
    expiresAt?: Date,
    notes?: string
  ): Promise<IInventoryReservation> {
    try {
      if (quantity <= 0) {
        throw new BadRequestError('Quantity must be greater than zero');
      }
      
      // Get inventory level
      const level = await this.getInventoryLevelByItemAndWarehouse(itemId, warehouseId);
      if (!level) {
        throw new NotFoundError(`Inventory level not found for item: ${itemId} and warehouse: ${warehouseId}`);
      }
      
      // Check if there's enough available stock
      if (level.available < quantity) {
        throw new BadRequestError(`Not enough available stock. Available: ${level.available}, Requested: ${quantity}`);
      }
      
      // Create reservation
      // In a real implementation, we would have a proper reservation repository
      const reservation: IInventoryReservation = {
        id: 'res_' + Math.random().toString(36).substr(2, 9) as ID,
        inventoryItemId: itemId,
        warehouseId,
        quantity,
        status: 'active',
        orderId,
        expiresAt,
        notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Update level
      await this.updateInventoryLevel(level.id, {
        reserved: (level.reserved || 0) + quantity,
        available: level.available - quantity
      });
      
      return reservation;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      
      logger.error('Error reserving stock:', error);
      throw new BadRequestError('Failed to reserve stock');
    }
  }

  /**
   * Fulfills a reservation
   * @param reservationId - Reservation ID
   * @param quantity - Optional quantity to fulfill (defaults to entire reservation)
   * @returns Created transaction
   */
  public async fulfillReservation(
    reservationId: ID,
    quantity?: number
  ): Promise<IInventoryTransaction> {
    try {
      // In a real implementation, we would look up the reservation
      // For now, we'll simulate it
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error fulfilling reservation:', error);
      throw new BadRequestError('Failed to fulfill reservation');
    }
  }

  /**
   * Cancels a reservation
   * @param reservationId - Reservation ID
   * @returns Whether reservation was cancelled
   */
  public async cancelReservation(reservationId: ID): Promise<boolean> {
    try {
      // In a real implementation, we would look up the reservation
      // For now, we'll simulate it
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error cancelling reservation:', error);
      throw new BadRequestError('Failed to cancel reservation');
    }
  }

  /**
   * Creates a stock count
   * @param warehouseId - Warehouse ID
   * @param organizationId - Organization ID
   * @param name - Stock count name
   * @param userId - User ID
   * @param scheduledAt - Optional scheduled date
   * @returns Created stock count
   */
  public async createStockCount(
    warehouseId: ID,
    organizationId: ID,
    name: string,
    userId: ID,
    scheduledAt?: Date
  ): Promise<IStockCount> {
    try {
      // Check if warehouse exists
      await this.warehouseRepository.findByIdOrFail(warehouseId);
      
      // Create stock count
      // In a real implementation, we would have a proper stock count repository
      const stockCount: IStockCount = {
        id: 'sc_' + Math.random().toString(36).substr(2, 9) as ID,
        organizationId,
        warehouseId,
        name,
        status: 'draft',
        initiatedBy: userId,
        scheduledAt,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return stockCount;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error creating stock count:', error);
      throw new BadRequestError('Failed to create stock count');
    }
  }

  /**
   * Updates a stock count item
   * @param stockCountItemId - Stock count item ID
   * @param actualQuantity - Actual quantity
   * @param userId - User ID
   * @param notes - Optional notes
   * @returns Updated stock count item
   */
  public async updateStockCountItem(
    stockCountItemId: ID,
    actualQuantity: number,
    userId: ID,
    notes?: string
  ): Promise<IStockCountItem> {
    try {
      // In a real implementation, we would look up the stock count item
      // For now, we'll simulate it
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error updating stock count item:', error);
      throw new BadRequestError('Failed to update stock count item');
    }
  }

  /**
   * Completes a stock count
   * @param stockCountId - Stock count ID
   * @param userId - User ID
   * @returns Updated stock count
   */
  public async completeStockCount(stockCountId: ID, userId: ID): Promise<IStockCount> {
    try {
      // In a real implementation, we would look up the stock count
      // For now, we'll simulate it
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error completing stock count:', error);
      throw new BadRequestError('Failed to complete stock count');
    }
  }

  /**
   * Approves a stock count
   * @param stockCountId - Stock count ID
   * @param userId - User ID
   * @returns Updated stock count
   */
  public async approveStockCount(stockCountId: ID, userId: ID): Promise<IStockCount> {
    try {
      // In a real implementation, we would look up the stock count
      // For now, we'll simulate it
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error approving stock count:', error);
      throw new BadRequestError('Failed to approve stock count');
    }
  }

  /**
   * Creates a stock alert
   * @param itemId - Inventory item ID
   * @param warehouseId - Warehouse ID
   * @param type - Alert type
   * @param message - Alert message
   * @param priority - Alert priority
   * @param data - Optional data
   * @returns Created stock alert
   */
  public async createStockAlert(
    itemId: ID,
    warehouseId: ID,
    type: StockAlertType,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'critical',
    data?: Record<string, unknown>
  ): Promise<IStockAlert> {
    try {
      // Get inventory item to check existence and get organizationId
      const item = await this.inventoryItemRepository.findByIdOrFail(itemId);
      
      // Check if warehouse exists
      await this.warehouseRepository.findByIdOrFail(warehouseId);
      
      // Create alert
      return this.stockAlertRepository.create({
        organizationId: item.organizationId,
        inventoryItemId: itemId,
        warehouseId,
        type,
        status: 'active',
        priority,
        message,
        data
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error creating stock alert:', error);
      throw new BadRequestError('Failed to create stock alert');
    }
  }

  /**
   * Resolves a stock alert
   * @param alertId - Alert ID
   * @param userId - User ID
   * @param notes - Optional notes
   * @returns Updated stock alert
   */
  public async resolveStockAlert(alertId: ID, userId: ID, notes?: string): Promise<IStockAlert> {
    try {
      return this.stockAlertRepository.resolveAlert(alertId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error resolving stock alert:', error);
      throw new BadRequestError('Failed to resolve stock alert');
    }
  }

  /**
   * Ignores a stock alert
   * @param alertId - Alert ID
   * @param userId - User ID
   * @param notes - Optional notes
   * @returns Updated stock alert
   */
  public async ignoreStockAlert(alertId: ID, userId: ID, notes?: string): Promise<IStockAlert> {
    try {
      return this.stockAlertRepository.ignoreAlert(alertId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error ignoring stock alert:', error);
      throw new BadRequestError('Failed to ignore stock alert');
    }
  }

  /**
   * Gets inventory summary
   * @param organizationId - Organization ID
   * @param warehouseId - Optional warehouse ID
   * @returns Inventory summary
   */
  public async getInventorySummary(
    organizationId: ID,
    warehouseId?: ID
  ): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    byWarehouse?: Record<string, { items: number; value: number }>;
  }> {
    try {
      // Get inventory items
      const filter = warehouseId ? 
        { organizationId: organizationId.toString(), defaultWarehouseId: warehouseId.toString() } : 
        { organizationId: organizationId.toString() };
      
      const itemsResult = await this.inventoryItemRepository.find(filter, { limit: 1000 });
      const items = itemsResult.items;
      
      // Count low stock and out of stock items
      const lowStockItems = items.filter(item => item.status === 'low_stock').length;
      const outOfStockItems = items.filter(item => item.status === 'out_of_stock').length;
      
      // Calculate total value
      let totalValue = 0;
      for (const item of items) {
        if (item.cost) {
          // Get all inventory levels for this item
          const levels = await this.inventoryLevelRepository.findLevelsForItem(item.id);
          
          // Calculate total quantity
          const totalQuantity = levels.reduce(
            (sum, level) => sum + (level.onHand || 0),
            0
          );
          
          // Add to total value
          totalValue += item.cost * totalQuantity;
        }
      }
      
      // Get breakdown by warehouse if not filtering by warehouse
      let byWarehouse: Record<string, { items: number; value: number }> | undefined;
      
      if (!warehouseId) {
        byWarehouse = {};
        
        // Get all warehouses
        const warehousesResult = await this.warehouseRepository.findByOrganization(organizationId);
        
        for (const warehouse of warehousesResult) {
          byWarehouse[warehouse.id.toString()] = {
            items: 0,
            value: 0
          };
          
          // For each warehouse, get inventory levels
          for (const item of items) {
            const level = await this.inventoryLevelRepository.findByItemAndWarehouse(
              item.id,
              warehouse.id
            );
            
            if (level && level.onHand > 0) {
              byWarehouse[warehouse.id.toString()].items++;
              
              if (item.cost) {
                byWarehouse[warehouse.id.toString()].value += item.cost * level.onHand;
              }
            }
          }
        }
      }
      
      return {
        totalItems: items.length,
        totalValue,
        lowStockItems,
        outOfStockItems,
        byWarehouse
      };
    } catch (error) {
      logger.error('Error getting inventory summary:', error);
      throw new BadRequestError('Failed to get inventory summary');
    }
  }

  /**
   * Gets inventory valuation
   * @param organizationId - Organization ID
   * @param options - Options
   * @returns Inventory valuation
   */
  public async getInventoryValuation(
    organizationId: ID,
    options?: {
      warehouseId?: ID;
      asOfDate?: Date;
      groupBy?: 'warehouse' | 'product' | 'category';
    }
  ): Promise<{
    totalValue: number;
    valuationDate: Date;
    breakdown: Array<{ key: string; name: string; value: number; items: number }>;
  }> {
    try {
      // This would be a complex query in a real implementation
      // For now, we'll simulate the basics
      
      const valuationDate = options?.asOfDate || new Date();
      let totalValue = 0;
      const breakdown: Array<{ key: string; name: string; value: number; items: number }> = [];
      
      // Get inventory items
      const filter = options?.warehouseId ? 
        { organizationId: organizationId.toString(), defaultWarehouseId: options.warehouseId.toString() } : 
        { organizationId: organizationId.toString() };
      
      const itemsResult = await this.inventoryItemRepository.find(filter, { limit: 1000 });
      const items = itemsResult.items;
      
      if (options?.groupBy === 'warehouse') {
        // Group by warehouse
        const warehouses = await this.warehouseRepository.findByOrganization(organizationId);
        
        for (const warehouse of warehouses) {
          let warehouseValue = 0;
          let warehouseItems = 0;
          
          for (const item of items) {
            const level = await this.inventoryLevelRepository.findByItemAndWarehouse(
              item.id,
              warehouse.id
            );
            
            if (level && level.onHand > 0 && item.cost) {
              warehouseValue += item.cost * level.onHand;
              warehouseItems++;
            }
          }
          
          totalValue += warehouseValue;
          
          breakdown.push({
            key: warehouse.id.toString(),
            name: warehouse.name,
            value: warehouseValue,
            items: warehouseItems
          });
        }
      } else {
        // Default to product grouping
        for (const item of items) {
          let itemValue = 0;
          
          // Get all inventory levels for this item
          const levels = await this.inventoryLevelRepository.findLevelsForItem(item.id);
          
          // Calculate total quantity
          const totalQuantity = levels.reduce(
            (sum, level) => sum + (level.onHand || 0),
            0
          );
          
          if (item.cost) {
            itemValue = item.cost * totalQuantity;
            totalValue += itemValue;
          }
          
          if (totalQuantity > 0) {
            breakdown.push({
              key: item.id.toString(),
              name: item.name,
              value: itemValue,
              items: 1
            });
          }
        }
      }
      
      // Sort by value descending
      breakdown.sort((a, b) => b.value - a.value);
      
      return {
        totalValue,
        valuationDate,
        breakdown
      };
    } catch (error) {
      logger.error('Error getting inventory valuation:', error);
      throw new BadRequestError('Failed to get inventory valuation');
    }
  }

  /**
   * Updates an item's status based on inventory levels
   * @param itemId - Inventory item ID
   */
  private async updateItemStatusBasedOnLevels(itemId: ID): Promise<void> {
    try {
      // Get the item
      const item = await this.inventoryItemRepository.findByIdOrFail(itemId);
      
      // Get all inventory levels for this item
      const levels = await this.inventoryLevelRepository.findLevelsForItem(itemId);
      
      // Calculate total quantities
      const totalOnHand = levels.reduce((sum, level) => sum + (level.onHand || 0), 0);
      const totalAvailable = levels.reduce((sum, level) => sum + (level.available || 0), 0);
      
      // Determine new status
      let newStatus: InventoryStatus;
      
      if (totalOnHand <= 0) {
        newStatus = 'out_of_stock';
      } else if (totalAvailable <= (item.reorderPoint || 0)) {
        newStatus = 'low_stock';
      } else {
        newStatus = 'in_stock';
      }
      
      // Update if status has changed
      if (newStatus !== item.status) {
        await this.inventoryItemRepository.updateStatus(itemId, newStatus);
      }
    } catch (error) {
      logger.error('Error updating item status:', error);
      // Don't throw here, just log - this is an internal helper method
    }
  }

  /**
   * Checks for low stock and creates alerts if needed
   * @param itemId - Inventory item ID
   * @param warehouseId - Warehouse ID
   */
  private async checkLowStock(itemId: ID, warehouseId: ID): Promise<void> {
    try {
      // Get the item
      const item = await this.inventoryItemRepository.findByIdOrFail(itemId);
      
      // Get inventory level
      const level = await this.inventoryLevelRepository.findByItemAndWarehouse(
        itemId,
        warehouseId
      );
      
      if (!level) return;
      
      // Check if below reorder point
      const reorderPoint = level.reorderPoint || item.reorderPoint || 0;
      
      if (reorderPoint > 0 && level.available <= reorderPoint) {
        // Check if there's already an active alert for this item/warehouse
        const existingAlerts = await this.stockAlertRepository.findByItem(itemId, 'active');
        const hasReorderAlert = existingAlerts.some(alert => 
          alert.warehouseId.toString() === warehouseId.toString() && 
          alert.type === 'reorder_point'
        );
        
        if (!hasReorderAlert) {
          // Create a reorder point alert
          await this.createStockAlert(
            itemId,
            warehouseId,
            'reorder_point',
            `Stock level is below reorder point. Available: ${level.available}, Reorder Point: ${reorderPoint}`,
            'medium',
            {
              available: level.available,
              reorderPoint,
              reorderQuantity: level.reorderQuantity || item.reorderQuantity
            }
          );
        }
      }
      
      // Check if out of stock
      if (level.available <= 0) {
        // Check if there's already an active alert for this item/warehouse
        const existingAlerts = await this.stockAlertRepository.findByItem(itemId, 'active');
        const hasOutOfStockAlert = existingAlerts.some(alert => 
          alert.warehouseId.toString() === warehouseId.toString() && 
          alert.type === 'out_of_stock'
        );
        
        if (!hasOutOfStockAlert) {
          // Create an out of stock alert
          await this.createStockAlert(
            itemId,
            warehouseId,
            'out_of_stock',
            `Item is out of stock. Available: ${level.available}`,
            'high',
            {
              available: level.available,
              onHand: level.onHand,
              reserved: level.reserved
            }
          );
        }
      }
    } catch (error) {
      logger.error('Error checking for low stock:', error);
      // Don't throw here, just log - this is an internal helper method
    }
  }
}