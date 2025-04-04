/**
 * Amazon Messaging API Factory
 * 
 * Factory function for creating and registering an Amazon Messaging API module.
 */

import { MessagingModule, MessagingModuleOptions } from './messaging';
import { ApiRequestFunction } from '../../../core/base-module.interface';
import { ModuleRegistry } from '../../../core/module-registry';
import { getModuleDefaultVersion } from '../../../core/module-definitions';

/**
 * Creates and registers a Messaging module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @param options Optional module-specific configuration
 * @returns The created Messaging module
 */
export function createMessagingModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options?: MessagingModuleOptions
): MessagingModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('messaging') || 'v1';
  
  // Create the module
  const module = new MessagingModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule('messaging', module);
  
  return module;
}