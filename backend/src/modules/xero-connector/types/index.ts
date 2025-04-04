// TypeScript definitions for Xero connector module
import { TokenSet } from 'xero-node';

/**
 * User credentials for Xero operations
 */
export interface XeroUserCredentials {
  userId: string;
  organizationId: string;
  tenantId: string;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Token response from Xero OAuth flow
 */
export interface XeroTokenResponse {
  tokenSet: TokenSet;
  tenantId: string;
  tenantName: string;
}

/**
 * State for the OAuth flow
 */
export interface XeroOAuthState {
  userId: string;
  organizationId: string;
  redirectUrl: string;
}

/**
 * Xero invoice creation result
 */
export interface XeroInvoiceResult {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  error?: string;
}

/**
 * Address information for a customer
 */
export interface FluxoriBillingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Customer data for Xero invoice creation
 */
export interface FluxoriCustomerData {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: FluxoriBillingAddress;
}

/**
 * Line item for Xero invoice creation
 */
export interface FluxoriOrderItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  subtotal: number;
  accountCode?: string; // Xero account code, if specified
}

/**
 * Fluxori order data for Xero invoice creation
 */
export interface FluxoriOrderData {
  orderId: string;
  orderNumber: string;
  customerData: FluxoriCustomerData;
  items: FluxoriOrderItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingCost: number;
  total: number;
  dueDate?: Date;
  reference?: string;
}

/**
 * Xero integration configuration
 */
export interface XeroConfig {
  defaultAccountCode?: string;
  defaultTaxType?: string;
  autoSyncInvoices: boolean;
  autoSyncContacts: boolean;
  autoSyncPayments: boolean;
  invoiceNumberPrefix?: string;
  invoiceTemplate?: string;
  defaultDueDays: number;
  categoryAccountMappings?: Record<string, string>;
  productAccountMappings?: Record<string, string>;
}

/**
 * Contact sync data for syncing Fluxori customers to Xero
 */
export interface ContactSyncData {
  customerId: string;
  xeroContactId?: string;
}

/**
 * Sync operation type for data synchronization
 */
export type SyncOperationType = 'full' | 'invoices' | 'contacts' | 'payments' | 'accounts' | 'tax-rates';

/**
 * Sync status tracking values
 */
export type SyncStatusValue = 'running' | 'completed' | 'failed';

/**
 * Sync status for tracking synchronization operations
 */
export interface SyncStatus {
  id: string;
  type: SyncOperationType;
  startedAt: Date;
  completedAt?: Date;
  status: SyncStatusValue;
  progress: number;
  totalItems?: number;
  processedItems?: number;
  errors?: string[];
  userId: string;
  organizationId: string;
}

/**
 * Account mapping for associating product categories with Xero account codes
 */
export interface AccountMapping {
  fluxoriCategoryId?: string;
  fluxoriCategory?: string;
  xeroAccountId: string;
  xeroAccountCode: string;
  xeroAccountName: string;
  isDefault?: boolean;
}

/**
 * Xero webhook notification event
 */
export interface XeroWebhookEvent {
  resourceUrl: string;
  resourceId: string;
  eventType: string;
  eventCategory: string;
  eventDate: string;
  tenantId: string;
  tenantType: string;
}

/**
 * Reconciliation status between Fluxori and Xero
 */
export interface ReconciliationStatus {
  totalInvoicesInFluxori: number;
  totalInvoicesInXero: number;
  unmatchedInvoicesInFluxori: number;
  unmatchedInvoicesInXero: number;
  totalContactsInFluxori: number;
  totalContactsInXero: number;
  unmatchedContactsInFluxori: number;
  unmatchedContactsInXero: number;
  lastReconciliationDate: Date;
}