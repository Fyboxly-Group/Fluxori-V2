import { MarketplaceProduct } from '../../marketplaces/models/marketplace.models';
import { IProduct } from '../models/product.model';

/**
 * Interface for marketplace-specific product mappers
 */
export interface IProductMapper {
  /**
   * Map a marketplace-specific product to Fluxori's standardized product format
   * @param marketplaceProduct - Raw product data from marketplace
   * @param userId - The user ID
   * @param organizationId - The organization ID
   * @returns Standardized product object
   */
  mapToFluxoriProduct(
    marketplaceProduct: MarketplaceProduct,
    userId: string,
    organizationId: string
  ): Partial<IProduct>;
  
  /**
   * Get the warehouse ID for a marketplace-specific product
   * This is used to determine where stock is stored for this product
   * @param marketplaceProduct - Raw product data from marketplace
   * @param defaultWarehouseId - Default warehouse ID to use if no specific warehouse is found
   * @returns Warehouse ID
   */
  getWarehouseId(
    marketplaceProduct: MarketplaceProduct,
    defaultWarehouseId: string
  ): string;
  
  /**
   * Check if there are differences between Fluxori product and marketplace product
   * @param fluxoriProduct - Existing Fluxori product
   * @param marketplaceProduct - New marketplace product data
   * @returns Array of differences found
   */
  findDifferences(
    fluxoriProduct: IProduct,
    marketplaceProduct: MarketplaceProduct
  ): Array<{
    field: string;
    fluxoriValue: any;
    marketplaceValue: any;
  }>;
}

/**
 * Registry of marketplace-specific product mappers
 */
export class ProductMapperRegistry {
  private static instance: ProductMapperRegistry;
  private mappers: Map<string, IProductMapper> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ProductMapperRegistry {
    if (!ProductMapperRegistry.instance) {
      ProductMapperRegistry.instance = new ProductMapperRegistry();
    }
    return ProductMapperRegistry.instance;
  }

  /**
   * Register a mapper for a specific marketplace
   * @param marketplaceId - The marketplace ID
   * @param mapper - The mapper implementation
   */
  public registerMapper(marketplaceId: string, mapper: IProductMapper): void {
    this.mappers.set(marketplaceId.toLowerCase(), mapper);
  }

  /**
   * Get a mapper for a specific marketplace
   * @param marketplaceId - The marketplace ID
   * @returns The mapper implementation
   * @throws Error if no mapper is registered for the marketplace
   */
  public getMapper(marketplaceId: string): IProductMapper {
    const mapper = this.mappers.get(marketplaceId.toLowerCase());
    if (!mapper) {
      throw new Error(`No product mapper registered for marketplace: ${marketplaceId}`);
    }
    return mapper;
  }

  /**
   * Check if a mapper exists for a specific marketplace
   * @param marketplaceId - The marketplace ID
   * @returns True if a mapper exists, false otherwise
   */
  public hasMapper(marketplaceId: string): boolean {
    return this.mappers.has(marketplaceId.toLowerCase());
  }
}

// Export singleton instance
export const productMapperRegistry = ProductMapperRegistry.getInstance();