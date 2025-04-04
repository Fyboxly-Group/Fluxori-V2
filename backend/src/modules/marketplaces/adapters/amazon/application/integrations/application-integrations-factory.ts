/**
 * Factory function for creating an ApplicationIntegrationsModule instance
 * 
 * @param apiRequest Function to make API requests
 * @param marketplaceId Marketplace ID
 * @param registry Module registry
 * @param apiVersion Optional API version
 * @returns ApplicationIntegrationsModule instance
 */
import { ModuleRegistry } from '../../core/module-registry';
import { ApplicationIntegrationsModule } from './application-integrations';
import { getModuleDefaultVersion } from '../../core/registry-helper';
import { ApiRequestFunction } from '../../core/api-module';

export function createApplicationIntegrationsModule(
  apiRequest: ApiRequestFunction,
  marketplaceId: string,
  registry: ModuleRegistry,
  apiVersion?: string
): ApplicationIntegrationsModule {
  // Use provided version or get the default
  const version = apiVersion || getModuleDefaultVersion('applicationIntegrations') || '2024-04-01';
  
  // Create the module
  const module = new ApplicationIntegrationsModule(
    version,
    apiRequest,
    marketplaceId
  );
  
  // Register the module
  registry.registerModule('applicationIntegrations', module);
  
  return module;
}