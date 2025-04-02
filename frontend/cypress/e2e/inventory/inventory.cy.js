describe('Inventory Management', () => {
  beforeEach(() => {
    // Mock inventory list API response
    cy.intercept('GET', '/api/inventory*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'prod-1',
            sku: 'WH-100',
            name: 'Wireless Headphones',
            category: 'Electronics',
            price: 149.99,
            stock: 42,
            status: 'active'
          },
          {
            id: 'prod-2',
            sku: 'SM-200',
            name: 'Smart Watch',
            category: 'Electronics',
            price: 249.99,
            stock: 18,
            status: 'active'
          },
          {
            id: 'prod-3',
            sku: 'BT-300',
            name: 'Bluetooth Speaker',
            category: 'Electronics',
            price: 89.99,
            stock: 5,
            status: 'active'
          }
        ],
        total: 3,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    }).as('getInventory');

    // Log in and navigate to inventory
    cy.login();
    cy.navigateToSection('Inventory');
  });

  it('should display inventory list with products', () => {
    cy.wait('@getInventory');
    
    // Check products are displayed
    cy.findByText('Wireless Headphones').should('exist');
    cy.findByText('Smart Watch').should('exist');
    cy.findByText('Bluetooth Speaker').should('exist');
    
    // Check SKUs are displayed
    cy.findByText('WH-100').should('exist');
    cy.findByText('SM-200').should('exist');
    cy.findByText('BT-300').should('exist');
    
    // Check prices are displayed
    cy.findByText('$149.99').should('exist');
    cy.findByText('$249.99').should('exist');
    cy.findByText('$89.99').should('exist');
    
    // Check stock levels are displayed
    cy.findByText('42').should('exist');
    cy.findByText('18').should('exist');
    cy.findByText('5').should('exist');
  });

  it('should filter inventory by search term', () => {
    cy.wait('@getInventory');
    
    // Mock filtered results
    cy.intercept('GET', '/api/inventory*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'prod-1',
            sku: 'WH-100',
            name: 'Wireless Headphones',
            category: 'Electronics',
            price: 149.99,
            stock: 42,
            status: 'active'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    }).as('searchInventory');
    
    // Search for "headphones"
    cy.findByPlaceholderText('Search products...').type('headphones');
    
    cy.wait('@searchInventory');
    
    // Only matching product should be displayed
    cy.findByText('Wireless Headphones').should('exist');
    cy.findByText('Smart Watch').should('not.exist');
    cy.findByText('Bluetooth Speaker').should('not.exist');
  });

  it('should filter inventory by category', () => {
    cy.wait('@getInventory');
    
    // Mock category filter API
    cy.intercept('GET', '/api/inventory/categories', {
      statusCode: 200,
      body: {
        categories: [
          { id: 'electronics', name: 'Electronics' },
          { id: 'clothing', name: 'Clothing' },
          { id: 'home', name: 'Home & Kitchen' }
        ]
      }
    }).as('getCategories');
    
    // Click on filter dropdown
    cy.findByText('Filter').click();
    
    // Wait for categories to load
    cy.wait('@getCategories');
    
    // Select Electronics category
    cy.findByText('Electronics').click();
    
    // Apply filter
    cy.findByText('Apply Filters').click();
    
    // Should still show all products since they're all Electronics
    cy.findByText('Wireless Headphones').should('exist');
    cy.findByText('Smart Watch').should('exist');
    cy.findByText('Bluetooth Speaker').should('exist');
    
    // Clear filters
    cy.findByText('Clear Filters').click();
  });

  it('should filter inventory by stock level', () => {
    cy.wait('@getInventory');
    
    // Mock low stock filter
    cy.intercept('GET', '/api/inventory*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'prod-3',
            sku: 'BT-300',
            name: 'Bluetooth Speaker',
            category: 'Electronics',
            price: 89.99,
            stock: 5,
            status: 'active'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    }).as('filterLowStock');
    
    // Click on filter dropdown
    cy.findByText('Filter').click();
    
    // Select Low Stock filter
    cy.findByText('Stock Level').parent().within(() => {
      cy.findByText('Low Stock').click();
    });
    
    // Apply filter
    cy.findByText('Apply Filters').click();
    
    cy.wait('@filterLowStock');
    
    // Only low stock product should be displayed
    cy.findByText('Wireless Headphones').should('not.exist');
    cy.findByText('Smart Watch').should('not.exist');
    cy.findByText('Bluetooth Speaker').should('exist');
  });

  it('should sort inventory by different columns', () => {
    cy.wait('@getInventory');
    
    // Mock sorted API response (price high to low)
    cy.intercept('GET', '/api/inventory*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'prod-2',
            sku: 'SM-200',
            name: 'Smart Watch',
            category: 'Electronics',
            price: 249.99,
            stock: 18,
            status: 'active'
          },
          {
            id: 'prod-1',
            sku: 'WH-100',
            name: 'Wireless Headphones',
            category: 'Electronics',
            price: 149.99,
            stock: 42,
            status: 'active'
          },
          {
            id: 'prod-3',
            sku: 'BT-300',
            name: 'Bluetooth Speaker',
            category: 'Electronics',
            price: 89.99,
            stock: 5,
            status: 'active'
          }
        ],
        total: 3,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }
    }).as('sortInventory');
    
    // Click on Price header to sort
    cy.contains('th', 'Price').click();
    
    cy.wait('@sortInventory');
    
    // Check order of products (should be price high to low)
    cy.get('tbody tr').eq(0).should('contain', 'Smart Watch');
    cy.get('tbody tr').eq(1).should('contain', 'Wireless Headphones');
    cy.get('tbody tr').eq(2).should('contain', 'Bluetooth Speaker');
  });

  it('should navigate to product details page', () => {
    cy.wait('@getInventory');
    
    // Mock product details API
    cy.intercept('GET', '/api/inventory/prod-1', {
      statusCode: 200,
      body: {
        id: 'prod-1',
        sku: 'WH-100',
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with noise cancellation',
        category: 'Electronics',
        price: 149.99,
        cost: 89.99,
        stock: 42,
        images: [
          { url: 'https://example.com/headphones1.jpg', main: true }
        ],
        attributes: {
          color: 'Black',
          weight: '0.5 lbs',
          connectivity: 'Bluetooth 5.0'
        },
        status: 'active',
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: '2023-03-10T00:00:00Z'
      }
    }).as('getProductDetails');
    
    // Click on product name to view details
    cy.findByText('Wireless Headphones').click();
    
    // Should navigate to product details page
    cy.url().should('include', '/inventory/prod-1');
    cy.wait('@getProductDetails');
    
    // Check product details are displayed
    cy.findByText('Product Details').should('exist');
    cy.findByText('WH-100').should('exist');
    cy.findByText('Premium wireless headphones with noise cancellation').should('exist');
    cy.findByText('$149.99').should('exist');
  });

  it('should navigate to create new product page', () => {
    cy.wait('@getInventory');
    
    // Click on Add Product button
    cy.findByText('Add Product').click();
    
    // Should navigate to create product page
    cy.url().should('include', '/inventory/new');
    
    // Form should be displayed
    cy.findByText('Create New Product').should('exist');
    cy.findByLabelText('Product Name').should('exist');
    cy.findByLabelText('SKU').should('exist');
  });

  it('should open edit product page', () => {
    cy.wait('@getInventory');
    
    // Mock product details for edit
    cy.intercept('GET', '/api/inventory/prod-1', {
      statusCode: 200,
      body: {
        id: 'prod-1',
        sku: 'WH-100',
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with noise cancellation',
        category: 'Electronics',
        price: 149.99,
        cost: 89.99,
        stock: 42,
        images: [
          { url: 'https://example.com/headphones1.jpg', main: true }
        ],
        attributes: {
          color: 'Black',
          weight: '0.5 lbs',
          connectivity: 'Bluetooth 5.0'
        },
        status: 'active'
      }
    }).as('getProductForEdit');
    
    // Click on actions menu
    cy.contains('tr', 'Wireless Headphones').find('button[aria-label="Actions"]').click();
    
    // Click on Edit option
    cy.findByText('Edit').click();
    
    // Should navigate to edit page
    cy.url().should('include', '/inventory/prod-1/edit');
    cy.wait('@getProductForEdit');
    
    // Form should be pre-filled with product data
    cy.findByLabelText('Product Name').should('have.value', 'Wireless Headphones');
    cy.findByLabelText('SKU').should('have.value', 'WH-100');
    cy.findByLabelText('Price').should('have.value', '149.99');
  });

  it('should bulk update products', () => {
    cy.wait('@getInventory');
    
    // Select products by checkbox
    cy.get('tbody tr').eq(0).find('input[type="checkbox"]').click();
    cy.get('tbody tr').eq(1).find('input[type="checkbox"]').click();
    
    // Bulk actions should be visible
    cy.findByText('2 items selected').should('exist');
    
    // Open bulk actions menu
    cy.findByText('Bulk Actions').click();
    
    // Click on Update Price option
    cy.findByText('Update Price').click();
    
    // Fill in the bulk update form
    cy.findByLabelText('Price Adjustment Type').select('Percentage');
    cy.findByLabelText('Adjustment Value').clear().type('10');
    
    // Mock bulk update API
    cy.intercept('POST', '/api/inventory/bulk-update', {
      statusCode: 200,
      body: {
        updated: 2,
        skipped: 0
      }
    }).as('bulkUpdate');
    
    // Submit the form
    cy.findByText('Update Products').click();
    
    cy.wait('@bulkUpdate');
    
    // Should show success message
    cy.findByText('2 products updated successfully').should('exist');
  });

  it('should import inventory from CSV', () => {
    cy.wait('@getInventory');
    
    // Click on Import button
    cy.findByText('Import').click();
    
    // Import modal should open
    cy.findByText('Import Products').should('exist');
    
    // Mock file upload
    cy.fixture('inventory-import.csv', { encoding: null }).as('csvFile');
    
    // Attach file to file input
    cy.get('input[type="file"]').then(function($input) {
      // Nb: This is a workaround for Cypress file upload
      const blob = new Blob([this.csvFile], { type: 'text/csv' });
      const testFile = new File([blob], 'inventory-import.csv', { type: 'text/csv' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(testFile);
      $input[0].files = dataTransfer.files;
      $input.trigger('change', { force: true });
    });
    
    // Mock import validation API
    cy.intercept('POST', '/api/inventory/import/validate', {
      statusCode: 200,
      body: {
        valid: true,
        count: 5,
        issues: []
      }
    }).as('validateImport');
    
    // Click Validate button
    cy.findByText('Validate').click();
    
    cy.wait('@validateImport');
    
    // Should show validation successful message
    cy.findByText('5 products ready to import').should('exist');
    
    // Mock import API
    cy.intercept('POST', '/api/inventory/import', {
      statusCode: 200,
      body: {
        imported: 5,
        errors: 0
      }
    }).as('importProducts');
    
    // Click Import button
    cy.findByText('Import Products').click();
    
    cy.wait('@importProducts');
    
    // Should show success message
    cy.findByText('5 products imported successfully').should('exist');
  });

  it('should export inventory to CSV', () => {
    cy.wait('@getInventory');
    
    // Mock export API
    cy.intercept('GET', '/api/inventory/export*', {
      statusCode: 200,
      body: { url: '/downloads/inventory-export.csv' }
    }).as('exportInventory');
    
    // Click on Export button
    cy.findByText('Export').click();
    
    // Select export format
    cy.findByText('CSV').click();
    
    cy.wait('@exportInventory');
    
    // Should show success message
    cy.findByText('Inventory exported successfully').should('exist');
  });
});