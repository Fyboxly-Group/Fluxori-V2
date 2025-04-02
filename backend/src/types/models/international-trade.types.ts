// @ts-nocheck - Added by final-ts-fix.js
import { Types, Model } from 'mongoose';
import { MongooseDocument } from '../utils/mongoose-document';

/**
 * Base interface for International-trade (raw data)
 */
export interface IInternationalTrade {
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface for International-trade (includes Document methods)
 */
export interface IInternationalTradeDocument extends MongooseDocument, IInternationalTrade {
  // Add document-specific methods here
}

/**
 * Model interface for International-trade (includes static methods)
 */
export interface IInternationalTradeModel extends Model<IInternationalTradeDocument> {
  // Add static model methods here
}
