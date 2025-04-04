/**
 * Dependency Injection Container Setup
 * Using InversifyJS for IoC container with TypeScript support
 */
import { Container, ContainerModule, interfaces } from 'inversify';
import { logger, ILogger } from '../utils/logger';

// Import repositories
import { 
  UserRepository, 
  IUserRepository
} from '../domain/repositories/user.repository';
import { 
  OrganizationRepository, 
  IOrganizationRepository
} from '../domain/repositories/organization.repository';
import { 
  ProductRepository, 
  IProductRepository
} from '../domain/repositories/product.repository';
import { 
  InventoryItemRepository, 
  IInventoryItemRepository,
  InventoryLevelRepository,
  IInventoryLevelRepository,
  InventoryTransactionRepository,
  IInventoryTransactionRepository,
  StockAlertRepository,
  IStockAlertRepository
} from '../domain/repositories/inventory.repository';
import {
  WarehouseRepository,
  IWarehouseRepository
} from '../domain/repositories/warehouse.repository';

// Import services
import {
  UserService,
  IUserService
} from '../domain/services/user.service';
import {
  OrganizationService,
  IOrganizationService
} from '../domain/services/organization.service';
import {
  ProductService,
  IProductService
} from '../domain/services/product.service';
import {
  InventoryService,
  IInventoryService
} from '../domain/services/inventory.service';

// Import controllers
import {
  UserController,
  IUserController
} from '../controllers/user.controller';
import {
  OrganizationController,
  IOrganizationController
} from '../controllers/organization.controller';
import {
  ProductController,
  IProductController
} from '../controllers/product.controller';

/**
 * Types for dependency injection
 */
export const TYPES = {
  // Core
  Logger: Symbol.for('Logger'),
  
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  OrganizationRepository: Symbol.for('OrganizationRepository'),
  ProductRepository: Symbol.for('ProductRepository'),
  InventoryItemRepository: Symbol.for('InventoryItemRepository'),
  InventoryLevelRepository: Symbol.for('InventoryLevelRepository'),
  InventoryTransactionRepository: Symbol.for('InventoryTransactionRepository'),
  StockAlertRepository: Symbol.for('StockAlertRepository'),
  WarehouseRepository: Symbol.for('WarehouseRepository'),
  OrderRepository: Symbol.for('OrderRepository'),
  
  // Services
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  OrganizationService: Symbol.for('OrganizationService'),
  ProductService: Symbol.for('ProductService'),
  InventoryService: Symbol.for('InventoryService'),
  OrderService: Symbol.for('OrderService'),
  
  // Controllers
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
  OrganizationController: Symbol.for('OrganizationController'),
  ProductController: Symbol.for('ProductController'),
  InventoryController: Symbol.for('InventoryController'),
  WarehouseController: Symbol.for('WarehouseController'),
  OrderController: Symbol.for('OrderController'),
};

/**
 * Core module with basic services
 */
export const coreModule = new ContainerModule((bind: interfaces.Bind) => {
  // Logger
  bind<ILogger>(TYPES.Logger).toConstantValue(logger);
});

/**
 * Repository module
 */
export const repositoryModule = new ContainerModule((bind: interfaces.Bind) => {
  // User repository
  bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
  
  // Organization repository
  bind<IOrganizationRepository>(TYPES.OrganizationRepository).to(OrganizationRepository).inSingletonScope();
  
  // Product repository
  bind<IProductRepository>(TYPES.ProductRepository).to(ProductRepository).inSingletonScope();
  
  // Inventory repositories
  bind<IInventoryItemRepository>(TYPES.InventoryItemRepository).to(InventoryItemRepository).inSingletonScope();
  bind<IInventoryLevelRepository>(TYPES.InventoryLevelRepository).to(InventoryLevelRepository).inSingletonScope();
  bind<IInventoryTransactionRepository>(TYPES.InventoryTransactionRepository).to(InventoryTransactionRepository).inSingletonScope();
  bind<IStockAlertRepository>(TYPES.StockAlertRepository).to(StockAlertRepository).inSingletonScope();
  
  // Warehouse repository
  bind<IWarehouseRepository>(TYPES.WarehouseRepository).to(WarehouseRepository).inSingletonScope();
});

/**
 * Service module
 */
export const serviceModule = new ContainerModule((bind: interfaces.Bind) => {
  // User service
  bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope();
  
  // Organization service
  bind<IOrganizationService>(TYPES.OrganizationService).to(OrganizationService).inSingletonScope();
  
  // Product service
  bind<IProductService>(TYPES.ProductService).to(ProductService).inSingletonScope();
  
  // Inventory service
  bind<IInventoryService>(TYPES.InventoryService).to(InventoryService).inSingletonScope();
});

/**
 * Controller module
 */
export const controllerModule = new ContainerModule((bind: interfaces.Bind) => {
  // User controller
  bind<IUserController>(TYPES.UserController).to(UserController).inSingletonScope();
  
  // Organization controller
  bind<IOrganizationController>(TYPES.OrganizationController).to(OrganizationController).inSingletonScope();
  
  // Product controller
  bind<IProductController>(TYPES.ProductController).to(ProductController).inSingletonScope();
});

/**
 * Create and configure the container
 * @returns Configured InversifyJS container
 */
export function createContainer(): Container {
  const container = new Container();
  
  // Load modules
  container.load(coreModule);
  container.load(repositoryModule);
  container.load(serviceModule);
  container.load(controllerModule);
  
  return container;
}

/**
 * Container instance
 */
export const container = createContainer();