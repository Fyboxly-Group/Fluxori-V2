/**
 * Factory for creating Shipment Invoicing API module
 */

import { ShipmentInvoicingModule } from './shipment-invoicing';
import { ModuleRegistry } from '../../core/module-registry';
import { getDefaultModuleVersion } from '../../core/module-definitions';

/**
 * Factory for creating Shipment Invoicing API module
 */
export class ShipmentInvoicingModuleFactory {
  /**
   * Create a Shipment Invoicing module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createShipmentInvoicingModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): ShipmentInvoicingModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('shipmentInvoicing') || 'v0';
    
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
}