import {
  MarketplaceAdapterFactory,
  MarketplaceCredentials,
  StockUpdatePayload,
  PriceUpdatePayload,
  StatusUpdatePayload,
  ProductStatus,
  CredentialManager
} from '../index';

/**
 * This file demonstrates how to use the Takealot marketplace adapter.
 * It is not meant to be run directly, but serves as documentation.
 */

/**
 * Example function demonstrating how to use the Takealot adapter
 */
async function takealotAdapterExample(): Promise<void> {
  // Get the marketplace adapter factory instance
  const factory = MarketplaceAdapterFactory.getInstance();
  
  // Get the credential manager for secure handling of credentials
  const credentialManager = CredentialManager.getInstance();
  
  // In a real application, credentials would be retrieved from a secure store
  // like GCP Secret Manager or environment variables
  const takealotCredentials: MarketplaceCredentials = {
    apiKey: process.env.TAKEALOT_API_KEY || 'your-api-key',
    apiSecret: process.env.TAKEALOT_API_SECRET || 'your-api-secret',
    sellerId: process.env.TAKEALOT_SELLER_ID || 'your-seller-id'
  };
  
  try {
    // Create and initialize a Takealot adapter
    console.log('Initializing Takealot adapter...');
    const takealotAdapter = await factory.createAdapter('takealot', takealotCredentials);
    
    // Test the connection
    console.log('Testing connection to Takealot API...');
    const connectionStatus = await takealotAdapter.testConnection();
    
    if (connectionStatus.connected) {
      console.log(`Connected to ${takealotAdapter.marketplaceName} successfully!`);
      
      // Check rate limit status
      const rateLimit = await takealotAdapter.getRateLimitStatus();
      console.log(`API Rate Limit: ${rateLimit.remaining}/${rateLimit.limit} remaining. Resets at ${rateLimit.reset.toLocaleString()}`);
      
      // Example 1: Get a product by SKU
      console.log('\n--- Example 1: Get a product by SKU ---');
      const sku = 'EXAMPLE-SKU-123';
      console.log(`Fetching product with SKU: ${sku}`);
      
      const productResult = await takealotAdapter.getProductBySku(sku);
      
      if (productResult.success && productResult.data) {
        console.log('Product details:');
        console.log(`- ID: ${productResult.data.id}`);
        console.log(`- Title: ${productResult.data.title}`);
        console.log(`- Price: ${productResult.data.price} ${productResult.data.currencyCode}`);
        console.log(`- Stock: ${productResult.data.stockLevel}`);
        console.log(`- Status: ${productResult.data.status}`);
      } else {
        console.error('Failed to get product:', productResult.error?.message);
      }
      
      // Example 2: Update stock
      console.log('\n--- Example 2: Update stock levels ---');
      const stockUpdates: StockUpdatePayload[] = [
        { sku: 'EXAMPLE-SKU-123', quantity: 100 },
        { sku: 'EXAMPLE-SKU-456', quantity: 50 }
      ];
      
      console.log(`Updating stock for ${stockUpdates.length} products...`);
      const stockUpdateResult = await takealotAdapter.updateStock(stockUpdates);
      
      if (stockUpdateResult.success && stockUpdateResult.data) {
        console.log(`Successfully updated ${stockUpdateResult.data.successful.length} products`);
        if (stockUpdateResult.data.failed.length > 0) {
          console.warn(`Failed to update ${stockUpdateResult.data.failed.length} products:`);
          stockUpdateResult.data.failed.forEach((failure: any) => {
            console.warn(`- SKU ${failure.sku}: ${failure.reason}`);
          });
        }
      } else {
        console.error('Failed to update stock:', stockUpdateResult.error?.message);
      }
      
      // Example 3: Update prices
      console.log('\n--- Example 3: Update prices ---');
      const priceUpdates: PriceUpdatePayload[] = [
        { sku: 'EXAMPLE-SKU-123', price: 299.99, salePrice: 249.99 },
        { sku: 'EXAMPLE-SKU-456', price: 149.99 }
      ];
      
      console.log(`Updating prices for ${priceUpdates.length} products...`);
      const priceUpdateResult = await takealotAdapter.updatePrices(priceUpdates);
      
      if (priceUpdateResult.success && priceUpdateResult.data) {
        console.log(`Successfully updated ${priceUpdateResult.data.successful.length} prices`);
        if (priceUpdateResult.data.failed.length > 0) {
          console.warn(`Failed to update ${priceUpdateResult.data.failed.length} prices:`);
          priceUpdateResult.data.failed.forEach((failure: any) => {
            console.warn(`- SKU ${failure.sku}: ${failure.reason}`);
          });
        }
      } else {
        console.error('Failed to update prices:', priceUpdateResult.error?.message);
      }
      
      // Example 4: Update product status
      console.log('\n--- Example 4: Update product status ---');
      const statusUpdates: StatusUpdatePayload[] = [
        { sku: 'EXAMPLE-SKU-123', status: ProductStatus.ACTIVE },
        { sku: 'EXAMPLE-SKU-456', status: ProductStatus.INACTIVE }
      ];
      
      console.log(`Updating status for ${statusUpdates.length} products...`);
      const statusUpdateResult = await takealotAdapter.updateStatus(statusUpdates);
      
      if (statusUpdateResult.success && statusUpdateResult.data) {
        console.log(`Successfully updated ${statusUpdateResult.data.successful.length} statuses`);
        if (statusUpdateResult.data.failed.length > 0) {
          console.warn(`Failed to update ${statusUpdateResult.data.failed.length} statuses:`);
          statusUpdateResult.data.failed.forEach((failure: any) => {
            console.warn(`- SKU ${failure.sku}: ${failure.reason}`);
          });
        }
      } else {
        console.error('Failed to update statuses:', statusUpdateResult.error?.message);
      }
      
      // Example 5: Get recent orders
      console.log('\n--- Example 5: Get recent orders ---');
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      console.log(`Fetching orders since ${lastWeek.toLocaleDateString()}...`);
      const recentOrders = await takealotAdapter.getRecentOrders(lastWeek, 0, 10);
      
      console.log(`Found ${recentOrders.data.length} orders (${recentOrders.total} total)`);
      recentOrders.data.forEach((order, index) => {
        console.log(`Order ${index + 1}:`);
        console.log(`- ID: ${order.id}`);
        console.log(`- Date: ${order.createdAt.toLocaleDateString()}`);
        console.log(`- Status: ${order.orderStatus}`);
        console.log(`- Total: ${order.total} ${order.currencyCode}`);
        console.log(`- Items: ${order.orderItems.length}`);
      });
      
      // Example 6: Get marketplace categories
      console.log('\n--- Example 6: Get marketplace categories ---');
      const categoriesResult = await takealotAdapter.getCategories();
      
      if (categoriesResult.success && categoriesResult.data) {
        console.log(`Found ${categoriesResult.data.length} top-level categories`);
        
        // Display first few categories
        const samplesToShow = Math.min(categoriesResult.data.length, 3);
        for (let i = 0; i < samplesToShow; i++) {
          const category = categoriesResult.data[i];
          console.log(`- Category: ${category.name} (${category.id})`);
          
          // Get attributes for this category
          const attributesResult = await takealotAdapter.getCategoryAttributes(category.id);
          
          if (attributesResult.success && attributesResult.data) {
            console.log(`  Has ${attributesResult.data.length} attributes`);
            // Show a sample attribute if available
            if (attributesResult.data.length > 0) {
              const attr = attributesResult.data[0];
              console.log(`  Sample attribute: ${attr.name} (${attr.required ? 'Required' : 'Optional'})`);
            }
          }
        }
      } else {
        console.error('Failed to get categories:', categoriesResult.error?.message);
      }
      
      // Close the adapter when done
      console.log('\nClosing adapter...');
      await takealotAdapter.close();
      console.log('Adapter closed');
      
    } else {
      console.error(`Failed to connect to ${takealotAdapter.marketplaceName}: ${connectionStatus.message}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? (error as Error).message
      : 'Unknown error';
    console.error('Error using Takealot adapter:', errorMessage);
  }
}

// This is just example code, not meant to be executed directly
// For documentation purposes only
// takealotAdapterExample().catch(console.error);