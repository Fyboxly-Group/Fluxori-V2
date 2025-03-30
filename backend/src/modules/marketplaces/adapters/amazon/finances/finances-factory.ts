/**
 * Factory for creating finances-related API modules
 */

import { FinancesModule } from './finances';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating finances-related API modules
 */
export class FinancesModuleFactory {
  /**
   * Create a Finances module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createFinancesModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): FinancesModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('finances') || '2024-06-19';
    
    // Create the module
    const module = new FinancesModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}