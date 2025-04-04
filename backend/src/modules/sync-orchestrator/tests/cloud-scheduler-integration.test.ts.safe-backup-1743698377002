import request from 'supertest';
import app from '../../../app';
import { syncOrchestratorService } from '../services/sync-orchestrator.service';
import config from '../../../config';

// Mock dependencies
jest.mock('../services/sync-orchestrator.service', () => ({
  syncOrchestratorService: {
    validateSchedulerRequest: jest.fn(),
    runSync: jest.fn().mockResolvedValue({
      success: true,
      totalConnections: 2,
      successfulConnections: 2,
      failedConnections: 0,
      errors: []
    }),
    getSyncStatus: jest.fn().mockReturnValue({
      isRunning: false,
      isScheduled: false,
      intervalMinutes: 15
    })
  }
}));

describe('Cloud Scheduler Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Scheduler Endpoint', () => {
    it('should return 403 when the request is not authenticated', async () => {
      // Mock validation failure
      syncOrchestratorService.validateSchedulerRequest.mockReturnValue(false);

      const response = await request(app)
        .post('/api/sync/scheduler')
        .send({ source: 'cloud-scheduler' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(syncOrchestratorService.validateSchedulerRequest).toHaveBeenCalled();
      expect(syncOrchestratorService.runSync).not.toHaveBeenCalled();
    });

    it('should accept and process a valid scheduler request', async () => {
      // Mock validation success
      syncOrchestratorService.validateSchedulerRequest.mockReturnValue(true);

      const response = await request(app)
        .post('/api/sync/scheduler')
        .set('x-scheduler-secret', 'test-secret')
        .send({ source: 'cloud-scheduler' });

      expect(response.status).toBe(202);
      expect(response.body.success).toBe(true);
      expect(syncOrchestratorService.validateSchedulerRequest).toHaveBeenCalled();
      // We don't expect the runSync to complete since it's running in the background
      // But we do expect it to be called
      expect(syncOrchestratorService.runSync).toHaveBeenCalled();
    });
  });

  describe('Authentication Validation', () => {
    it('should validate the scheduler secret correctly', () => {
      // Directly test the validateSchedulerRequest function
      const origValue = config.schedulerSecret;
      const origSkipAuth = config.skipSchedulerAuth;
      
      try {
        // Test with correct secret
        config.schedulerSecret = 'test-secret';
        config.skipSchedulerAuth = false;
        
        const headers = { 'x-scheduler-secret': 'test-secret' };
        
        // Unmock this function for direct testing
        const realValidateSchedulerRequest = jest.requireActual('../services/sync-orchestrator.service')
          .syncOrchestratorService.validateSchedulerRequest;
        
        expect(realValidateSchedulerRequest(headers)).toBe(true);
        
        // Test with incorrect secret
        expect(realValidateSchedulerRequest({ 'x-scheduler-secret': 'wrong-secret' })).toBe(false);
        
        // Test with missing secret header
        expect(realValidateSchedulerRequest({})).toBe(false);
        
        // Test with development mode
        config.skipSchedulerAuth = true;
        expect(realValidateSchedulerRequest({})).toBe(true);
      } finally {
        // Restore original values
        config.schedulerSecret = origValue;
        config.skipSchedulerAuth = origSkipAuth;
      }
    });
  });

  describe('Admin API Endpoints', () => {
    // Note: These tests would normally require admin auth middleware
    // For simplicity in testing, we're mocking as if auth has already passed
    
    it('should get the sync status', async () => {
      // Mock auth middleware for testing
      jest.mock('../../../middleware/auth.middleware', () => (req, res, next) => next());
      jest.mock('../../../middleware/admin.middleware', () => (req, res, next) => next());

      const response = await request(app).get('/api/sync/status');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(syncOrchestratorService.getSyncStatus).toHaveBeenCalled();
    });

    it('should trigger a manual sync for specific connections', async () => {
      // Mock forceSyncConnections
      syncOrchestratorService.forceSyncConnections = jest.fn().mockResolvedValue([
        { connectionId: '123', success: true }
      ]);

      const response = await request(app)
        .post('/api/sync/trigger')
        .send({ connectionIds: ['123'] });
      
      expect(response.status).toBe(202);
      expect(response.body.success).toBe(true);
      // The function will be called asynchronously, so we can't check if it completes
    });
  });
});