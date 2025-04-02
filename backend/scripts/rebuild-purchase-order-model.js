/**
 * Script to rebuild the purchase-order.model.ts file
 * Fixing syntax errors and implementing proper TypeScript
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/models/purchase-order.model.ts');
const backupFile = path.join(__dirname, '../src/models/purchase-order.model.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt model content
const newModelContent = `import mongoose, { Document, Model, Schema } from 'mongoose';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  SHIPPED = 'shipped',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

/**
 * Interface for PurchaseOrderItem
 */
export interface IPurchaseOrderItem {
  itemId: mongoose.Types.ObjectId;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Static methods for PurchaseOrder model
 */
export interface IPurchaseOrderStatics {
  // Add static methods as needed
}

/**
 * Methods for PurchaseOrder model
 */
export interface IPurchaseOrderMethods {
  // Add methods as needed
}

export interface IPurchaseOrder {
  orderNumber: string;
  supplierId: mongoose.Types.ObjectId;
  items: IPurchaseOrderItem[];
  status: PurchaseOrderStatus | string;
  totalAmount: number;
  currency: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  attachments?: string[];
  createdBy: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchaseOrderDocument extends IPurchaseOrder, Document, IPurchaseOrderMethods {}

/**
 * Type for PurchaseOrder model with statics
 */
export type PurchaseOrderModel = Model<IPurchaseOrderDocument> & IPurchaseOrderStatics;

const purchaseOrderItemSchema = new Schema({
  itemId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Inventory' 
  },
  description: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  unitPrice: { 
    type: Number, 
    required: true 
  },
  total: { 
    type: Number, 
    required: true 
  }
}, { _id: true });

const purchaseOrderSchema = new Schema<IPurchaseOrderDocument, PurchaseOrderModel, IPurchaseOrderMethods>(
  {
    orderNumber: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true
    },
    supplierId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Supplier', 
      required: true 
    },
    items: [purchaseOrderItemSchema],
    status: {
      type: String,
      enum: Object.values(PurchaseOrderStatus),
      default: PurchaseOrderStatus.DRAFT
    },
    totalAmount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      default: 'USD' 
    },
    orderDate: { 
      type: Date, 
      default: Date.now 
    },
    expectedDeliveryDate: { 
      type: Date 
    },
    actualDeliveryDate: { 
      type: Date 
    },
    notes: { 
      type: String 
    },
    attachments: [{ 
      type: String 
    }],
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
purchaseOrderSchema.index({ organizationId: 1, orderNumber: 1 });
purchaseOrderSchema.index({ supplierId: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ organizationId: 1, status: 1 });
purchaseOrderSchema.index({ orderDate: -1 });

// Pre-save hook to calculate total amount
purchaseOrderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.total, 0);
  }
  next();
});

const PurchaseOrder = mongoose.model<IPurchaseOrderDocument, PurchaseOrderModel>('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;`;

// Write the new file
console.log('Writing new model file...');
fs.writeFileSync(targetFile, newModelContent);

console.log('Successfully rebuilt purchase-order.model.ts');