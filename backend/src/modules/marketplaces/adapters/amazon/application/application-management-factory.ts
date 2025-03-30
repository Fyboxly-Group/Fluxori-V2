/**
 * Factory for creating Application Management API module
 */

import { ApplicationManagementModule } from './application-management';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating Application Management API module
 */
export class ApplicationManagementModuleFactory {
  /**
   * Create an Application Management module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createApplicationManagementModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): ApplicationManagementModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('applicationManagement') || '2023-11-30';
    
    // Create the module
    const module = new ApplicationManagementModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}