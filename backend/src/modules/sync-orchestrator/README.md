# Marketplace Synchronization Orchestration Service

This module provides a service that orchestrates the periodic synchronization of data (orders and products/inventory) from connected marketplaces into Fluxori.

## Features

- Automatically identifies all active marketplace connections across all users/organizations
- Securely retrieves marketplace credentials
- Instantiates the appropriate marketplace adapter based on the marketplace ID
- Fetches new/updated data incrementally since the last sync
- Passes fetched data to dedicated ingestion services for processing and storage
- Updates connection records with sync status and timestamps
- Handles errors gracefully without stopping the entire sync cycle for other connections
- Provides APIs for manual sync triggering and service management

## Architecture

The Sync Orchestrator follows a service-oriented architecture:

1. **Core Service**: `SyncOrchestratorService` - Singleton service that manages the sync process
2. **Controller**: `SyncOrchestratorController` - Handles API endpoints for service management
3. **Routes**: Exposes RESTful endpoints for controlling the service
4. **Marketplace Adapters**: Implements the `IMarketplaceAdapter` interface with `fetchOrders` and `fetchProducts` methods
5. **Ingestion Services**: External services (from Prompts 21 & 22) that process and store the fetched data

## Usage

### Starting the Service

```typescript
import syncOrchestratorService from './modules/sync-orchestrator';
import orderIngestionService from './modules/order-ingestion';
import productIngestionService from './modules/product-ingestion';

// Initialize with required dependencies
syncOrchestratorService.initialize(
  orderIngestionService,
  productIngestionService
);

// Start the service with default interval
syncOrchestratorService.start();
```

### API Endpoints

- `GET /api/sync/status` - Get current sync status
- `POST /api/sync/start` - Start the sync service
- `POST /api/sync/stop` - Stop the sync service
- `POST /api/sync/interval` - Update sync interval
- `POST /api/sync/trigger` - Trigger sync for specific connections
- `POST /api/sync/run-full` - Force a full sync cycle

## Scheduling Options

### Development

For development, the service uses a simple `setInterval` scheduler that runs within the server process.

### Production

For production, the service can be integrated with GCP Cloud Scheduler to trigger a Cloud Function or Cloud Run service. See `utils/cloud-scheduler-setup.ts` for an example implementation.

## Error Handling

The service implements robust error handling:
- Errors during individual connection syncs are logged and tracked against the specific connection
- The sync process continues for other connections even if one fails
- Connection records are updated with error information for debugging

## Future Enhancements

1. **Queue-based Architecture**: Migrate to a queue-based approach for better scalability
2. **Rate Limiting**: Add global rate limit awareness across all sync operations
3. **Webhook Support**: Add support for webhook-based sync triggers from marketplaces
4. **Performance Metrics**: Add detailed performance monitoring