import mongoose, { Document, Model, Schema } from 'mongoose';

export type ShipmentAlertType = 'delayed' | 'status-change' | 'delivery-exception' | 'delivery-attempt' | 'out-for-delivery' | 'delivered' | 'returned' | 'custom';
export type ShipmentAlertStatus = 'active' | 'resolved' | 'dismissed';
export type ShipmentAlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface IShipmentAlert {
  shipment: mongoose.Types.ObjectId;
  shipmentNumber: string;
  trackingNumber: string;
  courier: string;
  alertType: ShipmentAlertType;
  status: ShipmentAlertStatus;
  priority: ShipmentAlertPriority;
  description: string;
  expectedDeliveryDate?: Date;
  newExpectedDeliveryDate?: Date;
  delayReason?: string;
  currentLocation?: string;
  purchaseOrder?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolutionNotes?: string;
  customerNotified?: boolean;
  supplierNotified?: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShipmentAlertDocument extends IShipmentAlert, Document {}

const shipmentAlertSchema = new Schema<IShipmentAlertDocument>(
  {
    shipment: {
      type: Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
    },
    shipmentNumber: {
      type: String,
      required: true,
    },
    trackingNumber: {
      type: String,
      required: true,
    },
    courier: {
      type: String,
      required: true,
    },
    alertType: {
      type: String,
      enum: ['delayed', 'status-change', 'delivery-exception', 'delivery-attempt', 'out-for-delivery', 'delivered', 'returned', 'custom'],
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
    expectedDeliveryDate: {
      type: Date,
    },
    newExpectedDeliveryDate: {
      type: Date,
    },
    delayReason: {
      type: String,
    },
    currentLocation: {
      type: String,
    },
    purchaseOrder: {
      type: Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
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
    customerNotified: {
      type: Boolean,
      default: false,
    },
    supplierNotified: {
      type: Boolean,
      default: false,
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
shipmentAlertSchema.index({ shipment: 1 });
shipmentAlertSchema.index({ trackingNumber: 1 });
shipmentAlertSchema.index({ alertType: 1 });
shipmentAlertSchema.index({ status: 1 });
shipmentAlertSchema.index({ priority: 1 });
shipmentAlertSchema.index({ purchaseOrder: 1 });
shipmentAlertSchema.index({ order: 1 });
shipmentAlertSchema.index({ assignedTo: 1 });
shipmentAlertSchema.index({ createdAt: 1 });

const ShipmentAlert = mongoose.model<IShipmentAlertDocument>('ShipmentAlert', shipmentAlertSchema);

export default ShipmentAlert;