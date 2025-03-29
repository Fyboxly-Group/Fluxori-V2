import { StorageService } from './storage.service';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock @google-cloud/storage
jest.mock('@google-cloud/storage');

// Mock fs
jest.mock('fs');

describe('StorageService', () => {
  let storageService: StorageService;
  let mockBucket: any;
  let mockFile: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock fs.existsSync
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    // Mock console methods
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock Storage bucket and file
    mockFile = {
      getSignedUrl: jest.fn().mockResolvedValue(['https://signed-url.example.com']),
      save: jest.fn().mockResolvedValue(null),
      makePublic: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue(null),
    };
    
    mockBucket = {
      file: jest.fn().mockReturnValue(mockFile),
    };
    
    (Storage as jest.Mock).mockImplementation(() => ({
      bucket: jest.fn().mockReturnValue(mockBucket),
    }));
    
    // Create new instance for each test
    storageService = new StorageService();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('constructor', () => {
    it('should initialize with default credentials when no key file is found', () => {
      expect(Storage).toHaveBeenCalledWith();
    });
    
    it('should initialize with key file when it exists', () => {
      // Mock fs.existsSync for key file to exist
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      // Re-instantiate to trigger constructor
      storageService = new StorageService();
      
      // Verify Storage was instantiated with key file
      expect(Storage).toHaveBeenCalledWith({ keyFilename: expect.any(String) });
    });
    
    it('should handle errors during initialization', () => {
      // Mock fs.existsSync to throw an error
      (fs.existsSync as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });
      
      // Re-instantiate to trigger constructor
      storageService = new StorageService();
      
      // Verify error was logged and default credentials were used
      expect(console.error).toHaveBeenCalled();
      expect(Storage).toHaveBeenCalledWith();
    });
  });
  
  describe('getSignedUploadUrl', () => {
    it('should return a signed URL for uploading', async () => {
      const result = await storageService.getSignedUploadUrl('test.jpg', 'image/jpeg');
      
      // Verify bucket.file was called with a filename containing the original name
      expect(mockBucket.file).toHaveBeenCalledWith(expect.stringContaining('test'));
      
      // Verify file.getSignedUrl was called with correct parameters
      expect(mockFile.getSignedUrl).toHaveBeenCalledWith({
        version: 'v4',
        action: 'write',
        expires: expect.any(Number),
        contentType: 'image/jpeg',
      });
      
      // Verify result is the signed URL
      expect(result).toBe('https://signed-url.example.com');
    });
    
    it('should include folder in file path when provided', async () => {
      await storageService.getSignedUploadUrl('test.jpg', 'image/jpeg', 'uploads');
      
      // Verify bucket.file was called with a path containing the folder
      expect(mockBucket.file).toHaveBeenCalledWith(expect.stringContaining('uploads/'));
    });
    
    it('should handle errors and throw', async () => {
      // Mock getSignedUrl to throw
      mockFile.getSignedUrl.mockRejectedValue(new Error('Test error'));
      
      await expect(
        storageService.getSignedUploadUrl('test.jpg', 'image/jpeg')
      ).rejects.toThrow('Failed to generate upload URL');
      
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('uploadFile', () => {
    it('should upload file and return public URL', async () => {
      const file = Buffer.from('test file content');
      
      const result = await storageService.uploadFile(file, 'test.jpg', 'image/jpeg');
      
      // Verify bucket.file was called with a filename containing the original name
      expect(mockBucket.file).toHaveBeenCalledWith(expect.stringContaining('test'));
      
      // Verify file.save was called with the file buffer and correct options
      expect(mockFile.save).toHaveBeenCalledWith(file, {
        contentType: 'image/jpeg',
        metadata: {
          contentType: 'image/jpeg',
          cacheControl: 'public, max-age=31536000',
        },
      });
      
      // Verify file was made public
      expect(mockFile.makePublic).toHaveBeenCalled();
      
      // Verify result is the public URL
      expect(result).toContain('https://storage.googleapis.com/');
      expect(result).toContain('test');
    });
    
    it('should include folder in file path when provided', async () => {
      const file = Buffer.from('test file content');
      
      await storageService.uploadFile(file, 'test.jpg', 'image/jpeg', 'uploads');
      
      // Verify bucket.file was called with a path containing the folder
      expect(mockBucket.file).toHaveBeenCalledWith(expect.stringContaining('uploads/'));
    });
    
    it('should handle save errors and throw', async () => {
      // Mock save to throw
      mockFile.save.mockRejectedValue(new Error('Test error'));
      
      const file = Buffer.from('test file content');
      
      await expect(
        storageService.uploadFile(file, 'test.jpg', 'image/jpeg')
      ).rejects.toThrow('Failed to upload file');
      
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('deleteFile', () => {
    it('should delete file and return true on success', async () => {
      const result = await storageService.deleteFile('https://storage.googleapis.com/fluxori-v2-bucket/uploads/test.jpg');
      
      // Verify bucket.file was called with the correct file path
      expect(mockBucket.file).toHaveBeenCalledWith('uploads/test.jpg');
      
      // Verify file.delete was called
      expect(mockFile.delete).toHaveBeenCalled();
      
      // Verify result is true
      expect(result).toBe(true);
    });
    
    it('should handle delete errors and return false', async () => {
      // Mock delete to throw
      mockFile.delete.mockRejectedValue(new Error('Test error'));
      
      const result = await storageService.deleteFile('https://storage.googleapis.com/fluxori-v2-bucket/test.jpg');
      
      expect(console.error).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
  
  describe('generateUniqueFilename', () => {
    it('should generate a unique filename with timestamp and random string', () => {
      // Access the private method using type assertion
      const generateUniqueFilename = (storageService as any).generateUniqueFilename.bind(storageService);
      
      const result = generateUniqueFilename('test.jpg');
      
      // Verify result contains original basename
      expect(result).toContain('test-');
      
      // Verify result has the correct extension
      expect(result).toMatch(/\.jpg$/);
      
      // Verify result contains a timestamp and random string
      expect(result).toMatch(/test-\d+-[a-f0-9]{16}\.jpg/);
    });
  });
});