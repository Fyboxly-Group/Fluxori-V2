# Shopify API Reference for Fluxori-V2

This document provides a comprehensive reference of all Shopify API capabilities implemented in the Fluxori-V2 Shopify adapter. These services can be leveraged for future feature development.

## Table of Contents

1. [Product Service](#product-service)
2. [Inventory Service](#inventory-service)
3. [Order Service](#order-service)
4. [Fulfillment Service](#fulfillment-service)
5. [Customer Service](#customer-service)
6. [Collection Service](#collection-service)

## Product Service

The Product Service provides comprehensive access to Shopify's product-related endpoints.

### Methods

- **listProducts**: Retrieve a list of products with optional filtering
  ```typescript
  listProducts(options?: {
    limit?: number;
    page?: number;
    ids?: string[];
    title?: string;
    vendor?: string;
    handle?: string;
    product_type?: string;
    status?: string;
    collection_id?: string;
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    published_at_min?: string;
    published_at_max?: string;
    published_status?: string;
    fields?: string;
  })
  ```

- **getProduct**: Get a single product by ID
  ```typescript
  getProduct(productId: string)
  ```

- **createProduct**: Create a new product
  ```typescript
  createProduct(productData: {
    title: string;
    body_html?: string;
    vendor?: string;
    product_type?: string;
    status?: 'active' | 'draft' | 'archived';
    tags?: string;
    variants?: Partial<ShopifyVariant>[];
    options?: Array<{
      name: string;
      values: string[];
    }>;
    images?: Array<{
      src: string;
      alt?: string;
      position?: number;
    }>;
    // ...
  })
  ```

- **updateProduct**: Update an existing product
  ```typescript
  updateProduct(productId: string, productData: Partial<ShopifyProduct>)
  ```

- **deleteProduct**: Delete a product
  ```typescript
  deleteProduct(productId: string)
  ```

- **countProducts**: Count products with optional filtering
  ```typescript
  countProducts(options?: {
    vendor?: string;
    product_type?: string;
    collection_id?: string;
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    published_at_min?: string;
    published_at_max?: string;
    published_status?: string;
    status?: string;
  })
  ```

- **listProductVariants**: Get all variants for a product
  ```typescript
  listProductVariants(productId: string, options?: {
    limit?: number;
    since_id?: string;
    fields?: string;
  })
  ```

- **getVariant**: Get a specific variant
  ```typescript
  getVariant(variantId: string)
  ```

- **createVariant**: Create a new variant for a product
  ```typescript
  createVariant(productId: string, variantData: Partial<ShopifyVariant>)
  ```

- **updateVariant**: Update an existing variant
  ```typescript
  updateVariant(variantId: string, variantData: Partial<ShopifyVariant>)
  ```

- **deleteVariant**: Delete a variant
  ```typescript
  deleteVariant(productId: string, variantId: string)
  ```

- **countVariants**: Count variants for a product
  ```typescript
  countVariants(productId: string)
  ```

## Inventory Service

The Inventory Service provides access to Shopify's inventory management endpoints.

### Methods

- **getInventoryLevels**: List inventory levels with optional filtering
  ```typescript
  getInventoryLevels(options?: {
    inventory_item_ids?: string[];
    location_ids?: string[];
    limit?: number;
    page_info?: string;
  })
  ```

- **getInventoryLevel**: Get inventory level for a specific item at a location
  ```typescript
  getInventoryLevel(inventoryItemId: string, locationId: string)
  ```

- **setInventoryLevel**: Set inventory level for an item at a location
  ```typescript
  setInventoryLevel(inventoryItemId: string, locationId: string, available: number)
  ```

- **adjustInventoryLevel**: Adjust inventory level by a delta amount
  ```typescript
  adjustInventoryLevel(inventoryItemId: string, locationId: string, availableDelta: number)
  ```

- **connectInventoryLevel**: Connect an inventory item to a location
  ```typescript
  connectInventoryLevel(inventoryItemId: string, locationId: string)
  ```

- **disconnectInventoryLevel**: Disconnect an inventory item from a location
  ```typescript
  disconnectInventoryLevel(inventoryItemId: string, locationId: string)
  ```

- **getInventoryItem**: Get details about an inventory item
  ```typescript
  getInventoryItem(inventoryItemId: string)
  ```

- **updateInventoryItem**: Update inventory item details
  ```typescript
  updateInventoryItem(inventoryItemId: string, data: {
    sku?: string;
    tracked?: boolean;
    cost?: number;
    country_code_of_origin?: string;
    province_code_of_origin?: string;
    harmonized_system_code?: string;
    country_harmonized_system_codes?: Array<{
      country_code: string;
      harmonized_system_code: string;
    }>;
  })
  ```

- **getLocations**: Get all locations
  ```typescript
  getLocations(options?: {
    limit?: number;
  })
  ```

- **getLocation**: Get a specific location
  ```typescript
  getLocation(locationId: string)
  ```

- **countLocations**: Count locations
  ```typescript
  countLocations()
  ```

- **getInventoryLevelsForLocation**: Get inventory levels for a specific location
  ```typescript
  getInventoryLevelsForLocation(locationId: string, options?: {
    limit?: number;
    updated_at_min?: string;
    updated_at_max?: string;
  })
  ```

## Order Service

The Order Service provides access to Shopify's order management endpoints.

### Methods

- **listOrders**: List orders with optional filtering
  ```typescript
  listOrders(options?: {
    ids?: string[];
    limit?: number;
    since_id?: string;
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    processed_at_min?: string;
    processed_at_max?: string;
    attribution_app_id?: string;
    status?: string;
    financial_status?: string;
    fulfillment_status?: string;
    fields?: string;
  })
  ```

- **getOrder**: Get a specific order by ID
  ```typescript
  getOrder(orderId: string)
  ```

- **createOrder**: Create a new order
  ```typescript
  createOrder(orderData: {
    line_items: Array<{
      variant_id?: number;
      product_id?: number;
      title?: string;
      price?: string;
      quantity: number;
      sku?: string;
      // ...
    }>;
    customer?: {
      id?: number;
      email?: string;
      first_name?: string;
      last_name?: string;
      // ...
    };
    shipping_address?: any;
    billing_address?: any;
    financial_status?: string;
    fulfillment_status?: string;
    // ...
  })
  ```

- **updateOrder**: Update an existing order
  ```typescript
  updateOrder(orderId: string, orderData: Partial<ShopifyOrder>)
  ```

- **deleteOrder**: Delete an order
  ```typescript
  deleteOrder(orderId: string)
  ```

- **countOrders**: Count orders with optional filtering
  ```typescript
  countOrders(options?: {
    status?: string;
    financial_status?: string;
    fulfillment_status?: string;
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
  })
  ```

- **closeOrder**: Close an order
  ```typescript
  closeOrder(orderId: string)
  ```

- **reopenOrder**: Reopen a closed order
  ```typescript
  reopenOrder(orderId: string)
  ```

- **cancelOrder**: Cancel an order
  ```typescript
  cancelOrder(orderId: string, options?: {
    amount?: number;
    currency?: string;
    restock?: boolean;
    reason?: string;
    email?: boolean;
  })
  ```

- **createOrderRisk**: Create a risk assessment for an order
  ```typescript
  createOrderRisk(orderId: string, riskData: {
    message: string;
    recommendation: 'accept' | 'investigate' | 'cancel';
    score: number;
    source: string;
    cause_cancel?: boolean;
    display?: boolean;
  })
  ```

- **getOrderRisks**: Get risk assessments for an order
  ```typescript
  getOrderRisks(orderId: string)
  ```

- **getOrderRisk**: Get a specific risk assessment
  ```typescript
  getOrderRisk(orderId: string, riskId: string)
  ```

- **updateOrderRisk**: Update a risk assessment
  ```typescript
  updateOrderRisk(orderId: string, riskId: string, riskData: {
    message?: string;
    recommendation?: 'accept' | 'investigate' | 'cancel';
    score?: number;
    source?: string;
    cause_cancel?: boolean;
    display?: boolean;
  })
  ```

- **deleteOrderRisk**: Delete a risk assessment
  ```typescript
  deleteOrderRisk(orderId: string, riskId: string)
  ```

## Fulfillment Service

The Fulfillment Service provides access to Shopify's fulfillment-related endpoints.

### Methods

- **listFulfillments**: List fulfillments for an order
  ```typescript
  listFulfillments(orderId: string, options?: {
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    limit?: number;
    since_id?: string;
    fields?: string;
  })
  ```

- **getFulfillment**: Get a specific fulfillment
  ```typescript
  getFulfillment(orderId: string, fulfillmentId: string)
  ```

- **createFulfillment**: Create a fulfillment for an order
  ```typescript
  createFulfillment(orderId: string, fulfillmentData: {
    line_items?: Array<{
      id: number;
      quantity: number;
    }>;
    notify_customer?: boolean;
    tracking_info?: {
      number?: string;
      url?: string;
      company?: string;
    };
    location_id?: number;
    // ...
  })
  ```

- **updateFulfillment**: Update a fulfillment
  ```typescript
  updateFulfillment(orderId: string, fulfillmentId: string, fulfillmentData: {
    tracking_info?: {
      number?: string;
      url?: string;
      company?: string;
    };
    notify_customer?: boolean;
    // ...
  })
  ```

- **countFulfillments**: Count fulfillments for an order
  ```typescript
  countFulfillments(orderId: string, options?: {
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
  })
  ```

- **completeFulfillment**: Complete a fulfillment
  ```typescript
  completeFulfillment(orderId: string, fulfillmentId: string)
  ```

- **cancelFulfillment**: Cancel a fulfillment
  ```typescript
  cancelFulfillment(orderId: string, fulfillmentId: string)
  ```

- **getFulfillmentOrders**: Get fulfillment orders for an order
  ```typescript
  getFulfillmentOrders(orderId: string)
  ```

- **getFulfillmentOrder**: Get a specific fulfillment order
  ```typescript
  getFulfillmentOrder(fulfillmentOrderId: string)
  ```

- **cancelFulfillmentOrder**: Cancel a fulfillment order
  ```typescript
  cancelFulfillmentOrder(fulfillmentOrderId: string)
  ```

- **closeFulfillmentOrder**: Close a fulfillment order
  ```typescript
  closeFulfillmentOrder(fulfillmentOrderId: string, message?: string)
  ```

- **createFulfillmentFromOrder**: Create fulfillment from a fulfillment order
  ```typescript
  createFulfillmentFromOrder(fulfillmentOrderId: string, fulfillmentData: {
    tracking_info?: {
      number?: string;
      url?: string;
      company?: string;
    };
    notify_customer?: boolean;
    // ...
  })
  ```

## Customer Service

The Customer Service provides access to Shopify's customer management endpoints.

### Methods

- **listCustomers**: List customers with optional filtering
  ```typescript
  listCustomers(options?: {
    ids?: string[];
    limit?: number;
    since_id?: string;
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    fields?: string;
    order?: string;
  })
  ```

- **getCustomer**: Get a specific customer
  ```typescript
  getCustomer(customerId: string)
  ```

- **createCustomer**: Create a new customer
  ```typescript
  createCustomer(customerData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    verified_email?: boolean;
    addresses?: ShopifyAddress[];
    password?: string;
    password_confirmation?: string;
    send_email_welcome?: boolean;
    tags?: string;
    tax_exempt?: boolean;
    // ...
  })
  ```

- **updateCustomer**: Update an existing customer
  ```typescript
  updateCustomer(customerId: string, customerData: Partial<ShopifyCustomer>)
  ```

- **deleteCustomer**: Delete a customer
  ```typescript
  deleteCustomer(customerId: string)
  ```

- **countCustomers**: Count customers with optional filtering
  ```typescript
  countCustomers(options?: {
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
  })
  ```

- **searchCustomers**: Search for customers
  ```typescript
  searchCustomers(query: string, options?: {
    limit?: number;
    fields?: string;
    order?: string;
  })
  ```

- **getAddresses**: Get addresses for a customer
  ```typescript
  getAddresses(customerId: string)
  ```

- **getAddress**: Get a specific address for a customer
  ```typescript
  getAddress(customerId: string, addressId: string)
  ```

- **createAddress**: Create a new address for a customer
  ```typescript
  createAddress(customerId: string, addressData: {
    address1?: string;
    address2?: string;
    city?: string;
    company?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    province?: string;
    country?: string;
    zip?: string;
    name?: string;
    province_code?: string;
    country_code?: string;
    default?: boolean;
    // ...
  })
  ```

- **updateAddress**: Update a customer address
  ```typescript
  updateAddress(customerId: string, addressId: string, addressData: Partial<ShopifyAddress>)
  ```

- **deleteAddress**: Delete a customer address
  ```typescript
  deleteAddress(customerId: string, addressId: string)
  ```

- **setDefaultAddress**: Set default address for a customer
  ```typescript
  setDefaultAddress(customerId: string, addressId: string)
  ```

## Collection Service

The Collection Service provides access to Shopify's collection management endpoints.

### Methods

- **getCustomCollections**: Get all custom collections
  ```typescript
  getCustomCollections(options?: {
    limit?: number;
    since_id?: string;
    title?: string;
    product_id?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    published_at_min?: string;
    published_at_max?: string;
    published_status?: 'published' | 'unpublished' | 'any';
    fields?: string;
  })
  ```

- **getCustomCollection**: Get a specific custom collection
  ```typescript
  getCustomCollection(collectionId: string)
  ```

- **createCustomCollection**: Create a new custom collection
  ```typescript
  createCustomCollection(collectionData: {
    title: string;
    body_html?: string;
    sort_order?: 'alpha-asc' | 'alpha-desc' | 'best-selling' | 'created' | 'created-desc' | 'manual' | 'price-asc' | 'price-desc';
    template_suffix?: string;
    published?: boolean;
    published_scope?: 'web' | 'global';
    image?: {
      src: string;
      alt?: string;
    };
    // ...
  })
  ```

- **updateCustomCollection**: Update a custom collection
  ```typescript
  updateCustomCollection(collectionId: string, collectionData: {
    title?: string;
    body_html?: string;
    sort_order?: 'alpha-asc' | 'alpha-desc' | 'best-selling' | 'created' | 'created-desc' | 'manual' | 'price-asc' | 'price-desc';
    template_suffix?: string;
    published?: boolean;
    published_scope?: 'web' | 'global';
    image?: {
      src: string;
      alt?: string;
    };
    // ...
  })
  ```

- **deleteCustomCollection**: Delete a custom collection
  ```typescript
  deleteCustomCollection(collectionId: string)
  ```

- **countCustomCollections**: Count custom collections
  ```typescript
  countCustomCollections(options?: {
    title?: string;
    product_id?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    published_at_min?: string;
    published_at_max?: string;
    published_status?: 'published' | 'unpublished' | 'any';
  })
  ```

- **getSmartCollections**: Get all smart collections
  ```typescript
  getSmartCollections(options?: {
    limit?: number;
    since_id?: string;
    title?: string;
    product_id?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    published_at_min?: string;
    published_at_max?: string;
    published_status?: 'published' | 'unpublished' | 'any';
    fields?: string;
  })
  ```

- **getSmartCollection**: Get a specific smart collection
  ```typescript
  getSmartCollection(collectionId: string)
  ```

- **createSmartCollection**: Create a new smart collection
  ```typescript
  createSmartCollection(collectionData: {
    title: string;
    body_html?: string;
    sort_order?: 'alpha-asc' | 'alpha-desc' | 'best-selling' | 'created' | 'created-desc' | 'manual' | 'price-asc' | 'price-desc';
    template_suffix?: string;
    published?: boolean;
    published_scope?: 'web' | 'global';
    image?: {
      src: string;
      alt?: string;
    };
    rules: Array<{
      column: string;
      relation: string;
      condition: string;
    }>;
    // ...
  })
  ```

- **updateSmartCollection**: Update a smart collection
  ```typescript
  updateSmartCollection(collectionId: string, collectionData: {
    title?: string;
    body_html?: string;
    sort_order?: 'alpha-asc' | 'alpha-desc' | 'best-selling' | 'created' | 'created-desc' | 'manual' | 'price-asc' | 'price-desc';
    template_suffix?: string;
    published?: boolean;
    published_scope?: 'web' | 'global';
    image?: {
      src: string;
      alt?: string;
    };
    rules?: Array<{
      column: string;
      relation: string;
      condition: string;
    }>;
    // ...
  })
  ```

- **deleteSmartCollection**: Delete a smart collection
  ```typescript
  deleteSmartCollection(collectionId: string)
  ```

- **countSmartCollections**: Count smart collections
  ```typescript
  countSmartCollections(options?: {
    title?: string;
    product_id?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    published_at_min?: string;
    published_at_max?: string;
    published_status?: 'published' | 'unpublished' | 'any';
  })
  ```

- **getCollectionProducts**: Get all products in a collection
  ```typescript
  getCollectionProducts(collectionId: string, options?: {
    limit?: number;
    since_id?: string;
    fields?: string;
  })
  ```

- **addProductToCollection**: Add a product to a custom collection
  ```typescript
  addProductToCollection(collectionId: string, productId: string)
  ```

- **removeProductFromCollection**: Remove a product from a custom collection
  ```typescript
  removeProductFromCollection(collectId: string)
  ```

- **getCollects**: Get collects (product-collection relationships)
  ```typescript
  getCollects(options?: {
    limit?: number;
    since_id?: string;
    collection_id?: string;
    product_id?: string;
    fields?: string;
  })
  ```

- **countCollects**: Count collects
  ```typescript
  countCollects(options?: {
    collection_id?: string;
    product_id?: string;
  })
  ```

## Using the Services in Fluxori-V2

Each of these services is accessible through the ShopifyAdapter instance, which implements the IMarketplaceAdapter interface. However, for direct access to specific Shopify capabilities, you can also access the service instances directly:

```typescript
import { ShopifyAdapter } from '../modules/marketplaces';

// Initialize adapter
const shopifyAdapter = new ShopifyAdapter();
await shopifyAdapter.initialize({
  shopDomain: 'your-store.myshopify.com',
  accessToken: 'your-access-token'
});

// Then access services directly by casting to ShopifyAdapter
const adapter = shopifyAdapter as ShopifyAdapter;

// Examples of using the services:

// Create a new product
const product = await adapter.productService.createProduct({
  title: 'New Product',
  body_html: '<p>Description</p>',
  vendor: 'My Brand',
  product_type: 'Electronics',
  status: 'active'
});

// Update inventory
await adapter.inventoryService.setInventoryLevel(
  inventoryItemId,
  locationId,
  100 // quantity
);

// Create a new order
await adapter.orderService.createOrder({
  line_items: [
    {
      variant_id: 123456789,
      quantity: 1
    }
  ],
  customer: {
    email: 'customer@example.com'
  }
});

// Fulfill an order
await adapter.fulfillmentService.createFulfillment(
  orderId,
  {
    notify_customer: true,
    tracking_info: {
      number: 'TRACKING-123',
      company: 'USPS'
    }
  }
);

// Search for customers
const customers = await adapter.customerService.searchCustomers(
  'john.doe@example.com'
);

// Create a collection
await adapter.collectionService.createCustomCollection({
  title: 'New Collection',
  body_html: '<p>Collection description</p>',
  published: true
});
```

This comprehensive API integration provides a solid foundation for building advanced Shopify-related features in the Fluxori-V2 platform.