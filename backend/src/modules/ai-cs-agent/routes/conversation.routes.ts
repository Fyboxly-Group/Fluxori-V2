import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     tags:
 *       - ai-cs-agent
 *     summary: Get all conversations for authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authMiddleware, conversationController.getUserConversations.bind(conversationController));

/**
 * @swagger
 * /api/conversations/{id}:
 *   get:
 *     tags:
 *       - ai-cs-agent
 *     summary: Get conversation by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', authMiddleware, conversationController.getConversation.bind(conversationController));

/**
 * @swagger
 * /api/conversations/message:
 *   post:
 *     tags:
 *       - ai-cs-agent
 *     summary: Process a new message in conversation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               conversationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/message', authMiddleware, conversationController.processMessage.bind(conversationController));

/**
 * @swagger
 * /api/conversations/{id}/close:
 *   put:
 *     tags:
 *       - ai-cs-agent
 *     summary: Close a conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/close', authMiddleware, conversationController.closeConversation.bind(conversationController));

export default router;