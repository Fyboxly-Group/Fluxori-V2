// @ts-nocheck - Added by final-ts-fix.js
import express from 'express';
import syncOrchestratorController from '../controllers/sync-orchestrator.controller';
import isAuthenticated from '../../../middleware/auth.middleware';
import isAdmin from '../../../middleware/admin.middleware';

const router = express.Router();

/**
 * Routes for sync orchestration
 * All routes are protected and require admin access
 * except for the scheduler endpoint which uses its own authentication
 */

/**
 * @route   GET /api/sync/status
 * @desc    Get current sync service status
 * @access  Admin
 */
router.get(
  '/status',
  isAuthenticated,
  isAdmin,
  syncOrchestratorController.getSyncStatus
);

/**
 * @route   POST /api/sync/start
 * @desc    Start the sync service
 * @access  Admin
 */
router.post(
  '/start',
  isAuthenticated,
  isAdmin,
  syncOrchestratorController.startSyncService
);

/**
 * @route   POST /api/sync/stop
 * @desc    Stop the sync service
 * @access  Admin
 */
router.post(
  '/stop',
  isAuthenticated,
  isAdmin,
  syncOrchestratorController.stopSyncService
);

/**
 * @route   POST /api/sync/interval
 * @desc    Update sync interval
 * @access  Admin
 */
router.post(
  '/interval',
  isAuthenticated,
  isAdmin,
  syncOrchestratorController.updateSyncInterval
);

/**
 * @route   POST /api/sync/trigger
 * @desc    Trigger sync for specific connections
 * @access  Admin
 */
router.post(
  '/trigger',
  isAuthenticated,
  isAdmin,
  syncOrchestratorController.triggerSync
);

/**
 * @route   POST /api/sync/run-full
 * @desc    Force a full sync for all active connections
 * @access  Admin
 */
router.post(
  '/run-full',
  isAuthenticated,
  isAdmin,
  syncOrchestratorController.forceFullSync
);

/**
 * @route   POST /api/sync/scheduler
 * @desc    Endpoint for Cloud Scheduler to trigger a sync
 * @access  Cloud Scheduler (authenticated via headers)
 */
router.post(
  '/scheduler',
  syncOrchestratorController.handleScheduledSync
);

export default router;