/**
 * Inventory Repository Implementation
 * Provides type-safe database operations for Inventory entities
 */
import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { BaseRepository } from '@/repositories/base.repository';
import { ID, IPaginatedResult, IPaginationParams } from '@/types/base.types';
import { NotFoundError } from '@/types/error.types';
import { 
  IInventoryItem, 
  IInventoryLevel, 
  IInventoryTransaction,
  InventoryStatus,
  InventoryTransactionType,
  IStockAlert,
  StockAlertType
} from '../interfaces/inventory.interface';
import { 
  InventoryItemModel, 
  IInventoryItemDocument,
  InventoryLevelModel,
  IInventoryLevelDocument,
  InventoryTransactionModel,
  IInventoryTransactionDocument,
  StockAlertModel,
  InventoryReservationModel
} from '../models/inventory.model';

/**
 * Inventory item repository interface
 */
export interface IInventoryItemRepository {
  // Base repository methods
  create(data: Partial<IInventoryItem>): Promise<IInventoryItem>;
  findById(id: ID): Promise<IInventoryItem | null>;
  update(id: ID, data: Partial<IInventoryItem>): Promise<IInventoryItem>;
  delete(id: ID): Promise<boolean>;
  
  // Inventory specific methods
  findByIdOrFail(id: ID): Promise<IInventoryItem>;
  findBySku(sku: string, organizationId: ID): Promise<IInventoryItem | null>;
  findBySkuOrFail(sku: string, organizationId: ID): Promise<IInventoryItem>;
  findByProduct(productId: ID, organizationId: ID): Promise<IInventoryItem | null>;
  findByProductVariant(productId: ID, variantId: ID, organizationId: ID): Promise<IInventoryItem | null>;
  findLowStock(organizationId: ID): Promise<IInventoryItem[]>;
  findOutOfStock(organizationId: ID): Promise<IInventoryItem[]>;
  updateStatus(id: ID, status: InventoryStatus): Promise<IInventoryItem>;
  searchInventory(query: string, organizationId: ID, options?: IPaginationParams & {
    status?: InventoryStatus[];
    warehouseId?: ID;
  }): Promise<IPaginatedResult<IInventoryItem>>;
}

/**
 * Inventory level repository interface
 */
export interface IInventoryLevelRepository {
  // Base repository methods
  create(data: Partial<IInventoryLevel>): Promise<IInventoryLevel>;
  findById(id: ID): Promise<IInventoryLevel | null>;
  update(id: ID, data: Partial<IInventoryLevel>): Promise<IInventoryLevel>;
  delete(id: ID): Promise<boolean>;
  
  // Inventory level specific methods
  findByIdOrFail(id: ID): Promise<IInventoryLevel>;
  findByItemAndWarehouse(itemId: ID, warehouseId: ID): Promise<IInventoryLevel | null>;
  findByItemAndWarehouseOrFail(itemId: ID, warehouseId: ID): Promise<IInventoryLevel>;
  updateOnHandQuantity(id: ID, quantity: number): Promise<IInventoryLevel>;
  updateAvailableQuantity(id: ID, quantity: number): Promise<IInventoryLevel>;
  updateReservedQuantity(id: ID, quantity: number): Promise<IInventoryLevel>;
  updateIncomingQuantity(id: ID, quantity: number): Promise<IInventoryLevel>;
  updateOutgoingQuantity(id: ID, quantity: number): Promise<IInventoryLevel>;
  findLevelsForItem(itemId: ID): Promise<IInventoryLevel[]>;
  findLowStockLevels(organizationId: ID): Promise<IInventoryLevel[]>;
}

/**
 * Inventory transaction repository interface
 */
export interface IInventoryTransactionRepository {
  // Base repository methods
  create(data: Partial<IInventoryTransaction>): Promise<IInventoryTransaction>;
  findById(id: ID): Promise<IInventoryTransaction | null>;
  
  // Transaction specific methods
  findByIdOrFail(id: ID): Promise<IInventoryTransaction>;
  findByItem(itemId: ID, options?: IPaginationParams): Promise<IPaginatedResult<IInventoryTransaction>>;
  findByWarehouse(warehouseId: ID, options?: IPaginationParams): Promise<IPaginatedResult<IInventoryTransaction>>;
  findByType(type: InventoryTransactionType, options?: IPaginationParams): Promise<IPaginatedResult<IInventoryTransaction>>;
  findByReference(referenceType: string, referenceId: ID): Promise<IInventoryTransaction[]>;
  findByDateRange(startDate: Date, endDate: Date, organizationId?: ID): Promise<IInventoryTransaction[]>;
}

/**
 * Stock alert repository interface
 */
export interface IStockAlertRepository {
  // Base repository methods
  create(data: Partial<IStockAlert>): Promise<IStockAlert>;
  findById(id: ID): Promise<IStockAlert | null>;
  update(id: ID, data: Partial<IStockAlert>): Promise<IStockAlert>;
  delete(id: ID): Promise<boolean>;
  
  // Alert specific methods
  findByIdOrFail(id: ID): Promise<IStockAlert>;
  findActiveAlerts(organizationId: ID, options?: IPaginationParams): Promise<IPaginatedResult<IStockAlert>>;
  findByItem(itemId: ID, status?: 'active' | 'resolved' | 'ignored'): Promise<IStockAlert[]>;
  findByType(type: StockAlertType, organizationId: ID): Promise<IStockAlert[]>;
  findByWarehouse(warehouseId: ID, status?: 'active' | 'resolved' | 'ignored'): Promise<IStockAlert[]>;
  resolveAlert(id: ID, userId: ID): Promise<IStockAlert>;
  ignoreAlert(id: ID, userId: ID): Promise<IStockAlert>;
}

/**
 * Inventory item repository implementation
 */
@injectable()
export class InventoryItemRepository extends BaseRepository<IInventoryItem, IInventoryItemDocument> implements IInventoryItemRepository {
  constructor() {
    super(InventoryItemModel);
  }

  /**
   * Finds an inventory item by ID or throws NotFoundError
   * @param id - Inventory item ID
   * @returns Inventory item
   * @throws NotFoundError
   */
  public async findByIdOrFail(id: ID): Promise<IInventoryItem> {
    const item = await this.findById(id);
    if (!item) {
      throw new NotFoundError(`Inventory item not found with id: ${id}`);
    }
    return item;
  }

  /**
   * Finds an inventory item by SKU within an organization
   * @param sku - Item SKU
   * @param organizationId - Organization ID
   * @returns Inventory item or null
   */
  public async findBySku(sku: string, organizationId: ID): Promise<IInventoryItem | null> {
    return this.findOne({ 
      sku, 
      organizationId: organizationId.toString() 
    });
  }

  /**
   * Finds an inventory item by SKU within an organization or throws NotFoundError
   * @param sku - Item SKU
   * @param organizationId - Organization ID
   * @returns Inventory item
   * @throws NotFoundError
   */
  public async findBySkuOrFail(sku: string, organizationId: ID): Promise<IInventoryItem> {
    const item = await this.findBySku(sku, organizationId);
    if (!item) {
      throw new NotFoundError(`Inventory item not found with sku: ${sku}`);
    }
    return item;
  }

  /**
   * Finds an inventory item by product ID within an organization
   * @param productId - Product ID
   * @param organizationId - Organization ID
   * @returns Inventory item or null
   */
  public async findByProduct(productId: ID, organizationId: ID): Promise<IInventoryItem | null> {
    return this.findOne({ 
      productId: productId.toString(), 
      organizationId: organizationId.toString() 
    });
  }

  /**
   * Finds an inventory item by product variant ID within an organization
   * @param productId - Product ID
   * @param variantId - Variant ID
   * @param organizationId - Organization ID
   * @returns Inventory item or null
   */
  public async findByProductVariant(
    productId: ID, 
    variantId: ID, 
    organizationId: ID
  ): Promise<IInventoryItem | null> {
    return this.findOne({ 
      productId: productId.toString(),
      productVariantId: variantId.toString(),
      organizationId: organizationId.toString() 
    });
  }

  /**
   * Finds low stock inventory items within an organization
   * @param organizationId - Organization ID
   * @returns Array of inventory items
   */
  public async findLowStock(organizationId: ID): Promise<IInventoryItem[]> {
    const filter: FilterQuery<IInventoryItemDocument> = { 
      organizationId: organizationId.toString(),
      status: 'low_stock'
    };
    
    const result = await this.find(filter);
    return result.items;
  }

  /**
   * Finds out of stock inventory items within an organization
   * @param organizationId - Organization ID
   * @returns Array of inventory items
   */
  public async findOutOfStock(organizationId: ID): Promise<IInventoryItem[]> {
    const filter: FilterQuery<IInventoryItemDocument> = { 
      organizationId: organizationId.toString(),
      status: 'out_of_stock'
    };
    
    const result = await this.find(filter);
    return result.items;
  }

  /**
   * Updates an inventory item's status
   * @param id - Inventory item ID
   * @param status - New status
   * @returns Updated inventory item
   */
  public async updateStatus(id: ID, status: InventoryStatus): Promise<IInventoryItem> {
    return this.update(id, { status });
  }

  /**
   * Searches inventory items by name or SKU within an organization
   * @param query - Search query
   * @param organizationId - Organization ID
   * @param options - Search options
   * @returns Paginated result
   */
  public async searchInventory(
    query: string,
    organizationId: ID,
    options: IPaginationParams & {
      status?: InventoryStatus[];
      warehouseId?: ID;
    } = {}
  ): Promise<IPaginatedResult<IInventoryItem>> {
    const { status, warehouseId, ...paginationOptions } = options;
    
    // Build filter
    const filter: FilterQuery<IInventoryItemDocument> = {
      organizationId: organizationId.toString(),
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } }
      ]
    };
    
    // Add status filter if provided
    if (status && status.length > 0) {
      filter.status = { $in: status };
    }
    
    // Add warehouse filter if provided
    if (warehouseId) {
      filter.defaultWarehouseId = warehouseId.toString();
    }
    
    return this.find(filter, paginationOptions);
  }
}

/**
 * Inventory level repository implementation
 */
@injectable()
export class InventoryLevelRepository extends BaseRepository<IInventoryLevel, IInventoryLevelDocument> implements IInventoryLevelRepository {
  constructor() {
    super(InventoryLevelModel);
  }

  /**
   * Finds an inventory level by ID or throws NotFoundError
   * @param id - Inventory level ID
   * @returns Inventory level
   * @throws NotFoundError
   */
  public async findByIdOrFail(id: ID): Promise<IInventoryLevel> {
    const level = await this.findById(id);
    if (!level) {
      throw new NotFoundError(`Inventory level not found with id: ${id}`);
    }
    return level;
  }

  /**
   * Finds an inventory level by item ID and warehouse ID
   * @param itemId - Inventory item ID
   * @param warehouseId - Warehouse ID
   * @returns Inventory level or null
   */
  public async findByItemAndWarehouse(
    itemId: ID, 
    warehouseId: ID
  ): Promise<IInventoryLevel | null> {
    return this.findOne({ 
      inventoryItemId: itemId.toString(), 
      warehouseId: warehouseId.toString() 
    });
  }

  /**
   * Finds an inventory level by item ID and warehouse ID or throws NotFoundError
   * @param itemId - Inventory item ID
   * @param warehouseId - Warehouse ID
   * @returns Inventory level
   * @throws NotFoundError
   */
  public async findByItemAndWarehouseOrFail(
    itemId: ID, 
    warehouseId: ID
  ): Promise<IInventoryLevel> {
    const level = await this.findByItemAndWarehouse(itemId, warehouseId);
    if (!level) {
      throw new NotFoundError(`Inventory level not found for item: ${itemId} and warehouse: ${warehouseId}`);
    }
    return level;
  }

  /**
   * Updates the on-hand quantity for an inventory level
   * @param id - Inventory level ID
   * @param quantity - New quantity
   * @returns Updated inventory level
   */
  public async updateOnHandQuantity(id: ID, quantity: number): Promise<IInventoryLevel> {
    return this.update(id, { 
      onHand: quantity,
      lastUpdatedAt: new Date()
    });
  }

  /**
   * Updates the available quantity for an inventory level
   * @param id - Inventory level ID
   * @param quantity - New quantity
   * @returns Updated inventory level
   */
  public async updateAvailableQuantity(id: ID, quantity: number): Promise<IInventoryLevel> {
    return this.update(id, { 
      available: quantity,
      lastUpdatedAt: new Date()
    });
  }

  /**
   * Updates the reserved quantity for an inventory level
   * @param id - Inventory level ID
   * @param quantity - New quantity
   * @returns Updated inventory level
   */
  public async updateReservedQuantity(id: ID, quantity: number): Promise<IInventoryLevel> {
    return this.update(id, { 
      reserved: quantity,
      lastUpdatedAt: new Date()
    });
  }

  /**
   * Updates the incoming quantity for an inventory level
   * @param id - Inventory level ID
   * @param quantity - New quantity
   * @returns Updated inventory level
   */
  public async updateIncomingQuantity(id: ID, quantity: number): Promise<IInventoryLevel> {
    return this.update(id, { 
      incoming: quantity,
      lastUpdatedAt: new Date()
    });
  }

  /**
   * Updates the outgoing quantity for an inventory level
   * @param id - Inventory level ID
   * @param quantity - New quantity
   * @returns Updated inventory level
   */
  public async updateOutgoingQuantity(id: ID, quantity: number): Promise<IInventoryLevel> {
    return this.update(id, { 
      outgoing: quantity,
      lastUpdatedAt: new Date()
    });
  }

  /**
   * Finds all inventory levels for an item
   * @param itemId - Inventory item ID
   * @returns Array of inventory levels
   */
  public async findLevelsForItem(itemId: ID): Promise<IInventoryLevel[]> {
    const filter: FilterQuery<IInventoryLevelDocument> = { 
      inventoryItemId: itemId.toString() 
    };
    
    const result = await this.find(filter);
    return result.items;
  }

  /**
   * Finds low stock levels across all warehouses
   * @param organizationId - Organization ID
   * @returns Array of inventory levels
   */
  public async findLowStockLevels(organizationId: ID): Promise<IInventoryLevel[]> {
    // This is a more complex query that would need to be implemented
    // with a custom MongoDB aggregation to join with inventory items
    // For now, we'll just implement it in the service layer
    
    const levels = await this.find({}, { limit: 1000 });
    
    return levels.items.filter(level => 
      level.available <= (level.reorderPoint || 0)
    );
  }
}

/**
 * Inventory transaction repository implementation
 */
@injectable()
export class InventoryTransactionRepository extends BaseRepository<IInventoryTransaction, IInventoryTransactionDocument> implements IInventoryTransactionRepository {
  constructor() {
    super(InventoryTransactionModel);
  }

  /**
   * Finds a transaction by ID or throws NotFoundError
   * @param id - Transaction ID
   * @returns Transaction
   * @throws NotFoundError
   */
  public async findByIdOrFail(id: ID): Promise<IInventoryTransaction> {
    const transaction = await this.findById(id);
    if (!transaction) {
      throw new NotFoundError(`Inventory transaction not found with id: ${id}`);
    }
    return transaction;
  }

  /**
   * Finds transactions by item ID
   * @param itemId - Inventory item ID
   * @param options - Pagination options
   * @returns Paginated result
   */
  public async findByItem(
    itemId: ID, 
    options: IPaginationParams = {}
  ): Promise<IPaginatedResult<IInventoryTransaction>> {
    const filter: FilterQuery<IInventoryTransactionDocument> = { 
      inventoryItemId: itemId.toString() 
    };
    
    return this.find(filter, {
      ...options,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  /**
   * Finds transactions by warehouse ID
   * @param warehouseId - Warehouse ID
   * @param options - Pagination options
   * @returns Paginated result
   */
  public async findByWarehouse(
    warehouseId: ID, 
    options: IPaginationParams = {}
  ): Promise<IPaginatedResult<IInventoryTransaction>> {
    const filter: FilterQuery<IInventoryTransactionDocument> = { 
      warehouseId: warehouseId.toString() 
    };
    
    return this.find(filter, {
      ...options,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  /**
   * Finds transactions by type
   * @param type - Transaction type
   * @param options - Pagination options
   * @returns Paginated result
   */
  public async findByType(
    type: InventoryTransactionType, 
    options: IPaginationParams = {}
  ): Promise<IPaginatedResult<IInventoryTransaction>> {
    const filter: FilterQuery<IInventoryTransactionDocument> = { type };
    
    return this.find(filter, {
      ...options,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  /**
   * Finds transactions by reference
   * @param referenceType - Reference type
   * @param referenceId - Reference ID
   * @returns Array of transactions
   */
  public async findByReference(
    referenceType: string, 
    referenceId: ID
  ): Promise<IInventoryTransaction[]> {
    const filter: FilterQuery<IInventoryTransactionDocument> = { 
      'reference.type': referenceType,
      'reference.id': referenceId.toString()
    };
    
    const result = await this.find(filter, {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return result.items;
  }

  /**
   * Finds transactions by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param organizationId - Optional organization ID
   * @returns Array of transactions
   */
  public async findByDateRange(
    startDate: Date, 
    endDate: Date,
    organizationId?: ID
  ): Promise<IInventoryTransaction[]> {
    const filter: FilterQuery<IInventoryTransactionDocument> = { 
      createdAt: { 
        $gte: startDate, 
        $lte: endDate 
      }
    };
    
    // If organization ID is provided, need to join with inventory items
    // This would be a more complex query in a real implementation
    
    const result = await this.find(filter, {
      limit: 1000,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return result.items;
  }
}

/**
 * Stock alert repository implementation
 */
@injectable()
export class StockAlertRepository extends BaseRepository<IStockAlert, Document> implements IStockAlertRepository {
  constructor() {
    super(StockAlertModel);
  }

  /**
   * Finds a stock alert by ID or throws NotFoundError
   * @param id - Alert ID
   * @returns Stock alert
   * @throws NotFoundError
   */
  public async findByIdOrFail(id: ID): Promise<IStockAlert> {
    const alert = await this.findById(id);
    if (!alert) {
      throw new NotFoundError(`Stock alert not found with id: ${id}`);
    }
    return alert;
  }

  /**
   * Finds active alerts for an organization
   * @param organizationId - Organization ID
   * @param options - Pagination options
   * @returns Paginated result
   */
  public async findActiveAlerts(
    organizationId: ID, 
    options: IPaginationParams = {}
  ): Promise<IPaginatedResult<IStockAlert>> {
    const filter: FilterQuery<Document> = { 
      organizationId: organizationId.toString(),
      status: 'active'
    };
    
    return this.find(filter, {
      ...options,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  /**
   * Finds alerts by item ID
   * @param itemId - Inventory item ID
   * @param status - Optional status filter
   * @returns Array of alerts
   */
  public async findByItem(
    itemId: ID, 
    status?: 'active' | 'resolved' | 'ignored'
  ): Promise<IStockAlert[]> {
    const filter: FilterQuery<Document> = { 
      inventoryItemId: itemId.toString() 
    };
    
    if (status) {
      filter.status = status;
    }
    
    const result = await this.find(filter, {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return result.items;
  }

  /**
   * Finds alerts by type
   * @param type - Alert type
   * @param organizationId - Organization ID
   * @returns Array of alerts
   */
  public async findByType(
    type: StockAlertType, 
    organizationId: ID
  ): Promise<IStockAlert[]> {
    const filter: FilterQuery<Document> = { 
      type,
      organizationId: organizationId.toString(),
      status: 'active'
    };
    
    const result = await this.find(filter, {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return result.items;
  }

  /**
   * Finds alerts by warehouse ID
   * @param warehouseId - Warehouse ID
   * @param status - Optional status filter
   * @returns Array of alerts
   */
  public async findByWarehouse(
    warehouseId: ID, 
    status?: 'active' | 'resolved' | 'ignored'
  ): Promise<IStockAlert[]> {
    const filter: FilterQuery<Document> = { 
      warehouseId: warehouseId.toString() 
    };
    
    if (status) {
      filter.status = status;
    }
    
    const result = await this.find(filter, {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return result.items;
  }

  /**
   * Resolves an alert
   * @param id - Alert ID
   * @param userId - User ID
   * @returns Updated alert
   */
  public async resolveAlert(id: ID, userId: ID): Promise<IStockAlert> {
    return this.update(id, { 
      status: 'resolved',
      resolvedBy: userId,
      resolvedAt: new Date()
    });
  }

  /**
   * Ignores an alert
   * @param id - Alert ID
   * @param userId - User ID
   * @returns Updated alert
   */
  public async ignoreAlert(id: ID, userId: ID): Promise<IStockAlert> {
    return this.update(id, { 
      status: 'ignored',
      resolvedBy: userId,
      resolvedAt: new Date()
    });
  }
}