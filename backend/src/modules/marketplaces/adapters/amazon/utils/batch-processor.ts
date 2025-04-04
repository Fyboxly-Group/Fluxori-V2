/**
 * Batch processing utilities for Amazon SP-API operations
 */

/**
 * Default configuration for Amazon API batch processing
 */
const DEFAULT_CONFIG = {
  batch: {
    maxBatchSize: 20,
    defaultDelayBetweenBatchesMs: 500
  },
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000
  }
};

/**
 * Options for batch processing
 */
export interface BatchProcessingOptions {
  /**
   * Maximum number of items per batch
   * @default 20
   */
  batchSize?: number;
  
  /**
   * Delay between batches in milliseconds
   * @default 500
   */
  delayBetweenBatchesMs?: number;
  
  /**
   * Maximum number of concurrent batches
   * @default 1 (sequential processing)
   */
  maxConcurrentBatches?: number;
  
  /**
   * Whether to continue processing after batch errors
   * @default true
   */
  continueOnError?: boolean;
  
  /**
   * Maximum number of retries for a batch
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Initial delay for retries in milliseconds
   * @default 1000
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
  items: T[],
  processBatch: (batch: T[], batchIndex: number) => Promise<R>,
  options: BatchProcessingOptions = {}
): Promise<{
  results: R[];
  errors: Array<{ batchIndex: number; error: any }>;
}> {
  const batchSize = options.batchSize || DEFAULT_CONFIG.batch.maxBatchSize;
  const delayBetweenBatches = options.delayBetweenBatchesMs || DEFAULT_CONFIG.batch.defaultDelayBetweenBatchesMs;
  const maxConcurrentBatches = options.maxConcurrentBatches || 1;
  const continueOnError = options.continueOnError !== false;
  const maxRetries = options.maxRetries || DEFAULT_CONFIG.retry.maxRetries;
  const initialRetryDelay = options.initialRetryDelayMs || DEFAULT_CONFIG.retry.initialDelayMs;
  const useExponentialBackoff = options.useExponentialBackoff !== false;
  
  const results: R[] = [];
  const errors: Array<{ batchIndex: number; error: any }> = [];
  
  // Split items into batches
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  // Function to process a single batch with retries
  async function processBatchWithRetry(batch: T[], batchIndex: number): Promise<R> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await processBatch(batch, batchIndex);
      } catch (error) {
        lastError = error;
        
        // If this was the last retry, give up
        if (attempt === maxRetries) {
          throw error instanceof Error ? error : new Error(String(error));
        }
        
        // Calculate delay for next retry
        let retryDelay = initialRetryDelay;
        if (useExponentialBackoff) {
          retryDelay = initialRetryDelay * Math.pow(2, attempt);
          
          // Add jitter
          retryDelay = retryDelay * (0.8 + Math.random() * 0.4);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    // We should never reach here, but TypeScript requires a return
    throw lastError;
  }
  
  // Process batches with controlled concurrency
  if (maxConcurrentBatches <= 1) {
    // Simple sequential processing
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      try {
        const result = await processBatchWithRetry(batches[batchIndex], batchIndex);
        results.push(result);
      } catch (error) {
        errors.push({ batchIndex, error });
        if (!continueOnError) {
          break;
        }
      }
      
      // Add delay between batches
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
  } else {
    // Concurrent processing with limit
    // Process batches in chunks of maxConcurrentBatches
    for (let chunkIndex = 0; chunkIndex < batches.length; chunkIndex += maxConcurrentBatches) {
      const batchPromises = batches
        .slice(chunkIndex, chunkIndex + maxConcurrentBatches)
        .map((batch, offsetIndex) => {
          const batchIndex = chunkIndex + offsetIndex;
          return processBatchWithRetry(batch, batchIndex)
            .then(result => ({ success: true, batchIndex, result }))
            .catch(error => ({ success: false, batchIndex, error }));
        });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Process results
      let hasError = false;
      for (const result of batchResults) {
        if (result.success) {
          results.push(result.result);
        } else {
          errors.push({ batchIndex: result.batchIndex, error: result.error });
          hasError = true;
        }
      }
      
      // Stop if an error occurred and continueOnError is false
      if (hasError && !continueOnError) {
        break;
      }
      
      // Add delay between chunks
      if (chunkIndex + maxConcurrentBatches < batches.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
  }
  
  return { results, errors };
}

/**
 * Splits an array into batches of a specified size
 * @param items The array to split
 * @param batchSize Maximum size of each batch
 * @returns Array of batches
 */
export function splitIntoBatches<T>(items: T[], batchSize: number = DEFAULT_CONFIG.batch.maxBatchSize): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Simple sleep utility function
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Batch processor utility for handling large sets of items
 */
export class BatchProcessor {
  private readonly options: BatchProcessingOptions;
  
  /**
   * Create a new batch processor with specified options
   * @param options Batch processing options
   */
  constructor(options: BatchProcessingOptions = {}) {
    this.options = {
      batchSize: options.batchSize || DEFAULT_CONFIG.batch.maxBatchSize,
      delayBetweenBatchesMs: options.delayBetweenBatchesMs || DEFAULT_CONFIG.batch.defaultDelayBetweenBatchesMs,
      maxConcurrentBatches: options.maxConcurrentBatches || 1,
      continueOnError: options.continueOnError !== false,
      maxRetries: options.maxRetries || DEFAULT_CONFIG.retry.maxRetries,
      initialRetryDelayMs: options.initialRetryDelayMs || DEFAULT_CONFIG.retry.initialDelayMs,
      useExponentialBackoff: options.useExponentialBackoff !== false
    };
  }
  
  /**
   * Process items in batches using the specified batch processor function
   * @param items Items to process
   * @param processBatch Function to process a batch of items
   * @returns Processing results
   */
  async process<T, R>(
    items: T[],
    processBatch: (batch: T[], batchIndex: number) => Promise<R>
  ): Promise<{
    results: R[];
    errors: Array<{ batchIndex: number; error: any }>;
  }> {
    return processBatches(items, processBatch, this.options);
  }
  
  /**
   * Split items into batches
   * @param items Items to split
   * @returns Array of batches
   */
  splitBatches<T>(items: T[]): T[][] {
    return splitIntoBatches(items, this.options.batchSize);
  }
}

export default BatchProcessor;