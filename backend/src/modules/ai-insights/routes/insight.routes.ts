import { Router } from 'express';
import { InsightController } from '../controllers/insight.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();
const controller = new InsightController();

/**
 * @swagger
 * /api/ai-insights/insight:
 *   get:
 *     tags:
 *       - ai-insights
 *     summary: Get insight data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authMiddleware, (req, res, next) => controller.getAll(req, res, next));

/**
 * @swagger
 * /api/ai-insights/insight/{id}:
 *   get:
 *     tags:
 *       - ai-insights
 *     summary: Get insight by ID
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
router.get('/:id', authMiddleware, (req, res, next) => controller.getById(req, res, next));

export default router;
