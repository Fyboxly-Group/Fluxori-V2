/**
 * Script to rebuild the shipment.model.ts file
 * Fixing syntax errors and implementing proper TypeScript
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/models/shipment.model.ts');
const backupFile = path.join(__dirname, '../src/models/shipment.model.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt model content
const newModelContent = `import mongoose, { Document, Model, Schema } from 'mongoose';

export enum ShipmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in-transit',
  OUT_FOR_DELIVERY = 'out-for-delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned'
}

export enum ShipmentType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound'
}

export enum DocumentCategory {
  INVOICE = 'invoice',
  PACKING_SLIP = 'packing-slip',
  BILL_OF_LADING = 'bill-of-lading',
  CUSTOMS = 'customs',
  INSURANCE = 'insurance',
  RECEIPT = 'receipt',
  OTHER = 'other'
}

export enum WeightUnit {
  KG = 'kg',
  G = 'g',
  LB = 'lb',
  OZ = 'oz'
}

export enum DimensionUnit {
  CM = 'cm',
  IN = 'in',
  MM = 'mm'
}

/**
 * Interface for Address
 */
export interface IAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

/**
 * Interface for Shipment Item
 */
export interface IShipmentItem {
  product: mongoose.Types.ObjectId;
  sku: string;
  name: string;
  quantity: number;
}

/**
 * Interface for Shipment Document
 */
export interface IShipmentDocument {
  title: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  category: DocumentCategory | string;
}

/**
 * Interface for Tracking History
 */
export interface ITrackingEvent {
  status: string;
  location?: string;
  timestamp: Date;
  description?: string;
}

/**
 * Static methods for Shipment model
 */
export interface IShipmentStatics {
  // Add static methods as needed
}

/**
 * Methods for Shipment model
 */
export interface IShipmentMethods {
  // Add methods as needed
}

export interface IShipment {
  shipmentNumber: string;
  type: ShipmentType | string;
  courier: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: ShipmentStatus | string;
  origin: IAddress;
  destination: IAddress;
  items: IShipmentItem[];
  purchaseOrder?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  estimatedDeliveryDate?: Date;
  shippedDate?: Date;
  deliveredDate?: Date;
  weight?: number;
  weightUnit?: WeightUnit | string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: DimensionUnit | string;
  };
  shippingCost?: number;
  notes?: string;
  deliveryInstructions?: string;
  signatureRequired: boolean;
  documents?: IShipmentDocument[];
  trackingHistory?: ITrackingEvent[];
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShipmentDocumentType extends IShipment, Document, IShipmentMethods {}

/**
 * Type for Shipment model with statics
 */
export type ShipmentModel = Model<IShipmentDocumentType> & IShipmentStatics;

const addressSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
}, { _id: false });

const shipmentItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const dimensionSchema = new Schema({
  length: Number,
  width: Number,
  height: Number,
  unit: {
    type: String,
    enum: Object.values(DimensionUnit),
    default: DimensionUnit.CM
  }
}, { _id: false });

const documentSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: Object.values(DocumentCategory),
    default: DocumentCategory.OTHER
  }
});

const trackingEventSchema = new Schema({
  status: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  timestamp: {
    type: Date,
    required: true
  },
  description: {
    type: String
  }
}, { _id: false });

const shipmentSchema = new Schema<IShipmentDocumentType, ShipmentModel, IShipmentMethods>(
  {
    shipmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    type: {
      type: String,
      enum: Object.values(ShipmentType),
      required: true
    },
    courier: {
      type: String,
      required: true
    },
    trackingNumber: {
      type: String,
      required: true
    },
    trackingUrl: {
      type: String
    },
    status: {
      type: String,
      enum: Object.values(ShipmentStatus),
      default: ShipmentStatus.PENDING
    },
    origin: addressSchema,
    destination: addressSchema,
    items: [shipmentItemSchema],
    purchaseOrder: {
      type: Schema.Types.ObjectId,
      ref: 'PurchaseOrder'
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    estimatedDeliveryDate: {
      type: Date
    },
    shippedDate: {
      type: Date
    },
    deliveredDate: {
      type: Date
    },
    weight: {
      type: Number
    },
    weightUnit: {
      type: String,
      enum: Object.values(WeightUnit),
      default: WeightUnit.KG
    },
    dimensions: dimensionSchema,
    shippingCost: {
      type: Number
    },
    notes: {
      type: String
    },
    deliveryInstructions: {
      type: String
    },
    signatureRequired: {
      type: Boolean,
      default: false
    },
    documents: [documentSchema],
    trackingHistory: [trackingEventSchema],
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
shipmentSchema.index({ shipmentNumber: 1 });
shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ type: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ estimatedDeliveryDate: 1 });
shipmentSchema.index({ purchaseOrder: 1 });
shipmentSchema.index({ order: 1 });
shipmentSchema.index({ 'items.product': 1 });
shipmentSchema.index({ organizationId: 1 });

// Pre-save hook to update status based on dates
shipmentSchema.pre('save', function(next) {
  // If shipping date was set, update status to shipped
  if (this.isModified('shippedDate') && this.shippedDate && 
      [ShipmentStatus.PENDING, ShipmentStatus.PROCESSING].includes(this.status as ShipmentStatus)) {
    this.status = ShipmentStatus.SHIPPED;
  }
  
  // If delivery date was set, update status to delivered
  if (this.isModified('deliveredDate') && this.deliveredDate) {
    this.status = ShipmentStatus.DELIVERED;
  }
  
  next();
});

const Shipment = mongoose.model<IShipmentDocumentType, ShipmentModel>('Shipment', shipmentSchema);

export default Shipment;`;

// Write the new file
console.log('Writing new model file...');
fs.writeFileSync(targetFile, newModelContent);

console.log('Successfully rebuilt shipment.model.ts');