import { MarketplaceOrder } from '../../marketplaces/models/marketplace.models';
import { IOrder } from '../models/order.model';

/**
 * Interface for marketplace-specific order mappers
 */
export interface IOrderMapper {
  /**
   * Map a marketplace-specific order to Fluxori's standardized order format
   * @param marketplaceOrder - Raw order data from marketplace
   * @param userId - The user ID
   * @param organizationId - The organization ID
   * @returns Standardized order object
   */
  mapToFluxoriOrder(
    marketplaceOrder: MarketplaceOrder,
    userId: string,
    organizationId: string
  ): IOrder;
}

/**
 * Registry of marketplace-specific order mappers
 */
export class OrderMapperRegistry {
  private static instance: OrderMapperRegistry;
  private mappers: Map<string, IOrderMapper> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): OrderMapperRegistry {
    if (!OrderMapperRegistry.instance) {
      OrderMapperRegistry.instance = new OrderMapperRegistry();
    }
    return OrderMapperRegistry.instance;
  }

  /**
   * Register a mapper for a specific marketplace
   * @param marketplaceId - The marketplace ID
   * @param mapper - The mapper implementation
   */
  public registerMapper(marketplaceId: string, mapper: IOrderMapper): void {
    this.mappers.set(marketplaceId.toLowerCase(), mapper);
  }

  /**
   * Get a mapper for a specific marketplace
   * @param marketplaceId - The marketplace ID
   * @returns The mapper implementation
   * @throws Error if no mapper is registered for the marketplace
   */
  public getMapper(marketplaceId: string): IOrderMapper {
    const mapper = this.mappers.get(marketplaceId.toLowerCase());
    if (!mapper) {
      throw new Error(`No order mapper registered for marketplace: ${marketplaceId}`);
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
export const orderMapperRegistry = OrderMapperRegistry.getInstance();