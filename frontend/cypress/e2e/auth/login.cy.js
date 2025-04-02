describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.findByRole('heading', { name: /sign in/i }).should('exist');
    cy.findByLabelText(/email/i).should('exist');
    cy.findByLabelText(/password/i).should('exist');
    cy.findByRole('button', { name: /sign in/i }).should('exist');
    cy.findByText(/forgot password/i).should('exist');
  });

  it('should validate form inputs', () => {
    // Try submitting empty form
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.findByText(/email is required/i).should('exist');
    cy.findByText(/password is required/i).should('exist');

    // Try invalid email format
    cy.findByLabelText(/email/i).type('invalid-email');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.findByText(/invalid email format/i).should('exist');

    // Try short password
    cy.findByLabelText(/email/i).clear().type('test@example.com');
    cy.findByLabelText(/password/i).type('123');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.findByText(/password must be at least 6 characters/i).should('exist');
  });

  it('should handle unsuccessful login', () => {
    // Mock failed login response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    }).as('loginRequest');

    cy.findByLabelText(/email/i).type('wrong@example.com');
    cy.findByLabelText(/password/i).type('wrongpassword');
    cy.findByRole('button', { name: /sign in/i }).click();

    cy.wait('@loginRequest');
    cy.findByText(/invalid credentials/i).should('exist');
  });

  it('should handle successful login', () => {
    // Mock successful login response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      }
    }).as('loginRequest');

    cy.findByLabelText(/email/i).type('admin@example.com');
    cy.findByLabelText(/password/i).type('password123');
    cy.findByRole('button', { name: /sign in/i }).click();

    cy.wait('@loginRequest');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Should store auth token
    cy.window().its('localStorage')
      .invoke('getItem', 'authToken')
      .should('exist');
  });

  it('should navigate to forgot password page', () => {
    cy.findByText(/forgot password/i).click();
    cy.url().should('include', '/forgot-password');
  });
});