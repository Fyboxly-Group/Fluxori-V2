/**
 * Amazon SP-API Catalog Items Module Factory
 * 
 * Factory function for creating and registering Catalog Items API module instances.
 */

import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/registry-helper';
import { CatalogItemsModule, CatalogItemsModuleOptions } from './catalog-items';

/**
 * Creates and registers a Catalog Items module instance
 * 
 * @param apiVersion Optional API version (defaults to latest version if not specified)
 * @param makeApiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param registry Module registry to register the module with
 * @param options Module-specific options
 * @returns The created Catalog Items module instance
 */
export function createCatalogItemsModule(
  apiVersion: string | undefined,
  makeApiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  options: CatalogItemsModuleOptions = {}
): CatalogItemsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('catalogItems') || '2022-04-01';
  
  // Create the module
  const module = new CatalogItemsModule(
    version,
    makeApiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module);
  
  return module;
}