# Chakra UI v3 Automation Tools

This document describes the automated tools we've set up to enforce Chakra UI v3 patterns and prevent TypeScript errors.

## Table of Contents

1. [ESLint Rules](#eslint-rules)
2. [TypeScript Generation](#typescript-generation)
3. [Pre-commit Hooks](#pre-commit-hooks)
4. [Usage in CI/CD](#usage-in-cicd)
5. [Common Issues and Solutions](#common-issues-and-solutions)
6. [Implementation Details](#implementation-details)

## ESLint Rules

We've created custom ESLint rules to enforce Chakra UI v3 patterns:

### Import Pattern Check

The `chakra-ui-v3/imports` rule checks for and automatically fixes incorrect import patterns:

```javascript
// ❌ Incorrect
import { Box, Button } from '@chakra-ui/react';

// ✅ Correct (auto-fixed)
import { Box } from '@chakra-ui/react/box';
import { Button } from '@chakra-ui/react/button';
```

### Prop Pattern Check

The `chakra-ui-v3/props` rule checks for and fixes deprecated prop names:

```jsx
// ❌ Incorrect
<Button isLoading={loading} isDisabled={disabled}>Submit</Button>

// ✅ Correct (auto-fixed)
<Button loading={loading} disabled={disabled}>Submit</Button>
```

It also checks for `spacing` vs `gap` usage:

```jsx
// ❌ Incorrect
<Stack spacing={4}>...</Stack>

// ✅ Correct (auto-fixed)
<Stack gap={4}>...</Stack>
```

### Type Declarations Check

The `chakra-ui-v3/types` rule reminds you to add type declarations for Chakra UI components:

```
Warning: This file uses Chakra UI v3 components (Button, Card) but doesn't mention type declarations. Ensure these components are declared in 'src/types/chakra-ui.d.ts'
```

## TypeScript Generation

We've created a script to automatically generate TypeScript declarations for Chakra UI v3 components:

### Running the Generator

```bash
npm run gen:chakra-types
```

This script:

1. Scans the codebase for Chakra UI component usage
2. Identifies components that lack type declarations
3. Generates and adds missing declarations to `src/types/chakra-ui.d.ts`

### When to Run

Run the type generator:

- After adding new Chakra UI components
- Before running type checks if you're getting errors
- As part of your development workflow

## Pre-commit Hooks

We use Husky and lint-staged to enforce Chakra UI v3 patterns before code is committed:

### TypeScript Check

The pre-commit hook automatically runs `tsc --noEmit` on staged TypeScript files to catch type errors.

### ESLint Checks

The hook also runs ESLint with our custom rules to enforce Chakra UI v3 patterns.

## Usage in CI/CD

Our CI/CD pipeline includes checks for Chakra UI v3 compliance:

### Lint Job

```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm ci
    - run: npm run lint:chakra
```

### Type Check Job

```yaml
typecheck:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm ci
    - run: npm run gen:chakra-types
    - run: npm run typecheck
```

## Common Issues and Solutions

### Missing Type Declarations

**Issue**: TypeScript error about missing Chakra UI component declarations
**Solution**: Run `npm run gen:chakra-types` to generate missing declarations

### Incorrect Import Pattern

**Issue**: ESLint warning about Chakra UI barrel imports
**Solution**: Run `npm run lint:chakra --fix` to automatically fix imports

### Deprecated Prop Names

**Issue**: ESLint warning about deprecated `is`-prefixed props
**Solution**: Update to the new prop names (e.g., `loading` instead of `isLoading`)

### No Auto Fix Applied

**Issue**: Auto-fixes aren't being applied
**Solution**: Make sure you have the correct ESLint configuration and are using the `--fix` flag

## Implementation Details

### ESLint Custom Rules Implementation

Our ESLint rules are implemented in the `/eslint-custom-rules` directory:

1. **Chakra UI Import Pattern Rule** (`chakra-ui-v3-imports.js`):
   - Detects use of the deprecated barrel import pattern
   - Maintains a comprehensive mapping of Chakra UI component names to their module paths
   - Automatically fixes imports by transforming them to direct imports
   - Handles multiple components being imported from the same module

2. **Component Mapping System**:
   - The rule contains an exhaustive map of Chakra components (80+ components)
   - Each component is mapped to its appropriate direct import path
   - Components sharing the same module (like `Card`, `CardHeader`, etc.) are grouped correctly

### Type Generation Script

Our `generate-chakra-types.js` script:

1. **Component Detection**:
   - Scans all TypeScript files in the codebase for Chakra UI usage
   - Detects component usage through both import statements and JSX tags

2. **Smart Type Generation**:
   - Generates specialized type definitions for complex components
   - Includes updated prop names (e.g., `loading` instead of `isLoading`)
   - Handles component hierarchies (parent/child components)

3. **Efficiency**:
   - Only adds declarations for components actually used in the codebase
   - Avoids duplicating existing declarations

### Pre-commit Hook Configuration

We've configured Husky and lint-staged in our project:

1. **Husky Setup**:
   - The `.husky/pre-commit` hook:
     - Detects modified TypeScript files
     - Runs TypeScript checks only when TypeScript files are modified
     - Executes lint-staged for ESLint checks

2. **lint-staged Configuration**:
   - Configured in `package.json` to:
     - Run ESLint with auto-fix on staged TypeScript files
     - Run type checking on affected files using `tsc-files`
     - Prevents commits if either check fails

3. **npm Scripts**:
   - Added custom npm scripts for running our tools:
     - `lint:chakra`: Runs ESLint with our custom Chakra UI rules
     - `gen:chakra-types`: Runs the type declaration generator script
     - `typecheck`: Runs TypeScript type checking

These automation tools are designed to work together to provide a robust safety net for preventing TypeScript errors related to Chakra UI v3 usage. The combination of ESLint rules, type generation, and pre-commit hooks ensures consistent and correct usage of Chakra UI throughout the codebase.

## Conclusion

These automation tools help ensure consistent usage of Chakra UI v3 patterns, preventing TypeScript errors and maintaining code quality. By using these tools regularly, we can avoid the common pitfalls associated with the Chakra UI v3 migration.