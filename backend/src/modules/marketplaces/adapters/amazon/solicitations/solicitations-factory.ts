/**
 * Amazon Solicitations API Factory
 * 
 * Factory function for creating and registering a SolicitationsModule instance,
 * which provides functionality for requesting reviews and feedback from buyers
 * within Amazon's terms of service and policies.
 */
import { ModuleRegistry } from '../core/module-registry';
import { SolicitationsModule, SolicitationsModuleOptions } from './solicitations';
import { ApiRequestFunction } from '../core/base-module.interface';
import { getModuleDefaultVersion } from '../core/module-definitions';

/**
 * Creates and registers a SolicitationsModule
 * 
 * @param apiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param registry Module registry
 * @param apiVersion Optional API version
 * @param options Optional module configuration options
 * @returns The created SolicitationsModule instance
 */
export function createSolicitationsModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options: SolicitationsModuleOptions = {}
): SolicitationsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('solicitations') || 'v1';
  
  // Create the module
  const module = new SolicitationsModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module.moduleId, module);
  
  return module;
}