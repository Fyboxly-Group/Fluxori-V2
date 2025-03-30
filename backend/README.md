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

## TypeScript Implementation

This project has been fully migrated to TypeScript with zero compilation errors. We've implemented comprehensive type definitions across all modules, controllers, services, and tests.

### TypeScript Automation Tools

We've developed several automation scripts to maintain type safety and assist with future development:

```bash
# Comprehensive toolkit for fixing various TypeScript issues
npm run ts:toolkit -- --analyze   # Analyze error patterns
npm run ts:toolkit -- --fix=mongoose  # Fix mongoose ObjectId issues
npm run ts:toolkit -- --fix=express   # Fix Express request types
npm run ts:toolkit -- --fix=async     # Fix async/Promise typing
npm run ts:toolkit -- --fix=errors    # Fix error handling patterns
npm run ts:toolkit -- --fix=routeTests # Fix route test files
npm run ts:toolkit -- --all           # Run all fixers

# Specialized fixers for common issues
npm run fix:ts          # Fix common TypeScript errors
npm run fix:mongoose    # Fix mongoose ObjectId typing
npm run fix:express     # Fix Express request/response typing
npm run fix:tests       # Fix test-specific issues
```

### TypeScript Documentation

For detailed information about our TypeScript implementation:

- **Implementation Strategy**: See `TYPESCRIPT-AUTOMATION.md` for our approach, patterns, and best practices
- **Progress Tracking**: See `REBUILD-TRACKING.md` for a detailed history of our TypeScript migration
- **Common Patterns**: See the documentation in `docs/typescript-patterns.md` for frequently used typed patterns

### Key TypeScript Features

- Strongly typed MongoDB models with document interfaces
- Generic API response types for consistent error handling
- Typed Express middleware with authenticated request interfaces
- Comprehensive test typing with Jest mock type definitions
- Error handling patterns with proper type narrowing

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