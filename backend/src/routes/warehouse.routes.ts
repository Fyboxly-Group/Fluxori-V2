// TypeScript checked
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as warehouseController from '../controllers/warehouse.controller';

const router = Router();

/**
 * @route   GET /api/warehouses
 * @desc    Get all warehouses
 * @access  Private
 */
router.get('/', authenticate, warehouseController.getAll);

/**
 * @route   GET /api/warehouses/:id
 * @desc    Get warehouse by ID
 * @access  Private
 */
router.get('/:id', authenticate, warehouseController.getById);

/**
 * @route   POST /api/warehouses
 * @desc    Create a new warehouse
 * @access  Private
 */
router.post('/', authenticate, warehouseController.create);

/**
 * @route   PUT /api/warehouses/:id
 * @desc    Update a warehouse
 * @access  Private
 */
router.put('/:id', authenticate, warehouseController.updateWarehouse);

/**
 * @route   DELETE /api/warehouses/:id
 * @desc    Delete a warehouse
 * @access  Private
 */
router.delete('/:id', authenticate, warehouseController.deleteWarehouse);

export default router;
