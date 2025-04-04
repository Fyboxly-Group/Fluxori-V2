/**
 * Factory for creating B2B module
 */
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';
import { B2BModule } from './b2b';

/**
 * Create a B2B module
 * 
 * @param apiRequest - Function to make Amazon API requests
 * @param marketplaceId - Amazon marketplace ID
 * @param registry - Module registry for Amazon modules
 * @param apiVersion - Optional API version to use (defaults to latest)
 * @returns B2BModule instance
 */
export function createB2BModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): B2BModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('b2b') || 'v1';
  
  // Create the module
  const module = new B2BModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('b2b', module);
  
  return module;
}

export default createB2BModule;