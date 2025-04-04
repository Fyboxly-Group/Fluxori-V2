/**
 * Factory for creating Product Types module
 */
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';
import { ProductTypesModule } from './product-types';
import { createProductTypeDefinitionsModule } from './product-type-factory';

/**
 * Factory class for creating Product Types module
 */
export class ProductTypesModuleFactory {
  /**
   * Create a new Product Types module
   * 
   * @param apiRequest - Function to make Amazon API requests
   * @param marketplaceId - Amazon marketplace ID
   * @param registry - Module registry for Amazon modules
   * @param apiVersion - Optional API version to use (defaults to latest)
   * @returns ProductTypesModule instance
   */
  public static createModule(
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): ProductTypesModule {
    // Use provided version or get the default
    const version = apiVersion || getModuleDefaultVersion('productTypeDefinitions') || '2020-09-01';
    
    // First, create the definitions module that we need as a dependency
    const definitionsModule = createProductTypeDefinitionsModule(
      apiRequest,
      marketplaceId,
      registry,
      version
    );
    
    // Create the product types module with the definitions module
    const module = new ProductTypesModule(
      version,
      apiRequest,
      marketplaceId,
      definitionsModule
    );
    
    // Register the module
    registry.registerModule('productTypes', module);
    
    return module;
  }
}

export default ProductTypesModuleFactory;