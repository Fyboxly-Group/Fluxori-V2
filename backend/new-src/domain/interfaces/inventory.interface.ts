/**
 * Inventory domain interfaces
 * Defines the core Inventory entity and related types
 */
import { IBaseEntity, ID, IOrganizationEntity } from '@/types/base.types';

/**
 * Inventory item status type
 */
export type InventoryStatus = 'in_stock' | 'out_of_stock' | 'low_stock' | 'discontinued' | 'backordered';

/**
 * Inventory location type
 */
export type LocationType = 'warehouse' | 'store' | 'supplier' | 'customer' | 'transit';

/**
 * Inventory transaction type
 */
export type InventoryTransactionType = 
  | 'purchase' 
  | 'sale' 
  | 'return' 
  | 'adjustment' 
  | 'transfer' 
  | 'count'
  | 'reserve'
  | 'unreserve';

/**
 * Warehouse entity interface
 */
export interface IWarehouse extends IOrganizationEntity {
  name: string;
  code: string;
  description?: string;
  isDefault: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  settings?: {
    allowNegativeInventory?: boolean;
    autoReceivePurchaseOrders?: boolean;
    requireStockCountApproval?: boolean;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Inventory location entity interface
 */
export interface IInventoryLocation extends IBaseEntity {
  warehouseId: ID;
  name: string;
  code: string;
  type: LocationType;
  description?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Inventory item interface
 */
export interface IInventoryItem extends IOrganizationEntity {
  productId: ID;
  productVariantId?: ID;
  sku: string;
  name: string;
  barcode?: string;
  status: InventoryStatus;
  defaultWarehouseId: ID;
  reorderPoint?: number;
  reorderQuantity?: number;
  leadTime?: number;
  cost?: number;
  costCurrency?: string;
  trackingMethod: 'fifo' | 'lifo' | 'fefo' | 'standard';
  stockCountFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  lastStockCountDate?: Date;
  nextStockCountDate?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Inventory level interface
 */
export interface IInventoryLevel extends IBaseEntity {
  inventoryItemId: ID;
  warehouseId: ID;
  locationId?: ID;
  onHand: number;
  available: number;
  reserved: number;
  incoming: number;
  outgoing: number;
  minimumLevel?: number;
  maximumLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  lastUpdatedAt: Date;
  lastCountedAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Inventory reservation interface
 */
export interface IInventoryReservation extends IBaseEntity {
  inventoryItemId: ID;
  warehouseId: ID;
  locationId?: ID;
  orderId?: ID;
  quantity: number;
  status: 'active' | 'fulfilled' | 'cancelled' | 'expired';
  expiresAt?: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Inventory transaction interface
 */
export interface IInventoryTransaction extends IBaseEntity {
  inventoryItemId: ID;
  warehouseId: ID;
  locationId?: ID;
  type: InventoryTransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reference?: {
    type: 'purchase_order' | 'sales_order' | 'transfer' | 'adjustment' | 'stock_count';
    id: ID;
  };
  cost?: number;
  costCurrency?: string;
  userId: ID;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Stock count interface
 */
export interface IStockCount extends IOrganizationEntity {
  warehouseId: ID;
  name: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  initiatedBy: ID;
  completedBy?: ID;
  approvedBy?: ID;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Stock count item interface
 */
export interface IStockCountItem extends IBaseEntity {
  stockCountId: ID;
  inventoryItemId: ID;
  locationId?: ID;
  expectedQuantity: number;
  actualQuantity: number;
  discrepancy: number;
  status: 'pending' | 'counted' | 'approved' | 'adjusted';
  notes?: string;
  countedBy?: ID;
  countedAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Stock alert type
 */
export type StockAlertType = 'low_stock' | 'out_of_stock' | 'reorder_point' | 'expiry' | 'discrepancy';

/**
 * Stock alert interface
 */
export interface IStockAlert extends IOrganizationEntity {
  inventoryItemId: ID;
  warehouseId: ID;
  type: StockAlertType;
  status: 'active' | 'resolved' | 'ignored';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data?: Record<string, unknown>;
  resolvedBy?: ID;
  resolvedAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Inventory service interface
 */
export interface IInventoryService {
  // Warehouse operations
  createWarehouse(data: Omit<IWarehouse, 'id' | 'createdAt' | 'updatedAt'>): Promise<IWarehouse>;
  getWarehouseById(id: ID): Promise<IWarehouse | null>;
  updateWarehouse(id: ID, data: Partial<Omit<IWarehouse, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IWarehouse>;
  deleteWarehouse(id: ID): Promise<boolean>;
  
  // Inventory item operations
  createInventoryItem(data: Omit<IInventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<IInventoryItem>;
  getInventoryItemById(id: ID): Promise<IInventoryItem | null>;
  getInventoryItemBySku(sku: string, organizationId: ID): Promise<IInventoryItem | null>;
  updateInventoryItem(id: ID, data: Partial<Omit<IInventoryItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IInventoryItem>;
  deleteInventoryItem(id: ID): Promise<boolean>;
  
  // Inventory level operations
  getInventoryLevelByItemAndWarehouse(itemId: ID, warehouseId: ID): Promise<IInventoryLevel | null>;
  updateInventoryLevel(id: ID, data: Partial<Omit<IInventoryLevel, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IInventoryLevel>;
  
  // Inventory transactions
  createTransaction(data: Omit<IInventoryTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<IInventoryTransaction>;
  getTransactionsByItemId(itemId: ID, options?: { limit?: number; page?: number; }): Promise<{
    items: IInventoryTransaction[];
    total: number;
    page: number;
    limit: number;
  }>;
  
  // Inventory movement
  adjustStock(
    itemId: ID, 
    warehouseId: ID, 
    quantity: number, 
    reason: string, 
    userId: ID, 
    metadata?: Record<string, unknown>
  ): Promise<IInventoryTransaction>;
  
  transferStock(
    itemId: ID, 
    fromWarehouseId: ID, 
    toWarehouseId: ID, 
    quantity: number, 
    userId: ID, 
    reference?: { type: string; id: ID; }, 
    notes?: string
  ): Promise<IInventoryTransaction[]>;
  
  // Reservations
  reserveStock(
    itemId: ID, 
    warehouseId: ID, 
    quantity: number, 
    orderId?: ID, 
    expiresAt?: Date, 
    notes?: string
  ): Promise<IInventoryReservation>;
  
  fulfillReservation(reservationId: ID, quantity?: number): Promise<IInventoryTransaction>;
  cancelReservation(reservationId: ID): Promise<boolean>;
  
  // Stock counts
  createStockCount(
    warehouseId: ID, 
    organizationId: ID, 
    name: string, 
    userId: ID, 
    scheduledAt?: Date
  ): Promise<IStockCount>;
  
  updateStockCountItem(
    stockCountItemId: ID, 
    actualQuantity: number, 
    userId: ID, 
    notes?: string
  ): Promise<IStockCountItem>;
  
  completeStockCount(stockCountId: ID, userId: ID): Promise<IStockCount>;
  approveStockCount(stockCountId: ID, userId: ID): Promise<IStockCount>;
  
  // Alerts
  createStockAlert(
    itemId: ID, 
    warehouseId: ID, 
    type: StockAlertType, 
    message: string, 
    priority: 'low' | 'medium' | 'high' | 'critical', 
    data?: Record<string, unknown>
  ): Promise<IStockAlert>;
  
  resolveStockAlert(alertId: ID, userId: ID, notes?: string): Promise<IStockAlert>;
  ignoreStockAlert(alertId: ID, userId: ID, notes?: string): Promise<IStockAlert>;
  
  // Reporting
  getInventorySummary(organizationId: ID, warehouseId?: ID): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    byWarehouse?: Record<string, { items: number; value: number; }>;
  }>;
  
  getInventoryValuation(organizationId: ID, options?: { 
    warehouseId?: ID; 
    asOfDate?: Date; 
    groupBy?: 'warehouse' | 'product' | 'category'; 
  }): Promise<{
    totalValue: number;
    valuationDate: Date;
    breakdown: Array<{ key: string; name: string; value: number; items: number; }>;
  }>;
}