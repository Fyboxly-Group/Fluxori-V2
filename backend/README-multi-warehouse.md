# Multi-Warehouse Inventory Management

## Overview

This document provides an overview of the multi-warehouse inventory management system implemented in the Fluxori-V2 backend.

## Features

- **Warehouse Management**: Create, update, and manage multiple warehouses/locations
- **Per-Warehouse Inventory Tracking**: Track stock levels for each product across different warehouses
- **Stock Allocation**: Track allocated vs available stock in each warehouse
- **Warehouse-Specific Reorder Points**: Set different reorder points for the same product in different warehouses
- **Inventory Transfers**: Transfer inventory between warehouses with full tracking
- **Low Stock Alerts**: Generate alerts when stock falls below reorder points in any warehouse
- **Automated Reorder Point Checking**: Scheduled job to check inventory levels against reorder points
- **Warehouse Inventory Statistics**: Get detailed statistics for each warehouse

## Architecture

### Data Models

1. **Warehouse Model**
   - Stores information about physical warehouses or storage locations
   - Includes contact information, address details, and default status

2. **Inventory Stock Model**
   - Represents the relationship between inventory items and warehouses
   - Tracks quantity on hand, quantity allocated, and reorder points per warehouse
   - Includes warehouse-specific details like bin location

3. **Enhanced Inventory Alert Model**
   - Extended to include warehouse-specific details for alerts
   - Helps identify which warehouse has stock issues

### Components

1. **Warehouse Controller**
   - Handles CRUD operations for warehouses
   - Provides endpoints for getting warehouse inventory and statistics

2. **Inventory Stock Controller**
   - Manages stock levels across warehouses
   - Handles inventory transfers between warehouses
   - Provides enhanced low stock detection across warehouses

3. **Inventory Reorder Check Service**
   - Periodically checks stock levels against reorder points
   - Creates alerts when stock falls below thresholds
   - Runs on a configurable schedule

## Setup and Migration

To set up the multi-warehouse inventory system:

1. Run the initialization script:
   ```
   $ node setup-multi-warehouse.js
   ```

   This script:
   - Creates a default warehouse if none exists
   - Migrates existing inventory data to the multi-warehouse structure
   - Sets up the reorder point check scheduler

2. To generate test data, run:
   ```
   $ npx ts-node src/scripts/seed-multi-warehouse-data.ts
   ```

## API Documentation

See the [Multi-Warehouse API Documentation](./docs/multi-warehouse-api.md) for detailed information about the available endpoints.

## Scheduler Configuration

The inventory reorder check scheduler runs every 6 hours by default. You can configure this in the `.env` file:

```
INVENTORY_REORDER_CHECK_CRON="0 */6 * * *"
```

## Backward Compatibility

The multi-warehouse system maintains backward compatibility with the existing single-warehouse implementation:

- The legacy inventory endpoints continue to work but now use the default warehouse
- The original `stockQuantity` field on inventory items is maintained as a sum of quantities across all warehouses
- Existing code that uses the inventory API should continue to function without changes

## Frontend Integration

To integrate with the frontend:

1. Update inventory-related components to show warehouse information
2. Add warehouse selection dropdowns for inventory operations
3. Create warehouse management screens for admins
4. Enhance inventory reports to show per-warehouse breakdowns

## Troubleshooting

If you encounter issues with the multi-warehouse system:

1. Check that warehouses are properly created in the database
2. Ensure the migration script has run successfully
3. Verify that inventory stock records exist for your products
4. Check that the scheduler is running and creating alerts when needed