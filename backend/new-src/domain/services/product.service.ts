/**
 * Product Service Implementation
 * Provides business logic for product operations with TypeScript support
 */
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/container';
import { ID, IPaginatedResult } from '@/types/base.types';
import { BadRequestError, ConflictError, NotFoundError } from '@/types/error.types';
import { 
  IProduct,
  IProductService,
  ProductCreateData,
  ProductUpdateData,
  IProductVariant,
  ProductVariantCreateData,
  ProductVariantUpdateData,
  IProductCategory,
  IProductAttribute,
  ProductStatus
} from '../interfaces/product.interface';
import { IProductRepository } from '../repositories/product.repository';
import { logger } from '@/utils/logger';

/**
 * Product service implementation
 */
@injectable()
export class ProductService implements IProductService {
  /**
   * Constructor
   * @param productRepository - Product repository
   */
  constructor(
    @inject(TYPES.ProductRepository) private productRepository: IProductRepository
  ) {}

  /**
   * Creates a new product
   * @param data - Product creation data
   * @returns Created product
   */
  public async createProduct(data: ProductCreateData): Promise<IProduct> {
    try {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = this.slugify(data.title);
      }

      // Check if a product with this slug already exists in the organization
      const existingProduct = await this.productRepository.findBySlug(data.slug, data.organizationId);
      if (existingProduct) {
        throw new ConflictError(`Product with slug ${data.slug} already exists`);
      }

      // Create the product
      return this.productRepository.create(data);
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error creating product:', error);
      throw new BadRequestError('Failed to create product');
    }
  }

  /**
   * Gets a product by ID
   * @param id - Product ID
   * @param options - Options
   * @returns Product or null
   */
  public async getProductById(
    id: ID, 
    options?: { withVariants?: boolean }
  ): Promise<IProduct | null> {
    try {
      return this.productRepository.findById(id);
    } catch (error) {
      logger.error('Error getting product by ID:', error);
      throw new BadRequestError('Failed to get product');
    }
  }

  /**
   * Gets a product by slug
   * @param slug - Product slug
   * @param options - Options
   * @returns Product or null
   */
  public async getProductBySlug(
    slug: string, 
    options?: { withVariants?: boolean }
  ): Promise<IProduct | null> {
    // This method requires an organization ID, but we don't have it here
    // In a real implementation, we might need a different approach or to
    // add an additional findBySlugGlobally method to the repository
    throw new BadRequestError('getProductBySlug requires organizationId');
  }

  /**
   * Updates a product
   * @param id - Product ID
   * @param data - Product update data
   * @returns Updated product
   */
  public async updateProduct(id: ID, data: ProductUpdateData): Promise<IProduct> {
    try {
      // Get the product to check existence and get the organizationId
      const product = await this.productRepository.findByIdOrFail(id);
      
      // If slug is being updated, check for uniqueness
      if (data.slug && data.slug !== product.slug) {
        const existingProduct = await this.productRepository.findBySlug(
          data.slug, 
          product.organizationId
        );
        
        if (existingProduct && existingProduct.id.toString() !== id.toString()) {
          throw new ConflictError(`Product with slug ${data.slug} already exists`);
        }
      }
      
      // Update the product
      return this.productRepository.update(id, data);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error updating product:', error);
      throw new BadRequestError('Failed to update product');
    }
  }

  /**
   * Deletes a product
   * @param id - Product ID
   * @returns Whether product was deleted
   */
  public async deleteProduct(id: ID): Promise<boolean> {
    try {
      return this.productRepository.delete(id);
    } catch (error) {
      logger.error('Error deleting product:', error);
      throw new BadRequestError('Failed to delete product');
    }
  }

  /**
   * Creates a product variant
   * @param productId - Product ID
   * @param data - Variant creation data
   * @returns Created variant
   */
  public async createVariant(
    productId: ID, 
    data: ProductVariantCreateData
  ): Promise<IProductVariant> {
    try {
      // Get the product to check existence
      const product = await this.productRepository.findByIdOrFail(productId);
      
      // Check if a variant with this SKU already exists
      if (data.sku) {
        const existingProduct = await this.productRepository.findBySku(
          data.sku, 
          product.organizationId
        );
        
        if (existingProduct) {
          throw new ConflictError(`Product variant with SKU ${data.sku} already exists`);
        }
      }
      
      // Add the variant to the product
      const updatedProduct = await this.productRepository.addVariant(productId, data);
      
      // Return the newly added variant
      const addedVariant = updatedProduct.variants?.find(v => v.sku === data.sku);
      if (!addedVariant) {
        throw new BadRequestError('Failed to create variant');
      }
      
      return addedVariant;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error creating product variant:', error);
      throw new BadRequestError('Failed to create product variant');
    }
  }

  /**
   * Gets a product variant by ID
   * @param id - Variant ID
   * @returns Variant or null
   */
  public async getVariantById(id: ID): Promise<IProductVariant | null> {
    try {
      // This would be more efficient with a direct variant lookup
      // For now, we'll need to search through all products
      
      // In a real implementation, we might have a separate variants repository
      // or add a specialized method to the product repository
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error getting product variant by ID:', error);
      throw new BadRequestError('Failed to get product variant');
    }
  }

  /**
   * Updates a product variant
   * @param id - Variant ID
   * @param data - Variant update data
   * @returns Updated variant
   */
  public async updateVariant(
    id: ID, 
    data: ProductVariantUpdateData
  ): Promise<IProductVariant> {
    try {
      // This would need the product ID, which we don't have directly
      // In a real implementation, we'd have a way to find the product by variant ID
      throw new BadRequestError('Not implemented');
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error updating product variant:', error);
      throw new BadRequestError('Failed to update product variant');
    }
  }

  /**
   * Updates a product variant with product ID
   * @param productId - Product ID
   * @param variantId - Variant ID
   * @param data - Variant update data
   * @returns Updated variant
   */
  public async updateVariantWithProductId(
    productId: ID,
    variantId: ID,
    data: ProductVariantUpdateData
  ): Promise<IProductVariant> {
    try {
      // Get the product to check existence
      const product = await this.productRepository.findByIdOrFail(productId);
      
      // Check if the variant exists
      const variant = product.variants?.find(v => v.id.toString() === variantId.toString());
      if (!variant) {
        throw new NotFoundError(`Product variant not found with id: ${variantId}`);
      }
      
      // If SKU is being updated, check for uniqueness
      if (data.sku && data.sku !== variant.sku) {
        const existingProduct = await this.productRepository.findBySku(
          data.sku, 
          product.organizationId
        );
        
        if (existingProduct) {
          throw new ConflictError(`Product variant with SKU ${data.sku} already exists`);
        }
      }
      
      // Update the variant
      const updatedProduct = await this.productRepository.updateVariant(
        productId, 
        variantId, 
        data
      );
      
      // Return the updated variant
      const updatedVariant = updatedProduct.variants?.find(v => 
        v.id.toString() === variantId.toString()
      );
      
      if (!updatedVariant) {
        throw new BadRequestError('Failed to update variant');
      }
      
      return updatedVariant;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error updating product variant:', error);
      throw new BadRequestError('Failed to update product variant');
    }
  }

  /**
   * Deletes a product variant
   * @param id - Variant ID
   * @returns Whether variant was deleted
   */
  public async deleteVariant(id: ID): Promise<boolean> {
    try {
      // Similar issue as updateVariant - we need the product ID
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error deleting product variant:', error);
      throw new BadRequestError('Failed to delete product variant');
    }
  }

  /**
   * Deletes a product variant with product ID
   * @param productId - Product ID
   * @param variantId - Variant ID
   * @returns Whether variant was deleted
   */
  public async deleteVariantWithProductId(
    productId: ID,
    variantId: ID
  ): Promise<boolean> {
    try {
      // Get the product to check existence
      const product = await this.productRepository.findByIdOrFail(productId);
      
      // Check if the variant exists
      const variantExists = product.variants?.some(v => 
        v.id.toString() === variantId.toString()
      );
      
      if (!variantExists) {
        throw new NotFoundError(`Product variant not found with id: ${variantId}`);
      }
      
      // Remove the variant
      await this.productRepository.removeVariant(productId, variantId);
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error deleting product variant:', error);
      throw new BadRequestError('Failed to delete product variant');
    }
  }

  /**
   * Creates a product category
   * @param data - Category data
   * @returns Created category
   */
  public async createCategory(
    data: Omit<IProductCategory, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IProductCategory> {
    try {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = this.slugify(data.name);
      }
      
      // This would be implemented with a category repository
      // For now, we'll simulate creating a category
      const category: IProductCategory = {
        id: 'cat_' + Math.random().toString(36).substr(2, 9) as ID,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return category;
    } catch (error) {
      logger.error('Error creating product category:', error);
      throw new BadRequestError('Failed to create product category');
    }
  }

  /**
   * Updates a product category
   * @param id - Category ID
   * @param data - Category update data
   * @returns Updated category
   */
  public async updateCategory(
    id: ID, 
    data: Partial<Omit<IProductCategory, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<IProductCategory> {
    try {
      // This would be implemented with a category repository
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error updating product category:', error);
      throw new BadRequestError('Failed to update product category');
    }
  }

  /**
   * Deletes a product category
   * @param id - Category ID
   * @returns Whether category was deleted
   */
  public async deleteCategory(id: ID): Promise<boolean> {
    try {
      // This would be implemented with a category repository
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error deleting product category:', error);
      throw new BadRequestError('Failed to delete product category');
    }
  }

  /**
   * Creates a product attribute
   * @param data - Attribute data
   * @returns Created attribute
   */
  public async createAttribute(
    data: Omit<IProductAttribute, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IProductAttribute> {
    try {
      // This would be implemented with an attribute repository
      // For now, we'll simulate creating an attribute
      const attribute: IProductAttribute = {
        id: 'attr_' + Math.random().toString(36).substr(2, 9) as ID,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return attribute;
    } catch (error) {
      logger.error('Error creating product attribute:', error);
      throw new BadRequestError('Failed to create product attribute');
    }
  }

  /**
   * Updates a product attribute
   * @param id - Attribute ID
   * @param data - Attribute update data
   * @returns Updated attribute
   */
  public async updateAttribute(
    id: ID, 
    data: Partial<Omit<IProductAttribute, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<IProductAttribute> {
    try {
      // This would be implemented with an attribute repository
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error updating product attribute:', error);
      throw new BadRequestError('Failed to update product attribute');
    }
  }

  /**
   * Deletes a product attribute
   * @param id - Attribute ID
   * @returns Whether attribute was deleted
   */
  public async deleteAttribute(id: ID): Promise<boolean> {
    try {
      // This would be implemented with an attribute repository
      throw new BadRequestError('Not implemented');
    } catch (error) {
      logger.error('Error deleting product attribute:', error);
      throw new BadRequestError('Failed to delete product attribute');
    }
  }

  /**
   * Searches products
   * @param organizationId - Organization ID
   * @param query - Search query
   * @param options - Search options
   * @returns Paginated products
   */
  public async searchProducts(
    organizationId: ID,
    query: string,
    options?: {
      categories?: ID[];
      status?: ProductStatus[];
      limit?: number;
      page?: number;
    }
  ): Promise<IPaginatedResult<IProduct>> {
    try {
      return this.productRepository.searchProducts(query, organizationId, options);
    } catch (error) {
      logger.error('Error searching products:', error);
      throw new BadRequestError('Failed to search products');
    }
  }

  /**
   * Updates a product's status
   * @param id - Product ID
   * @param status - New status
   * @returns Updated product
   */
  public async updateProductStatus(id: ID, status: ProductStatus): Promise<IProduct> {
    try {
      return this.productRepository.updateStatus(id, status);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error updating product status:', error);
      throw new BadRequestError('Failed to update product status');
    }
  }

  /**
   * Slugifies a string
   * @param text - String to slugify
   * @returns Slugified string
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}