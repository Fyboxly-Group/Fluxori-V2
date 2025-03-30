# Fluxori-V2 Backend Directory Structure

This document provides a comprehensive overview of the directory structure for the Fluxori-V2 backend, explaining the purpose and organization of each component.

## Root Directory

```
/
├── scripts/                  # Utility and automation scripts
├── src/                      # Main source code directory
├── dist/                     # Compiled TypeScript output (generated)
├── .husky/                   # Git hooks for quality control
├── .vscode/                  # VS Code editor configuration
├── docs/                     # Project documentation
├── node_modules/             # Dependencies (generated)
├── coverage/                 # Test coverage reports (generated)
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier code formatter configuration
├── .gitignore                # Git ignore configuration
├── tsconfig.json             # TypeScript compiler configuration
├── tsconfig.core.json        # Strict TypeScript compiler configuration
├── package.json              # Project metadata and scripts
├── package-lock.json         # Dependency lock file
├── jest.config.js            # Jest test framework configuration
└── README.md                 # Project overview documentation
```

## Source Code (`src/`)

The `src/` directory contains all application source code, organized in a feature-oriented structure:

```
src/
├── app.ts                    # Express application setup
├── server.ts                 # Server initialization and startup
├── config/                   # Application configuration
├── controllers/              # Core API controllers
├── middleware/               # Express middleware
├── models/                   # MongoDB model definitions
├── routes/                   # API route definitions
├── services/                 # Core business logic services
├── modules/                  # Feature modules (see modules section)
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions and helpers
└── tests/                    # Test files
```

## Modules (`src/modules/`)

Modules are self-contained feature sets with their own MVC structure:

```
src/modules/
├── ai-cs-agent/              # AI customer service agent functionality
│   ├── controllers/          # Module-specific controllers
│   ├── models/               # Module-specific models
│   ├── routes/               # Module-specific routes
│   ├── services/             # Module-specific services
│   ├── tests/                # Module-specific tests
│   ├── utils/                # Module-specific utilities
│   └── index.ts              # Module initialization and exports
│
├── credits/                  # Credit system management
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── utils/
│   └── index.ts
│
├── international-trade/      # International shipping and compliance
│   ├── adapters/             # Shipping provider adapters
│   │   ├── common/           # Common adapter functionality
│   │   ├── dhl/              # DHL integration
│   │   └── fedex/            # FedEx integration
│   ├── config/               # Module-specific configuration
│   ├── controllers/          # Trade-related controllers
│   ├── interfaces/           # TypeScript interfaces for the module
│   ├── models/               # Trade-related models
│   ├── routes/               # API routes for trade functionality
│   ├── services/             # Business logic for trade operations
│   │   ├── compliance.service.ts
│   │   ├── customs-document.service.ts
│   │   ├── international-trade.service.ts
│   │   └── shipping-rate.service.ts
│   ├── tests/                # Module-specific tests
│   ├── utils/                # Helper utilities
│   │   ├── customs-calculator.ts
│   │   └── hs-code-lookup.ts
│   └── index.ts              # Module initialization and exports
│
├── marketplaces/             # Marketplace integrations
│   ├── adapters/             # Marketplace-specific adapters
│   │   ├── amazon/           # Amazon marketplace integration
│   │   │   ├── aplus/        # Amazon A+ Content
│   │   │   ├── authorization/  # Authorization handling
│   │   │   ├── feeds/        # Feed submission
│   │   │   ├── inventory/    # Inventory management
│   │   │   ├── orders/       # Order processing
│   │   │   ├── reports/      # Report generation
│   │   │   └── ... (other Amazon API sections)
│   │   ├── common/           # Common adapter functionality
│   │   ├── interfaces/       # Adapter interfaces
│   │   └── takealot/         # Takealot marketplace integration
│   ├── config/               # Marketplace configuration
│   ├── controllers/          # Marketplace controllers
│   ├── examples/             # Usage examples
│   ├── models/               # Marketplace models
│   ├── routes/               # Marketplace routes
│   ├── services/             # Marketplace services
│   ├── utils/                # Marketplace utilities
│   └── index.ts              # Module initialization and exports
│
├── notifications/            # Notification system
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── utils/
│   └── index.ts
│
├── product-catalog/          # Product catalog management
│   ├── controllers/
│   ├── interfaces/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   └── utils/
│
└── rag-retrieval/            # RAG (Retrieval-Augmented Generation)
    ├── controllers/
    ├── interfaces/
    ├── routes/
    ├── services/
    ├── tests/
    └── index.ts
```

## Core Components

### Controllers (`src/controllers/`)

Controllers handle HTTP requests and responses, implementing business logic for API endpoints:

```
src/controllers/
├── analytics.controller.ts     # Analytics data endpoints
├── auth.controller.ts          # Authentication endpoints
├── customer.controller.ts      # Customer management
├── dashboard.controller.ts     # Dashboard data
├── inventory.controller.ts     # Inventory management
├── inventory-alert.controller.ts # Inventory alerting
├── milestone.controller.ts     # Project milestone handling
├── project.controller.ts       # Project management
├── shipment.controller.ts      # Shipment management
├── task.controller.ts          # Task management
├── upload.controller.ts        # File upload handling
└── webhook.controller.ts       # Webhook processing
```

### Models (`src/models/`)

Models define MongoDB schemas and document structure:

```
src/models/
├── activity.model.ts          # Activity logging
├── customer.model.ts          # Customer data
├── inventory.model.ts         # Inventory items
├── inventory-alert.model.ts   # Inventory alerts
├── milestone.model.ts         # Project milestones
├── order.model.ts             # Order information
├── project.model.ts           # Project data
├── purchase-order.model.ts    # Purchase orders
├── shipment.model.ts          # Shipment information
├── shipment-alert.model.ts    # Shipment alerts
├── supplier.model.ts          # Supplier data
├── system-status.model.ts     # System status tracking
├── task.model.ts              # Task information
└── user.model.ts              # User accounts
```

### Routes (`src/routes/`)

Routes define API endpoints and their HTTP methods:

```
src/routes/
├── analytics.routes.ts       # Analytics endpoints
├── auth.routes.ts            # Authentication paths
├── customer.routes.ts        # Customer management
├── dashboard.routes.ts       # Dashboard data endpoints
├── inventory.routes.ts       # Inventory management
├── inventory-alert.routes.ts # Inventory alert endpoints
├── milestone.routes.ts       # Milestone endpoints
├── project.routes.ts         # Project management
├── shipment.routes.ts        # Shipment endpoints
├── task.routes.ts            # Task management
├── upload.routes.ts          # File upload endpoints
└── webhook.routes.ts         # Webhook endpoints
```

### Middleware (`src/middleware/`)

Middleware functions that process requests before controllers:

```
src/middleware/
├── auth.middleware.ts        # Authentication middleware
└── error.middleware.ts       # Error handling middleware
```

### Services (`src/services/`)

Services implement business logic independent of HTTP request/response:

```
src/services/
├── activity.service.ts       # Activity tracking logic
├── seed.service.ts           # Database seeding
├── storage.service.ts        # File storage operations
└── system-status.service.ts  # System status management
```

### Types (`src/types/`)

TypeScript type definitions for various parts of the application:

```
src/types/
├── axios.d.ts                # Axios HTTP client types
├── jest.d.ts                 # Jest testing framework types
├── jsonwebtoken.d.ts         # JWT token types
├── swagger-jsdoc.d.ts        # Swagger API documentation types
└── models/                   # Generated model interfaces (from schemas)
```

### Tests (`src/tests/`)

Test files for various components:

```
src/tests/
├── integration/              # Integration tests
│   ├── auth.integration.test.ts
│   ├── customer.integration.test.ts
│   ├── dashboard.integration.test.ts
│   ├── inventory.integration.test.ts
│   ├── project.integration.test.ts
│   └── ... (other integration tests)
├── templates/                # Test templates
├── utils/                    # Test utilities
└── setup.ts                  # Test setup configuration
```

## Scripts (`scripts/`)

Utility scripts for development and build processes:

```
scripts/
├── generate-types-from-schema.js  # Generates TypeScript interfaces from MongoDB schemas
├── generate-api-types.js          # Generates API response type definitions
├── fix-typescript-errors.js       # Automated TypeScript error fixing
├── create-from-template.js        # Creates new files from templates
├── list-broken-files.js           # Lists files with TypeScript errors
└── ts-migration-toolkit.js        # Toolkit for TypeScript migration
```

## Key Files

- **server.ts**: Application entry point
- **app.ts**: Express application setup and configuration
- **tsconfig.json**: TypeScript compiler configuration
- **.eslintrc.js**: ESLint rules for code quality
- **package.json**: Project dependencies and scripts
- **.husky/pre-commit**: Git pre-commit hook for quality enforcement

## Module Pattern

Each module follows a consistent pattern:

1. **Modular Structure**: Self-contained MVC components
2. **External Interface**: Defined in `index.ts` for clean imports
3. **Initialization Function**: Prepares module resources
4. **Route Registration**: Exposed for the main application
5. **Internal Services**: Business logic implementation

## Extending the Application

When adding new features:

1. Determine if it belongs in an existing module or needs a new one
2. Follow the established pattern for that type of component
3. Add appropriate tests
4. Register routes in the main application
5. Generate TypeScript interfaces for any new models

## Conclusion

This directory structure reflects a modular, feature-oriented architecture with clear separation of concerns. Each component has a defined responsibility, and the organization facilitates both maintenance and extension of the application.