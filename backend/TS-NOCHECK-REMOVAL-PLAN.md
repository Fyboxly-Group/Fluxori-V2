# TypeScript @ts-nocheck Removal Plan

Generated: 2025-04-02T07:10:58.078Z

## Overview

This plan outlines the incremental removal of 23 `@ts-nocheck` directives from the codebase.

## Approach

1. Start with the simplest files first
2. Focus on one module at a time
3. Run TypeScript validator after each file is fixed
4. Update tests as needed

## Phase 1: Simple Files (Low Complexity)

### Module: types

| File | Lines | Types | Complexity |
|------|-------|-------|------------|
| src/types/models/international-trade.types.ts | 27 | 0 | 37 |
| src/types/models/purchase-order.types.ts | 29 | 2 | 45 |
| src/types/models/shipment.types.ts | 30 | 2 | 46 |
| src/types/models/project.types.ts | 30 | 2 | 46 |
| src/types/models/customer.types.ts | 30 | 2 | 46 |
| src/types/models/warehouse.types.ts | 31 | 3 | 50 |
| src/types/models/task.types.ts | 31 | 3 | 50 |
| src/types/models/order.types.ts | 31 | 3 | 50 |
| src/types/models/milestone.types.ts | 31 | 3 | 50 |
| src/types/models/inventory.types.ts | 31 | 3 | 50 |
| src/types/utils/mongoose-document.ts | 44 | 2 | 60 |
| src/types/express-extensions.ts | 47 | 0 | 63 |
| src/types/mongo-util-types.ts | 43 | 2 | 65 |
| src/types/utils/mongodb.ts | 52 | 2 | 68 |

## Phase 2: Medium Complexity Files

### Module: types

| File | Lines | Types | Complexity |
|------|-------|-------|------------|
| src/types/scheduler-mock.ts | 154 | 7 | 189 |
| src/types/promise-utils.ts | 168 | 9 | 225 |

### Module: buybox

| File | Lines | Types | Complexity |
|------|-------|-------|------------|
| src/modules/buybox/services/base-buybox-monitor.ts | 246 | 0 | 260 |

## Phase 3: Complex Files (Require Extensive Work)

### Module: types

| File | Lines | Types | Complexity |
|------|-------|-------|------------|
| src/types/api/responses.ts | 178 | 21 | 281 |

### Module: buybox

| File | Lines | Types | Complexity |
|------|-------|-------|------------|
| src/modules/buybox/repositories/buybox-history.repository.ts | 320 | 4 | 342 |
| src/modules/buybox/services/amazon-buybox-monitor.ts | 343 | 0 | 353 |
| src/modules/buybox/services/takealot-buybox-monitor.ts | 363 | 0 | 373 |
| src/modules/buybox/services/buybox-monitoring.service.ts | 557 | 0 | 579 |

### Module: middleware

| File | Lines | Types | Complexity |
|------|-------|-------|------------|
| src/middleware/multi-tenant-auth.middleware.ts | 426 | 3 | 461 |

## Next Steps

1. Start with Phase 1 files from the international-trade module
2. Remove @ts-nocheck directive from each file
3. Fix TypeScript errors one by one
4. Run TypeScript validator to confirm fixes
5. Move to the next file

## Common Fixes

- Replace `any` with proper type definitions
- Add proper parameter and return types to functions
- Fix error handling patterns as shown in international-trade.service.ts
- Add interfaces for complex objects
- Use type guards for conditional logic
