#!/usr/bin/env node

/**
 * This script performs a comprehensive rewrite of the Xero connector test files.
 * It addresses severe syntax issues in the test files that cannot be fixed with simple regex patterns.
 * 
 * Usage:
 * node scripts/fix-xero-tests-comprehensive.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Terminal colors for output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m'
};

console.log(`${COLORS.CYAN}🔧 Comprehensive Xero Test File Fixer${COLORS.RESET}`);
console.log(`${COLORS.CYAN}======================================${COLORS.RESET}`);
console.log(`This script completely rewrites malformed Xero test files to fix TypeScript errors.`);

// Fixed Implementation for xero-auth.service.test.ts
const fixedXeroAuthServiceTest = `import { jest } from '@jest/globals';
import xeroAuthService from '../services/xero-auth.service';
import XeroConnection from '../models/xero-connection.model';

// Mock the XeroClient
jest.mock('xero-node', () => {
  const originalModule = jest.requireActual('xero-node');
  
  return {
    ...originalModule,
    XeroClient: jest.fn().mockImplementation(() => {
      return {
        buildConsentUrl: jest.fn().mockImplementation(() => 'https://mock-xero-auth-url?state=mockstate'),
        apiCallback: jest.fn().mockImplementation(() => Promise.resolve({
          id_token: 'mock-id-token',
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 1800,
          token_type: 'Bearer'
        })),
        updateTenants: jest.fn().mockImplementation(() => Promise.resolve()),
        tenants: [
          {
            tenantId: 'mock-tenant-id',
            tenantName: 'Mock Company'
          }
        ],
        setTokenSet: jest.fn(),
        refreshToken: jest.fn().mockImplementation(() => Promise.resolve({
          id_token: 'mock-id-token-refreshed',
          access_token: 'mock-access-token-refreshed',
          refresh_token: 'mock-refresh-token-refreshed',
          expires_in: 1800,
          token_type: 'Bearer'
        }))
      };
    })
  };
});

// Mock mongoose model
jest.mock('../models/xero-connection.model', () => {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    default: {
      findOne: jest.fn(),
      create: jest.fn()
    }
  };
});

describe('XeroAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getAuthorizationUrl', () => {
    it('should return a valid authorization URL', () => {
      const url = xeroAuthService.getAuthorizationUrl('user123', 'org456', 'http://example.com/callback');
      expect(url).toBe('https://mock-xero-auth-url?state=mockstate');
    });
  });
  
  describe('exchangeCodeForToken', () => {
    it('should exchange code for token set and return tenant info', async () => {
      const result = await xeroAuthService.exchangeCodeForToken('mock-code', 'mockstate');
      
      expect(result.tokenResponse).toBeDefined();
      expect(result.tokenResponse.tenantId).toBe('mock-tenant-id');
      expect(result.tokenResponse.tenantName).toBe('Mock Company');
      expect(result.tokenResponse.tokenSet).toBeDefined();
      expect(result.tokenResponse.tokenSet.refresh_token).toBe('mock-refresh-token');
    });
  });
  
  describe('refreshAccessToken', () => {
    it('should refresh the access token successfully', async () => {
      // Mock findOne to return a connection
      (XeroConnection.findOne as jest.Mock).mockResolvedValue({
        refreshToken: 'mock-refresh-token',
        save: jest.fn().mockResolvedValue(true)
      });
      
      const tokenSet = await xeroAuthService.refreshAccessToken('mock-refresh-token');
      
      expect(tokenSet).toBeDefined();
      expect(tokenSet.access_token).toBe('mock-access-token-refreshed');
      expect(tokenSet.refresh_token).toBe('mock-refresh-token-refreshed');
    });
    
    it('should handle refresh token failure and update connection status', async () => {
      // Mock refreshToken to throw error
      const mockXeroClient = require('xero-node').XeroClient;
      mockXeroClient.mockImplementation(() => {
        return {
          ...mockXeroClient(),
          refreshToken: jest.fn().mockRejectedValue(new Error('Refresh token expired'))
        };
      });
      
      // Mock findOne to return a connection
      (XeroConnection.findOne as jest.Mock).mockResolvedValue({
        refreshToken: 'expired-token',
        status: 'connected',
        save: jest.fn().mockResolvedValue(true)
      });
      
      await expect(xeroAuthService.refreshAccessToken('expired-token')).rejects.toThrow('Refresh token expired');
      
      // Verify connection status was updated
      expect(XeroConnection.findOne).toHaveBeenCalledWith({ refreshToken: 'expired-token' });
      const mockConnection = await XeroConnection.findOne({ refreshToken: 'expired-token' });
      expect(mockConnection.save).toHaveBeenCalled();
    });
  });
});`;

// Apply comprehensive fix to a file
const applyComprehensiveFix = (filePath, fixedContent) => {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Backup the original file
    const backupPath = `${filePath}.backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`${COLORS.BLUE}✓ Backed up original file to ${backupPath}${COLORS.RESET}`);
    
    // Write the fixed content
    fs.writeFileSync(filePath, fixedContent, 'utf-8');
    console.log(`${COLORS.GREEN}✅ Completely rewrote ${filePath}${COLORS.RESET}`);
    
    return { success: true, backupPath };
  } catch (error) {
    console.error(`${COLORS.RED}❌ Error fixing ${filePath}: ${error.message}${COLORS.RESET}`);
    return { success: false, error: error.message };
  }
};

// Verify file compiles
const verifyFile = (filePath) => {
  try {
    const command = `cd /home/tarquin_stapa/Fluxori-V2/backend && npx tsc --noEmit ${filePath}`;
    execSync(command, { encoding: 'utf-8' });
    console.log(`${COLORS.GREEN}✓ Successfully verified ${filePath}${COLORS.RESET}`);
    return true;
  } catch (error) {
    console.log(`${COLORS.RED}❌ TypeScript errors remain in ${filePath}${COLORS.RESET}`);
    return false;
  }
};

// Main execution
const main = () => {
  // Focus on fixing the auth service test file first as it has the most urgent issues
  const authServiceTestPath = 'src/modules/xero-connector/tests/xero-auth.service.test.ts';
  const fullPath = path.join('/home/tarquin_stapa/Fluxori-V2/backend', authServiceTestPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${COLORS.RED}❌ File not found: ${fullPath}${COLORS.RESET}`);
    return;
  }
  
  const { success, backupPath } = applyComprehensiveFix(fullPath, fixedXeroAuthServiceTest);
  
  if (success) {
    if (verifyFile(authServiceTestPath)) {
      console.log(`\n${COLORS.GREEN}🎉 Successfully fixed ${authServiceTestPath}${COLORS.RESET}`);
    } else {
      console.log(`\n${COLORS.YELLOW}⚠️ Fixed file still has TypeScript errors${COLORS.RESET}`);
      console.log(`Original backup available at: ${backupPath}`);
    }
  }
  
  console.log(`\nRun TypeScript check on other Xero files to identify remaining errors:`);
  console.log(`$ npx tsc --noEmit src/modules/xero-connector/**/*.ts`);
};

// Run the script
main();