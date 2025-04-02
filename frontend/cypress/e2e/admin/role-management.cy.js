describe('Role Management', () => {
  beforeEach(() => {
    // Mock roles API response
    cy.intercept('GET', '/api/roles', {
      statusCode: 200,
      body: [
        {
          id: 'role-admin',
          name: 'Administrator',
          description: 'Full access to all system functions and settings',
          permissions: [
            { scope: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'reports', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'settings', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'users', actions: ['view', 'create', 'edit', 'delete'] }
          ],
          isSystem: true
        },
        {
          id: 'role-manager',
          name: 'Manager',
          description: 'Manage inventory, orders, and reports',
          permissions: [
            { scope: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'reports', actions: ['view', 'create', 'edit'] },
            { scope: 'settings', actions: ['view'] },
            { scope: 'users', actions: ['view'] }
          ],
          isSystem: true
        },
        {
          id: 'role-custom',
          name: 'Custom Role',
          description: 'Custom role for testing',
          permissions: [
            { scope: 'inventory', actions: ['view', 'create'] },
            { scope: 'orders', actions: ['view'] }
          ],
          isSystem: false
        }
      ]
    }).as('getRoles');

    // Log in and navigate to role management page
    cy.login();
    cy.navigateToSection('Role Management');
  });

  it('should display roles list', () => {
    cy.wait('@getRoles');
    
    cy.findByText('Administrator').should('exist');
    cy.findByText('Manager').should('exist');
    cy.findByText('Custom Role').should('exist');
    
    cy.findByText('Role Management').should('exist');
    cy.findByText('Roles').should('exist');
  });

  it('should select a role and display its permissions', () => {
    cy.wait('@getRoles');
    
    // Click on Administrator role
    cy.contains('.role-card', 'Administrator').click();
    
    // Should show permissions matrix
    cy.findByText('Permissions').should('exist');
    cy.findByText('inventory').should('exist');
    cy.findByText('orders').should('exist');
    cy.findByText('reports').should('exist');
    cy.findByText('settings').should('exist');
    cy.findByText('users').should('exist');
    
    // Should show all permissions checked
    cy.get('svg[color="green"]').should('have.length.at.least', 20); // All permissions are checked
  });

  it('should enter edit mode when clicking Edit Role button', () => {
    cy.wait('@getRoles');
    
    // Click on Custom Role
    cy.contains('.role-card', 'Custom Role').click();
    
    // Click Edit Role button
    cy.findByText('Edit Role').click();
    
    // Should show edit mode UI
    cy.findByText('Save Changes').should('exist');
    cy.findByText('Cancel').should('exist');
    cy.findByText('Apply Template').should('exist');
    
    // Should show checkboxes instead of icons
    cy.get('input[type="checkbox"]').should('have.length.at.least', 10);
  });

  it('should create a new role', () => {
    cy.wait('@getRoles');
    
    // Mock create role API response
    cy.intercept('POST', '/api/roles', {
      statusCode: 201,
      body: {
        id: 'role-new',
        name: 'New Test Role',
        description: 'A new role created for testing',
        permissions: [
          { scope: 'inventory', actions: ['view'] },
          { scope: 'orders', actions: ['view'] }
        ],
        isSystem: false
      }
    }).as('createRole');
    
    // Mock updated roles list after creation
    cy.intercept('GET', '/api/roles', {
      statusCode: 200,
      body: [
        {
          id: 'role-admin',
          name: 'Administrator',
          description: 'Full access to all system functions and settings',
          permissions: [
            { scope: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'reports', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'settings', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'users', actions: ['view', 'create', 'edit', 'delete'] }
          ],
          isSystem: true
        },
        {
          id: 'role-manager',
          name: 'Manager',
          description: 'Manage inventory, orders, and reports',
          permissions: [
            { scope: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'reports', actions: ['view', 'create', 'edit'] },
            { scope: 'settings', actions: ['view'] },
            { scope: 'users', actions: ['view'] }
          ],
          isSystem: true
        },
        {
          id: 'role-custom',
          name: 'Custom Role',
          description: 'Custom role for testing',
          permissions: [
            { scope: 'inventory', actions: ['view', 'create'] },
            { scope: 'orders', actions: ['view'] }
          ],
          isSystem: false
        },
        {
          id: 'role-new',
          name: 'New Test Role',
          description: 'A new role created for testing',
          permissions: [
            { scope: 'inventory', actions: ['view'] },
            { scope: 'orders', actions: ['view'] }
          ],
          isSystem: false
        }
      ]
    }).as('getRolesAfterCreate');
    
    // Click Create Role button
    cy.findByText('Create Role').click();
    
    // Enter role details
    cy.findByDisplayValue('New Role').clear().type('New Test Role');
    cy.get('textarea').clear().type('A new role created for testing');
    
    // Select some permissions
    cy.contains('inventory').parent().find('input[type="checkbox"]').first().check();
    cy.contains('orders').parent().find('input[type="checkbox"]').first().check();
    
    // Save the role
    cy.findByText('Create Role', { selector: 'button' }).click();
    
    cy.wait('@createRole');
    cy.wait('@getRolesAfterCreate');
    
    // Should show the new role in the list
    cy.findByText('New Test Role').should('exist');
  });

  it('should apply template when clicked', () => {
    cy.wait('@getRoles');
    
    // Click on Custom Role
    cy.contains('.role-card', 'Custom Role').click();
    
    // Click Edit Role button
    cy.findByText('Edit Role').click();
    
    // Click Admin template button
    cy.findByText('Admin').click();
    
    // All checkboxes should now be checked
    cy.get('input[type="checkbox"]:checked').should('have.length.at.least', 20);
  });

  it('should delete custom role when confirmed', () => {
    cy.wait('@getRoles');
    
    // Mock delete role API response
    cy.intercept('DELETE', '/api/roles/role-custom', {
      statusCode: 204
    }).as('deleteRole');
    
    // Mock updated roles list after deletion
    cy.intercept('GET', '/api/roles', {
      statusCode: 200,
      body: [
        {
          id: 'role-admin',
          name: 'Administrator',
          description: 'Full access to all system functions and settings',
          permissions: [
            { scope: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'reports', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'settings', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'users', actions: ['view', 'create', 'edit', 'delete'] }
          ],
          isSystem: true
        },
        {
          id: 'role-manager',
          name: 'Manager',
          description: 'Manage inventory, orders, and reports',
          permissions: [
            { scope: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
            { scope: 'reports', actions: ['view', 'create', 'edit'] },
            { scope: 'settings', actions: ['view'] },
            { scope: 'users', actions: ['view'] }
          ],
          isSystem: true
        }
      ]
    }).as('getRolesAfterDelete');
    
    // Click on Custom Role to select it
    cy.contains('.role-card', 'Custom Role').click();
    
    // Click the actions menu button
    cy.contains('.role-card', 'Custom Role').find('[data-testid="icon-dots"]').click();
    
    // Click Delete Role
    cy.findByText('Delete Role', { selector: '.mantine-Menu-item' }).click();
    
    // Confirm deletion
    cy.findByText('Are you sure you want to delete the role').should('exist');
    cy.findByText('Delete Role', { selector: 'button' }).click();
    
    cy.wait('@deleteRole');
    cy.wait('@getRolesAfterDelete');
    
    // Custom Role should no longer exist
    cy.findByText('Custom Role').should('not.exist');
  });
});