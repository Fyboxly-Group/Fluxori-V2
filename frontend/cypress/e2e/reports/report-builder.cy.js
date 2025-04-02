describe('Report Builder', () => {
  beforeEach(() => {
    // Mock data sources API response
    cy.intercept('GET', '/api/reports/data-sources', {
      statusCode: 200,
      body: {
        sources: [
          {
            id: 'orders',
            name: 'Orders',
            description: 'Order data including status, totals, and items',
            fields: [
              { id: 'id', name: 'Order ID', type: 'string' },
              { id: 'status', name: 'Status', type: 'string' },
              { id: 'createdAt', name: 'Created Date', type: 'date' },
              { id: 'total', name: 'Order Total', type: 'number' },
              { id: 'itemCount', name: 'Item Count', type: 'number' }
            ]
          },
          {
            id: 'products',
            name: 'Products',
            description: 'Product information including inventory and pricing',
            fields: [
              { id: 'id', name: 'Product ID', type: 'string' },
              { id: 'name', name: 'Product Name', type: 'string' },
              { id: 'price', name: 'Price', type: 'number' },
              { id: 'stock', name: 'Stock Level', type: 'number' },
              { id: 'category', name: 'Category', type: 'string' }
            ]
          },
          {
            id: 'customers',
            name: 'Customers',
            description: 'Customer information and purchase history',
            fields: [
              { id: 'id', name: 'Customer ID', type: 'string' },
              { id: 'name', name: 'Customer Name', type: 'string' },
              { id: 'email', name: 'Email', type: 'string' },
              { id: 'orderCount', name: 'Order Count', type: 'number' },
              { id: 'totalSpent', name: 'Total Spent', type: 'number' }
            ]
          }
        ]
      }
    }).as('getDataSources');
    
    // Mock dimensions API response
    cy.intercept('GET', '/api/reports/dimensions*', {
      statusCode: 200,
      body: {
        dimensions: [
          { id: 'status', name: 'Status', type: 'string', source: 'orders' },
          { id: 'createdAt', name: 'Created Date', type: 'date', source: 'orders' },
          { id: 'category', name: 'Category', type: 'string', source: 'products' }
        ]
      }
    }).as('getDimensions');
    
    // Mock metrics API response
    cy.intercept('GET', '/api/reports/metrics*', {
      statusCode: 200,
      body: {
        metrics: [
          { id: 'total', name: 'Order Total', type: 'number', source: 'orders', aggregation: 'sum' },
          { id: 'itemCount', name: 'Item Count', type: 'number', source: 'orders', aggregation: 'sum' },
          { id: 'stock', name: 'Stock Level', type: 'number', source: 'products', aggregation: 'avg' }
        ]
      }
    }).as('getMetrics');
    
    // Log in and navigate to report builder
    cy.login();
    cy.navigateToSection('Reports');
    cy.findByText('Create Report').click();
  });

  it('should display the report builder steps', () => {
    // Should show stepper with correct steps
    cy.findByText('1. Select Data Source').should('exist');
    cy.findByText('2. Choose Dimensions').should('exist');
    cy.findByText('3. Select Metrics').should('exist');
    cy.findByText('4. Add Filters').should('exist');
    cy.findByText('5. Configure Visualization').should('exist');
  });

  it('should allow selecting a data source', () => {
    cy.wait('@getDataSources');
    
    // Check data sources are displayed
    cy.findByText('Orders').should('exist');
    cy.findByText('Products').should('exist');
    cy.findByText('Customers').should('exist');
    
    // Select Orders data source
    cy.findByText('Orders').click();
    
    // Continue button should be enabled
    cy.findByText('Continue').should('not.be.disabled');
    cy.findByText('Continue').click();
    
    // Should advance to dimensions step
    cy.findByText('Choose dimensions to analyze your data').should('exist');
  });

  it('should allow selecting dimensions', () => {
    cy.wait('@getDataSources');
    
    // Select Orders data source and continue
    cy.findByText('Orders').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getDimensions');
    
    // Select Status dimension
    cy.findByText('Status').click();
    
    // Select Created Date dimension
    cy.findByText('Created Date').click();
    
    // Continue to next step
    cy.findByText('Continue').click();
    
    // Should advance to metrics step
    cy.findByText('Select metrics to measure').should('exist');
  });

  it('should allow selecting metrics', () => {
    cy.wait('@getDataSources');
    
    // Select Orders data source and continue
    cy.findByText('Orders').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getDimensions');
    
    // Select Status dimension and continue
    cy.findByText('Status').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getMetrics');
    
    // Select Order Total metric
    cy.findByText('Order Total').click();
    
    // Select Item Count metric
    cy.findByText('Item Count').click();
    
    // Continue to next step
    cy.findByText('Continue').click();
    
    // Should advance to filters step
    cy.findByText('Add filters to refine your data').should('exist');
  });

  it('should allow adding filters', () => {
    cy.wait('@getDataSources');
    
    // Complete previous steps
    cy.findByText('Orders').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getDimensions');
    cy.findByText('Status').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getMetrics');
    cy.findByText('Order Total').click();
    cy.findByText('Continue').click();
    
    // Add a filter
    cy.findByText('Add Filter').click();
    
    // Select Status field
    cy.get('[data-testid="filter-field-select"]').click();
    cy.findByText('Status').click();
    
    // Select equals operator
    cy.get('[data-testid="filter-operator-select"]').click();
    cy.findByText('equals').click();
    
    // Enter filter value
    cy.get('[data-testid="filter-value-input"]').type('completed');
    
    // Add the filter
    cy.findByText('Apply Filter').click();
    
    // Filter should be visible in the list
    cy.findByText('Status equals completed').should('exist');
    
    // Continue to next step
    cy.findByText('Continue').click();
    
    // Should advance to visualization step
    cy.findByText('Choose how to visualize your report').should('exist');
  });

  it('should allow configuring visualization', () => {
    // Mock report preview API
    cy.intercept('POST', '/api/reports/preview', {
      statusCode: 200,
      body: {
        data: [
          { status: 'completed', total: 12500, itemCount: 45 },
          { status: 'processing', total: 5600, itemCount: 22 },
          { status: 'shipped', total: 8200, itemCount: 32 }
        ]
      }
    }).as('getReportPreview');
    
    // Complete previous steps
    cy.wait('@getDataSources');
    cy.findByText('Orders').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getDimensions');
    cy.findByText('Status').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getMetrics');
    cy.findByText('Order Total').click();
    cy.findByText('Continue').click();
    
    cy.findByText('Continue').click(); // Skip filters
    
    // Select chart type
    cy.findByText('Bar Chart').click();
    
    // Configure chart options
    cy.findByLabelText('Chart Title').type('Order Status Summary');
    
    // Generate preview
    cy.findByText('Generate Preview').click();
    
    cy.wait('@getReportPreview');
    
    // Preview should be visible
    cy.findByTestId('report-preview').should('exist');
    cy.findByText('Order Status Summary').should('exist');
    
    // Save the report
    cy.findByText('Save Report').click();
    
    // Enter report name
    cy.findByLabelText('Report Name').type('Order Status Report');
    cy.findByLabelText('Description').type('Summary of orders by status');
    
    // Mock save report API
    cy.intercept('POST', '/api/reports', {
      statusCode: 201,
      body: {
        id: 'report-123',
        name: 'Order Status Report',
        created: new Date().toISOString()
      }
    }).as('saveReport');
    
    // Submit the form
    cy.findByText('Save').click();
    
    cy.wait('@saveReport');
    
    // Should show success message
    cy.findByText('Report saved successfully').should('exist');
    
    // Should redirect to report view
    cy.url().should('include', '/reports/report-123');
  });

  it('should allow saving report as template', () => {
    // Complete previous steps
    cy.wait('@getDataSources');
    cy.findByText('Orders').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getDimensions');
    cy.findByText('Status').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getMetrics');
    cy.findByText('Order Total').click();
    cy.findByText('Continue').click();
    
    cy.findByText('Continue').click(); // Skip filters
    
    cy.findByText('Bar Chart').click();
    
    // Save as template
    cy.findByText('Save as Template').click();
    
    // Enter template details
    cy.findByLabelText('Template Name').type('Order Status Template');
    cy.findByLabelText('Description').type('Template for order status reports');
    
    // Mock save template API
    cy.intercept('POST', '/api/reports/templates', {
      statusCode: 201,
      body: {
        id: 'template-123',
        name: 'Order Status Template'
      }
    }).as('saveTemplate');
    
    // Submit template form
    cy.findByRole('button', { name: 'Save Template' }).click();
    
    cy.wait('@saveTemplate');
    
    // Should show success message
    cy.findByText('Template saved successfully').should('exist');
  });

  it('should allow scheduling the report', () => {
    // Complete previous steps and get to the final step
    cy.wait('@getDataSources');
    cy.findByText('Orders').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getDimensions');
    cy.findByText('Status').click();
    cy.findByText('Continue').click();
    
    cy.wait('@getMetrics');
    cy.findByText('Order Total').click();
    cy.findByText('Continue').click();
    
    cy.findByText('Continue').click(); // Skip filters
    
    cy.findByText('Bar Chart').click();
    
    // Click schedule button
    cy.findByText('Schedule Report').click();
    
    // Enter schedule details
    cy.findByLabelText('Schedule Name').type('Weekly Order Status');
    cy.findByText('Frequency').parent().click();
    cy.findByText('Weekly').click();
    
    // Select day of week
    cy.findByText('Monday').click();
    
    // Enter recipients
    cy.findByLabelText('Recipients').type('team@example.com');
    
    // Mock schedule API
    cy.intercept('POST', '/api/reports/schedules', {
      statusCode: 201,
      body: {
        id: 'schedule-123',
        name: 'Weekly Order Status'
      }
    }).as('saveSchedule');
    
    // Save schedule
    cy.findByText('Save Schedule').click();
    
    cy.wait('@saveSchedule');
    
    // Should show success message
    cy.findByText('Report scheduled successfully').should('exist');
  });
});