/**
 * Organization model schema definition
 * Implements the IOrganization interface with MongoDB schema
 */
import { Schema, model, Document, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { 
  IOrganization, 
  IBusinessDetails, 
  IContactInfo, 
  IBillingInfo, 
  IOrganizationSettings,
  IOrganizationIntegration
} from '../interfaces/organization.interface';
import { ID, createID } from '@/types/base.types';

// Document interface for methods
export interface IOrganizationDocument extends IOrganization, Document {
  // Document methods
  generateApiKey(): Promise<string>;
  getBasicInfo(): {
    id: ID;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    type: string;
  };
}

// Static model methods
export interface IOrganizationModel extends Model<IOrganizationDocument> {
  // Static methods
  findBySlug(slug: string): Promise<IOrganizationDocument | null>;
  findActiveById(id: string): Promise<IOrganizationDocument | null>;
  findByOwner(ownerId: string): Promise<IOrganizationDocument[]>;
}

// Business Details Schema
const BusinessDetailsSchema = new Schema<IBusinessDetails>(
  {
    taxId: {
      type: String,
    },
    registrationNumber: {
      type: String,
    },
    industryType: {
      type: String,
    },
    yearFounded: {
      type: Number,
    },
    website: {
      type: String,
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large', 'enterprise'],
    },
  },
  { _id: false }
);

// Contact Info Schema
const ContactInfoSchema = new Schema<IContactInfo>(
  {
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      postalCode: {
        type: String,
      },
      country: {
        type: String,
      },
    },
  },
  { _id: false }
);

// Billing Info Schema
const BillingInfoSchema = new Schema<IBillingInfo>(
  {
    plan: {
      type: String,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual'],
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'paypal'],
    },
    billingEmail: {
      type: String,
    },
    billingAddress: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      postalCode: {
        type: String,
      },
      country: {
        type: String,
      },
    },
  },
  { _id: false }
);

// Organization Settings Schema
const OrganizationSettingsSchema = new Schema<IOrganizationSettings>(
  {
    timezone: {
      type: String,
      default: 'UTC',
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    language: {
      type: String,
      default: 'en',
    },
    logoUrl: {
      type: String,
    },
    primaryColor: {
      type: String,
    },
    secondaryColor: {
      type: String,
    },
    brandingEnabled: {
      type: Boolean,
      default: false,
    },
    features: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  { _id: false }
);

// Organization Integration Schema
const OrganizationIntegrationSchema = new Schema<IOrganizationIntegration>(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Schema.Types.Mixed,
    },
    authData: {
      type: Schema.Types.Mixed,
    },
    lastSyncAt: {
      type: Date,
    },
  },
  { _id: false }
);

// Organization Schema
const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'suspended', 'archived'],
      default: 'active',
    },
    type: {
      type: String,
      required: true,
      enum: ['business', 'individual', 'non-profit', 'educational'],
      default: 'business',
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    parentOrganizationId: {
      type: String,
      index: true,
    },
    contact: {
      type: ContactInfoSchema,
      default: () => ({}),
      required: true,
    },
    business: {
      type: BusinessDetailsSchema,
    },
    billing: {
      type: BillingInfoSchema,
    },
    settings: {
      type: OrganizationSettingsSchema,
      default: () => ({}),
      required: true,
    },
    integrations: {
      type: [OrganizationIntegrationSchema],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
OrganizationSchema.index({ slug: 1 }, { unique: true });
OrganizationSchema.index({ ownerId: 1 });
OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ parentOrganizationId: 1 });

// Methods
OrganizationSchema.methods.generateApiKey = async function (
  this: IOrganizationDocument
): Promise<string> {
  // Generate an API key for the organization
  // This would use a secure method to generate keys
  return Promise.resolve(`org_${this._id}_${Date.now().toString(36)}`);
};

OrganizationSchema.methods.getBasicInfo = function (this: IOrganizationDocument) {
  return {
    id: createID(this._id.toString()),
    name: this.name,
    slug: this.slug,
    description: this.description,
    logoUrl: this.settings.logoUrl,
    type: this.type,
  };
};

// Static methods
OrganizationSchema.statics.findBySlug = async function (
  this: IOrganizationModel,
  slug: string
): Promise<IOrganizationDocument | null> {
  return this.findOne({ slug: slug.toLowerCase() });
};

OrganizationSchema.statics.findActiveById = async function (
  this: IOrganizationModel,
  id: string
): Promise<IOrganizationDocument | null> {
  return this.findOne({ _id: id, status: 'active' });
};

OrganizationSchema.statics.findByOwner = async function (
  this: IOrganizationModel,
  ownerId: string
): Promise<IOrganizationDocument[]> {
  return this.find({ ownerId, status: { $ne: 'archived' } });
};

// Create and export model
const OrganizationModel = model<IOrganizationDocument, IOrganizationModel>('Organization', OrganizationSchema);
export default OrganizationModel;