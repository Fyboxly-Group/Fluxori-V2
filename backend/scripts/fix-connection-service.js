#!/usr/bin/env node

/**
 * Completely fix the connection.service.ts file
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Path for the connection service file
const CONNECTION_SERVICE_PATH = path.join(process.cwd(), 'src/modules/connections/services/connection.service.ts');

// Replacement content for connection.service.ts with proper TypeScript typing
const FIXED_CONNECTION_SERVICE = `import mongoose from 'mongoose';
import MarketplaceConnection, {
  AuthenticationType,
  ConnectionStatus,
  IMarketplaceConnectionDocument,
  MarketplaceType,
} from '../models/connection.model';
import secretsService from './secrets.service';
import { MarketplaceCredentials } from '../../marketplaces/models/marketplace.models';
import { MarketplaceAdapterFactory } from "../../marketplaces/adapters/marketplace-adapter.factory";
import { IMarketplaceAdapter } from "../../marketplaces/adapters/interfaces/marketplace-adapter.interface";
import { toObjectId } from '../../../types/mongo-util-types';

// Extended adapter factory interface
interface ExtendedMarketplaceAdapterFactory {
  getAdapter(marketplaceId: string): Promise<IMarketplaceAdapter>;
  getAdapter(marketplaceId: string, credentials: MarketplaceCredentials): Promise<IMarketplaceAdapter>;
}

// Get the adapter factory instance with proper typing
const adapterFactory = MarketplaceAdapterFactory.getInstance() as unknown as ExtendedMarketplaceAdapterFactory;

/**
 * Service for managing marketplace connections
 */
class ConnectionService {
  /**
   * Create a new marketplace connection
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param marketplaceId - Marketplace ID
   * @param marketplaceName - Human-readable marketplace name
   * @param authenticationType - Type of authentication
   * @param credentials - Connection credentials
   * @param metadata - Additional metadata
   * @returns Created connection document
   */
  public async createConnection(
    userId: string,
    organizationId: string,
    marketplaceId: string,
    marketplaceName: string,
    authenticationType: AuthenticationType,
    credentials: MarketplaceCredentials,
    metadata?: Record<string, any>
  ): Promise<IMarketplaceConnectionDocument> {
    try {
      // Validate the credentials by testing the connection
      const validationResult = await this.validateCredentials(marketplaceId, credentials);
      
      // Store the credentials securely
      const credentialReference = await secretsService.storeCredentials(
        userId,
        organizationId,
        marketplaceId,
        credentials
      );
      
      // Check for existing connection
      const existingConnection = await MarketplaceConnection.findOne({
        userId,
        organizationId,
        marketplaceId,
      });
      
      if (existingConnection) {
        // Update existing connection
        existingConnection.marketplaceName = marketplaceName;
        existingConnection.authenticationType = authenticationType;
        existingConnection.credentialReference = credentialReference;
        existingConnection.credentialMetadata = metadata;
        existingConnection.status = validationResult.connected ? 
          ConnectionStatus.CONNECTED : ConnectionStatus.ERROR;
        existingConnection.lastChecked = new Date();
        existingConnection.lastError = validationResult.connected ? 
          undefined : validationResult.message;
          
        if (authenticationType === AuthenticationType.OAUTH && credentials.expiresAt) {
          existingConnection.expiresAt = new Date(credentials.expiresAt);
        }
        
        return await existingConnection.save();
      }
      
      // Create new connection
      const connection = new MarketplaceConnection({
        userId: toObjectId(userId),
        organizationId: toObjectId(organizationId),
        marketplaceId,
        marketplaceName,
        authenticationType,
        credentialReference,
        credentialMetadata: metadata,
        status: validationResult.connected ? 
          ConnectionStatus.CONNECTED : ConnectionStatus.ERROR,
        lastChecked: new Date(),
        lastError: validationResult.connected ? 
          undefined : validationResult.message,
        expiresAt: authenticationType === AuthenticationType.OAUTH && credentials.expiresAt ? 
          new Date(credentials.expiresAt) : undefined,
      });
      
      return await connection.save();
    } catch (error) {
      console.error('Error creating connection:', error);
      throw error;
    }
  }

  /**
   * Get all connections for a user/organization
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Array of connections
   */
  public async getConnections(userId: string, organizationId: string): Promise<IMarketplaceConnectionDocument[]> {
    return MarketplaceConnection.find({
      userId,
      organizationId,
    }).sort({ updatedAt: -1 });
  }

  /**
   * Get a specific connection by ID
   * @param connectionId - Connection ID
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Connection document if found
   */
  public async getConnectionById(
    connectionId: string,
    userId: string,
    organizationId: string
  ): Promise<IMarketplaceConnectionDocument | null> {
    return MarketplaceConnection.findOne({
      _id: connectionId,
      userId,
      organizationId,
    });
  }

  /**
   * Get a connection by marketplace ID
   * @param marketplaceId - Marketplace ID
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Connection document if found
   */
  public async getConnectionByMarketplace(
    marketplaceId: string,
    userId: string,
    organizationId: string
  ): Promise<IMarketplaceConnectionDocument | null> {
    return MarketplaceConnection.findOne({
      marketplaceId,
      userId,
      organizationId,
    });
  }

  /**
   * Delete a connection and its credentials
   * @param connectionId - Connection ID
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Success flag
   */
  public async deleteConnection(
    connectionId: string,
    userId: string,
    organizationId: string
  ): Promise<boolean> {
    const connection = await MarketplaceConnection.findOne({
      _id: connectionId,
      userId,
      organizationId,
    });
    
    if (!connection) {
      return false;
    }
    
    // Delete credentials from secret manager/encryption
    await secretsService.deleteCredentials(connection.credentialReference);
    
    // Delete the connection
    await connection.deleteOne();
    
    return true;
  }

  /**
   * Update connection status
   * @param connectionId - Connection ID
   * @param status - New status
   * @param errorMessage - Optional error message
   * @returns Updated connection
   */
  public async updateConnectionStatus(
    connectionId: string,
    status: ConnectionStatus,
    errorMessage?: string
  ): Promise<IMarketplaceConnectionDocument | null> {
    const connection = await MarketplaceConnection.findById(connectionId);
    
    if (!connection) {
      return null;
    }
    
    connection.status = status;
    connection.lastChecked = new Date();
    
    if (errorMessage) {
      connection.lastError = errorMessage;
    } else if (status === ConnectionStatus.CONNECTED) {
      connection.lastError = undefined;
    }
    
    return await connection.save();
  }

  /**
   * Get credentials for a marketplace connection
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param marketplaceId - Marketplace ID
   * @returns Credentials if connection exists
   */
  public async getMarketplaceCredentials(
    userId: string,
    organizationId: string,
    marketplaceId: string
  ): Promise<MarketplaceCredentials> {
    const connection = await this.getConnectionByMarketplace(marketplaceId, userId, organizationId);
    
    if (!connection) {
      throw new Error(\`No connection found for marketplace \${marketplaceId}\`);
    }
    
    if (connection.status === ConnectionStatus.DISCONNECTED) {
      throw new Error(\`Connection for marketplace \${marketplaceId} is disconnected\`);
    }
    
    // Check if OAuth token is expired
    if (connection.expiresAt && connection.expiresAt < new Date()) {
      // Mark as expired if not already
      if (connection.status !== ConnectionStatus.EXPIRED) {
        connection.status = ConnectionStatus.EXPIRED;
        await connection.save();
      }
      throw new Error(\`Connection for marketplace \${marketplaceId} has expired\`);
    }
    
    return secretsService.getCredentials(connection.credentialReference);
  }

  /**
   * Test existing connection
   * @param connectionId - Connection ID
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Test result
   */
  public async testConnection(
    connectionId: string,
    userId: string,
    organizationId: string
  ): Promise<{ success: boolean; message: string }> {
    const connection = await this.getConnectionById(connectionId, userId, organizationId);
    
    if (!connection) {
      return { success: false, message: 'Connection not found' };
    }
    
    try {
      // Get the credentials
      const credentials = await secretsService.getCredentials(connection.credentialReference);
      
      // Validate the credentials
      const result = await this.validateCredentials(connection.marketplaceId, credentials);
      
      // Update the connection status
      await this.updateConnectionStatus(
        connectionId,
        result.connected ? ConnectionStatus.CONNECTED : ConnectionStatus.ERROR,
        result.connected ? undefined : result.message
      );
      
      return {
        success: result.connected,
        message: result.message,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Update the connection status
      await this.updateConnectionStatus(
        connectionId,
        ConnectionStatus.ERROR,
        errorMessage
      );
      
      return {
        success: false,
        message: \`Connection test failed: \${errorMessage}\`,
      };
    }
  }

  /**
   * Validate marketplace credentials by testing the connection
   * @param marketplaceId - Marketplace ID
   * @param credentials - Credentials to validate
   * @returns Validation result
   */
  private async validateCredentials(
    marketplaceId: string,
    credentials: MarketplaceCredentials
  ): Promise<{ connected: boolean; message: string }> {
    try {
      // Use the marketplace adapter to test the connection
      const adapter = await adapterFactory.getAdapter(marketplaceId, credentials);
      
      // Test the connection
      const result = await adapter.testConnection();
      
      return {
        connected: result.connected,
        message: result.message,
      };
    } catch (error) {
      return {
        connected: false,
        message: \`Validation failed: \${error instanceof Error ? error.message : String(error)}\`,
      };
    }
  }
}

/**
 * Extended connection service for direct connection access
 * Used by internal services like the sync orchestrator
 */
class ConnectionDirectService {
  /**
   * Get a connection directly by ID without user/org check
   * Primarily for internal services like the sync orchestrator
   * @param connectionId - Connection ID
   * @returns Connection document if found
   */
  public async getConnectionByIdDirect(
    connectionId: string
  ): Promise<IMarketplaceConnectionDocument | null> {
    return MarketplaceConnection.findById(connectionId);
  }

  /**
   * Get connections by array of IDs
   * @param connectionIds - Array of connection IDs
   * @returns Array of connection documents
   */
  public async getConnectionsByIds(
    connectionIds: string[]
  ): Promise<IMarketplaceConnectionDocument[]> {
    return MarketplaceConnection.find({
      _id: { $in: connectionIds }
    });
  }

  /**
   * Get all active connections across all users/organizations
   * Used by the sync orchestrator to find connections to sync
   * @returns Array of active connection documents
   */
  public async getAllActiveConnections(): Promise<IMarketplaceConnectionDocument[]> {
    return MarketplaceConnection.find({
      status: ConnectionStatus.CONNECTED
    });
  }
}

const connectionService = new ConnectionService();
const connectionDirectService = new ConnectionDirectService();

// Type for extended service with direct access methods
export interface ConnectionServiceWithDirectAccess extends ConnectionService {
  getConnectionByIdDirect(connectionId: string): Promise<IMarketplaceConnectionDocument | null>;
  getConnectionsByIds(connectionIds: string[]): Promise<IMarketplaceConnectionDocument[]>;
  getAllActiveConnections(): Promise<IMarketplaceConnectionDocument[]>;
}

// Extend the service with direct methods
Object.assign(connectionService, {
  getConnectionByIdDirect: connectionDirectService.getConnectionByIdDirect,
  getConnectionsByIds: connectionDirectService.getConnectionsByIds,
  getAllActiveConnections: connectionDirectService.getAllActiveConnections,
});

// Export the enhanced service with proper typing
export default connectionService as ConnectionServiceWithDirectAccess;`;

// Replacement content for secrets.service.ts with proper TypeScript typing
const SECRETS_SERVICE_PATH = path.join(process.cwd(), 'src/modules/connections/services/secrets.service.ts');
const FIXED_SECRETS_SERVICE = `// Fixed by fix-connection-service.js
import * as crypto from 'crypto';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { AccessSecretVersionResponse } from '@google-cloud/secret-manager/build/src/v1/secret_manager_service_client';
import { MarketplaceCredentials } from '../../marketplaces/models/marketplace.models';

/**
 * Service for securely managing marketplace credentials
 * Provides both SecretManager-based and encrypted DB-based implementations
 */
class SecretManagerService {
  private secretClient!: SecretManagerServiceClient;
  private useSecretManager: boolean;
  private encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';

  constructor() {
    // Check if we should use Secret Manager or fall back to DB encryption
    this.useSecretManager = process.env.USE_SECRET_MANAGER === 'true';
    
    // Initialize the encryption key for DB-based encryption
    const key = process.env.ENCRYPTION_KEY || 'a-very-secure-32-char-encryption-key';
    this.encryptionKey = Buffer.from(key, 'utf-8');

    // Initialize Secret Manager client if needed
    if (this.useSecretManager) {
      this.secretClient = new SecretManagerServiceClient();
    }
  }

  /**
   * Store credentials securely, either in Secret Manager or encrypted in reference string
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param marketplaceId - Marketplace ID
   * @param credentials - Marketplace credentials to store
   * @returns Reference string to the stored credential
   */
  public async storeCredentials(
    userId: string,
    organizationId: string,
    marketplaceId: string,
    credentials: MarketplaceCredentials
  ): Promise<string> {
    // Create a unique ID for this credential
    const credentialId = \`\${userId}-\${organizationId}-\${marketplaceId}-\${Date.now()}\`;
    
    if (this.useSecretManager) {
      await this.storeInSecretManager(credentialId, credentials);
      return credentialId;
    } else {
      // If not using Secret Manager, encrypt and return the encrypted string
      return this.encryptCredentials(credentials);
    }
  }

  /**
   * Retrieve credentials using the reference
   * @param reference - Reference to the credential
   * @returns Retrieved credentials
   */
  public async getCredentials(reference: string): Promise<MarketplaceCredentials> {
    if (this.useSecretManager) {
      return this.getFromSecretManager(reference);
    } else {
      // If not using Secret Manager, decrypt the reference string
      return this.decryptCredentials(reference);
    }
  }

  /**
   * Delete credentials securely
   * @param reference - Reference to the credential
   * @returns Success flag
   */
  public async deleteCredentials(reference: string): Promise<boolean> {
    if (this.useSecretManager) {
      await this.deleteFromSecretManager(reference);
      return true;
    } else {
      // For encrypted DB credentials, nothing to do as they'll be removed with the connection
      return true;
    }
  }

  /**
   * Store credentials in GCP Secret Manager
   * @param secretId - Unique ID for the secret
   * @param credentials - Credentials to store
   */
  private async storeInSecretManager(
    secretId: string,
    credentials: MarketplaceCredentials
  ): Promise<void> {
    const projectId = process.env.GCP_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('GCP_PROJECT_ID environment variable is not set');
    }

    // Create a fully qualified secret ID
    const parent = \`projects/\${projectId}\`;
    const secretPath = \`\${parent}/secrets/\${secretId}\`;

    try {
      // Create the secret
      await this.secretClient.createSecret({
        parent,
        secretId,
        secret: {
          replication: {
            automatic: {},
          },
        },
      });

      // Add the secret version with credentials
      await this.secretClient.addSecretVersion({
        parent: secretPath,
        payload: {
          data: Buffer.from(JSON.stringify(credentials)),
        },
      });
    } catch (error) {
      console.error('Error storing credentials in Secret Manager:', error);
      throw new Error('Failed to securely store credentials');
    }
  }

  /**
   * Retrieve credentials from GCP Secret Manager
   * @param secretId - Secret ID to retrieve
   * @returns Retrieved credentials
   */
  private async getFromSecretManager(secretId: string): Promise<MarketplaceCredentials> {
    const projectId = process.env.GCP_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('GCP_PROJECT_ID environment variable is not set');
    }

    // Create a fully qualified secret version path
    const name = \`projects/\${projectId}/secrets/\${secretId}/versions/latest\`;

    try {
      // Access the secret version
      const [version] = await this.secretClient.accessSecretVersion({ name }) as [AccessSecretVersionResponse];
      
      if (!version.payload?.data) {
        throw new Error('No data found in secret');
      }

      // Parse the JSON string back to an object
      const credentials = JSON.parse(version.payload.data.toString()) as MarketplaceCredentials;
      return credentials;
    } catch (error) {
      console.error('Error retrieving credentials from Secret Manager:', error);
      throw new Error('Failed to retrieve secure credentials');
    }
  }

  /**
   * Delete a secret from GCP Secret Manager
   * @param secretId - Secret ID to delete
   */
  private async deleteFromSecretManager(secretId: string): Promise<void> {
    const projectId = process.env.GCP_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('GCP_PROJECT_ID environment variable is not set');
    }

    // Create a fully qualified secret path
    const name = \`projects/\${projectId}/secrets/\${secretId}\`;

    try {
      // Delete the secret and all its versions
      await this.secretClient.deleteSecret({ name });
    } catch (error) {
      console.error('Error deleting secret from Secret Manager:', error);
      throw new Error('Failed to delete secure credentials');
    }
  }

  /**
   * Encrypt credentials for storage in database
   * @param credentials - Credentials to encrypt
   * @returns Encrypted string
   */
  private encryptCredentials(credentials: MarketplaceCredentials): string {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create a cipher with our key and IV
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    // Encrypt the credentials JSON
    const credentialsBuffer = Buffer.from(JSON.stringify(credentials), 'utf8');
    let encrypted = cipher.update(credentialsBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV, authTag, and ciphertext as base64 string
    const result = Buffer.concat([iv, authTag, encrypted]).toString('base64');
    return result;
  }

  /**
   * Decrypt credentials from encrypted string
   * @param encryptedData - Encrypted credential string
   * @returns Decrypted credentials
   */
  private decryptCredentials(encryptedData: string): MarketplaceCredentials {
    try {
      // Convert back from base64
      const encryptedBuffer = Buffer.from(encryptedData, 'base64');
      
      // Extract IV, authTag, and ciphertext
      const iv = encryptedBuffer.subarray(0, 16);
      const authTag = encryptedBuffer.subarray(16, 32);
      const ciphertext = encryptedBuffer.subarray(32);
      
      // Create a decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      
      // Set the auth tag
      decipher.setAuthTag(authTag);
      
      // Decrypt
      let decrypted = decipher.update(ciphertext);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      // Parse the JSON
      return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
      console.error('Error decrypting credentials:', error);
      throw new Error('Failed to decrypt credentials');
    }
  }
}

export default new SecretManagerService();`;

// Replacement content for credential-provider.ts with proper TypeScript typing
const CREDENTIAL_PROVIDER_PATH = path.join(process.cwd(), 'src/modules/connections/utils/credential-provider.ts');
const FIXED_CREDENTIAL_PROVIDER = `import connectionService, { ConnectionServiceWithDirectAccess } from '../services/connection.service';
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

export default new CredentialProvider();`;

/**
 * Main function
 */
async function main() {
  console.log('🔧 Completely Fix TypeScript in Connection Module');
  console.log('=============================================');

  try {
    // Fix connection.service.ts
    console.log('📝 Rewriting connection.service.ts...');
    await fs.writeFile(CONNECTION_SERVICE_PATH, FIXED_CONNECTION_SERVICE, 'utf8');
    console.log('✅ Fixed connection.service.ts');

    // Fix secrets.service.ts
    console.log('📝 Rewriting secrets.service.ts...');
    await fs.writeFile(SECRETS_SERVICE_PATH, FIXED_SECRETS_SERVICE, 'utf8');
    console.log('✅ Fixed secrets.service.ts');

    // Fix credential-provider.ts
    console.log('📝 Rewriting credential-provider.ts...');
    await fs.writeFile(CREDENTIAL_PROVIDER_PATH, FIXED_CREDENTIAL_PROVIDER, 'utf8');
    console.log('✅ Fixed credential-provider.ts');

    // Check TypeScript errors
    console.log('\n🔍 Running TypeScript check for the connection module...');
    try {
      execSync('npx tsc --noEmit src/modules/connections/**/*.ts', { stdio: 'pipe' });
      console.log('✅ No TypeScript errors in the connection module!');
    } catch (error) {
      const errorOutput = error.stdout.toString();
      const errorCount = (errorOutput.match(/error TS\d+/g) || []).length;
      console.log(`⚠️ ${errorCount} TypeScript errors still remain in the connection module.`);
      console.log('Error details:');
      console.log(errorOutput);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();