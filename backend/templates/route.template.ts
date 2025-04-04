import { Router } from 'express';
import { container } from '../../config/inversify';
import { EntityNameController } from '../controllers/entityName.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validationMiddleware } from '../../middleware/validation.middleware';
import { CreateEntityNameSchema, UpdateEntityNameSchema } from '../schemas/entityName.schema';

/**
 * EntityName routes
 * Handles all API requests for entityName resources
 * @swagger
 * tags:
 *   name: EntityNames
 *   description: EntityName management
 */
const router = Router();
const controller = container.resolve(EntityNameController);

/**
 * @swagger
 * /api/{{entityName}}s:
 *   get:
 *     summary: Get all {{entityName}}s
 *     tags: [{{EntityName}}s]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of {{entityName}}s to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, archived, all]
 *           default: active
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or description
 *     responses:
 *       200:
 *         description: A list of {{entityName}}s
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/{{EntityName}}'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get('/', authMiddleware, (req, res, next) => controller.getAll(req, res, next));

/**
 * @swagger
 * /api/{{entityName}}s/{id}:
 *   get:
 *     summary: Get {{entityName}} by ID
 *     tags: [{{EntityName}}s]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: {{EntityName}} ID
 *     responses:
 *       200:
 *         description: {{EntityName}} details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/{{EntityName}}'
 *       404:
 *         description: {{EntityName}} not found
 */
router.get('/:id', authMiddleware, (req, res, next) => controller.getById(req, res, next));

/**
 * @swagger
 * /api/{{entityName}}s:
 *   post:
 *     summary: Create a new {{entityName}}
 *     tags: [{{EntityName}}s]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Create{{EntityName}}'
 *     responses:
 *       201:
 *         description: {{EntityName}} created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/{{EntityName}}'
 */
router.post(
  '/', 
  [authMiddleware, validationMiddleware(CreateEntityNameSchema)], 
  (req, res, next) => controller.create(req, res, next)
);

/**
 * @swagger
 * /api/{{entityName}}s/{id}:
 *   put:
 *     summary: Update {{entityName}} by ID
 *     tags: [{{EntityName}}s]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: {{EntityName}} ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Update{{EntityName}}'
 *     responses:
 *       200:
 *         description: {{EntityName}} updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/{{EntityName}}'
 *       404:
 *         description: {{EntityName}} not found
 */
router.put(
  '/:id', 
  [authMiddleware, validationMiddleware(UpdateEntityNameSchema)], 
  (req, res, next) => controller.update(req, res, next)
);

/**
 * @swagger
 * /api/{{entityName}}s/{id}:
 *   delete:
 *     summary: Delete {{entityName}} by ID
 *     tags: [{{EntityName}}s]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: {{EntityName}} ID
 *     responses:
 *       200:
 *         description: {{EntityName}} deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: {{EntityName}} not found
 */
router.delete('/:id', authMiddleware, (req, res, next) => controller.remove(req, res, next));

export default router;