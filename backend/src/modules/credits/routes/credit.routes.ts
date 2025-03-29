import { Router } from 'express';
import { CreditController } from '../controllers/credit.controller';
import { authenticate, authorize } from '../../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreditBalance:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID
 *           example: '60d21b4967d0d8992e610c85'
 *         organizationId:
 *           type: string
 *           description: Organization ID (optional)
 *           example: '60d21b4967d0d8992e610c86'
 *         balance:
 *           type: number
 *           description: Current credit balance
 *           example: 2500
 *         tier:
 *           type: string
 *           enum: [explorer, growth, pro, enterprise]
 *           description: Subscription tier
 *           example: 'growth'
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Last updated timestamp
 *           example: '2024-03-15T10:00:00Z'
 *     
 *     CreditTransaction:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID
 *           example: '60d21b4967d0d8992e610c85'
 *         organizationId:
 *           type: string
 *           description: Organization ID (optional)
 *           example: '60d21b4967d0d8992e610c86'
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Transaction timestamp
 *           example: '2024-03-15T10:00:00Z'
 *         amount:
 *           type: number
 *           description: Transaction amount (positive for addition, negative for deduction)
 *           example: -10
 *         type:
 *           type: string
 *           enum: [allocation, purchase, usage]
 *           description: Transaction type
 *           example: 'usage'
 *         description:
 *           type: string
 *           description: Transaction description
 *           example: 'AI Insight Generation'
 *         newBalance:
 *           type: number
 *           description: Balance after transaction
 *           example: 2490
 *         referenceId:
 *           type: string
 *           description: Optional reference ID (order ID, feature ID, etc.)
 *           example: 'insight-123'
 */

/**
 * @swagger
 * /credits/balance:
 *   get:
 *     summary: Get credit balance
 *     description: Retrieves the current credit balance for the authenticated user or organization
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         description: Organization ID (optional)
 *     responses:
 *       200:
 *         description: Credit balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CreditBalance'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Credit balance not found
 *       500:
 *         description: Server error
 */
router.get('/balance', authenticate, CreditController.getBalance);

/**
 * @swagger
 * /credits/history:
 *   get:
 *     summary: Get credit transaction history
 *     description: Retrieves transaction history for the authenticated user or organization
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         description: Organization ID (optional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of transactions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CreditTransaction'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/history', authenticate, CreditController.getTransactionHistory);

/**
 * @swagger
 * /credits/initialize:
 *   post:
 *     summary: Initialize credit balance
 *     description: Initializes a credit balance for a user or organization (admin only)
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - tier
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               tier:
 *                 type: string
 *                 enum: [explorer, growth, pro, enterprise]
 *                 description: Subscription tier
 *               organizationId:
 *                 type: string
 *                 description: Organization ID (optional)
 *               initialBalance:
 *                 type: number
 *                 description: Initial balance (optional, defaults to tier allocation)
 *     responses:
 *       201:
 *         description: Credit balance initialized successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/initialize', authenticate, authorize('admin'), CreditController.initializeBalance);

/**
 * @swagger
 * /credits/add:
 *   post:
 *     summary: Add credits
 *     description: Adds credits to a user or organization (admin only)
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *               - type
 *               - description
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               amount:
 *                 type: number
 *                 description: Amount to add (positive number)
 *               type:
 *                 type: string
 *                 enum: [allocation, purchase]
 *                 description: Transaction type
 *               description:
 *                 type: string
 *                 description: Transaction description
 *               organizationId:
 *                 type: string
 *                 description: Organization ID (optional)
 *               referenceId:
 *                 type: string
 *                 description: Reference ID (optional)
 *     responses:
 *       200:
 *         description: Credits added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/add', authenticate, authorize('admin'), CreditController.addCredits);

/**
 * @swagger
 * /credits/deduct:
 *   post:
 *     summary: Deduct credits
 *     description: Deducts credits from a user or organization for feature usage
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *               - description
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               amount:
 *                 type: number
 *                 description: Amount to deduct (positive number)
 *               description:
 *                 type: string
 *                 description: Transaction description
 *               organizationId:
 *                 type: string
 *                 description: Organization ID (optional)
 *               referenceId:
 *                 type: string
 *                 description: Reference ID (optional)
 *     responses:
 *       200:
 *         description: Credits deducted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       402:
 *         description: Insufficient credits
 *       500:
 *         description: Server error
 */
router.post('/deduct', authenticate, CreditController.deductCredits); 

/**
 * @swagger
 * /credits/tier:
 *   put:
 *     summary: Update subscription tier
 *     description: Updates a user or organization subscription tier (admin only)
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - tier
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               tier:
 *                 type: string
 *                 enum: [explorer, growth, pro, enterprise]
 *                 description: New subscription tier
 *               organizationId:
 *                 type: string
 *                 description: Organization ID (optional)
 *     responses:
 *       200:
 *         description: Subscription tier updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.put('/tier', authenticate, authorize('admin'), CreditController.updateSubscriptionTier);

/**
 * @swagger
 * /credits/monthly-allocation:
 *   post:
 *     summary: Add monthly allocation
 *     description: Adds monthly credit allocation based on subscription tier (admin only)
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               organizationId:
 *                 type: string
 *                 description: Organization ID (optional)
 *     responses:
 *       200:
 *         description: Monthly allocation added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/monthly-allocation', authenticate, authorize('admin'), CreditController.addMonthlyAllocation);

export default router;