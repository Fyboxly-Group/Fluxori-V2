/**
 * Factory function for creating an ApplicationManagementModule instance
 * 
 * @param apiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param registry Module registry
 * @param apiVersion Optional API version
 * @returns ApplicationManagementModule instance
 */
import { ModuleRegistry } from '../core/module-registry';
import { ApplicationManagementModule, ApiRequestFunction, ApplicationManagementModuleOptions } from './application-management';
import { getModuleDefaultVersion } from '../core/module-definitions';

export function createApplicationManagementModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options?: ApplicationManagementModuleOptions
): ApplicationManagementModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('applicationManagement') || '2023-11-30';
  
  // Create the module
  const module = new ApplicationManagementModule(
    version,
    apiRequest,
    marketplaceId,
    options || {}
  );
  
  // Register the module
  registry.registerModule('applicationManagement', module);
  
  return module;
}