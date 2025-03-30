/**
 * Factory for creating Data Kiosk API module
 */

import { DataKioskModule } from './data-kiosk';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating Data Kiosk API module
 */
export class DataKioskModuleFactory {
  /**
   * Create a Data Kiosk module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createDataKioskModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): DataKioskModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('dataKiosk') || '2023-11-15';
    
    // Create the module
    const module = new DataKioskModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}