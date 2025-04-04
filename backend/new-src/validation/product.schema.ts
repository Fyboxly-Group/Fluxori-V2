/**
 * Product validation schemas
 */
import Joi from 'joi';
import { ProductStatus } from '@/domain/interfaces/product.interface';

/**
 * Product image validation schema
 */
const productImageSchema = Joi.object({
  url: Joi.string().uri().required(),
  alt: Joi.string().allow('', null),
  position: Joi.number().integer().min(0).default(0),
  isDefault: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string()).default([])
});

/**
 * Product price validation schema
 */
const productPriceSchema = Joi.object({
  currency: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  compareAt: Joi.number().min(0),
  cost: Joi.number().min(0),
  wholesale: Joi.number().min(0),
  special: Joi.object({
    amount: Joi.number().min(0).required(),
    startsAt: Joi.date(),
    endsAt: Joi.date().greater(Joi.ref('startsAt'))
  })
});

/**
 * Product attribute value validation schema
 */
const productAttributeValueSchema = Joi.object({
  attributeId: Joi.string().required(),
  attributeCode: Joi.string().required(),
  value: Joi.alternatives().try(
    Joi.string(),
    Joi.number(),
    Joi.boolean(),
    Joi.date(),
    Joi.array().items(Joi.string())
  ).required()
});

/**
 * Product dimension validation schema
 */
const productDimensionSchema = Joi.object({
  length: Joi.number().min(0),
  width: Joi.number().min(0),
  height: Joi.number().min(0),
  weight: Joi.number().min(0),
  unit: Joi.string().valid('cm', 'in', 'mm').default('cm'),
  weightUnit: Joi.string().valid('kg', 'g', 'lb', 'oz').default('kg')
});

/**
 * Product inventory validation schema
 */
const productInventorySchema = Joi.object({
  trackInventory: Joi.boolean().default(true),
  quantity: Joi.number().integer().min(0).when('trackInventory', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  lowStockThreshold: Joi.number().integer().min(0),
  sku: Joi.string(),
  barcode: Joi.string(),
  allowBackorders: Joi.boolean().default(false),
  backorderLimit: Joi.number().integer().min(0).when('allowBackorders', {
    is: true,
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  })
});

/**
 * Product variant inventory validation schema
 */
const productVariantInventorySchema = Joi.object({
  trackInventory: Joi.boolean().default(true),
  quantity: Joi.number().integer().min(0).when('trackInventory', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  lowStockThreshold: Joi.number().integer().min(0),
  sku: Joi.string(),
  barcode: Joi.string()
});

/**
 * Product SEO validation schema
 */
const productSeoSchema = Joi.object({
  title: Joi.string().max(100),
  description: Joi.string().max(250),
  keywords: Joi.array().items(Joi.string().max(50))
});

/**
 * Product manufacturer validation schema
 */
const productManufacturerSchema = Joi.object({
  name: Joi.string(),
  partNumber: Joi.string()
});

/**
 * Product variant validation schema
 */
export const productVariantValidationSchema = Joi.object({
  productId: Joi.string(),
  sku: Joi.string().required(),
  barcode: Joi.string(),
  title: Joi.string().min(1).max(200).required(),
  status: Joi.string().valid('active', 'inactive', 'draft', 'archived', 'discontinued').default('draft'),
  prices: Joi.object().pattern(
    Joi.string(), 
    productPriceSchema
  ).min(1).required(),
  inventory: productVariantInventorySchema.required(),
  attributes: Joi.array().items(productAttributeValueSchema),
  dimensions: productDimensionSchema,
  images: Joi.array().items(productImageSchema),
  metadata: Joi.object()
});

/**
 * Product validation schema
 */
export const productValidationSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/),
  description: Joi.string(),
  status: Joi.string().valid('active', 'inactive', 'draft', 'archived', 'discontinued').default('draft'),
  type: Joi.string().valid('simple', 'variable', 'grouped', 'bundle').default('simple'),
  sku: Joi.string().when('type', {
    is: 'simple',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  barcode: Joi.string(),
  categories: Joi.array().items(Joi.string()).default([]),
  tags: Joi.array().items(Joi.string()),
  attributes: Joi.array().items(productAttributeValueSchema).default([]),
  prices: Joi.object().pattern(
    Joi.string(), 
    productPriceSchema
  ).when('type', {
    is: 'simple',
    then: Joi.required().min(1),
    otherwise: Joi.optional()
  }),
  taxClass: Joi.string(),
  inventory: productInventorySchema.when('type', {
    is: 'simple',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  dimensions: productDimensionSchema,
  shippingClass: Joi.string(),
  images: Joi.array().items(productImageSchema).min(1).required(),
  variants: Joi.array().items(productVariantValidationSchema).when('type', {
    is: 'variable',
    then: Joi.min(1),
    otherwise: Joi.forbidden()
  }),
  relatedProducts: Joi.array().items(Joi.string()),
  crossSellProducts: Joi.array().items(Joi.string()),
  upSellProducts: Joi.array().items(Joi.string()),
  seo: productSeoSchema,
  manufacturer: productManufacturerSchema,
  metadata: Joi.object()
});

/**
 * Product status update validation schema
 */
export const productStatusUpdateSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ProductStatus)).required()
});