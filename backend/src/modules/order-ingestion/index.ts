/**
 * Order Ingestion Module
 * 
 * This module handles ingestion of orders from various marketplaces,
 * transforming them into a standard format, and storing them in the system.
 * It also handles integration with Xero for invoice creation.
 */

// Import services
import orderIngestionService, { OrderIngestionService } from './services/order-ingestion.service';
import XeroInvoiceService from './services/xero-invoice.service';

// Import mappers
import { OrderMapperRegistry, orderMapperRegistry, IOrderMapper } from './mappers/order-mapper.interface';
import './mappers/amazon-order.mapper';  // Register Amazon mapper

// Export types from models
export * from './models/order.model';

// Export types from services
export {
  OrderIngestionService,
  OrderIngestionOptions,
  OrderIngestionResponse
} from './services/order-ingestion.service';

export {
  XeroInvoiceService,
  XeroInvoiceResult
} from './services/xero-invoice.service';

// Export mapper interfaces
export {
  IOrderMapper,
  OrderMapperRegistry
};

// Export singleton instances
export {
  orderIngestionService,
  orderMapperRegistry
};

// Default export
export default orderIngestionService;