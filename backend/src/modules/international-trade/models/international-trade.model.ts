import mongoose, { Document, Schema } from 'mongoose';

// International Shipment Schema
export interface IInternationalShipment extends Document {
  shipmentId: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  origin: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
  };
  destination: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
  };
  packages: Array<{
    weight: number;
    weightUnit: string;
    length: number;
    width: number;
    height: number;
    dimensionUnit: string;
    contents: string;
    packageType: string;
  }>;
  serviceType: string;
  carrierCode: string;
  trackingNumber: string;
  estimatedDelivery: Date;
  customsDeclarationId: mongoose.Types.ObjectId;
  complianceCheckId: mongoose.Types.ObjectId;
  documents: Array<{
    type: string;
    url: string;
    createdAt: Date;
  }>;
  totalValue: number;
  currency: string;
  insuranceAmount: number;
  shippingCost: number;
  dutiesAndTaxes: number;
  notes: string;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
}

const InternationalShipmentSchema: Schema = new Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: [
        'created',
        'documents_pending',
        'documents_completed',
        'customs_processing',
        'customs_cleared',
        'in_transit',
        'delivered',
        'exception',
        'returned',
        'cancelled',
      ],
      default: 'created',
    },
    origin: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      contactName: { type: String, required: true },
      contactPhone: { type: String, required: true },
      contactEmail: { type: String, required: true },
    },
    destination: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      contactName: { type: String, required: true },
      contactPhone: { type: String, required: true },
      contactEmail: { type: String, required: true },
    },
    packages: [
      {
        weight: { type: Number, required: true },
        weightUnit: { type: String, enum: ['kg', 'lb'], default: 'kg' },
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        dimensionUnit: { type: String, enum: ['cm', 'in'], default: 'cm' },
        contents: { type: String, required: true },
        packageType: { 
          type: String, 
          enum: ['box', 'pallet', 'envelope', 'tube', 'other'],
          default: 'box'
        },
      },
    ],
    serviceType: {
      type: String,
      enum: ['express', 'standard', 'economy', 'priority'],
      default: 'standard',
    },
    carrierCode: {
      type: String,
      required: true,
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    estimatedDelivery: {
      type: Date,
    },
    customsDeclarationId: {
      type: Schema.Types.ObjectId,
      ref: 'CustomsDeclaration',
    },
    complianceCheckId: {
      type: Schema.Types.ObjectId,
      ref: 'TradeCompliance',
    },
    documents: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    totalValue: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    insuranceAmount: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    dutiesAndTaxes: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Customs Declaration Schema
export interface ICustomsDeclaration extends Document {
  declarationId: string;
  createdAt: Date;
  updatedAt: Date;
  shipmentId: mongoose.Types.ObjectId;
  purpose: string;
  incoterm: string;
  items: Array<{
    description: string;
    hsCode: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
    currency: string;
    countryOfOrigin: string;
    weight: number;
    weightUnit: string;
  }>;
  declaredValue: number;
  currency: string;
  exporterReference: string;
  importerReference: string;
  exportLicenseNumber: string;
  exportLicenseDate: Date;
  senderType: string;
  recipientType: string;
  status: string;
  comments: string;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
}

const CustomsDeclarationSchema: Schema = new Schema(
  {
    declarationId: {
      type: String,
      required: true,
      unique: true,
    },
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'InternationalShipment',
      required: true,
    },
    purpose: {
      type: String,
      enum: [
        'commercial', 
        'gift', 
        'sample', 
        'repair', 
        'return', 
        'personal', 
        'other'
      ],
      default: 'commercial',
    },
    incoterm: {
      type: String,
      enum: [
        'EXW', 'FCA', 'FAS', 'FOB', 
        'CFR', 'CIF', 'CPT', 'CIP', 
        'DAP', 'DPU', 'DDP'
      ],
      default: 'DAP',
    },
    items: [
      {
        description: { type: String, required: true },
        hsCode: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitValue: { type: Number, required: true },
        totalValue: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        countryOfOrigin: { type: String, required: true },
        weight: { type: Number, required: true },
        weightUnit: { type: String, enum: ['kg', 'lb'], default: 'kg' },
      },
    ],
    declaredValue: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    exporterReference: {
      type: String,
      default: '',
    },
    importerReference: {
      type: String,
      default: '',
    },
    exportLicenseNumber: {
      type: String,
      default: '',
    },
    exportLicenseDate: {
      type: Date,
    },
    senderType: {
      type: String,
      enum: ['individual', 'company', 'government', 'other'],
      default: 'company',
    },
    recipientType: {
      type: String,
      enum: ['individual', 'company', 'government', 'other'],
      default: 'company',
    },
    status: {
      type: String,
      enum: [
        'draft', 
        'submitted', 
        'approved', 
        'rejected', 
        'incomplete'
      ],
      default: 'draft',
    },
    comments: {
      type: String,
      default: '',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Trade Compliance Schema
export interface ITradeCompliance extends Document {
  complianceId: string;
  createdAt: Date;
  updatedAt: Date;
  shipmentId: mongoose.Types.ObjectId;
  status: string;
  checks: Array<{
    type: string;
    status: string;
    details: string;
    timestamp: Date;
  }>;
  requiredDocuments: Array<{
    type: string;
    description: string;
    provided: boolean;
  }>;
  restrictedItems: Array<{
    hsCode: string;
    description: string;
    restriction: string;
    resolution: string;
  }>;
  exportApproval: boolean;
  importApproval: boolean;
  riskAssessment: {
    score: number;
    level: string;
    factors: string[];
  };
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
}

const TradeComplianceSchema: Schema = new Schema(
  {
    complianceId: {
      type: String,
      required: true,
      unique: true,
    },
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'InternationalShipment',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'initiated', 
        'in_progress', 
        'approved', 
        'rejected', 
        'requires_documents',
        'requires_review'
      ],
      default: 'initiated',
    },
    checks: [
      {
        type: { type: String, required: true },
        status: { 
          type: String, 
          enum: ['passed', 'failed', 'warning', 'not_applicable'],
          required: true 
        },
        details: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    requiredDocuments: [
      {
        type: { type: String, required: true },
        description: { type: String, required: true },
        provided: { type: Boolean, default: false },
      },
    ],
    restrictedItems: [
      {
        hsCode: { type: String, required: true },
        description: { type: String, required: true },
        restriction: { type: String, required: true },
        resolution: { type: String, default: '' },
      },
    ],
    exportApproval: {
      type: Boolean,
      default: false,
    },
    importApproval: {
      type: Boolean,
      default: false,
    },
    riskAssessment: {
      score: { type: Number, required: true },
      level: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'critical'],
        required: true 
      },
      factors: [{ type: String }],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Shipping Rate Schema
export interface IShippingRate extends Document {
  rateId: string;
  createdAt: Date;
  updatedAt: Date;
  origin: {
    country: string;
    postalCode: string;
  };
  destination: {
    country: string;
    postalCode: string;
  };
  packages: Array<{
    weight: number;
    weightUnit: string;
    length: number;
    width: number;
    height: number;
    dimensionUnit: string;
  }>;
  options: {
    insuranceRequired: boolean;
    insuranceAmount: number;
    signatureRequired: boolean;
    residentialDelivery: boolean;
    saturdayDelivery: boolean;
  };
  quotes: Array<{
    carrierId: string;
    carrierName: string;
    serviceCode: string;
    serviceName: string;
    baseRate: number;
    taxes: number;
    fees: number;
    totalRate: number;
    currency: string;
    estimatedDelivery: Date;
    transitDays: number;
    guaranteedDelivery: boolean;
  }>;
  selectedQuoteIndex: number;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
}

const ShippingRateSchema: Schema = new Schema(
  {
    rateId: {
      type: String,
      required: true,
      unique: true,
    },
    origin: {
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    destination: {
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    packages: [
      {
        weight: { type: Number, required: true },
        weightUnit: { type: String, enum: ['kg', 'lb'], default: 'kg' },
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        dimensionUnit: { type: String, enum: ['cm', 'in'], default: 'cm' },
      },
    ],
    options: {
      insuranceRequired: { type: Boolean, default: false },
      insuranceAmount: { type: Number, default: 0 },
      signatureRequired: { type: Boolean, default: false },
      residentialDelivery: { type: Boolean, default: false },
      saturdayDelivery: { type: Boolean, default: false },
    },
    quotes: [
      {
        carrierId: { type: String, required: true },
        carrierName: { type: String, required: true },
        serviceCode: { type: String, required: true },
        serviceName: { type: String, required: true },
        baseRate: { type: Number, required: true },
        taxes: { type: Number, required: true },
        fees: { type: Number, required: true },
        totalRate: { type: Number, required: true },
        currency: { type: String, required: true },
        estimatedDelivery: { type: Date },
        transitDays: { type: Number },
        guaranteedDelivery: { type: Boolean, default: false },
      },
    ],
    selectedQuoteIndex: {
      type: Number,
      default: -1,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Export the models
export const InternationalShipment = mongoose.model<IInternationalShipment>(
  'InternationalShipment',
  InternationalShipmentSchema
);

export const CustomsDeclaration = mongoose.model<ICustomsDeclaration>(
  'CustomsDeclaration',
  CustomsDeclarationSchema
);

export const TradeCompliance = mongoose.model<ITradeCompliance>(
  'TradeCompliance',
  TradeComplianceSchema
);

export const ShippingRate = mongoose.model<IShippingRate>(
  'ShippingRate',
  ShippingRateSchema
);