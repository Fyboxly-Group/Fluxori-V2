import express from 'express';
import {
  getInventoryAlerts,
  getInventoryAlertById,
  createInventoryAlert,
  updateInventoryAlert,
  deleteInventoryAlert,
  assignInventoryAlert,
  resolveInventoryAlert,
  getAlertStats,
} from '../controllers/inventory-alert.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication to all alert routes
router.use(authenticate);

/**
 * @route   GET /api/inventory-alerts
 * @desc    Get all inventory alerts
 * @access  Private
 */
router.get('/', getInventoryAlerts);

/**
 * @route   GET /api/inventory-alerts/stats
 * @desc    Get alert statistics
 * @access  Private
 */
router.get('/stats', getAlertStats);

/**
 * @route   GET /api/inventory-alerts/:id
 * @desc    Get a inventory alert by ID
 * @access  Private
 */
router.get('/:id', getInventoryAlertById);

/**
 * @route   POST /api/inventory-alerts
 * @desc    Create a new inventory alert
 * @access  Private
 */
router.post('/', createInventoryAlert);

/**
 * @route   PUT /api/inventory-alerts/:id
 * @desc    Update an inventory alert
 * @access  Private
 */
router.put('/:id', updateInventoryAlert);

/**
 * @route   DELETE /api/inventory-alerts/:id
 * @desc    Delete an inventory alert
 * @access  Private
 */
router.delete('/:id', deleteInventoryAlert);

/**
 * @route   PUT /api/inventory-alerts/:id/assign
 * @desc    Assign alert to user
 * @access  Private
 */
router.put('/:id/assign', assignInventoryAlert);

/**
 * @route   PUT /api/inventory-alerts/:id/resolve
 * @desc    Resolve alert
 * @access  Private
 */
router.put('/:id/resolve', resolveInventoryAlert);

export default router;