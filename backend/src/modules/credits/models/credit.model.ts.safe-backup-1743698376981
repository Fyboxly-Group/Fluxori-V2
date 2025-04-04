import mongoose, { Document, Model, Schema } from 'mongoose';

export enum CreditTransactionType {
  ALLOCATION = 'allocation',  // Monthly subscription allocation
  PURCHASE = 'purchase',      // Additional credit purchase
  USAGE = 'usage'             // Credit usage for feature/service
}

export enum SubscriptionTier {
  EXPLORER = 'explorer',  // 400 credits/month
  GROWTH = 'growth',      // 2000 credits/month
  PRO = 'pro',            // 7000 credits/month
  ENTERPRISE = 'enterprise' // 20000 credits/month
}

// Monthly credit allocations by tier
export const MONTHLY_CREDITS: Record<SubscriptionTier, number> = {
  [SubscriptionTier.EXPLORER]: 400,
  [SubscriptionTier.GROWTH]: 2000,
  [SubscriptionTier.PRO]: 7000,
  [SubscriptionTier.ENTERPRISE]: 20000
};

// Credit balance interface
export interface ICreditBalance {
  userId: string;          // Optional: If balance is for user
  organizationId?: string; // Optional: If balance is for organization
  balance: number;         // Current balance
  tier: SubscriptionTier;  // Subscription tier
  lastUpdated: Date;       // Last updated timestamp
}

export interface ICreditBalanceDocument extends ICreditBalance, Document {}

// Credit transaction interface
export interface ICreditTransaction {
  userId: string;                      // Optional: If transaction for user
  organizationId?: string;             // Optional: If transaction for organization
  timestamp: Date;                     // Transaction timestamp
  amount: number;                      // Amount (positive = add, negative = deduct)
  type: CreditTransactionType;         // Transaction type
  description: string;                 // Transaction description
  newBalance: number;                  // Balance after transaction
  referenceId?: string;                // Optional reference ID (order ID, feature ID, etc.)
}

export interface ICreditTransactionDocument extends ICreditTransaction, Document {}

// Credit balance schema
const creditBalanceSchema = new Schema<ICreditBalanceDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  organizationId: {
    type: String,
    index: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  tier: {
    type: String,
    enum: Object.values(SubscriptionTier),
    required: true,
    default: SubscriptionTier.EXPLORER
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to ensure a user or organization has only one credit balance
creditBalanceSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

// Credit transaction schema
const creditTransactionSchema = new Schema<ICreditTransactionDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  organizationId: {
    type: String,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(CreditTransactionType),
    required: true
  },
  description: {
    type: String,
    required: true
  },
  newBalance: {
    type: Number,
    required: true,
    min: 0
  },
  referenceId: {
    type: String
  }
}, { timestamps: true });

// Create models
export const CreditBalance = mongoose.model<ICreditBalanceDocument>('CreditBalance', creditBalanceSchema);
export const CreditTransaction = mongoose.model<ICreditTransactionDocument>('CreditTransaction', creditTransactionSchema);