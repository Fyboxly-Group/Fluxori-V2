import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Resource type definitions
 */
export type ResourceStatus = 'active' | 'inactive' | 'archived';

/**
 * Resource interface defining the shape of the data
 */
export interface IResource {
  name: string;
  description?: string;
  status: ResourceStatus;
  // Add specific resource fields here
  
  // Common fields
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Document interface for Mongoose
 */
export interface IResourceDocument extends IResource, Document {}

/**
 * Mongoose schema definition
 */
const resourceSchema = new Schema<IResourceDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    // Add schema fields for specific resource properties here
    
    // Common fields
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

/**
 * Indexes for efficient querying
 */
resourceSchema.index({ name: 1 });
resourceSchema.index({ status: 1 });
resourceSchema.index({ createdAt: -1 });

/**
 * Instance methods
 */
resourceSchema.methods.isActive = function(this: IResourceDocument): boolean {
  return this.status === 'active';
};

/**
 * Static methods
 */
interface ResourceModel extends Model<IResourceDocument> {
  findActive(): Promise<IResourceDocument[]>;
}

resourceSchema.statics.findActive = function(this: Model<IResourceDocument>): Promise<IResourceDocument[]> {
  return this.find({ status: 'active' });
};

/**
 * Create and export the model
 */
const Resource = mongoose.model<IResourceDocument, ResourceModel>('Resource', resourceSchema);

export default Resource;