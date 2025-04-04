// Fixed by fix-remaining-typescript-errors.js
/**
 * LeakyBucketRateLimiter - Implementation of the leaky bucket algorithm for rate limiting
 * Specifically designed for Shopify API which follows this algorithm
 */
export class LeakyBucketRateLimiter {
  private readonly bucketSize: number;
  private readonly leakRatePerMs: number;
  private availableCapacity: number;
  private lastLeakTime: number;

  /**
   * Create a new rate limiter
   * 
   * @param callsPerSecond - The rate at which the bucket leaks(calls allowed per second)
   * @param bucketSize - The maximum bucket capacity(burst capacity)
   */
  constructor(callsPerSecond: number, bucketSize: number) {
    this.bucketSize = bucketSize;
    this.leakRatePerMs = callsPerSecond / 1000; // Convert to rate per millisecond
    this.availableCapacity = bucketSize;
    this.lastLeakTime = Date.now();
  }

  /**
   * Request to make an API call, will wait if necessary to respect rate limits
   * 
   * @param costOfCall - The "cost" of the API call(default is 1)
   * @returns Promise<any> that resolves when it's safe to make the API call
   */
  async acquireToken(costOfCall: number = 1): Promise<void> {
    // Update available capacity based on time passed since last leak
    this.updateAvailableCapacity();
    
    // If we don't have enough capacity, calculate wait time
    if(this.availableCapacity < costOfCall) {
      const capacityNeeded = costOfCall - this.availableCapacity;
      const waitTimeMs = Math.ceil(capacityNeeded / this.leakRatePerMs);
      
      // Wait for the calculated time
      await new Promise<any>(resolve => setTimeout(resolve, waitTimeMs));
      
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
    
    if(elapsedMs > 0) {
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
    
    if(this.availableCapacity >= cost) {
      return 0;
    }
    
    const capacityNeeded = cost - this.availableCapacity;
    return Math.ceil(capacityNeeded / this.leakRatePerMs);
  }
}