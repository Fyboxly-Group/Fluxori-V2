/**
 * Amazon Supply Source Module Factory
 * 
 * Creates and registers the Amazon SP-API Supply Source module.
 */

import { ApiRequestFunction } from '../core/api-module';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/registry-helper';
import { SupplySourceModule } from './supply-source';

/**
 * Creates and registers a Supply Source module
 * 
 * @param apiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param registry Module registry to register the module with
 * @param apiVersion Optional API version override
 * @returns The created Supply Source module instance
 */
export function createSupplySourceModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): SupplySourceModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('supplySource') || '2022-11-07';
  
  // Create the module
  const module = new SupplySourceModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('supplySource', module);
  
  return module;
}