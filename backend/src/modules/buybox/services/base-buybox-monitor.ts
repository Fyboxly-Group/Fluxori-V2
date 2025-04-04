// @ts-nocheck - Added by final-ts-fix.js
/**
 * Base Buy Box Monitor
 * 
 * Base implementation for marketplace-specific Buy Box monitors
 */
import { Timestamp } from 'firebase-admin/firestore';
import { 
  BuyBoxSnapshot, 
  BuyBoxHistory, 
  BuyBoxOwnershipStatus, 
  Competitor 
} from '../../../models/firestore/buybox.schema';
import { FirestoreInventoryItem } from '../../../models/firestore/inventory.schema';
import { IBuyBoxMonitor } from './buybox-monitor.interface';
import { getBuyBoxHistoryRepository } from '../repositories/buybox-history.repository';
import { Logger } from '../../../utils/logger';

/**
 * Base Buy Box monitor implementation
 */
export abstract class BaseBuyBoxMonitor implements IBuyBoxMonitor {
  /**
   * The marketplace ID
   */
  abstract readonly marketplaceId: string;
  
  /**
   * Logger instance
   */
  protected readonly logger: Logger;
  
  /**
   * Constructor
   */
  constructor() {
    this.logger = new Logger(`BuyBoxMonitor:${/* @ts-ignore */ this.marketplaceId}`);
  }
  
  /**
   * Abstract methods that must be implemented by marketplace-specific monitors
   */
  abstract checkBuyBoxStatus(productId: string, marketplaceProductId: string): Promise<BuyBoxSnapshot>;
  abstract getCompetitors(productId: string, marketplaceProductId: string): Promise<Competitor[]>;
  abstract calculateSuggestedPrice(
    product: FirestoreInventoryItem,
    snapshot: BuyBoxSnapshot
  ): Promise<{ suggestedPrice: number, reason: string }>;
  abstract updatePrice(
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
  async initializeMonitoring(
    product: FirestoreInventoryItem,
    marketplaceProductId: string,
    monitoringFrequency: number = 60 // Default: check once per hour
  ): Promise<BuyBoxHistory> {
    try {
      // Check if marketplace listing exists
      const marketplaceListing = product.marketplaces[/* @ts-ignore */ this.marketplaceId];
      if (!marketplaceListing) {
        throw new Error(`No ${/* @ts-ignore */ this.marketplaceId} listing found for product ${product.sku}`);
      }
      
      // Get initial Buy Box snapshot
      const initialSnapshot = await this.checkBuyBoxStatus(
        product.id || '', 
        marketplaceProductId
      );
      
      // Initialize Buy Box history
      const buyBoxHistory: BuyBoxHistory = {
        id: `${product.id}_${/* @ts-ignore */ this.marketplaceId}`,
        userId: product.userId,
        orgId: product.orgId,
        sku: product.sku,
        productId: product.id || '',
        marketplaceId: /* @ts-ignore */ this.marketplaceId,
        marketplaceProductId,
        lastSnapshot: initialSnapshot,
        isMonitoring: true,
        monitoringFrequency,
        snapshots: [initialSnapshot],
        buyBoxWinPercentage: initialSnapshot.ownBuyBoxStatus === BuyBoxOwnershipStatus.OWNED ? 100 : 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // Save to repository
      const repository = getBuyBoxHistoryRepository();
      await repository.create(buyBoxHistory);
      
      this.logger.info(`Initialized Buy Box monitoring for ${product.sku} on ${/* @ts-ignore */ this.marketplaceId}`);
      return buyBoxHistory;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to initialize Buy Box monitoring for ${product.sku}`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
  
  /**
   * Stop Buy Box monitoring for a product
   * @param productId The product ID
   * @param marketplaceProductId The marketplace-specific product ID
   * @returns Success status
   */
  async stopMonitoring(productId: string, marketplaceProductId: string): Promise<boolean> {
    try {
      const repository = getBuyBoxHistoryRepository();
      const historyId = `${productId}_${/* @ts-ignore */ this.marketplaceId}`;
      
      // Update the monitoring flag
      await repository.update(historyId, {
        isMonitoring: false,
        updatedAt: Timestamp.now()
      });
      
      this.logger.info(`Stopped Buy Box monitoring for ${productId} on ${/* @ts-ignore */ this.marketplaceId}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to stop Buy Box monitoring for ${productId}`, error);
      return false;
    }
  }
  
  /**
   * Add a new Buy Box snapshot to history
   * @param productId The product ID
   * @param snapshot The Buy Box snapshot to add
   * @returns Updated Buy Box history
   */
  async addSnapshot(productId: string, snapshot: BuyBoxSnapshot): Promise<BuyBoxHistory | null> {
    try {
      const repository = getBuyBoxHistoryRepository();
      const historyId = `${productId}_${/* @ts-ignore */ this.marketplaceId}`;
      
      // Get current history
      const history = await repository.getById(historyId);
      if (!history) {
        this.logger.error(`No Buy Box history found for ${productId} on ${/* @ts-ignore */ this.marketplaceId}`);
        return null;
      }
      
      // Check for Buy Box status changes
      const previousSnapshot = history.lastSnapshot;
      const updates: Partial<BuyBoxHistory> = {
        lastSnapshot: snapshot,
        snapshots: [...history.snapshots, snapshot],
        updatedAt: Timestamp.now()
      };
      
      // Track Buy Box wins and losses
      if (previousSnapshot && 
          previousSnapshot.ownBuyBoxStatus !== snapshot.ownBuyBoxStatus) {
        
        if (snapshot.ownBuyBoxStatus === BuyBoxOwnershipStatus.OWNED) {
          // Buy Box win
          updates.lastBuyBoxWin = {
            timestamp: snapshot.timestamp,
            reason: 'Price change or competitor changes',
            previousPrice: previousSnapshot.ownSellerPrice,
            competitorPrice: snapshot.buyBoxPrice
          };
        } else if (previousSnapshot.ownBuyBoxStatus === BuyBoxOwnershipStatus.OWNED) {
          // Buy Box loss
          updates.lastBuyBoxLoss = {
            timestamp: snapshot.timestamp,
            reason: 'Price change or competitor changes',
            previousPrice: previousSnapshot.ownSellerPrice,
            competitorPrice: snapshot.buyBoxPrice
          };
        }
      }
      
      // Recalculate Buy Box win percentage (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const timestamp30DaysAgo = Timestamp.fromDate(thirtyDaysAgo);
      
      const recentSnapshots = [...history.snapshots, snapshot].filter((snap: any) => 
        snap.timestamp.toDate() >= timestamp30DaysAgo.toDate()
      );
      
      if (recentSnapshots.length > 0) {
        const winSnapshots = recentSnapshots.filter((snap: any) => 
          snap.ownBuyBoxStatus === BuyBoxOwnershipStatus.OWNED || 
          snap.ownBuyBoxStatus === BuyBoxOwnershipStatus.SHARED
        );
        
        updates.buyBoxWinPercentage = (winSnapshots.length / recentSnapshots.length) * 100;
      }
      
      // Calculate average price difference
      const relevantSnapshots = recentSnapshots.filter((snap: any) => 
        snap.buyBoxPrice !== undefined && 
        snap.buyBoxPrice > 0 && 
        snap.ownSellerPrice > 0
      );
      
      if (relevantSnapshots.length > 0) {
        const priceDifferences = relevantSnapshots.map((snap: any) => 
          (snap.buyBoxPrice || 0) - snap.ownSellerPrice
        );
        
        const totalDifference = priceDifferences.reduce((sum, diff) => sum + diff, 0);
        updates.averagePriceDifference = totalDifference / priceDifferences.length;
        
        // Calculate lowest price needed to win Buy Box
        const winningSnapshots = relevantSnapshots.filter((snap: any) => 
          snap.ownBuyBoxStatus === BuyBoxOwnershipStatus.OWNED
        );
        
        if (winningSnapshots.length > 0) {
          const lowestWinningDifference = Math.min(
            ...winningSnapshots.map((snap: any) => snap.ownSellerPrice - (snap.buyBoxPrice || 0))
          );
          
          const highestCompetitorPrice = Math.max(
            ...relevantSnapshots.map((snap: any) => snap.buyBoxPrice || 0)
          );
          
          updates.lowestPriceToWin = highestCompetitorPrice - Math.abs(lowestWinningDifference);
        }
      }
      
      // Update history
      await repository.update(historyId, updates);
      
      // Get updated history
      const updatedHistory = await repository.getById(historyId);
      return updatedHistory || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to add Buy Box snapshot for ${productId}`, error);
      return null;
    }
  }
}