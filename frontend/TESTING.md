# Testing Guide for Fluxori-V2 Frontend

This document outlines the testing infrastructure, practices, and guidelines for the Fluxori-V2 frontend application.

## Testing Philosophy

Our testing approach is built on the following principles:

1. **Test Behavior, Not Implementation** - Focus on what the component does, not how it's built.
2. **Test from User Perspective** - Tests should simulate how users interact with the application.
3. **Isolated Tests** - Components should be tested in isolation with proper mocking.
4. **Comprehensive Coverage** - Critical paths and edge cases should be covered.
5. **Fast and Reliable** - Tests should run quickly and produce consistent results.

## Testing Levels

### 1. Unit Tests

Unit tests focus on testing individual components or functions in isolation. We use Jest and React Testing Library for unit testing.

- **Location**: `/src/components/*/__tests__/*.test.tsx`
- **Naming Convention**: `ComponentName.test.tsx`
- **Coverage Target**: 80% of all components and utilities

### 2. Integration Tests

Integration tests verify that different parts of the application work together correctly. These tests focus on component compositions and data flow.

- **Location**: `/src/features/*/__tests__/*.test.tsx`
- **Naming Convention**: `FeatureName.test.tsx`
- **Coverage Target**: All key feature flows

### 3. End-to-End Tests

End-to-end tests simulate user journeys through the application, testing critical paths from start to finish. We use Cypress for E2E testing.

- **Location**: `/cypress/e2e/*/*.cy.js`
- **Naming Convention**: `feature-flow.cy.js`
- **Coverage Target**: All critical user flows

## Testing Tools

### Jest & React Testing Library

Jest is our main testing framework, complemented by React Testing Library for component testing.

- **Jest Configuration**: `jest.config.js`
- **Setup File**: `jest.setup.js`
- **Test Utilities**: `src/utils/test-utils.tsx`

Key utilities:
- Custom render function with all providers
- Mock implementations of GSAP animations
- Mock implementations of complex components (date pickers, color pickers)

### Mock Service Worker (MSW)

MSW is used to mock API requests for component tests:

- **Server Setup**: `src/mocks/server.ts`
- **Request Handlers**: `src/mocks/handlers.ts`
- **Mock Data**: `src/mocks/userManagementData.ts` (and others)

### Cypress

Cypress is used for end-to-end testing:

- **Configuration**: `cypress.config.js`
- **Custom Commands**: `cypress/support/commands.js`
- **E2E Tests**: `cypress/e2e/`

## Testing Commands

```bash
# Run all Jest tests
npm test

# Run Jest tests in watch mode
npm run test:watch

# Run Jest tests with coverage report
npm run test:coverage

# Run Cypress tests in interactive mode
npm run cypress

# Run Cypress tests in headless mode
npm run cypress:run

# Run Cypress tests after starting the dev server
npm run test:e2e
```

## Best Practices

### Component Testing

1. **Mock External Dependencies**

```javascript
// Mock hook dependencies
jest.mock('@/hooks/user-management/useUsers', () => {
  const originalModule = jest.requireActual('@/hooks/user-management/useUsers');
  return {
    ...originalModule,
  };
});

// Mock animations
jest.mock('gsap', () => ({
  fromTo: jest.fn(),
  to: jest.fn(),
}));
```

2. **Test Component Rendering**

```javascript
it('renders the user list correctly', async () => {
  render(<UserList />);
  
  // Wait for the users to load
  await waitFor(() => {
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
  });
  
  // Check if the table headers are present
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('Email')).toBeInTheDocument();
});
```

3. **Test User Interactions**

```javascript
it('filters users by search term', async () => {
  render(<UserList />);
  
  // Enter search term
  const searchInput = screen.getByPlaceholderText('Search users...');
  fireEvent.change(searchInput, { target: { value: 'admin' } });
  
  // Wait for filtered results
  await waitFor(() => {
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
  });
});
```

4. **Test Error States**

```javascript
it('handles error state correctly', async () => {
  // Override the server handler to return an error
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'Server error' }));
    })
  );
  
  render(<UserList />);
  
  // Wait for the error state to appear
  await waitFor(() => {
    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });
});
```

### End-to-End Testing

1. **Use Custom Commands for Common Operations**

```javascript
// In cypress/support/commands.js
Cypress.Commands.add('login', (email = 'admin@example.com', password = 'password123') => {
  cy.visit('/login');
  cy.findByLabelText(/email/i).type(email);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole('button', { name: /sign in/i }).click();
  cy.url().should('include', '/dashboard');
});

// In test file
beforeEach(() => {
  cy.login();
  cy.navigateToSection('User Management');
});
```

2. **Mock API Responses**

```javascript
// Mock API response
cy.intercept('GET', '/api/users*', {
  statusCode: 200,
  body: {
    items: [/* mock data */],
    total: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1
  }
}).as('getUsers');

// Wait for the API call to complete
cy.wait('@getUsers');
```

3. **Test Complete User Flows**

```javascript
it('should create a new user', () => {
  // Set up mocks for each step of the process
  cy.intercept('POST', '/api/users', {/* mock response */}).as('createUser');
  
  // Start the flow
  cy.findByText('Invite User').click();
  
  // Fill out the form
  cy.findByLabelText('Email').type('new.user@example.com');
  cy.findByLabelText('First Name').type('New');
  cy.findByLabelText('Last Name').type('User');
  
  // Submit the form
  cy.findByText('Create User').click();
  
  // Wait for API call and verify success
  cy.wait('@createUser');
  cy.findByText('User created successfully').should('exist');
});
```

## Testing Organization

### What to Test

- **Component Props & State**: Test that components respond correctly to different props and state changes.
- **User Interactions**: Test that user interactions (clicks, inputs, etc.) produce the expected results.
- **Error States**: Test that components handle error states appropriately.
- **Loading States**: Test that loading states are displayed correctly.
- **API Interactions**: Test that components interact correctly with APIs.
- **Edge Cases**: Test boundary conditions and edge cases.

### What Not to Test

- **Implementation Details**: Avoid testing component internals that might change.
- **Third-Party Libraries**: Assume that well-established libraries work as expected.
- **Trivial Code**: Don't test simple getters/setters or pass-through functions.
- **Static Content**: Don't test that static text is rendered correctly.

## Continuous Integration

Our CI pipeline runs all Jest and Cypress tests on each pull request:

- **Jest Tests**: `npm run test:ci`
- **Cypress Tests**: `npm run test:e2e:ci`

## Test Coverage

We monitor test coverage through Jest's coverage reports. To generate a coverage report:

```bash
npm run test:coverage
```

The report is generated in the `coverage/` directory and shows:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

Our target coverage thresholds are:
- Overall: 80%
- Critical modules (auth, user management): 90%

## Adding New Tests

When adding a new feature or component:

1. Create unit tests for all new components
2. Update integration tests if the feature interacts with other components
3. Add end-to-end tests for critical user flows
4. Verify test coverage remains above thresholds

## Troubleshooting Common Issues

### Tests Failing Due to Animations

If tests fail because of GSAP animations, ensure all animations are properly mocked:

```javascript
jest.mock('gsap', () => ({
  fromTo: jest.fn(),
  to: jest.fn(),
  // Add any other GSAP methods used
}));
```

### Tests Failing Due to Date/Time Issues

Use fixed dates in tests to avoid time-based failures:

```javascript
// Mock a fixed date
const fixedDate = new Date('2025-01-01T00:00:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => fixedDate);
```

### Flaky Tests

For flaky tests:

1. Increase timeout values: `await waitFor(() => {...}, { timeout: 5000 })`
2. Use more specific selectors to avoid race conditions
3. Add additional wait conditions before assertions
4. Mock time-dependent operations with consistent values