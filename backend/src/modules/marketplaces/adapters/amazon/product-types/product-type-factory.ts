/**
 * Factory for creating Product Type Definitions module
 */
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';
import { ProductTypeDefinitionsModule } from './product-type-definitions';

/**
 * Create a Product Type Definitions module
 * 
 * @param apiRequest - Function to make Amazon API requests
 * @param marketplaceId - Amazon marketplace ID
 * @param registry - Module registry for Amazon modules
 * @param apiVersion - Optional API version to use (defaults to latest)
 * @returns ProductTypeDefinitionsModule instance
 */
export function createProductTypeDefinitionsModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): ProductTypeDefinitionsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('productTypeDefinitions') || '2020-09-01';
  
  // Create the module
  const module = new ProductTypeDefinitionsModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('productTypeDefinitions', module);
  
  return module;
}

export default createProductTypeDefinitionsModule;