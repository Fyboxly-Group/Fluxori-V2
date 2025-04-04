import { Router } from 'express';
import { Container } from 'inversify';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { authenticate } from '../middleware/auth.middleware';
import { IUserController, IUserService } from '../types/user-management';

const router = Router();

// Setup dependency injection container
const container = new Container();
container.bind<IUserService>(UserService).to(UserService).inSingletonScope();
container.bind<IUserController>(UserController).to(UserController).inSingletonScope();

// Create controller instance with DI
const userController = container.get<IUserController>(UserController);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Not authorized
 */
router.get('/', authenticate, userController.getAllUsers.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, userController.getUserById.bind(userController));

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user, guest]
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Not authorized
 */
router.post('/', authenticate, userController.createUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user, guest]
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.put('/:id', authenticate, userController.updateUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, userController.deleteUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     summary: Activate a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User activated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.patch('/:id/activate', authenticate, userController.activateUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated
 *       400:
 *         description: Cannot deactivate your own account
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.patch('/:id/deactivate', authenticate, userController.deactivateUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Change a user's role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user, guest]
 *     responses:
 *       200:
 *         description: User role updated
 *       400:
 *         description: Invalid role or cannot demote your own admin role
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', authenticate, userController.changeUserRole.bind(userController));

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Reset a user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User password reset
 *       400:
 *         description: Invalid password
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.post('/:id/reset-password', authenticate, userController.resetUserPassword.bind(userController));

/**
 * @swagger
 * /api/users/{id}/organizations:
 *   get:
 *     summary: Get organizations a user belongs to
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's organizations
 *       403:
 *         description: Not authorized
 */
router.get('/:id/organizations', authenticate, userController.getUserOrganizations.bind(userController));

export { router as userRoutes };