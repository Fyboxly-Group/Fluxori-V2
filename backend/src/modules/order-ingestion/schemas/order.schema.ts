import Joi from 'joi';
import { OrderStatus } from '../models/order.model';

/**
 * Schema for order ingestion options
 */
export const OrderIngestionOptionsSchema = Joi.object({
  skipExisting: Joi.boolean().default(false),
  createXeroInvoices: Joi.boolean().default(true),
  updateExisting: Joi.boolean().default(true),
  sinceDate: Joi.date(),
  marketplaceSpecific: Joi.object().optional()
});

/**
 * Schema for order query parameters
 */
export const OrderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  status: Joi.string().valid(...Object.values(OrderStatus)),
  marketplaceName: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date()
});

/**
 * Schema for updating order status
 */
export const UpdateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      'new',
      'processing',
      'shipped',
      'delivered',
      'canceled',
      'on_hold',
      'returned',
      'refunded',
      'completed'
    )
    .required()
});

/**
 * Schema for order ID parameter
 */
export const OrderIdParamSchema = Joi.object({
  orderId: Joi.string().required()
});

/**
 * Schema for marketplace ID parameter
 */
export const MarketplaceIdParamSchema = Joi.object({
  marketplaceId: Joi.string().required()
});