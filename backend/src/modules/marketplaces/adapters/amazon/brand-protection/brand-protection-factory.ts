/**
 * Factory for creating and registering an Amazon Brand Protection API module
 */
import { ModuleRegistry } from '../core/module-registry';
import { BrandProtectionModule, BrandProtectionModuleOptions } from './brand-protection';
import { ApiRequestFunction } from '../core/base-module.interface';
import { getModuleDefaultVersion } from '../core/registry-helper';

/**
 * Creates a new Brand Protection module, registers it in the provided registry, and returns it
 * 
 * @param apiVersion API version to use, or undefined to use the default
 * @param makeApiRequest Function to make API requests
 * @param marketplaceId Amazon marketplace ID
 * @param registry Module registry to register the module in
 * @param options Additional module options
 * @returns The created Brand Protection module
 */
export function createBrandProtectionModule(
  apiVersion: string | undefined,
  makeApiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  options: BrandProtectionModuleOptions = {}
): BrandProtectionModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('brandProtection') || 'v1';
  
  // Create the module
  const module = new BrandProtectionModule(
    version,
    makeApiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module);
  
  return module;
}