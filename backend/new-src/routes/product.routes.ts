/**
 * Product Routes
 * Defines routes for product management
 */
import { Router } from 'express';
import { container } from '@/config/container';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { ProductController, IProductController } from '@/controllers/product.controller';
import { productValidationSchema, productVariantValidationSchema } from '@/validation/product.schema';

const router = Router();
const productController = container.get<IProductController>(ProductController);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by categories
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [active, inactive, draft, archived, discontinued]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', authMiddleware, productController.getProducts.bind(productController));

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by categories
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [active, inactive, draft, archived, discontinued]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', authMiddleware, productController.searchProducts.bind(productController));

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: withVariants
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include variants in response
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', authMiddleware, productController.getProductById.bind(productController));

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Created product
 *       400:
 *         description: Invalid input
 */
router.post(
  '/',
  authMiddleware,
  validationMiddleware(productValidationSchema),
  productController.createProduct.bind(productController)
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Updated product
 *       404:
 *         description: Product not found
 */
router.put(
  '/:id',
  authMiddleware,
  validationMiddleware(productValidationSchema, { skipMissingProperties: true }),
  productController.updateProduct.bind(productController)
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/:id', authMiddleware, productController.deleteProduct.bind(productController));

/**
 * @swagger
 * /api/products/{id}/status:
 *   patch:
 *     summary: Update product status
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft, archived, discontinued]
 *     responses:
 *       200:
 *         description: Updated product
 *       404:
 *         description: Product not found
 */
router.patch(
  '/:id/status',
  authMiddleware,
  validationMiddleware({ status: { type: 'string', enum: ['active', 'inactive', 'draft', 'archived', 'discontinued'] } }),
  productController.updateProductStatus.bind(productController)
);

/**
 * @swagger
 * /api/products/{productId}/variants:
 *   get:
 *     summary: Get all variants for a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of variants
 *       404:
 *         description: Product not found
 */
router.get(
  '/:productId/variants',
  authMiddleware,
  productController.getProductVariants.bind(productController)
);

/**
 * @swagger
 * /api/products/{productId}/variants/{variantId}:
 *   get:
 *     summary: Get variant by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Variant details
 *       404:
 *         description: Product or variant not found
 */
router.get(
  '/:productId/variants/:variantId',
  authMiddleware,
  productController.getVariantById.bind(productController)
);

/**
 * @swagger
 * /api/products/{productId}/variants:
 *   post:
 *     summary: Create new variant
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariantCreate'
 *     responses:
 *       201:
 *         description: Created variant
 *       404:
 *         description: Product not found
 */
router.post(
  '/:productId/variants',
  authMiddleware,
  validationMiddleware(productVariantValidationSchema),
  productController.createVariant.bind(productController)
);

/**
 * @swagger
 * /api/products/{productId}/variants/{variantId}:
 *   put:
 *     summary: Update variant
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariantUpdate'
 *     responses:
 *       200:
 *         description: Updated variant
 *       404:
 *         description: Product or variant not found
 */
router.put(
  '/:productId/variants/:variantId',
  authMiddleware,
  validationMiddleware(productVariantValidationSchema, { skipMissingProperties: true }),
  productController.updateVariant.bind(productController)
);

/**
 * @swagger
 * /api/products/{productId}/variants/{variantId}:
 *   delete:
 *     summary: Delete variant
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Variant deleted
 *       404:
 *         description: Product or variant not found
 */
router.delete(
  '/:productId/variants/:variantId',
  authMiddleware,
  productController.deleteVariant.bind(productController)
);

export default router;