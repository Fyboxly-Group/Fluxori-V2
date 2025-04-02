# TypeScript Analysis Report
  
## Summary

- Total TypeScript files: 463
- Files with @ts-nocheck: 406 (88%)
- Files with 'any' type usage: 193 (42%)
- Total 'any' type usages: 382
- Mongoose models: 33

## Files by Priority

- High priority: 96
- Medium priority: 367
- Low priority: 0

## Files by Type

- Controllers: 48
- Services: 62
- Models: 55
- Routes: 36
- Middleware: 6
- Utilities: 21
- Other: 235

## High Priority Fixes (75 files)

- src/modules/connections/models/connection.model.ts (model, 1 any types)
- src/models/warehouse.model.ts (model, 0 any types)
- src/models/user.model.ts (model, 1 any types)
- src/models/user.model.test.ts (model, 1 any types)
- src/models/task.model.ts (model, 0 any types)
- src/models/task.model.test.ts (model, 1 any types)
- src/models/system-status.model.test.ts (model, 1 any types)
- src/models/supplier.model.ts (model, 0 any types)
- src/models/supplier.model.test.ts (model, 1 any types)
- src/models/shipment.model.ts (model, 0 any types)
- src/models/shipment.model.test.ts (model, 1 any types)
- src/models/shipment-alert.model.test.ts (model, 1 any types)
- src/models/purchase-order.model.ts (model, 0 any types)
- src/models/purchase-order.model.test.ts (model, 1 any types)
- src/models/project.model.ts (model, 0 any types)
- src/models/project.model.test.ts (model, 1 any types)
- src/models/order.model.ts (model, 1 any types)
- src/models/milestone.model.ts (model, 0 any types)
- src/models/milestone.model.test.ts (model, 1 any types)
- src/models/inventory.model.ts (model, 0 any types)

... and 55 more

## Medium Priority Fixes (331 files)

- src/types/models/warehouse.types.ts (model, 3 any types)
- src/types/models/task.types.ts (model, 3 any types)
- src/types/models/shipment.types.ts (model, 2 any types)
- src/types/models/purchase-order.types.ts (model, 2 any types)
- src/types/models/project.types.ts (model, 2 any types)
- src/types/models/order.types.ts (model, 3 any types)
- src/types/models/milestone.types.ts (model, 3 any types)
- src/types/models/inventory.types.ts (model, 3 any types)
- src/types/models/international-trade.types.ts (model, 0 any types)
- src/types/models/index.ts (model, 0 any types)
- src/types/models/customer.types.ts (model, 2 any types)
- src/templates/model.template.ts (model, 0 any types)
- src/modules/xero-connector/models/xero-sync-status.model.ts (model, 0 any types)
- src/modules/xero-connector/models/xero-connection.model.ts (model, 0 any types)
- src/modules/xero-connector/models/xero-config.model.ts (model, 0 any types)
- src/modules/xero-connector/models/xero-account-mapping.model.ts (model, 0 any types)
- src/modules/product-ingestion/models/warehouse.model.ts (model, 0 any types)
- src/modules/product-ingestion/models/product.model.ts (model, 1 any types)
- src/modules/product-ingestion/models/product-sync-config.model.ts (model, 0 any types)
- src/modules/order-ingestion/models/order.model.ts (model, 1 any types)

... and 311 more

## Next Steps

1. Start with high priority model files
2. Then address high priority controllers
3. Fix route files
4. Work through services and middleware
5. Finally address utility and other files

See the JSON files in this directory for complete details on each file.
