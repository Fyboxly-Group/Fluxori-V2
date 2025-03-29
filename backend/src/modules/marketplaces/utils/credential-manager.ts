import { MarketplaceCredentials } from '../models/marketplace.models';
import * as crypto from 'crypto';

/**
 * Utility class for securely managing marketplace credentials
 */
export class CredentialManager {
  private static instance: CredentialManager;
  private encryptionKey: string;
  private algorithm = 'aes-256-gcm';

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // In production, this should be loaded from environment variables or a secure vault
    this.encryptionKey = process.env.CREDENTIAL_ENCRYPTION_KEY || 'default-key-replace-in-production-environment';
    
    if (this.encryptionKey === 'default-key-replace-in-production-environment' && process.env.NODE_ENV === 'production') {
      console.warn('WARNING: Using default encryption key in production environment. Set CREDENTIAL_ENCRYPTION_KEY environment variable with a secure key.');
    }
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): CredentialManager {
    if (!CredentialManager.instance) {
      CredentialManager.instance = new CredentialManager();
    }
    return CredentialManager.instance;
  }

  /**
   * Encrypt credentials for storage
   * @param credentials - The credentials to encrypt
   * @param marketplaceId - Marketplace identifier
   * @returns Encrypted credentials string
   */
  public encryptCredentials(credentials: MarketplaceCredentials, marketplaceId: string): string {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32)),
      iv
    ) as crypto.CipherGCM; // Type assertion for GCM cipher
    
    // Encrypt the credentials
    const credentialsJSON = JSON.stringify(credentials);
    let encrypted = cipher.update(credentialsJSON, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine the IV, encrypted data, and authTag, and return as a single string
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt credentials from storage
   * @param encryptedCredentials - The encrypted credentials string
   * @returns Decrypted credentials object
   */
  public decryptCredentials(encryptedCredentials: string): MarketplaceCredentials {
    // Split the string to get the IV, authTag, and encrypted data
    const [ivHex, authTagHex, encryptedHex] = encryptedCredentials.split(':');
    
    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new Error('Invalid encrypted credentials format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32)),
      iv
    ) as crypto.DecipherGCM; // Type assertion for GCM decipher
    
    // Set the authentication tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Parse the JSON string back to an object
    return JSON.parse(decrypted);
  }

  /**
   * Securely mask sensitive credential values for logging
   * @param credentials - The credentials to mask
   * @returns Masked credentials with sensitive values hidden
   */
  public maskCredentials(credentials: MarketplaceCredentials): MarketplaceCredentials {
    const maskedCredentials = { ...credentials };
    
    // Mask known sensitive fields
    const sensitiveFields = [
      'apiKey', 'apiSecret', 'accessToken', 'refreshToken', 
      'clientSecret', 'password', 'secret'
    ];
    
    for (const field of sensitiveFields) {
      if (field in maskedCredentials && maskedCredentials[field]) {
        const value = maskedCredentials[field] as string;
        maskedCredentials[field] = `${value.substring(0, 4)}${'*'.repeat(value.length - 8)}${value.substring(value.length - 4)}`;
      }
    }
    
    return maskedCredentials;
  }
}