/**
 * Repository for managing insights in Firestore
 */

import { injectable, inject } from 'inversify';
import { Firestore, Query } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { 
  Insight, 
  InsightType, 
  InsightStatus, 
  InsightPriority 
} from '../interfaces/insight.interface';
import { 
  InsightSchema, 
  convertInsightToSchema, 
  convertSchemaToInsight 
} from '../models/insight.schema';

@injectable()
export class InsightRepository {
  private readonly collectionName = 'insights';
  
  constructor(
    @inject('Firestore') private firestore: Firestore,
    @inject('Logger') private logger: Logger
  ) {}
  
  /**
   * Create a new insight
   * @param data Insight data without ID
   * @returns The created insight with ID
   */
  async createInsight(data: Omit<Insight, 'id'>): Promise<Insight> {
    try {
      const id = uuidv4();
      const now = new Date();
      
      const insight: Insight = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
        status: data.status || InsightStatus.PENDING
      };
      
      const schema = convertInsightToSchema(insight);
      await this.firestore.collection(this.collectionName).doc(id).set(schema);
      
      return insight;
    } catch (error) {
      this.logger.error('Error creating insight:', error);
      throw new Error(`Failed to create insight: ${error.message}`);
    }
  }
  
  /**
   * Get an insight by ID
   * @param id Insight ID
   * @returns The insight or null if not found
   */
  async findById(id: string): Promise<Insight | null> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      const schema = doc.data() as InsightSchema;
      return convertSchemaToInsight(schema);
    } catch (error) {
      this.logger.error(`Error finding insight with ID ${id}:`, error);
      throw new Error(`Failed to find insight: ${error.message}`);
    }
  }
  
  /**
   * Update an insight
   * @param id Insight ID
   * @param data Data to update
   * @returns The updated insight
   */
  async updateInsight(id: string, data: Partial<Insight>): Promise<Insight | null> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      // Convert any Date objects to Firestore Timestamps
      const schemaUpdate = { 
        ...updateData,
        updatedAt: new Date()
      };
      
      await this.firestore.collection(this.collectionName).doc(id).update(schemaUpdate);
      
      // Get the updated document
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Error updating insight with ID ${id}:`, error);
      throw new Error(`Failed to update insight: ${error.message}`);
    }
  }
  
  /**
   * Delete an insight
   * @param id Insight ID
   * @returns True if successful, false if not found
   */
  async deleteInsight(id: string): Promise<boolean> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return false;
      }
      
      await this.firestore.collection(this.collectionName).doc(id).delete();
      return true;
    } catch (error) {
      this.logger.error(`Error deleting insight with ID ${id}:`, error);
      throw new Error(`Failed to delete insight: ${error.message}`);
    }
  }
  
  /**
   * Find insights by organization ID
   * @param organizationId Organization ID
   * @param limit Maximum number of results (default: 50)
   * @param sortBy Field to sort by (default: 'createdAt')
   * @param sortDirection Sort direction (default: 'desc')
   * @returns Array of insights
   */
  async findByOrganizationId(
    organizationId: string,
    limit: number = 50,
    sortBy: string = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Promise<Insight[]> {
    try {
      let query = this.firestore.collection(this.collectionName)
        .where('organizationId', '==', organizationId)
        .orderBy(sortBy, sortDirection)
        .limit(limit);
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => {
        const schema = doc.data() as InsightSchema;
        return convertSchemaToInsight(schema);
      });
    } catch (error) {
      this.logger.error(`Error finding insights for organization ${organizationId}:`, error);
      throw new Error(`Failed to find insights: ${error.message}`);
    }
  }
  
  /**
   * Find insights by type
   * @param organizationId Organization ID
   * @param type Insight type
   * @param limit Maximum number of results (default: 50)
   * @returns Array of insights
   */
  async findByType(
    organizationId: string,
    type: InsightType,
    limit: number = 50
  ): Promise<Insight[]> {
    try {
      const query = this.firestore.collection(this.collectionName)
        .where('organizationId', '==', organizationId)
        .where('type', '==', type)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => {
        const schema = doc.data() as InsightSchema;
        return convertSchemaToInsight(schema);
      });
    } catch (error) {
      this.logger.error(`Error finding insights of type ${type}:`, error);
      throw new Error(`Failed to find insights: ${error.message}`);
    }
  }
  
  /**
   * Find insights by related entity
   * @param organizationId Organization ID
   * @param entityId Related entity ID
   * @param entityType Related entity type
   * @param limit Maximum number of results (default: 50)
   * @returns Array of insights
   */
  async findByRelatedEntity(
    organizationId: string,
    entityId: string,
    entityType: string,
    limit: number = 50
  ): Promise<Insight[]> {
    try {
      const query = this.firestore.collection(this.collectionName)
        .where('organizationId', '==', organizationId)
        .where('relatedEntityType', '==', entityType)
        .where('relatedEntityIds', 'array-contains', entityId)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => {
        const schema = doc.data() as InsightSchema;
        return convertSchemaToInsight(schema);
      });
    } catch (error) {
      this.logger.error(`Error finding insights for entity ${entityId}:`, error);
      throw new Error(`Failed to find insights: ${error.message}`);
    }
  }
  
  /**
   * Find insights by status
   * @param organizationId Organization ID
   * @param status Insight status
   * @param limit Maximum number of results (default: 50)
   * @returns Array of insights
   */
  async findByStatus(
    organizationId: string,
    status: InsightStatus,
    limit: number = 50
  ): Promise<Insight[]> {
    try {
      const query = this.firestore.collection(this.collectionName)
        .where('organizationId', '==', organizationId)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => {
        const schema = doc.data() as InsightSchema;
        return convertSchemaToInsight(schema);
      });
    } catch (error) {
      this.logger.error(`Error finding insights with status ${status}:`, error);
      throw new Error(`Failed to find insights: ${error.message}`);
    }
  }
  
  /**
   * Find insights by priority
   * @param organizationId Organization ID
   * @param priority Insight priority
   * @param limit Maximum number of results (default: 50)
   * @returns Array of insights
   */
  async findByPriority(
    organizationId: string,
    priority: InsightPriority,
    limit: number = 50
  ): Promise<Insight[]> {
    try {
      const query = this.firestore.collection(this.collectionName)
        .where('organizationId', '==', organizationId)
        .where('priority', '==', priority)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => {
        const schema = doc.data() as InsightSchema;
        return convertSchemaToInsight(schema);
      });
    } catch (error) {
      this.logger.error(`Error finding insights with priority ${priority}:`, error);
      throw new Error(`Failed to find insights: ${error.message}`);
    }
  }
  
  /**
   * Find insights with filters and sorting
   * @param filters Filter criteria
   * @param options Query options
   * @returns Array of insights and total count
   */
  async findWithFilters(
    filters: {
      organizationId: string;
      type?: InsightType;
      status?: InsightStatus;
      priority?: InsightPriority;
      entityId?: string;
      entityType?: string;
      startDate?: Date;
      endDate?: Date;
    },
    options: {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<{ insights: Insight[]; total: number }> {
    try {
      // Start with base query
      let query: Query = this.firestore.collection(this.collectionName)
        .where('organizationId', '==', filters.organizationId);
      
      // Apply filters
      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }
      
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters.priority) {
        query = query.where('priority', '==', filters.priority);
      }
      
      if (filters.entityId && filters.entityType) {
        query = query
          .where('relatedEntityType', '==', filters.entityType)
          .where('relatedEntityIds', 'array-contains', filters.entityId);
      }
      
      // Date range filters must be applied using separate queries
      // or with additional sorting constraints in Firestore
      
      // Get total count
      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;
      
      // Apply sorting
      const sortBy = options.sortBy || 'createdAt';
      const sortDirection = options.sortDirection || 'desc';
      query = query.orderBy(sortBy, sortDirection);
      
      // Apply pagination
      const limit = options.limit || 50;
      const offset = options.offset || 0;
      query = query.limit(limit);
      
      if (offset > 0) {
        // For offset pagination, we use limit + offset and then discard the first 'offset' results
        query = query.limit(limit + offset);
      }
      
      const snapshot = await query.get();
      
      // Apply offset manually if needed
      let docs = snapshot.docs;
      if (offset > 0) {
        docs = docs.slice(offset, offset + limit);
      }
      
      const insights = docs.map(doc => {
        const schema = doc.data() as InsightSchema;
        return convertSchemaToInsight(schema);
      });
      
      return { insights, total };
    } catch (error) {
      this.logger.error('Error finding insights with filters:', error);
      throw new Error(`Failed to find insights: ${error.message}`);
    }
  }
  
  /**
   * Update insight feedback
   * @param id Insight ID
   * @param feedback Feedback value
   * @param comments Optional feedback comments
   * @returns The updated insight
   */
  async updateFeedback(
    id: string,
    feedback: string,
    comments?: string
  ): Promise<Insight | null> {
    try {
      const now = new Date();
      const updateData = {
        feedback,
        feedbackComments: comments,
        feedbackTimestamp: now,
        updatedAt: now
      };
      
      return await this.updateInsight(id, updateData);
    } catch (error) {
      this.logger.error(`Error updating feedback for insight ${id}:`, error);
      throw new Error(`Failed to update feedback: ${error.message}`);
    }
  }
}