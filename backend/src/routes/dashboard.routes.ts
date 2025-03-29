import express from 'express';
import {
  getStats,
  getActivities,
  getTasks,
  getSystemStatus,
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/dashboard/activities
 * @desc    Get recent activities
 * @access  Private
 */
router.get('/activities', getActivities);

/**
 * @route   GET /api/dashboard/tasks
 * @desc    Get tasks, optionally filtered by status
 * @access  Private
 */
router.get('/tasks', getTasks);

/**
 * @route   GET /api/dashboard/system-status
 * @desc    Get system status
 * @access  Private
 */
router.get('/system-status', getSystemStatus);

export default router;