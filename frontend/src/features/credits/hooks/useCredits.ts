/**
 * Credits Hooks
 * React Query hooks for fetching and managing credits data
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUserCreditBalance, 
  getCreditTransactionHistory,
  getCreditPackages,
  purchaseCreditPackage,
  type CreditBalance,
  type TransactionHistoryResponse,
  type CreditPackage,
  type PaginationParams
} from '../api/credits.api';

// Query keys for React Query
const QUERY_KEYS = {
  balance: ['credits', 'balance'],
  history: ['credits', 'history'],
  packages: ['credits', 'packages'],
};

/**
 * Hook to fetch user's credit balance
 */
export const useCreditBalance = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.balance,
    queryFn: () => getUserCreditBalance(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute
    ...options,
  });
};

/**
 * Hook to fetch credit transaction history with pagination
 */
export const useCreditHistory = (params: PaginationParams = { page: 1, limit: 10 }) => {
  return useQuery<TransactionHistoryResponse, Error, TransactionHistoryResponse, Array<string | PaginationParams>>({
    queryKey: [...QUERY_KEYS.history, params],
    queryFn: () => getCreditTransactionHistory(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch credit transaction history with infinite loading
 */
export const useInfiniteCreditHistory = (limit: number = 10) => {
  return useInfiniteQuery<TransactionHistoryResponse, Error>({
    queryKey: [...QUERY_KEYS.history, 'infinite', limit],
    queryFn: ({ pageParam }) => {
      const page = pageParam as number || 1;
      return getCreditTransactionHistory({ page, limit });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      // Return undefined if we've reached the end
      if (!lastPage.pagination) return undefined;
      return lastPage.pagination.page < lastPage.pagination.pages 
        ? lastPage.pagination.page + 1 
        : undefined;
    },
  });
};

/**
 * Hook to fetch available credit packages
 */
export const useCreditPackages = () => {
  return useQuery({
    queryKey: QUERY_KEYS.packages,
    queryFn: () => getCreditPackages(),
  });
};

/**
 * Hook to purchase a credit package
 */
export const usePurchaseCreditPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (packageId: string) => purchaseCreditPackage(packageId),
    onSuccess: () => {
      // Invalidate credit balance and history after purchase
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.balance });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.history });
    },
  });
};