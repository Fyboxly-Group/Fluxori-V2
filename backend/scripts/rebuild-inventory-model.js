/**
 * Script to rebuild the inventory.model.ts file
 * Adding warehouseStock and organizationId properties that are used in controllers
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/models/inventory.model.ts');
const backupFile = path.join(__dirname, '../src/models/inventory.model.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt model content
const newModelContent = `import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Warehouse stock entry
 */
export interface IWarehouseStock {
  warehouseId: mongoose.Types.ObjectId;
  quantity: number;
  location?: string;
  reorderPoint?: number;
  reorderQuantity?: number;
}

/**
 * Static methods for Inventory model
 */
export interface IInventoryItemStatics {
  // Add static methods as needed
}

/**
 * Methods for Inventory model
 */
export interface IInventoryItemMethods {
  // Add methods as needed
}

export interface IInventoryItem {
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  costPrice: number;
  // Total stock quantity across all warehouses - maintained for backward compatibility
  // and quick access to aggregated stock information
  stockQuantity: number;
  // Default reorder values - can be overridden at warehouse level
  reorderPoint: number;
  reorderQuantity: number;
  // Added for controller compatibility
  reorderThreshold?: number;
  supplier: mongoose.Types.ObjectId;
  // deprecated in favor of warehouse-specific locations
  location?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    weight: number;
    unit: 'cm' | 'in' | 'mm';
    weightUnit: 'kg' | 'g' | 'lb' | 'oz';
  };
  barcode?: string;
  images?: string[];
  isActive: boolean;
  tags?: string[];
  variations?: {
    name: string;
    values: string[];
  }[];
  // Warehouse-specific stock quantities
  warehouseStock?: IWarehouseStock[];
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryItemDocument extends IInventoryItem, Document, IInventoryItemMethods {}

/**
 * Type for Inventory model with statics
 */
export type InventoryItemModel = Model<IInventoryItemDocument> & IInventoryItemStatics;

const warehouseStockSchema = new Schema({
  warehouseId: {
    type: Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  location: {
    type: String,
    trim: true
  },
  reorderPoint: {
    type: Number
  },
  reorderQuantity: {
    type: Number
  }
}, { _id: false });

const inventoryItemSchema = new Schema<IInventoryItemDocument, InventoryItemModel, IInventoryItemMethods>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    reorderPoint: {
      type: Number,
      required: true,
      default: 5,
    },
    reorderQuantity: {
      type: Number,
      required: true,
      default: 10,
    },
    reorderThreshold: {
      type: Number,
      default: 5,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
      weight: Number,
      unit: {
        type: String,
        enum: ['cm', 'in', 'mm'],
        default: 'cm',
      },
      weightUnit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz'],
        default: 'kg',
      },
    },
    barcode: {
      type: String,
      trim: true,
    },
    images: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    variations: [{
      name: {
        type: String,
        required: true,
      },
      values: [{
        type: String,
        required: true,
      }],
    }],
    warehouseStock: [warehouseStockSchema],
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
inventoryItemSchema.index({ sku: 1 });
inventoryItemSchema.index({ name: 1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ stockQuantity: 1 });
inventoryItemSchema.index({ supplier: 1 });
inventoryItemSchema.index({ organizationId: 1 });
inventoryItemSchema.index({ 'warehouseStock.warehouseId': 1 });

const Inventory = mongoose.model<IInventoryItemDocument, InventoryItemModel>('Inventory', inventoryItemSchema);

export default Inventory;`;

// Write the new file
console.log('Writing new inventory model file...');
fs.writeFileSync(targetFile, newModelContent);

console.log('Successfully rebuilt inventory.model.ts');