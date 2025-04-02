import { Types, Model } from 'mongoose';
import { MongooseDocument } from '../utils/mongoose-document';

/**
 * Base interface for Purchase-order (raw data)
 */
export interface IPurchaseOrder {
  itemId?: Types.ObjectId;
  type?: string;
  ref?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface for Purchase-order (includes Document methods)
 */
export interface IPurchaseOrderDocument extends MongooseDocument, IPurchaseOrder {
  // Add document-specific methods here
}

/**
 * Model interface for Purchase-order (includes static methods)
 */
export interface IPurchaseOrderModel extends Model<IPurchaseOrderDocument> {
  // Add static model methods here
}
