import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { RepricingRule, repricingRuleConverter } from '../../../models/firestore/buybox.schema';

/**
 * Repository for managing repricing rules in Firestore
 */
@injectable()
export class RepricingRuleRepository {
  private readonly collectionName = 'repricingRules';
  
  constructor(
    @inject('Firestore') private firestore: Firestore,
    @inject('Logger') private logger: Logger
  ) {}
  
  /**
   * Find a rule by its ID
   */
  public async findById(id: string): Promise<RepricingRule | null> {
    try {
      const doc = await this.firestore
        .collection(this.collectionName)
        .withConverter(repricingRuleConverter)
        .doc(id)
        .get();
      
      if (!doc.exists) {
        return null;
      }
      
      return doc.data() as RepricingRule;
    } catch (error) {
      this.logger.error(`Error finding rule by ID ${id}`, { error });
      throw error;
    }
  }
  
  /**
   * Find all rules for an organization
   */
  public async findByOrgId(orgId: string): Promise<RepricingRule[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .withConverter(repricingRuleConverter)
        .where('orgId', '==', orgId)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as RepricingRule);
    } catch (error) {
      this.logger.error(`Error finding rules for org ${orgId}`, { error });
      throw error;
    }
  }
  
  /**
   * Find all active rules for an organization
   */
  public async findActiveByOrgId(orgId: string): Promise<RepricingRule[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .withConverter(repricingRuleConverter)
        .where('orgId', '==', orgId)
        .where('isActive', '==', true)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as RepricingRule);
    } catch (error) {
      this.logger.error(`Error finding active rules for org ${orgId}`, { error });
      throw error;
    }
  }
  
  /**
   * Find all active rules due for execution
   */
  public async findActiveRulesDueForExecution(now: Timestamp): Promise<RepricingRule[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .withConverter(repricingRuleConverter)
        .where('isActive', '==', true)
        .where('nextRun', '<=', now)
        .get();
      
      return snapshot.docs.map(doc => doc.data() as RepricingRule);
    } catch (error) {
      this.logger.error('Error finding rules due for execution', { error });
      throw error;
    }
  }
  
  /**
   * Create a new repricing rule
   */
  public async createRule(rule: Omit<RepricingRule, 'id'>): Promise<RepricingRule> {
    try {
      const docRef = this.firestore.collection(this.collectionName).doc();
      const now = Timestamp.now();
      
      const newRule: RepricingRule = {
        ...rule,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
        lastRun: undefined,
        nextRun: now // Start immediately for first run
      };
      
      await docRef.withConverter(repricingRuleConverter).set(newRule);
      
      return newRule;
    } catch (error) {
      this.logger.error('Error creating repricing rule', { error });
      throw error;
    }
  }
  
  /**
   * Update an existing repricing rule
   */
  public async updateRule(id: string, data: Partial<RepricingRule>): Promise<boolean> {
    try {
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      // Remove id from update data if present
      if ('id' in updateData) {
        delete updateData.id;
      }
      
      await this.firestore
        .collection(this.collectionName)
        .doc(id)
        .update(updateData);
      
      return true;
    } catch (error) {
      this.logger.error(`Error updating rule ${id}`, { error });
      throw error;
    }
  }
  
  /**
   * Update rule execution times after a rule has been executed
   */
  public async updateRuleExecutionTimes(
    id: string, 
    lastRun: Timestamp, 
    nextRun: Timestamp
  ): Promise<boolean> {
    try {
      await this.firestore
        .collection(this.collectionName)
        .doc(id)
        .update({
          lastRun,
          nextRun,
          updatedAt: Timestamp.now()
        });
      
      return true;
    } catch (error) {
      this.logger.error(`Error updating rule execution times for ${id}`, { error });
      throw error;
    }
  }
  
  /**
   * Delete a repricing rule
   */
  public async deleteRule(id: string): Promise<boolean> {
    try {
      await this.firestore
        .collection(this.collectionName)
        .doc(id)
        .delete();
      
      return true;
    } catch (error) {
      this.logger.error(`Error deleting rule ${id}`, { error });
      throw error;
    }
  }
}