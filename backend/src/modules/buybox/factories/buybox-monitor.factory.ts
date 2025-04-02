/**
 * Buy Box Monitor Factory
 * 
 * Factory for creating marketplace-specific Buy Box monitors
 */
import { IBuyBoxMonitor } from '../services/buybox-monitor.interface';
import { AmazonBuyBoxMonitor } from '../services/amazon-buybox-monitor';
import { TakealotBuyBoxMonitor } from '../services/takealot-buybox-monitor';
import { Logger } from '../../../utils/logger';

/**
 * Factory for Buy Box monitors
 */
export class BuyBoxMonitorFactory {
  private readonly logger: Logger;
  private readonly monitors: Map<string, IBuyBoxMonitor>;
  
  /**
   * Constructor
   */
  constructor() {
    this.logger = new Logger('BuyBoxMonitorFactory');
    this.monitors = new Map<string, IBuyBoxMonitor>();
    
    // Initialize supported monitors
    this.monitors.set('amazon', new AmazonBuyBoxMonitor());
    this.monitors.set('takealot', new TakealotBuyBoxMonitor());
  }
  
  /**
   * Get a Buy Box monitor for a specific marketplace
   * @param marketplaceId The marketplace ID
   * @returns Buy Box monitor instance
   */
  getMonitor(marketplaceId: string): IBuyBoxMonitor {
    const monitor = this.monitors.get(marketplaceId.toLowerCase());
    
    if (!monitor) {
      this.logger.error(`No Buy Box monitor found for marketplace: ${marketplaceId}`);
      throw new Error(`Unsupported marketplace for Buy Box monitoring: ${marketplaceId}`);
    }
    
    return monitor;
  }
  
  /**
   * Check if a marketplace is supported for Buy Box monitoring
   * @param marketplaceId The marketplace ID
   * @returns True if the marketplace is supported
   */
  isMarketplaceSupported(marketplaceId: string): boolean {
    return this.monitors.has(marketplaceId.toLowerCase());
  }
  
  /**
   * Get all supported marketplaces
   * @returns Array of supported marketplace IDs
   */
  getSupportedMarketplaces(): string[] {
    return Array.from(this.monitors.keys());
  }
}

// Singleton instance
let factory: BuyBoxMonitorFactory | null = null;

/**
 * Get the Buy Box monitor factory
 * @returns Buy Box monitor factory
 */
export function getBuyBoxMonitorFactory(): BuyBoxMonitorFactory {
  if (!factory) {
    factory = new BuyBoxMonitorFactory();
  }
  
  return factory;
}