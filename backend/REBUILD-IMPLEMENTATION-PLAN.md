# Fluxori-V2 Backend TypeScript Rebuild Plan

## Overview

This plan outlines a systematic approach to rebuild the Fluxori-V2 backend codebase with proper TypeScript implementation. Rather than fixing thousands of TypeScript errors in converted code, we'll rebuild critical modules with clean TypeScript architecture.

## Goals

1. Create a properly typed TypeScript codebase
2. Implement modern TS patterns and best practices
3. Prioritize critical business functionality
4. Deliver incrementally to maintain development momentum

## Implementation Progress

### Completed Work

1. **Created comprehensive templates for TypeScript components**
   - Model template with interface separation pattern
   - Controller template with proper request/response typing
   - Service template with dependency injection support
   - Route template with OpenAPI documentation

2. **Built automation tools for the rebuild process**
   - Script to rebuild individual files from templates (`rebuild-file.js`)
   - Module generator for creating complete modules (`generate-module.js`)
   - Type generator to create TypeScript interfaces from MongoDB schemas (`generate-types-from-schema.js`)
   - Base type definitions for common patterns (`create-base-types.js`)
   - File restoration script for corrupted files (`restore-from-templates.js`)

3. **Developed domain interfaces and models with proper TypeScript support**
   - ✅ Implemented comprehensive User interfaces with proper typing patterns
   - ✅ Implemented comprehensive Organization interfaces with type-safe properties
   - ✅ Implemented comprehensive Product interfaces with variant support
   - ✅ Implemented comprehensive Inventory interfaces with warehouse support

4. **Built MongoDB schemas for all domain models**
   - ✅ User model with organization membership
   - ✅ Organization model with integration support
   - ✅ Product model with variant capabilities
   - ✅ Inventory models (items, levels, transactions)
   - ✅ Warehouse model with multi-warehouse architecture

5. **Implemented type-safe repository layer**
   - ✅ Base repository with generic typing
   - ✅ User repository with membership management
   - ✅ Organization repository with hierarchy support
   - ✅ Product repository with variant operations
   - ✅ Inventory repositories with stock management
   - ✅ Warehouse repository with multi-location support

6. **Established TypeScript infrastructure**
   - Base type definitions for consistent patterns
   - Mongoose utility types for MongoDB operations
   - API response types for consistent API design
   - Express extensions for request/response typing
   - Error handling middleware with TypeScript support

5. **Created documentation and tracking**
   - Created rebuild implementation progress tracking
   - Updated FEATURES.md with TypeScript progress
   - Documented next steps and priorities
   - Added backup recovery strategy for corrupted files

6. **Implemented key services with TypeScript**
   - ✅ Inventory controller with full TypeScript support
   - ✅ Product ingestion service with proper typing
   - ✅ Order ingestion service with proper typing
   - ✅ Order ingestion controller with type-safe methods
   - ✅ Order API routes with Swagger documentation
   - ✅ Xero invoice service for order processing
   - ✅ Fixed corrupted AI-CS-Agent module
   - ✅ Fixed Connections module with proper TypeScript
   - ✅ Fixed Credits module with proper request/response typing

### In Progress

1. **Implementing controller layer with request/response handling**
   - ✅ User controller with authentication
   - ✅ Organization controller with membership management
   - ✅ Product controller with variant handling
   - 🔄 Inventory controller with stock management
   - 🔄 Warehouse controller with multi-location support

2. **Enhancing type safety for routes**
   - ✅ Implementing type-safe request/response patterns
   - ✅ Adding validation middleware with type checking
   - ✅ Securing authenticated routes with proper typing

3. **Marketplace module rebuild**
   - ✅ Base marketplace adapter interface
   - ✅ Amazon adapter implementation with proper TypeScript
   - ✅ Marketplace adapter factory with dependency injection
   - ✅ Shopify integration with proper typing
   - ✅ Takealot integration with proper typing

### Next Steps

1. ✅ **Complete service layer implementation**
   - ✅ User service with authentication and organization membership
   - ✅ Organization service with hierarchy support
   - ✅ Product service with variant management
   - ✅ Inventory service with stock management
   - ✅ Dependency injection container for all services

2. 🔄 **Implement controllers with type-safe request/response handling**
   - ✅ User controller with authentication
   - ✅ Organization controller with membership management
   - ✅ Product controller with variant operations
   - ⏱️ Inventory controller with stock management
   - ⏱️ Warehouse controller with multi-location support

3. 🔄 **Implement routes with proper validation**
   - ✅ User routes with authentication
   - ✅ Organization routes with membership management
   - ✅ Product routes with variant operations
   - ⏱️ Inventory routes with stock management
   - ⏱️ Warehouse routes with multi-location support

4. ✅ **API validation**
   - ✅ Implement validation middleware with TypeScript
   - ✅ Add schema builder with type inference
   - ✅ Create test cases for validation middleware
   - 🔄 Add request validation for all endpoints
   - ✅ Improve error handling with proper typing

5. ✅ **Fix corrupted AI module files**
   - ✅ Recover AI-CS-Agent controller implementation
   - ✅ Fix syntax errors in conversation service
   - ✅ Rebuild RAG retrieval service with proper types
   - ✅ Update module index exports

6. ✅ **Fix International Trade module**
   - ✅ Rebuild customs service
   - ✅ Implement customs calculator with proper types
   - ✅ Create HS code lookup utility
   - ✅ Fix module index exports

## Phased Implementation Approach

### Phase 1: Core Architecture (1-2 weeks)

1. **Define TypeScript Architecture**
   - ✅ Establish project-wide TypeScript patterns and conventions
   - ✅ Create base interfaces and types for common entities
   - ✅ Set up proper TS configurations and linting rules
   - ✅ Document patterns in a TypeScript style guide

2. **Core Infrastructure**
   - ✅ Database models and MongoDB integration
   - ✅ Authentication/Authorization system
   - ✅ Express middleware with proper typing
   - ✅ Error handling framework
   - ⏱️ Logging system

3. **Base Models**
   - ✅ Organization model
   - ✅ Inventory models
   - ✅ Activity model
   - ✅ User model
   - 🔄 Warehousing models

### Phase 2: Critical Business Modules (2-3 weeks)

Prioritized by business value:

1. ✅ **Inventory Management**
   - ✅ Models: Inventory, InventoryStock
   - ✅ Controllers: Inventory APIs
   - ✅ Services: Stock management, reordering

2. **Marketplace Integration**
   - ✅ Adapter interfaces and base classes
   - ✅ Primary marketplace implementations (✅ Amazon, ✅ Takealot, ✅ Shopify)
   - ✅ Product synchronization services
   - ✅ Order synchronization services

3. **Order Processing**
   - ✅ Order models and controllers
   - ✅ Order ingestion services
   - 🔄 Fulfillment workflows

4. **International Trade**
   - ⏱️ Shipping rate services
   - ⏱️ Compliance services
   - ⏱️ Customs documentation

### Phase 3: Supporting Features (2-3 weeks)

1. **Analytics & Reporting**
   - 🔄 Dashboard APIs
   - ✅ Analytics controllers
   - 🔄 Data aggregation services

2. **Buybox & Repricing**
   - ✅ Monitoring services
   - ✅ Repricing engines
   - ✅ Competition tracking

3. **Notifications**
   - ⏱️ Webhook handling
   - ⏱️ Email notifications
   - ⏱️ In-app notifications

4. **AI Features**
   - 🔄 CS Agent module
   - 🔄 Insights module
   - ✅ RAG retrieval services

### Phase 4: Admin & Utilities (1-2 weeks)

1. **Admin Features**
   - ✅ User management
   - ✅ Organization management
   - ✅ Role-based access control

2. **Utility Services**
   - ✅ File storage
   - ✅ PDF generation
   - ✅ External integrations (Xero invoice integration)

## Implementation Strategy

### 1. Template-Based Rebuilding

Use strongly-typed template files as the foundation for rebuilding each component:

```typescript
// Model template
import { Schema, model, Document, Model } from 'mongoose';
import * as mongoose from 'mongoose';

// Base interface
export interface IEntityName {
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Document interface for methods
export interface IEntityNameDocument extends IEntityName, Document {
  // Document methods
  someMethod(): Promise<any>;
}

// Static model methods
export interface IEntityNameModel extends Model<IEntityNameDocument> {
  // Static methods
  findByOrganization(orgId: string): Promise<IEntityNameDocument[]>;
}

// Schema
const EntityNameSchema = new Schema<IEntityNameDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add methods
EntityNameSchema.methods.someMethod = async function(): Promise<any> {
  // Implementation
};

// Add static methods
EntityNameSchema.statics.findByOrganization = async function(
  orgId: string
): Promise<IEntityNameDocument[]> {
  return this.find({ organizationId: new mongoose.Types.ObjectId(orgId), isActive: true });
};

// Create and export model
const EntityName = model<IEntityNameDocument, IEntityNameModel>('EntityName', EntityNameSchema);
export default EntityName;
```

### 2. Module First Approach

For each module:

1. Define interfaces and types
2. Create models
3. Implement services
4. Build controllers
5. Configure routes
6. Write tests

### 3. One Module at a Time

- Complete one module before moving to the next
- Implement full vertical slices (model → API) for each module
- Integrate end-to-end testing for each completed module

## Migration Strategy

To maintain functionality during the rebuild:

1. **Parallel Development**
   - Keep existing codebase running while rebuilding
   - Use feature flags to toggle between old and new implementations

2. **Incremental Replacement**
   - Replace modules one at a time
   - Start with non-customer facing modules

3. **Test Coverage**
   - Ensure comprehensive tests for old and new implementations
   - Verify behavioral equivalence before switching

## Automation Tools

Created specialized scripts to accelerate the rebuild:

1. **Template Generation**
   ```bash
   # Generate a complete module
   node scripts/generate-module.js --name=EntityName
   
   # Rebuild a specific file from template
   node scripts/rebuild-file.js controller src/controllers/user.controller.ts User --force
   
   # Generate TypeScript types from a model schema
   node scripts/generate-types-from-schema.js --model=src/models/inventory.model.ts
   ```

2. **Type Generation from Schema**
   - Automatically generate TypeScript interfaces from MongoDB schemas
   - Update when schema changes

3. **API Documentation**
   - Generate OpenAPI/Swagger documentation from TypeScript interfaces
   - Keep API docs in sync with implementation

## Progress Tracking

Track rebuild progress with:

1. **Module Status Board**
   - Visual representation of rebuilding progress (REBUILD-IMPLEMENTATION-PROGRESS.md)
   - Priorities and dependencies clearly marked

2. **TypeScript Coverage**
   - Percentage of codebase properly typed
   - Error count reduction over time

3. **Test Coverage**
   - Unit test coverage for rebuilt modules
   - Integration test coverage for critical paths

## Technical Implementation Details

### 1. Effective TypeScript Patterns

```typescript
// API response pattern
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Type-safe error handling
try {
  // Operation
} catch (error: unknown) {
  if (error instanceof Error) {
    throw new ApiError(500, error.message);
  } else {
    throw new ApiError(500, String(error));
  }
}

// Properly typed route handlers
const getEntityById = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<IEntity>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    // Implementation
  } catch (error) {
    next(error);
  }
};
```

### 2. Dependency Injection

Use a proper DI container for better testability:

```typescript
import { Container, injectable, inject } from 'inversify';
import 'reflect-metadata';

@injectable()
class InventoryService {
  constructor(
    @inject(TYPES.Database) private db: Database,
    @inject(TYPES.Logger) private logger: Logger
  ) {}
  
  async getInventory(): Promise<Inventory[]> {
    // Implementation
  }
}
```

### 3. Clean Architecture

Separate business logic from framework:

```
src/
  ├── domain/           # Business logic and entities
  ├── application/      # Use cases and business rules
  ├── infrastructure/   # External systems (DB, APIs)
  └── interfaces/       # Controllers, routes, presenters
```

## Implementation Schedule

### Week 1: Core Architecture (Completed)
- ✅ Base template creation
- ✅ TypeScript infrastructure setup
- ✅ Core model rebuilding (Inventory, Activity, Organization)
- ✅ Base type definitions

### Weeks 2-3: Core Services and Controllers (Completed)
- ✅ Inventory service with type-safe operations
- ✅ Controller rebuilding with proper typing
- ✅ Authentication system enhancement
- ✅ Error handling middleware

### Weeks 4-5: Marketplace Module (Completed)
- ✅ Adapter framework
- ✅ Amazon integration
- ✅ Shopify integration
- ✅ Takealot integration

### Weeks 6-7: Order Processing
- ✅ Order models
- ✅ Order ingestion services
- ✅ Order API routes and controllers
- 🔄 Fulfillment workflows

### Weeks 8-10: Supporting Features (Current)
- 🔄 Analytics (✅ Controllers, 🔄 Data services)
- ✅ Buybox & Repricing
- 🔄 AI features (Fixing corrupted files)
- 🔄 International Trade module fixes

### Weeks 11-12: Admin & Utilities
- ✅ User management
- ✅ Organization management
- ✅ Role-based access control
- ✅ File storage service
- 🔄 PDF generation service

## Error Tracking
- Starting count: ~7,500 TypeScript errors
- Current count: 6,161 TypeScript errors (17.9% reduction)
- Fixed issues in:
  - ✅ Email utility (src/utils/email.ts)
  - ✅ AI-CS-Agent module (conversation controller, websocket utility)
  - ✅ AI-Insights module (credit costs, repositories, services)
  - ✅ International Trade module
  - ✅ Buybox module (repricing-event.repository.ts, base-buybox-monitor.ts, repricing-engine.service.ts)
  - ✅ Connections module (controllers, models, services)
  - ✅ Credits module (controllers, services, tests)
  - ✅ Inventory repository (getInventoryItemById method)
  - ✅ Product ingestion models (fixed interface property syntax)
  - ✅ Order ingestion models (fixed interface property syntax)
  - ✅ Logger utility (added proper types to config)
  - ✅ Common utility types (fixed missing interface definitions)
  - ✅ Marketplace models (fixed comma syntax errors in interfaces)
  - ✅ Marketplace config files (Shopify and Takealot interface fixes)
  - ✅ Template files:
    - ✅ service.template.ts (fixed template placeholders for TypeScript compatibility)
    - ✅ model.template.ts (fixed template placeholders for TypeScript compatibility)
    - ✅ controller.template.ts (fixed template placeholders for TypeScript compatibility)
    - ✅ route.template.ts (fixed template placeholders for TypeScript compatibility)
    - ✅ schema.template.ts (fixed template placeholders for TypeScript compatibility)
- Remaining issues concentrated in:
  - Marketplace adapters (Amazon, Shopify adapters implementation)
  - Test files with type errors