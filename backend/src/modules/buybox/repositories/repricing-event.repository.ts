import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { RepricingEvent } from '../../../models/firestore/buybox.schema';

/**
 * Repository for managing repricing events in Firestore
 */
@injectable()
export class RepricingEventRepository {
  private readonly collectionName = 'repricingEvents';
  
  constructor(
    @inject('Firestore') private firestore: Firestore,
    @inject('Logger') private logger: Logger
  ) {}
  
  /**
   * Create a new repricing event
   */
  public async createEvent(event: RepricingEvent): Promise<RepricingEvent> {
    try {
      const docRef = this.firestore.collection(this.collectionName).doc(event.id);
      
      await docRef.set(event);
      
      return event;
    } catch (error) {
      this.logger.error('Error creating repricing event', { error });
      throw error;
    }
  }
  
  /**
   * Find events by rule ID
   */
  public async findByRuleId(ruleId: string, limit = 100): Promise<RepricingEvent[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .where('ruleId', '==', ruleId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as RepricingEvent);
    } catch (error) {
      this.logger.error(`Error finding events for rule ${ruleId}`, { error });
      throw error;
    }
  }
  
  /**
   * Find events by product ID
   */
  public async findByProductId(productId: string, limit = 100): Promise<RepricingEvent[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .where('productId', '==', productId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as RepricingEvent);
    } catch (error) {
      this.logger.error(`Error finding events for product ${productId}`, { error });
      throw error;
    }
  }
  
  /**
   * Find events by SKU
   */
  public async findBySku(sku: string, limit = 100): Promise<RepricingEvent[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .where('sku', '==', sku)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as RepricingEvent);
    } catch (error) {
      this.logger.error(`Error finding events for SKU ${sku}`, { error });
      throw error;
    }
  }
  
  /**
   * Find events for a specific marketplace
   */
  public async findByMarketplaceId(
    marketplaceId: string, 
    limit = 100
  ): Promise<RepricingEvent[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .where('marketplaceId', '==', marketplaceId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as RepricingEvent);
    } catch (error) {
      this.logger.error(`Error finding events for marketplace ${marketplaceId}`, { error });
      throw error;
    }
  }
  
  /**
   * Find recent events across all rules and products
   */
  public async findRecentEvents(limit = 100): Promise<RepricingEvent[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as RepricingEvent);
    } catch (error) {
      this.logger.error('Error finding recent events', { error });
      throw error;
    }
  }
  
  /**
   * Get success rate for a rule
   */
  public async getRuleSuccessRate(ruleId: string): Promise<{
    successRate: number;
    totalEvents: number;
    successfulEvents: number;
  }> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .where('ruleId', '==', ruleId)
        .get();
      
      const events = snapshot.docs.map(doc => doc.data() as RepricingEvent);
      const totalEvents = events.length;
      const successfulEvents = events.filter(event => event.success).length;
      
      return {
        successRate: totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0,
        totalEvents,
        successfulEvents
      };
    } catch (error) {
      this.logger.error(`Error calculating success rate for rule ${ruleId}`, { error });
      throw error;
    }
  }
  
  /**
   * Get events in a specific date range
   */
  public async findEventsByDateRange(
    startDate: Timestamp,
    endDate: Timestamp,
    limit = 500
  ): Promise<RepricingEvent[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as RepricingEvent);
    } catch (error) {
      this.logger.error('Error finding events by date range', { error });
      throw error;
    }
  }
}