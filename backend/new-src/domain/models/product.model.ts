/**
 * Product model schema definition
 * Implements the IProduct interface with MongoDB schema
 */
import { Schema, model, Document, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { 
  IProduct, 
  IProductVariant, 
  IProductPrice,
  IProductDimension,
  IProductImage,
  IProductAttributeValue
} from '../interfaces/product.interface';
import { ID, createID } from '@/types/base.types';

// Document interface for methods
export interface IProductDocument extends IProduct, Document {
  // Document methods
  getActiveVariants(): Promise<IProductVariant[]>;
  getDefaultPrice(currency: string): IProductPrice | undefined;
}

// Document interface for product variant
export interface IProductVariantDocument extends IProductVariant, Document {
  getDefaultPrice(currency: string): IProductPrice | undefined;
}

// Static model methods
export interface IProductModel extends Model<IProductDocument> {
  // Static methods
  findBySlug(slug: string, organizationId: string): Promise<IProductDocument | null>;
  findBySku(sku: string, organizationId: string): Promise<IProductDocument | null>;
  findByCategory(categoryId: string, organizationId: string): Promise<IProductDocument[]>;
}

// Product Price Schema
const ProductPriceSchema = new Schema<IProductPrice>(
  {
    currency: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    compareAt: {
      type: Number,
    },
    cost: {
      type: Number,
    },
    wholesale: {
      type: Number,
    },
    special: {
      amount: {
        type: Number,
      },
      startsAt: {
        type: Date,
      },
      endsAt: {
        type: Date,
      },
    },
  },
  { _id: false }
);

// Product Dimension Schema
const ProductDimensionSchema = new Schema<IProductDimension>(
  {
    length: {
      type: Number,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    unit: {
      type: String,
      enum: ['cm', 'in', 'mm'],
      default: 'cm',
    },
    weightUnit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg',
    },
  },
  { _id: false }
);

// Product Image Schema
const ProductImageSchema = new Schema<IProductImage>(
  {
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
    },
    position: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    }, 
  }
);

// Product Attribute Value Schema
const ProductAttributeValueSchema = new Schema<IProductAttributeValue>(
  {
    attributeId: {
      type: String,
      required: true,
    },
    attributeCode: {
      type: String,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

// Product Variant Schema
const ProductVariantSchema = new Schema<IProductVariantDocument>(
  {
    productId: {
      type: String,
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      index: true,
    },
    barcode: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'draft', 'archived', 'discontinued'],
      default: 'active',
    },
    prices: {
      type: Map,
      of: ProductPriceSchema,
      default: {},
    },
    inventory: {
      trackInventory: {
        type: Boolean,
        default: true,
      },
      quantity: {
        type: Number,
      },
      lowStockThreshold: {
        type: Number,
      },
      sku: {
        type: String,
      },
      barcode: {
        type: String,
      },
    },
    attributes: {
      type: [ProductAttributeValueSchema],
      default: [],
    },
    dimensions: {
      type: ProductDimensionSchema,
    },
    images: {
      type: [ProductImageSchema],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Product Schema
const ProductSchema = new Schema<IProductDocument>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'draft', 'archived', 'discontinued'],
      default: 'active',
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['simple', 'variable', 'grouped', 'bundle'],
      default: 'simple',
    },
    sku: {
      type: String,
      index: true,
    },
    barcode: {
      type: String,
    },
    categories: {
      type: [String],
      default: [],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    attributes: {
      type: [ProductAttributeValueSchema],
      default: [],
    },
    prices: {
      type: Map,
      of: ProductPriceSchema,
      default: {},
    },
    taxClass: {
      type: String,
    },
    inventory: {
      trackInventory: {
        type: Boolean,
        default: true,
      },
      quantity: {
        type: Number,
      },
      lowStockThreshold: {
        type: Number,
      },
      sku: {
        type: String,
      },
      barcode: {
        type: String,
      },
      allowBackorders: {
        type: Boolean,
        default: false,
      },
      backorderLimit: {
        type: Number,
      },
    },
    dimensions: {
      type: ProductDimensionSchema,
    },
    shippingClass: {
      type: String,
    },
    images: {
      type: [ProductImageSchema],
      default: [],
    },
    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    relatedProducts: {
      type: [String],
      default: [],
    },
    crossSellProducts: {
      type: [String],
      default: [],
    },
    upSellProducts: {
      type: [String],
      default: [],
    },
    seo: {
      title: {
        type: String,
      },
      description: {
        type: String,
      },
      keywords: {
        type: [String],
        default: [],
      },
    },
    manufacturer: {
      name: {
        type: String,
      },
      partNumber: {
        type: String,
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = createID(ret._id.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
ProductSchema.index({ slug: 1, organizationId: 1 }, { unique: true });
ProductSchema.index({ sku: 1, organizationId: 1 }, { unique: true, sparse: true });
ProductSchema.index({ organizationId: 1, status: 1 });
ProductSchema.index({ organizationId: 1, categories: 1 });
ProductSchema.index({ organizationId: 1, tags: 1 });
ProductSchema.index({ 'variants.sku': 1 });

// Methods
ProductSchema.methods.getActiveVariants = async function (
  this: IProductDocument
): Promise<IProductVariant[]> {
  // Filter variants by status
  if (!this.variants) return [];
  return this.variants.filter(variant => variant.status === 'active');
};

ProductSchema.methods.getDefaultPrice = function (
  this: IProductDocument,
  currency: string
): IProductPrice | undefined {
  // Get price by currency
  const priceMap = this.prices as Map<string, IProductPrice>;
  if (!priceMap || !priceMap.get) return undefined;
  return priceMap.get(currency);
};

// Define method for variant schema
ProductVariantSchema.methods.getDefaultPrice = function (
  this: IProductVariantDocument,
  currency: string
): IProductPrice | undefined {
  // Get price by currency
  const priceMap = this.prices as Map<string, IProductPrice>;
  if (!priceMap || !priceMap.get) return undefined;
  return priceMap.get(currency);
};

// Static methods
ProductSchema.statics.findBySlug = async function (
  this: IProductModel,
  slug: string,
  organizationId: string
): Promise<IProductDocument | null> {
  return this.findOne({ slug, organizationId });
};

ProductSchema.statics.findBySku = async function (
  this: IProductModel,
  sku: string,
  organizationId: string
): Promise<IProductDocument | null> {
  return this.findOne({ 
    $or: [
      { sku, organizationId },
      { 'variants.sku': sku, organizationId }
    ]
  });
};

ProductSchema.statics.findByCategory = async function (
  this: IProductModel,
  categoryId: string,
  organizationId: string
): Promise<IProductDocument[]> {
  return this.find({ categories: categoryId, organizationId, status: 'active' });
};

// Create and export model
const ProductModel = model<IProductDocument, IProductModel>('Product', ProductSchema);
export default ProductModel;