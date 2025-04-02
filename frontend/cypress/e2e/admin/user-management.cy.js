describe('User Management', () => {
  beforeEach(() => {
    // Mock users API response
    cy.intercept('GET', '/api/users*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'user-1',
            email: 'admin@example.com',
            role: 'admin',
            status: 'active',
            profile: {
              firstName: 'Alex',
              lastName: 'Johnson',
              jobTitle: 'System Administrator',
              avatar: null
            },
            lastLogin: new Date().toISOString(),
            twoFactorEnabled: true
          },
          {
            id: 'user-2',
            email: 'manager@example.com',
            role: 'manager',
            status: 'active',
            profile: {
              firstName: 'Taylor',
              lastName: 'Smith',
              jobTitle: 'Operations Manager',
              avatar: null
            },
            lastLogin: new Date().toISOString(),
            twoFactorEnabled: false
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    }).as('getUsers');

    // Log in and navigate to user management page
    cy.login();
    cy.navigateToSection('User Management');
  });

  it('should display user list', () => {
    cy.wait('@getUsers');
    
    cy.findByText('Alex Johnson').should('exist');
    cy.findByText('Taylor Smith').should('exist');
    cy.findByText('admin@example.com').should('exist');
    cy.findByText('manager@example.com').should('exist');

    // Check table headers
    cy.findByText('Name').should('exist');
    cy.findByText('Email').should('exist');
    cy.findByText('Role').should('exist');
    cy.findByText('Status').should('exist');
  });

  it('should filter users by search term', () => {
    cy.wait('@getUsers');

    // Mock filtered API response
    cy.intercept('GET', '/api/users*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'user-1',
            email: 'admin@example.com',
            role: 'admin',
            status: 'active',
            profile: {
              firstName: 'Alex',
              lastName: 'Johnson',
              jobTitle: 'System Administrator',
              avatar: null
            },
            lastLogin: new Date().toISOString(),
            twoFactorEnabled: true
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    }).as('searchUsers');

    // Search for admin
    cy.findByPlaceholderText('Search users...').type('admin');
    
    cy.wait('@searchUsers');
    
    // Should show only admin user
    cy.findByText('Alex Johnson').should('exist');
    cy.findByText('Taylor Smith').should('not.exist');
  });

  it('should filter users by role', () => {
    cy.wait('@getUsers');

    // Mock filtered API response
    cy.intercept('GET', '/api/users*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'user-2',
            email: 'manager@example.com',
            role: 'manager',
            status: 'active',
            profile: {
              firstName: 'Taylor',
              lastName: 'Smith',
              jobTitle: 'Operations Manager',
              avatar: null
            },
            lastLogin: new Date().toISOString(),
            twoFactorEnabled: false
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    }).as('filterUsers');

    // Open role filter dropdown
    cy.findByPlaceholderText('Filter by role').click();
    cy.findByText('Manager').click();
    
    cy.wait('@filterUsers');
    
    // Should show only manager user
    cy.findByText('Taylor Smith').should('exist');
    cy.findByText('Alex Johnson').should('not.exist');
  });

  it('should open user edit modal when clicking edit', () => {
    cy.wait('@getUsers');

    // Mock get single user API response
    cy.intercept('GET', '/api/users/user-1', {
      statusCode: 200,
      body: {
        id: 'user-1',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        profile: {
          firstName: 'Alex',
          lastName: 'Johnson',
          jobTitle: 'System Administrator',
          avatar: null
        },
        lastLogin: new Date().toISOString(),
        twoFactorEnabled: true
      }
    }).as('getUser');

    // Click on the actions menu for Alex Johnson
    cy.contains('tr', 'Alex Johnson').find('button').first().click();
    
    // Click on Edit User option
    cy.findByText('Edit User').click();
    
    // Modal should appear with user details
    cy.findByText('Edit User').should('exist');
    cy.findByDisplayValue('Alex').should('exist');
    cy.findByDisplayValue('Johnson').should('exist');
    cy.findByDisplayValue('admin@example.com').should('exist');
  });

  it('should delete user when confirming delete action', () => {
    cy.wait('@getUsers');

    // Mock delete user API response
    cy.intercept('DELETE', '/api/users/user-2', {
      statusCode: 204
    }).as('deleteUser');

    // Mock updated user list after deletion
    cy.intercept('GET', '/api/users*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'user-1',
            email: 'admin@example.com',
            role: 'admin',
            status: 'active',
            profile: {
              firstName: 'Alex',
              lastName: 'Johnson',
              jobTitle: 'System Administrator',
              avatar: null
            },
            lastLogin: new Date().toISOString(),
            twoFactorEnabled: true
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    }).as('getUsersAfterDelete');

    // Click on the actions menu for Taylor Smith
    cy.contains('tr', 'Taylor Smith').find('button').first().click();
    
    // Click on Delete User option
    cy.findByText('Delete User').click();
    
    // Confirm deletion in the modal
    cy.findByText('Are you sure you want to delete this user?').should('exist');
    cy.findByText('Confirm').click();
    
    cy.wait('@deleteUser');
    cy.wait('@getUsersAfterDelete');
    
    // Taylor Smith should no longer be in the list
    cy.findByText('Taylor Smith').should('not.exist');
    cy.findByText('Alex Johnson').should('exist');
  });

  it('should change page size when selecting different option', () => {
    cy.wait('@getUsers');

    // Mock API response for different page size
    cy.intercept('GET', '/api/users*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'user-1',
            email: 'admin@example.com',
            role: 'admin',
            status: 'active',
            profile: {
              firstName: 'Alex',
              lastName: 'Johnson',
              jobTitle: 'System Administrator',
              avatar: null
            },
            lastLogin: new Date().toISOString(),
            twoFactorEnabled: true
          },
          {
            id: 'user-2',
            email: 'manager@example.com',
            role: 'manager',
            status: 'active',
            profile: {
              firstName: 'Taylor',
              lastName: 'Smith',
              jobTitle: 'Operations Manager',
              avatar: null
            },
            lastLogin: new Date().toISOString(),
            twoFactorEnabled: false
          }
        ],
        total: 2,
        page: 1,
        pageSize: 25,
        totalPages: 1
      }
    }).as('changePageSize');

    // Find the page size dropdown and change to 25
    cy.findByText('Rows per page').parent().find('select').select('25');
    
    cy.wait('@changePageSize');
    
    // Should still show both users
    cy.findByText('Alex Johnson').should('exist');
    cy.findByText('Taylor Smith').should('exist');
  });
});