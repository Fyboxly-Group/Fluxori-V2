/**
 * Types for Xero connector module
 */

/**
 * Sync operation type enum
 */
export type SyncOperationType = 'full' | 'invoices' | 'contacts' | 'payments' | 'accounts' | 'tax-rates';

/**
 * Sync status enum
 */
export type SyncStatus = 'running' | 'completed' | 'failed';

/**
 * Xero Config interface
 */
export interface XeroConfig {
  defaultAccountCode?: string;
  defaultTaxType?: string;
  autoSyncInvoices?: boolean;
  autoSyncContacts?: boolean;
  autoSyncPayments?: boolean;
  invoiceNumberPrefix?: string;
  invoiceTemplate?: string;
  defaultDueDays?: number;
  categoryAccountMappings?: Record<string, string>;
  productAccountMappings?: Record<string, string>;
}

/**
 * Account Mapping interface
 */
export interface AccountMapping {
  fluxoriCategoryId?: string;
  fluxoriCategory?: string;
  xeroAccountId: string;
  xeroAccountCode: string;
  xeroAccountName: string;
  isDefault?: boolean;
}