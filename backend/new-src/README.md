# Fluxori-V2 Backend - Clean TypeScript Implementation

This directory contains a clean TypeScript implementation of the Fluxori-V2 backend, built from the ground up with proper TypeScript patterns and architecture.

## Architecture

The codebase follows a domain-driven design approach with clear separation of concerns:

```
new-src/
├── app.ts                 # Express application setup
├── server.ts              # Server entry point
├── config/                # Application configuration
│   ├── container.ts       # Dependency injection container
│   ├── database.ts        # Database connection
│   └── environment.ts     # Environment variables
├── controllers/           # API controllers
│   └── base.controller.ts # Base controller class
├── domain/                # Domain models and business logic
│   ├── interfaces/        # Domain interfaces
│   ├── models/            # Domain model implementations
│   ├── repositories/      # Repository interfaces
│   └── services/          # Domain services
├── interfaces/            # Application interfaces
├── middlewares/           # Express middlewares
│   ├── auth.middleware.ts # Authentication middleware
│   ├── error.middleware.ts # Error handling middleware
│   └── validation.middleware.ts # Validation middleware
├── models/                # Data models (MongoDB)
├── repositories/          # Data access layer
│   └── base.repository.ts # Base repository implementation
├── services/              # Application services
├── types/                 # Type definitions
│   ├── base.types.ts      # Base type definitions
│   └── error.types.ts     # Error type definitions
└── utils/                 # Utility functions
    ├── logger.ts          # Logging utility
    └── token.ts           # JWT token utility
```

## Key Features

- **Strong Type Safety**: Comprehensive TypeScript implementation with strict typing
- **Domain-Driven Design**: Clear separation between domain and application layers
- **Dependency Injection**: Using InversifyJS for IoC container
- **Repository Pattern**: Type-safe data access with MongoDB
- **Error Handling**: Structured error handling with proper typing
- **Authentication**: JWT-based authentication with type-safe middleware
- **Validation**: Request validation with Joi and TypeScript
- **Testing**: Jest configuration for TypeScript testing

## Development Workflow

1. **Setup Environment**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Run Tests**:
   ```bash
   npm test
   ```

4. **Type Checking**:
   ```bash
   npm run typecheck
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## Coding Standards

- All code must be fully typed with TypeScript
- No use of `any` type - use `unknown` when necessary
- Always define interfaces before implementation
- Use dependency injection for all services
- Implement proper error handling with type narrowing
- Write tests for all business logic
- Document public APIs with JSDoc comments
- Follow naming conventions consistently

## Implementation Status

The clean TypeScript implementation is currently in progress. See the `TYPESCRIPT-REBUILD-IMPLEMENTATION-PLAN.md` file in the parent directory for the detailed implementation plan and progress tracking.