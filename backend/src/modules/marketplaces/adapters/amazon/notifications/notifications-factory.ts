/**
 * Amazon Notifications API Factory
 * 
 * Factory function for creating and registering an Amazon Notifications API module.
 */

import { NotificationsModule, NotificationsModuleOptions } from './notifications';
import { ApiRequestFunction } from '../../../core/base-module.interface';
import { ModuleRegistry } from '../../../core/module-registry';
import { getModuleDefaultVersion } from '../../../core/module-definitions';

/**
 * Creates and registers a Notifications module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @param options Optional module-specific options
 * @returns The created Notifications module
 */
export function createNotificationsModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options: NotificationsModuleOptions = {}
): NotificationsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('notifications') || 'v1';
  
  // Create the module
  const module = new NotificationsModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module.moduleId, module);
  
  return module;
}