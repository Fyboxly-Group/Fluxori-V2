/**
 * Role Routes
 * Routes for managing roles and permissions in the multi-account architecture
 */
import { Router, Request, Response, NextFunction } from 'express';
import { RoleController } from '../controllers/role.controller';
import { 
  multiTenantAuthenticate, 
  requirePermission,
  logApiAccess
} from '../../../middleware/multi-tenant-auth.middleware';

const router = Router();
const roleController = new RoleController();

// Apply authentication to all routes
router.use(multiTenantAuthenticate);

// Apply API access logging middleware
router.use(logApiAccess);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles for the current organization
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No permission to access roles
 */
router.get(
  '/', 
  requirePermission(['role:read']), 
  roleController.getRoles.bind(roleController)
);

/**
 * @swagger
 * /api/roles/system:
 *   get:
 *     summary: Get all system-defined roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of system roles
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/system', 
  roleController.getSystemRoles.bind(roleController)
);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new custom role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *                 description: Role name
 *               description:
 *                 type: string
 *                 description: Role description
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of permission strings (resource:action)
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No permission to create roles
 */
router.post(
  '/', 
  requirePermission(['role:create']), 
  roleController.createRole.bind(roleController)
);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No permission to access this role
 *       404:
 *         description: Role not found
 */
router.get(
  '/:id', 
  requirePermission(['role:read']), 
  roleController.getRoleById.bind(roleController)
);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Role name
 *               description:
 *                 type: string
 *                 description: Role description
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of permission strings (resource:action)
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid input or attempt to modify system role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No permission to update roles
 *       404:
 *         description: Role not found
 */
router.put(
  '/:id', 
  requirePermission(['role:update']), 
  roleController.updateRole.bind(roleController)
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete a custom role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Cannot delete system role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No permission to delete roles
 *       404:
 *         description: Role not found
 */
router.delete(
  '/:id', 
  requirePermission(['role:delete']), 
  roleController.deleteRole.bind(roleController)
);

/**
 * @swagger
 * /api/roles/permissions/available:
 *   get:
 *     summary: Get all available permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all available permissions
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/permissions/available', 
  requirePermission(['role:read']), 
  roleController.getAvailablePermissions.bind(roleController)
);

/**
 * @swagger
 * /api/roles/user/{userId}:
 *   get:
 *     summary: Get a user's effective permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's effective permissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No permission to view user permissions
 *       404:
 *         description: User not found
 */
router.get(
  '/user/:userId', 
  requirePermission(['user:read', 'role:read']), 
  roleController.getUserPermissions.bind(roleController)
);

export default router;