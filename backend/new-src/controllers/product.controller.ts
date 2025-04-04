/**
 * Product Controller
 * Handles HTTP requests for product management
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/container';
import { ApiError } from '@/middleware/error.middleware';
import { 
  IProduct, 
  IProductService,
  IProductVariant,
  ProductStatus,
  ProductCreateData,
  ProductUpdateData,
  ProductVariantCreateData,
  ProductVariantUpdateData
} from '@/domain/interfaces/product.interface';
import { BaseController } from './base.controller';
import { ID } from '@/types/base.types';
import { logger } from '@/utils/logger';

/**
 * Request with authentication
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
}

/**
 * Product controller interface
 */
export interface IProductController {
  getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  updateProductStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  searchProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  
  // Variant methods
  getProductVariants(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  getVariantById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  createVariant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  updateVariant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  deleteVariant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Product controller implementation
 */
@injectable()
export class ProductController extends BaseController<IProduct> implements IProductController {
  /**
   * Constructor
   * @param productService - Product service
   */
  constructor(
    @inject(TYPES.ProductService) private productService: IProductService
  ) {
    super();
  }

  /**
   * Get all products for the authenticated user's organization
   * @route GET /api/products
   */
  async getProducts(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { organizationId } = req.user;
      const limit = Number(req.query.limit) || 10;
      const page = Number(req.query.page) || 1;
      const categories = req.query.categories ? 
        (Array.isArray(req.query.categories) ? 
          req.query.categories as string[] : 
          [req.query.categories as string]) : 
        undefined;
      
      const statusValues = req.query.status ? 
        (Array.isArray(req.query.status) ? 
          req.query.status as ProductStatus[] : 
          [req.query.status as ProductStatus]) : 
        undefined;
      
      // Search products
      const result = await this.productService.searchProducts(
        organizationId as ID,
        req.query.q as string || '',
        {
          categories: categories as ID[],
          status: statusValues,
          limit,
          page
        }
      );

      // Return success response with data and metadata
      res.status(StatusCodes.OK).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit
        }
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Get product by ID
   * @route GET /api/products/:id
   */
  async getProductById(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const withVariants = req.query.withVariants === 'true';

      // Get product
      const product = await this.productService.getProductById(id as ID, { withVariants });
      
      // Handle not found case
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
      }

      // Check organization access
      if (product.organizationId.toString() !== req.user.organizationId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this product');
      }

      // Return success response with data
      res.status(StatusCodes.OK).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Create new product
   * @route POST /api/products
   */
  async createProduct(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { id: userId, organizationId } = req.user;
      const productData: ProductCreateData = {
        ...req.body,
        organizationId: organizationId as ID,
        createdBy: userId as ID
      };
      
      // Create product
      const newProduct = await this.productService.createProduct(productData);

      // Return success response with created product
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: newProduct
      });
    } catch (error) {
      logger.error('Error creating product:', error);
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Update product
   * @route PUT /api/products/:id
   */
  async updateProduct(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const updateData: ProductUpdateData = req.body;
      
      // Remove fields that shouldn't be updated directly
      delete updateData.createdBy;
      delete updateData.organizationId;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      
      // Get product to check organization access
      const product = await this.productService.getProductById(id as ID);
      
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
      }

      // Check organization access
      if (product.organizationId.toString() !== req.user.organizationId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this product');
      }
      
      // Update product
      const updatedProduct = await this.productService.updateProduct(id as ID, updateData);
      
      // Return success response with updated product
      res.status(StatusCodes.OK).json({
        success: true,
        data: updatedProduct
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Delete product
   * @route DELETE /api/products/:id
   */
  async deleteProduct(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      
      // Get product to check organization access
      const product = await this.productService.getProductById(id as ID);
      
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
      }

      // Check organization access
      if (product.organizationId.toString() !== req.user.organizationId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this product');
      }
      
      // Delete product
      await this.productService.deleteProduct(id as ID);
      
      // Return success response
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Update product status
   * @route PATCH /api/products/:id/status
   */
  async updateProductStatus(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['active', 'inactive', 'draft', 'archived', 'discontinued'].includes(status)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status value');
      }
      
      // Get product to check organization access
      const product = await this.productService.getProductById(id as ID);
      
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
      }

      // Check organization access
      if (product.organizationId.toString() !== req.user.organizationId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this product');
      }
      
      // Update product status
      const updatedProduct = await this.productService.updateProductStatus(id as ID, status as ProductStatus);
      
      // Return success response with updated product
      res.status(StatusCodes.OK).json({
        success: true,
        data: updatedProduct
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Search products
   * @route GET /api/products/search
   */
  async searchProducts(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { organizationId } = req.user;
      const query = req.query.q as string || '';
      const limit = Number(req.query.limit) || 10;
      const page = Number(req.query.page) || 1;
      const categories = req.query.categories ? 
        (Array.isArray(req.query.categories) ? 
          req.query.categories as string[] : 
          [req.query.categories as string]) : 
        undefined;
      
      const statusValues = req.query.status ? 
        (Array.isArray(req.query.status) ? 
          req.query.status as ProductStatus[] : 
          [req.query.status as ProductStatus]) : 
        undefined;
      
      // Search products
      const result = await this.productService.searchProducts(
        organizationId as ID,
        query,
        {
          categories: categories as ID[],
          status: statusValues,
          limit,
          page
        }
      );

      // Return success response with data and metadata
      res.status(StatusCodes.OK).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit
        }
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Get all variants for a product
   * @route GET /api/products/:productId/variants
   */
  async getProductVariants(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { productId } = req.params;
      
      // Get product
      const product = await this.productService.getProductById(productId as ID, { withVariants: true });
      
      // Handle not found case
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
      }

      // Check organization access
      if (product.organizationId.toString() !== req.user.organizationId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this product');
      }

      // Return success response with variants or empty array
      res.status(StatusCodes.OK).json({
        success: true,
        data: product.variants || []
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Get variant by ID
   * @route GET /api/products/:productId/variants/:variantId
   */
  async getVariantById(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { productId, variantId } = req.params;
      
      // Get product
      const product = await this.productService.getProductById(productId as ID, { withVariants: true });
      
      // Handle not found case
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
      }

      // Check organization access
      if (product.organizationId.toString() !== req.user.organizationId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this product');
      }

      // Find variant
      const variant = product.variants?.find(v => v.id.toString() === variantId);
      
      if (!variant) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Variant not found');
      }

      // Return success response with variant
      res.status(StatusCodes.OK).json({
        success: true,
        data: variant
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Create new variant for a product
   * @route POST /api/products/:productId/variants
   */
  async createVariant(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { productId } = req.params;
      const variantData: ProductVariantCreateData = {
        ...req.body,
        productId: productId as ID
      };
      
      // Get product to check organization access
      const product = await this.productService.getProductById(productId as ID);
      
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
      }

      // Check organization access
      if (product.organizationId.toString() !== req.user.organizationId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this product');
      }
      
      // Create variant
      const newVariant = await this.productService.createVariant(productId as ID, variantData);
      
      // Return success response with created variant
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: newVariant
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Update variant
   * @route PUT /api/products/:productId/variants/:variantId
   */
  async updateVariant(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { productId, variantId } = req.params;
      const updateData: ProductVariantUpdateData = req.body;
      
      // Remove fields that shouldn't be updated directly
      delete updateData.productId;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      
      // Get product to check organization access
      const product = await this.productService.getProductById(productId as ID, { withVariants: true });
      
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
      }

      // Check organization access
      if (product.organizationId.toString() !== req.user.organizationId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this product');
      }
      
      // Check if variant exists
      const variantExists = product.variants?.some(v => v.id.toString() === variantId);
      if (!variantExists) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Variant not found');
      }
      
      // Update variant
      const updatedVariant = await this.productService.updateVariantWithProductId(
        productId as ID,
        variantId as ID,
        updateData
      );
      
      // Return success response with updated variant
      res.status(StatusCodes.OK).json({
        success: true,
        data: updatedVariant
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }

  /**
   * Delete variant
   * @route DELETE /api/products/:productId/variants/:variantId
   */
  async deleteVariant(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }

      const { productId, variantId } = req.params;
      
      // Get product to check organization access
      const product = await this.productService.getProductById(productId as ID, { withVariants: true });
      
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
      }

      // Check organization access
      if (product.organizationId.toString() !== req.user.organizationId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this product');
      }
      
      // Check if variant exists
      const variantExists = product.variants?.some(v => v.id.toString() === variantId);
      if (!variantExists) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Variant not found');
      }
      
      // Delete variant
      await this.productService.deleteVariantWithProductId(productId as ID, variantId as ID);
      
      // Return success response
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Variant deleted successfully'
      });
    } catch (error) {
      next(error instanceof Error ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error)));
    }
  }
}