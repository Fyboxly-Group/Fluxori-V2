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
    
    // Ensure key is exactly 32 bytes for AES-256
    if (Buffer.from(this.encryptionKey).length !== 32) {
      this.encryptionKey = this.encryptionKey.padEnd(32).slice(0, 32);
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
   * Gets a proper key buffer of exactly 32 bytes for AES-256
   * @returns Buffer containing the 32-byte key
   */
  private getKeyBuffer(): Buffer {
    return Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32));
  }
  
  /**
   * Encrypt credentials for storage
   * @param credentials - The credentials to encrypt
   * @param marketplaceId - Marketplace identifier
   * @returns Encrypted credentials string
   */
  public encryptCredentials(credentials: MarketplaceCredentials, marketplaceId: string): string {
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(16);
      
      // Create cipher with properly sized key
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.getKeyBuffer(),
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
    } catch (error) {
      console.error('Error encrypting credentials:', error instanceof Error ? error.message : String(error));
      throw new Error(`Failed to encrypt credentials for marketplace ${marketplaceId}`);
    }
  }

  /**
   * Decrypt credentials from storage
   * @param encryptedCredentials - The encrypted credentials string
   * @returns Decrypted credentials object
   */
  public decryptCredentials(encryptedCredentials: string): MarketplaceCredentials {
    try {
      // Split the string to get the IV, authTag, and encrypted data
      const [ivHex, authTagHex, encryptedHex] = encryptedCredentials.split(':');
      
      if (!ivHex || !authTagHex || !encryptedHex) {
        throw new Error('Invalid encrypted credentials format');
      }
      
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      // Create decipher with properly sized key
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.getKeyBuffer(),
        iv
      ) as crypto.DecipherGCM; // Type assertion for GCM decipher
      
      // Set the authentication tag
      decipher.setAuthTag(authTag);
      
      // Decrypt the data
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Parse the JSON string back to an object
      const parsedData = JSON.parse(decrypted) as MarketplaceCredentials;
      return parsedData;
    } catch (error) {
      console.error('Error decrypting credentials:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to decrypt credentials: ' + (error instanceof Error ? error.message : String(error)));
    }
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
      if (field in maskedCredentials && typeof maskedCredentials[field] === 'string') {
        const value = maskedCredentials[field] as string;
        if (value.length >= 8) {
          maskedCredentials[field] = `${value.substring(0, 4)}${'*'.repeat(value.length - 8)}${value.substring(value.length - 4)}`;
        } else if (value.length > 0) {
          // For short strings, just show first and last character
          maskedCredentials[field] = `${value.substring(0, 1)}${'*'.repeat(value.length - 2)}${value.substring(value.length - 1)}`;
        }
      }
    }
    
    return maskedCredentials;
  }
}