/**
 * Domain models exports
 * Provides a single point of access for all domain models
 */

// User model
import UserModel from './user.model';
export { UserModel };
export * from './user.model';

// Organization model
import OrganizationModel from './organization.model';
export { OrganizationModel };
export * from './organization.model';

// Product model
import ProductModel from './product.model';
export { ProductModel };
export * from './product.model';

// Inventory models
import {
  WarehouseModel,
  InventoryLocationModel,
  InventoryItemModel,
  InventoryLevelModel,
  InventoryReservationModel,
  InventoryTransactionModel,
  StockCountModel,
  StockCountItemModel,
  StockAlertModel
} from './inventory.model';

export {
  WarehouseModel,
  InventoryLocationModel,
  InventoryItemModel,
  InventoryLevelModel,
  InventoryReservationModel,
  InventoryTransactionModel,
  StockCountModel,
  StockCountItemModel,
  StockAlertModel
};

export * from './inventory.model';