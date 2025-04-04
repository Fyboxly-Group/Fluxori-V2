# Fluxori-V2 Backend

This is the backend API for the Fluxori-V2 application, built with Node.js, Express, TypeScript, and MongoDB.

## Setup

1. Install dependencies:
```
npm install
```

2. Set up environment variables:
```
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```
npm run dev
```

## Available Scripts

- `npm run build` - Compiles TypeScript to JavaScript
- `npm run start` - Starts the production server
- `npm run dev` - Starts the development server with auto-reload
- `npm run lint` - Runs ESLint to check code style
- `npm run typecheck` - Runs TypeScript type checking on all files
- `npm run typecheck:src` - Runs TypeScript type checking on source files only (excluding tests)
- `npm run typecheck:core` - Runs TypeScript type checking on core files (using a more restrictive config)
- `npm run fix:ts` - Automatically fixes common TypeScript errors in the codebase
- `npm run test` - Runs all tests
- `npm run test:watch` - Runs tests in watch mode
- `npm run test:coverage` - Runs tests with coverage reporting
- `npm run test:unit` - Runs only unit tests
- `npm run test:integration` - Runs only integration tests
- `npm run clean` - Removes the dist directory

## TypeScript Migration and Error Resolution

The Fluxori-V2 backend is undergoing a systematic TypeScript migration. Please refer to the following documents for guidance:

- **[TYPESCRIPT-ERROR-RESOLUTION-PLAN.md](./TYPESCRIPT-ERROR-RESOLUTION-PLAN.md)**: Comprehensive reference for fixing TypeScript errors, including automation scripts and rebuild strategies
- **[REBUILD-IMPLEMENTATION-PLAN.md](./REBUILD-IMPLEMENTATION-PLAN.md)**: Detailed plan for rebuilding critical components with proper TypeScript support
- **[REBUILD-IMPLEMENTATION-PROGRESS.md](./REBUILD-IMPLEMENTATION-PROGRESS.md)**: Current progress of the TypeScript rebuild implementation

### Current Status

- Starting TypeScript Error Count: ~7,500 errors
- Current TypeScript Error Count: 6,161 errors
- Reduction: ~17.9% decrease in TypeScript errors
- Main Error Sources: Amazon marketplace adapters (5,127 errors)

### Migration Strategy

The TypeScript migration follows a three-pronged approach:
1. **Automation** for simple syntax fixes in modules with fewer errors
2. **Template-based rebuilds** for heavily corrupted modules (Amazon adapters)
3. **Clean architecture implementation** for core business functionality

### TypeScript Automation Tools

We've developed several automation scripts to address TypeScript errors:

```bash
# Fix common syntax errors safely (creates backups)
node scripts/fix-syntax-safely.js path/to/file.ts

# Comprehensive toolkit for fixing various TypeScript issues
node scripts/ts-migration-toolkit.js --analyze   # Analyze error patterns
node scripts/ts-migration-toolkit.js --fix=mongoose  # Fix mongoose ObjectId issues
node scripts/ts-migration-toolkit.js --fix=express   # Fix Express request types
node scripts/ts-migration-toolkit.js --fix=async     # Fix async/Promise typing
node scripts/ts-migration-toolkit.js --fix=errors    # Fix error handling patterns
node scripts/ts-migration-toolkit.js --all           # Run all fixers

# Template-based rebuilding
node scripts/rebuild-file.js controller src/controllers/example.controller.ts Example
node scripts/generate-module.js --name=EntityName
node scripts/generate-types-from-schema.js --model=path/to/schema.js
```

### Key TypeScript Features

- Interface separation pattern for MongoDB models (base, document, model interfaces)
- Type-safe repository layer with generic CRUD operations
- Dependency injection with InversifyJS for better testability
- Controller base classes with typed request/response handling
- Properly typed middleware with request augmentation

## API Documentation

API documentation is available in Swagger format at `/api-docs` when the server is running.

## Project Structure

- `src/server.ts` - Entry point for the application
- `src/controllers/` - API route controllers
- `src/models/` - Database models
- `src/routes/` - API route definitions
- `src/middleware/` - Express middleware
- `src/services/` - Business logic services
- `src/modules/` - Feature modules
- `src/tests/` - Test files
- `src/utils/` - Utility functions

## Modules

The backend is organized around feature modules, located in `src/modules/`. Each module encapsulates its own models, controllers, routes, and services for a specific feature set.

Current modules:

- `ai-cs-agent` - AI customer service agent functionality with Vertex AI integration
- `credits` - Credit system for resource management
- `marketplaces` - Marketplace integrations with product synchronization
- `notifications` - Real-time notification system
- `rag-retrieval` - RAG (Retrieval-Augmented Generation) context system
- `international-trade` - International shipping, customs, and compliance management

## Testing

Tests are written using Jest. The tests are organized into:

- Unit tests - Testing individual functions and components
- Integration tests - Testing API endpoints and database interactions

Run tests with `npm test` or use the specialized test scripts for different types of tests.