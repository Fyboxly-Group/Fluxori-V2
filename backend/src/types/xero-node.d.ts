/**
 * Type declarations for the xero-node package
 * These declarations bypass TypeScript errors with the library
 */

declare module 'xero-node' {
  export interface TokenSet {
    id_token: string;
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type: string;
    scope?: string;
    [key: string]: any;
  }

  export interface XeroClientConfig {
    clientId: string;
    clientSecret: string;
    redirectUris: string[];
    scopes: string[];
    state?: string;
    [key: string]: any;
  }

  export interface Tenant {
    id: string;
    tenantId: string;
    tenantName: string;
    tenantType: string;
    [key: string]: any;
  }

  export class XeroClient {
    constructor(config: XeroClientConfig);
    
    buildConsentUrl(state?: string): string;
    
    apiCallback(url: string, params?: any): Promise<TokenSet>;
    
    updateTenants(fullRefresh?: boolean): Promise<any[]>;
    
    refreshToken(): Promise<TokenSet>;
    
    setTokenSet(tokenSet: TokenSet): void;
    
    tenants: Tenant[];
    
    accountingApi: any;
    
    [key: string]: any;
  }
}
