/**
 * LeakyBucketRateLimiter - Implementation of the leaky bucket algorithm for rate limiting
 * Specifically designed for Shopify API which follows this algorithm
 */
export interface RateLimiterOptions {
  tokensPerSecond: number;
  bucketSize: number;
}

export class LeakyBucketRateLimiter {
  private readonly bucketSize: number;
  private readonly leakRatePerMs: number;
  private availableCapacity: number;
  private lastLeakTime: number;

  /**
   * Create a new rate limiter
   * 
   * @param options - Configuration for the rate limiter
   */
  constructor(options: RateLimiterOptions) {
    this.bucketSize = options.bucketSize;
    this.leakRatePerMs = options.tokensPerSecond / 1000; // Convert to rate per millisecond
    this.availableCapacity = options.bucketSize;
    this.lastLeakTime = Date.now();
  }

  /**
   * Request to make an API call, will wait if necessary to respect rate limits
   * 
   * @param costOfCall - The "cost" of the API call (default is 1)
   * @returns Promise that resolves when it's safe to make the API call
   */
  async acquire(costOfCall: number = 1): Promise<void> {
    // Update available capacity based on time passed since last leak
    this.updateAvailableCapacity();
    
    // If we don't have enough capacity, calculate wait time
    if (this.availableCapacity < costOfCall) {
      const capacityNeeded = costOfCall - this.availableCapacity;
      const waitTimeMs = Math.ceil(capacityNeeded / this.leakRatePerMs);
      
      // Wait for the calculated time
      await new Promise(resolve => setTimeout(resolve, waitTimeMs));
      
      // Update capacity again after waiting
      this.updateAvailableCapacity();
    }
    
    // Reduce available capacity by the cost of the call
    this.availableCapacity -= costOfCall;
  }

  /**
   * Update the available capacity based on time elapsed since last update
   */
  private updateAvailableCapacity(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastLeakTime;
    
    if (elapsedMs > 0) {
      // Calculate how much capacity leaked since last check
      const leakedCapacity = elapsedMs * this.leakRatePerMs;
      
      // Add the leaked capacity, but don't exceed bucket size
      this.availableCapacity = Math.min(
        this.bucketSize,
        this.availableCapacity + leakedCapacity
      );
      
      this.lastLeakTime = now;
    }
  }

  /**
   * Get the current available capacity in the bucket
   * @returns Current available capacity
   */
  getAvailableCapacity(): number {
    this.updateAvailableCapacity();
    return this.availableCapacity;
  }

  /**
   * Get the estimated wait time in milliseconds for a given cost
   * 
   * @param cost - The cost to check
   * @returns Estimated wait time in milliseconds
   */
  getEstimatedWaitTime(cost: number = 1): number {
    this.updateAvailableCapacity();
    
    if (this.availableCapacity >= cost) {
      return 0;
    }
    
    const capacityNeeded = cost - this.availableCapacity;
    return Math.ceil(capacityNeeded / this.leakRatePerMs);
  }
}