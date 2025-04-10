/**
 * Script to rebuild the customer.model.ts file
 * Fixing syntax errors and implementing proper TypeScript
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/models/customer.model.ts');
const backupFile = path.join(__dirname, '../src/models/customer.model.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt model content
const newModelContent = `import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Static methods for Customer model
 */
export interface ICustomerStatics {
  // Add static methods as needed
}

/**
 * Methods for Customer model
 */
export interface ICustomerMethods {
  // Add methods as needed
}

export interface ICustomer {
  name: string;
  email: string;
  phone?: string;
  contactName?: string;
  contactPosition?: string;
  industry?: string;
  type?: 'individual' | 'business';
  status: 'active' | 'inactive' | 'lead';
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  website?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  tags?: string[];
  documents?: {
    title: string;
    fileUrl: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    category: string;
  }[];
  customFields?: Record<string, any>;
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerDocument extends ICustomer, Document, ICustomerMethods {}

/**
 * Type for Customer model with statics
 */
export type CustomerModel = Model<ICustomerDocument> & ICustomerStatics;

const addressSchema = new Schema({
  street: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
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
    trim: true
  }
});

const customerSchema = new Schema<ICustomerDocument, CustomerModel, ICustomerMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    contactName: {
      type: String,
      trim: true
    },
    contactPosition: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['individual', 'business'],
      default: 'business'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'lead'],
      default: 'active'
    },
    address: addressSchema,
    notes: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    taxId: {
      type: String,
      trim: true
    },
    paymentTerms: {
      type: String,
      trim: true
    },
    creditLimit: {
      type: Number
    },
    tags: [{
      type: String,
      trim: true
    }],
    documents: [documentSchema],
    customFields: {
      type: Schema.Types.Mixed
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
customerSchema.index({ name: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ industry: 1 });
customerSchema.index({ organizationId: 1 });
customerSchema.index({ createdAt: -1 });

const Customer = mongoose.model<ICustomerDocument, CustomerModel>('Customer', customerSchema);

export default Customer;`;

// Write the new file
console.log('Writing new model file...');
fs.writeFileSync(targetFile, newModelContent);

console.log('Successfully rebuilt customer.model.ts');