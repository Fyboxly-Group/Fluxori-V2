/**
 * Factory for creating Tokens API module
 */

import { TokensModule } from './tokens';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating Tokens API module
 */
export class TokensModuleFactory {
  /**
   * Create a Tokens module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createTokensModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): TokensModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('tokens') || '2021-03-01';
    
    // Create the module
    const module = new TokensModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}