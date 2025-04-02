// Export all API services for easy imports

import AuthService from './auth.service';
import UserManagementService from './user-management.service';
import InventoryService from './inventory.service';
import OrderService from './order.service';
import BuyBoxService from './buybox.service';
import ReportingService from './reporting.service';
import AIService from './ai.service';

// Re-export services
export {
  AuthService,
  UserManagementService,
  InventoryService,
  OrderService,
  BuyBoxService,
  ReportingService,
  AIService
};

// Re-export types from services
export * from './auth.service';
export * from './user-management.service';
export * from './inventory.service';
export * from './order.service';
export * from './buybox.service';
export * from './reporting.service';
export * from './ai.service';

// Export default object with all services
export default {
  auth: AuthService,
  userManagement: UserManagementService,
  inventory: InventoryService,
  order: OrderService,
  buyBox: BuyBoxService,
  reporting: ReportingService,
  ai: AIService
};