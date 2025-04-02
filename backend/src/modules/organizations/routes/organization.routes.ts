/**
 * Organization Routes
 * Routes for managing organizations in the multi-account architecture
 */
import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { 
  multiTenantAuthenticate, 
  requirePermission, 
  requireOrganizationOwner,
  requireSystemAdmin,
  logApiAccess
} from '../../../middleware/multi-tenant-auth.middleware';

const router = Router();
const organizationController = new OrganizationController();

// Apply authentication to all routes
router.use(multiTenantAuthenticate);

// Apply API access logging middleware
router.use(logApiAccess);

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Get all organizations the user has access to
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations the user has access to
 *       401:
 *         description: Unauthorized
 */
router.get('/', organizationController.getUserOrganizations.bind(organizationController));

/**
 * @swagger
 * /api/organizations/hierarchy:
 *   get:
 *     summary: Get organization hierarchy for the current organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization hierarchy including ancestors and children
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/hierarchy', 
  requirePermission(['organization:read']), 
  organizationController.getOrganizationHierarchy.bind(organizationController)
);

/**
 * @swagger
 * /api/organizations/child-organizations:
 *   get:
 *     summary: Get direct child organizations of the current organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of child organizations
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/child-organizations', 
  requirePermission(['organization:read']), 
  organizationController.getChildOrganizations.bind(organizationController)
);

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
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
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Organization name
 *               type:
 *                 type: string
 *                 enum: [BASIC, PROFESSIONAL, ENTERPRISE, AGENCY]
 *                 description: Organization type
 *               parentOrganizationId:
 *                 type: string
 *                 description: Parent organization ID (for agency-client relationships)
 *               settings:
 *                 type: object
 *                 description: Organization settings
 *               metadata:
 *                 type: object
 *                 description: Additional organization metadata
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No permission to create organizations
 */
router.post(
  '/', 
  requirePermission(['organization:create']), 
  organizationController.createOrganization.bind(organizationController)
);

/**
 * @swagger
 * /api/organizations/client:
 *   post:
 *     summary: Create a new client organization (Agency only)
 *     tags: [Organizations]
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
 *               - type
 *               - ownerEmail
 *             properties:
 *               name:
 *                 type: string
 *                 description: Client organization name
 *               type:
 *                 type: string
 *                 enum: [BASIC, PROFESSIONAL, ENTERPRISE]
 *                 description: Client organization type
 *               ownerEmail:
 *                 type: string
 *                 description: Email of the client organization owner
 *               settings:
 *                 type: object
 *                 description: Organization settings
 *               metadata:
 *                 type: object
 *                 description: Additional organization metadata
 *     responses:
 *       201:
 *         description: Client organization created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Agency permission required
 */
router.post(
  '/client', 
  requirePermission(['organization:createClient']), 
  organizationController.createClientOrganization.bind(organizationController)
);

/**
 * @swagger
 * /api/organizations/current:
 *   get:
 *     summary: Get current organization details
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current organization details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Organization not found
 */
router.get(
  '/current', 
  organizationController.getCurrentOrganization.bind(organizationController)
);

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No permission to access this organization
 *       404:
 *         description: Organization not found
 */
router.get(
  '/:id', 
  organizationController.getOrganizationById.bind(organizationController)
);

/**
 * @swagger
 * /api/organizations/{id}:
 *   put:
 *     summary: Update organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Organization name
 *               settings:
 *                 type: object
 *                 description: Organization settings
 *               metadata:
 *                 type: object
 *                 description: Additional organization metadata
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No permission to update this organization
 *       404:
 *         description: Organization not found
 */
router.put(
  '/:id', 
  requirePermission(['organization:update']), 
  organizationController.updateOrganization.bind(organizationController)
);

/**
 * @swagger
 * /api/organizations/{id}/type:
 *   put:
 *     summary: Update organization type (System Admin only)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [BASIC, PROFESSIONAL, ENTERPRISE, AGENCY]
 *                 description: Organization type
 *     responses:
 *       200:
 *         description: Organization type updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - System Admin access required
 *       404:
 *         description: Organization not found
 */
router.put(
  '/:id/type', 
  requireSystemAdmin, 
  organizationController.updateOrganizationType.bind(organizationController)
);

/**
 * @swagger
 * /api/organizations/{id}:
 *   delete:
 *     summary: Delete organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No permission to delete this organization
 *       404:
 *         description: Organization not found
 */
router.delete(
  '/:id', 
  requireOrganizationOwner, 
  organizationController.deleteOrganization.bind(organizationController)
);

/**
 * @swagger
 * /api/organizations/{id}/transfer-ownership:
 *   post:
 *     summary: Transfer organization ownership
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newOwnerId
 *             properties:
 *               newOwnerId:
 *                 type: string
 *                 description: User ID of the new owner
 *     responses:
 *       200:
 *         description: Ownership transferred successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Organization owner permission required
 *       404:
 *         description: Organization or user not found
 */
router.post(
  '/:id/transfer-ownership', 
  requireOrganizationOwner, 
  organizationController.transferOwnership.bind(organizationController)
);

export default router;