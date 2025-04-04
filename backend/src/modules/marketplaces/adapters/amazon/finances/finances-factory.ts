/**
 * Amazon SP-API Finances Module Factory
 * 
 * Factory class for creating and registering Finances API module instances.
 */

import { BaseApiModule, ApiRequestFunction } from '../core/api-module';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/registry-helper';
import { FinancesModule } from './finances';

/**
 * Creates and registers a Finances module instance
 * 
 * @param registry Module registry to register the module with
 * @param makeApiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param apiVersion Optional API version (defaults to latest version if not specified)
 * @returns The created Finances module instance
 */
export function createFinancesModule(
  registry: ModuleRegistry,
  makeApiRequest: ApiRequestFunction,
  marketplaceId: string,
  apiVersion?: string
): FinancesModule {
  // Use provided version or get the default
  const version = apiVersion || getDefaultModuleVersion('finances') || '2021-06-30';
  
  // Create the module
  const module = new FinancesModule(
    version,
    makeApiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule(module);
  
  return module;
}