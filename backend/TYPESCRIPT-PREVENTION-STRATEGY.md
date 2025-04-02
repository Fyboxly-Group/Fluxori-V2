# TypeScript Error Prevention Strategy

This document outlines our strategy for preventing TypeScript errors in production code and enforcing stronger TypeScript adoption.

## Core Principles

1. **Zero Tolerance for `@ts-nocheck` in Production Code**: We only allow `@ts-nocheck` in test files, never in production code.
2. **Fail Early**: Catch TypeScript errors during development, not in CI/CD or production.
3. **Automated Prevention**: Use tools to automate type checking and enforcement.
4. **Incremental Adoption**: Strengthen TypeScript usage gradually but consistently.

## Implementation Strategy

### 1. Git Hooks with Husky

Set up pre-commit hooks that run TypeScript validation:

```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run TypeScript check on production code (not tests)
npm run typecheck:src

# Only if src type checking succeeds, run lint-staged
if [ $? -eq 0 ]; then
  npx lint-staged
else
  echo "❌ TypeScript check failed, commit rejected"
  exit 1
fi
```

### 2. ESLint Rules for TypeScript Enforcement

Strengthen ESLint configuration with strict TypeScript rules:

```javascript
// .eslintrc.enhanced.js
module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    // Ban @ts-nocheck in production code
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-nocheck': 'error',
        'ts-ignore': 'error',
        'ts-expect-error': {
          descriptionFormat: '^: TS\\d+: .+$'
        }
      }
    ],
    
    // Enforce explicit types
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    
    // Explicitly allow @ts-nocheck only in test files
    'overrides': [
      {
        'files': ['**/*.test.ts', '**/tests/**/*.ts'],
        'rules': {
          '@typescript-eslint/ban-ts-comment': 'off',
          '@typescript-eslint/no-explicit-any': 'off',
        }
      }
    ]
  }
}
```

### 3. Automated Type Generation

Create and maintain a type generation system for MongoDB models, API responses, and third-party integrations:

```javascript
// scripts/generate-types.js

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mongoose = require('mongoose');

/**
 * Generate TypeScript interfaces from Mongoose schemas
 */
function generateMongooseTypes() {
  const modelFiles = glob.sync('src/**/*.model.ts');
  
  for (const file of modelFiles) {
    const modelName = path.basename(file, '.model.ts');
    const pascalCase = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    
    // Create interface file
    const interfaceContent = `
import { Document, Types } from 'mongoose';

// Base interface (raw data without Document methods)
export interface I${pascalCase} {
  // Properties will be added by generation script
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Document interface (base + Document methods)
export interface I${pascalCase}Document extends Document, I${pascalCase} {
  // Add document-specific methods here
}

// Model interface
export interface I${pascalCase}Model extends mongoose.Model<I${pascalCase}Document> {
  // Add static model methods here
}
`;
    
    const outputPath = file.replace('.model.ts', '.types.ts');
    fs.writeFileSync(outputPath, interfaceContent);
  }
}

// Run type generation
generateMongooseTypes();
```

### 4. Template-Based Development

Provide TypeScript-compliant templates for common patterns:

```typescript
// templates/controller.template.ts
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export class TemplateController {
  /**
   * Get all items
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Implementation
      res.status(200).json({ success: true, data: [] });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get item by ID
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = new Types.ObjectId(req.params.id);
      // Implementation
      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      next(error);
    }
  }
  
  // Other controller methods...
}
```

### 5. Custom Type Definitions for Common Patterns

Create utility types for common patterns:

```typescript
// src/types/utility-types.ts

import { Types } from 'mongoose';

/**
 * Safely converts a string or ObjectId to ObjectId
 */
export function toObjectId(id: string | Types.ObjectId): Types.ObjectId {
  if (id instanceof Types.ObjectId) {
    return id;
  }
  return new Types.ObjectId(id);
}

/**
 * Result pattern for error handling
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure<E> {
  success: false;
  error: E;
}
```

### 6. CI/CD Pipeline Enforcement

Add TypeScript validation to CI/CD pipeline:

```yaml
# .github/workflows/typescript-validation.yml
name: TypeScript Validation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: TypeScript check - Production code
        run: npm run typecheck:src
      - name: TypeScript check - Test code
        run: npm run typecheck:test
```

### 7. Documentation and Automated Code Analysis

Create comprehensive documentation and code quality tools:

```javascript
// scripts/ts-quality-report.js
const fs = require('fs');
const { execSync } = require('child_process');

// Run analysis
const anyUsage = execSync('grep -r "any" src/ --include="*.ts" | grep -v "test.ts" | wc -l').toString().trim();
const ignoreUsage = execSync('grep -r "@ts-ignore" src/ --include="*.ts" | grep -v "test.ts" | wc -l').toString().trim();
const noCheckUsage = execSync('grep -r "@ts-nocheck" src/ --include="*.ts" | grep -v "test.ts" | wc -l').toString().trim();

const report = `
# TypeScript Quality Report

| Metric | Count | Recommendation |
|--------|-------|----------------|
| \`any\` usage | ${anyUsage} | Replace with proper types |
| \`@ts-ignore\` usage | ${ignoreUsage} | Remove and fix underlying issue |
| \`@ts-nocheck\` usage | ${noCheckUsage} | CRITICAL: Remove from production code |

## Recommendations

- Remove all \`@ts-nocheck\` pragmas from production code
- Replace \`any\` with proper types or generic constraints
- Address \`@ts-ignore\` comments with proper typings
`;

fs.writeFileSync('typescript-quality-report.md', report);
```

### 8. Type-Safe API Layer

Create a type-safe API layer:

```typescript
// src/types/api-types.ts
import { Response } from 'express';

/**
 * Type-safe API response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    total?: number;
    limit?: number;
  };
}

/**
 * Send type-safe API response
 */
export function sendResponse<T>(res: Response, statusCode: number, response: ApiResponse<T>): void {
  res.status(statusCode).json(response);
}
```

## Implementation Steps

1. Set up Husky pre-commit hooks
2. Configure enhanced ESLint rules
3. Create automated type generation scripts
4. Build templates for new components
5. Implement utility types
6. Add CI/CD pipeline validation
7. Create documentation
8. Develop a type-safe API layer

## Monitoring and Enforcement

1. Run weekly TypeScript quality reports
2. Track metrics on TypeScript adoption and error rates
3. Perform code reviews with emphasis on TypeScript compliance
4. Hold regular TypeScript training sessions for developers