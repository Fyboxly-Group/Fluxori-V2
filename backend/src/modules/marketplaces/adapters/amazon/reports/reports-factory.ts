/**
 * Factory function for creating Reports module
 * 
 * Creates and optionally registers a new ReportsModule instance
 * with the provided configuration.
 * 
 * @param apiRequest API request function to use
 * @param marketplaceId Amazon marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version (defaults to latest)
 * @param options Optional module configuration options
 * @returns Configured ReportsModule instance
 */
import { ReportsModule, ReportsModuleOptions } from './reports';
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';

export function createReportsModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options?: ReportsModuleOptions
): ReportsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('reports') || '2021-06-30';
  
  // Create the module
  const module = new ReportsModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule('reports', module);
  
  return module;
}