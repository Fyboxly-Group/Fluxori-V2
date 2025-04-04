import { Injectable } from '../../../decorators/injectable.decorator';
import { Types } from 'mongoose';
import { XeroClient, AccountingAPI, TokenSet } from 'xero-node';
import { XeroConfigService } from './xero-config.service';
import { XeroConnection } from '../models/xero-connection.model';
import { Timestamp } from 'firebase-admin/firestore';
import { XeroOAuthState, XeroTokenResponse } from '../types';

/**
 * Service for Xero authentication
 */
@Injectable()
export class XeroAuthService {
  constructor(private configService: XeroConfigService) {}
  
  /**
   * Get accounting API client for the given organizationId
   */
  async getClient(organizationId: Types.ObjectId): Promise<AccountingAPI> {
    // Get Xero config for the organization
    const config = await this.configService.getXeroConfig(organizationId);
    
    // Create and initialize Xero client
    const xeroClient = new XeroClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUris: [config.redirectUri],
      scopes: config.scopes,
      state: 'xero-auth',
    });
    
    // Set tokens
    xeroClient.setTokenSet({
      access_token: config.accessToken,
      refresh_token: config.refreshToken,
      id_token: config.idToken,
      expires_in: config.expiresIn,
      token_type: 'Bearer',
    });
    
    // Return accounting API instance
    return xeroClient.accountingApi;
  }

  /**
   * Create authorization URL for OAuth flow
   */
  async createAuthUrl(state: XeroOAuthState): Promise<string> {
    // Get Xero config for the organization
    const config = await this.configService.getXeroConfig(
      new Types.ObjectId(state.organizationId)
    );
    
    // Create Xero client
    const xeroClient = new XeroClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUris: [config.redirectUri],
      scopes: config.scopes,
      state: JSON.stringify(state),
    });
    
    // Return authorization URL
    return xeroClient.buildConsentUrl();
  }
  
  /**
   * Handle OAuth callback and get tokens
   */
  async handleCallback(
    code: string, 
    stateParam: string
  ): Promise<{ tokens: XeroTokenResponse; state: XeroOAuthState }> {
    // Parse state
    const state = JSON.parse(stateParam) as XeroOAuthState;
    
    // Get Xero config for the organization
    const config = await this.configService.getXeroConfig(
      new Types.ObjectId(state.organizationId)
    );
    
    // Create Xero client
    const xeroClient = new XeroClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUris: [config.redirectUri],
      scopes: config.scopes,
      state: stateParam,
    });
    
    // Exchange code for tokens
    const tokenSet = await xeroClient.apiCallback(code);
    
    // Get available tenants (Xero organizations)
    const tenants = await xeroClient.updateTenants();
    
    if (!tenants.length) {
      throw new Error('No Xero organizations found for this connection');
    }
    
    // Use the first tenant
    const tenant = tenants[0];
    
    // Store connection in database
    await this.storeConnection({
      userId: state.userId,
      organizationId: state.organizationId,
      tokenSet,
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName
    });
    
    // Return tokens and state
    return {
      tokens: {
        tokenSet,
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName
      },
      state
    };
  }
  
  /**
   * Store Xero connection in database
   */
  private async storeConnection(params: {
    userId: string;
    organizationId: string;
    tokenSet: TokenSet;
    tenantId: string;
    tenantName: string;
  }): Promise<void> {
    const { userId, organizationId, tokenSet, tenantId, tenantName } = params;
    
    // Calculate token expiration date
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (tokenSet.expires_in || 1800));
    
    // Find existing connection for this tenant
    const existingConnection = await XeroConnection.findByTenantId(tenantId);
    
    // Update configuration with tokens
    await this.configService.updateXeroConfig(
      new Types.ObjectId(organizationId),
      {
        accessToken: tokenSet.access_token || '',
        refreshToken: tokenSet.refresh_token || '',
        idToken: tokenSet.id_token || '',
        expiresIn: tokenSet.expires_in || 0,
        tenantId
      }
    );
    
    // Update existing connection or create new one
    const now = Timestamp.now();
    
    if (existingConnection) {
      await XeroConnection.update(existingConnection.id, {
        userId,
        organizationId,
        tenantId,
        tenantName,
        refreshToken: tokenSet.refresh_token || '',
        tokenSetExpiresAt: Timestamp.fromDate(expiresAt),
        status: 'connected',
        updatedAt: now
      });
    } else {
      await XeroConnection.create({
        userId,
        organizationId,
        tenantId,
        tenantName,
        refreshToken: tokenSet.refresh_token || '',
        tokenSetExpiresAt: Timestamp.fromDate(expiresAt),
        status: 'connected',
        createdAt: now,
        updatedAt: now
      });
    }
  }
  
  /**
   * Refresh tokens if expired
   */
  async refreshTokensIfNeeded(organizationId: Types.ObjectId): Promise<boolean> {
    // Get Xero config for the organization
    const config = await this.configService.getXeroConfig(organizationId);
    
    // Create Xero client
    const xeroClient = new XeroClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUris: [config.redirectUri],
      scopes: config.scopes,
      state: 'xero-auth',
    });
    
    // Set current tokens
    xeroClient.setTokenSet({
      access_token: config.accessToken,
      refresh_token: config.refreshToken,
      id_token: config.idToken,
      expires_in: config.expiresIn,
      token_type: 'Bearer',
    });
    
    // Check if tokens need refresh
    if (await xeroClient.readTokenSet()) {
      // Already refreshed by the SDK
      const tokenSet = xeroClient.tokenSet;
      
      // Update configuration with new tokens
      await this.configService.updateXeroConfig(
        organizationId,
        {
          accessToken: tokenSet.access_token || '',
          refreshToken: tokenSet.refresh_token || '',
          idToken: tokenSet.id_token || '',
          expiresIn: tokenSet.expires_in || 0
        }
      );
      
      // Update connection record
      const connections = await XeroConnection.findByOrganizationId(
        organizationId.toString()
      );
      
      if (connections.length > 0) {
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (tokenSet.expires_in || 1800));
        
        await XeroConnection.update(connections[0].id, {
          refreshToken: tokenSet.refresh_token || '',
          tokenSetExpiresAt: Timestamp.fromDate(expiresAt),
          status: 'connected',
          updatedAt: Timestamp.now()
        });
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Disconnect Xero integration
   */
  async disconnect(organizationId: Types.ObjectId): Promise<void> {
    // Find connections for this organization
    const connections = await XeroConnection.findByOrganizationId(
      organizationId.toString()
    );
    
    // Update connection status
    for (const connection of connections) {
      await XeroConnection.update(connection.id, {
        status: 'disconnected',
        updatedAt: Timestamp.now()
      });
    }
    
    // Clear tokens in config
    await this.configService.updateXeroConfig(
      organizationId,
      {
        accessToken: '',
        refreshToken: '',
        idToken: '',
        expiresIn: 0,
        tenantId: ''
      }
    );
  }
}
