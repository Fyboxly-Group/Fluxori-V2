/**
 * Amazon FBA Inventory API Factory
 * 
 * Factory function for creating and registering an Amazon FBA Inventory API module.
 */

import { FBAInventoryModule, FBAInventoryModuleOptions } from './fba-inventory';
import { ApiRequestFunction } from '../../core/base-module.interface';
import { ModuleRegistry } from '../../core/module-registry';
import { getModuleDefaultVersion } from '../../core/module-definitions';

/**
 * Creates and registers an FBA Inventory module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @param options Optional module-specific options
 * @returns The created FBA Inventory module
 */
export function createFBAInventoryModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options: FBAInventoryModuleOptions = {}
): FBAInventoryModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('fbaInventory') || 'v1';
  
  // Create the module
  const module = new FBAInventoryModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module.moduleId, module);
  
  return module;
}