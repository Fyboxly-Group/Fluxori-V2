import mongoose from 'mongoose';
import SystemStatus, { ISystemStatusDocument } from './system-status.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('System Status Model', () => {
  let testSystemStatus: ISystemStatusDocument;
  
  beforeEach(() => {
    // Create a test system status before each test
    testSystemStatus = new SystemStatus({
      name: 'API Service',
      status: 'operational',
      description: 'Core API functionality',
      metrics: {
        responseTime: 150,
        uptime: 99.9,
        errorRate: 0.01,
      },
      lastCheckedAt: new Date(),
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await SystemStatus.deleteMany({});
  });
  
  it('should create a new system status with the correct fields', async () => {
    const savedStatus = await testSystemStatus.save();
    
    // Verify required fields
    expect(savedStatus._id).toBeDefined();
    expect(savedStatus.name).toBe('API Service');
    expect(savedStatus.status).toBe('operational');
    expect(savedStatus.description).toBe('Core API functionality');
    expect(savedStatus.metrics.responseTime).toBe(150);
    expect(savedStatus.metrics.uptime).toBe(99.9);
    expect(savedStatus.metrics.errorRate).toBe(0.01);
    expect(savedStatus.lastCheckedAt).toBeDefined();
    expect(savedStatus.createdAt).toBeDefined();
    expect(savedStatus.updatedAt).toBeDefined();
  });
  
  it('should require all required fields', async () => {
    const incompleteStatus = new SystemStatus({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteStatus.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.description).toBeDefined();
  });
  
  it('should validate status is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testSystemStatus.status = 'invalid_status';
    
    let error;
    try {
      await testSystemStatus.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
    
    // Test with valid status
    testSystemStatus.status = 'degraded';
    
    // Should not throw error
    await testSystemStatus.validate();
  });
  
  it('should trim whitespace from string fields', async () => {
    testSystemStatus.name = '  Database Service  ';
    testSystemStatus.description = '  Database connectivity  ';
    
    const savedStatus = await testSystemStatus.save();
    
    expect(savedStatus.name).toBe('Database Service');
    expect(savedStatus.description).toBe('Database connectivity');
  });
  
  it('should handle metrics', async () => {
    // Set metrics
    testSystemStatus.metrics = {
      responseTime: 150,
    };
    
    const savedStatus = await testSystemStatus.save();
    
    expect(savedStatus.metrics.responseTime).toBe(150);
    
    // Now update with additional metrics using dot notation to ensure compatibility
    // with mongoose's handling of nested objects
    savedStatus.metrics.uptime = 99.9;
    savedStatus.metrics.errorRate = 0.01;
    
    const updatedStatus = await savedStatus.save();
    
    expect(updatedStatus.metrics.responseTime).toBe(150);
    expect(updatedStatus.metrics.uptime).toBe(99.9);
    expect(updatedStatus.metrics.errorRate).toBe(0.01);
  });
  
  it('should enforce name uniqueness', async () => {
    // First save the original status
    await testSystemStatus.save();
    
    // Try to create another status with the same name
    const duplicateStatus = new SystemStatus({
      name: 'API Service', // Same name as testSystemStatus
      status: 'degraded',
      description: 'Duplicate service status',
      lastCheckedAt: new Date(),
    });
    
    // Should throw a duplicate key error
    await expect(duplicateStatus.save()).rejects.toThrow();
  });
  
  it('should update status information correctly', async () => {
    // Save the initial status
    await testSystemStatus.save();
    
    // Update status
    testSystemStatus.status = 'degraded';
    testSystemStatus.description = 'Service experiencing high latency';
    testSystemStatus.metrics.responseTime = 350;
    testSystemStatus.lastCheckedAt = new Date();
    
    const updatedStatus = await testSystemStatus.save();
    
    expect(updatedStatus.status).toBe('degraded');
    expect(updatedStatus.description).toBe('Service experiencing high latency');
    expect(updatedStatus.metrics.responseTime).toBe(350);
  });
});