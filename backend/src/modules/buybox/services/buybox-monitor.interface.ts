/**
 * Buy Box Monitor Interface
 * 
 * Interface for marketplace-specific Buy Box monitoring implementations
 */
import { 
  BuyBoxSnapshot, 
  BuyBoxHistory, 
  BuyBoxOwnershipStatus, 
  Competitor 
} from '../../../models/firestore/buybox.schema';
import { FirestoreInventoryItem } from '../../../models/firestore/inventory.schema';

/**
 * Interface for Buy Box monitoring services
 */
export interface IBuyBoxMonitor {
  /**
   * The unique identifier for the marketplace
   */
  readonly marketplaceId: string;
  
  /**
   * Check the Buy Box status for a single product
   * @param productId The product ID to check
   * @param marketplaceProductId The marketplace-specific product ID
   * @returns A Buy Box snapshot with the current Buy Box status
   */
  checkBuyBoxStatus(productId: string, marketplaceProductId: string): Promise<BuyBoxSnapshot>;
  
  /**
   * Get competitor data for a product
   * @param productId The product ID to check
   * @param marketplaceProductId The marketplace-specific product ID
   * @returns Array of competitors for the product
   */
  getCompetitors(productId: string, marketplaceProductId: string): Promise<Competitor[]>;
  
  /**
   * Calculate suggested price based on competitive data
   * @param product The Fluxori product
   * @param snapshot The current Buy Box snapshot
   * @returns Suggested price and reasoning
   */
  calculateSuggestedPrice(
    product: FirestoreInventoryItem,
    snapshot: BuyBoxSnapshot
  ): Promise<{ suggestedPrice: number, reason: string }>;
  
  /**
   * Update price on the marketplace
   * @param productId The product ID
   * @param marketplaceProductId The marketplace-specific product ID
   * @param newPrice The new price to set
   * @returns Success status and any error message
   */
  updatePrice(
    productId: string, 
    marketplaceProductId: string, 
    newPrice: number
  ): Promise<{ success: boolean, message?: string }>;
  
  /**
   * Initialize Buy Box monitoring for a product
   * @param product The Fluxori product
   * @param marketplaceProductId The marketplace-specific product ID
   * @param monitoringFrequency How often to check the Buy Box (in minutes)
   * @returns The initialized Buy Box history object
   */
  initializeMonitoring(
    product: FirestoreInventoryItem,
    marketplaceProductId: string,
    monitoringFrequency: number
  ): Promise<BuyBoxHistory>;
  
  /**
   * Stop Buy Box monitoring for a product
   * @param productId The product ID
   * @param marketplaceProductId The marketplace-specific product ID
   * @returns Success status
   */
  stopMonitoring(productId: string, marketplaceProductId: string): Promise<boolean>;
}