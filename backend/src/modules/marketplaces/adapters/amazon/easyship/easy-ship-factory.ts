/**
 * Factory for creating Easy Ship API module
 */

import { EasyShipModule } from './easy-ship';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating Easy Ship API module
 */
export class EasyShipModuleFactory {
  /**
   * Create an Easy Ship module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createEasyShipModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): EasyShipModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('easyShip') || '2022-03-23';
    
    // Create the module
    const module = new EasyShipModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}