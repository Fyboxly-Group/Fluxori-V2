import mongoose from 'mongoose';
import Activity, { IActivityDocument } from './activity.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Activity Model', () => {
  let testActivity: IActivityDocument;
  const testUserId = new mongoose.Types.ObjectId();
  const testTaskId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test activity before each test
    testActivity = new Activity({
      description: 'User updated task status',
      entityType: 'task',
      entityId: new mongoose.Types.ObjectId( testTaskId),
      action: 'update',
      status: 'completed',
      userId: testUserId,
      metadata: { 
        oldStatus: 'pending', 
        newStatus: 'in-progress' 
      }
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Activity.deleteMany({});
  });
  
  it('should create a new activity with the correct fields', async () => {
    const savedActivity = await testActivity.save();
    
    // Verify required fields
    expect(savedActivity._id).toBeDefined();
    expect(savedActivity.description).toBe('User updated task status');
    expect(savedActivity.entityType).toBe('task');
    expect(savedActivity.entityId!.toString()).toBe(testTaskId.toString());
    expect(savedActivity.action).toBe('update');
    expect(savedActivity.status).toBe('completed');
    expect(savedActivity.userId.toString()).toBe(testUserId.toString());
    expect(savedActivity.metadata).toEqual({ oldStatus: 'pending', newStatus: 'in-progress' });
    expect(savedActivity.createdAt).toBeDefined();
    
    // The schema is configured to have createdAt but not updatedAt
    expect((savedActivity as any).updatedAt).toBeUndefined();
  });
  
  it('should require all required fields', async () => {
    const incompleteActivity = new Activity({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteActivity.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.entityType).toBeDefined();
    expect(error.errors.action).toBeDefined();
    expect(error.errors.userId).toBeDefined();
  });
  
  it('should validate entityType is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testActivity.entityType = 'invalid_entity';
    
    let error;
    try {
      await testActivity.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.entityType).toBeDefined();
    
    // Test with valid entityType
    testActivity.entityType = 'user';
    
    // Should not throw error
    await testActivity.validate();
  });
  
  it('should validate action is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testActivity.action = 'invalid_action';
    
    let error;
    try {
      await testActivity.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.action).toBeDefined();
    
    // Test with valid action
    testActivity.action = 'create';
    
    // Should not throw error
    await testActivity.validate();
  });
  
  it('should validate status is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testActivity.status = 'invalid_status';
    
    let error;
    try {
      await testActivity.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
    
    // Test with valid status
    testActivity.status = 'pending';
    
    // Should not throw error
    await testActivity.validate();
  });
  
  it('should handle complex metadata objects', async () => {
    testActivity.metadata = {
      oldValues: {
        title: 'Old Task Title',
        dueDate: new Date('2025-03-20'),
        assignee: new mongoose.Types.ObjectId(),
      },
      newValues: {
        title: 'New Task Title',
        dueDate: new Date('2025-03-25'),
        assignee: new mongoose.Types.ObjectId(),
      },
      changedBy: testUserId,
      changeReason: 'Deadline extended',
    };
    
    const savedActivity = await testActivity.save();
    
    // Verify metadata is saved correctly
    expect(savedActivity.metadata.oldValues.title).toBe('Old Task Title');
    expect(savedActivity.metadata.newValues.title).toBe('New Task Title');
    expect(savedActivity.metadata.changeReason).toBe('Deadline extended');
  });
  
  it('should not require entityId when entityType is system', async () => {
    const systemActivity = new Activity({
      description: 'System maintenance',
      entityType: 'system',
      action: 'other',
      status: 'completed',
      userId: new mongoose.Types.ObjectId( testUserId),
    });
    
    // Should not throw error about missing entityId
    await systemActivity.validate();
    const savedActivity = await systemActivity.save();
    
    expect(savedActivity.entityId).toBeUndefined();
    expect(savedActivity.entityType).toBe('system');
  });
  
  it('should trim whitespace from description field', async () => {
    testActivity.description = '  Task description with whitespace  ';
    
    const savedActivity = await testActivity.save();
    
    expect(savedActivity.description).toBe('Task description with whitespace');
  });
});