import mongoose from 'mongoose';
import User, { IUserDocument } from './user.model';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('User Model', () => {
  let testUser: IUserDocument;
  
  beforeEach(async () => {
    // Create a test user before each test
    testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
    });
  });
  
  it('should create a new user with the correct fields', async () => {
    const savedUser = await testUser.save();
    
    // Verify required fields
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.firstName).toBe('Test');
    expect(savedUser.lastName).toBe('User');
    expect(savedUser.role).toBe('user');
    expect(savedUser.isActive).toBe(true);
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
    
    // Password should be hashed, not stored as plain text
    expect(savedUser.password).not.toBe('password123');
  });
  
  it('should hash the password when saving a user', async () => {
    const originalPassword = 'password123';
    testUser.password = originalPassword;
    
    const savedUser = await testUser.save();
    
    // Check the password is hashed
    expect(savedUser.password).not.toBe(originalPassword);
    expect(savedUser.password.length).toBeGreaterThan(originalPassword.length);
  });
  
  it('should correctly compare passwords', async () => {
    const savedUser = await testUser.save();
    
    // Test with correct password
    const isMatch = await savedUser.comparePassword('password123');
    expect(isMatch).toBe(true);
    
    // Test with incorrect password
    const isWrongMatch = await savedUser.comparePassword('wrongpassword');
    expect(isWrongMatch).toBe(false);
  });
  
  it('should require an email', async () => {
    testUser.email = '';
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await testUser.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });
  
  it('should require a valid role', async () => {
    // @ts-ignore - intentionally testing invalid value
    testUser.role = 'invalid_role';
    
    let error;
    try {
      await testUser.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.role).toBeDefined();
  });
  
  it('should require a password with minimum length', async () => {
    testUser.password = 'short';
    
    let error;
    try {
      await testUser.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });
  
  it('should update the password hash when password is changed', async () => {
    // Save initial user
    const savedUser = await testUser.save();
    const originalHash = savedUser.password;
    
    // Change password and save again
    savedUser.password = 'newpassword123';
    const updatedUser = await savedUser.save();
    
    // Check if hash has changed
    expect(updatedUser.password).not.toBe(originalHash);
    
    // Verify new password works
    const isMatch = await updatedUser.comparePassword('newpassword123');
    expect(isMatch).toBe(true);
  });
});