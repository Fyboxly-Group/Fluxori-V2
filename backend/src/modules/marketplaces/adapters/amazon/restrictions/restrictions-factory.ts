/**
 * Factory function for creating Listings Restrictions module
 * 
 * Creates and optionally registers a new ListingsRestrictionsModule instance
 * with the provided configuration. This module is used to check product
 * listing eligibility based on Amazon's restrictions.
 * 
 * @param apiRequest API request function to use
 * @param marketplaceId Amazon marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version (defaults to latest)
 * @param options Optional module configuration options
 * @returns Configured ListingsRestrictionsModule instance
 */
import { ListingsRestrictionsModule, ListingsRestrictionsModuleOptions } from './listings-restrictions';
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';

export function createListingsRestrictionsModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options?: ListingsRestrictionsModuleOptions
): ListingsRestrictionsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('listingsRestrictions') || '2021-08-01';
  
  // Create the module
  const module = new ListingsRestrictionsModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule('listingsRestrictions', module);
  
  return module;
}