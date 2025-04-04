/**
 * Amazon Fulfillment Inbound Module Factory
 * 
 * Factory function for creating and registering Fulfillment Inbound API module instances.
 */

import { ApiRequestFunction } from '../../core/base-module.interface';
import { ModuleRegistry } from '../../core/module-registry';
import { getModuleDefaultVersion } from '../../core/module-definitions';
import { FulfillmentInboundModule, FulfillmentInboundModuleOptions } from './fulfillment-inbound';

/**
 * Creates and registers a Fulfillment Inbound module instance
 * 
 * @param apiVersion Optional API version (defaults to latest version if not specified)
 * @param makeApiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param registry Module registry to register the module with
 * @param options Module-specific options
 * @returns The created Fulfillment Inbound module instance
 */
export function createFulfillmentInboundModule(
  apiVersion: string | undefined,
  makeApiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  options: FulfillmentInboundModuleOptions = {}
): FulfillmentInboundModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('fulfillmentInbound') || '2020-10-01';
  
  // Create the module
  const module = new FulfillmentInboundModule(
    version,
    makeApiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module.moduleId, module);
  
  return module;
}