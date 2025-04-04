/**
 * Amazon Data Kiosk API Factory
 * 
 * Factory for creating and registering Amazon Data Kiosk API module instances.
 * The Data Kiosk API allows querying Amazon's data repositories for business insights.
 */

import { DataKioskModule } from './data-kiosk';
import { ApiRequestFunction } from '../core/base-module.interface';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/module-definitions';

/**
 * Creates and registers a Data Kiosk API module
 * 
 * @param apiRequest Function to make API requests
 * @param marketplaceId Amazon marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @returns The created Data Kiosk module
 */
export function createDataKioskModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): DataKioskModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('dataKiosk') || '2023-11-15';
  
  // Create the module
  const module = new DataKioskModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('dataKiosk', module as any);
  
  return module;
}