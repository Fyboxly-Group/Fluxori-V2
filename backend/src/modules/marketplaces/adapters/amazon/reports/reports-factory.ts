/**
 * Factory for creating reports-related API modules
 */

import { ReportsModule } from './reports';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating reports-related API modules
 */
export class ReportsModuleFactory {
  /**
   * Create a Reports module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createReportsModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): ReportsModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('reports') || '2021-06-30';
    
    // Create the module
    const module = new ReportsModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}