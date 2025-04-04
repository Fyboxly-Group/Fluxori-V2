/**
 * Factory for creating FBA Small and Light API modules
 */
import { ApiRequestFunction } from '../../../amazon/core/base-module.interface';
import { ModuleRegistry } from '../../../amazon/core/module-registry';
import { getModuleDefaultVersion } from '../../../amazon/core/module-definitions';
import { FbaSmallAndLightModule, FbaSmallAndLightModuleOptions } from './fba-small-light';

/**
 * Create a new FBA Small and Light module instance
 * 
 * @param apiVersion - API version to use (optional, defaults to latest version)
 * @param makeApiRequest - Function to make API requests
 * @param marketplaceId - Amazon marketplace ID
 * @param registry - Module registry for registration
 * @param options - Additional module options
 * @returns Initialized FBA Small and Light module
 */
export function createFbaSmallAndLightModule(
  apiVersion: string | undefined,
  makeApiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  options: FbaSmallAndLightModuleOptions = {}
): FbaSmallAndLightModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('fbaSmallAndLight') || '2021-08-01';
  
  // Create the module
  const module = new FbaSmallAndLightModule(
    version,
    makeApiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module.moduleId, module);
  
  return module;
}
