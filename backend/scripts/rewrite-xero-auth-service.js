#!/usr/bin/env node

/**
 * This script completely rewrites the xero-auth.service.ts file with correct TypeScript syntax
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}🔧 Rewriting xero-auth.service.ts with correct TypeScript syntax${colors.reset}`);
console.log(`${colors.cyan}======================================================${colors.reset}`);

const filePath = path.resolve(__dirname, '../src/modules/xero-connector/services/xero-auth.service.ts');

if (!fs.existsSync(filePath)) {
  console.log(`${colors.red}❌ File not found: ${filePath}${colors.reset}`);
  process.exit(1);
}

// Create a backup before making changes
fs.copyFileSync(filePath, `${filePath}.backup`);
console.log(`${colors.yellow}⚠ Created backup at ${path.basename(filePath)}.backup${colors.reset}`);

// The corrected file content
const correctedContent = `import { XeroClient, TokenSet, Tenant } from 'xero-node';
import { randomBytes } from 'crypto';
import XeroConnection, { IXeroConnectionDocument } from '../models/xero-connection.model';
import { XeroOAuthState, XeroTokenResponse, XeroUserCredentials } from '../types';
import mongoose from 'mongoose';

/**
 * Service for handling Xero authentication
 */
class XeroAuthService {
  private readonly xero: XeroClient;
  private readonly scopes: string[] = [
    'openid',
    'profile',
    'email',
    'accounting.transactions',
    'accounting.contacts',
    'accounting.settings',
  ];

  /**
   * Initialize the Xero client
   */
  constructor() {
    this.xero = new XeroClient({
      clientId: process.env.XERO_CLIENT_ID || '',
      clientSecret: process.env.XERO_CLIENT_SECRET || '',
      redirectUris: [process.env.XERO_REDIRECT_URI || 'http://localhost:5000/api/xero/callback'],
      scopes: this.scopes,
    });
  }

  /**
   * Generate authorization URL for Xero OAuth flow
   * 
   * @param userId - The user ID
   * @param organizationId - The organization ID
   * @param redirectUrl - The URL to redirect to after authentication
   * @returns The authorization URL
   */
  public getAuthorizationUrl(userId: string, organizationId: string, redirectUrl: string): string {
    const state = this.generateState({ userId, organizationId, redirectUrl });
    
    // @ts-ignore - Xero types don't match implementation
    return this.xero.buildConsentUrl(state);
  }

  /**
   * Exchange authorization code for access token and other details
   * 
   * @param code - The authorization code from Xero
   * @param state - The state from the OAuth flow
   * @returns Token response with access token, refresh token, and tenant details
   */
  public async exchangeCodeForToken(code: string, state: string): Promise<{ tokenResponse: XeroTokenResponse; decodedState: XeroOAuthState }> {
    // Exchange code for token set
    const tokenSet = await this.xero.apiCallback(code);
    
    // Get tenants (connected Xero organizations)
    await this.xero.updateTenants(false);
    const tenants = this.xero.tenants || [];
    
    if (!tenants || tenants.length === 0) {
      throw new Error('No Xero organizations connected. Please try again.');
    }
    
    // For this initial implementation, we'll use the first tenant
    const tenant = tenants[0];
    
    const decodedState = this.decodeState(state);
    
    return {
      tokenResponse: {
        tokenSet,
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName,
      },
      decodedState,
    };
  }

  /**
   * Store Xero connection details in database
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param tokenResponse - Token response from Xero
   * @returns Saved connection document
   */
  public async storeConnection(
    userId: string,
    organizationId: string,
    tokenResponse: XeroTokenResponse
  ): Promise<IXeroConnectionDocument> {
    const { tokenSet, tenantId, tenantName } = tokenResponse;
    
    // Calculate when the token set expires
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (tokenSet.expires_in || 1800)); // Default to 30 minutes if not specified
    
    // Check if a connection already exists for this tenant
    const existingConnection = await XeroConnection.findOne({ tenantId });
    
    if(existingConnection) {
      // Update existing connection
      existingConnection.userId = userId as any;
      existingConnection.organizationId = organizationId as any;
      existingConnection.refreshToken = tokenSet.refresh_token as string;
      existingConnection.tokenSetExpiresAt = expiresAt;
      existingConnection.status = 'connected';
      existingConnection.lastError = undefined;
      
      return await existingConnection.save();
    }
    
    // Create new connection
    const connection = new XeroConnection({
      userId,
      organizationId,
      tenantId,
      tenantName,
      refreshToken: tokenSet.refresh_token as string,
      tokenSetExpiresAt: expiresAt,
      status: 'connected',
    });
    
    return await connection.save();
  }

  /**
   * Get user credentials for Xero operations
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns User credentials including tokens and tenant ID
   */
  public async getUserCredentials(userId: string, organizationId: string): Promise<XeroUserCredentials> {
    const connection = await XeroConnection.findOne({
      userId,
      organizationId,
      status: 'connected',
    });
    
    if(!connection) {
      throw new Error('No active Xero connection found for this user/organization');
    }
    
    // Get a fresh access token
    const tokenSet = await this.refreshAccessToken(connection.refreshToken);
    
    return {
      userId,
      organizationId,
      tenantId: connection.tenantId,
      accessToken: tokenSet.access_token as string,
      refreshToken: tokenSet.refresh_token as string,
    };
  }

  /**
   * Refresh the access token using a refresh token
   * 
   * @param refreshToken - Refresh token
   * @returns New token set
   */
  public async refreshAccessToken(refreshToken: string): Promise<TokenSet> {
    try {
      this.xero.setTokenSet({
        refresh_token: refreshToken,
        // Add some dummy values for required properties
        id_token: 'dummy',
        access_token: 'dummy',
        expires_in: 1800,
        token_type: 'Bearer',
      });
      
      const newTokenSet = await this.xero.refreshToken();
      
      // Update the refresh token in the database
      const connection = await XeroConnection.findOne({ refreshToken });
      
      if(connection && newTokenSet.refresh_token) {
        // Update tokens and expiry
        connection.refreshToken = newTokenSet.refresh_token;
        
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (newTokenSet.expires_in || 1800));
        connection.tokenSetExpiresAt = expiresAt;
        
        // Reset status if it was expired
        if(connection.status === 'expired') {
          connection.status = 'connected';
        }
        
        await connection.save();
      }
      
      return newTokenSet;
    } catch(error) {
      // If refresh fails, update connection status
      const connection = await XeroConnection.findOne({ refreshToken });
      
      if(connection) {
        connection.status = 'expired';
        connection.lastError = (error as Error).message;
        await connection.save();
      }
      
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Get an instance of XeroClient with valid credentials
   * 
   * @param userCredentials - User credentials
   * @returns Authenticated XeroClient instance
   */
  public async getAuthenticatedClient(userCredentials: XeroUserCredentials): Promise<XeroClient> {
    let accessToken = userCredentials.accessToken;
    let refreshToken = userCredentials.refreshToken;
    
    if(!accessToken && refreshToken) {
      // If only refresh token is provided, refresh the access token
      const connection = await XeroConnection.findOne({
        tenantId: userCredentials.tenantId,
      });
      
      if(!connection) {
        throw new Error('Connection not found');
      }
      
      const tokenSet = await this.refreshAccessToken(connection.refreshToken);
      accessToken = tokenSet.access_token as string;
      refreshToken = tokenSet.refresh_token as string;
    } else if(!accessToken && !refreshToken) {
      // If no tokens are provided, get them from the database
      const connection = await XeroConnection.findOne({
        userId: userCredentials.userId,
        organizationId: userCredentials.organizationId,
      });
      
      if(!connection) {
        throw new Error('No Xero connection found for this user/organization');
      }
      
      const tokenSet = await this.refreshAccessToken(connection.refreshToken);
      accessToken = tokenSet.access_token as string;
      refreshToken = tokenSet.refresh_token as string;
    }
    
    if(!accessToken) {
      throw new Error('Could not obtain valid access token');
    }
    
    // Set up the client with the obtained tokens
    this.xero.setTokenSet({
      id_token: 'dummy', // Not used for API calls
      access_token: accessToken,
      refresh_token: refreshToken || '',
      expires_in: 1800,
      token_type: 'Bearer',
    });
    
    // Update tenants
    await this.xero.updateTenants(false);
    
    return this.xero;
  }

  /**
   * Disconnect Xero integration for a user
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Boolean indicating success
   */
  public async disconnectXero(userId: string, organizationId: string): Promise<boolean> {
    const connection = await XeroConnection.findOne({
      userId,
      organizationId,
    });
    
    if(!connection) {
      return false;
    }
    
    connection.status = 'disconnected';
    await connection.save();
    
    return true;
  }

  /**
   * Generate a secure state parameter for OAuth flow
   * 
   * @param data - State data to encode
   * @returns Encoded state string
   */
  private generateState(data: XeroOAuthState): string {
    const stateObj = {
      ...data,
      nonce: randomBytes(16).toString('hex'),
      timestamp: Date.now(),
    };
    
    return Buffer.from(JSON.stringify(stateObj)).toString('base64');
  }

  /**
   * Decode the state parameter from OAuth flow
   * 
   * @param state - Encoded state string
   * @returns Decoded state object
   */
  private decodeState(state: string): XeroOAuthState {
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      return {
        userId: stateData.userId,
        organizationId: stateData.organizationId,
        redirectUrl: stateData.redirectUrl,
      };
    } catch(error) {
      throw new Error('Invalid state parameter');
    }
  }
}

export default new XeroAuthService();`;

// Write the corrected content to the file
fs.writeFileSync(filePath, correctedContent);
console.log(`${colors.green}✓ Successfully rewrote ${path.basename(filePath)}${colors.reset}`);

// Validate the rewritten file
try {
  console.log(`\n${colors.cyan}Validating rewritten file...${colors.reset}`);
  
  // Use TypeScript compiler to check
  const { execSync } = require('child_process');
  let result;
  
  try {
    result = execSync(`cd ${path.resolve(__dirname, '..')} && npx tsc --noEmit ${path.relative(path.resolve(__dirname, '..'), filePath)} 2>&1`, { encoding: 'utf8' });
    console.log(`\n${colors.green}✅ No TypeScript errors in rewritten file!${colors.reset}`);
  } catch (error) {
    result = error.stdout || error.stderr || error.message;
    console.log(`\n${colors.yellow}⚠️ Some TypeScript errors remain:${colors.reset}`);
    console.log(result);
  }
} catch (error) {
  console.error(`\n${colors.red}❌ Validation failed:${colors.reset}`, error.message);
}

console.log(`\n${colors.green}✅ Process completed. Please check the rewritten file.${colors.reset}`);