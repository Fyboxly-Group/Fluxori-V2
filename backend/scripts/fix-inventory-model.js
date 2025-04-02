/**
 * Specialized fix script for the inventory.model.ts file
 * 
 * This file has a specific issue with import structure being malformed
 */

const fs = require('fs');
const path = require('path');

const MODEL_FILE_PATH = path.join(__dirname, '../src/models/inventory.model.ts');

// The correct content for the inventory model
const correctContent = `import mongoose, { Document, Model, Schema } from 'mongoose';
import { TypedSchema, PreHookCallback, PostHookCallback } from '../types/mongo-util-types';

/**
 * Static methods for InventoryItem model
 */
export interface IInventoryItemStatics {
  // Add static methods as needed
}

/**
 * Methods for InventoryItem model
 */
export interface IInventoryItemMethods {
  // Add methods as needed
}

export interface IInventoryItem {
  sku: string,
  name: string,
  description?: string,
  category: string,
  price: number,
  costPrice: number,
  // Total stock quantity across all warehouses - maintained for backward compatibility
  // and quick access to aggregated stock information
  stockQuantity: number,
  // Default reorder values - can be overridden at warehouse level
  reorderPoint: number,
  reorderQuantity: number,
  supplier: mongoose.Types.ObjectId,
  // deprecated in favor of warehouse-specific locations
  location?: string,
  dimensions?: {
    width: number,
    height: number,
    depth: number,
    weight: number,
    unit: 'cm' | 'in' | 'mm',
    weightUnit: 'kg' | 'g' | 'lb' | 'oz',
  },
  barcode?: string,
  images?: string[],
  isActive: boolean,
  tags?: string[],
  variations?: {
    name: string,
    values: string[],
  }[],
  createdBy: mongoose.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
}

export interface IInventoryItemDocument extends IInventoryItem, Document, IInventoryItemMethods {}

/**
 * Type for InventoryItem model with statics
 */
export type InventoryItemModel = Model<IInventoryItemDocument> & IInventoryItemStatics;

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

const InventoryItem = mongoose.model<IInventoryItemDocument, InventoryItemModel>('InventoryItem', inventoryItemSchema);

export default InventoryItem;`;

console.log(`Fixing file: ${MODEL_FILE_PATH}`);
fs.writeFileSync(MODEL_FILE_PATH, correctContent);
console.log('Done!');