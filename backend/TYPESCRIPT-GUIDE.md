# TypeScript Guide for Fluxori-V2 Backend

This guide outlines how to work with TypeScript in the Fluxori-V2 backend codebase, particularly addressing challenges with the Xero connector module and other problematic files.

## Quick Start

For immediate development without TypeScript blocking:

```bash
# Run development server ignoring TypeScript errors
npm run dev:ignore-errors

# Check TypeScript errors without blocking build
npm run typecheck:ignore-errors
```

## TypeScript Error Handling Strategy

We've implemented several strategies to deal with TypeScript errors in the codebase:

1. **Excluded Problematic Modules**:
   - The Xero connector module is excluded from TypeScript checking
   - Several other problematic files are also excluded in tsconfig.json

2. **Added Type Declarations**:
   - Added `src/types/xero-node.d.ts` for the Xero API
   - Added other type declarations for third-party libraries

3. **Strategic `@ts-nocheck` Usage**:
   - Added to test files and files with structural TypeScript issues
   - Allows development to continue while gradually improving type safety

## Running TypeScript Commands

```bash
# Normal build (may fail due to TypeScript errors)
npm run build

# Build ignoring TypeScript errors
npm run build:ignore-errors

# Development with TypeScript checks
npm run dev

# Development ignoring TypeScript errors
npm run dev:ignore-errors

# TypeScript check with normal output
npm run typecheck

# TypeScript check with full error messages
npm run typecheck:ignore-errors

# Fix common TypeScript errors
npm run fix:ts
```

## Using TypeScript Properly

When working on the codebase:

1. Always add proper types to new code:
   ```typescript
   // Good
   function addNumbers(a: number, b: number): number {
     return a + b;
   }
   
   // Avoid
   function addNumbers(a, b) {
     return a + b;
   }
   ```

2. For problematic areas, use targeted ignores:
   ```typescript
   // Use targeted ignores with explanations
   // @ts-ignore: The xero-node library has incomplete type definitions
   const tokenSet = await xeroClient.getTokenSet();
   ```

3. Fix TypeScript errors incrementally:
   - Focus on one module or file at a time
   - Start with core business logic before tests
   - Use the automated scripts in the `scripts/` directory

## Automated Fixing Scripts

This project includes several automated scripts for fixing TypeScript errors:

```bash
# Fix syntax errors
npm run fix:syntax

# Fix critical TypeScript errors
npm run fix:critical

# Fix test files
npm run fix:test-files

# Fix remaining errors
npm run fix:remaining

# Add any-assertions where needed
npm run fix:any

# Fix import statements
npm run fix:imports

# Run all fixers
npm run fix:all
```

## Xero Integration

The Xero connector module has complex TypeScript issues due to:
1. Third-party library with incomplete type definitions
2. Complex authentication flow with many dynamic types
3. Integration patterns that are difficult to type properly

When working with the Xero module:
1. Use the type declarations in `src/types/xero-node.d.ts`
2. Refer to `XERO-TYPESCRIPT-GUIDE.md` for specific patterns
3. Use `// @ts-ignore` comments for Xero-specific issues

## Future TypeScript Improvements

Our roadmap for improving TypeScript support:
1. Gradually remove `@ts-nocheck` directives
2. Improve type definitions for third-party libraries
3. Add comprehensive typing for all API endpoints
4. Implement stricter TypeScript checking in CI/CD

## Need Help?

If you encounter TypeScript issues:
1. Check the error message carefully
2. Run `npm run typecheck:ignore-errors` for full error output
3. Use the appropriate fixing script from the `scripts/` directory
4. For persistent issues, add a targeted `// @ts-ignore` comment with explanation