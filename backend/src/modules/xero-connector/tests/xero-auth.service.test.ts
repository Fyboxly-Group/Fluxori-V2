import { jest } from '@jest/globals';
import xeroAuthService from '../services/xero-auth.service';
import mongoose from 'mongoose';
import { XeroUserCredentials } from '../types';

// Mock dependencies
jest.mock('xero-node', () => {
  return {
    XeroClient: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue({}),
      buildConsentUrl: jest.fn().mockReturnValue('https://example.com/auth'),
      apiCallback: jest.fn().mockResolvedValue({
        tokenSet: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 1800,
        },
      }),
      refreshToken: jest.fn().mockResolvedValue({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 1800,
      }),
      accountingApi: {},
    })),
  };
});

// Mock mongoose models
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  return {
    ...(originalModule as any),
    model: jest.fn().mockImplementation(() => ({
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    })),
  };
});

// Sample user credentials
const mockUserCredentials: XeroUserCredentials = {
  userId: 'user123',
  organizationId: 'org456',
  tenantId: 'tenant789',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('XeroAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getAuthUrl', () => {
    it('should generate an authorization URL', async() => {
      // Call the method under test
      const result = await xeroAuthService.getAuthUrl('user123', 'org456', 'https://example.com/callback');
      
      // Assertions
      expect(result).toBe('https://example.com/auth');
    });
  });
  
  describe('handleCallback', () => {
    it('should process OAuth callback and save credentials', async() => {
      // Mock XeroConfig model
      const mockXeroConfigModel = mongoose.model('XeroConfig');
      (mockXeroConfigModel.findOne as jest.Mock).mockResolvedValue(null); // No existing config
      (mockXeroConfigModel.create as jest.Mock).mockResolvedValue({
        _id: 'config123',
        userId: 'user123',
        organizationId: 'org456',
      });
      
      // Call the method under test
      const result = await xeroAuthService.handleCallback(
        'auth-code',
        'state-data'
      );
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.tenantId).toBeDefined();
      expect(result.tenantName).toBeDefined();
    });
    
    it('should handle invalid callback data', async() => {
      // Call the method under test with invalid data
      const result = await xeroAuthService.handleCallback(
        '',
        ''
      );
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
  
  describe('refreshAccessToken', () => {
    it('should refresh an expired access token', async() => {
      // Mock XeroConnection model
      const mockXeroConnectionModel = mongoose.model('XeroConnection');
      (mockXeroConnectionModel.findOne as jest.Mock).mockResolvedValue({
        userId: 'user123',
        organizationId: 'org456',
        refreshToken: 'refresh-token',
      });
      (mockXeroConnectionModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 1 });
      
      // Call the method under test
      const result = await xeroAuthService.refreshAccessToken('user123', 'org456');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });
    
    it('should handle non-existent connection', async() => {
      // Mock XeroConnection model to return null (no connection found);
      const mockXeroConnectionModel = mongoose.model('XeroConnection');
      (mockXeroConnectionModel.findOne as jest.Mock).mockResolvedValue(null);
      
      // Call the method under test
      const result = await xeroAuthService.refreshAccessToken('non-existent', 'org456');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('No Xero connection found');
    });
    
    it('should handle token refresh errors', async() => {
      // Mock XeroConnection model
      const mockXeroConnectionModel = mongoose.model('XeroConnection');
      (mockXeroConnectionModel.findOne as jest.Mock).mockResolvedValue({
        userId: 'user123',
        organizationId: 'org456',
        refreshToken: 'invalid-refresh-token',
      });
      
      // Mock XeroClient to throw error instanceof Error ? error : new Error(String(error));
      const XeroClient = require('xero-node').XeroClient;
      XeroClient.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue({}),
        refreshToken: jest.fn().mockRejectedValue(new Error('Invalid refresh token')),
      }));
      
      // Call the method under test
      const result = await xeroAuthService.refreshAccessToken('user123', 'org456');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('Error refreshing token');
    });
  });
  
  describe('getAuthenticatedClient', () => {
    it('should return an authenticated Xero client', async() => {
      // First mock the refreshAccessToken method
      jest.spyOn(xeroAuthService, 'refreshAccessToken').mockResolvedValue({
        success: true,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      
      // Call the method under test
      const client = await xeroAuthService.getAuthenticatedClient(mockUserCredentials);
      
      // Assertions
      expect(client).toBeDefined();
      expect(client.accountingApi).toBeDefined();
    });
    
    it('should handle authentication errors', async() => {
      // Mock refreshAccessToken to fail
      jest.spyOn(xeroAuthService, 'refreshAccessToken').mockResolvedValue({
        success: false,
        error: 'Authentication failed',
      });
      
      // Call the method under test and expect error
      await expect(xeroAuthService.getAuthenticatedClient(mockUserCredentials))
        .rejects.toThrow('Failed to authenticate with Xero');
    });
  });
  
  describe('disconnectXero', () => {
    it('should disconnect a Xero connection', async() => {
      // Mock XeroConnection model
      const mockXeroConnectionModel = mongoose.model('XeroConnection');
      (mockXeroConnectionModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 1 });
      
      // Call the method under test
      const result = await xeroAuthService.disconnectXero('user123', 'org456');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toContain('Xero connection disconnected');
    });
    
    it('should handle non-existent connection', async() => {
      // Mock XeroConnection model to return no modifications;
      const mockXeroConnectionModel = mongoose.model('XeroConnection');
      (mockXeroConnectionModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 0 });
      
      // Call the method under test
      const result = await xeroAuthService.disconnectXero('non-existent', 'org456');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toContain('No Xero connection found');
    });
  });
});