import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISupplier {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentTerms?: string;
  leadTime?: number; // Days
  minimumOrderValue?: number;
  notes?: string;
  website?: string;
  isActive: boolean;
  categories: string[];
  rating?: number; // 1-5
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupplierDocument extends ISupplier, Document {}

const supplierSchema = new Schema<ISupplierDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
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
      required: true,
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    paymentTerms: {
      type: String,
    },
    leadTime: {
      type: Number,
      min: 0,
    },
    minimumOrderValue: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
    website: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    categories: [{
      type: String,
      trim: true,
    }],
    rating: {
      type: Number,
      min: 1,
      max: 5,
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
supplierSchema.index({ name: 1 });
supplierSchema.index({ isActive: 1 });
supplierSchema.index({ 'address.country': 1 });
supplierSchema.index({ categories: 1 });

const Supplier = mongoose.model<ISupplierDocument>('Supplier', supplierSchema);

export default Supplier;