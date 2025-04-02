import { Types, Model } from 'mongoose';
import { MongooseDocument } from '../utils/mongoose-document';

/**
 * Base interface for Shipment (raw data)
 */
export interface IShipment {
  name?: string;
  type?: string;
  required?: boolean;
  // _id is provided by MongooseDocument
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface for Shipment (includes Document methods)
 */
export interface IShipmentDocument extends MongooseDocument, IShipment {
  // Add document-specific methods here
}

/**
 * Model interface for Shipment (includes static methods)
 */
export interface IShipmentModel extends Model<IShipmentDocument> {
  // Add static model methods here
}
