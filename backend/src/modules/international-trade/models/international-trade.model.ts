import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * International Trade interfaces
 */
export interface IInternationalTrade {
  userId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * International Trade Document interface
 */
export interface IInternationalTradeDocument extends IInternationalTrade, Document {}

/**
 * International Trade Model interface
 */
export interface IInternationalTradeModel extends Model<IInternationalTradeDocument> {}

/**
 * Address interface for shipping origin and destination
 */
export interface IAddress {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Package dimensions interface
 */
export interface IDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

/**
 * Shipment item interface
 */
export interface IShipmentItem {
  description: string;
  quantity: number;
  value: number;
  hsCode?: string;
  originCountry?: string;
}

/**
 * Customs declaration item interface
 */
export interface ICustomsItem {
  description: string;
  hsCode: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  netWeight: number;
  originCountry: string;
}

/**
 * International Shipment interface
 */
export interface IInternationalShipment extends Document {
  _id: mongoose.Types.ObjectId;
  shipmentId?: string; // Alternative ID for external systems
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  origin: IAddress;
  destination: IAddress;
  packageDetails: {
    weight: number;
    weightUnit: string;
    dimensions: IDimensions;
  };
  items: IShipmentItem[];
  carrier?: string;
  service?: string;
  trackingNumber?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customs Declaration interface
 */
export interface ICustomsDeclaration extends Document {
  shipmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  declarationType: string;
  exporterDetails: {
    name: string;
    taxId?: string;
    address: string;
  };
  importerDetails: {
    name: string;
    taxId?: string;
    address: string;
  };
  items: ICustomsItem[];
  totalValue: number;
  currency: string;
  incoterm: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Address schema for reuse
const AddressSchema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
});

// Dimensions schema
const DimensionsSchema = new Schema({
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  unit: { type: String, required: true, enum: ['cm', 'in'] }
});

// Shipment item schema
const ShipmentItemSchema = new Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  value: { type: Number, required: true },
  hsCode: { type: String },
  originCountry: { type: String }
});

// Customs item schema
const CustomsItemSchema = new Schema({
  description: { type: String, required: true },
  hsCode: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitValue: { type: Number, required: true },
  totalValue: { type: Number, required: true },
  netWeight: { type: Number, required: true },
  originCountry: { type: String, required: true }
});

// International Shipment Schema
const InternationalShipmentSchema = new Schema({
  shipmentId: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  origin: { type: AddressSchema, required: true },
  destination: { type: AddressSchema, required: true },
  packageDetails: {
    weight: { type: Number, required: true },
    weightUnit: { type: String, required: true, enum: ['kg', 'lb'] },
    dimensions: { type: DimensionsSchema, required: true }
  },
  items: [ShipmentItemSchema],
  carrier: { type: String },
  service: { type: String },
  trackingNumber: { type: String },
  status: { type: String, default: 'draft', enum: ['draft', 'pending', 'processed', 'shipped', 'delivered', 'cancelled'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Customs Declaration Schema
const CustomsDeclarationSchema = new Schema({
  shipmentId: { type: Schema.Types.ObjectId, ref: 'InternationalShipment', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  declarationType: { type: String, required: true, enum: ['commercial', 'proforma', 'gift', 'sample', 'return', 'repair', 'other'] },
  exporterDetails: {
    name: { type: String, required: true },
    taxId: { type: String },
    address: { type: String, required: true }
  },
  importerDetails: {
    name: { type: String, required: true },
    taxId: { type: String },
    address: { type: String, required: true }
  },
  items: [CustomsItemSchema],
  totalValue: { type: Number, required: true },
  currency: { type: String, required: true },
  incoterm: { type: String, required: true, enum: ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'] },
  status: { type: String, default: 'draft', enum: ['draft', 'pending', 'approved', 'rejected'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Export models
export const InternationalShipment = mongoose.model<IInternationalShipment>('InternationalShipment', InternationalShipmentSchema);
export const CustomsDeclaration = mongoose.model<ICustomsDeclaration>('CustomsDeclaration', CustomsDeclarationSchema);
