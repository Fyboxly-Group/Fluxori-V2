# TypeScript Error Prevention System

This document provides usage instructions for the TypeScript error prevention system implemented in the Fluxori-V2 backend.

## Overview

The TypeScript error prevention system consists of:

1. **Enhanced Type Generator**: Automatically generates TypeScript interfaces from Mongoose models, API responses, and more
2. **Custom ESLint Rules**: Specialized rules for MongoDB/Mongoose to catch common errors
3. **Pre-commit Hooks**: Validate TypeScript before committing code
4. **Utility Types**: Common TypeScript utility types for better type safety

## Setup

To set up the TypeScript error prevention system, run:

```bash
npm run setup:typescript
```

This script:
- Installs required dependencies
- Configures ESLint with custom rules
- Sets up pre-commit hooks
- Creates necessary directories for generated types

## Usage

### Generating Types

To generate TypeScript interfaces from your codebase:

```bash
npm run generate:types
```

This will:
- Create interfaces from Mongoose models (with proper ObjectId handling)
- Generate API response types from controllers
- Extract interface definitions from marketplace adapters
- Create test fixture types
- Generate utility types for common patterns

The generated types will be placed in `src/types/generated` and `src/types/utility`.

### Validating TypeScript

To check your codebase for TypeScript errors:

```bash
npm run validate:typescript
```

This runs both TypeScript compilation and ESLint with our enhanced configuration.

### ESLint Integration

You can run ESLint separately with:

```bash
# Check for errors
npm run lint:enhanced

# Fix automatically fixable errors
npm run lint:fix
```

### Pre-commit Hooks

The pre-commit hooks automatically:
1. Generate type definitions
2. Check TypeScript compilation
3. Run ESLint validation

If any step fails, the commit will be aborted.

## Type System Structure

The generated type system follows these patterns:

### MongoDB/Mongoose Models

For each Mongoose model, three interfaces are generated:

1. **Base Interface** (`IUser`): Plain object representation (string IDs)
2. **Document Interface** (`IUserDocument`): Mongoose document with methods
3. **Model Interface** (`UserModel`): Static model methods

Example:

```typescript
// Base interface for plain objects
export interface IUser {
  name: string;
  email: string;
  organizationId: string; // String ID
}

// Document interface for Mongoose documents
export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId; // ObjectId type
  createdAt: Date;
  updatedAt: Date;
  toObject(): IUser & { _id: string };
}

// Model interface for static methods
export interface UserModel extends Model<IUserDocument> {
  // Static model methods
}
```

### API Responses

API responses use discriminated unions for type safety:

```typescript
// Success response
export interface UserCreateSuccess extends IApiSuccessResponse<IUser> {}

// Error response
export interface UserCreateError extends IApiErrorResponse {}

// Combined type
export type UserCreateResponse = UserCreateSuccess | UserCreateError;
```

### Utility Types

Common utility types include:

- MongoDB helpers (`toObjectId`, `isValidObjectId`, etc.)
- Error handling utilities (`Result<T, E>`, `isSuccess`, etc.)
- Exhaustive type checking helpers
- Pagination types

## Best Practices

1. **Use Generated Types**: Always import and use the generated types
2. **Avoid Type Assertions**: Use proper type narrowing instead of type assertions
3. **Handle Errors Properly**: Use try/catch blocks for Mongoose operations
4. **Validate ObjectIds**: Use `toObjectId()` to safely convert string IDs
5. **Use Discriminated Unions**: For API responses, use `success` property as discriminator
6. **Follow Naming Conventions**: Use `I` prefix for interfaces

## Troubleshooting

### ESLint Issues

If ESLint reports errors, try:

```bash
npm run lint:fix
```

For persistent issues, check:
- Import paths are correct
- MongoDB ObjectId handling is proper
- Error handling is in place

### Type Generation Issues

If type generation fails:
- Ensure model schemas follow standard patterns
- Check that controllers return standard response formats
- Verify adapter methods have proper signatures

### Pre-commit Hook Failures

If pre-commit hooks fail:
- Run `npm run validate:typescript` to see detailed errors
- Fix the reported issues before trying to commit again
- Consider running `npm run generate:types` manually

### Integration with CI/CD

For continuous integration, add these commands to your CI pipeline:

```yaml
steps:
  - name: Install dependencies
    run: npm ci
  
  - name: Generate TypeScript types
    run: npm run generate:types
  
  - name: Validate TypeScript
    run: npm run validate:typescript
```

### First-time Setup for Contributors

For new contributors to the project, include these setup instructions in your onboarding documentation:

```bash
# Clone the repository
git clone https://github.com/your-org/Fluxori-V2.git
cd Fluxori-V2/backend

# Install dependencies
npm install

# Set up TypeScript error prevention system
npm run setup:typescript

# Generate types
npm run generate:types

# Verify installation
npm run validate:typescript
```

## Advanced Usage

### Adding Custom Utility Types

To add custom utility types, add TypeScript files to `src/types/utility`.

### Modifying Generated Types

Generated types should not be modified directly. Instead:
1. Modify the source (models, controllers, etc.)
2. Re-run the type generator

### Extending ESLint Rules

To add custom ESLint rules:
1. Edit `.eslintrc.enhanced.js`
2. Add rules to `scripts/eslint-plugins/eslint-plugin-mongoose.js`