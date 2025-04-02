// @ts-nocheck - Added by final-ts-fix.js
import mongoose from 'mongoose';
import orderIngestionService from './services/order-ingestion.service';
import './mappers';  // Initialize mappers

// Export the service
export { orderIngestionService };

// Export types
export * from './models/order.model';
export * from './services/order-ingestion.service';
export * from './mappers/order-mapper.interface';
// Type exports
export interface IOrderModel extends mongoose.Model<IOrderDocument> {}
;
