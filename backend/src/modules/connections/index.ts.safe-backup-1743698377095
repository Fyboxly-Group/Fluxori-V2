/**
 * Connections Module
 */
import connectionRoutes from './routes/connection.routes';
import credentialProvider from './utils/credential-provider';
import connectionService from './services/connection.service';
import MarketplaceConnection, { 
  AuthenticationType, 
  ConnectionStatus, 
  MarketplaceType,
  IMarketplaceConnection,
  IMarketplaceConnectionWithId
} from './models/connection.model';

// Export routes
export { connectionRoutes };

// Export utility for accessing credentials
export { credentialProvider };

// Export service for advanced usage
export { connectionService };

// Export models and types
export {
  MarketplaceConnection,
  AuthenticationType,
  ConnectionStatus,
  MarketplaceType,
  IMarketplaceConnection,
  IMarketplaceConnectionWithId
};

/**
 * Function for marketplace adapters to get credentials
 */
export const getMarketplaceCredentials = credentialProvider.getMarketplaceCredentials.bind(credentialProvider);

// Type exports
// Re-exporting connection types with proper aliases to avoid conflicts
export type IConnection = IMarketplaceConnection;
export type IConnectionWithId = IMarketplaceConnectionWithId;