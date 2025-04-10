import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Base interface (raw data)
 */
export interface I{{ModelName}} {
  // Define model properties here
  name: string;
  description?: string;
  isActive: boolean;
  // Add more properties...
  
  // Common properties
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface (base + Document methods)
 */
export interface I{{ModelName}}Document extends Document, I{{ModelName}} {
  // Add document-specific methods here
}

/**
 * Model interface
 */
export interface I{{ModelName}}Model extends mongoose.Model<I{{ModelName}}Document> {
  // Add static model methods here
}

/**
 * Schema definition
 */
const {{modelName}}Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  // Add more fields...
}, { 
  timestamps: true,
  collection: '{{collectionName}}'
});

/**
 * Create and export the model
 */
export const {{ModelName}}Model = mongoose.model<I{{ModelName}}Document, I{{ModelName}}Model>(
  '{{ModelName}}',
  {{modelName}}Schema
);
