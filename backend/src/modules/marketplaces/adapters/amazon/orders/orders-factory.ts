/**
 * Factory for creating orders-related API modules
 */

import { OrdersModule } from './orders';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating orders-related API modules
 */
export class OrdersModuleFactory {
  /**
   * Create an Orders module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createOrdersModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): OrdersModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('orders') || 'v0';
    
    // Create the module
    const module = new OrdersModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}