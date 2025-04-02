// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Import Testing Library commands
import '@testing-library/cypress/add-commands';

// Custom login command
Cypress.Commands.add('login', (email = 'admin@example.com', password = 'password123') => {
  cy.visit('/login');
  cy.findByLabelText(/email/i).type(email);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole('button', { name: /sign in/i }).click();
  // Wait for navigation to complete
  cy.url().should('include', '/dashboard');
});

// Navigate to a section in the app shell
Cypress.Commands.add('navigateToSection', (section) => {
  cy.get('[data-testid="sidebar"]').findByText(section).click();
  cy.url().should('include', section.toLowerCase().replace(/\s+/g, '-'));
});