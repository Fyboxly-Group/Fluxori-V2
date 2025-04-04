/**
 * Amazon Listings API Factory
 * 
 * Factory function for creating and registering an Amazon Listings API module.
 */

import { ListingsModule, ListingsModuleOptions } from './listings';
import { ApiRequestFunction } from '../../../core/base-module.interface';
import { ModuleRegistry } from '../../../core/module-registry';
import { getModuleDefaultVersion } from '../../../core/module-definitions';

/**
 * Creates and registers a Listings module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @param options Optional module-specific configuration
 * @returns The created Listings module
 */
export function createListingsModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options?: ListingsModuleOptions
): ListingsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('listingsItems') || '2021-08-01';
  
  // Create the module
  const module = new ListingsModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule('listingsItems', module);
  
  return module;
}