import mongoose from 'mongoose';
import Project, { IProjectDocument } from './project.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Project Model', () => {
  let testProject: IProjectDocument;
  const testUserId = new mongoose.Types.ObjectId();
  const testCustomerId = new mongoose.Types.ObjectId();
  const testStakeholderId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test project before each test
    testProject = new Project({
      name: 'Test Project',
      description: 'This is a test project',
      customer: testCustomerId,
      accountManager: testUserId,
      status: 'active',
      phase: 'implementation',
      startDate: new Date('2025-01-01'),
      targetCompletionDate: new Date('2025-12-31'),
      budget: 1000000,
      costToDate: 250000,
      objectives: ['Improve efficiency', 'Reduce costs', 'Increase customer satisfaction'],
      keyResults: [
        {
          description: 'Efficiency improvement',
          target: 25,
          current: 10,
          unit: 'percent',
          isComplete: false,
        },
        {
          description: 'Cost reduction',
          target: 15,
          current: 5,
          unit: 'percent',
          isComplete: false,
        }
      ],
      businessValue: 'High ROI through operational improvements',
      stakeholders: [
        {
          user: testStakeholderId,
          role: 'Project Sponsor',
          isExternal: false,
        }
      ],
      documents: [
        {
          title: 'Project Charter',
          fileUrl: 'https://storage.example.com/project-charter.pdf',
          uploadedBy: testUserId,
          uploadedAt: new Date('2025-01-05'),
          category: 'specification',
        }
      ],
      tags: ['high-priority', 'strategic'],
      createdBy: testUserId,
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Project.deleteMany({});
  });
  
  it('should create a new project with the correct fields', async () => {
    const savedProject = await testProject.save();
    
    // Verify required fields
    expect(savedProject._id).toBeDefined();
    expect(savedProject.name).toBe('Test Project');
    expect(savedProject.description).toBe('This is a test project');
    expect(savedProject.customer.toString()).toBe(testCustomerId.toString());
    expect(savedProject.accountManager.toString()).toBe(testUserId.toString());
    expect(savedProject.status).toBe('active');
    expect(savedProject.phase).toBe('implementation');
    expect(savedProject.startDate).toEqual(new Date('2025-01-01'));
    expect(savedProject.targetCompletionDate).toEqual(new Date('2025-12-31'));
    expect(savedProject.budget).toBe(1000000);
    expect(savedProject.costToDate).toBe(250000);
    
    // Verify arrays
    expect(savedProject.objectives).toHaveLength(3);
    expect(savedProject.objectives[0]).toBe('Improve efficiency');
    expect(savedProject.objectives[1]).toBe('Reduce costs');
    expect(savedProject.objectives[2]).toBe('Increase customer satisfaction');
    
    // Verify key results
    expect(savedProject.keyResults).toHaveLength(2);
    expect(savedProject.keyResults[0].description).toBe('Efficiency improvement');
    expect(savedProject.keyResults[0].target).toBe(25);
    expect(savedProject.keyResults[0].current).toBe(10);
    expect(savedProject.keyResults[0].unit).toBe('percent');
    expect(savedProject.keyResults[0].isComplete).toBe(false);
    
    // Verify stakeholders
    expect(savedProject.stakeholders).toHaveLength(1);
    expect(savedProject.stakeholders[0].user.toString()).toBe(testStakeholderId.toString());
    expect(savedProject.stakeholders[0].role).toBe('Project Sponsor');
    expect(savedProject.stakeholders[0].isExternal).toBe(false);
    
    // Verify documents
    expect(savedProject.documents).toHaveLength(1);
    expect(savedProject.documents[0].title).toBe('Project Charter');
    expect(savedProject.documents[0].fileUrl).toBe('https://storage.example.com/project-charter.pdf');
    expect(savedProject.documents[0].uploadedBy.toString()).toBe(testUserId.toString());
    expect(savedProject.documents[0].category).toBe('specification');
    
    // Verify other fields
    expect(savedProject.businessValue).toBe('High ROI through operational improvements');
    expect(savedProject.tags).toEqual(['high-priority', 'strategic']);
    expect(savedProject.createdBy.toString()).toBe(testUserId.toString());
    expect(savedProject.createdAt).toBeDefined();
    expect(savedProject.updatedAt).toBeDefined();
  });
  
  it('should require all required fields', async () => {
    const incompleteProject = new Project({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteProject.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.customer).toBeDefined();
    expect(error.errors.accountManager).toBeDefined();
    expect(error.errors.startDate).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });
  
  it('should validate status is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testProject.status = 'invalid_status';
    
    let error;
    try {
      await testProject.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
    
    // Test with valid status
    testProject.status = 'completed';
    
    // Should not throw error
    await testProject.validate();
  });
  
  it('should validate phase is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testProject.phase = 'invalid_phase';
    
    let error;
    try {
      await testProject.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.phase).toBeDefined();
    
    // Test with valid phase
    testProject.phase = 'testing';
    
    // Should not throw error
    await testProject.validate();
  });
  
  it('should validate document category is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid category
    testProject.documents[0].category = 'invalid_category';
    
    let error;
    try {
      await testProject.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['documents.0.category']).toBeDefined();
    
    // Test with valid category
    testProject.documents[0].category = 'report';
    
    // Should not throw error
    await testProject.validate();
  });
  
  it('should require required fields in keyResults', async () => {
    // Missing required field in keyResults
    testProject.keyResults.push({
      // @ts-ignore: intentionally omitting required fields
      description: 'Incomplete key result',
      // Missing target and unit
      current: 5,
      isComplete: false
    });
    
    let error;
    try {
      await testProject.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['keyResults.2.target']).toBeDefined();
    expect(error.errors['keyResults.2.unit']).toBeDefined();
  });
  
  it('should require required fields in stakeholders', async () => {
    // Missing required field in stakeholders
    testProject.stakeholders.push({
      // @ts-ignore: intentionally omitting required fields
      // Missing user
      role: 'Missing User',
      isExternal: true
    });
    
    let error;
    try {
      await testProject.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['stakeholders.1.user']).toBeDefined();
  });
  
  it('should require required fields in documents', async () => {
    // Missing required fields in documents
    testProject.documents.push({
      // @ts-ignore: intentionally omitting required fields
      title: 'Incomplete Document',
      // Missing fileUrl and uploadedBy
      category: 'other'
    });
    
    let error;
    try {
      await testProject.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['documents.1.fileUrl']).toBeDefined();
    expect(error.errors['documents.1.uploadedBy']).toBeDefined();
  });
  
  it('should trim whitespace from string fields', async () => {
    testProject.name = '  Trimmed Project Name  ';
    testProject.description = '  Trimmed Description  ';
    testProject.tags = ['  tag1  ', '  tag2  '];
    testProject.objectives = ['  objective1  ', '  objective2  '];
    
    const savedProject = await testProject.save();
    
    expect(savedProject.name).toBe('Trimmed Project Name');
    expect(savedProject.description).toBe('Trimmed Description');
    expect(savedProject.tags[0]).toBe('tag1');
    expect(savedProject.tags[1]).toBe('tag2');
    expect(savedProject.objectives[0]).toBe('objective1');
    expect(savedProject.objectives[1]).toBe('objective2');
  });
  
  it('should update project status and phase correctly', async () => {
    // Save the initial project
    await testProject.save();
    
    // Update status and phase
    testProject.status = 'on-hold';
    testProject.phase = 'testing';
    await testProject.save();
    
    // Retrieve project from database
    const updatedProject = await Project.findById(testProject._id);
    
    expect(updatedProject!.status).toBe('on-hold');
    expect(updatedProject!.phase).toBe('testing');
  });
  
  it('should update project cost tracking correctly', async () => {
    // Save the initial project
    await testProject.save();
    
    // Update cost and budget
    testProject.costToDate = 500000;
    testProject.budget = 1200000;
    await testProject.save();
    
    // Retrieve project from database
    const updatedProject = await Project.findById(testProject._id);
    
    expect(updatedProject!.costToDate).toBe(500000);
    expect(updatedProject!.budget).toBe(1200000);
  });
  
  it('should set default values when not provided', async () => {
    // Create a project with minimal fields
    const minimalProject = new Project({
      name: 'Minimal Project',
      customer: testCustomerId,
      accountManager: testUserId,
      startDate: new Date('2025-02-01'),
      createdBy: testUserId,
    });
    
    const savedProject = await minimalProject.save();
    
    // Default values should be set
    expect(savedProject.status).toBe('planning');
    expect(savedProject.phase).toBe('discovery');
    expect(savedProject.costToDate).toBe(0);
  });
  
  it('should update key results correctly', async () => {
    // Save initial project
    await testProject.save();
    
    // Update key result and mark as complete
    testProject.keyResults[0].current = 25;
    testProject.keyResults[0].isComplete = true;
    
    await testProject.save();
    
    // Retrieve updated project
    const updatedProject = await Project.findById(testProject._id);
    
    expect(updatedProject!.keyResults[0].current).toBe(25);
    expect(updatedProject!.keyResults[0].isComplete).toBe(true);
  });
});