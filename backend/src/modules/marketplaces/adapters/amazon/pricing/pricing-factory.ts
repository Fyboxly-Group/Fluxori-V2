/**
 * Amazon SP-API Product Pricing Module Factory
 * 
 * Factory function for creating and registering Product Pricing API module instances.
 */

import { ApiRequestFunction } from '../core/api-module';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/registry-helper';
import { ProductPricingModule } from './product-pricing';

/**
 * Creates and registers a Product Pricing module instance
 * 
 * @param registry Module registry to register the module with
 * @param makeApiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param apiVersion Optional API version (defaults to latest version if not specified)
 * @returns The created Product Pricing module instance
 */
export function createProductPricingModule(
  registry: ModuleRegistry,
  makeApiRequest: ApiRequestFunction,
  marketplaceId: string,
  apiVersion?: string
): ProductPricingModule {
  // Use provided version or get the default
  const version = apiVersion || getDefaultModuleVersion('productPricing') || '2022-05-01';
  
  // Create the module
  const module = new ProductPricingModule(
    version,
    makeApiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule(module);
  
  return module;
}