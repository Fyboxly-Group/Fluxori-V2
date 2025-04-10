import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IActivity {
  description: string;
  entityType: 'task' | 'user' | 'document' | 'system';
  entityId?: mongoose.Types.ObjectId;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'other';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  userId: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IActivityDocument extends IActivity, Document {}

const activitySchema = new Schema<IActivityDocument>(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['task', 'user', 'document', 'system'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: 'entityType',
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'login', 'logout', 'other'],
      required: true,
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

const Activity = mongoose.model<IActivityDocument>('Activity', activitySchema);

export default Activity;