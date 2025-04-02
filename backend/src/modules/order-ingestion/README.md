# Order Ingestion Service

This service receives raw order data from various marketplaces, standardizes it into Fluxori's internal order format, stores it durably, and triggers relevant downstream actions like creating Xero invoices.

## Features

- Receives order data from the Sync Orchestrator
- Maps marketplace-specific order formats to Fluxori's standardized format
- Efficiently checks for duplicate orders
- Updates existing orders with new information
- Stores orders in MongoDB
- Triggers Xero invoice creation for completed orders
- Handles errors gracefully

## Architecture

### Core Components

- **Order Model**: Defines the standardized order schema for MongoDB
- **Order Mappers**: Marketplace-specific converters for order data
- **Ingestion Service**: Processes, transforms, and stores orders
- **Xero Integration**: Creates invoices for completed orders

### Order Lifecycle

1. Raw orders received from Sync Orchestrator
2. Marketplace-specific mapper transforms raw data to standard format
3. Duplicate check (by marketplaceId, marketplaceOrderId, userId, orgId)
4. New orders created or existing orders updated
5. Orders with specific statuses trigger Xero invoice creation
6. Results logged for monitoring

## Usage

```typescript
import { orderIngestionService } from './modules/order-ingestion';

// Process orders from a marketplace
await orderIngestionService.processOrders(
  marketplaceOrders, // Array of marketplace orders
  userId,
  organizationId,
  marketplaceId
);
```

## Order Status Flow

Orders typically flow through statuses:
1. `NEW` - Initial order received
2. `PROCESSING` - Order being prepared
3. `SHIPPED` - Order shipped to customer
4. `DELIVERED` - Order delivered to customer
5. `COMPLETED` - Order fulfillment complete

Xero invoices are created when orders reach the `SHIPPED`, `DELIVERED`, or `COMPLETED` status and have a `PAID` payment status.

## Xero Integration

The service integrates with the Xero Connector service to create invoices:

1. Checks if order status meets criteria for invoice creation
2. Formats order data into Xero invoice format
3. Calls the Xero connector to create the invoice
4. Records the result on the order (invoiceId, status, etc.)

## Extension

### Adding Support for New Marketplaces

To add support for a new marketplace:

1. Create a new mapper class implementing `IOrderMapper`
2. Register the mapper in `mappers/index.ts`
3. No changes needed to the ingestion service itself

### Adding New Downstream Actions

To add new actions triggered by orders:

1. Create a new service for the action
2. Add logic to the ingestion service to trigger the action based on order status
3. Update the order schema if new fields are needed