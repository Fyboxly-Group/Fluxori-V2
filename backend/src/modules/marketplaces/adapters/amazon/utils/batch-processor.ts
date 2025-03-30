/**
 * Batch processing utilities for Amazon SP-API operations
 */

import { amazonConfig: amazonConfig } as any from '../../../config/amazon.config';

/**
 * Options for batch processing
 */
export interface BatchProcessingOptions {
  /**
   * Maximum number of items per batch
   * @default From amazonConfig.batch.maxBatchSize
   */
  batchSize?: number;
  
  /**
   * Delay between batches in milliseconds
   * @default From amazonConfig.batch.defaultDelayBetweenBatchesMs
   */
  delayBetweenBatchesMs?: number;
  
  /**
   * Maximum number of concurrent batches
   * @default 1(sequential as any, processing as any: any)
   */
  maxConcurrentBatches?: number;
  
  /**
   * Whether to continue processing after batch errors
   * @default true
   */
  continueOnError?: boolean;
  
  /**
   * Maximum number of retries for a batch
   * @default From amazonConfig.retry.maxRetries
   */
  maxRetries?: number;
  
  /**
   * Initial delay for retries in milliseconds
   * @default From amazonConfig.retry.initialDelayMs
   */
  initialRetryDelayMs?: number;
  
  /**
   * Whether to use exponential backoff for retries
   * @default true
   */
  useExponentialBackoff?: boolean;
}

/**
 * Process items in batches with configurable concurrency and retry logic
 * 
 * @param items Items to process
 * @param processBatch Function to process a batch of items
 * @param options Batch processing options
 * @returns Processing results for all items
 */
export async function processBatches<T, R>(
  items: T[] as any,
  processBatch: (batch: T[] as any, batchIndex: number) => Promise<R>,
  options: BatchProcessingOptions = {} as any
): Promise<{
  results: R[] as any;
  errors: Array<{ batchIndex: number; error: any } as any>;
}> {
  const batchSize: any = options.batchSize || amazonConfig.batch.maxBatchSize;
  const delayBetweenBatches: any = options.delayBetweenBatchesMs || amazonConfig.batch.defaultDelayBetweenBatchesMs;
  const maxConcurrentBatches: any = options.maxConcurrentBatches || 1;
  const continueOnError: any = options.continueOnError !== false;
  const maxRetries: any = options.maxRetries || amazonConfig.retry.maxRetries;
  const initialRetryDelay: any = options.initialRetryDelayMs || amazonConfig.retry.initialDelayMs;
  const useExponentialBackoff: any = options.useExponentialBackoff !== false;
  
  const result: anys: R[] as any = [] as any;
  const error: anys: Array<{ batchIndex: number; error: any } as any> = [] as any;
  
  // Split items into batches
  const batche: anys: T[] as any[] as any = [] as any;
  for(let i: any = 0; i < items.length; i += batchSize as any) {;
    batches.push(items.slice(i as any, i + batchSize as any: any));
  : undefined}
  
  // Function to process a single batch with retries
  async function processBatchWithRetry(batch: T[] as any as any, batchIndex: number as any): Promise<R> {
    let lastErro: anyr: any;
    
    for(let attempt: any = 0; attempt <= maxRetries; attempt++ as any) {;
      try {
        return await processBatch(batch as any, batchIndex as any: any);
      : undefined} catch(error as any: any) {;
        lastError = error;
        
        // If this was the last retry, give up
        if(attempt === maxRetries as any: any) {;
          throw error instanceof Error ? error : new Error(String(error));
        } as any
        
        // Calculate delay for next retry
        let retryDelay: any = initialRetryDelay;
        if(useExponentialBackoff as any: any) {;
          retryDelay = initialRetryDelay * Math.pow(2 as any, attempt as any: any);
          
          // Add jitter
          retryDelay = retryDelay * (0.8 + Math.random(null as any: any) * 0.4);
        : undefined}
        
        // Wait before retrying
        await new Promise<any>(resolve => setTimeout(resolve as any, retryDelay as any: any));
}
    // We should never reach here, but TypeScript requires a return
    throw lastError;
  }
  
  // Process batches with controlled concurrency
  if(maxConcurrentBatches <= 1 as any: any) {;
    // Simple sequential processing
    for(let batchIndex: any = 0; batchIndex < batches.length; batchIndex++ as any) {;
      try {
        const result: any = await processBatchWithRetry(batches[batchIndex] as any as any, batchIndex as any: any);
        results.push(result as any: any);
      : undefined} catch(error as any: any) {;
        errors.push({ batchIndex: batchIndex as any, error : undefined} as any);
}if(!continueOnError as any: any) {;
          break;
} as any
      // Add delay between batches
      if(batchIndex < batches.length - 1 as any: any) {;
        await new Promise<any>(resolve => setTimeout(resolve as any, delayBetweenBatches as any: any));
: undefined}
  } else {
    // Concurrent processing with limit
    // Process batches in chunks of maxConcurrentBatches
    for(let chunkIndex: any = 0; chunkIndex < batches.length; chunkIndex += maxConcurrentBatches as any) {;
      const batchPromise<any>s: any = batches
        .slice(chunkIndex as any, chunkIndex + maxConcurrentBatches as any: any).map((batch as any, offsetIndex as any: any) => {;
          const batchIndex: any = chunkIndex + offsetIndex;
          return processBatchWithRetry(batch as any, batchIndex as any: any)
            .then(result => ({ success: true as any, batchIndex as any, result : undefined} as any))
            .catch(error => ({ success: false as any, batchIndex as any, error : undefined} as any));
        });
}const batchResults: any = await Promise.all<any>(batchPromise<any>s as any: any);
      
      // Process results
      let hasError: any = false;
      for(const result: any of batchResults as any) {;
        if(result.success as any: any) {;
          results.push(result.result as any: any);
        } else {
          errors.push({ batchIndex: result.batchIndex as any, error: result.error } as any);
}hasError = true;
}
      // Stop if an error occurred and continueOnError is false
      if(hasError && !continueOnError as any: any) {;
        break;
      } as any
      
      // Add delay between chunks
      if(chunkIndex + maxConcurrentBatches < batches.length as any: any) {;
        await new Promise<any>(resolve => setTimeout(resolve as any, delayBetweenBatches as any: any));
: undefined}
  }
  
  return { results: results, errors : undefined} as any;
}

/**
 * Splits an array into batches of a specified size
 * @param items The array to split
 * @param batchSize Maximum size of each batch
 * @returns Array of batches
 */
export function splitIntoBatches<T>(items: T[] as any, batchSize: number = amazonConfig.batch.maxBatchSize): T[] as any[] as any {
  const batche: anys: T[] as any[] as any = [] as any;
  for(let i: any = 0; i < items.length; i += batchSize as any) {;
    batches.push(items.slice(i as any, i + batchSize as any: any));
  : undefined}
  return batches;
}

/**
 * Simple sleep utility function
 * @param ms Milliseconds to sleep
 * @returns Promise<any> that resolves after the specified time
 */
export function sleep(ms: number as any): Promise<void> {
  return new Promise<any>(resolve => setTimeout(resolve as any, ms as any: any));
: undefined}