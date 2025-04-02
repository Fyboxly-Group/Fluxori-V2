# Secure Marketplace Connection Management

This document outlines the implementation of secure marketplace connection management in Fluxori-V2.

## Overview

The connection management system allows users to securely store and manage their marketplace credentials (API keys, tokens, etc.) for various integrations including:

- Takealot
- Amazon
- Shopify
- Xero

## Security Implementation

The system provides two options for storing sensitive credentials:

### 1. Google Cloud Secret Manager (Recommended)

When `USE_SECRET_MANAGER=true` in the environment:

- Credentials are stored in GCP Secret Manager
- Each connection gets a unique Secret
- Only the secret reference ID is stored in the database
- The system uses GCP IAM for access control

### 2. Encrypted Database Storage (Fallback)

When Secret Manager is not available:

- Credentials are encrypted using AES-256-GCM
- A secure encryption key is stored in the environment
- The encrypted credentials are stored in the database
- Each encrypted string includes IV and auth tag for security

## Backend Components

### Models

- `MarketplaceConnection` - Stores connection metadata and credential references
- Includes support for different authentication types (API key, OAuth, etc.)
- Stores status, last sync time, and error information

### Services

- `SecretManagerService` - Handles storing/retrieving credentials securely
- `ConnectionService` - Manages connection creation, listing, testing and deletion

### API Endpoints

- `POST /api/connections` - Create a new connection
- `GET /api/connections` - List all connections for the user
- `GET /api/connections/:id` - Get details of a specific connection
- `DELETE /api/connections/:id` - Delete a connection
- `POST /api/connections/:id/test` - Test a connection

## Frontend Components

### API Service

- `connections.api.ts` - Client-side API methods

### React Components

- `ConnectionList` - Displays all connections with status
- `ConnectionForm` - Form for adding new connections
- `IntegrationsPage` - Page that combines everything

### React Query Hooks

- `useConnections` - Hook for managing connections state and operations

## Integration with Marketplace Adapters

The `getMarketplaceCredentials` function provides a standardized way for marketplace adapters to securely access credentials:

```typescript
const credentials = await getMarketplaceCredentials(userId, organizationId, marketplaceId);
```

## Security Considerations

1. Credentials are never exposed in API responses
2. Secret Manager provides strong access controls
3. Database encryption uses AES-256-GCM with unique IVs
4. OAuth state validation prevents CSRF attacks
5. All connections are scoped to user/organization
6. Error messages don't expose sensitive information

## Environment Variables

```
# Google Cloud Configuration
GCP_PROJECT_ID=your-gcp-project-id

# Secret Manager Configuration
USE_SECRET_MANAGER=true  # Set to false to use database encryption instead

# Encryption Key (only used if not using Secret Manager)
ENCRYPTION_KEY=your_32_char_encryption_key_here
```

## Deployment Instructions

1. Ensure GCP Secret Manager API is enabled in your project
2. Configure appropriate service account permissions
3. Set environment variables
4. Run database migrations

## Testing the Implementation

1. Unit tests for services and controllers
2. Integration tests for API endpoints
3. Frontend component tests
4. Security review recommended