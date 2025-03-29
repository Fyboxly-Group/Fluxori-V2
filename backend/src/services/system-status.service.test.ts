import mongoose from 'mongoose';
import { SystemStatusService } from './system-status.service';
import SystemStatus from '../models/system-status.model';
import { ActivityService } from './activity.service';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the ActivityService
jest.mock('./activity.service', () => ({
  ActivityService: {
    logActivity: jest.fn().mockResolvedValue(null),
  },
}));

describe('SystemStatusService', () => {
  // Clear collections before each test
  beforeEach(async () => {
    await SystemStatus.deleteMany({});
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });
  
  describe('initializeSystemComponents', () => {
    it('should initialize default system components', async () => {
      await SystemStatusService.initializeSystemComponents();
      
      // Verify components were created
      const components = await SystemStatus.find();
      expect(components.length).toBe(5); // Based on the number of default components
      
      // Check for specific components
      const apiComponent = await SystemStatus.findOne({ name: 'API Service' });
      const dbComponent = await SystemStatus.findOne({ name: 'Database' });
      
      expect(apiComponent).toBeDefined();
      expect(apiComponent!.status).toBe('operational');
      
      expect(dbComponent).toBeDefined();
      expect(dbComponent!.status).toBe('operational');
    });
    
    it('should not create duplicate components on multiple calls', async () => {
      // Call initialize twice
      await SystemStatusService.initializeSystemComponents();
      await SystemStatusService.initializeSystemComponents();
      
      // Verify no duplicates
      const apiComponents = await SystemStatus.find({ name: 'API Service' });
      expect(apiComponents.length).toBe(1);
    });
    
    it('should handle errors gracefully', async () => {
      // Mock bulkWrite to throw an error
      jest.spyOn(SystemStatus, 'bulkWrite').mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      await SystemStatusService.initializeSystemComponents();
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('updateComponentStatus', () => {
    it('should update a component status', async () => {
      // First initialize components
      await SystemStatusService.initializeSystemComponents();
      
      // Update a component
      const result = await SystemStatusService.updateComponentStatus(
        'API Service',
        'degraded',
        'High latency detected',
        { responseTime: 250 }
      );
      
      // Verify component was updated
      expect(result.status).toBe('degraded');
      expect(result.description).toBe('High latency detected');
      expect(result.metrics.responseTime).toBe(250);
      
      // Verify database was updated
      const updatedComponent = await SystemStatus.findOne({ name: 'API Service' });
      expect(updatedComponent!.status).toBe('degraded');
    });
    
    it('should log activity when status changes and userId is provided', async () => {
      // First initialize components
      await SystemStatusService.initializeSystemComponents();
      
      // Reset the mock before this test
      jest.clearAllMocks();
      
      const userId = new mongoose.Types.ObjectId();
      
      // Update a component with status change
      await SystemStatusService.updateComponentStatus(
        'API Service',
        'degraded',
        'High latency detected',
        undefined,
        userId
      );
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledWith({
        description: 'System component "API Service" status changed from operational to degraded',
        entityType: 'system',
        action: 'update',
        status: 'completed',
        userId,
        metadata: { component: 'API Service', oldStatus: 'operational', newStatus: 'degraded' },
      });
    });
    
    it('should not log activity when status does not change', async () => {
      // First initialize components
      await SystemStatusService.initializeSystemComponents();
      
      // Reset the mock before this test
      jest.clearAllMocks();
      
      const userId = new mongoose.Types.ObjectId();
      
      // First set the status to degraded
      await SystemStatusService.updateComponentStatus(
        'API Service',
        'degraded',
        'High latency detected',
        undefined,
        userId
      );
      
      // Reset the mock after the first call
      jest.clearAllMocks();
      
      // Update with the same status
      await SystemStatusService.updateComponentStatus(
        'API Service',
        'degraded', // Same as current status
        'Updated description',
        undefined,
        userId
      );
      
      // Verify activity was not logged
      expect(ActivityService.logActivity).not.toHaveBeenCalled();
    });
    
    it('should throw error for non-existent component', async () => {
      await expect(
        SystemStatusService.updateComponentStatus(
          'Non-existent Component',
          'operational',
          'Test'
        )
      ).rejects.toThrow('System component "Non-existent Component" not found');
    });
  });
  
  describe('checkDatabaseHealth', () => {
    it('should check database health and update status to operational when healthy', async () => {
      // First initialize components
      await SystemStatusService.initializeSystemComponents();
      
      // Create a proper admin mock with ping method
      const adminMock = {
        ping: jest.fn().mockResolvedValue(true)
      };
      
      // Mock mongoose connection structure
      const originalDb = mongoose.connection.db;
      mongoose.connection.db = {
        admin: jest.fn().mockReturnValue(adminMock)
      } as any;
      
      // Mock updateComponentStatus to avoid actual updates
      const updateSpy = jest.spyOn(SystemStatusService, 'updateComponentStatus').mockResolvedValue({} as any);
      
      const result = await SystemStatusService.checkDatabaseHealth();
      
      // Verify ping was called
      expect(adminMock.ping).toHaveBeenCalled();
      
      // Verify result is true (healthy)
      expect(result).toBe(true);
      
      // Verify updateComponentStatus was called with 'operational'
      expect(updateSpy).toHaveBeenCalledWith(
        'Database',
        'operational',
        expect.stringContaining('Response time:'),
        expect.objectContaining({ responseTime: expect.any(Number) })
      );
      
      // Restore the original db object
      mongoose.connection.db = originalDb;
      
      // Restore the spy
      updateSpy.mockRestore();
    });
    
    it('should update status to outage when database check fails', async () => {
      // First initialize components
      await SystemStatusService.initializeSystemComponents();
      
      // Create a proper admin mock with ping method that throws
      const mockError = new Error('Connection error');
      const adminMock = {
        ping: jest.fn().mockImplementation(() => {
          throw mockError;
        })
      };
      
      // Mock mongoose connection structure
      const originalDb = mongoose.connection.db;
      mongoose.connection.db = {
        admin: jest.fn().mockReturnValue(adminMock)
      } as any;
      
      // Mock console.error to prevent output during test
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock updateComponentStatus to avoid actual updates
      const updateSpy = jest.spyOn(SystemStatusService, 'updateComponentStatus').mockResolvedValue({} as any);
      
      const result = await SystemStatusService.checkDatabaseHealth();
      
      // Verify result is false (unhealthy)
      expect(result).toBe(false);
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
      
      // Verify updateComponentStatus was called with 'outage'
      expect(updateSpy).toHaveBeenCalledWith(
        'Database',
        'outage',
        'Database connection failed',
        expect.objectContaining({ error: 'Connection error' })
      );
      
      // Restore the original db object
      mongoose.connection.db = originalDb;
      
      // Restore the spy
      updateSpy.mockRestore();
    });
  });
  
  describe('getAllComponentStatus', () => {
    it('should return all component statuses sorted by name', async () => {
      // First initialize components
      await SystemStatusService.initializeSystemComponents();
      
      // Get all components
      const components = await SystemStatusService.getAllComponentStatus();
      
      // Verify all components are returned
      expect(components.length).toBe(5);
      
      // Verify sorting by name
      expect(components[0].name).toBe('API Service');
      expect(components[1].name).toBe('Authentication');
    });
    
    it('should return empty array when no components exist', async () => {
      const components = await SystemStatusService.getAllComponentStatus();
      expect(components).toEqual([]);
    });
  });
});