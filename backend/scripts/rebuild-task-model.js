/**
 * Script to rebuild the task.model.ts file
 * Fixing syntax errors and implementing proper TypeScript
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/models/task.model.ts');
const backupFile = path.join(__dirname, '../src/models/task.model.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the rebuilt model content
const newModelContent = `import mongoose, { Document, Model, Schema } from 'mongoose';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

/**
 * Static methods for Task model
 */
export interface ITaskStatics {
  // Add static methods as needed
}

/**
 * Methods for Task model
 */
export interface ITaskMethods {
  // Add methods as needed
}

export interface ITask {
  title: string;
  description?: string;
  project?: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
  reporter: mongoose.Types.ObjectId;
  status: TaskStatus | string;
  priority: TaskPriority | string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  attachments?: {
    name: string;
    fileUrl: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[];
  comments?: {
    text: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  subtasks?: {
    title: string;
    completed: boolean;
    completedAt?: Date;
    completedBy?: mongoose.Types.ObjectId;
  }[];
  dependencies?: mongoose.Types.ObjectId[];
  completedAt?: Date;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask, Document, ITaskMethods {}

/**
 * Type for Task model with statics
 */
export type TaskModel = Model<ITaskDocument> & ITaskStatics;

const attachmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  }
});

const commentSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const subtaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const taskSchema = new Schema<ITaskDocument, TaskModel, ITaskMethods>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project'
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM
    },
    dueDate: {
      type: Date
    },
    estimatedHours: {
      type: Number,
      min: 0
    },
    actualHours: {
      type: Number,
      min: 0
    },
    tags: [{
      type: String,
      trim: true
    }],
    attachments: [attachmentSchema],
    comments: [commentSchema],
    subtasks: [subtaskSchema],
    dependencies: [{
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }],
    completedAt: {
      type: Date
    },
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
taskSchema.index({ project: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ organizationId: 1 });
taskSchema.index({ 'tags': 1 });

// Pre-save hook to set completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === TaskStatus.COMPLETED && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

const Task = mongoose.model<ITaskDocument, TaskModel>('Task', taskSchema);

export default Task;`;

// Write the new file
console.log('Writing new model file...');
fs.writeFileSync(targetFile, newModelContent);

console.log('Successfully rebuilt task.model.ts');