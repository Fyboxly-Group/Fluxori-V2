/**
 * Amazon Sellers API Factory
 * 
 * Factory function for creating and registering a SellersModule instance,
 * which provides access to seller account information and capabilities.
 */
import { ModuleRegistry } from '../core/module-registry';
import { SellersModule, SellersModuleOptions } from './sellers';
import { getModuleDefaultVersion } from '../core/module-definitions';
import { ApiRequestFunction } from '../core/base-module.interface';

/**
 * Creates and registers a SellersModule
 * 
 * @param apiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param registry Module registry
 * @param apiVersion Optional API version
 * @param options Optional module options
 * @returns SellersModule instance
 */
export function createSellersModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options: SellersModuleOptions = {}
): SellersModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('sellers') || 'v1';
  
  // Create the module
  const module = new SellersModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module.moduleId, module);
  
  return module;
}