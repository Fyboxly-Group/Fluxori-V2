import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICustomer {
  companyName: string;
  industry: string;
  website?: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  annualRevenue?: number;
  logo?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
  secondaryContacts?: {
    name: string;
    title: string;
    email: string;
    phone?: string;
  }[];
  accountManager: mongoose.Types.ObjectId;
  customerSince: Date;
  contractValue?: number;
  contractRenewalDate?: Date;
  nps?: number;
  status: 'active' | 'inactive' | 'prospect';
  tags?: string[];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerDocument extends ICustomer, Document {}

const customerSchema = new Schema<ICustomerDocument>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large', 'enterprise'],
      required: true,
    },
    annualRevenue: {
      type: Number,
    },
    logo: {
      type: String,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    primaryContact: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    secondaryContacts: [{
      name: { type: String, required: true },
      title: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    }],
    accountManager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerSince: {
      type: Date,
      required: true,
      default: Date.now,
    },
    contractValue: {
      type: Number,
    },
    contractRenewalDate: {
      type: Date,
    },
    nps: {
      type: Number,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'prospect'],
      default: 'active',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    notes: {
      type: String,
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
customerSchema.index({ companyName: 1 });
customerSchema.index({ industry: 1 });
customerSchema.index({ size: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ accountManager: 1 });
customerSchema.index({ 'primaryContact.email': 1 });
customerSchema.index({ contractRenewalDate: 1 });

const Customer = mongoose.model<ICustomerDocument>('Customer', customerSchema);

export default Customer;