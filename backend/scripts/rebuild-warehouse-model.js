/**
 * Script to rebuild the warehouse.model.ts file
 * Creating a complete model implementation
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/models/warehouse.model.ts');
const backupFile = path.join(__dirname, '../src/models/warehouse.model.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt model content
const newModelContent = `import mongoose, { Document, Model, Schema } from 'mongoose';

export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_MAINTENANCE = 'under-maintenance'
}

export enum WarehouseType {
  OWNED = 'owned',
  LEASED = 'leased',
  THIRD_PARTY = '3pl',
  RETAIL = 'retail'
}

/**
 * Interface for Warehouse Address
 */
export interface IWarehouseAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Interface for Warehouse Contact
 */
export interface IWarehouseContact {
  name: string;
  position: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

/**
 * Interface for Warehouse Zone
 */
export interface IWarehouseZone {
  name: string;
  description?: string;
  area?: number;
  areaUnit?: 'sqft' | 'sqm';
  maxCapacity?: number;
  type?: 'storage' | 'receiving' | 'shipping' | 'staging' | 'returns' | 'fulfillment' | 'custom';
  customType?: string;
  temperature?: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  humidity?: {
    min: number;
    max: number;
    unit: '%';
  };
}

/**
 * Static methods for Warehouse model
 */
export interface IWarehouseStatics {
  // Add static methods as needed
}

/**
 * Methods for Warehouse model
 */
export interface IWarehouseMethods {
  // Add methods as needed
}

export interface IWarehouse {
  name: string;
  code: string;
  type: WarehouseType | string;
  status: WarehouseStatus | string;
  address: IWarehouseAddress;
  contacts?: IWarehouseContact[];
  capacity?: number;
  capacityUnit?: 'sqft' | 'sqm';
  capacityUsed?: number;
  zones?: IWarehouseZone[];
  operatingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  notes?: string;
  tags?: string[];
  isDefault?: boolean;
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWarehouseDocument extends IWarehouse, Document, IWarehouseMethods {}

/**
 * Type for Warehouse model with statics
 */
export type WarehouseModel = Model<IWarehouseDocument> & IWarehouseStatics;

const addressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}, { _id: false });

const contactSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const temperatureSchema = new Schema({
  min: Number,
  max: Number,
  unit: {
    type: String,
    enum: ['C', 'F'],
    default: 'C'
  }
}, { _id: false });

const humiditySchema = new Schema({
  min: Number,
  max: Number,
  unit: {
    type: String,
    enum: ['%'],
    default: '%'
  }
}, { _id: false });

const zoneSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  area: Number,
  areaUnit: {
    type: String,
    enum: ['sqft', 'sqm'],
    default: 'sqft'
  },
  maxCapacity: Number,
  type: {
    type: String,
    enum: ['storage', 'receiving', 'shipping', 'staging', 'returns', 'fulfillment', 'custom'],
    default: 'storage'
  },
  customType: String,
  temperature: temperatureSchema,
  humidity: humiditySchema
}, { _id: true });

const hourSchema = new Schema({
  open: String,
  close: String
}, { _id: false });

const operatingHoursSchema = new Schema({
  monday: hourSchema,
  tuesday: hourSchema,
  wednesday: hourSchema,
  thursday: hourSchema,
  friday: hourSchema,
  saturday: hourSchema,
  sunday: hourSchema
}, { _id: false });

const warehouseSchema = new Schema<IWarehouseDocument, WarehouseModel, IWarehouseMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    type: {
      type: String,
      enum: Object.values(WarehouseType),
      default: WarehouseType.OWNED
    },
    status: {
      type: String,
      enum: Object.values(WarehouseStatus),
      default: WarehouseStatus.ACTIVE
    },
    address: {
      type: addressSchema,
      required: true
    },
    contacts: [contactSchema],
    capacity: Number,
    capacityUnit: {
      type: String,
      enum: ['sqft', 'sqm'],
      default: 'sqft'
    },
    capacityUsed: {
      type: Number,
      default: 0
    },
    zones: [zoneSchema],
    operatingHours: operatingHoursSchema,
    notes: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    isDefault: {
      type: Boolean,
      default: false
    },
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
warehouseSchema.index({ name: 1 });
warehouseSchema.index({ code: 1 });
warehouseSchema.index({ status: 1 });
warehouseSchema.index({ type: 1 });
warehouseSchema.index({ organizationId: 1 });
warehouseSchema.index({ isDefault: 1 });
warehouseSchema.index({ 'address.country': 1, 'address.state': 1, 'address.city': 1 });
warehouseSchema.index({ 'tags': 1 });

// Pre-save middleware to ensure only one default warehouse
warehouseSchema.pre('save', async function(next) {
  if (this.isModified('isDefault') && this.isDefault) {
    const WarehouseModel = mongoose.model('Warehouse');
    // Find any existing default warehouse and unset it
    await WarehouseModel.updateMany(
      { 
        organizationId: this.organizationId, 
        isDefault: true,
        _id: { $ne: this._id }
      },
      { isDefault: false }
    );
  }
  next();
});

const Warehouse = mongoose.model<IWarehouseDocument, WarehouseModel>('Warehouse', warehouseSchema);

export default Warehouse;`;

// Write the new file
console.log('Writing new model file...');
fs.writeFileSync(targetFile, newModelContent);

console.log('Successfully rebuilt warehouse.model.ts');