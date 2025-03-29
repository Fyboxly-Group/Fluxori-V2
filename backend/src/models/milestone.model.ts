import mongoose, { Document, Model, Schema } from 'mongoose';

export type MilestoneStatus = 'not-started' | 'in-progress' | 'delayed' | 'completed' | 'cancelled';

export interface IMilestone {
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  status: MilestoneStatus;
  startDate: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  deliverables: string[];
  owner: mongoose.Types.ObjectId;
  reviewers: mongoose.Types.ObjectId[];
  approvalRequired: boolean;
  approvedBy?: mongoose.Types.ObjectId[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: mongoose.Types.ObjectId[]; // References to other milestones
  progress: number; // Percentage 0-100
  notes?: string;
  tags?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMilestoneDocument extends IMilestone, Document {}

const milestoneSchema = new Schema<IMilestoneDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'delayed', 'completed', 'cancelled'],
      default: 'not-started',
    },
    startDate: {
      type: Date,
      required: true,
    },
    targetCompletionDate: {
      type: Date,
      required: true,
    },
    actualCompletionDate: {
      type: Date,
    },
    deliverables: [{
      type: String,
      trim: true,
    }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    approvalRequired: {
      type: Boolean,
      default: false,
    },
    approvedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    dependencies: [{
      type: Schema.Types.ObjectId,
      ref: 'Milestone',
    }],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
    },
    tags: [{
      type: String,
      trim: true,
    }],
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
milestoneSchema.index({ project: 1 });
milestoneSchema.index({ status: 1 });
milestoneSchema.index({ owner: 1 });
milestoneSchema.index({ targetCompletionDate: 1 });
milestoneSchema.index({ priority: 1 });
milestoneSchema.index({ 'reviewers': 1 });
milestoneSchema.index({ 'approvedBy': 1 });

const Milestone = mongoose.model<IMilestoneDocument>('Milestone', milestoneSchema);

export default Milestone;