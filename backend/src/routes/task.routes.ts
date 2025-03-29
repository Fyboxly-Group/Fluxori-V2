import express from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication to all task routes
router.use(authenticate);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks
 * @access  Private
 */
router.get('/', getAllTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a task by ID
 * @access  Private
 */
router.get('/:id', getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', deleteTask);

export default router;