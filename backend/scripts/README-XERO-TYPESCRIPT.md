# Xero TypeScript Support Scripts

This directory contains specialized scripts for handling TypeScript errors in the Xero connector module.

## Overview

The Xero connector module uses the `xero-node` package which has TypeScript compatibility issues. These scripts provide various workarounds to enable type checking while minimizing errors.

## Available Scripts

### 1. `fix-xero-test-files.js`

Fixes common syntax and type issues in Xero test files.

Usage:
```bash
node scripts/fix-xero-test-files.js
```

### 2. `ts-fix-promise-patterns.js`

Advanced script that fixes Promise-related TypeScript errors in test files.

Usage:
```bash
# Fix all test files in the src directory
node scripts/ts-fix-promise-patterns.js

# Specify a different path
node scripts/ts-fix-promise-patterns.js --path=src/modules/xero-connector/

# Dry run to see changes without applying them
node scripts/ts-fix-promise-patterns.js --dryrun

# Show detailed logging
node scripts/ts-fix-promise-patterns.js --verbose
```

### 3. `bypass-xero-module.js`

Adds `@ts-nocheck` to all Xero-related files to bypass TypeScript errors.

Usage:
```bash
node scripts/bypass-xero-module.js
```

### 4. `fix-xero-module.js`

Comprehensive script that adds type declarations and fixes key typing issues.

Usage:
```bash
node scripts/fix-xero-module.js
```

## Recommended Approach

When facing TypeScript errors in the Xero connector:

1. First, try running the fix-xero-test-files.js script
2. If errors persist, apply ts-fix-promise-patterns.js with the xero path
3. For remaining errors, use bypass-xero-module.js as a last resort
4. Always run TypeScript with --skipLibCheck flag for Xero files

## Documentation

For detailed information on working with TypeScript in the Xero connector module, see:
[XERO-TYPESCRIPT-GUIDE.md](/home/tarquin_stapa/Fluxori-V2/backend/XERO-TYPESCRIPT-GUIDE.md)