import mongoose, { Document, Model, Schema } from 'mongoose';

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type ProjectPhase = 'discovery' | 'design' | 'implementation' | 'testing' | 'deployment' | 'maintenance';

export interface IProject {
  name: string;
  description?: string;
  customer: mongoose.Types.ObjectId;
  accountManager: mongoose.Types.ObjectId;
  status: ProjectStatus;
  phase: ProjectPhase;
  startDate: Date;
  targetCompletionDate?: Date;
  actualCompletionDate?: Date;
  budget?: number;
  costToDate?: number;
  objectives: string[];
  keyResults: {
    description: string;
    target: number;
    current: number;
    unit: string;
    isComplete: boolean;
  }[];
  businessValue: string;
  stakeholders: {
    user: mongoose.Types.ObjectId;
    role: string;
    isExternal: boolean;
  }[];
  documents: {
    title: string;
    fileUrl: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    category: 'proposal' | 'contract' | 'specification' | 'report' | 'other';
  }[];
  tags?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends IProject, Document {}

const projectSchema = new Schema<IProjectDocument>(
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
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    accountManager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
      default: 'planning',
    },
    phase: {
      type: String,
      enum: ['discovery', 'design', 'implementation', 'testing', 'deployment', 'maintenance'],
      default: 'discovery',
    },
    startDate: {
      type: Date,
      required: true,
    },
    targetCompletionDate: {
      type: Date,
    },
    actualCompletionDate: {
      type: Date,
    },
    budget: {
      type: Number,
    },
    costToDate: {
      type: Number,
      default: 0,
    },
    objectives: [{
      type: String,
      trim: true,
    }],
    keyResults: [{
      description: { type: String, required: true },
      target: { type: Number, required: true },
      current: { type: Number, default: 0 },
      unit: { type: String, required: true },
      isComplete: { type: Boolean, default: false },
    }],
    businessValue: {
      type: String,
      trim: true,
    },
    stakeholders: [{
      user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      role: { 
        type: String, 
        required: true 
      },
      isExternal: { 
        type: Boolean, 
        default: false 
      },
    }],
    documents: [{
      title: { 
        type: String, 
        required: true 
      },
      fileUrl: { 
        type: String, 
        required: true 
      },
      uploadedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      uploadedAt: { 
        type: Date, 
        default: Date.now 
      },
      category: { 
        type: String, 
        enum: ['proposal', 'contract', 'specification', 'report', 'other'],
        default: 'other'
      },
    }],
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
projectSchema.index({ customer: 1 });
projectSchema.index({ accountManager: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ phase: 1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ targetCompletionDate: 1 });
projectSchema.index({ 'stakeholders.user': 1 });

const Project = mongoose.model<IProjectDocument>('Project', projectSchema);

export default Project;