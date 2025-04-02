/**
 * Script to rebuild the inventory-alert.model.ts file
 * Creating a proper model implementation
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/models/inventory-alert.model.ts');
const backupFile = path.join(__dirname, '../src/models/inventory-alert.model.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt model content
const newModelContent = `import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Enum for alert types
 */
export enum AlertType {
  LOW_STOCK = 'low_stock',
  EXPIRY = 'expiry',
  PRICE_CHANGE = 'price_change',
  CUSTOM = 'custom'
}

/**
 * Enum for alert status
 */
export enum AlertStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
  EXPIRED = 'expired'
}

/**
 * Static methods for InventoryAlert model
 */
export interface IInventoryAlertStatics {
  // Add static methods as needed
}

/**
 * Methods for InventoryAlert model
 */
export interface IInventoryAlertMethods {
  // Add methods as needed
}

export interface IInventoryAlert {
  inventoryId: mongoose.Types.ObjectId;
  alertType: AlertType;
  description: string;
  threshold: number;
  status: AlertStatus;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  notificationSent: boolean;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  warehouseId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryAlertDocument extends IInventoryAlert, Document, IInventoryAlertMethods {}

/**
 * Type for InventoryAlert model with statics
 */
export type InventoryAlertModel = Model<IInventoryAlertDocument> & IInventoryAlertStatics;

const inventoryAlertSchema = new Schema<IInventoryAlertDocument, InventoryAlertModel, IInventoryAlertMethods>(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    alertType: {
      type: String,
      enum: Object.values(AlertType),
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    threshold: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(AlertStatus),
      default: AlertStatus.ACTIVE
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    notificationSent: {
      type: Boolean,
      default: false
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse'
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
inventoryAlertSchema.index({ inventoryId: 1 });
inventoryAlertSchema.index({ alertType: 1 });
inventoryAlertSchema.index({ status: 1 });
inventoryAlertSchema.index({ organizationId: 1 });
inventoryAlertSchema.index({ warehouseId: 1 });
inventoryAlertSchema.index({ createdAt: -1 });

const InventoryAlert = mongoose.model<IInventoryAlertDocument, InventoryAlertModel>('InventoryAlert', inventoryAlertSchema);

export default InventoryAlert;`;

// Write the new file
console.log('Writing new model file...');
fs.writeFileSync(targetFile, newModelContent);

console.log('Successfully rebuilt inventory-alert.model.ts');