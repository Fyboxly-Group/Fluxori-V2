# Rebuild Plan for Fluxori-V2 Backend

This document outlines the plan for rebuilding severely broken TypeScript files in the Fluxori-V2 backend.

## Problem

We identified 51 severely broken TypeScript files with thousands of errors. Since the project is in early development, it's more efficient to rebuild these files from scratch with proper TypeScript typing rather than trying to fix all the errors.

## Categories of Files to Rebuild

1. **Routes Tests (8 files)** - Test files for API routes
2. **Service Files (12 files)** - Service layer files
3. **Adapters and Others (31 files)** - API adapters and utility files

## Implementation Plan

### Phase 1: Preparation (Complete)

1. ✅ Create a script to identify severely broken files
2. ✅ Create template files for different file types
3. ✅ Document the rebuild approach

### Phase 2: Routes Tests (Week 1)

1. Review the original `.backup` files to understand functionality
2. Rebuild one test file using the template
3. Verify it passes TypeScript checks
4. Continue with remaining test files

Priority order:
- [ ] src/routes/milestone.routes.test.ts (331 errors)
- [ ] src/routes/customer.routes.test.ts (320 errors)
- [ ] src/routes/inventory.routes.test.ts (312 errors)
- [ ] src/routes/inventory-alert.routes.test.ts (307 errors)
- [ ] src/routes/analytics.routes.test.ts (238 errors)
- [ ] src/routes/auth.routes.test.ts (234 errors)
- [ ] src/routes/dashboard.routes.test.ts (216 errors)
- [ ] src/routes/project.routes.test.ts (123 errors)

### Phase 3: Service Files (Week 2)

1. Review the original `.backup` files to understand functionality
2. Rebuild one service file using the template
3. Verify it passes TypeScript checks
4. Continue with remaining service files

Priority order (top 5):
- [ ] src/modules/ai-cs-agent/services/vertex-ai.service.ts (204 errors)
- [ ] src/modules/international-trade/services/international-trade.service.ts (161 errors)
- [ ] src/modules/ai-cs-agent/services/conversation.service.ts (159 errors)
- [ ] src/modules/rag-retrieval/services/document.service.ts (136 errors)
- [ ] src/modules/marketplaces/services/marketplace-sync.service.ts (131 errors)

### Phase 4: Adapters and Others (Weeks 3-4)

1. Review the original `.backup` files to understand functionality
2. Group files by related functionality
3. Rebuild one adapter file using the template
4. Verify it passes TypeScript checks
5. Continue with remaining adapter files

Priority order (top 5):
- [ ] src/modules/marketplaces/adapters/amazon/inventory/inventory-planning.ts (557 errors)
- [ ] src/modules/international-trade/adapters/fedex/fedex.adapter.ts (363 errors)
- [ ] src/modules/marketplaces/adapters/takealot/takealot.adapter.ts (328 errors)
- [ ] src/modules/marketplaces/adapters/takealot/takealot-adapter.ts (322 errors)
- [ ] src/modules/marketplaces/adapters/amazon/pricing/product-pricing.ts (307 errors)

### Phase 5: Integration and Testing (Week 5)

1. Ensure all rebuilt files work together
2. Run the full test suite
3. Fix any remaining integration issues
4. Verify overall TypeScript compliance

## Guidelines for Rebuilding

1. **Type Everything**: Use proper TypeScript interfaces and types
2. **Follow Patterns**: Maintain consistent code patterns across files
3. **Document**: Add JSDoc comments for all functions
4. **Error Handling**: Implement proper try/catch blocks
5. **Clean Structure**: Organize code logically
6. **Test Coverage**: Ensure tests cover core functionality

## Work Assignment

Each developer should:
1. Check out a new branch for each file being rebuilt
2. Reference the original `.backup` file for functionality
3. Use the appropriate template
4. Run TypeScript check before committing
5. Create a PR for review

## Monitoring Progress

Track progress by:
1. Counting remaining TypeScript errors: `npx tsc --noEmit | grep -c "error TS"`
2. Keeping a list of files that have been rebuilt
3. Weekly status updates