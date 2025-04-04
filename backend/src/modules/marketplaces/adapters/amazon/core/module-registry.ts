/**
 * Module Registry for Amazon SP-API modules
 * 
 * This registry manages a collection of SP-API modules and provides
 * methods for creating, registering, and retrieving them.
 */
import { BaseModule, ApiRequestFunction } from './base-module.interface';
import { ModuleDefinition, getModuleDefaultVersion } from './module-definitions';

/**
 * Factory function type for creating modules
 */
export type ModuleFactory<T = any> = (
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  options: T
) => BaseModule<T>;

/**
 * Registry for Amazon SP-API modules
 */
export class ModuleRegistry {
  /**
   * Map of module IDs to their instances
   */
  private modules: Map<string, BaseModule> = new Map();
  
  /**
   * Map of module IDs to their factory functions
   */
  private moduleFactories: Map<string, ModuleFactory<any>> = new Map();
  
  /**
   * Register a new module factory
   * 
   * @param moduleId - The unique ID for this module
   * @param factory - Factory function that creates the module
   */
  public registerModuleFactory<T>(
    moduleId: string, 
    factory: ModuleFactory<T>
  ): void {
    this.moduleFactories.set(moduleId, factory as ModuleFactory<any>);
  }
  
  /**
   * Get a module factory by ID
   * 
   * @param moduleId - The ID of the module to get
   * @returns The module factory, or undefined if not found
   */
  public getModuleFactory<T>(moduleId: string): ModuleFactory<T> | undefined {
    return this.moduleFactories.get(moduleId) as ModuleFactory<T> | undefined;
  }
  
  /**
   * Create a module instance
   * 
   * @param definition - The module definition
   * @param apiRequest - The API request function to use
   * @param marketplaceId - The Amazon marketplace ID
   * @returns The created module instance
   */
  public createModule<T>(
    definition: ModuleDefinition<T>,
    apiRequest: ApiRequestFunction,
    marketplaceId: string
  ): BaseModule<T> {
    const factory = this.getModuleFactory<T>(definition.moduleId);
    
    if (!factory) {
      throw new Error(`Module factory not found for module ID: ${definition.moduleId}`);
    }
    
    return factory(apiRequest, marketplaceId, definition.options || {} as T);
  }
  
  /**
   * Register a module in the registry
   * 
   * @param moduleId - The unique ID for this module
   * @param module - The module instance or a factory function that returns it
   */
  public registerModule(
    moduleId: string,
    module: BaseModule | (() => BaseModule)
  ): void {
    // If module is a factory function, call it to get the instance
    const moduleInstance = typeof module === 'function' ? module() : module;
    
    // Register the module
    this.modules.set(moduleId, moduleInstance);
  }
  
  /**
   * Get a module by ID
   * 
   * @param moduleId - The ID of the module to get
   * @returns The module instance, or undefined if not found
   */
  public getModule<T = any>(moduleId: string): BaseModule<T> | undefined {
    return this.modules.get(moduleId) as BaseModule<T> | undefined;
  }
  
  /**
   * Check if a module exists in the registry
   * 
   * @param moduleId - The ID of the module to check
   * @returns True if the module exists, false otherwise
   */
  public hasModule(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }
  
  /**
   * Get all modules in the registry
   * 
   * @returns Array of all registered modules
   */
  public getAllModules(): BaseModule[] {
    return Array.from(this.modules.values());
  }
  
  /**
   * Get all module IDs in the registry
   * 
   * @returns Array of all registered module IDs
   */
  public getAllModuleIds(): string[] {
    return Array.from(this.modules.keys());
  }
  
  /**
   * Get modules by a filter function
   * 
   * @param filterFn - Function to filter modules
   * @returns Array of modules that match the filter
   */
  public getModulesByFilter(filterFn: (module: BaseModule) => boolean): BaseModule[] {
    return this.getAllModules().filter(filterFn);
  }
  
  /**
   * Remove a module from the registry
   * 
   * @param moduleId - The ID of the module to remove
   * @returns True if the module was removed, false if it did not exist
   */
  public removeModule(moduleId: string): boolean {
    return this.modules.delete(moduleId);
  }
  
  /**
   * Clear all modules from the registry
   */
  public clearModules(): void {
    this.modules.clear();
  }
  
  /**
   * Get the count of registered modules
   * 
   * @returns The number of registered modules
   */
  public getModuleCount(): number {
    return this.modules.size;
  }
  
  /**
   * Create and register a module from a definition
   * 
   * @param definition - The module definition
   * @param apiRequest - The API request function to use
   * @param marketplaceId - The Amazon marketplace ID
   * @returns The created and registered module
   */
  public createAndRegisterModule<T>(
    definition: ModuleDefinition<T>,
    apiRequest: ApiRequestFunction,
    marketplaceId: string
  ): BaseModule<T> {
    // Create the module
    const module = this.createModule(definition, apiRequest, marketplaceId);
    
    // Register it
    this.registerModule(definition.moduleId, module);
    
    return module;
  }
  
  /**
   * Check if a module exists and create it if not
   * 
   * @param definition - The module definition
   * @param apiRequest - The API request function to use
   * @param marketplaceId - The Amazon marketplace ID
   * @returns The existing or newly created module
   */
  public getOrCreateModule<T>(
    definition: ModuleDefinition<T>,
    apiRequest: ApiRequestFunction,
    marketplaceId: string
  ): BaseModule<T> {
    // Check if module exists
    const existingModule = this.getModule<T>(definition.moduleId);
    if (existingModule) {
      return existingModule;
    }
    
    // Create and register the module
    return this.createAndRegisterModule(definition, apiRequest, marketplaceId);
  }
  
  /**
   * Get the API version used by a module
   * 
   * @param moduleId - The ID of the module
   * @returns The API version, or undefined if not found
   */
  public getModuleVersion(moduleId: string): string | undefined {
    const module = this.getModule(moduleId);
    return module?.apiVersion;
  }
  
  /**
   * Set a specific API version for a module
   * 
   * @param moduleId - The ID of the module to update
   * @param version - The API version to use
   * @param apiRequest - The API request function to use
   * @param marketplaceId - The Amazon marketplace ID
   * @param options - Additional module options
   * @returns The updated module
   */
  public setModuleVersion<T>(
    moduleId: string,
    version: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options?: T
  ): BaseModule<T> {
    // Remove the existing module
    this.removeModule(moduleId);
    
    // Create a new factory with the specified version
    const factory = this.getModuleFactory<T>(moduleId);
    if (!factory) {
      throw new Error(`Module factory not found for module ID: ${moduleId}`);
    }
    
    // Create the module with the specified version
    const module = factory(apiRequest, marketplaceId, { 
      ...options,
      apiVersion: version 
    } as any);
    
    // Register the module
    this.registerModule(moduleId, module);
    
    return module;
  }
  
  /**
   * Reset a module to use its default version
   * 
   * @param moduleId - The ID of the module to reset
   * @param apiRequest - The API request function to use
   * @param marketplaceId - The Amazon marketplace ID
   * @param options - Additional module options
   * @returns The reset module
   */
  public resetModuleVersion<T>(
    moduleId: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options?: T
  ): BaseModule<T> {
    const defaultVersion = getModuleDefaultVersion(moduleId);
    if (!defaultVersion) {
      throw new Error(`Default version not found for module ID: ${moduleId}`);
    }
    
    return this.setModuleVersion(moduleId, defaultVersion, apiRequest, marketplaceId, options);
  }
}

export default ModuleRegistry;