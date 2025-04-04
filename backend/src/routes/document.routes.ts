import { Router } from 'express';
import { container } from '../config/inversify';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';

const router = Router();
const documentController = container.get<DocumentController>(DocumentController);

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document generation and management
 */

/**
 * @swagger
 * /api/documents/generate:
 *   post:
 *     summary: Generate a PDF document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: object
 *                 description: Document content structure
 *               options:
 *                 type: object
 *                 description: Document generation options
 *     responses:
 *       200:
 *         description: Document generated successfully
 *       400:
 *         description: Invalid document content
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/generate',
  authenticate,
  documentController.generateDocument
);

/**
 * @swagger
 * /api/documents/template:
 *   post:
 *     summary: Generate a PDF document from a template
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - data
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: Template ID
 *               data:
 *                 type: object
 *                 description: Template data
 *               options:
 *                 type: object
 *                 description: Document generation options
 *     responses:
 *       200:
 *         description: Document generated successfully
 *       400:
 *         description: Template ID and data are required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/template',
  authenticate,
  documentController.generateFromTemplate
);

/**
 * @swagger
 * /api/documents/{documentId}/download:
 *   get:
 *     summary: Get a download URL for a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Download URL retrieved successfully
 *       400:
 *         description: Document ID is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:documentId/download',
  authenticate,
  documentController.getDownloadUrl
);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       400:
 *         description: Document ID is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/:documentId',
  authenticate,
  documentController.deleteDocument
);

export default router;