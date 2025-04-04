// Index file for Xero connector module
import xeroRoutes from './routes/xero.routes';

// Services
import { XeroAuthService } from './services/xero-auth.service';
import { XeroInvoiceService } from './services/xero-invoice.service';
import { XeroSyncService } from './services/xero-sync.service';
import { XeroContactService } from './services/xero-contact.service';
import { XeroAccountService } from './services/xero-account.service';
import { XeroConfigService } from './services/xero-config.service';
import { XeroBulkSyncService } from './services/xero-bulk-sync.service';
import { XeroWebhookService } from './services/xero-webhook.service';

// Service instances
const xeroConfigService = new XeroConfigService();
const xeroAuthService = new XeroAuthService(xeroConfigService);
const xeroInvoiceService = new XeroInvoiceService();
const xeroSyncService = new XeroSyncService();
const xeroContactService = new XeroContactService();
const xeroAccountService = new XeroAccountService();
const xeroBulkSyncService = new XeroBulkSyncService();
const xeroWebhookService = new XeroWebhookService();

// Models
import XeroConnection, { 
  IXeroConnection, 
  IXeroConnectionWithId 
} from './models/xero-connection.model';

import XeroConfig, { 
  IXeroConfig, 
  IXeroConfigWithId 
} from './models/xero-config.model';

import XeroAccountMapping, { 
  IXeroAccountMapping, 
  IXeroAccountMappingWithId 
} from './models/xero-account-mapping.model';

import XeroSyncStatus, { 
  IXeroSyncStatus, 
  IXeroSyncStatusWithId 
} from './models/xero-sync-status.model';

// Controllers
import xeroAuthController from './controllers/xero-auth.controller';
import xeroInvoiceController from './controllers/xero-invoice.controller';
import xeroContactController from './controllers/xero-contact.controller';
import xeroAccountController from './controllers/xero-account.controller';
import xeroConfigController from './controllers/xero-config.controller';
import xeroSyncController from './controllers/xero-sync.controller';
import xeroWebhookController from './controllers/xero-webhook.controller';

// Utilities
import orderHooks from './utils/order-hooks';

// Types
import {
  XeroUserCredentials,
  XeroTokenResponse,
  XeroOAuthState,
  XeroInvoiceResult,
  FluxoriOrderData,
  FluxoriCustomerData,
  FluxoriOrderItem,
  FluxoriBillingAddress,
  XeroConfig as XeroConfigType,
  ContactSyncData,
  SyncOperationType,
  SyncStatusValue,
  SyncStatus,
  AccountMapping,
  XeroWebhookEvent,
  ReconciliationStatus
} from './types';

// Register order hooks for automatic invoice creation
try {
  orderHooks.registerOrderHooks();
} catch(error) {
  console.error('Failed to register Xero order hooks:', error instanceof Error ? error.message : String(error));
}

// Export services
export {
  xeroRoutes,
  xeroAuthService,
  xeroInvoiceService,
  xeroSyncService,
  xeroContactService,
  xeroAccountService,
  xeroConfigService,
  xeroBulkSyncService,
  xeroWebhookService,
};

// Export models
export {
  XeroConnection,
  XeroConfig,
  XeroAccountMapping,
  XeroSyncStatus,
};

// Export controllers
export {
  xeroAuthController,
  xeroInvoiceController,
  xeroContactController,
  xeroAccountController,
  xeroConfigController,
  xeroSyncController,
  xeroWebhookController,
};

// Export utils
export {
  orderHooks,
};

// Export service classes
export {
  XeroAuthService,
  XeroInvoiceService,
  XeroSyncService,
  XeroContactService,
  XeroAccountService,
  XeroConfigService,
  XeroBulkSyncService,
  XeroWebhookService,
};

// Export types
export type {
  IXeroConnection,
  IXeroConnectionWithId,
  IXeroConfig,
  IXeroConfigWithId,
  IXeroAccountMapping,
  IXeroAccountMappingWithId,
  IXeroSyncStatus,
  IXeroSyncStatusWithId,
  XeroUserCredentials,
  XeroTokenResponse,
  XeroOAuthState,
  XeroInvoiceResult,
  FluxoriOrderData,
  FluxoriCustomerData,
  FluxoriOrderItem,
  FluxoriBillingAddress,
  XeroConfigType,
  ContactSyncData,
  SyncOperationType,
  SyncStatusValue,
  SyncStatus,
  AccountMapping,
  XeroWebhookEvent,
  ReconciliationStatus
};

export default {
  routes: xeroRoutes,
};
