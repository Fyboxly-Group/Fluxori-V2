import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Type definitions for EntityName 
 */
export type EntityNameStatus = 'active' | 'inactive' | 'archived';

/**
 * EntityName interface defining the shape of the data
 */
export interface IEntityName {
  name: string;
  description?: string;
  status: EntityNameStatus;
  // Add specific EntityName fields here
  
  // Common fields for all entities
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Document interface with instance methods
 */
export interface IEntityNameDocument extends IEntityName, Document {
  // Document methods
  isActive(): boolean;
  toPublicJSON(): Record<string, any>;
}

/**
 * Model interface with static methods
 */
export interface IEntityNameModel extends Model<IEntityNameDocument> {
  // Static methods
  findActive(organizationId: string): Promise<IEntityNameDocument[]>;
  findByOrganization(organizationId: string): Promise<IEntityNameDocument[]>;
  createWithDefaults(data: Partial<IEntityName>, userId: string, organizationId: string): Promise<IEntityNameDocument>;
}

/**
 * Mongoose schema definition
 */
const entityNameSchema = new Schema<IEntityNameDocument>(
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
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
entityNameSchema.index({ name: 1, organizationId: 1 }, { unique: true });
entityNameSchema.index({ status: 1 });
entityNameSchema.index({ createdAt: -1 });

/**
 * Instance methods
 */
entityNameSchema.methods.isActive = function(this: IEntityNameDocument): boolean {
  return this.status === 'active';
};

entityNameSchema.methods.toPublicJSON = function(this: IEntityNameDocument): Record<string, any> {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    name: obj.name,
    description: obj.description,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    metadata: obj.metadata || {},
    // Add entity-specific properties here
  };
};

/**
 * Static methods
 */
entityNameSchema.statics.findActive = function(
  this: IEntityNameModel,
  organizationId: string
): Promise<IEntityNameDocument[]> {
  return this.find({ 
    organizationId: new mongoose.Types.ObjectId(organizationId),
    status: 'active' 
  });
};

entityNameSchema.statics.findByOrganization = function(
  this: IEntityNameModel,
  organizationId: string
): Promise<IEntityNameDocument[]> {
  return this.find({ 
    organizationId: new mongoose.Types.ObjectId(organizationId)
  });
};

entityNameSchema.statics.createWithDefaults = async function(
  this: IEntityNameModel,
  data: Partial<IEntityName>,
  userId: string,
  organizationId: string
): Promise<IEntityNameDocument> {
  const entity = new this({
    ...data,
    createdBy: new mongoose.Types.ObjectId(userId),
    organizationId: new mongoose.Types.ObjectId(organizationId),
    status: data.status || 'active',
  });
  
  return entity.save();
};

/**
 * Create and export the model
 */
const EntityName = mongoose.model<IEntityNameDocument, IEntityNameModel>(
  'EntityName', 
  entityNameSchema
);

export default EntityName;