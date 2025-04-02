/**
 * Feedback Routes
 * Routes for handling user feedback
 */
import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();
const feedbackController = new FeedbackController();

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit new feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - category
 *               - severity
 *             properties:
 *               title:
 *                 type: string
 *                 description: Short title for the feedback
 *               description:
 *                 type: string
 *                 description: Detailed description of the feedback
 *               type:
 *                 type: string
 *                 description: Type of feedback
 *                 enum: [bug, feature_request, usability, performance, general]
 *               category:
 *                 type: string
 *                 description: Category of the feedback
 *                 enum: [ui, data, reports, inventory, marketplace, shipping, billing, accounts, other]
 *               severity:
 *                 type: string
 *                 description: Severity of the feedback
 *                 enum: [critical, high, medium, low]
 *               screenshotData:
 *                 type: string
 *                 description: Base64 encoded screenshot (optional)
 *               systemInfo:
 *                 type: object
 *                 description: System information (optional)
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, feedbackController.submitFeedback.bind(feedbackController));

/**
 * @swagger
 * /api/feedback/user:
 *   get:
 *     summary: Get current user's feedback history
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's feedback history
 *       401:
 *         description: Unauthorized
 */
router.get('/user', authenticate, feedbackController.getUserFeedback.bind(feedbackController));

/**
 * @swagger
 * /api/feedback/admin:
 *   get:
 *     summary: Get all feedback (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: List of all feedback
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/admin', authenticate, feedbackController.getAllFeedback.bind(feedbackController));

/**
 * @swagger
 * /api/feedback/organization/{organizationId}:
 *   get:
 *     summary: Get organization's feedback (admin or organization manager)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization's feedback
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to access this organization
 */
router.get('/organization/:organizationId', authenticate, feedbackController.getOrganizationFeedback.bind(feedbackController));

/**
 * @swagger
 * /api/feedback/analytics:
 *   get:
 *     summary: Get feedback analytics (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         description: Filter by organization ID (optional)
 *     responses:
 *       200:
 *         description: Feedback analytics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics', authenticate, feedbackController.getFeedbackAnalytics.bind(feedbackController));

/**
 * @swagger
 * /api/feedback/{id}:
 *   get:
 *     summary: Get feedback by ID
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to access this feedback
 *       404:
 *         description: Feedback not found
 */
router.get('/:id', authenticate, feedbackController.getFeedbackById.bind(feedbackController));

/**
 * @swagger
 * /api/feedback/{id}:
 *   patch:
 *     summary: Update feedback (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, under_review, in_progress, completed, declined, planned]
 *               adminResponse:
 *                 type: string
 *                 description: Response message from admin
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Feedback not found
 */
router.patch('/:id', authenticate, feedbackController.updateFeedback.bind(feedbackController));

/**
 * @swagger
 * /api/feedback/{id}:
 *   delete:
 *     summary: Delete feedback (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Feedback not found
 */
router.delete('/:id', authenticate, feedbackController.deleteFeedback.bind(feedbackController));

export default router;