import mongoose, { Document, Model, Schema } from 'mongoose';

export type AlertType = 'low-stock' | 'out-of-stock' | 'expiring' | 'price-change' | 'overstock' | 'damaged' | 'custom';
export type AlertStatus = 'active' | 'resolved' | 'dismissed';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface IInventoryAlert {
  item: mongoose.Types.ObjectId;
  itemName: string;
  itemSku: string;
  alertType: AlertType;
  status: AlertStatus;
  priority: AlertPriority;
  description: string;
  currentQuantity?: number;
  thresholdQuantity?: number;
  expiryDate?: Date;
  recommendedAction?: string;
  assignedTo?: mongoose.Types.ObjectId;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolutionNotes?: string;
  purchaseOrderCreated?: boolean;
  purchaseOrder?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryAlertDocument extends IInventoryAlert, Document {}

const inventoryAlertSchema = new Schema<IInventoryAlertDocument>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    itemSku: {
      type: String,
      required: true,
    },
    alertType: {
      type: String,
      enum: ['low-stock', 'out-of-stock', 'expiring', 'price-change', 'overstock', 'damaged', 'custom'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'dismissed'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    description: {
      type: String,
      required: true,
    },
    currentQuantity: {
      type: Number,
    },
    thresholdQuantity: {
      type: Number,
    },
    expiryDate: {
      type: Date,
    },
    recommendedAction: {
      type: String,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    resolutionNotes: {
      type: String,
    },
    purchaseOrderCreated: {
      type: Boolean,
      default: false,
    },
    purchaseOrder: {
      type: Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
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
inventoryAlertSchema.index({ item: 1 });
inventoryAlertSchema.index({ itemSku: 1 });
inventoryAlertSchema.index({ alertType: 1 });
inventoryAlertSchema.index({ status: 1 });
inventoryAlertSchema.index({ priority: 1 });
inventoryAlertSchema.index({ assignedTo: 1 });
inventoryAlertSchema.index({ createdAt: 1 });

const InventoryAlert = mongoose.model<IInventoryAlertDocument>('InventoryAlert', inventoryAlertSchema);

export default InventoryAlert;