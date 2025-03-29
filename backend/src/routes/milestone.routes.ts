import express from 'express';
import {
  getMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  approveMilestone,
  updateMilestoneProgress,
} from '../controllers/milestone.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication to all milestone routes
router.use(authenticate);

/**
 * @route   GET /api/milestones
 * @desc    Get all milestones
 * @access  Private
 */
router.get('/', getMilestones);

/**
 * @route   GET /api/milestones/:id
 * @desc    Get a milestone by ID
 * @access  Private
 */
router.get('/:id', getMilestoneById);

/**
 * @route   POST /api/milestones
 * @desc    Create a new milestone
 * @access  Private
 */
router.post('/', createMilestone);

/**
 * @route   PUT /api/milestones/:id
 * @desc    Update a milestone
 * @access  Private
 */
router.put('/:id', updateMilestone);

/**
 * @route   DELETE /api/milestones/:id
 * @desc    Delete a milestone
 * @access  Private
 */
router.delete('/:id', deleteMilestone);

/**
 * @route   PUT /api/milestones/:id/approve
 * @desc    Approve a milestone
 * @access  Private
 */
router.put('/:id/approve', approveMilestone);

/**
 * @route   PUT /api/milestones/:id/progress
 * @desc    Update milestone progress
 * @access  Private
 */
router.put('/:id/progress', updateMilestoneProgress);

export default router;