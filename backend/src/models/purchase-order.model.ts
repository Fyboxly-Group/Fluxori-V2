import mongoose, { Document, Model, Schema } from 'mongoose';

export type PurchaseOrderStatus = 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'partial' | 'delivered' | 'cancelled';

export interface IPurchaseOrder {
  orderNumber: string;
  supplier: mongoose.Types.ObjectId;
  status: PurchaseOrderStatus;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  items: {
    product: mongoose.Types.ObjectId;
    sku: string;
    name: string;
    quantity: number;
    costPrice: number;
    total: number;
    receivedQuantity?: number;
  }[];
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentDueDate?: Date;
  paymentMethod?: string;
  trackingNumbers?: string[];
  notes?: string;
  attachments?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchaseOrderDocument extends IPurchaseOrder, Document {}

const purchaseOrderSchema = new Schema<IPurchaseOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'confirmed', 'shipped', 'partial', 'delivered', 'cancelled'],
      default: 'draft',
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    items: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'InventoryItem',
        required: true,
      },
      sku: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      costPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
      receivedQuantity: {
        type: Number,
        default: 0,
      },
    }],
    shippingCost: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    paymentDueDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    trackingNumbers: [{
      type: String,
    }],
    notes: {
      type: String,
    },
    attachments: [{
      type: String,
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
purchaseOrderSchema.index({ orderNumber: 1 });
purchaseOrderSchema.index({ supplier: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ orderDate: 1 });
purchaseOrderSchema.index({ expectedDeliveryDate: 1 });
purchaseOrderSchema.index({ paymentStatus: 1 });
purchaseOrderSchema.index({ 'items.product': 1 });

const PurchaseOrder = mongoose.model<IPurchaseOrderDocument>('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;