/**
 * Amazon Inventory Planning Module Factory
 * 
 * Factory function for creating and registering an Amazon Inventory Planning module.
 */

import { InventoryPlanningModule, InventoryPlanningModuleOptions } from './inventory-planning';
import { ApiRequestFunction } from '../../../core/base-module.interface';
import { ModuleRegistry } from '../../../core/module-registry';
import { getModuleDefaultVersion } from '../../../core/module-definitions';

/**
 * Creates and registers an Inventory Planning module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @param options Optional module-specific options
 * @returns The created Inventory Planning module
 */
export function createInventoryPlanningModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options: InventoryPlanningModuleOptions = {}
): InventoryPlanningModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('inventory-planning') || 'v1';
  
  // Create the module
  const module = new InventoryPlanningModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module.moduleId, module);
  
  return module;
}