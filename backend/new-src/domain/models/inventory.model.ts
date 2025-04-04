/**
 * Inventory models schema definition
 * Implements the inventory domain interfaces with MongoDB schemas
 */
import { Schema, model, Document, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { 
  IWarehouse,
  IInventoryItem,
  IInventoryLevel,
  IInventoryTransaction,
  IStockAlert,
  StockAlertType,
  InventoryTransactionType,
  IInventoryLocation,
  IInventoryReservation,
  IStockCount,
  IStockCountItem
} from '../interfaces/inventory.interface';
import { ID, createID } from '@/types/base.types';

// Document interfaces for methods

export interface IWarehouseDocument extends IWarehouse, Document {
  // Document methods
  isDefault(): boolean;
}

export interface IInventoryItemDocument extends IInventoryItem, Document {
  // Document methods
  calculateTotalStock(): Promise<number>;
}

export interface IInventoryLevelDocument extends IInventoryLevel, Document {
  // Document methods
  isLowStock(threshold?: number): boolean;
}

export interface IInventoryTransactionDocument extends IInventoryTransaction, Document {
  // Document methods
  getFormattedReference(): string;
}

// Static model methods

export interface IWarehouseModel extends Model<IWarehouseDocument> {
  // Static methods
  findByCode(code: string, organizationId: string): Promise<IWarehouseDocument | null>;
  findDefaultWarehouse(organizationId: string): Promise<IWarehouseDocument | null>;
}

export interface IInventoryItemModel extends Model<IInventoryItemDocument> {
  // Static methods
  findBySku(sku: string, organizationId: string): Promise<IInventoryItemDocument | null>;
  findLowStock(organizationId: string): Promise<IInventoryItemDocument[]>;
}

export interface IInventoryLevelModel extends Model<IInventoryLevelDocument> {
  // Static methods
  findByItemAndWarehouse(itemId: string, warehouseId: string): Promise<IInventoryLevelDocument | null>;
}

// Warehouse Schema
const WarehouseSchema = new Schema<IWarehouseDocument>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'archived', 'deleted'],
      default: 'active',
    },
    address: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      postalCode: {
        type: String,
      },
      country: {
        type: String,
      },
    },
    contact: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    settings: {
      allowNegativeInventory: {
        type: Boolean,
        default: false,
      },
      autoReceivePurchaseOrders: {
        type: Boolean,
        default: false,
      },
      requireStockCountApproval: {
        type: Boolean,
        default: true,
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Inventory Location Schema
const InventoryLocationSchema = new Schema<IInventoryLocation>(
  {
    warehouseId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['warehouse', 'store', 'supplier', 'customer', 'transit'],
      default: 'warehouse',
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Inventory Item Schema
const InventoryItemSchema = new Schema<IInventoryItemDocument>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    productVariantId: {
      type: String,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    barcode: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['in_stock', 'out_of_stock', 'low_stock', 'discontinued', 'backordered'],
      default: 'in_stock',
    },
    defaultWarehouseId: {
      type: String,
      required: true,
    },
    reorderPoint: {
      type: Number,
    },
    reorderQuantity: {
      type: Number,
    },
    leadTime: {
      type: Number,
    },
    cost: {
      type: Number,
    },
    costCurrency: {
      type: String,
    },
    trackingMethod: {
      type: String,
      required: true,
      enum: ['fifo', 'lifo', 'fefo', 'standard'],
      default: 'fifo',
    },
    stockCountFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annual'],
    },
    lastStockCountDate: {
      type: Date,
    },
    nextStockCountDate: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Inventory Level Schema
const InventoryLevelSchema = new Schema<IInventoryLevelDocument>(
  {
    inventoryItemId: {
      type: String,
      required: true,
      index: true,
    },
    warehouseId: {
      type: String,
      required: true,
      index: true,
    },
    locationId: {
      type: String,
    },
    onHand: {
      type: Number,
      required: true,
      default: 0,
    },
    available: {
      type: Number,
      required: true,
      default: 0,
    },
    reserved: {
      type: Number,
      required: true,
      default: 0,
    },
    incoming: {
      type: Number,
      required: true,
      default: 0,
    },
    outgoing: {
      type: Number,
      required: true,
      default: 0,
    },
    minimumLevel: {
      type: Number,
    },
    maximumLevel: {
      type: Number,
    },
    reorderPoint: {
      type: Number,
    },
    reorderQuantity: {
      type: Number,
    },
    lastUpdatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastCountedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Inventory Reservation Schema
const InventoryReservationSchema = new Schema<IInventoryReservation>(
  {
    inventoryItemId: {
      type: String,
      required: true,
      index: true,
    },
    warehouseId: {
      type: String,
      required: true,
      index: true,
    },
    locationId: {
      type: String,
    },
    orderId: {
      type: String,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'fulfilled', 'cancelled', 'expired'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Inventory Transaction Schema
const InventoryTransactionSchema = new Schema<IInventoryTransactionDocument>(
  {
    inventoryItemId: {
      type: String,
      required: true,
      index: true,
    },
    warehouseId: {
      type: String,
      required: true,
      index: true,
    },
    locationId: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ['purchase', 'sale', 'return', 'adjustment', 'transfer', 'count', 'reserve', 'unreserve'],
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reference: {
      type: {
        type: String,
        enum: ['purchase_order', 'sales_order', 'transfer', 'adjustment', 'stock_count'],
      },
      id: {
        type: String,
      },
    },
    cost: {
      type: Number,
    },
    costCurrency: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Stock Count Schema
const StockCountSchema = new Schema<IStockCount>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    warehouseId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    initiatedBy: {
      type: String,
      required: true,
    },
    completedBy: {
      type: String,
    },
    approvedBy: {
      type: String,
    },
    scheduledAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Stock Count Item Schema
const StockCountItemSchema = new Schema<IStockCountItem>(
  {
    stockCountId: {
      type: String,
      required: true,
      index: true,
    },
    inventoryItemId: {
      type: String,
      required: true,
      index: true,
    },
    locationId: {
      type: String,
    },
    expectedQuantity: {
      type: Number,
      required: true,
    },
    actualQuantity: {
      type: Number,
      required: true,
    },
    discrepancy: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'counted', 'approved', 'adjusted'],
      default: 'pending',
    },
    notes: {
      type: String,
    },
    countedBy: {
      type: String,
    },
    countedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Stock Alert Schema
const StockAlertSchema = new Schema<IStockAlert>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    inventoryItemId: {
      type: String,
      required: true,
      index: true,
    },
    warehouseId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['low_stock', 'out_of_stock', 'reorder_point', 'expiry', 'discrepancy'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'resolved', 'ignored'],
      default: 'active',
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    resolvedBy: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
WarehouseSchema.index({ organizationId: 1, code: 1 }, { unique: true });
WarehouseSchema.index({ organizationId: 1, isDefault: 1 });

InventoryLocationSchema.index({ warehouseId: 1, code: 1 }, { unique: true });

InventoryItemSchema.index({ organizationId: 1, sku: 1 }, { unique: true });
InventoryItemSchema.index({ productId: 1 });
InventoryItemSchema.index({ productVariantId: 1 });
InventoryItemSchema.index({ organizationId: 1, status: 1 });

InventoryLevelSchema.index({ inventoryItemId: 1, warehouseId: 1 }, { unique: true });

InventoryTransactionSchema.index({ createdAt: 1 });
InventoryTransactionSchema.index({ inventoryItemId: 1, createdAt: -1 });
InventoryTransactionSchema.index({ warehouseId: 1, createdAt: -1 });
InventoryTransactionSchema.index({ 'reference.id': 1, 'reference.type': 1 });

StockCountSchema.index({ warehouseId: 1, status: 1 });
StockCountSchema.index({ scheduledAt: 1 });

StockCountItemSchema.index({ stockCountId: 1, inventoryItemId: 1 }, { unique: true });

StockAlertSchema.index({ organizationId: 1, status: 1 });
StockAlertSchema.index({ inventoryItemId: 1, status: 1 });
StockAlertSchema.index({ inventoryItemId: 1, warehouseId: 1, status: 1 });

// Methods
WarehouseSchema.methods.isDefault = function (this: IWarehouseDocument): boolean {
  return this.isDefault === true;
};

InventoryItemSchema.methods.calculateTotalStock = async function (
  this: IInventoryItemDocument
): Promise<number> {
  // This would fetch and aggregate across all warehouses
  const InventoryLevel = mongoose.model('InventoryLevel');
  const levels = await InventoryLevel.find({ inventoryItemId: this._id });
  return levels.reduce((total, level) => total + (level.onHand || 0), 0);
};

InventoryLevelSchema.methods.isLowStock = function (
  this: IInventoryLevelDocument,
  threshold?: number
): boolean {
  const compareThreshold = threshold ?? this.reorderPoint ?? 0;
  return this.available <= compareThreshold;
};

InventoryTransactionSchema.methods.getFormattedReference = function (
  this: IInventoryTransactionDocument
): string {
  if (!this.reference) return '';
  return `${this.reference.type}:${this.reference.id}`;
};

// Static methods
WarehouseSchema.statics.findByCode = async function (
  this: IWarehouseModel,
  code: string,
  organizationId: string
): Promise<IWarehouseDocument | null> {
  return this.findOne({ code, organizationId });
};

WarehouseSchema.statics.findDefaultWarehouse = async function (
  this: IWarehouseModel,
  organizationId: string
): Promise<IWarehouseDocument | null> {
  return this.findOne({ organizationId, isDefault: true });
};

InventoryItemSchema.statics.findBySku = async function (
  this: IInventoryItemModel,
  sku: string,
  organizationId: string
): Promise<IInventoryItemDocument | null> {
  return this.findOne({ sku, organizationId });
};

InventoryItemSchema.statics.findLowStock = async function (
  this: IInventoryItemModel,
  organizationId: string
): Promise<IInventoryItemDocument[]> {
  return this.find({ organizationId, status: 'low_stock' });
};

InventoryLevelSchema.statics.findByItemAndWarehouse = async function (
  this: IInventoryLevelModel,
  itemId: string,
  warehouseId: string
): Promise<IInventoryLevelDocument | null> {
  return this.findOne({ inventoryItemId: itemId, warehouseId });
};

// Create and export models
export const WarehouseModel = model<IWarehouseDocument, IWarehouseModel>('Warehouse', WarehouseSchema);
export const InventoryLocationModel = model<IInventoryLocation>('InventoryLocation', InventoryLocationSchema);
export const InventoryItemModel = model<IInventoryItemDocument, IInventoryItemModel>('InventoryItem', InventoryItemSchema);
export const InventoryLevelModel = model<IInventoryLevelDocument, IInventoryLevelModel>('InventoryLevel', InventoryLevelSchema);
export const InventoryReservationModel = model<IInventoryReservation>('InventoryReservation', InventoryReservationSchema);
export const InventoryTransactionModel = model<IInventoryTransactionDocument>('InventoryTransaction', InventoryTransactionSchema);
export const StockCountModel = model<IStockCount>('StockCount', StockCountSchema);
export const StockCountItemModel = model<IStockCountItem>('StockCountItem', StockCountItemSchema);
export const StockAlertModel = model<IStockAlert>('StockAlert', StockAlertSchema);