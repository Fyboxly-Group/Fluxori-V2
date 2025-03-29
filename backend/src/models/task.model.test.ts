import mongoose from 'mongoose';
import Task, { ITaskDocument } from './task.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Task Model', () => {
  let testTask: ITaskDocument;
  const testUserId = new mongoose.Types.ObjectId();
  const testAssigneeId = new mongoose.Types.ObjectId();
  const testProjectId = new mongoose.Types.ObjectId();
  const testMilestoneId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test task before each test
    testTask = new Task({
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending',
      dueDate: new Date('2025-04-15'),
      assignedTo: testAssigneeId,
      createdBy: testUserId,
      priority: 'medium',
      project: testProjectId,
      milestone: testMilestoneId,
      estimatedHours: 8,
      tags: ['test', 'important']
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Task.deleteMany({});
  });
  
  it('should create a new task with the correct fields', async () => {
    const savedTask = await testTask.save();
    
    // Verify required fields
    expect(savedTask._id).toBeDefined();
    expect(savedTask.title).toBe('Test Task');
    expect(savedTask.description).toBe('This is a test task');
    expect(savedTask.status).toBe('pending');
    expect(savedTask.dueDate).toEqual(new Date('2025-04-15'));
    expect(savedTask.assignedTo.toString()).toBe(testAssigneeId.toString());
    expect(savedTask.createdBy.toString()).toBe(testUserId.toString());
    expect(savedTask.priority).toBe('medium');
    expect(savedTask.project!.toString()).toBe(testProjectId.toString());
    expect(savedTask.milestone!.toString()).toBe(testMilestoneId.toString());
    expect(savedTask.estimatedHours).toBe(8);
    expect(savedTask.tags).toEqual(['test', 'important']);
    expect(savedTask.createdAt).toBeDefined();
    expect(savedTask.updatedAt).toBeDefined();
    
    // Default values should be set
    expect(savedTask.actualHours).toBe(0);
  });
  
  it('should require all required fields', async () => {
    const incompleteTask = new Task({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteTask.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.assignedTo).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });
  
  it('should validate status is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testTask.status = 'invalid_status';
    
    let error;
    try {
      await testTask.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
    
    // Test with valid status
    testTask.status = 'in-progress';
    
    // Should not throw error
    await testTask.validate();
  });
  
  it('should validate priority is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testTask.priority = 'invalid_priority';
    
    let error;
    try {
      await testTask.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.priority).toBeDefined();
    
    // Test with valid priority
    testTask.priority = 'high';
    
    // Should not throw error
    await testTask.validate();
  });
  
  it('should trim whitespace from string fields', async () => {
    testTask.title = '  Trimmed Title  ';
    testTask.description = '  Trimmed Description  ';
    testTask.tags = ['  tag1  ', '  tag2  '];
    
    const savedTask = await testTask.save();
    
    expect(savedTask.title).toBe('Trimmed Title');
    expect(savedTask.description).toBe('Trimmed Description');
    expect(savedTask.tags[0]).toBe('tag1');
    expect(savedTask.tags[1]).toBe('tag2');
  });
  
  it('should handle task dependencies correctly', async () => {
    // Create task dependencies
    const blocker1 = await new Task({
      title: 'Blocker Task 1',
      assignedTo: testAssigneeId,
      createdBy: testUserId,
    }).save();
    
    const blocker2 = await new Task({
      title: 'Blocker Task 2',
      assignedTo: testAssigneeId,
      createdBy: testUserId,
    }).save();
    
    // Set blockers
    testTask.blockedBy = [blocker1._id, blocker2._id];
    
    const savedTask = await testTask.save();
    
    expect(savedTask.blockedBy).toHaveLength(2);
    expect(savedTask.blockedBy[0].toString()).toBe(blocker1._id.toString());
    expect(savedTask.blockedBy[1].toString()).toBe(blocker2._id.toString());
  });
  
  it('should update task status correctly', async () => {
    // Save the initial task
    await testTask.save();
    
    // Update status
    testTask.status = 'in-progress';
    await testTask.save();
    
    // Retrieve task from database
    const updatedTask = await Task.findById(testTask._id);
    
    expect(updatedTask!.status).toBe('in-progress');
  });
  
  it('should update actual hours correctly', async () => {
    // Save the initial task
    await testTask.save();
    
    // Update actual hours
    testTask.actualHours = 4;
    await testTask.save();
    
    // Retrieve task from database
    const updatedTask = await Task.findById(testTask._id);
    
    expect(updatedTask!.actualHours).toBe(4);
  });
});