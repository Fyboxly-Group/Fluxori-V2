# TypeScript Migration Action Plan
  
This document outlines the action plan for fixing the remaining TypeScript errors in the Fluxori-V2 backend codebase.

## Overview

We've identified 180 files that still contain `@ts-nocheck` pragmas. This document outlines a structured approach for systematically addressing these files.

## Prioritized Modules

### Core (1 files)
    
**Description:** Fix core application files with proper Express typing

**Priority:** High
**Estimated Effort:** Medium
**Automation Script:** `fix-core-app.js`

**Approach:**
- Create middleware type definitions
- Improve express-extensions.ts with comprehensive Request/Response types
- Fix app.ts with proper middleware typing
- Add proper error handler typing

**Files to Fix:**
- `src/app.ts`

### Models (21 files)
    
**Description:** Fix model files with proper Mongoose schema typing

**Priority:** High
**Estimated Effort:** High
**Automation Script:** `fix-models.js`

**Approach:**
- Create standardized model type patterns
- Fix Document interface extensions
- Implement consistent approach for schema methods
- Add proper virtuals typing
- Fix pre/post hooks with correct this typing

**Files to Fix:**
- `src/modules/marketplaces/models/marketplace.models.ts`
- `src/models/inventory.model.test.ts`
- `src/models/order.model.ts`
- `src/models/customer.model.test.ts`
- `src/models/shipment.model.test.ts`
- `src/models/shipment.model.ts`
- `src/models/inventory-stock.model.ts`
- `src/models/project.model.test.ts`
- `src/models/activity.model.test.ts`
- `src/models/purchase-order.model.test.ts`
- `src/models/task.model.ts`
- `src/models/inventory.model.ts`
- `src/models/shipment-alert.model.test.ts`
- `src/models/task.model.test.ts`
- `src/models/supplier.model.test.ts`
- `src/models/milestone.model.test.ts`
- `src/models/user.model.test.ts`
- `src/models/system-status.model.test.ts`
- `src/models/inventory-alert.model.test.ts`
- `src/models/system-status.model.ts`
- `src/models/activity.model.ts`

### Controllers (18 files)
    
**Description:** Fix controller files with proper Express request typing

**Priority:** High
**Estimated Effort:** Medium
**Automation Script:** `fix-controllers.js`

**Approach:**
- Implement consistent AuthenticatedRequest usage
- Improve request and response typing
- Add proper parameter validation with type guards
- Fix error handling patterns

**Files to Fix:**
- `src/controllers/inventory.controller.test.ts`
- `src/controllers/task.controller.ts`
- `src/controllers/inventory-alert.controller.ts`
- `src/controllers/analytics.controller.ts`
- `src/controllers/task.controller.test.ts`
- `src/controllers/customer.controller.test.ts`
- `src/controllers/auth.controller.ts`
- `src/controllers/milestone.controller.test.ts`
- `src/controllers/dashboard.controller.test.ts`
- `src/controllers/example.controller.ts`
- `src/controllers/inventory-alert.controller.test.ts`
- `src/controllers/auth.controller.test.ts`
- `src/controllers/analytics.controller.test.ts`
- `src/controllers/project.controller.test.ts`
- `src/controllers/webhook.controller.ts`
- `src/controllers/shipment.controller.test.ts`
- `src/controllers/upload.controller.ts`
- `src/controllers/upload.controller.test.ts`

### Services (8 files)
    
**Description:** Fix service files with proper typing

**Priority:** Medium
**Estimated Effort:** Medium
**Automation Script:** `fix-services.js`

**Approach:**
- Add proper dependency injection typing
- Fix service method return types
- Implement consistent error handling patterns
- Fix Promise handling with proper typing

**Files to Fix:**
- `src/services/storage.service.ts`
- `src/services/storage.service.test.ts`
- `src/services/example.service.ts`
- `src/services/seed.service.test.ts`
- `src/services/system-status.service.test.ts`
- `src/services/activity.service.test.ts`
- `src/services/seed.service.ts`
- `src/services/system-status.service.ts`

### Product Ingestion (3 files)
    
**Description:** Fix product ingestion mappers and related files

**Priority:** Medium
**Estimated Effort:** Low
**Automation Script:** `fix-product-ingestion-mappers.js`

**Approach:**
- Create proper interfaces for marketplace-specific product formats
- Fix mapper functions with proper typing
- Implement type guards for validating product data
- Add comprehensive error handling

**Files to Fix:**
- `src/modules/product-ingestion/mappers/amazon-product.mapper.ts`
- `src/modules/product-ingestion/mappers/takealot-product.mapper.ts`
- `src/modules/product-ingestion/mappers/shopify-product.mapper.ts`

### Marketplaces (62 files)
    
**Description:** Fix marketplace adapters with proper typing

**Priority:** High
**Estimated Effort:** Very High

**Approach:**
- Create declaration files for marketplace APIs
- Fix adapter classes with proper typing
- Implement interface hierarchies for adapter functionality
- Add proper error handling with type narrowing

#### Amazon (55 files)
      
**Automation Script:** `fix-amazon-adapters.js`

**Files to Fix:**
- `src/modules/marketplaces/adapters/amazon/fulfillment/index.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/fba-inbound-eligibility/fba-inbound-eligibility.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/fba-inbound-eligibility/fba-inbound-eligibility-factory.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/fba-inbound-eligibility/index.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/fba/fba-inventory-factory.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/fba/fba-inventory.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/fba/index.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/inventory-planning.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/fba-small-light/fba-small-light.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/fba-small-light/fba-small-light-factory.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/fba-small-light/index.ts`
- `src/modules/marketplaces/adapters/amazon/inventory/index.ts`
- `src/modules/marketplaces/adapters/amazon/brand-protection/brand-protection.ts`
- `src/modules/marketplaces/adapters/amazon/brand-protection/brand-protection-factory.ts`
- `src/modules/marketplaces/adapters/amazon/brand-protection/index.ts`
- `src/modules/marketplaces/adapters/amazon/authorization/authorization-factory.ts`
- `src/modules/marketplaces/adapters/amazon/authorization/authorization.ts`
- `src/modules/marketplaces/adapters/amazon/authorization/index.ts`
- `src/modules/marketplaces/adapters/amazon/amazon.adapter.test.ts`
- `src/modules/marketplaces/adapters/amazon/catalog/catalog-items.ts`
- `src/modules/marketplaces/adapters/amazon/catalog/catalog-factory.ts`
- `src/modules/marketplaces/adapters/amazon/catalog/index.ts`
- `src/modules/marketplaces/adapters/amazon/sales/sales.ts`
- `src/modules/marketplaces/adapters/amazon/sales/sales-factory.ts`
- `src/modules/marketplaces/adapters/amazon/sales/index.ts`
- `src/modules/marketplaces/adapters/amazon/pricing/product-pricing.ts`
- `src/modules/marketplaces/adapters/amazon/pricing/pricing-factory.ts`
- `src/modules/marketplaces/adapters/amazon/pricing/index.ts`
- `src/modules/marketplaces/adapters/amazon/b2b/b2b-factory.ts`
- `src/modules/marketplaces/adapters/amazon/b2b/b2b.ts`
- `src/modules/marketplaces/adapters/amazon/b2b/index.ts`
- `src/modules/marketplaces/adapters/amazon/product-types/product-type-definitions.ts`
- `src/modules/marketplaces/adapters/amazon/product-types/product-type-factory.ts`
- `src/modules/marketplaces/adapters/amazon/product-types/index.ts`
- `src/modules/marketplaces/adapters/amazon/feeds/feeds.ts`
- `src/modules/marketplaces/adapters/amazon/feeds/amazon-feeds.ts`
- `src/modules/marketplaces/adapters/amazon/feeds/feeds-factory.ts`
- `src/modules/marketplaces/adapters/amazon/feeds/index.ts`
- `src/modules/marketplaces/adapters/amazon/amazon.adapter.ts`
- `src/modules/marketplaces/adapters/amazon/warehousing/warehousing.ts`
- `src/modules/marketplaces/adapters/amazon/warehousing/warehousing-factory.ts`
- `src/modules/marketplaces/adapters/amazon/warehousing/index.ts`
- `src/modules/marketplaces/adapters/amazon/notifications/notifications.ts`
- `src/modules/marketplaces/adapters/amazon/notifications/notifications-factory.ts`
- `src/modules/marketplaces/adapters/amazon/notifications/index.ts`
- `src/modules/marketplaces/adapters/amazon/uploads/uploads-factory.ts`
- `src/modules/marketplaces/adapters/amazon/uploads/uploads.ts`
- `src/modules/marketplaces/adapters/amazon/uploads/index.ts`
- `src/modules/marketplaces/adapters/amazon/orders/orders.ts`
- `src/modules/marketplaces/adapters/amazon/orders/orders-factory.ts`
- `src/modules/marketplaces/adapters/amazon/orders/index.ts`
- `src/modules/marketplaces/adapters/amazon/sellers/sellers.ts`
- `src/modules/marketplaces/adapters/amazon/sellers/sellers-factory.ts`
- `src/modules/marketplaces/adapters/amazon/sellers/index.ts`
- `src/modules/marketplaces/adapters/amazon/index.ts`

#### Shopify (1 files)
      
**Automation Script:** `fix-shopify-adapters.js`

**Files to Fix:**
- `src/modules/marketplaces/adapters/shopify/shopify.adapter.test.ts`

#### Takealot (3 files)
      
**Automation Script:** `fix-takealot-adapters.js`

**Files to Fix:**
- `src/modules/marketplaces/adapters/takealot/takealot-webhook-handler.ts`
- `src/modules/marketplaces/adapters/takealot/takealot-adapter.ts`
- `src/modules/marketplaces/adapters/takealot/takealot.adapter.test.ts`

#### Other (3 files)
      
**Automation Script:** `fix-other-marketplace-adapters.js`

**Files to Fix:**
- `src/modules/marketplaces/config/takealot.config.ts`
- `src/modules/marketplaces/config/shopify.config.ts`
- `src/modules/marketplaces/index.ts`

### Connection Module (1 files)
    
**Description:** Fix connection module files

**Priority:** Low
**Estimated Effort:** Low
**Automation Script:** `fix-connection-module.js`

**Approach:**
- Fix connection routes with proper typing
- Implement proper module initialization
- Add proper error handling

**Files to Fix:**
- `src/modules/connections/index.ts`

### Test Files (20 files)
    
**Description:** Fix test files with proper Jest typing

**Priority:** Low
**Estimated Effort:** Very High
**Automation Script:** `fix-test-files.js`

**Approach:**
- Create Jest mock utilities with proper typing
- Fix test fixture typing
- Implement proper assertion typing
- Add proper mock function return types

**Strategy:** Due to the large number of test files, we'll develop an automated approach to fix common test file patterns.

### Other Files (18 files)

These files don't fit neatly into other categories and will be handled individually as needed.

**Files to Fix:**
- `src/schedulers/inventory-reorder-check.scheduler.ts`
- `src/schedulers/index.ts`
- `src/utils/email.ts`
- `src/utils/jwt.utils.ts`
- `src/utils/logger.ts`
- `src/types/axios.d.ts`
- `src/types/axios-xero.d.ts`
- `src/types/swagger-jsdoc.d.ts`
- `src/types/jsonwebtoken.d.ts`
- `src/types/jest.d.ts`
- `src/types/xero-node.d.ts`
- `src/config/swagger.ts`
- `src/tests/utils/test-app.ts`
- `src/tests/utils/test-utils.ts`
- `src/tests/setup.ts`
- `src/tests/templates/service.test.template.ts`
- `src/tests/templates/controller.test.template.ts`
- `src/server.ts`


## Implementation Schedule

1. **Week 1: Core, Models, and Controllers**
   - Fix core application files
   - Fix model files
   - Fix controller files
   - Update progress tracking

2. **Week 2: Services and Product Ingestion**
   - Fix service files
   - Fix product ingestion mappers
   - Update progress tracking

3. **Week 3-4: Marketplace Adapters**
   - Fix Amazon adapters
   - Fix Shopify adapters
   - Fix Takealot adapters
   - Fix other marketplace adapters
   - Update progress tracking

4. **Week 5: Remaining Files**
   - Fix connection module files
   - Fix remaining miscellaneous files
   - Update progress tracking

5. **Ongoing: Test Files**
   - Develop automated approach for test files
   - Gradually fix test files alongside module fixes
   - Update progress tracking

## Success Metrics

1. **Quantitative Metrics:**
   - Number of files without @ts-nocheck pragmas
   - Percentage of codebase with proper TypeScript typing
   - Number of TypeScript errors fixed
   - Type coverage percentage

2. **Qualitative Metrics:**
   - Improved developer experience
   - Faster error detection
   - Better code completion and IntelliSense
   - Reduced runtime errors

## Conclusion

This action plan provides a structured approach to systematically address the remaining TypeScript errors in the Fluxori-V2 backend codebase. By following this plan, we can complete the TypeScript migration efficiently and improve the overall quality of the codebase.
