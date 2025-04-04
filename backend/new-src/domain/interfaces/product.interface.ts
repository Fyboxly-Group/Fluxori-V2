/**
 * Product domain interfaces
 * Defines the core Product entity and related types
 */
import { IBaseEntity, ID, IOrganizationEntity } from '@/types/base.types';

/**
 * Product status type
 */
export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived' | 'discontinued';

/**
 * Product category interface
 */
export interface IProductCategory extends IOrganizationEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: ID;
  level: number;
  path: string;
  imageUrl?: string;
}

/**
 * Product attribute interface
 */
export interface IProductAttribute extends IOrganizationEntity {
  name: string;
  code: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect';
  options?: string[];
  isRequired?: boolean;
  isVariant?: boolean;
  isFacet?: boolean;
  position?: number;
}

/**
 * Product attribute value interface
 */
export interface IProductAttributeValue {
  attributeId: ID;
  attributeCode: string;
  value: string | number | boolean | Date | string[];
}

/**
 * Product price interface
 */
export interface IProductPrice {
  currency: string;
  amount: number;
  compareAt?: number;
  cost?: number;
  wholesale?: number;
  special?: {
    amount: number;
    startsAt?: Date;
    endsAt?: Date;
  };
}

/**
 * Product dimension interface
 */
export interface IProductDimension {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  unit?: 'cm' | 'in' | 'mm';
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
}

/**
 * Product image interface
 */
export interface IProductImage extends IBaseEntity {
  url: string;
  alt?: string;
  position: number;
  isDefault: boolean;
  tags?: string[];
}

/**
 * Product variant interface
 */
export interface IProductVariant extends IBaseEntity {
  productId: ID;
  sku: string;
  barcode?: string;
  title: string;
  status: ProductStatus;
  prices: Record<string, IProductPrice>;
  inventory: {
    trackInventory: boolean;
    quantity?: number;
    lowStockThreshold?: number;
    sku?: string;
    barcode?: string;
  };
  attributes: IProductAttributeValue[];
  dimensions?: IProductDimension;
  images?: IProductImage[];
  metadata?: Record<string, unknown>;
}

/**
 * Product entity interface
 */
export interface IProduct extends IOrganizationEntity {
  title: string;
  slug: string;
  description?: string;
  status: ProductStatus;
  type: 'simple' | 'variable' | 'grouped' | 'bundle';
  sku?: string;
  barcode?: string;
  categories: ID[];
  tags?: string[];
  attributes: IProductAttributeValue[];
  prices: Record<string, IProductPrice>;
  taxClass?: string;
  inventory: {
    trackInventory: boolean;
    quantity?: number;
    lowStockThreshold?: number;
    sku?: string;
    barcode?: string;
    allowBackorders?: boolean;
    backorderLimit?: number;
  };
  dimensions?: IProductDimension;
  shippingClass?: string;
  images: IProductImage[];
  variants?: IProductVariant[];
  relatedProducts?: ID[];
  crossSellProducts?: ID[];
  upSellProducts?: ID[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  manufacturer?: {
    name?: string;
    partNumber?: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Product creation data interface
 */
export type ProductCreateData = Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Product update data interface
 */
export type ProductUpdateData = Partial<Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Product variant creation data interface
 */
export type ProductVariantCreateData = Omit<IProductVariant, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Product variant update data interface
 */
export type ProductVariantUpdateData = Partial<Omit<IProductVariant, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Product service interface
 */
export interface IProductService {
  createProduct(data: ProductCreateData): Promise<IProduct>;
  getProductById(id: ID, options?: { withVariants?: boolean }): Promise<IProduct | null>;
  getProductBySlug(slug: string, options?: { withVariants?: boolean }): Promise<IProduct | null>;
  updateProduct(id: ID, data: ProductUpdateData): Promise<IProduct>;
  deleteProduct(id: ID): Promise<boolean>;
  
  createVariant(productId: ID, data: ProductVariantCreateData): Promise<IProductVariant>;
  getVariantById(id: ID): Promise<IProductVariant | null>;
  updateVariant(id: ID, data: ProductVariantUpdateData): Promise<IProductVariant>;
  deleteVariant(id: ID): Promise<boolean>;
  
  createCategory(data: Omit<IProductCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProductCategory>;
  updateCategory(id: ID, data: Partial<Omit<IProductCategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IProductCategory>;
  deleteCategory(id: ID): Promise<boolean>;
  
  createAttribute(data: Omit<IProductAttribute, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProductAttribute>;
  updateAttribute(id: ID, data: Partial<Omit<IProductAttribute, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IProductAttribute>;
  deleteAttribute(id: ID): Promise<boolean>;
  
  searchProducts(
    organizationId: ID,
    query: string,
    options?: {
      categories?: ID[];
      status?: ProductStatus[];
      limit?: number;
      page?: number;
    }
  ): Promise<{
    items: IProduct[];
    total: number;
    page: number;
    limit: number;
  }>;
}