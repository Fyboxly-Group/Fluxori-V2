/**
 * Amazon Sales API Factory
 * 
 * Factory function for creating and registering an Amazon Sales API module.
 */

import { SalesModule, SalesModuleOptions } from './sales';
import { ApiRequestFunction } from '../../../core/base-module.interface';
import { ModuleRegistry } from '../../../core/module-registry';
import { getModuleDefaultVersion } from '../../../core/module-definitions';

/**
 * Creates and registers a Sales module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @param options Optional module-specific options
 * @returns The created Sales module
 */
export function createSalesModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options: SalesModuleOptions = {}
): SalesModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('sales') || 'v1';
  
  // Create the module
  const module = new SalesModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module.moduleId, module);
  
  return module;
}