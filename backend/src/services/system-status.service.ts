import mongoose from 'mongoose';
import SystemStatus from '../models/system-status.model';
import { ActivityService } from './activity.service';

/**
 * Service for system status monitoring
 */
export class SystemStatusService {
  /**
   * Initialize default system components
   * This should be called when the application starts
   */
  static async initializeSystemComponents() : Promise<void> {
    const defaultComponents = [
      {
        name: 'API Service',
        status: 'operational',
        description: 'Core API functionality',
      },
      {
        name: 'Database',
        status: 'operational',
        description: 'MongoDB database connection',
      },
      {
        name: 'Authentication',
        status: 'operational',
        description: 'User authentication and authorization',
      },
      {
        name: 'File Storage',
        status: 'operational',
        description: 'Google Cloud Storage for file uploads',
      },
      {
        name: 'Payment Processing',
        status: 'operational',
        description: 'Payment processing and subscription management',
      },
    ];

    try {
      // Using bulkWrite with upsert to avoid duplicates
      const operations = defaultComponents.map((component: any) => ({
        updateOne: {
          filter: { name: component.name },
          update: { 
            $setOnInsert: {
              ...component,
              lastCheckedAt: new Date(),
            }
          },
          upsert: true,
        }
      }));

      await SystemStatus.bulkWrite(operations);
      console.log('System components initialized');
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error initializing system components:', error);
    }
  }

  /**
   * Update system component status
   */
  static async updateComponentStatus(
    name: string, 
    status: 'operational' | 'degraded' | 'outage' | 'maintenance',
    description: string,
    metrics?: Record<string, any>,
    userId?: mongoose.Types.ObjectId
  ) : Promise<void> {
    try {
      const component = await SystemStatus.findOne({ name });
      
      if (!component) {
        throw new Error(`System component "${name}" not found`);
      }
      
      const oldStatus = component.status;
      
      // Update component
      component.status = status;
      component.description = description;
      component.lastCheckedAt = new Date();
      
      if (metrics) {
        component.metrics = {
          ...component.metrics,
          ...metrics,
        };
      }
      
      await component.save();
      
      // Log activity if status changed
      if (oldStatus !== status && userId) {
        await ActivityService.logActivity({
          description: `System component "${name}" status changed from ${oldStatus} to ${status}`,
          entityType: 'system',
          action: 'update',
          status: 'completed',
          userId,
          metadata: { component: name, oldStatus, newStatus: status },
        });
      }
      
      return component;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error(`Error updating component "${name}" status:`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Check database health
   */
  static async checkDatabaseHealth() : Promise<void> {
    const startTime = Date.now();
    
    try {
      // Simple check by running a lightweight command
      if (!mongoose.connection.db) {
        throw new Error('Database connection not established');
      }
      
      await mongoose.connection.db.admin().ping();
      
      const responseTime = Date.now() - startTime;
      
      // Update status
      await this.updateComponentStatus(
        'Database',
        'operational',
        `Response time: ${responseTime}ms`,
        { responseTime }
      );
      
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      
      const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : 'Unknown error';
      
      // Update status to degraded or outage
      await this.updateComponentStatus(
        'Database',
        'outage',
        'Database connection failed',
        { error: errorMessage }
      );
      
      return false;
    }
  }

  /**
   * Get all system component statuses
   */
  static async getAllComponentStatus() : Promise<void> {
    return SystemStatus.find().sort({ name: 1 }).lean();
  }
}