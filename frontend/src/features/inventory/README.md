# Inventory Feature

This feature implements inventory management capabilities for Fluxori V2, including:

- Inventory item management (CRUD operations)
- Stock level tracking and updates
- Marketplace integration for pushing updates to connected marketplaces

## Key Components

### Components

- **InventoryDetail**: Main component for viewing inventory item details
- **MarketplacePush**: Component for pushing inventory updates to connected marketplaces

### API

- **inventory.api.ts**: Contains all API functions for interacting with the backend inventory endpoints

### Hooks

- **useInventory**: React Query hooks for all inventory-related data fetching and mutations

## Using the Marketplace Push Feature

The Marketplace Push feature allows users to:

1. View all connected marketplaces for their account
2. Select which fields (price, stock level, status) to push to each marketplace
3. Push updates to one or more marketplaces with visual feedback

### Example Usage

```tsx
import { InventoryDetail } from '@/features/inventory';

function MyPage() {
  const itemId = '123'; // Get this from your route params or state
  
  return (
    <InventoryDetail itemId={itemId} />
  );
}
```

### Integration with Backend

The marketplace push feature integrates with these backend endpoints:

- `GET /api/marketplaces/connected`: Gets all connected marketplaces
- `POST /api/products/:productId/push/:marketplaceId`: Pushes selected updates to a marketplace

## Types

Key types used in this feature:

- `InventoryItem`: Represents an inventory item with all its properties
- `MarketplaceConnection`: Represents a connected marketplace with its status
- `MarketplacePushOptions`: Options for pushing updates to a marketplace
- `MarketplacePushResult`: Result from pushing updates to a marketplace