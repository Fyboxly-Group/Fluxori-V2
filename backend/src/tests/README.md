# Fluxori-V2 Backend Tests

This directory contains tests for the Fluxori-V2 backend API.

## Test Structure

The tests are organized as follows:

- `/tests/unit`: Unit tests for individual components
- `/tests/integration`: Integration tests for API endpoints
- `/tests/utils`: Utility functions for testing
- `/tests/setup.ts`: Global setup for tests

## Types of Tests

### Controller Tests

Controller tests verify that API endpoints work correctly, including:
- Request handling
- Validation
- Authentication and authorization
- Response formatting
- Error handling

### Service Tests

Service tests verify the business logic in service classes, including:
- Data processing
- External service integration
- Error handling

### Integration Tests

Integration tests verify the complete request-response cycle for API endpoints, including:
- Database interactions
- Authentication
- Authorization
- Response formatting

## Running Tests

To run all tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm run test:coverage
```

To run only unit tests:

```bash
npm run test:unit
```

To run only integration tests:

```bash
npm run test:integration
```

To run tests in watch mode:

```bash
npm run test:watch
```

## Test Coverage Thresholds

Jest is configured with the following coverage thresholds:

- Global:
  - Branches: 70%
  - Functions: 70%
  - Lines: 70%
  - Statements: 70%

- Controllers:
  - Branches: 80%
  - Functions: 80%
  - Lines: 80%
  - Statements: 80%

- Services:
  - Branches: 75%
  - Functions: 80%
  - Lines: 80%
  - Statements: 80%

## Test Utilities

- `createTestApp`: Creates an Express app for testing
- `testAuthenticate`: Authentication middleware for tests
- `createTestUser`: Creates a test user
- `generateAuthToken`: Generates a JWT token for testing
- `authenticatedRequest`: Creates a supertest request with authentication

## MongoDB Memory Server

Tests use MongoDB Memory Server to run tests against an in-memory MongoDB instance, avoiding the need for a real database connection.

## Mock Strategy

The following components are mocked in tests:

- `ActivityService`: Mocked to avoid actual activity logging
- `mongoose.Query.prototype.populate`: Mocked to avoid actual population
- External services (Storage, etc.)

## Test Templates

The `templates` directory contains template files for creating new tests:

- `controller.test.template.ts`: Template for controller/API endpoint tests
- `service.test.template.ts`: Template for service tests

To use a template:

1. Copy the template file to the appropriate directory
2. Rename it to match your component (e.g., `customer.controller.test.ts`)
3. Replace placeholder names and implement the tests according to the instructions in the template file

## Test Summary Script

The project includes a test summary script that generates a summary of test coverage and results:

```bash
npm run test:summary
```

This script is automatically run in CI mode and produces a JSON summary file in the coverage directory.

## Future Improvements

- Add more integration tests for all API endpoints
- Improve test data generation
- Add performance tests
- Add load tests
- Add end-to-end tests with a frontend client