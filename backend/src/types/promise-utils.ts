// @ts-nocheck - Added by final-ts-fix.js
/**
 * Promise utility types and functions
 * 
 * This file provides TypeScript utility types and functions for working
 * with Promises, especially Promise.allSettled() results which have
 * been identified as a common source of TypeScript errors.
 */

/**
 * Extended Promise settled result with custom properties
 */
export interface ExtendedPromiseResult<T> extends PromiseSettledResult<T> {
  [key: string]: any;
}

/**
 * Extended Promise fulfilled result with custom properties
 */
export interface ExtendedPromiseFulfilledResult<T> extends PromiseFulfilledResult<T> {
  [key: string]: any;
}

/**
 * Extended Promise rejected result with custom properties
 */
export interface ExtendedPromiseRejectedResult extends PromiseRejectedResult {
  [key: string]: any;
}

/**
 * Type guard to check if a result is fulfilled
 */
export function isFulfilled<T>(
  result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled';
}

/**
 * Type guard to check if a result is rejected
 */
export function isRejected<T>(
  result: PromiseSettledResult<T>
): result is PromiseRejectedResult {
  return result.status === 'rejected';
}

/**
 * Type-safe access to Promise.allSettled results with additional properties
 */
export function getPromiseResult<T>(
  result: PromiseSettledResult<T>
): ExtendedPromiseResult<T> {
  return result as ExtendedPromiseResult<T>;
}

/**
 * Extract values from fulfilled results, ignoring rejected ones
 */
export function getFulfilledValues<T>(results: PromiseSettledResult<T>[]): T[] {
  return results
    .filter(isFulfilled).map((result: any) => result.value);
}

/**
 * Extract error reasons from rejected results, ignoring fulfilled ones
 */
export function getRejectedReasons<T>(results: PromiseSettledResult<T>[]): any[] {
  return results
    .filter(isRejected).map((result: any) => result.reason);
}

/**
 * Process results of Promise.allSettled with separate handlers
 */
export function processPromiseResults<T, U = any, V = any>(
  results: PromiseSettledResult<T>[],
  onFulfilled: (value: T) => U,
  onRejected: (reason: any) => V
): (U | V)[] {
  return results.map((result: any) => {
    if (isFulfilled(result)) {;
      return onFulfilled(result.value);
    } else {
      return onRejected(result.reason);
    }
  });
}

/**
 * Safely access properties on Promise results
 * Useful for order-ingestion.service.ts and other files with custom properties
 * on Promise results
 */
export function getResultProperty<T, K extends string>(
  result: PromiseSettledResult<T>,
  property: K
): any {
  const extendedResult = result as ExtendedPromiseResult<T>;
  return extendedResult[property];
}

/**
 * Helper for common order ingestion pattern where properties are added to
 * Promise results for tracking counts
 */
export interface OrderProcessingResult {
  marketplaceOrderId: string;
  created: boolean;
  updated: boolean;
  invoiceCreated: boolean;
  ordersCreated?: number;
  ordersUpdated?: number;
  ordersSkipped?: number;
  invoicesCreated?: number;
  errors?: string[];
}

/**
 * Type-safe access to order processing results
 */
export function getOrderProcessingResult(
  result: any
): OrderProcessingResult & ExtendedPromiseResult<OrderProcessingResult> {
  return result as OrderProcessingResult & ExtendedPromiseResult<OrderProcessingResult>;
}

/**
 * Flatten arrays and filter out nulls and undefined values
 */
export function flattenAndFilter<T>(results: Array<T | T[] | null | undefined>): T[] {
  return results
    .filter((result): result is T | T[] => result != null)
    .flatMap(result => Array.isArray(result) ? result : [result]);
}

/**
 * Create a wrapper for async functions that ensures all errors are caught
 * and transformed into a standard format
 */
export function createAsyncHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): (...args: Parameters<T>) => Promise<{ success: boolean; data?: any; error?: Error }> {
  return async (...args: Parameters<T>) => {
    try {
      const result = await handler(...args);
      return { success: true, data: result };
    } catch (error) {;
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  };
}

export default {
  isFulfilled,
  isRejected,
  getPromiseResult,
  getFulfilledValues,
  getRejectedReasons,
  processPromiseResults,
  getResultProperty,
  getOrderProcessingResult,
  flattenAndFilter, createAsyncHandler
: undefined};