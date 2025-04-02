# TypeScript Automation Notes

This document contains notes on the TypeScript automation tools and patterns used in the project.

## Key Patterns

### 1. `as any` Type Assertions for Shopify Adapter

All Shopify adapter service files use `as any` type assertions for client method calls to handle type mismatches between AdminRestApiClient and REST client methods.

```typescript
// Pattern used consistently across all Shopify adapter services
const response = await this.client.get('some/path', options) as any;
return response as { specific: TypedResponse };
```

### 2. REST Method Conversion

We've converted all `client.request()` calls to specific REST methods for better type compatibility:

```typescript
// Old pattern
const response = await this.client.request({
  method: 'GET',
  path: 'some/path',
  query: params
});

// New pattern
const response = await this.client.get('some/path', {
  searchParams: params
}) as any;
```

### 3. TypeScript Validation

Pre-commit hooks validate TypeScript code to ensure no new type errors are introduced:

- **Pattern detection**: Detects potentially problematic patterns like excessive `any` usage
- **Type checking**: Runs TypeScript compiler to catch type errors
- **Error prevention**: Blocks commits with TypeScript errors

## Automation Scripts

The project includes several automation scripts for TypeScript maintenance:

1. **fix-typescript-files.js**: Main script to fix TypeScript issues
2. **add-any-assertions.js**: Adds `as any` type assertions to client method calls
3. **convert-request-to-methods.js**: Converts generic requests to specific REST methods
4. **fix-integration-tests.js**: Fixes corrupted integration test files
5. **fix-unit-tests.js**: Fixes corrupted unit test files
6. **fix-email-utility.js**: Fixes utility files with TypeScript issues
7. **typescript-validator.js**: Pre-commit hook script to validate TypeScript

## Best Practices

When working with the Shopify adapter or similar external APIs:

1. **Be consistent with type assertions**: Use the established pattern of `as any` followed by specific type assertion
2. **Use specific REST methods**: Prefer `client.get()`, `client.post()`, etc. over `client.request()`
3. **Run validation before commits**: Use `npm run typecheck:enhanced` to check for TypeScript errors

## Common Issues and Solutions

1. **Property does not exist on type 'AdminRestApiClient'**:
   - Add `as any` to the client method call
   - Example: `await this.client.get('path', options) as any;`

2. **Type mismatch between response and expected type**:
   - Add specific type assertion after `as any`
   - Example: `return response as { specific: TypedResponse };`

3. **Test file corruption**:
   - Run `node scripts/fix-typescript-files.js` to fix corrupted test files

## Maintenance

Regular maintenance tasks:

1. Run TypeScript validation: `npm run typecheck:enhanced`
2. Update pre-commit hooks if needed: `npm run husky:use-enhanced`
3. Generate updated types: `npm run generate:enhanced-types`