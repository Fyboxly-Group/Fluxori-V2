/**
 * Amazon Easy Ship Module Factory
 * 
 * Creates and registers the Amazon SP-API Easy Ship module.
 */

import { ApiRequestFunction } from '../core/api-module';
import { ModuleRegistry } from '../core/module-registry';
import { getModuleDefaultVersion } from '../core/registry-helper';
import { EasyShipModule } from './easy-ship';

/**
 * Creates and registers an Easy Ship module
 * 
 * @param apiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param registry Module registry to register the module with
 * @param apiVersion Optional API version override
 * @returns The created Easy Ship module instance
 */
export function createEasyShipModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): EasyShipModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('easyShip') || '2022-03-23';
  
  // Create the module
  const module = new EasyShipModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('easyShip', module);
  
  return module;
}