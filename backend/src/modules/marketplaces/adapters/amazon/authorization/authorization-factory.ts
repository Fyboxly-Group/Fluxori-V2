/**
 * Factory for creating Authorization module
 */
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';
import { AuthorizationModule } from './authorization';

/**
 * Create an Authorization module
 * 
 * @param apiRequest - Function to make Amazon API requests
 * @param marketplaceId - Amazon marketplace ID
 * @param registry - Module registry for Amazon modules
 * @param apiVersion - Optional API version to use (defaults to latest)
 * @returns AuthorizationModule instance
 */
export function createAuthorizationModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): AuthorizationModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('authorization') || 'v1';
  
  // Create the module
  const module = new AuthorizationModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('authorization', module);
  
  return module;
}

export default createAuthorizationModule;