# Firestore Database Schemas for Fluxori-V2

This directory contains the TypeScript schema definitions for the Firestore collections used in Fluxori-V2.

## Collections

The database consists of the following main collections:

### 1. `orders` Collection

Stores order information from various marketplaces, standardized into a common format.

#### Order Document Structure

- **Authentication and Organization**
  - `userId`: string (User who owns this order) [Indexed]
  - `orgId`: string (Organization the order belongs to) [Indexed]

- **Marketplace Information**
  - `marketplaceOrderId`: string (Original order ID in the marketplace) [Indexed]
  - `marketplaceName`: string (e.g., 'takealot', 'amazon_us', 'shopify') [Indexed]
  - `externalOrderId`: string (Optional additional external reference)

- **Timestamps and Status**
  - `orderDate`: timestamp (When the order was placed) [Indexed]
  - `lastUpdatedMarketplace`: timestamp (When the order was last updated on the marketplace) [Indexed]
  - `createdAt`: timestamp (Fluxori internal creation time)
  - `updatedAt`: timestamp (Fluxori internal last update time)
  - `status`: string (e.g., 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled') [Indexed]
  - `paymentStatus`: string (e.g., 'Pending', 'Paid', 'Refunded')
  - `shippingStatus`: string (e.g., 'Awaiting Fulfillment', 'Shipped', 'Delivered')

- **Financial Information**
  - `currency`: string (e.g., 'ZAR', 'USD')
  - `subtotal`: number
  - `shippingCost`: number
  - `tax`: number
  - `discount`: number
  - `total`: number

- **Customer and Shipping Information**
  - `customerInfo`: object { `name`, `email`, `phone` }
  - `shippingAddress`: object { `line1`, `city`, `postalCode`, `countryCode`, etc. }
  - `billingAddress`: object (similar structure)
  - `shippingDetails`: object { `method`, `carrier`, `trackingNumber`, etc. }
  - `paymentDetails`: object { `method`, `transactionId`, `amount`, etc. }

- **Order Items**
  - `lineItems`: array of objects [
      { 
        `sku`, 
        `marketplaceProductId`, 
        `fluxoriProductId` (optional), 
        `quantity`, 
        `price`, 
        `title`,
        `tax`,
        `discount`,
        `totalPrice`
      }
    ]

- **Integration Fields**
  - `xeroInvoiceId`: string (Optional, added when synced)
  - `xeroInvoiceStatus`: string (Optional)

- **Additional Metadata**
  - `notes`: string (Optional notes about the order)
  - `fulfillmentType`: string ('marketplace_fulfilled' | 'seller_fulfilled')
  - `channelType`: string (Optional channel information)
  - `isPriority`: boolean (Whether this is a priority order)
  - `tags`: string[] (Optional tags for categorization)
  - `marketplaceSpecific`: object (For marketplace-specific data)

#### Important Indexes

- `userId` + `orderDate`
- `orgId` + `orderDate`
- `userId` + `status` + `orderDate`
- `userId` + `marketplaceName` + `orderDate`
- `userId` + `marketplaceName` + `marketplaceOrderId`
- `userId` + `lastUpdatedMarketplace`
- `lineItems.sku` (Field override for array field)
- `tags` (Field override for array contains operations)

### 2. `inventory` Collection

Stores product and inventory information, standardized from marketplace data.

#### Inventory Document Structure

- **Authentication and Organization**
  - `userId`: string (User who owns this product) [Indexed]
  - `orgId`: string (Organization the product belongs to) [Indexed]

- **Product Identification**
  - `sku`: string (Primary product identifier) [Indexed]
  - `barcode`: string (Optional barcode/UPC/EAN)

- **Product Details**
  - `title`: string (Product name)
  - `description`: string (Product description)
  - `imageUrls`: string[] (Links to Cloud Storage)
  - `categories`: string[] (Product categories)
  - `tags`: string[] (Product tags)
  - `attributes`: array of { `name`, `value`, `unit` } (Product attributes)
  - `dimensions`: object { `weight`, `weightUnit`, `length`, `width`, `height`, etc. }

- **Pricing**
  - `basePrice`: number
  - `currencyCode`: string
  - `costPrice`: number (Optional)
  - `msrp`: number (Manufacturer's Suggested Retail Price) (Optional)
  - `salePrice`: number (Optional)
  - `saleStartDate`: timestamp (Optional)
  - `saleEndDate`: timestamp (Optional)

- **Stock Information**
  - `stockLevels`: map where key is `warehouseId`, value is object {
      `quantityOnHand`: number,
      `quantityAllocated`: number,
      `reorderPoint`: number (optional),
      `preferredStockLevel`: number (optional),
      `binLocation`: string (optional),
      `lastUpdated`: timestamp
    }
  - `totalStock`: number (Calculated total across all warehouses)

- **Marketplace Information**
  - `marketplaces`: map where key is `marketplaceId` (e.g., 'takealot'), value is object {
      `marketplaceProductId`: string,
      `status`: string,
      `price`: number,
      `currencyCode`: string,
      `url`: string (optional),
      `lastSynced`: timestamp,
      `listingErrors`: string[] (optional),
      `marketplaceSpecific`: object (optional)
    }

- **Status and Timestamps**
  - `status`: string (e.g., 'active', 'inactive', 'pending', 'deleted')
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
  - `createdBy`: string (User ID of the creator)

- **Supplier Information**
  - `supplierId`: string (Optional)
  - `supplierSku`: string (Optional)
  - `leadTime`: number (Time in days for reordering) (Optional)
  - `minimumOrderQuantity`: number (Optional)

- **Additional Flags**
  - `isDigital`: boolean (Whether this is a digital product)
  - `isTaxable`: boolean (Whether this product is taxable)
  - `taxRate`: number (Applicable tax rate)
  - `internalNotes`: string (Optional internal notes)
  - `externalProductId`: string (Optional additional external reference)

#### Important Indexes

- `userId` + `sku`
- `orgId` + `sku`
- `userId` + `updatedAt`
- `userId` + `status`
- `userId` + `tags` (array-contains)
- `userId` + `status` + `totalStock`
- `userId` + `categories` + `title`
- Market-specific product ID indexes: 
  - `marketplaces.takealot.marketplaceProductId`
  - `marketplaces.amazon_us.marketplaceProductId`
  - `marketplaces.shopify.marketplaceProductId`

## Services

The following services are available for interacting with these collections:

1. `OrderService`: Methods for CRUD operations on orders
2. `InventoryService`: Methods for CRUD operations on inventory items

## Type Definitions

The schema files provide TypeScript interfaces for:

- `FirestoreOrder` and `FirestoreOrderWithId`: For orders
- `FirestoreInventoryItem` and `FirestoreInventoryItemWithId`: For inventory
- Various sub-interfaces for nested data structures
- `orderConverter` and `inventoryConverter`: For Firestore data conversion

## Security Rules

Firestore security rules enforce the following constraints:

- Documents are only accessible to their owners or members of the same organization
- Create operations must include the current user's ID
- Update operations cannot change ownership information
- Delete operations are restricted to document owners

## Usage Example

```typescript
import { OrderService } from '../services/firestore/order.service';
import { FirestoreOrder } from '../models/firestore/order.schema';

// Create a new order
const orderData: FirestoreOrder = {
  userId: 'user123',
  orgId: 'org456',
  marketplaceOrderId: 'TAK12345',
  marketplaceName: 'takealot',
  // ... other required fields
};

const orderId = await OrderService.createOrder(orderData);
console.log(`Created order: ${orderId}`);

// Fetch orders
const { orders } = await OrderService.fetchOrders({
  userId: 'user123',
  limit: 10,
  status: 'Pending'
});
```