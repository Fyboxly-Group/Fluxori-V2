/**
 * Product Repository Implementation
 * Provides type-safe database operations for Product entities
 */
import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { BaseRepository } from '@/repositories/base.repository';
import { ID, IPaginatedResult, IPaginationParams } from '@/types/base.types';
import { NotFoundError } from '@/types/error.types';
import { 
  IProduct, 
  IProductVariant, 
  ProductStatus, 
  ProductVariantUpdateData 
} from '../interfaces/product.interface';
import ProductModel, { IProductDocument, IProductVariantDocument } from '../models/product.model';

/**
 * Product repository interface
 */
export interface IProductRepository {
  // Base repository methods
  create(data: Partial<IProduct>): Promise<IProduct>;
  findById(id: ID): Promise<IProduct | null>;
  update(id: ID, data: Partial<IProduct>): Promise<IProduct>;
  delete(id: ID): Promise<boolean>;
  
  // Product specific methods
  findByIdOrFail(id: ID): Promise<IProduct>;
  findBySlug(slug: string, organizationId: ID): Promise<IProduct | null>;
  findBySlugOrFail(slug: string, organizationId: ID): Promise<IProduct>;
  findBySku(sku: string, organizationId: ID): Promise<IProduct | null>;
  findByCategory(categoryId: ID, organizationId: ID): Promise<IProduct[]>;
  updateStatus(id: ID, status: ProductStatus): Promise<IProduct>;
  searchProducts(query: string, organizationId: ID, options?: IPaginationParams & { 
    categories?: ID[]; 
    status?: ProductStatus[];
  }): Promise<IPaginatedResult<IProduct>>;
  
  // Variant methods
  addVariant(productId: ID, variant: Omit<IProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt'>): Promise<IProduct>;
  updateVariant(productId: ID, variantId: ID, data: ProductVariantUpdateData): Promise<IProduct>;
  removeVariant(productId: ID, variantId: ID): Promise<IProduct>;
}

/**
 * Product repository implementation using Mongoose
 */
@injectable()
export class ProductRepository extends BaseRepository<IProduct, IProductDocument> implements IProductRepository {
  constructor() {
    super(ProductModel);
  }

  /**
   * Finds a product by ID or throws NotFoundError
   * @param id - Product ID
   * @returns Product
   * @throws NotFoundError
   */
  public async findByIdOrFail(id: ID): Promise<IProduct> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundError(`Product not found with id: ${id}`);
    }
    return product;
  }

  /**
   * Finds a product by slug within an organization
   * @param slug - Product slug
   * @param organizationId - Organization ID
   * @returns Product or null
   */
  public async findBySlug(slug: string, organizationId: ID): Promise<IProduct | null> {
    return this.findOne({ 
      slug: slug.toLowerCase(), 
      organizationId: organizationId.toString()
    });
  }

  /**
   * Finds a product by slug within an organization or throws NotFoundError
   * @param slug - Product slug
   * @param organizationId - Organization ID
   * @returns Product
   * @throws NotFoundError
   */
  public async findBySlugOrFail(slug: string, organizationId: ID): Promise<IProduct> {
    const product = await this.findBySlug(slug, organizationId);
    if (!product) {
      throw new NotFoundError(`Product not found with slug: ${slug}`);
    }
    return product;
  }

  /**
   * Finds a product by SKU within an organization
   * @param sku - Product SKU
   * @param organizationId - Organization ID
   * @returns Product or null
   */
  public async findBySku(sku: string, organizationId: ID): Promise<IProduct | null> {
    return this.findOne({ 
      $or: [
        { sku, organizationId: organizationId.toString() },
        { 'variants.sku': sku, organizationId: organizationId.toString() }
      ]
    });
  }

  /**
   * Finds products by category within an organization
   * @param categoryId - Category ID
   * @param organizationId - Organization ID
   * @returns Array of products
   */
  public async findByCategory(categoryId: ID, organizationId: ID): Promise<IProduct[]> {
    const filter: FilterQuery<IProductDocument> = { 
      categories: categoryId.toString(),
      organizationId: organizationId.toString(),
      status: 'active'
    };
    
    const result = await this.find(filter, {
      sortBy: 'title',
      sortOrder: 'asc'
    });
    
    return result.items;
  }

  /**
   * Updates a product's status
   * @param id - Product ID
   * @param status - New status
   * @returns Updated product
   */
  public async updateStatus(id: ID, status: ProductStatus): Promise<IProduct> {
    return this.update(id, { status });
  }

  /**
   * Searches products by title or description within an organization
   * @param query - Search query
   * @param organizationId - Organization ID
   * @param options - Search options
   * @returns Paginated result
   */
  public async searchProducts(
    query: string,
    organizationId: ID,
    options: IPaginationParams & { 
      categories?: ID[]; 
      status?: ProductStatus[];
    } = {}
  ): Promise<IPaginatedResult<IProduct>> {
    const { categories, status, ...paginationOptions } = options;
    
    // Build filter
    const filter: FilterQuery<IProductDocument> = {
      organizationId: organizationId.toString(),
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { 'variants.sku': { $regex: query, $options: 'i' } },
        { 'variants.title': { $regex: query, $options: 'i' } }
      ]
    };
    
    // Add category filter if provided
    if (categories && categories.length > 0) {
      filter.categories = { $in: categories.map(id => id.toString()) };
    }
    
    // Add status filter if provided
    if (status && status.length > 0) {
      filter.status = { $in: status };
    }
    
    return this.find(filter, paginationOptions);
  }

  /**
   * Adds a variant to a product
   * @param productId - Product ID
   * @param variant - Variant data
   * @returns Updated product
   */
  public async addVariant(
    productId: ID,
    variant: Omit<IProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt'>
  ): Promise<IProduct> {
    const product = await this.findByIdOrFail(productId);
    
    // Create variants array if it doesn't exist
    const variants = product.variants || [];
    
    // Add new variant with productId
    const newVariant: Partial<IProductVariant> = {
      ...variant,
      productId
    };
    
    // Update the product
    return this.update(productId, { 
      variants: [...variants, newVariant],
      type: 'variable' // Ensure product type is set to variable
    });
  }

  /**
   * Updates a product variant
   * @param productId - Product ID
   * @param variantId - Variant ID
   * @param data - Update data
   * @returns Updated product
   */
  public async updateVariant(
    productId: ID,
    variantId: ID,
    data: ProductVariantUpdateData
  ): Promise<IProduct> {
    const product = await this.findByIdOrFail(productId);
    
    if (!product.variants) {
      throw new NotFoundError(`Variant not found with id: ${variantId}`);
    }
    
    // Find the variant index
    const variantIndex = product.variants.findIndex(
      v => v.id.toString() === variantId.toString()
    );
    
    if (variantIndex === -1) {
      throw new NotFoundError(`Variant not found with id: ${variantId}`);
    }
    
    // Update the variant
    const updatedVariants = [...product.variants];
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      ...data,
      id: variantId, // Ensure ID doesn't change
      productId // Ensure productId doesn't change
    };
    
    return this.update(productId, { variants: updatedVariants });
  }

  /**
   * Removes a variant from a product
   * @param productId - Product ID
   * @param variantId - Variant ID
   * @returns Updated product
   */
  public async removeVariant(productId: ID, variantId: ID): Promise<IProduct> {
    const product = await this.findByIdOrFail(productId);
    
    if (!product.variants) {
      return product;
    }
    
    // Filter out the variant
    const updatedVariants = product.variants.filter(
      v => v.id.toString() !== variantId.toString()
    );
    
    // Update product type if no variants remain
    const updatedProduct: Partial<IProduct> = { variants: updatedVariants };
    if (updatedVariants.length === 0) {
      updatedProduct.type = 'simple';
    }
    
    return this.update(productId, updatedProduct);
  }
}