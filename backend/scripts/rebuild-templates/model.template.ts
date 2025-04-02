import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Enum types (if needed)
 */
export enum ResourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

/**
 * Interface for Resource model
 */
export interface IResource {
  name: string;
  description?: string;
  status: ResourceStatus;
  category: string;
  metadata?: Record<string, any>;
  owner: mongoose.Types.ObjectId;
  tags?: string[];
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Document interface for type safety with Mongoose
 */
export interface IResourceDocument extends IResource, Document {}

/**
 * Methods for Resource model (if needed)
 */
export interface IResourceMethods {
  // Add instance methods here
}

/**
 * Static methods for Resource model (if needed)
 */
export interface IResourceStatics {
  // Add static methods here
}

/**
 * Type for Resource model with statics
 */
export type ResourceModel = Model<IResourceDocument, {}, IResourceMethods> & IResourceStatics;

/**
 * Schema for the Resource model
 */
const ResourceSchema = new Schema<IResourceDocument, ResourceModel, IResourceMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(ResourceStatus),
      default: ResourceStatus.ACTIVE
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    metadata: {
      type: Schema.Types.Mixed
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
ResourceSchema.index({ name: 1 });
ResourceSchema.index({ status: 1 });
ResourceSchema.index({ category: 1 });
ResourceSchema.index({ owner: 1 });
ResourceSchema.index({ organizationId: 1 });
ResourceSchema.index({ 'tags': 1 });

// Static methods (if any)
// ResourceSchema.statics.findByStatus = function(status: ResourceStatus) {
//   return this.find({ status });
// };

// Instance methods (if any)
// ResourceSchema.methods.isActive = function() {
//   return this.status === ResourceStatus.ACTIVE;
// };

// Middleware (if needed)
// ResourceSchema.pre('save', function(next) {
//   // Do something before saving
//   next();
// });

/**
 * Export the Resource model
 */
const Resource = mongoose.model<IResourceDocument, ResourceModel>('Resource', ResourceSchema);

export default Resource;