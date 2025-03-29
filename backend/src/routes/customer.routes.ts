import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication to all customer routes
router.use(authenticate);

/**
 * @route   GET /api/customers
 * @desc    Get all customers
 * @access  Private
 */
router.get('/', getCustomers);

/**
 * @route   GET /api/customers/stats
 * @desc    Get customer statistics
 * @access  Private
 */
router.get('/stats', getCustomerStats);

/**
 * @route   GET /api/customers/:id
 * @desc    Get a customer by ID
 * @access  Private
 */
router.get('/:id', getCustomerById);

/**
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Private
 */
router.post('/', createCustomer);

/**
 * @route   PUT /api/customers/:id
 * @desc    Update a customer
 * @access  Private
 */
router.put('/:id', updateCustomer);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete a customer
 * @access  Private (Admin only)
 */
router.delete('/:id', authorize('admin'), deleteCustomer);

export default router;