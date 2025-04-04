/**
 * Helper utilities for working with the Amazon SP-API Module Registry
 */
import { ModuleRegistry } from './module-registry';
import { BaseModule, ApiRequestFunction } from './base-module.interface';
import { SP_API_MODULES, ModuleDefinition, getModuleDefinitionById } from './module-definitions';

/**
 * Module category types for registration by category
 */
export type ModuleCategory = 
  'all' | 
  'catalog' | 
  'inventory' | 
  'orders' | 
  'pricing' | 
  'listings' | 
  'reports' | 
  'feeds' | 
  'finances' | 
  'account' | 
  'fulfillment' | 
  'specialized';

/**
 * Module factory mock implementation for TypeScript purposes
 * Each actual module would have its own factory implementation
 */
export interface ModuleFactoryInterface {
  /**
   * Register all modules from this factory into the registry
   */
  registerModules(
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    registry: ModuleRegistry
  ): void;
}

/**
 * Registry for keeping track of module factory implementations
 */
export const ModuleFactoryRegistry: Record<string, ModuleFactoryInterface> = {};

/**
 * Initialize a module registry with modules for a specific category
 * 
 * @param apiRequest - The API request function to use
 * @param marketplaceId - The Amazon marketplace ID
 * @param category - The category of modules to initialize, or 'all' for all modules
 * @returns An initialized module registry
 */
export async function initializeModuleRegistry(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  category: ModuleCategory = 'all'
): Promise<ModuleRegistry> {
  // Create module registry
  const registry = new ModuleRegistry();
  
  // Get category module definitions
  const categoryModules = getCategoryModules(category);
  
  // Register modules
  for (const moduleDefinition of categoryModules) {
    try {
      // Create module instance
      const module = registry.createModule(
        moduleDefinition,
        apiRequest,
        marketplaceId
      );
      
      // Register module in registry
      registry.registerModule(moduleDefinition.moduleId, () => module);
    } catch (error) {
      console.error(`Failed to initialize module ${moduleDefinition.name}:`, error);
    }
  }
  
  return registry;
}

/**
 * Get module definitions for a specific category
 * 
 * @param category - The category of modules to get
 * @returns Array of module definitions in the category
 */
export function getCategoryModules(category: ModuleCategory): ModuleDefinition[] {
  if (category === 'all') {
    return SP_API_MODULES;
  }
  
  const categoryMap: Record<Exclude<ModuleCategory, 'all'>, string[]> = {
    catalog: ['catalogItems', 'productTypeDefinitions', 'aplus'],
    inventory: ['fbaInventory', 'fbaSmallAndLight', 'fbaInboundEligibility', 'supplySource', 'replenishment', 'warehouseAndDistribution'],
    orders: ['orders'],
    pricing: ['productPricing', 'productFees'],
    listings: ['listingsItems', 'listingsRestrictions'],
    reports: ['reports', 'dataKiosk', 'sales'],
    feeds: ['feeds'],
    finances: ['finances', 'invoices', 'shipmentInvoicing'],
    account: ['notifications', 'sellers', 'messaging', 'solicitations', 'tokens', 'uploads', 'authorization', 'applicationManagement', 'applicationIntegrations'],
    fulfillment: ['fulfillmentInbound', 'fulfillmentOutbound', 'merchantFulfillment', 'easyShip'],
    specialized: ['b2b', 'brandProtection']
  };
  
  const moduleIds = categoryMap[category] || [];
  return moduleIds.map(id => {
    const definition = getModuleDefinitionById(id);
    if (!definition) {
      throw new Error(`Module definition not found for ID: ${id}`);
    }
    return definition;
  });
}

/**
 * Create a specific module by ID
 * 
 * @param moduleId - The ID of the module to create
 * @param apiRequest - The API request function to use
 * @param marketplaceId - The Amazon marketplace ID
 * @returns The created module
 */
export function createModuleById(
  moduleId: string,
  apiRequest: ApiRequestFunction,
  marketplaceId: string
): BaseModule {
  const definition = getModuleDefinitionById(moduleId);
  if (!definition) {
    throw new Error(`Module definition not found for ID: ${moduleId}`);
  }
  
  // Create module registry
  const registry = new ModuleRegistry();
  
  // Create and return module
  return registry.createModule(definition, apiRequest, marketplaceId);
}

/**
 * Get all modules by category
 * 
 * @param registry - The module registry
 * @param category - The category of modules to get
 * @returns Array of modules in the category
 */
export function getModulesByCategory(
  registry: ModuleRegistry,
  category: ModuleCategory
): BaseModule[] {
  const moduleIds = getCategoryModules(category).map(def => def.moduleId);
  return moduleIds.map(id => registry.getModule(id)).filter(Boolean) as BaseModule[];
}

/**
 * Register a module factory implementation
 * 
 * @param factoryName - The name of the factory
 * @param factory - The factory implementation
 */
export function registerModuleFactory(
  factoryName: string,
  factory: ModuleFactoryInterface
): void {
  ModuleFactoryRegistry[factoryName] = factory;
}

/**
 * Get a module factory by name
 * 
 * @param factoryName - The name of the factory
 * @returns The factory implementation, or undefined if not found
 */
export function getModuleFactory(
  factoryName: string
): ModuleFactoryInterface | undefined {
  return ModuleFactoryRegistry[factoryName];
}