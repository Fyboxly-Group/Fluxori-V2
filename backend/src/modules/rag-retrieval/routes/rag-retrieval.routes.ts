import { Router } from 'express';
import { RagRetrievalController } from '../controllers/rag-retrieval.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: RAG Retrieval
 *   description: RAG (Retrieval Augmented Generation) context retrieval
 */

/**
 * @swagger
 * /api/rag-retrieval/context:
 *   post:
 *     summary: Get context snippets for a query
 *     tags: [RAG Retrieval]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: The query to find relevant context for
 *               topK:
 *                 type: number
 *                 description: Maximum number of snippets to return
 *                 default: 3
 *     responses:
 *       200:
 *         description: Context snippets retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/context', authenticate, RagRetrievalController.getContextSnippets);

/**
 * @swagger
 * /api/rag-retrieval/documents:
 *   post:
 *     summary: Get context documents with metadata for a query
 *     tags: [RAG Retrieval]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: The query to find relevant documents for
 *               topK:
 *                 type: number
 *                 description: Maximum number of documents to return
 *                 default: 3
 *               minScore:
 *                 type: number
 *                 description: Minimum similarity score threshold
 *                 default: 0.7
 *               filter:
 *                 type: object
 *                 description: Optional filters for document metadata
 *     responses:
 *       200:
 *         description: Context documents retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/documents', authenticate, RagRetrievalController.getContextDocuments);

/**
 * @swagger
 * /api/rag-retrieval/llm-context:
 *   post:
 *     summary: Get formatted context for an LLM
 *     tags: [RAG Retrieval]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: The query to find relevant context for
 *               conversationHistory:
 *                 type: string
 *                 description: Recent conversation history for additional context
 *               topK:
 *                 type: number
 *                 description: Maximum number of snippets to include
 *                 default: 3
 *     responses:
 *       200:
 *         description: LLM context retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/llm-context', authenticate, RagRetrievalController.getLlmContext);

export { router as ragRetrievalRoutes };