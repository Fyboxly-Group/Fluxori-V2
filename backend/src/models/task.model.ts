import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITask {
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high';
  project?: mongoose.Types.ObjectId;
  milestone?: mongoose.Types.ObjectId;
  estimatedHours?: number;
  actualHours?: number;
  blockedBy?: mongoose.Types.ObjectId[];  // References to other tasks
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask, Document {}

const taskSchema = new Schema<ITaskDocument>(
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
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    milestone: {
      type: Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    estimatedHours: {
      type: Number,
    },
    actualHours: {
      type: Number,
      default: 0,
    },
    blockedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'Task',
    }],
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ milestone: 1 });

const Task = mongoose.model<ITaskDocument>('Task', taskSchema);

export default Task;