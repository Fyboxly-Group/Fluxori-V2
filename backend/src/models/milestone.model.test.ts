import mongoose from 'mongoose';
import Milestone, { IMilestoneDocument } from './milestone.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Milestone Model', () => {
  let testMilestone: IMilestoneDocument;
  const testUserId = new mongoose.Types.ObjectId();
  const testProjectId = new mongoose.Types.ObjectId();
  const testReviewerId = new mongoose.Types.ObjectId();
  const testDependencyId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test milestone before each test
    testMilestone = new Milestone({
      title: 'Test Milestone',
      description: 'This is a test milestone',
      project: testProjectId,
      status: 'not-started',
      startDate: new Date('2025-04-01'),
      targetCompletionDate: new Date('2025-04-30'),
      deliverables: ['Documentation', 'Code', 'Tests'],
      owner: testUserId,
      reviewers: [testReviewerId],
      approvalRequired: true,
      priority: 'high',
      dependencies: [testDependencyId],
      progress: 0,
      notes: 'Important milestone for project success',
      tags: ['critical', 'Q2-2025'],
      createdBy: testUserId,
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Milestone.deleteMany({});
  });
  
  it('should create a new milestone with the correct fields', async () => {
    const savedMilestone = await testMilestone.save();
    
    // Verify required fields
    expect(savedMilestone._id).toBeDefined();
    expect(savedMilestone.title).toBe('Test Milestone');
    expect(savedMilestone.description).toBe('This is a test milestone');
    expect(savedMilestone.project.toString()).toBe(testProjectId.toString());
    expect(savedMilestone.status).toBe('not-started');
    expect(savedMilestone.startDate).toEqual(new Date('2025-04-01'));
    expect(savedMilestone.targetCompletionDate).toEqual(new Date('2025-04-30'));
    expect(savedMilestone.deliverables).toEqual(['Documentation', 'Code', 'Tests']);
    expect(savedMilestone.owner.toString()).toBe(testUserId.toString());
    expect(savedMilestone.reviewers).toHaveLength(1);
    expect(savedMilestone.reviewers[0].toString()).toBe(testReviewerId.toString());
    expect(savedMilestone.approvalRequired).toBe(true);
    expect(savedMilestone.priority).toBe('high');
    expect(savedMilestone.dependencies).toHaveLength(1);
    expect(savedMilestone.dependencies[0].toString()).toBe(testDependencyId.toString());
    expect(savedMilestone.progress).toBe(0);
    expect(savedMilestone.notes).toBe('Important milestone for project success');
    expect(savedMilestone.tags).toEqual(['critical', 'Q2-2025']);
    expect(savedMilestone.createdBy.toString()).toBe(testUserId.toString());
    expect(savedMilestone.createdAt).toBeDefined();
    expect(savedMilestone.updatedAt).toBeDefined();
  });
  
  it('should require all required fields', async () => {
    const incompleteMilestone = new Milestone({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteMilestone.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.project).toBeDefined();
    expect(error.errors.startDate).toBeDefined();
    expect(error.errors.targetCompletionDate).toBeDefined();
    expect(error.errors.owner).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });
  
  it('should validate status is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testMilestone.status = 'invalid_status';
    
    let error;
    try {
      await testMilestone.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
    
    // Test with valid status
    testMilestone.status = 'in-progress';
    
    // Should not throw error
    await testMilestone.validate();
  });
  
  it('should validate priority is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testMilestone.priority = 'invalid_priority';
    
    let error;
    try {
      await testMilestone.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.priority).toBeDefined();
    
    // Test with valid priority
    testMilestone.priority = 'medium';
    
    // Should not throw error
    await testMilestone.validate();
  });
  
  it('should validate progress is between 0 and 100', async () => {
    // Test with progress below minimum
    testMilestone.progress = -10;
    
    let error;
    try {
      await testMilestone.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.progress).toBeDefined();
    
    // Reset error
    error = undefined;
    
    // Test with progress above maximum
    testMilestone.progress = 110;
    
    try {
      await testMilestone.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.progress).toBeDefined();
    
    // Test with valid progress
    testMilestone.progress = 50;
    
    // Should not throw error
    await testMilestone.validate();
  });
  
  it('should trim whitespace from string fields', async () => {
    testMilestone.title = '  Trimmed Title  ';
    testMilestone.description = '  Trimmed Description  ';
    testMilestone.tags = ['  tag1  ', '  tag2  '];
    testMilestone.deliverables = ['  deliverable1  ', '  deliverable2  '];
    
    const savedMilestone = await testMilestone.save();
    
    expect(savedMilestone.title).toBe('Trimmed Title');
    expect(savedMilestone.description).toBe('Trimmed Description');
    expect(savedMilestone.tags[0]).toBe('tag1');
    expect(savedMilestone.tags[1]).toBe('tag2');
    expect(savedMilestone.deliverables[0]).toBe('deliverable1');
    expect(savedMilestone.deliverables[1]).toBe('deliverable2');
  });
  
  it('should handle milestone dependencies correctly', async () => {
    // Create a dependency milestone
    const dependency = await new Milestone({
      title: 'Dependency Milestone',
      project: testProjectId,
      startDate: new Date('2025-03-01'),
      targetCompletionDate: new Date('2025-03-31'),
      owner: testUserId,
      createdBy: testUserId,
    }).save();
    
    // Set dependency
    testMilestone.dependencies = [dependency._id];
    
    const savedMilestone = await testMilestone.save();
    
    expect(savedMilestone.dependencies).toHaveLength(1);
    expect(savedMilestone.dependencies[0].toString()).toBe(dependency._id.toString());
  });
  
  it('should handle approval process correctly', async () => {
    // Save initial milestone
    await testMilestone.save();
    
    // Add approver
    const approverUserId = new mongoose.Types.ObjectId();
    testMilestone.approvedBy = [approverUserId];
    
    const updatedMilestone = await testMilestone.save();
    
    expect(updatedMilestone.approvedBy).toHaveLength(1);
    expect(updatedMilestone.approvedBy[0].toString()).toBe(approverUserId.toString());
  });
  
  it('should update milestone status correctly', async () => {
    // Save the initial milestone
    await testMilestone.save();
    
    // Update status to in-progress
    testMilestone.status = 'in-progress';
    await testMilestone.save();
    
    // Retrieve milestone from database
    const inProgressMilestone = await Milestone.findById(testMilestone._id);
    
    expect(inProgressMilestone!.status).toBe('in-progress');
    
    // Complete the milestone
    testMilestone.status = 'completed';
    testMilestone.actualCompletionDate = new Date('2025-04-25');
    testMilestone.progress = 100;
    
    await testMilestone.save();
    
    // Retrieve updated milestone
    const completedMilestone = await Milestone.findById(testMilestone._id);
    
    expect(completedMilestone!.status).toBe('completed');
    expect(completedMilestone!.actualCompletionDate).toEqual(new Date('2025-04-25'));
    expect(completedMilestone!.progress).toBe(100);
  });
  
  it('should set default values when not provided', async () => {
    // Create a milestone with minimal fields
    const minimalMilestone = new Milestone({
      title: 'Minimal Milestone',
      project: testProjectId,
      startDate: new Date('2025-05-01'),
      targetCompletionDate: new Date('2025-05-31'),
      owner: testUserId,
      createdBy: testUserId,
    });
    
    const savedMilestone = await minimalMilestone.save();
    
    // Default values should be set
    expect(savedMilestone.status).toBe('not-started');
    expect(savedMilestone.priority).toBe('medium');
    expect(savedMilestone.progress).toBe(0);
    expect(savedMilestone.approvalRequired).toBe(false);
  });
});