// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Disable uncaught exception handling in Cypress to help with React 18 async rendering
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Preserve cookies between tests to maintain login state
beforeEach(() => {
  Cypress.Cookies.preserveOnce('auth_token', 'session_id');
});

// Make sure localStorage items persist between tests
Cypress.Commands.add('saveLocalStorage', () => {
  const ls = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    ls[key] = localStorage.getItem(key);
  }
  cy.wrap(ls).as('localStorage');
});

Cypress.Commands.add('restoreLocalStorage', () => {
  cy.get('@localStorage').then((ls) => {
    for (const key in ls) {
      localStorage.setItem(key, ls[key]);
    }
  });
});