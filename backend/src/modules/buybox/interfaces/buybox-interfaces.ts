/**
 * BuyBox Interfaces
 */

/**
 * Interface for BuyBox Monitor implementations
 */
export interface IBuyBoxMonitor {
  marketplaceId: string;
  addSnapshot(data: any): Promise<void>;
  [key: string]: any;
}

/**
 * Interface for BuyBox History Repository
 */
export interface IBuyBoxHistoryRepository {
  getRules(itemId: string): Promise<any[]>;
  [key: string]: any;
}
