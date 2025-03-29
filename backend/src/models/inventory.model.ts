import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInventoryItem {
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplier: mongoose.Types.ObjectId;
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
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryItemDocument extends IInventoryItem, Document {}

const inventoryItemSchema = new Schema<IInventoryItemDocument>(
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

const InventoryItem = mongoose.model<IInventoryItemDocument>('InventoryItem', inventoryItemSchema);

export default InventoryItem;