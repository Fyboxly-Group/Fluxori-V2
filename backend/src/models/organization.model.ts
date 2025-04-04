import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Organization subscription tier
 */
export enum OrganizationTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

/**
 * Organization status
 */
export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

/**
 * Interface for the addresses in the organization
 */
export interface IOrganizationAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  type?: 'billing' | 'shipping' | 'headquarters' | 'warehouse';
}

/**
 * Interface for billing details
 */
export interface IBillingDetails {
  planId?: string;
  subscriptionId?: string;
  customerId?: string;
  tier: OrganizationTier;
  features?: Record<string, boolean>;
  limits?: Record<string, number>;
  billingCycle?: 'monthly' | 'yearly';
  nextBillingDate?: Date;
  lastPaymentDate?: Date;
  paymentMethod?: {
    type: 'card' | 'bank' | 'invoice';
    last4?: string;
    expiry?: string;
  };
}

/**
 * Interface for contact person in the organization
 */
export interface IContactPerson {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}

/**
 * Interface for Organization model
 */
export interface IOrganization {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  addresses?: IOrganizationAddress[];
  defaultWarehouseId?: mongoose.Types.ObjectId;
  mainContactPerson?: IContactPerson;
  contactPersons?: IContactPerson[];
  industry?: string;
  employeeCount?: number;
  foundedYear?: number;
  taxId?: string;
  registrationNumber?: string;
  vatNumber?: string;
  currencyCode?: string;
  timeZone?: string;
  locale?: string;
  status: OrganizationStatus;
  billingDetails?: IBillingDetails;
  metadata?: Record<string, any>;
  settings?: Record<string, any>;
  features?: Record<string, boolean>;
  creditBalance?: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Document interface for Organization with methods
 */
export interface IOrganizationDocument extends IOrganization, Document {
  /**
   * Check if the organization has a specific feature enabled
   */
  hasFeature(feature: string): boolean;
  
  /**
   * Get the subscription tier name
   */
  getTierName(): string;
  
  /**
   * Add credits to the organization's balance
   */
  addCredits(amount: number): Promise<IOrganizationDocument>;
  
  /**
   * Deduct credits from the organization's balance
   */
  deductCredits(amount: number): Promise<IOrganizationDocument>;
  
  /**
   * Generate a unique slug from the organization name
   */
  generateSlug(): Promise<string>;
}

/**
 * Static methods for Organization model
 */
export interface IOrganizationStatics {
  /**
   * Find an organization by its slug
   */
  findBySlug(slug: string): Promise<IOrganizationDocument | null>;
  
  /**
   * Get all active organizations
   */
  findActive(): Promise<IOrganizationDocument[]>;
  
  /**
   * Create a new organization with defaults
   */
  createWithDefaults(data: Partial<IOrganization>, userId: string): Promise<IOrganizationDocument>;
}

/**
 * Type for Organization model with statics
 */
export type OrganizationModel = Model<IOrganizationDocument> & IOrganizationStatics;

// Address sub-schema
const organizationAddressSchema = new Schema<IOrganizationAddress>(
  {
    line1: {
      type: String,
      required: true,
      trim: true,
    },
    line2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['billing', 'shipping', 'headquarters', 'warehouse'],
      default: 'billing',
    },
  },
  { _id: false }
);

// Contact person sub-schema
const contactPersonSchema = new Schema<IContactPerson>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Billing details sub-schema
const billingDetailsSchema = new Schema<IBillingDetails>(
  {
    planId: {
      type: String,
      trim: true,
    },
    subscriptionId: {
      type: String,
      trim: true,
    },
    customerId: {
      type: String,
      trim: true,
    },
    tier: {
      type: String,
      enum: Object.values(OrganizationTier),
      default: OrganizationTier.FREE,
    },
    features: {
      type: Schema.Types.Mixed,
    },
    limits: {
      type: Schema.Types.Mixed,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    nextBillingDate: {
      type: Date,
    },
    lastPaymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: {
        type: String,
        enum: ['card', 'bank', 'invoice'],
      },
      last4: String,
      expiry: String,
    },
  },
  { _id: false }
);

// Main organization schema
const organizationSchema = new Schema<IOrganizationDocument, OrganizationModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    addresses: [organizationAddressSchema],
    defaultWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    mainContactPerson: contactPersonSchema,
    contactPersons: [contactPersonSchema],
    industry: {
      type: String,
      trim: true,
    },
    employeeCount: {
      type: Number,
      min: 0,
    },
    foundedYear: {
      type: Number,
    },
    taxId: {
      type: String,
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    vatNumber: {
      type: String,
      trim: true,
    },
    currencyCode: {
      type: String,
      trim: true,
      default: 'USD',
    },
    timeZone: {
      type: String,
      trim: true,
      default: 'UTC',
    },
    locale: {
      type: String,
      trim: true,
      default: 'en-US',
    },
    status: {
      type: String,
      enum: Object.values(OrganizationStatus),
      default: OrganizationStatus.ACTIVE,
    },
    billingDetails: billingDetailsSchema,
    metadata: {
      type: Schema.Types.Mixed,
    },
    settings: {
      type: Schema.Types.Mixed,
    },
    features: {
      type: Schema.Types.Mixed,
      default: {},
    },
    creditBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
organizationSchema.index({ name: 1 });
organizationSchema.index({ slug: 1 }, { unique: true, sparse: true });
organizationSchema.index({ status: 1 });
organizationSchema.index({ createdBy: 1 });
organizationSchema.index({ 'billingDetails.tier': 1 });
organizationSchema.index({ 'mainContactPerson.email': 1 });

// Instance methods

/**
 * Check if the organization has a specific feature enabled
 */
organizationSchema.methods.hasFeature = function(feature: string): boolean {
  if (!this.features) return false;
  return Boolean(this.features[feature]);
};

/**
 * Get the subscription tier name
 */
organizationSchema.methods.getTierName = function(): string {
  return this.billingDetails?.tier || OrganizationTier.FREE;
};

/**
 * Add credits to the organization's balance
 */
organizationSchema.methods.addCredits = async function(amount: number): Promise<IOrganizationDocument> {
  this.creditBalance = (this.creditBalance || 0) + amount;
  return this.save();
};

/**
 * Deduct credits from the organization's balance
 */
organizationSchema.methods.deductCredits = async function(amount: number): Promise<IOrganizationDocument> {
  const newBalance = (this.creditBalance || 0) - amount;
  if (newBalance < 0) {
    throw new Error('Insufficient credit balance');
  }
  this.creditBalance = newBalance;
  return this.save();
};

/**
 * Generate a unique slug from the organization name
 */
organizationSchema.methods.generateSlug = async function(): Promise<string> {
  const baseSlug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  let slug = baseSlug;
  let counter = 0;
  let isUnique = false;
  
  while (!isUnique) {
    // Check if slug already exists (excluding this document)
    const existing = await (this.constructor as OrganizationModel).findOne({ 
      slug, 
      _id: { $ne: this._id } 
    });
    
    if (!existing) {
      isUnique = true;
    } else {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }
  
  this.slug = slug;
  return slug;
};

// Static methods

/**
 * Find an organization by its slug
 */
organizationSchema.statics.findBySlug = async function(slug: string): Promise<IOrganizationDocument | null> {
  return this.findOne({ slug, status: OrganizationStatus.ACTIVE });
};

/**
 * Get all active organizations
 */
organizationSchema.statics.findActive = async function(): Promise<IOrganizationDocument[]> {
  return this.find({ status: OrganizationStatus.ACTIVE });
};

/**
 * Create a new organization with defaults
 */
organizationSchema.statics.createWithDefaults = async function(
  data: Partial<IOrganization>,
  userId: string
): Promise<IOrganizationDocument> {
  const org = new this({
    ...data,
    createdBy: new mongoose.Types.ObjectId(userId),
    billingDetails: {
      tier: OrganizationTier.FREE,
      ...data.billingDetails
    },
    status: data.status || OrganizationStatus.ACTIVE,
    features: {
      basicReporting: true,
      inventoryManagement: true,
      ...data.features
    }
  });
  
  // Generate a slug if name is provided and slug isn't
  if (org.name && !org.slug) {
    await org.generateSlug();
  }
  
  return org.save();
};

// Middleware

// Pre-save hook to ensure main contact is also in contact persons array
organizationSchema.pre('save', function(next) {
  if (this.mainContactPerson && this.isModified('mainContactPerson')) {
    this.mainContactPerson.isPrimary = true;
    
    // Make sure mainContactPerson is in the contactPersons array
    if (!this.contactPersons) {
      this.contactPersons = [this.mainContactPerson];
    } else {
      // Remove any existing primary contacts
      this.contactPersons = this.contactPersons.map(contact => ({
        ...contact,
        isPrimary: false
      }));
      
      // Find if the main contact already exists by email
      const mainContactIndex = this.contactPersons.findIndex(
        c => c.email === this.mainContactPerson?.email
      );
      
      if (mainContactIndex >= 0) {
        // Update existing contact
        this.contactPersons[mainContactIndex] = {
          ...this.contactPersons[mainContactIndex],
          ...this.mainContactPerson,
          isPrimary: true
        };
      } else {
        // Add main contact to the array
        this.contactPersons.push(this.mainContactPerson);
      }
    }
  }
  
  next();
});

// Create and export the model
const Organization = mongoose.model<IOrganizationDocument, OrganizationModel>(
  'Organization',
  organizationSchema
);

export default Organization;