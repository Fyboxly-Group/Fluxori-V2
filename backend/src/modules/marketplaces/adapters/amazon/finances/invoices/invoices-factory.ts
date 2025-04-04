/**
 * Amazon SP-API Invoices Module Factory
 * 
 * Factory class for creating and registering Invoices API module instances.
 */

import { ApiRequestFunction } from '../../core/api-module';
import { ModuleRegistry } from '../../core/module-registry';
import { getDefaultModuleVersion } from '../../core/registry-helper';
import { InvoicesModule } from './invoices';

/**
 * Creates and registers an Invoices module instance
 * 
 * @param registry Module registry to register the module with
 * @param makeApiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param apiVersion Optional API version (defaults to latest version if not specified)
 * @returns The created Invoices module instance
 */
export function createInvoicesModule(
  registry: ModuleRegistry,
  makeApiRequest: ApiRequestFunction,
  marketplaceId: string,
  apiVersion?: string
): InvoicesModule {
  // Use provided version or get the default
  const version = apiVersion || getDefaultModuleVersion('invoices') || '2021-12-01';
  
  // Create the module
  const module = new InvoicesModule(
    version,
    makeApiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule(module);
  
  return module;
}