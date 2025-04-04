/**
 * Amazon SP-API Orders Module Factory
 * 
 * Factory function for creating and registering Orders API module instances.
 */

import { ApiRequestFunction } from '../core/api-module';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/registry-helper';
import { OrdersModule } from './orders';

/**
 * Creates and registers an Orders module instance
 * 
 * @param registry Module registry to register the module with
 * @param makeApiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param apiVersion Optional API version (defaults to latest version if not specified)
 * @returns The created Orders module instance
 */
export function createOrdersModule(
  registry: ModuleRegistry,
  makeApiRequest: ApiRequestFunction,
  marketplaceId: string,
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