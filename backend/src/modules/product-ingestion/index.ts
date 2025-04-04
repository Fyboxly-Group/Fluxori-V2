import { Router } from 'express';
import productSyncRoutes from './routes/product-sync.routes';
import { container } from '../../config/inversify';
import { ProductSyncController } from './controllers/product-sync.controller';
import { ProductIngestionService } from './services/product-ingestion.service';

// Initialize mappers
import './mappers';

// Ensure controller is registered with the container
if (!container.isBound(ProductSyncController)) {
  container.bind<ProductSyncController>(ProductSyncController).toSelf().inSingletonScope();
}

/**
 * Initialize the Product Ingestion module
 * @param router - Express router
 */
export function initProductIngestionModule(router: Router): void {
  // Register routes
  router.use('/product-sync', productSyncRoutes);
  
  console.log('Product Ingestion module initialized');
}

// Export services
export { default as productIngestionService } from './services/product-ingestion.service';

// Export types and interfaces
export * from './services/product-ingestion.service';
export * from './models/product-sync-config.model';
export * from './models/product.model';
export * from './models/warehouse.model';
export * from './mappers/product-mapper.interface';