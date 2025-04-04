/**
 * Factory for creating Feeds module
 */
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';
import { FeedsModule } from './feeds';

/**
 * Create a Feeds module
 * 
 * @param apiRequest - Function to make Amazon API requests
 * @param marketplaceId - Amazon marketplace ID
 * @param registry - Module registry for Amazon modules
 * @param apiVersion - Optional API version to use (defaults to latest)
 * @returns FeedsModule instance
 */
export function createFeedsModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): FeedsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('feeds') || '2021-06-30';
  
  // Create the module
  const module = new FeedsModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('feeds', module);
  
  return module;
}

export default createFeedsModule;