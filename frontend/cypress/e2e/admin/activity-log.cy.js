describe('Activity Log', () => {
  beforeEach(() => {
    // Mock activity logs API response
    cy.intercept('GET', '/api/activity-logs*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'activity-1',
            userId: 'user-1',
            userName: 'Alex Johnson',
            timestamp: new Date().toISOString(),
            type: 'login',
            description: 'User login',
            ipAddress: '192.168.1.1'
          },
          {
            id: 'activity-2',
            userId: 'user-1',
            userName: 'Alex Johnson',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            type: 'resource_edit',
            description: 'Updated user settings',
            ipAddress: '192.168.1.1',
            resourceType: 'user',
            resourceId: 'user-2',
            details: {
              changes: {
                role: {
                  previous: 'user',
                  new: 'manager'
                }
              }
            }
          },
          {
            id: 'activity-3',
            userId: 'user-2',
            userName: 'Taylor Smith',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            type: 'resource_create',
            description: 'Created new inventory item',
            ipAddress: '192.168.2.1',
            resourceType: 'inventory',
            resourceId: 'inv-123'
          }
        ],
        total: 3,
        page: 1,
        pageSize: 20,
        totalPages: 1
      }
    }).as('getActivityLogs');

    // Log in and navigate to activity log page
    cy.login();
    cy.navigateToSection('Activity Log');
  });

  it('should display activity logs', () => {
    cy.wait('@getActivityLogs');
    
    cy.findByText('Activity Log').should('exist');
    cy.findByText('User login').should('exist');
    cy.findByText('Updated user settings').should('exist');
    cy.findByText('Created new inventory item').should('exist');
    
    // Check for user names
    cy.findByText('Alex Johnson').should('exist');
    cy.findByText('Taylor Smith').should('exist');
    
    // Check for activity types
    cy.findByText('login').should('exist');
    cy.findByText('resource edit').should('exist');
    cy.findByText('resource create').should('exist');
  });

  it('should filter logs by search term', () => {
    cy.wait('@getActivityLogs');

    // Mock filtered API response
    cy.intercept('GET', '/api/activity-logs*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'activity-2',
            userId: 'user-1',
            userName: 'Alex Johnson',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'resource_edit',
            description: 'Updated user settings',
            ipAddress: '192.168.1.1',
            resourceType: 'user',
            resourceId: 'user-2',
            details: {
              changes: {
                role: {
                  previous: 'user',
                  new: 'manager'
                }
              }
            }
          }
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      }
    }).as('searchActivityLogs');

    // Search for "settings"
    cy.findByPlaceholderText('Search activity logs...').type('settings');
    
    cy.wait('@searchActivityLogs');
    
    // Should show only the matching log
    cy.findByText('Updated user settings').should('exist');
    cy.findByText('User login').should('not.exist');
    cy.findByText('Created new inventory item').should('not.exist');
  });

  it('should filter logs by activity type', () => {
    cy.wait('@getActivityLogs');

    // Mock filtered API response
    cy.intercept('GET', '/api/activity-logs*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'activity-1',
            userId: 'user-1',
            userName: 'Alex Johnson',
            timestamp: new Date().toISOString(),
            type: 'login',
            description: 'User login',
            ipAddress: '192.168.1.1'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      }
    }).as('filterActivityLogs');

    // Open activity type dropdown
    cy.findByText('Activity Type').parent().find('input').click();
    
    // Select "Login" type
    cy.findByText('Login').click();
    
    cy.wait('@filterActivityLogs');
    
    // Should show only login activity
    cy.findByText('User login').should('exist');
    cy.findByText('Updated user settings').should('not.exist');
    cy.findByText('Created new inventory item').should('not.exist');
  });

  it('should filter logs by date range', () => {
    cy.wait('@getActivityLogs');

    // Mock filtered API response
    cy.intercept('GET', '/api/activity-logs*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'activity-2',
            userId: 'user-1',
            userName: 'Alex Johnson',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'resource_edit',
            description: 'Updated user settings',
            ipAddress: '192.168.1.1',
            resourceType: 'user',
            resourceId: 'user-2',
            details: {
              changes: {
                role: {
                  previous: 'user',
                  new: 'manager'
                }
              }
            }
          },
          {
            id: 'activity-3',
            userId: 'user-2',
            userName: 'Taylor Smith',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: 'resource_create',
            description: 'Created new inventory item',
            ipAddress: '192.168.2.1',
            resourceType: 'inventory',
            resourceId: 'inv-123'
          }
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1
      }
    }).as('dateFilterActivityLogs');

    // Click on date range picker
    cy.findByTestId('date-range-picker').find('button').click();
    
    cy.wait('@dateFilterActivityLogs');
    
    // User login (most recent) should not be in the results
    cy.findByText('User login').should('not.exist');
    
    // Other logs should be visible
    cy.findByText('Updated user settings').should('exist');
    cy.findByText('Created new inventory item').should('exist');
  });

  it('should clear filters when clicking clear button', () => {
    cy.wait('@getActivityLogs');
    
    // First, apply a filter
    cy.findByPlaceholderText('Search activity logs...').type('settings');
    
    // Mock filtered API response (already tested above)
    cy.intercept('GET', '/api/activity-logs*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'activity-2',
            userId: 'user-1',
            userName: 'Alex Johnson',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'resource_edit',
            description: 'Updated user settings',
            ipAddress: '192.168.1.1',
            resourceType: 'user',
            resourceId: 'user-2',
            details: {
              changes: {
                role: {
                  previous: 'user',
                  new: 'manager'
                }
              }
            }
          }
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      }
    }).as('searchActivityLogs');
    
    cy.wait('@searchActivityLogs');
    
    // Clear filters button should appear
    cy.findByText('Clear Filters').click();
    
    // Mock original unfiltered response
    cy.intercept('GET', '/api/activity-logs*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'activity-1',
            userId: 'user-1',
            userName: 'Alex Johnson',
            timestamp: new Date().toISOString(),
            type: 'login',
            description: 'User login',
            ipAddress: '192.168.1.1'
          },
          {
            id: 'activity-2',
            userId: 'user-1',
            userName: 'Alex Johnson',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'resource_edit',
            description: 'Updated user settings',
            ipAddress: '192.168.1.1',
            resourceType: 'user',
            resourceId: 'user-2',
            details: {
              changes: {
                role: {
                  previous: 'user',
                  new: 'manager'
                }
              }
            }
          },
          {
            id: 'activity-3',
            userId: 'user-2',
            userName: 'Taylor Smith',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: 'resource_create',
            description: 'Created new inventory item',
            ipAddress: '192.168.2.1',
            resourceType: 'inventory',
            resourceId: 'inv-123'
          }
        ],
        total: 3,
        page: 1,
        pageSize: 20,
        totalPages: 1
      }
    }).as('resetActivityLogs');
    
    cy.wait('@resetActivityLogs');
    
    // All logs should be visible again
    cy.findByText('User login').should('exist');
    cy.findByText('Updated user settings').should('exist');
    cy.findByText('Created new inventory item').should('exist');
    
    // Search input should be cleared
    cy.findByPlaceholderText('Search activity logs...').should('have.value', '');
  });

  it('should change items per page when selecting different option', () => {
    cy.wait('@getActivityLogs');

    // Mock API response for different page size
    cy.intercept('GET', '/api/activity-logs*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'activity-1',
            userId: 'user-1',
            userName: 'Alex Johnson',
            timestamp: new Date().toISOString(),
            type: 'login',
            description: 'User login',
            ipAddress: '192.168.1.1'
          },
          {
            id: 'activity-2',
            userId: 'user-1',
            userName: 'Alex Johnson',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'resource_edit',
            description: 'Updated user settings',
            ipAddress: '192.168.1.1',
            resourceType: 'user',
            resourceId: 'user-2',
            details: {
              changes: {
                role: {
                  previous: 'user',
                  new: 'manager'
                }
              }
            }
          },
          {
            id: 'activity-3',
            userId: 'user-2',
            userName: 'Taylor Smith',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: 'resource_create',
            description: 'Created new inventory item',
            ipAddress: '192.168.2.1',
            resourceType: 'inventory',
            resourceId: 'inv-123'
          }
        ],
        total: 3,
        page: 1,
        pageSize: 50,
        totalPages: 1
      }
    }).as('changePageSize');

    // Find the page size dropdown and change to 50
    cy.findByText('Items per page').parent().find('select').select('50');
    
    cy.wait('@changePageSize');
    
    // All logs should still be visible
    cy.findByText('User login').should('exist');
    cy.findByText('Updated user settings').should('exist');
    cy.findByText('Created new inventory item').should('exist');
  });
});