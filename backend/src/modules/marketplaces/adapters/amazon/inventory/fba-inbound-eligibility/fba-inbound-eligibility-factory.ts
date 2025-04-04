/**
 * Amazon FBA Inbound Eligibility API Factory
 * 
 * Factory function for creating and registering an Amazon FBA Inbound Eligibility API module.
 */

import { FBAInboundEligibilityModule, FBAInboundEligibilityModuleOptions } from './fba-inbound-eligibility';
import { ApiRequestFunction } from '../../../core/base-module.interface';
import { ModuleRegistry } from '../../../core/module-registry';
import { getModuleDefaultVersion } from '../../../core/module-definitions';

/**
 * Creates and registers an FBA Inbound Eligibility module
 * 
 * @param apiRequest API request function
 * @param marketplaceId Marketplace ID
 * @param registry Module registry for registration
 * @param apiVersion Optional API version to use
 * @param options Optional module-specific options
 * @returns The created FBA Inbound Eligibility module
 */
export function createFBAInboundEligibilityModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string,
  options: FBAInboundEligibilityModuleOptions = {}
): FBAInboundEligibilityModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('fbaInboundEligibility') || 'v1';
  
  // Create the module
  const module = new FBAInboundEligibilityModule(
    version,
    apiRequest,
    marketplaceId,
    options
  );
  
  // Register the module
  registry.registerModule(module.moduleId, module);
  
  return module;
}