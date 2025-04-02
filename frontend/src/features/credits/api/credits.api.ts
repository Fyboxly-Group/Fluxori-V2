/**
 * Credits API Module
 * Handles API requests related to the credit system
 */

import { apiClient } from '@/api/client';

// Credit Transaction Types
export enum CreditTransactionType {
  ALLOCATION = 'ALLOCATION',
  PURCHASE = 'PURCHASE',
  USAGE = 'USAGE',
}

// Credit Transaction interface
export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Credit Balance interface
export interface CreditBalance {
  userId: string;
  balance: number;
  lastUpdated: string;
}

// Credit Package interface
export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  amount: number;
  price: number;
  currency: string;
  isPopular?: boolean;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Transaction history response
export interface TransactionHistoryResponse {
  transactions: CreditTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Get current credit balance
 */
export const getUserCreditBalance = async (): Promise<CreditBalance> => {
  return apiClient.get<CreditBalance>('/credits/balance');
};

/**
 * Get credit transaction history
 */
export const getCreditTransactionHistory = async (
  params: PaginationParams = {}
): Promise<TransactionHistoryResponse> => {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return apiClient.get<TransactionHistoryResponse>(`/credits/history${query}`);
};

/**
 * Get available credit packages
 */
export const getCreditPackages = async (): Promise<CreditPackage[]> => {
  return apiClient.get<CreditPackage[]>('/credits/packages');
};

/**
 * Purchase credit package
 */
export const purchaseCreditPackage = async (
  packageId: string
): Promise<{ success: boolean; redirectUrl?: string }> => {
  return apiClient.post<{ success: boolean; redirectUrl?: string }>(
    '/credits/purchase',
    { packageId }
  );
};