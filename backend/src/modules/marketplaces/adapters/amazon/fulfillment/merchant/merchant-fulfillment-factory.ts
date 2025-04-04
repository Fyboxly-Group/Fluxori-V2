/**
 * Amazon Merchant Fulfillment API Factory
 * 
 * Factory function for creating and registering an Amazon Merchant Fulfillment API module.
 */

import { MerchantFulfillmentModule } from './merchant-fulfillment';
import { ApiRequestFunction } from '../../../core/base-module.interface';
import { ModuleRegistry } from '../../../core/module-registry';
import { getModuleDefaultVersion } from '../../../core/module-definitions';

/**
 * Creates and registers a Merchant Fulfillment module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @returns The created Merchant Fulfillment module
 */
export function createMerchantFulfillmentModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): MerchantFulfillmentModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('merchantFulfillment') || 'v0';
  
  // Create the module
  const module = new MerchantFulfillmentModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('merchantFulfillment', module);
  
  return module;
}