/**
 * Factory function for creating Fulfillment Outbound module
 * 
 * Creates and optionally registers a new FulfillmentOutboundModule instance
 * with the provided configuration.
 * 
 * @param apiRequest API request function to use
 * @param marketplaceId Amazon marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version (defaults to latest)
 * @param options Optional module configuration options
 * @returns Configured FulfillmentOutboundModule instance
 */
import { FulfillmentOutboundModule, FulfillmentOutboundModuleOptions } from './fulfillment-outbound';
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';

export function createFulfillmentOutboundModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options?: FulfillmentOutboundModuleOptions
): FulfillmentOutboundModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('fulfillmentOutbound') || '2020-07-01';
  
  // Create the module
  const module = new FulfillmentOutboundModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule('fulfillmentOutbound', module);
  
  return module;
}