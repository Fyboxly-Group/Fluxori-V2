/**
 * Factory for creating and registering an Amazon A+ Content API module
 */
import { ModuleRegistry } from '../core/module-registry';
import { APlusContentModule, APlusContentModuleOptions } from './aplus-content';
import { ApiRequestFunction } from '../core/base-module.interface';
import { getModuleDefaultVersion } from '../core/registry-helper';

/**
 * Creates a new A+ Content module, registers it in the provided registry, and returns it
 * 
 * @param apiVersion API version to use, or undefined to use the default
 * @param makeApiRequest Function to make API requests
 * @param marketplaceId Amazon marketplace ID
 * @param registry Module registry to register the module in
 * @param options Additional module options
 * @returns The created A+ Content module
 */
export function createAPlusContentModule(
  apiVersion: string | undefined,
  makeApiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  options: APlusContentModuleOptions = {}
): APlusContentModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('aplus') || '2020-11-01';
  
  // Create the module
  const module = new APlusContentModule(
    version,
    makeApiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module);
  
  return module;
}