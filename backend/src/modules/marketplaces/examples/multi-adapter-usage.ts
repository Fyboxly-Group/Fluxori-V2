/**
 * Example showing how to use the multiple marketplace adapters via the product push service
 * 
 * This demonstrates:
 * 1. How the ProductPushService handles different marketplaces
 * 2. How to push updates to various marketplaces
 * 3. How to handle different update types (price, stock, status)
 */

import { ProductPushService } from '../services/product-push.service';
import { MarketplaceCredentialsService } from '../services/marketplace-credentials.service';

async function demonstrateMultiAdapterPush() : Promise<void> {
  try {
    console.log('Setting up mock credentials for demonstration...');
    
    // Set up mock credentials for different marketplaces
    const credentialsService = MarketplaceCredentialsService.getInstance();
    const userId = 'demo_user_123';
    
    await credentialsService.storeCredentials(userId, 'takealot', {
      apiKey: 'tak_demo_api_key',
      apiSecret: 'tak_demo_api_secret',
    });
    
    await credentialsService.storeCredentials(userId, 'amazon_us', {
      sellerId: 'amz_demo_seller_id',
      accessToken: 'amz_demo_access_token',
      refreshToken: 'amz_demo_refresh_token',
      clientId: 'amz_demo_client_id',
      clientSecret: 'amz_demo_client_secret',
    });
    
    await credentialsService.storeCredentials(userId, 'shopify', {
      apiKey: 'shp_demo_api_key',
      apiSecret: 'shp_demo_api_secret',
      accessToken: 'shp_demo_access_token',
      storeId: 'shp_demo_store_id',
    });
    
    // Get the ProductPushService
    const pushService = ProductPushService.getInstance();
    
    // Demo product ID
    const productId = 'demo_product_123';
    
    console.log('\n===== DEMONSTRATION: PUSHING TO TAKEALOT =====');
    // Push price and stock updates to Takealot
    const takealotResult = await pushService.pushProductUpdate(
      productId,
      'takealot',
      userId,
      {
        price: 499.99,
        stock: 50
      }
    );
    console.log('Takealot push result:', JSON.stringify(takealotResult, null, 2));
    
    console.log('\n===== DEMONSTRATION: PUSHING TO AMAZON US =====');
    // Push price update to Amazon
    const amazonResult = await pushService.pushProductUpdate(
      productId,
      'amazon_us',
      userId,
      {
        price: 24.99,
        rrp: 29.99, // Amazon supports RRP
        status: 'active'
      }
    );
    console.log('Amazon push result:', JSON.stringify(amazonResult, null, 2));
    
    console.log('\n===== DEMONSTRATION: PUSHING TO SHOPIFY =====');
    // Push status update to Shopify
    const shopifyResult = await pushService.pushProductUpdate(
      productId,
      'shopify',
      userId,
      {
        price: 19.99,
        stock: 100,
        status: 'inactive' // Temporarily disable on Shopify
      }
    );
    console.log('Shopify push result:', JSON.stringify(shopifyResult, null, 2));
    
    console.log('\n===== DEMONSTRATION: PUSHING TO UNSUPPORTED MARKETPLACE =====');
    // Try pushing to an unsupported marketplace (should fail)
    try {
      await pushService.pushProductUpdate(
        productId,
        'unsupported_marketplace',
        userId,
        { price: 9.99 }
      );
    } catch (error) {
      console.log('Expected error for unsupported marketplace:', 
        error instanceof Error ? error.message : String(error));
    }
    
    console.log('\nMulti-adapter demonstration completed successfully!');
  } catch (error) {
    console.error('Error in multi-adapter demonstration:', error instanceof Error ? error.message : String(error));
  }
}

// Execute the demonstration
// When imported as a module, this won't run automatically
if (require.main === module) {
  demonstrateMultiAdapterPush();
}

export { demonstrateMultiAdapterPush };