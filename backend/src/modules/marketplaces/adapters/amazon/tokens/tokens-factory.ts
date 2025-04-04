/**
 * Amazon Tokens API Factory
 * 
 * Factory function for creating and registering an Amazon Tokens API module.
 */

import { TokensModule, TokensModuleOptions } from './tokens';
import { ApiRequestFunction } from '../../../core/base-module.interface';
import { ModuleRegistry } from '../../../core/module-registry';
import { getModuleDefaultVersion } from '../../../core/module-definitions';

/**
 * Creates and registers a Tokens module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @param options Optional module-specific options
 * @returns The created Tokens module
 */
export function createTokensModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options: TokensModuleOptions = {}
): TokensModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('tokens') || '2021-03-01';
  
  // Create the module
  const module = new TokensModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module.moduleId, module);
  
  return module;
}