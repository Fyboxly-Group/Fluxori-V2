/**
 * Factory for creating Uploads module
 */
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';
import { UploadsModule } from './uploads';

/**
 * Create an Uploads module
 * 
 * @param apiRequest - Function to make Amazon API requests
 * @param marketplaceId - Amazon marketplace ID
 * @param registry - Module registry for Amazon modules
 * @param apiVersion - Optional API version to use (defaults to latest)
 * @returns UploadsModule instance
 */
export function createUploadsModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): UploadsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('uploads') || '2020-11-01';
  
  // Create the module
  const module = new UploadsModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('uploads', module);
  
  return module;
}

export default createUploadsModule;