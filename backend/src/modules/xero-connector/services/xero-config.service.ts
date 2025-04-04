import { Injectable } from '../../../decorators/injectable.decorator';
import { Types } from 'mongoose';
import { XeroConfig } from '../models/xero-config.model';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Xero OAuth Configuration 
 */
export interface XeroOAuthConfig {
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
  async getXeroConfig(organizationId: Types.ObjectId): Promise<XeroOAuthConfig> {
    // Convert ObjectId to string for Firestore
    const orgId = organizationId.toString();
    
    // Find config in Firestore
    const config = await XeroConfig.findByOrganizationId(orgId);
    
    // Return OAuth configuration
    return {
      clientId: process.env.XERO_CLIENT_ID || '',
      clientSecret: process.env.XERO_CLIENT_SECRET || '',
      redirectUri: process.env.XERO_REDIRECT_URI || '',
      scopes: (process.env.XERO_SCOPES || '').split(','),
      accessToken: config?.accessToken || '',
      refreshToken: config?.refreshToken || '',
      idToken: config?.idToken || '',
      expiresIn: config?.expiresIn || 0,
      tenantId: config?.tenantId || '',
    };
  }
  
  /**
   * Update Xero configuration for an organization
   */
  async updateXeroConfig(
    organizationId: Types.ObjectId, 
    config: Partial<XeroOAuthConfig>
  ): Promise<void> {
    // Convert ObjectId to string for Firestore
    const orgId = organizationId.toString();
    
    // Find existing config or create new one
    const existingConfig = await XeroConfig.findByOrganizationId(orgId);
    
    if (existingConfig) {
      // Update existing config
      await XeroConfig.update(existingConfig.id, config);
    } else {
      // Create new config
      const now = Timestamp.now();
      await XeroConfig.create({
        ...config,
        organizationId: orgId,
        autoSyncInvoices: true,
        autoSyncContacts: true,
        autoSyncPayments: false,
        defaultDueDays: 30,
        createdAt: now,
        updatedAt: now
      });
    }
  }
  
  /**
   * Get integration settings for an organization
   */
  async getIntegrationSettings(organizationId: Types.ObjectId) {
    // Convert ObjectId to string for Firestore
    const orgId = organizationId.toString();
    
    // Find config in Firestore
    const config = await XeroConfig.findByOrganizationId(orgId);
    
    if (!config) {
      // Return default settings if no config exists
      return {
        autoSyncInvoices: true,
        autoSyncContacts: true,
        autoSyncPayments: false,
        defaultDueDays: 30,
        defaultAccountCode: '',
        defaultTaxType: '',
        invoiceNumberPrefix: '',
        categoryAccountMappings: {},
        productAccountMappings: {}
      };
    }
    
    return {
      autoSyncInvoices: config.autoSyncInvoices,
      autoSyncContacts: config.autoSyncContacts,
      autoSyncPayments: config.autoSyncPayments,
      defaultDueDays: config.defaultDueDays,
      defaultAccountCode: config.defaultAccountCode || '',
      defaultTaxType: config.defaultTaxType || '',
      invoiceNumberPrefix: config.invoiceNumberPrefix || '',
      categoryAccountMappings: config.categoryAccountMappings || {},
      productAccountMappings: config.productAccountMappings || {}
    };
  }
  
  /**
   * Update integration settings for an organization
   */
  async updateIntegrationSettings(
    organizationId: Types.ObjectId,
    settings: {
      autoSyncInvoices?: boolean;
      autoSyncContacts?: boolean;
      autoSyncPayments?: boolean;
      defaultDueDays?: number;
      defaultAccountCode?: string;
      defaultTaxType?: string;
      invoiceNumberPrefix?: string;
      categoryAccountMappings?: Record<string, string>;
      productAccountMappings?: Record<string, string>;
    }
  ): Promise<void> {
    // Convert ObjectId to string for Firestore
    const orgId = organizationId.toString();
    
    // Find existing config or create new one
    const existingConfig = await XeroConfig.findByOrganizationId(orgId);
    
    if (existingConfig) {
      // Update existing config
      await XeroConfig.update(existingConfig.id, settings);
    } else {
      // Create new config with default values merged with provided settings
      const now = Timestamp.now();
      await XeroConfig.create({
        organizationId: orgId,
        autoSyncInvoices: settings.autoSyncInvoices ?? true,
        autoSyncContacts: settings.autoSyncContacts ?? true,
        autoSyncPayments: settings.autoSyncPayments ?? false,
        defaultDueDays: settings.defaultDueDays ?? 30,
        defaultAccountCode: settings.defaultAccountCode,
        defaultTaxType: settings.defaultTaxType,
        invoiceNumberPrefix: settings.invoiceNumberPrefix,
        categoryAccountMappings: settings.categoryAccountMappings ?? {},
        productAccountMappings: settings.productAccountMappings ?? {},
        createdAt: now,
        updatedAt: now
      });
    }
  }
}
