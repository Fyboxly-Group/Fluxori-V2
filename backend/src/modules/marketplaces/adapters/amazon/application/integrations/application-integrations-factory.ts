/**
 * Factory for creating Application Integrations API module
 */

import { ApplicationIntegrationsModule } from './application-integrations';
import { ModuleRegistry } from '../../core/module-registry';
import { getDefaultModuleVersion } from '../../core/module-definitions';

/**
 * Factory for creating Application Integrations API module
 */
export class ApplicationIntegrationsModuleFactory {
  /**
   * Create an Application Integrations module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createApplicationIntegrationsModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): ApplicationIntegrationsModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('applicationIntegrations') || '2024-04-01';
    
    // Create the module
    const module = new ApplicationIntegrationsModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}