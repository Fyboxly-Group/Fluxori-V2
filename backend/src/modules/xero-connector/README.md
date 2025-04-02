# Xero Connector Module

The Xero Connector module provides comprehensive integration with the Xero accounting platform, allowing Fluxori to synchronize contacts, invoices, payments, and accounting data with Xero.

## Features

- OAuth 2.0 authentication with Xero
- Automatic token refresh management
- Sales invoice creation from Fluxori orders
- Customer contact synchronization
- Account code mapping for proper financial integration
- Multi-tenant support (connecting different Xero organizations)
- Secure storage of authentication credentials
- Webhook processing for real-time updates
- Bulk synchronization operations with progress tracking
- Reconciliation and reporting

## Architecture

The module is organized into the following components:

### Models

- `XeroConnection` - Stores the connection details between a Fluxori user/organization and a Xero tenant, including encrypted refresh tokens.
- `XeroConfig` - Stores configuration settings for the Xero integration, such as default account codes and sync preferences.
- `XeroAccountMapping` - Maps Fluxori product categories to Xero account codes for proper financial categorization.
- `XeroSyncStatus` - Tracks the status and progress of synchronization operations.

### Services

- `xero-auth.service.ts` - Handles OAuth 2.0 authentication flow with Xero, including token management and refresh.
- `xero-invoice.service.ts` - Manages the creation and updating of Xero invoices from Fluxori order data.
- `xero-contact.service.ts` - Manages Xero contacts and synchronization with Fluxori customers.
- `xero-account.service.ts` - Handles account code operations and tax rate management with Xero.
- `xero-sync.service.ts` - Orchestrates the synchronization process between Fluxori and Xero.
- `xero-bulk-sync.service.ts` - Performs bulk synchronization operations with progress tracking.
- `xero-config.service.ts` - Manages configuration settings for the Xero integration.
- `xero-webhook.service.ts` - Processes webhooks from Xero for real-time updates.

### Controllers

- `xero-auth.controller.ts` - Handles HTTP requests related to Xero authentication.
- `xero-invoice.controller.ts` - Handles HTTP requests related to Xero invoice operations.
- `xero-contact.controller.ts` - Handles HTTP requests related to Xero contact operations.
- `xero-account.controller.ts` - Handles HTTP requests related to Xero account operations.
- `xero-config.controller.ts` - Handles HTTP requests related to configuration settings.
- `xero-sync.controller.ts` - Handles HTTP requests related to synchronization operations.
- `xero-webhook.controller.ts` - Handles incoming webhook requests from Xero.

### Routes

- `xero.routes.ts` - Defines all API routes for the Xero connector module.

## Setup

### Environment Variables

Add the following environment variables to your `.env` file:

```
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
XERO_REDIRECT_URI=http://your-app-domain/api/xero/auth/callback
XERO_WEBHOOK_KEY=your_xero_webhook_key
ENCRYPTION_KEY=a-very-secure-32-char-encryption-key
```

### Integration Points

The Xero connector integrates with the following Fluxori systems:

1. **Authentication System** - For validating and identifying users making Xero API requests.
2. **Order Management System** - To access order data for creating Xero invoices.
3. **Customer Management System** - To map Fluxori customers to Xero contacts.
4. **Product Catalog** - To map products to appropriate Xero account codes.
5. **Event System** - For triggering invoice creation when orders are completed.

## Usage

### Authentication

#### Connecting to Xero

1. Redirect users to `/api/xero/auth/connect?userId=<userId>&organizationId=<orgId>` to initiate the OAuth flow.
2. After authorization, users will be redirected back to the application with their Xero connection established.
3. Check connection status with `/api/xero/auth/status`.
4. Disconnect from Xero with `/api/xero/auth/disconnect`.

### Invoice Management

#### Creating Invoices

Create invoices in Xero by either:

1. Manually calling `/api/xero/invoices/create` with order data.
2. Automatically syncing an order with `/api/xero/invoices/sync/:orderId`.
3. Retrieving invoice details with `/api/xero/invoices/:invoiceId`.

#### Automatic Invoice Creation

Invoices can be automatically created when orders are marked as "shipped" or "delivered" using the order hooks utility.

### Contact Management

1. Sync Fluxori customers to Xero with `/api/xero/contacts/sync/:customerId`.
2. Get a list of contacts from Xero with `/api/xero/contacts`.
3. Get contact details with `/api/xero/contacts/:contactId`.
4. Create or update contacts with `/api/xero/contacts/create` or `/api/xero/contacts/:contactId`.

### Account Management

1. Get a list of accounts from Xero with `/api/xero/accounts`.
2. Configure account mappings with `/api/xero/accounts/mapping`.
3. Get tax rates from Xero with `/api/xero/accounts/tax-rates`.

### Configuration

1. Get or update Xero integration settings with `/api/xero/config`.
2. Configure automatic sync options with `/api/xero/config/sync-options`.

### Bulk Synchronization

1. Start a bulk sync operation with `/api/xero/sync/bulk`.
2. Check sync status with `/api/xero/sync/status/:syncId`.
3. Get reconciliation report with `/api/xero/sync/reconciliation`.

### Webhooks

1. Set up Xero webhooks to point to `/api/xero/webhooks`.
2. View webhook event history with `/api/xero/webhooks/events`.

## Security Considerations

This module implements several security best practices:

- Refresh tokens are encrypted at rest using AES-256-CBC.
- Access tokens are never stored in the database, only generated as needed.
- OAuth state parameter validation to prevent CSRF attacks.
- Webhook signature validation to ensure requests come from Xero.
- Authorization middleware to restrict API access to authenticated users.
- Tenant-based access controls to prevent cross-tenant data access.

## Testing

The module includes comprehensive test coverage:

- Unit tests for all service methods
- Integration tests for the authentication flow
- Mocked Xero API responses to test error handling

Run tests with:

```
npm test -- --testPathPattern=xero-connector
```

## Monitoring and Debugging

The module includes logging at key points in the integration:

- Authentication events
- API request/response errors
- Webhook processing
- Synchronization progress

## Future Enhancements

Potential future improvements to the module:

1. Support for additional Xero API features (purchase orders, credit notes).
2. Real-time dashboard for monitoring sync status and reconciliation.
3. Advanced mapping for custom fields between Fluxori and Xero.
4. Support for multiple Xero organizations per Fluxori user.
5. Support for Xero invoice reminders and payment services.