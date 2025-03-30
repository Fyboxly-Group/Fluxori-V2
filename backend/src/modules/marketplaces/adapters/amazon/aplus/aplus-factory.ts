/**
 * Factory for creating A+ Content API module
 */

import { APlusContentModule } from './aplus-content';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating A+ Content API module
 */
export class APlusContentModuleFactory {
  /**
   * Create an A+ Content module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createAPlusContentModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): APlusContentModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('aplus') || '2020-11-01';
    
    // Create the module
    const module = new APlusContentModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}