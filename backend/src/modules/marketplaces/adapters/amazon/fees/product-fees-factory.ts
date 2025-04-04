/**
 * Amazon Product Fees API Factory
 * 
 * Factory function for creating and registering an Amazon Product Fees API module.
 */

import { ProductFeesModule, ProductFeesModuleOptions } from './product-fees';
import { ApiRequestFunction } from '../../../core/base-module.interface';
import { ModuleRegistry } from '../../../core/module-registry';
import { getModuleDefaultVersion } from '../../../core/module-definitions';

/**
 * Creates and registers a Product Fees module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @param options Optional module-specific configuration
 * @returns The created Product Fees module
 */
export function createProductFeesModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options?: ProductFeesModuleOptions
): ProductFeesModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('productFees') || 'v0';
  
  // Create the module
  const module = new ProductFeesModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule('productFees', module);
  
  return module;
}