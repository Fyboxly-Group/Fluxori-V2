/**
 * Amazon Warehousing and Distribution Factory
 * 
 * Factory function for creating and registering the Amazon Warehousing and Distribution API module.
 */

import { WarehousingModule } from './warehousing';
import { ApiRequestFunction, BaseModule } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';

/**
 * Creates and registers a Warehousing module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @returns The created Warehousing module
 */
export function createWarehousingModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): WarehousingModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('warehousing') || '2023-09-25';
  
  // Create the module
  const module = new WarehousingModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('warehousing', module);
  
  return module;
}