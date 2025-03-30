# TypeScript Template Files

This directory contains template files for rebuilding TypeScript files in the Fluxori-V2 backend:

## Available Templates

1. `controller.template.ts` - Basic REST controller with TypeScript typing
2. `controller.test.template.ts` - Tests for a controller
3. `route.test.template.ts` - Tests for API routes
4. `service.template.ts` - Service layer with TypeScript interfaces
5. `adapter.template.ts` - External API adapter with TypeScript typing

## How to Use

1. Copy the appropriate template file to the correct location
2. Rename the file to match the resource (e.g., `user.controller.ts`)
3. Replace generic terms like "Resource" with the actual resource name
4. Implement the actual business logic
5. Run TypeScript check to ensure typing is correct: `npx tsc --noEmit`

## Example for rebuilding a controller

```bash
# Copy template
cp templates/controller.template.ts src/controllers/user.controller.ts

# Edit the file
# - Replace "Resource" with "User"
# - Implement actual logic using UserModel
# - Add any specific methods needed for users

# Verify TypeScript
npx tsc --noEmit src/controllers/user.controller.ts
```

## Best Practices

1. Use proper TypeScript typing for all parameters and return values
2. Add JSDoc comments to document functions
3. Use async/await pattern for asynchronous operations
4. Implement proper error handling with try/catch blocks
5. Use interfaces to define data structures
6. Follow RESTful API conventions
7. Keep controllers thin, with business logic in services