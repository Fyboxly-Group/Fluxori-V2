/**
 * Script to rebuild the activity.model.ts file
 * Fixing TypedSchema import issue
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/models/activity.model.ts');
const backupFile = path.join(__dirname, '../src/models/activity.model.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt model content
const newModelContent = `import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Static methods for Activity model
 */
export interface IActivityStatics {
  // Add static methods as needed
}

/**
 * Methods for Activity model
 */
export interface IActivityMethods {
  // Add methods as needed
}

export interface IActivity {
  type?: string;
  description: string;
  details?: Record<string, any>;
  entityType?: 'task' | 'user' | 'document' | 'system';
  entityId?: mongoose.Types.ObjectId;
  action?: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'other';
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
  userId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IActivityDocument extends IActivity, Document, IActivityMethods {}

/**
 * Type for Activity model with statics
 */
export type ActivityModel = Model<IActivityDocument> & IActivityStatics;

const activitySchema = new Schema<IActivityDocument, ActivityModel, IActivityMethods>(
  {
    type: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    entityType: {
      type: String,
      enum: ['task', 'user', 'document', 'system'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: 'entityType',
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'login', 'logout', 'other'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed'],
      default: 'completed',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for efficient querying
activitySchema.index({ userId: 1 });
activitySchema.index({ entityId: 1, entityType: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ organizationId: 1 });
activitySchema.index({ type: 1 });

const Activity = mongoose.model<IActivityDocument, ActivityModel>('Activity', activitySchema);

export default Activity;`;

// Write the new file
console.log('Writing new activity model file...');
fs.writeFileSync(targetFile, newModelContent);

console.log('Successfully rebuilt activity.model.ts');