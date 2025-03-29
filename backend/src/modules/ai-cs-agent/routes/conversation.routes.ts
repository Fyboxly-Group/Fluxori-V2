import express from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI Customer Service
 *   description: AI-powered customer service agent endpoints
 */

/**
 * @swagger
 * /ai-cs-agent/message:
 *   post:
 *     summary: Process a user message and get AI response
 *     tags: [AI Customer Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's message
 *               conversationId:
 *                 type: string
 *                 description: Optional ID of an existing conversation
 *               organizationId:
 *                 type: string
 *                 description: Optional organization ID for billing
 *     responses:
 *       200:
 *         description: Message processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversationId:
 *                       type: string
 *                     aiResponse:
 *                       type: string
 *                     isEscalated:
 *                       type: boolean
 *                     escalationReason:
 *                       type: string
 *                     usage:
 *                       type: object
 *                       properties:
 *                         tokens:
 *                           type: number
 *                         credits:
 *                           type: number
 *                         confidence:
 *                           type: number
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication required
 *       402:
 *         description: Insufficient credits
 */
router.post('/message', authenticate, ConversationController.processMessage);

/**
 * @swagger
 * /ai-cs-agent/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [AI Customer Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of conversations to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, escalated, closed]
 *         description: Filter by conversation status
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/conversations', authenticate, ConversationController.getUserConversations);

/**
 * @swagger
 * /ai-cs-agent/conversations/{id}:
 *   get:
 *     summary: Get a specific conversation by ID
 *     tags: [AI Customer Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Conversation not found
 */
router.get('/conversations/:id', authenticate, ConversationController.getConversation);

/**
 * @swagger
 * /ai-cs-agent/conversations/{id}/close:
 *   post:
 *     summary: Close a conversation
 *     tags: [AI Customer Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation closed successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Conversation not found
 */
router.post('/conversations/:id/close', authenticate, ConversationController.closeConversation);

export default router;