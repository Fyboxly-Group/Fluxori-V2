/**
 * Type declarations for @google-cloud/secret-manager
 */

declare module '@google-cloud/secret-manager' {
  export interface SecretManagerServiceClientConfig {
    projectId?: string;
    credentials?: {
      client_email?: string;
      private_key?: string;
    };
    keyFilename?: string;
  }

  export interface Secret {
    name: string;
    createTime: Date;
    // Add more properties as needed
  }

  export interface SecretVersion {
    name: string;
    createTime: Date;
    state: string;
    // Add more properties as needed
  }

  export interface AccessSecretVersionResponse {
    name: string;
    payload: {
      data: Buffer;
    };
  }

  export class SecretManagerServiceClient {
    constructor(config?: SecretManagerServiceClientConfig);
    
    accessSecretVersion(request: { name: string }): Promise<[AccessSecretVersionResponse]>;
    
    createSecret(request: {
      parent: string;
      secretId: string;
      secret: { replication: { automatic: {} } };
    }): Promise<[Secret]>;
    
    addSecretVersion(request: {
      parent: string;
      payload: { data: Buffer };
    }): Promise<[SecretVersion]>;
    
    deleteSecret(request: { name: string }): Promise<void>;
    
    // Add more methods as needed
  }
}