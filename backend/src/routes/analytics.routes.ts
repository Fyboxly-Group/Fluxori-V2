import express, { Router } from 'express';
import {
  getBusinessOverview,
  getProjectPerformance,
  getInventoryAnalytics,
  getShipmentAnalytics,
  getCustomerAnalytics,
  getTimeSeriesData,
  getProjectTimeToCompletion
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

/**
 * Analytics Router
 * Provides endpoints for retrieving various analytics and metrics
 */
const router: Router = express.Router();

// Apply authentication to all analytics routes
router.use(authenticate);

/**
 * @route   GET /api/analytics/overview
 * @desc    Get business overview analytics
 * @access  Private
 */
router.get('/overview', getBusinessOverview);

/**
 * @route   GET /api/analytics/projects/performance
 * @desc    Get project performance analytics
 * @access  Private
 */
router.get('/projects/performance', getProjectPerformance);

/**
 * @route   GET /api/analytics/projects/time-to-completion
 * @desc    Get time-to-completion analysis for projects
 * @access  Private
 */
router.get('/projects/time-to-completion', getProjectTimeToCompletion);

/**
 * @route   GET /api/analytics/inventory
 * @desc    Get inventory analytics
 * @access  Private
 */
router.get('/inventory', getInventoryAnalytics);

/**
 * @route   GET /api/analytics/shipments
 * @desc    Get shipment analytics
 * @access  Private
 */
router.get('/shipments', getShipmentAnalytics);

/**
 * @route   GET /api/analytics/customers
 * @desc    Get customer analytics
 * @access  Private
 */
router.get('/customers', getCustomerAnalytics);

/**
 * @route   GET /api/analytics/timeseries
 * @desc    Get time series data for dashboard
 * @access  Private
 */
router.get('/timeseries', getTimeSeriesData);

export default router;