/**
 * Factory for creating Messaging API module
 */

import { MessagingModule } from './messaging';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating Messaging API module
 */
export class MessagingModuleFactory {
  /**
   * Create a Messaging module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createMessagingModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): MessagingModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('messaging') || 'v1';
    
    // Create the module
    const module = new MessagingModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}