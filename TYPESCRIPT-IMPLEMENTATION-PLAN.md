# TypeScript Implementation Plan for Fluxori-V2

After analyzing the codebase and TypeScript errors, I've developed a manual implementation plan to systematically address TypeScript issues in both the backend and frontend.

## Backend TypeScript Implementation

### Phase 1: Fix Core Type Definitions

1. **Remove @ts-nocheck from model type definitions**:
   - Replace `any` with specific types in model interfaces
   - Use `Types.ObjectId` for MongoDB IDs
   - Create proper type definitions for document interfaces

2. **Implement utility types**:
   - Replace generic types in mongo-util-types.ts
   - Create reusable types for API requests/responses
   - Implement proper error type definitions

3. **Address Express type extensions**:
   - Fix request/response type definitions
   - Implement proper AuthenticatedRequest interface
   - Use correct typing for middleware functions

### Phase 2: Module-by-Module Implementation

Starting with the most critical modules:

1. **Fix international-trade module**:
   - Remove @ts-nocheck directives
   - Implement proper typing for services and controllers
   - Use TypeScript for API responses

2. **Fix buybox module**:
   - Address repository typing issues
   - Implement service interface definitions
   - Fix controller typing

3. **Fix marketplace adapters**:
   - Implement adapter interface pattern
   - Use generics for marketplace operations
   - Create proper error handling types

### Phase 3: Fix Complex Areas

1. **Middleware typing**:
   - Fix multi-tenant authentication middleware
   - Implement proper Express request extensions
   - Create type guards for user authentication

2. **Error handling patterns**:
   - Implement typed error classes
   - Use type narrowing for error handling
   - Fix error middleware typing

3. **Services and controllers**:
   - Apply consistent return type patterns
   - Fix promise handling with proper typing
   - Implement controller type safety

## Frontend TypeScript Implementation

### Phase 1: Core Type Definitions

1. **API Interface Definitions**:
   - Create strongly typed API client
   - Define response interfaces
   - Implement error handling types

2. **Component Prop Types**:
   - Define prop interfaces for all components
   - Use Mantine component types
   - Implement event handler typing

3. **State Management Types**:
   - Define store state interfaces
   - Create action type definitions
   - Implement selector typing

### Phase 2: Feature-by-Feature Implementation

1. **Dashboard components**:
   - Fix component prop types
   - Implement proper event handler typing
   - Create typed hooks

2. **Form components**:
   - Use Mantine form types
   - Implement validation typing
   - Fix form state management

3. **Data visualization**:
   - Create chart data type definitions
   - Implement animation configuration types
   - Fix data transformation typing

## Implementation Approach

For each file needing fixes:

1. Remove @ts-nocheck directive
2. Run TypeScript compiler to identify errors
3. Fix each error using appropriate patterns:
   - Replace `any` with specific types
   - Add proper return types to functions
   - Use type guards for conditional logic
   - Fix object property access with optional chaining
   - Add proper generic parameters to interfaces and functions

4. Test the changes to ensure functionality is preserved
5. Document patterns used for future reference

## Example Patterns to Apply

### MongoDB Type Pattern:
```typescript
interface UserDocument extends Document {
  name: string;
  email: string;
  role: string;
}

interface UserModel extends Model<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
}
```

### Error Handling Pattern:
```typescript
try {
  // Implementation
} catch (error: unknown) {
  if (error instanceof ApiError) {
    // Handle API error
  } else if (error instanceof Error) {
    // Handle standard error
  } else {
    // Handle unknown error
  }
}
```

### Component Prop Pattern:
```typescript
interface DataTableProps {
  data: Array<Record<string, unknown>>;
  columns: Array<{
    accessor: string;
    header: string;
    render?: (value: unknown) => React.ReactNode;
  }>;
  loading?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
}
```

## Success Criteria

- All @ts-nocheck directives removed
- No usage of `any` type except where absolutely necessary
- Proper typing for MongoDB models and operations
- Type-safe API requests and responses
- Properly typed React components with Mantine integration
- Consistent error handling patterns
- All tests passing with TypeScript validation