# Fluxori-V2 Code Standards and Patterns

This document outlines the coding standards, conventions, and patterns used throughout the Fluxori-V2 project to ensure consistency, maintainability, and quality.

## General Guidelines

### File and Directory Naming

- **Backend**:
  - Use kebab-case for file names (e.g., `inventory-controller.ts`, `auth-middleware.ts`)
  - Use singular form for models (e.g., `user.model.ts`, not `users.model.ts`)
  - Tests should have the `.test.ts` suffix (e.g., `inventory.controller.test.ts`)

- **Frontend**:
  - Use PascalCase for component files (e.g., `InventoryList.tsx`, `LoginForm.tsx`)
  - Use kebab-case for utility files (e.g., `api-client.ts`, `date-utils.ts`)
  - Use the `.spec.tsx` suffix for component tests

### Code Formatting

- Use Prettier for consistent formatting
- Tab width: 2 spaces
- Single quotes for strings
- Semicolons at the end of statements
- Trailing commas in multi-line object literals and arrays
- Maximum line length: 100 characters

### TypeScript Best Practices

- Explicitly declare types for variables, parameters, and return types
- Use interfaces to define the shape of objects
- Use type aliases for complex types or union types
- Avoid using `any` type when possible
- Use `unknown` instead of `any` when the type is truly unknown
- Use optional chaining (`?.`) and nullish coalescing (`??`) operators for safer code

## Backend Architecture

### MVC Pattern

The backend follows the Model-View-Controller (MVC) pattern:

- **Models**: Define the data structure and database schema
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Routes**: Define API endpoints and map them to controllers

### Error Handling

- Use a central error handling middleware
- Custom error classes extend the base `ApiError` class
- Controllers should use try-catch blocks and pass errors to the next middleware
- Errors should include appropriate HTTP status codes

### API Design

- RESTful conventions for routes
- Use versioning in the URL (e.g., `/api/v1/inventory`)
- Consistent response format:
  ```json
  {
    "success": true|false,
    "data": { ... } | [ ... ],
    "message": "Optional message",
    "errors": { ... } // Only present when success is false
  }
  ```
- Pagination should include:
  ```json
  {
    "count": 10,   // Items in current page
    "total": 100,  // Total items
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 10
    },
    "data": [ ... ]
  }
  ```

### Authentication and Authorization

- JWT-based authentication
- Role-based access control
- Use middleware to protect routes
- Include appropriate authorization checks in controllers

### Testing

- Write unit tests for individual components
- Write integration tests for API endpoints
- Use a separate test database (MongoDB Memory Server)
- Mock external dependencies
- Test happy paths and error cases
- Follow AAA pattern (Arrange, Act, Assert)

## Frontend Architecture

### Component Structure

- Use functional components with hooks
- Follow the container/presentational pattern:
  - Container components handle data fetching and state management
  - Presentational components focus on rendering and UI
- Keep components small and focused on a single responsibility

### State Management

- Use React Context for global state when appropriate
- Use Zustand for complex state management needs
- Keep form state local unless needed globally
- Follow immutability principles when updating state

### Performance Optimization

- Use React.memo for expensive components
- Use useMemo and useCallback hooks to prevent unnecessary re-renders
- Implement proper dependency arrays in useEffect and custom hooks
- Use windowing for long lists (react-window or react-virtualized)
- Implement code splitting with React.lazy and Suspense

### CSS and Styling

- Use TailwindCSS for styling
- Use consistent naming convention for custom classes
- Use CSS modules when needed to avoid style leakage
- Maintain a consistent color palette and spacing system

### Testing

- Write unit tests for components and hooks
- Write integration tests for connected components
- Use React Testing Library and Jest
- Test user interactions and rendering logic
- Snapshot testing for UI stability

## Documentation

- Document all API endpoints with Swagger/OpenAPI
- Add JSDoc comments to functions and components
- Use descriptive parameter and variable names
- Write meaningful commit messages following conventional commits
- Keep README and project documentation up to date

## Security Practices

- Sanitize user inputs
- Use HTTPS for all connections
- Implement proper CORS configuration
- Store sensitive information in environment variables
- Implement rate limiting for public endpoints
- Use parameterized queries to prevent injection attacks
- Regularly audit dependencies for vulnerabilities

## Development Workflow

- Use feature branches for development
- Write automated tests before merging
- Conduct code reviews
- Use CI/CD pipelines for automated testing and deployment
- Follow conventional commits for commit messages
- Keep PRs focused on a single feature or fix

---

This document will evolve as the project matures. All team members should follow these standards to maintain code quality and consistency.

Last Updated: April 29, 2025