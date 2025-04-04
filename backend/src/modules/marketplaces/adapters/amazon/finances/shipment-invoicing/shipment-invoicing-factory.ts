/**
 * Amazon SP-API Shipment Invoicing Module Factory
 * 
 * Factory class for creating and registering Shipment Invoicing API module instances.
 */

import { ApiRequestFunction } from '../../core/api-module';
import { ModuleRegistry } from '../../core/module-registry';
import { getDefaultModuleVersion } from '../../core/registry-helper';
import { ShipmentInvoicingModule } from './shipment-invoicing';

/**
 * Creates and registers a Shipment Invoicing module instance
 * 
 * @param registry Module registry to register the module with
 * @param makeApiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param apiVersion Optional API version (defaults to latest version if not specified)
 * @returns The created Shipment Invoicing module instance
 */
export function createShipmentInvoicingModule(
  registry: ModuleRegistry,
  makeApiRequest: ApiRequestFunction,
  marketplaceId: string,
  apiVersion?: string
): ShipmentInvoicingModule {
  // Use provided version or get the default
  const version = apiVersion || getDefaultModuleVersion('shipmentInvoicing') || '2020-09-04';
  
  // Create the module
  const module = new ShipmentInvoicingModule(
    version,
    makeApiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule(module);
  
  return module;
}