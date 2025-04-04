/**
 * Factory function for creating VendorsModule instances
 * 
 * @param apiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param registry Module registry
 * @param apiVersion Optional API version
 * @returns VendorsModule instance
 */
import { ModuleRegistry } from '../core/module-registry';
import { VendorsModule } from './vendors';
import { getModuleDefaultVersion } from '../core/registry-helper';
import { ApiRequestFunction } from '../core/api-module';

export function createVendorsModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): VendorsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('vendors') || 'v1';
  
  // Create the module
  const module = new VendorsModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('vendors', module);
  
  return module;
}