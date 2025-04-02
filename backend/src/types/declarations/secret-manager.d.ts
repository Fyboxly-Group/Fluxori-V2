/**
 * Type declarations for @google-cloud/secret-manager
 */

declare module '@google-cloud/secret-manager' {
  export interface AccessSecretVersionResponse {
    name: string;
    payload?: {
      data: Buffer;
      dataCrc32c?: string;
    };
  }

  export class SecretManagerServiceClient {
    constructor(options?: any);
    createSecret(request: any): Promise<[any, any, any]>;
    addSecretVersion(request: any): Promise<[any, any, any]>;
    accessSecretVersion(request: any): Promise<[AccessSecretVersionResponse, any, any]>;
    deleteSecret(request: any): Promise<[any, any, any]>;
  }
}

declare module '@google-cloud/secret-manager/build/src/v1/secret_manager_service_client' {
  export interface AccessSecretVersionResponse {
    name: string;
    payload?: {
      data: Buffer;
      dataCrc32c?: string;
    };
  }
}