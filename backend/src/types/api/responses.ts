// @ts-nocheck - Added by final-ts-fix.js
import { Types } from 'mongoose';

/**
 * Base API response interface
 */
export interface APIResponse {
  success: boolean;
  message?: string;
  error?: string | Error;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> extends APIResponse {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Xero-syncResponse interface
 */
export interface XeroSyncResponse extends APIResponse {
  success: boolean;
  message?: string;
  parameters?: any;
  data: any;
}

/**
 * Xero-invoiceResponse interface
 */
export interface XeroInvoiceResponse extends APIResponse {
  success: boolean;
  message?: string;
  parameters?: any;
  parameter?: any;
}

/**
 * Xero-contactResponse interface
 */
export interface XeroContactResponse extends APIResponse {
  success: boolean;
  message?: string;
  parameters?: any;
  data: any;
}

/**
 * Xero-configResponse interface
 */
export interface XeroConfigResponse extends APIResponse {
  success: boolean;
  data: any;
  message?: string;
  parameters?: any;
}

/**
 * Xero-authResponse interface
 */
export interface XeroAuthResponse extends APIResponse {
  success: boolean;
  message?: string;
  parameters?: any;
  callback?: any;
}

/**
 * Xero-accountResponse interface
 */
export interface XeroAccountResponse extends APIResponse {
  success: boolean;
  message?: string;
  parameters?: any;
  data: any;
}

/**
 * Sync-orchestratorResponse interface
 */
export interface SyncOrchestratorResponse extends APIResponse {
  success: boolean;
  message?: string;
  intervalMinutes?: any;
  error?: string | Error;
  isRunning?: any;
  isScheduled?: any;
}

/**
 * Rag-retrievalResponse interface
 */
export interface RagRetrievalResponse extends APIResponse {
  success: boolean;
  data: any;
}

/**
 * NotificationResponse interface
 */
export interface NotificationResponse extends APIResponse {
  success: boolean;
  notifications?: any;
}

/**
 * Marketplace-productResponse interface
 */
export interface MarketplaceProductResponse extends APIResponse {
  success: boolean;
  message?: string;
  data: any;
}

/**
 * International-tradeResponse interface
 */
export interface InternationalTradeResponse extends APIResponse {
  success: boolean;
}

/**
 * CreditResponse interface
 */
export interface CreditResponse extends APIResponse {
  success: boolean;
  balance?: any;
  transactions?: any;
  message?: string;
}

/**
 * ConversationResponse interface
 */
export interface ConversationResponse extends APIResponse {
  success: boolean;
}

/**
 * DashboardResponse interface
 */
export interface DashboardResponse extends APIResponse {
  success: boolean;
  message?: string;
  data: any;
}

/**
 * Successful API response with data
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Failed API response with error
 */
export interface ErrorResponse {
  success: false;
  error: string | Error;
  message?: string;
}

/**
 * API result type (discriminated union)
 */
export type APIResult<T> = SuccessResponse<T> | ErrorResponse;
