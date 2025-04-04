/**
 * Amazon Replenishment API Factory
 * 
 * Factory function for creating and registering an Amazon Replenishment API module.
 */

import { ReplenishmentModule } from './replenishment';
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';

/**
 * Creates and registers a Replenishment module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @returns The created Replenishment module
 */
export function createReplenishmentModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): ReplenishmentModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('replenishment') || '2022-11-07';
  
  // Create the module
  const module = new ReplenishmentModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('replenishment', module);
  
  return module;
}