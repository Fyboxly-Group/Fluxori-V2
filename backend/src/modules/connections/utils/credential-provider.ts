import connectionService, { ConnectionServiceWithDirectAccess } from '../services/connection.service';
import { MarketplaceCredentials } from '../../marketplaces/models/marketplace.models';

/**
 * Utility for retrieving marketplace credentials
 */
class CredentialProvider {
  /**
   * Get the credentials for a specific marketplace
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param marketplaceId - Marketplace ID
   * @returns Marketplace credentials
   */
  public async getMarketplaceCredentials(
    userId: string,
    organizationId: string,
    marketplaceId: string
  ): Promise<MarketplaceCredentials> {
    return connectionService.getMarketplaceCredentials(userId, organizationId, marketplaceId);
  }
}

export default new CredentialProvider();