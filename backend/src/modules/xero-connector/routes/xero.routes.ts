import { Router, Request, Response, NextFunction } from 'express';
import xeroAuthController from '../controllers/xero-auth.controller';
import xeroInvoiceController from '../controllers/xero-invoice.controller';
import xeroContactController from '../controllers/xero-contact.controller';
import xeroAccountController from '../controllers/xero-account.controller';
import xeroConfigController from '../controllers/xero-config.controller';
import xeroSyncController from '../controllers/xero-sync.controller';
import xeroWebhookController from '../controllers/xero-webhook.controller';
import { authenticate as authMiddleware } from '../../../middleware/auth.middleware';

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Xero
 *   description: Xero integration endpoints
 */

// ======= Auth Routes =======

/**
 * @swagger
 * /api/xero/auth/connect:
 *   get:
 *     summary: Initiate Xero OAuth flow
 *     tags: [Xero]
 *     parameters:
 *       - in: query;
 *         name: userId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: User ID
 *       - in: query;
 *         name: organizationId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Organization ID
 *       - in: query;
 *         name: redirectUrl;
 *         schema:
 *           type: string;
 *         description: URL to redirect to after successful authentication
 *     responses:
 *       302:
 *         description: Redirects to Xero authorization page
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.get('/auth/connect', xeroAuthController.initiateAuth);

/**
 * @swagger
 * /api/xero/auth/callback:
 *   get:
 *     summary: Handle callback from Xero OAuth flow
 *     tags: [Xero]
 *     parameters:
 *       - in: query;
 *         name: code;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Authorization code from Xero
 *       - in: query;
 *         name: state;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: State parameter from OAuth flow
 *     responses:
 *       302:
 *         description: Redirects to success page or specified redirect URL
 *       400:
 *         description: Invalid callback parameters
 *       500:
 *         description: Server error
 */
router.get('/auth/callback', xeroAuthController.handleCallback);

/**
 * @swagger
 * /api/xero/auth/success:
 *   get:
 *     summary: Success page after successful Xero authentication
 *     tags: [Xero]
 *     responses:
 *       200:
 *         description: HTML success page
 */
router.get('/auth/success', xeroAuthController.authSuccess);

/**
 * @swagger
 * /api/xero/auth/disconnect:
 *   post:
 *     summary: Disconnect Xero integration
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true;
 *       content:
 *         application/json:
 *           schema:
 *             type: object;
 *             required:
 *               - userId
 *               - organizationId
 *             properties:
 *               userId:
 *                 type: string;
 *               organizationId:
 *                 type: string;
 *     responses:
 *       200:
 *         description: Disconnected successfully
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.post('/auth/disconnect', authMiddleware, xeroAuthController.disconnect);

// ======= Invoice Routes =======

/**
 * @swagger
 * /api/xero/invoices/create:
 *   post:
 *     summary: Create a Xero invoice from Fluxori order data
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true;
 *       content:
 *         application/json:
 *           schema:
 *             type: object;
 *             required:
 *               - userId
 *               - organizationId
 *               - orderData
 *             properties:
 *               userId:
 *                 type: string;
 *               organizationId:
 *                 type: string;
 *               orderData:
 *                 type: object;
 *     responses:
 *       200:
 *         description: Invoice created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.post('/invoices/create', authMiddleware, xeroInvoiceController.createInvoice);

/**
 * @swagger
 * /api/xero/invoices/sync/{orderId}:
 *   post:
 *     summary: Sync an order to Xero(create invoice);
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path;
 *         name: orderId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order synced successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.post('/invoices/sync/:orderId', authMiddleware, xeroInvoiceController.syncOrderToXero);

// ======= Contact Routes =======

/**
 * @swagger
 * /api/xero/contacts:
 *   get:
 *     summary: Get contacts from Xero
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query;
 *         name: userId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: User ID
 *       - in: query;
 *         name: organizationId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Organization ID
 *       - in: query;
 *         name: page;
 *         schema:
 *           type: integer;
 *         description: Page number
 *       - in: query;
 *         name: pageSize;
 *         schema:
 *           type: integer;
 *         description: Page size
 *       - in: query;
 *         name: where;
 *         schema:
 *           type: string;
 *         description: Where clause for filtering
 *     responses:
 *       200:
 *         description: List of contacts
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.get('/contacts', authMiddleware, xeroContactController.getContacts);

/**
 * @swagger
 * /api/xero/contacts/{contactId}:
 *   get:
 *     summary: Get a specific contact by ID
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path;
 *         name: contactId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Xero contact ID
 *       - in: query;
 *         name: userId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: User ID
 *       - in: query;
 *         name: organizationId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Contact details
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.get('/contacts/:contactId', authMiddleware, xeroContactController.getContactById);

/**
 * @swagger
 * /api/xero/contacts:
 *   post:
 *     summary: Create a new contact in Xero
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true;
 *       content:
 *         application/json:
 *           schema:
 *             type: object;
 *             required:
 *               - userId
 *               - organizationId
 *               - contactData
 *             properties:
 *               userId:
 *                 type: string;
 *               organizationId:
 *                 type: string;
 *               contactData:
 *                 type: object;
 *     responses:
 *       201:
 *         description: Contact created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.post('/contacts', authMiddleware, xeroContactController.createContact);

/**
 * @swagger
 * /api/xero/contacts/{contactId}:
 *   put:
 *     summary: Update an existing contact in Xero
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path;
 *         name: contactId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Xero contact ID
 *     requestBody:
 *       required: true;
 *       content:
 *         application/json:
 *           schema:
 *             type: object;
 *             required:
 *               - userId
 *               - organizationId
 *               - contactData
 *             properties:
 *               userId:
 *                 type: string;
 *               organizationId:
 *                 type: string;
 *               contactData:
 *                 type: object;
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.put('/contacts/:contactId', authMiddleware, xeroContactController.updateContact);

/**
 * @swagger
 * /api/xero/contacts/sync/{customerId}:
 *   post:
 *     summary: Sync a Fluxori customer to Xero
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path;
 *         name: customerId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Fluxori customer ID
 *     requestBody:
 *       required: true;
 *       content:
 *         application/json:
 *           schema:
 *             type: object;
 *             required:
 *               - userId
 *               - organizationId
 *             properties:
 *               userId:
 *                 type: string;
 *               organizationId:
 *                 type: string;
 *     responses:
 *       200:
 *         description: Customer synced successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.post('/contacts/sync/:customerId', authMiddleware, xeroContactController.syncCustomerToXero);

// ======= Account Routes =======

/**
 * @swagger
 * /api/xero/accounts:
 *   get:
 *     summary: Get accounts from Xero
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query;
 *         name: userId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: User ID
 *       - in: query;
 *         name: organizationId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: List of accounts
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.get('/accounts', authMiddleware, xeroAccountController.getAccounts);

/**
 * @swagger
 * /api/xero/tax-rates:
 *   get:
 *     summary: Get tax rates from Xero
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query;
 *         name: userId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: User ID
 *       - in: query;
 *         name: organizationId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: List of tax rates
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.get('/tax-rates', authMiddleware, xeroAccountController.getTaxRates);

/**
 * @swagger
 * /api/xero/mappings/accounts:
 *   post:
 *     summary: Create account mapping
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true;
 *       content:
 *         application/json:
 *           schema:
 *             type: object;
 *             required:
 *               - xeroAccountId
 *               - xeroAccountCode
 *               - xeroAccountName
 *             properties:
 *               fluxoriCategoryId:
 *                 type: string;
 *               fluxoriCategory:
 *                 type: string;
 *               xeroAccountId:
 *                 type: string;
 *               xeroAccountCode:
 *                 type: string;
 *               xeroAccountName:
 *                 type: string;
 *               isDefault:
 *                 type: boolean;
 *     responses:
 *       201:
 *         description: Account mapping created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.post('/mappings/accounts', authMiddleware, xeroAccountController.createAccountMapping);

/**
 * @swagger
 * /api/xero/mappings/accounts:
 *   get:
 *     summary: Get account mappings
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query;
 *         name: categoryId;
 *         schema:
 *           type: string;
 *         description: Fluxori category ID
 *     responses:
 *       200:
 *         description: List of account mappings
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.get('/mappings/accounts', authMiddleware, xeroAccountController.getAccountMappings);

/**
 * @swagger
 * /api/xero/mappings/accounts/{mappingId}:
 *   delete:
 *     summary: Delete account mapping
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path;
 *         name: mappingId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Mapping ID
 *     responses:
 *       200:
 *         description: Account mapping deleted successfully
 *       401:
 *         description: Unauthorized;
 *       404:
 *         description: Account mapping not found
 *       500:
 *         description: Server error
 */
router.delete('/mappings/accounts/:mappingId', authMiddleware, xeroAccountController.deleteAccountMapping);

// ======= Config Routes =======

/**
 * @swagger
 * /api/xero/config:
 *   get:
 *     summary: Get Xero configuration
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xero configuration
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.get('/config', authMiddleware, xeroConfigController.getConfig);

/**
 * @swagger
 * /api/xero/config:
 *   put:
 *     summary: Update Xero configuration
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true;
 *       content:
 *         application/json:
 *           schema:
 *             type: object;
 *             properties:
 *               defaultAccountCode:
 *                 type: string;
 *               defaultTaxType:
 *                 type: string;
 *               autoSyncInvoices:
 *                 type: boolean;
 *               autoSyncContacts:
 *                 type: boolean;
 *               autoSyncPayments:
 *                 type: boolean;
 *               invoiceNumberPrefix:
 *                 type: string;
 *               invoiceTemplate:
 *                 type: string;
 *               defaultDueDays:
 *                 type: number;
 *     responses:
 *       200:
 *         description: Xero configuration updated successfully
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.put('/config', authMiddleware, xeroConfigController.updateConfig);

/**
 * @swagger
 * /api/xero/config/test:
 *   post:
 *     summary: Test Xero connection
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true;
 *       content:
 *         application/json:
 *           schema:
 *             type: object;
 *             required:
 *               - userId
 *               - organizationId
 *             properties:
 *               userId:
 *                 type: string;
 *               organizationId:
 *                 type: string;
 *     responses:
 *       200:
 *         description: Connection test result
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.post('/config/test', authMiddleware, xeroConfigController.testConnection);

// ======= Sync Routes =======

/**
 * @swagger
 * /api/xero/sync:
 *   post:
 *     summary: Start a sync operation
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true;
 *       content:
 *         application/json:
 *           schema:
 *             type: object;
 *             required:
 *               - userId
 *               - organizationId
 *               - syncType
 *             properties:
 *               userId:
 *                 type: string;
 *               organizationId:
 *                 type: string;
 *               syncType:
 *                 type: string;
 *                 enum: [full, invoices, contacts, payments, accounts, tax-rates]
 *     responses:
 *       200:
 *         description: Sync started successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.post('/sync', authMiddleware, xeroSyncController.startSync);

/**
 * @swagger
 * /api/xero/sync/status/{syncId}:
 *   get:
 *     summary: Get sync status
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path;
 *         name: syncId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Sync ID
 *     responses:
 *       200:
 *         description: Sync status
 *       401:
 *         description: Unauthorized;
 *       404:
 *         description: Sync operation not found
 *       500:
 *         description: Server error
 */
router.get('/sync/status/:syncId', authMiddleware, xeroSyncController.getSyncStatus);

/**
 * @swagger
 * /api/xero/sync/recent/{userId}:
 *   get:
 *     summary: Get recent sync operations
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path;
 *         name: userId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: User ID
 *       - in: query;
 *         name: limit;
 *         schema:
 *           type: integer;
 *         description: Number of records to return null;
 *     responses:
 *       200:
 *         description: List of recent sync operations
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.get('/sync/recent/:userId', authMiddleware, xeroSyncController.getRecentSyncs);

/**
 * @swagger
 * /api/xero/reports/reconciliation:
 *   get:
 *     summary: Get reconciliation status
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query;
 *         name: userId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: User ID
 *       - in: query;
 *         name: organizationId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Reconciliation status
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.get('/reports/reconciliation', authMiddleware, xeroSyncController.getReconciliationStatus);

// ======= Webhook Routes =======

/**
 * @swagger
 * /api/xero/webhooks:
 *   post:
 *     summary: Handle webhook notification from Xero
 *     tags: [Xero]
 *     parameters:
 *       - in: header;
 *         name: x-xero-signature
 *         required: true;
 *         schema:
 *           type: string;
 *         description: Signature from Xero
 *     requestBody:
 *       required: true;
 *       content:
 *         application/json:
 *           schema:
 *             type: object;
 *             properties:
 *               events:
 *                 type: array;
 *                 items:
 *                   type: object;
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         description: Server error
 */
router.post('/webhooks', xeroWebhookController.handleWebhook);

/**
 * @swagger
 * /api/xero/connection/{userId}:
 *   get:
 *     summary: Get Xero connection status for a user
 *     tags: [Xero]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path;
 *         name: userId;
 *         required: true;
 *         schema:
 *           type: string;
 *         description: User ID
 *     responses:
 *       200:
 *         description: Connection status
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized;
 *       500:
 *         description: Server error
 */
router.get('/connection/:userId', authMiddleware, xeroInvoiceController.getConnectionStatus);

export default router;