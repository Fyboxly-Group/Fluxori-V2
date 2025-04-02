import { Types, Model } from 'mongoose';
import { MongooseDocument } from '../utils/mongoose-document';

/**
 * Base interface for Inventory (raw data)
 */
export interface IInventory {
  warehouseId?: Types.ObjectId;
  type?: string;
  ref?: string;
  required: boolean;
  // _id is provided by MongooseDocument
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface for Inventory (includes Document methods)
 */
export interface IInventoryDocument extends MongooseDocument, IInventory {
  // Add document-specific methods here
}

/**
 * Model interface for Inventory (includes static methods)
 */
export interface IInventoryModel extends Model<IInventoryDocument> {
  // Add static model methods here
}
