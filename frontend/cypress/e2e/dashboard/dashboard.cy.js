describe('Dashboard', () => {
  beforeEach(() => {
    // Mock dashboard stats API response
    cy.intercept('GET', '/api/dashboard/stats', {
      statusCode: 200,
      body: {
        salesStats: {
          total: 35420.75,
          change: 12.5,
          period: 'week'
        },
        ordersStats: {
          total: 427,
          change: 8.3,
          period: 'week'
        },
        inventoryStats: {
          total: 1258,
          lowStock: 32,
          outOfStock: 8
        },
        buyBoxStats: {
          winRate: 72.4,
          change: 3.6,
          period: 'week'
        }
      }
    }).as('getDashboardStats');

    // Mock dashboard chart data
    cy.intercept('GET', '/api/dashboard/chart-data*', {
      statusCode: 200,
      body: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sales',
            data: [12000, 19000, 15000, 22000, 18000, 24000]
          },
          {
            label: 'Orders',
            data: [120, 190, 150, 220, 180, 240]
          }
        ]
      }
    }).as('getChartData');

    // Mock recent activities API response
    cy.intercept('GET', '/api/dashboard/activities', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'act-1',
            type: 'order_created',
            user: 'System',
            timestamp: new Date().toISOString(),
            details: {
              orderId: 'ORD-12345',
              total: 235.50
            }
          },
          {
            id: 'act-2',
            type: 'inventory_low',
            user: 'System',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            details: {
              productId: 'PRD-6789',
              productName: 'Wireless Headphones',
              currentStock: 5,
              threshold: 10
            }
          }
        ]
      }
    }).as('getActivities');

    // Log in and navigate to dashboard
    cy.login();
  });

  it('should display dashboard stats cards with animations', () => {
    cy.wait('@getDashboardStats');
    
    // Check stat cards are present
    cy.findByText('Total Sales').should('exist');
    cy.findByText('$35,420.75').should('exist');
    cy.findByText('12.5%').should('exist');

    cy.findByText('Orders').should('exist');
    cy.findByText('427').should('exist');
    cy.findByText('8.3%').should('exist');

    cy.findByText('Inventory Status').should('exist');
    cy.findByText('1,258').should('exist');
    cy.findByText('32 low stock').should('exist');

    cy.findByText('Buy Box Win Rate').should('exist');
    cy.findByText('72.4%').should('exist');
    cy.findByText('3.6%').should('exist');
  });

  it('should display main chart with time period selector', () => {
    cy.wait('@getChartData');
    
    // Check chart is visible
    cy.findByTestId('dashboard-main-chart').should('exist');
    
    // Check time period selector works
    cy.findByRole('group', { name: /time period/i }).within(() => {
      cy.findByRole('button', { name: /week/i }).should('have.attr', 'data-active', 'true');
      
      // Click on month period
      cy.findByRole('button', { name: /month/i }).click();
    });

    // Should trigger a new chart data request
    cy.wait('@getChartData');
    
    // Month button should now be active
    cy.findByRole('button', { name: /month/i }).should('have.attr', 'data-active', 'true');
  });

  it('should display recent activities section', () => {
    cy.wait('@getActivities');
    
    // Check activities section is visible
    cy.findByText('Recent Activities').should('exist');
    cy.findByText('Order Created').should('exist');
    cy.findByText('ORD-12345').should('exist');
    cy.findByText('Low Stock Alert').should('exist');
    cy.findByText('Wireless Headphones').should('exist');
  });

  it('should navigate to order details when clicking on order activity', () => {
    cy.wait('@getActivities');
    
    // Mock order details API response
    cy.intercept('GET', '/api/orders/ORD-12345', {
      statusCode: 200,
      body: {
        id: 'ORD-12345',
        status: 'processing',
        total: 235.50,
        items: []
      }
    }).as('getOrderDetails');
    
    // Click on order activity
    cy.findByText('ORD-12345').click();
    
    // Should navigate to order details page
    cy.url().should('include', '/orders/ORD-12345');
    cy.wait('@getOrderDetails');
    cy.findByText('Order Details').should('exist');
  });

  it('should navigate to inventory details when clicking on inventory activity', () => {
    cy.wait('@getActivities');
    
    // Mock product details API response
    cy.intercept('GET', '/api/inventory/PRD-6789', {
      statusCode: 200,
      body: {
        id: 'PRD-6789',
        name: 'Wireless Headphones',
        sku: 'WH-100',
        stock: 5
      }
    }).as('getProductDetails');
    
    // Click on inventory activity
    cy.findByText('Wireless Headphones').click();
    
    // Should navigate to inventory details page
    cy.url().should('include', '/inventory/PRD-6789');
    cy.wait('@getProductDetails');
    cy.findByText('Product Details').should('exist');
  });

  it('should allow changing dashboard date range', () => {
    // Mock stats with new date range
    cy.intercept('GET', '/api/dashboard/stats*', {
      statusCode: 200,
      body: {
        salesStats: {
          total: 125650.30,
          change: 5.2,
          period: 'month'
        },
        ordersStats: {
          total: 1532,
          change: 3.8,
          period: 'month'
        },
        inventoryStats: {
          total: 1258,
          lowStock: 32,
          outOfStock: 8
        },
        buyBoxStats: {
          winRate: 68.7,
          change: -2.1,
          period: 'month'
        }
      }
    }).as('getNewRangeStats');

    // Mock chart data with new date range
    cy.intercept('GET', '/api/dashboard/chart-data*', {
      statusCode: 200,
      body: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sales',
            data: [42000, 39000, 45000, 52000, 48000, 54000]
          },
          {
            label: 'Orders',
            data: [420, 390, 450, 520, 480, 540]
          }
        ]
      }
    }).as('getNewRangeChartData');
    
    // Open date range picker
    cy.findByText('Date Range').click();
    
    // Select last 30 days
    cy.findByText('Last 30 Days').click();
    
    // Wait for new data
    cy.wait('@getNewRangeStats');
    cy.wait('@getNewRangeChartData');
    
    // Check updated stats
    cy.findByText('$125,650.30').should('exist');
    cy.findByText('1,532').should('exist');
  });

  it('should allow exporting dashboard data', () => {
    // Mock export API
    cy.intercept('POST', '/api/dashboard/export', {
      statusCode: 200,
      body: { url: '/downloads/dashboard-export.xlsx' }
    }).as('exportDashboard');
    
    // Click on export button
    cy.findByText('Export').click();
    
    // Select export format
    cy.findByText('Excel').click();
    
    // Wait for export to complete
    cy.wait('@exportDashboard');
    
    // Should show success message
    cy.findByText('Dashboard data exported successfully').should('exist');
  });
});