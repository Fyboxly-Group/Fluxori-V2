import { apiClient } from './client';

// Connection status enum matching backend
export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending',
  EXPIRED = 'expired',
}

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Authentication type enum matching backend
export enum AuthenticationType {
  API_KEY = 'api_key',
  OAUTH = 'oauth',
  JWT = 'jwt',
  USERNAME_PASSWORD = 'username_password',
}

// Marketplace type enum matching backend
export enum MarketplaceType {
  TAKEALOT = 'takealot',
  AMAZON = 'amazon',
  AMAZON_US = 'amazon_us',
  AMAZON_UK = 'amazon_uk',
  AMAZON_EU = 'amazon_eu',
  SHOPIFY = 'shopify',
  XERO = 'xero',
}

// Connection interface
export interface Connection {
  id: string;
  marketplaceId: string;
  marketplaceName: string;
  status: ConnectionStatus;
  authenticationType: AuthenticationType;
  lastChecked?: Date;
  lastSyncedAt?: Date;
  lastError?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Marketplace credentials
export interface MarketplaceCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  sellerId?: string;
  storeId?: string;
  username?: string;
  password?: string;
  expiresAt?: string;
  [key: string]: any;
}

// Create connection payload
export interface CreateConnectionPayload {
  marketplaceId: MarketplaceType;
  credentials: MarketplaceCredentials;
  metadata?: Record<string, any>;
}

// API Functions

/**
 * Get all connections for the current user
 */
export const getConnections = async () => {
  return apiClient.get<{
    success: boolean;
    count: number;
    data: Connection[];
  }>('/connections');
};

/**
 * Get a specific connection by ID
 * @param connectionId - Connection ID
 */
export const getConnectionById = async (connectionId: string) => {
  return apiClient.get<{
    success: boolean;
    data: Connection;
  }>(`/connections/${connectionId}`);
};

/**
 * Create a new connection
 * @param data - Connection creation payload
 */
export const createConnection = async (data: CreateConnectionPayload) => {
  return apiClient.post<{
    success: boolean;
    message: string;
    data: Connection;
  }>('/connections', data);
};

/**
 * Delete a connection
 * @param connectionId - Connection ID
 */
export const deleteConnection = async (connectionId: string) => {
  return apiClient.delete<{
    success: boolean;
    message: string;
  }>(`/connections/${connectionId}`);
};

/**
 * Test a connection
 * @param connectionId - Connection ID
 */
export const testConnection = async (connectionId: string) => {
  return apiClient.post<{
    success: boolean;
    message: string;
  }>(`/connections/${connectionId}/test`);
};

/**
 * Start OAuth flow for a marketplace
 * @param marketplaceId - Marketplace ID
 * @param redirectUrl - URL to redirect to after authentication
 */
export const startOAuthFlow = (marketplaceId: MarketplaceType, redirectUrl: string) => {
  const url = new URL(`${window.location.origin}/api/${marketplaceId}/auth`);
  url.searchParams.append('redirectUrl', redirectUrl);
  
  // Redirect the browser to the authorization URL
  window.location.href = url.toString();
};

/**
 * Get connection statuses for dashboard widget
 */
export interface ConnectionStatusResponse {
  id: string;
  marketplaceId: string;
  marketplaceName: string;
  connectionStatus: ConnectionStatus;
  syncStatus: SyncStatus;
  lastSyncTimestamp: string | null;
  lastSyncTime: string;
  lastError?: string;
}

export const getConnectionStatuses = async () => {
  return apiClient.get<{
    success: boolean;
    count: number;
    data: ConnectionStatusResponse[];
  }>('/connections/status');
};