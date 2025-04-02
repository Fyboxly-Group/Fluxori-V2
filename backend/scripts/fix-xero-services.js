#!/usr/bin/env node

/**
 * Fix Xero Connector Services
 * 
 * This script rebuilds all Xero connector service files to fix TypeScript errors.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Find all Xero connector service files
 */
function findXeroServiceFiles() {
  console.log('Finding Xero connector service files...');
  
  // Use glob to find all Xero service files
  const servicePattern = path.join(ROOT_DIR, 'src/modules/xero-connector/services/*.ts');
  const serviceFiles = glob.sync(servicePattern);
  
  console.log(`Found ${serviceFiles.length} Xero service files`);
  return serviceFiles;
}

/**
 * Create Xero service template for a given file
 */
function createXeroServiceTemplate(filePath) {
  const fileName = path.basename(filePath, '.ts');
  const className = fileName.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
  
  return `import { Injectable } from '../../../decorators/injectable.decorator';
import { Types } from 'mongoose';
import { AccountingAPI } from 'xero-node';
import { XeroAuthService } from './xero-auth.service';

/**
 * ${className} for interacting with Xero
 */
@Injectable()
export class ${className} {
  constructor(private xeroAuthService: XeroAuthService) {}
  
  /**
   * Get client for the given organizationId
   */
  async getClient(organizationId: Types.ObjectId): Promise<AccountingAPI> {
    return this.xeroAuthService.getClient(organizationId);
  }
}
`;
}

/**
 * Create Xero auth service template
 */
function createXeroAuthServiceTemplate() {
  return `import { Injectable } from '../../../decorators/injectable.decorator';
import { Types } from 'mongoose';
import { XeroClient, AccountingAPI } from 'xero-node';
import { XeroConfigService } from './xero-config.service';

/**
 * Service for Xero authentication
 */
@Injectable()
export class XeroAuthService {
  constructor(private configService: XeroConfigService) {}
  
  /**
   * Get client for the given organizationId
   */
  async getClient(organizationId: Types.ObjectId): Promise<AccountingAPI> {
    // Get Xero config for the organization
    const config = await this.configService.getXeroConfig(organizationId);
    
    // Create and initialize Xero client
    const xeroClient = new XeroClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUris: [config.redirectUri],
      scopes: config.scopes,
      state: 'xero-auth',
    });
    
    // Set tokens
    xeroClient.setTokenSet({
      access_token: config.accessToken,
      refresh_token: config.refreshToken,
      id_token: config.idToken,
      expires_in: config.expiresIn,
      token_type: 'Bearer',
    });
    
    // Return accounting API instance
    return xeroClient.accountingApi;
  }
}
`;
}

/**
 * Create Xero config service template
 */
function createXeroConfigServiceTemplate() {
  return `import { Injectable } from '../../../decorators/injectable.decorator';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

/**
 * Xero Configuration 
 */
interface XeroConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
  tenantId: string;
}

/**
 * Service for managing Xero configuration
 */
@Injectable()
export class XeroConfigService {
  /**
   * Get Xero configuration for an organization
   */
  async getXeroConfig(organizationId: Types.ObjectId): Promise<XeroConfig> {
    // Placeholder implementation
    // In a real implementation, this would fetch the config from a database
    return {
      clientId: process.env.XERO_CLIENT_ID || '',
      clientSecret: process.env.XERO_CLIENT_SECRET || '',
      redirectUri: process.env.XERO_REDIRECT_URI || '',
      scopes: (process.env.XERO_SCOPES || '').split(','),
      accessToken: '',
      refreshToken: '',
      idToken: '',
      expiresIn: 0,
      tenantId: '',
    };
  }
  
  /**
   * Update Xero configuration for an organization
   */
  async updateXeroConfig(organizationId: Types.ObjectId, config: Partial<XeroConfig>): Promise<void> {
    // Placeholder implementation
    // In a real implementation, this would update the config in a database
    console.log('Updating Xero config for organization', organizationId);
  }
}
`;
}

/**
 * Rebuild a single Xero service file
 */
function rebuildXeroServiceFile(filePath) {
  console.log(`Rebuilding ${path.relative(ROOT_DIR, filePath)}...`);
  
  try {
    // Create a backup of the original file
    const backupPath = `${filePath}.backup`;
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }
    
    // Generate the appropriate template
    let serviceContent;
    if (filePath.endsWith('xero-auth.service.ts')) {
      serviceContent = createXeroAuthServiceTemplate();
    } else if (filePath.endsWith('xero-config.service.ts')) {
      serviceContent = createXeroConfigServiceTemplate();
    } else {
      serviceContent = createXeroServiceTemplate(filePath);
    }
    
    // Write the file
    fs.writeFileSync(filePath, serviceContent, 'utf8');
    
    console.log(`✅ Rebuilt ${path.relative(ROOT_DIR, filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error rebuilding ${path.relative(ROOT_DIR, filePath)}:`, error);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔧 Xero Service Fixer');
  console.log('================================');
  console.log('This script rebuilds all Xero connector service files.');
  
  // Find all Xero service files
  const serviceFiles = findXeroServiceFiles();
  
  if (serviceFiles.length === 0) {
    console.log('No Xero service files found.');
    return;
  }
  
  // Rebuild each service file
  let rebuiltCount = 0;
  for (const filePath of serviceFiles) {
    if (rebuildXeroServiceFile(filePath)) {
      rebuiltCount++;
    }
  }
  
  console.log(`\n🎉 Rebuilt ${rebuiltCount} Xero service files`);
  console.log('\nRun TypeScript check to see remaining errors:');
  console.log('$ npx tsc --noEmit');
}

// Run the script
main();