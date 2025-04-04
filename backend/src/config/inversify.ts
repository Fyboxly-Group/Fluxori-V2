import { Container } from 'inversify';
import { Logger } from 'winston';
import { Firestore } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
import { TYPES } from './inversify.types';

// Core services
import { LoggerService, ILoggerService } from '../services/logger.service';
import { InventoryService, IInventoryService } from '../services/inventory.service';
import { OrganizationService, IOrganizationService } from '../services/organization.service';

// Marketplace module imports
import { AmazonAdapter } from '../modules/marketplaces/adapters/amazon/amazon.adapter';
import { ShopifyAdapter } from '../modules/marketplaces/adapters/shopify/shopify-adapter';
import { TakealotAdapter } from '../modules/marketplaces/adapters/takealot/takealot-adapter';
import { MarketplaceAdapterFactory } from '../modules/marketplaces/adapters/marketplace-adapter.factory';
import { MarketplaceAdapterFactoryService } from '../modules/marketplaces/services/marketplace-adapter-factory.service';

// Controllers
import { InventoryController } from '../controllers/inventory.controller';

// Order Ingestion module
import { OrderIngestionController } from '../modules/order-ingestion/controllers/order-ingestion.controller';

// BuyBox module
import { RepricingRuleRepository } from '../modules/buybox/repositories/repricing-rule.repository';
import { RepricingEventRepository } from '../modules/buybox/repositories/repricing-event.repository';
import { RepricingEngineService } from '../modules/buybox/services/repricing-engine.service';
import { RepricingSchedulerService } from '../modules/buybox/services/repricing-scheduler.service';
import { RepricingController } from '../modules/buybox/controllers/repricing.controller';
import { BuyBoxHistoryRepository } from '../modules/buybox/repositories/buybox-history.repository';
import { BuyBoxController } from '../modules/buybox/controllers/buybox.controller';
import { BuyBoxMonitoringService } from '../modules/buybox/services/buybox-monitoring.service';
import { BuyBoxMonitorFactory } from '../modules/buybox/factories/buybox-monitor.factory';

// AI Insights module
import { InsightRepository } from '../modules/ai-insights/repositories/insight.repository';
import { ScheduledJobRepository } from '../modules/ai-insights/repositories/scheduled-job.repository';
import { InsightGenerationService } from '../modules/ai-insights/services/insight-generation.service';
import { InsightSchedulerService } from '../modules/ai-insights/services/insight-scheduler.service';
import { InsightDataService } from '../modules/ai-insights/services/insight-data.service';
import { DeepseekLlmService } from '../modules/ai-insights/services/deepseek-llm.service';
import { InsightController } from '../modules/ai-insights/controllers/insight.controller';
import { ScheduledJobController } from '../modules/ai-insights/controllers/scheduled-job.controller';

// Credits module
import { CreditService } from '../modules/credits/services/credit.service';

// Initialize container
const container = new Container();

// Import winston module types
import * as winston from 'winston';
// For clarity, create aliases
const WinstonTransports = winston.transports;
const WinstonFormat = winston.format;

// Setup logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: WinstonFormat.combine(
    WinstonFormat.timestamp(),
    WinstonFormat.json()
  ),
  transports: [
    new WinstonTransports.Console({
      format: WinstonFormat.combine(
        WinstonFormat.colorize(),
        WinstonFormat.simple()
      )
    }),
    new WinstonTransports.File({ filename: 'logs/error.log', level: 'error' }),
    new WinstonTransports.File({ filename: 'logs/combined.log' })
  ]
});

// Initialize Firestore
let firestore: Firestore;
try {
  // Check if app already initialized to avoid duplicate initialization
  try {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}')),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } catch (error) {
    console.log('Firebase app already initialized');
  }
  
  firestore = getFirestore();
} catch (error) {
  logger.error('Error initializing Firestore', { error });
  // Create a fallback if Firestore fails to initialize (development environment)
  firestore = {} as Firestore;
}

// Register common services
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
container.bind<Firestore>(TYPES.Firestore).toConstantValue(firestore);

// Register core services
container.bind<ILoggerService>(TYPES.LoggerService).to(LoggerService).inSingletonScope();
container.bind<IInventoryService>(TYPES.InventoryService).to(InventoryService);
container.bind<IOrganizationService>(TYPES.OrganizationService).to(OrganizationService);

// Import storage providers
import { GCSStorageProvider } from '../services/storage/providers/gcs-provider';
import { S3StorageProvider } from '../services/storage/providers/s3-provider';
import { LocalStorageProvider } from '../services/storage/providers/local-provider';
import { StorageService } from '../services/storage/storage.service';

// Import PDF service providers
import { PDFLibProvider } from '../services/pdf/providers/pdf-lib-provider';
import { PDFKitProvider } from '../services/pdf/providers/pdfkit-provider';
import { TemplateService, ITemplateService } from '../services/pdf/template.service';
import { PDFGenerationService, IPDFGenerationService } from '../services/pdf/pdf-generation.service';
import { DocumentController } from '../controllers/document.controller';

// Import Auth service and controller
import { AuthService, IAuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';

// Register storage providers
container.bind<GCSStorageProvider>(TYPES.GCSStorageProvider).to(GCSStorageProvider).inSingletonScope();
container.bind<S3StorageProvider>(TYPES.S3StorageProvider).to(S3StorageProvider).inSingletonScope();
container.bind<LocalStorageProvider>(TYPES.LocalStorageProvider).to(LocalStorageProvider).inSingletonScope();
container.bind<StorageService>(TYPES.StorageService).to(StorageService).inSingletonScope();

// Register PDF providers and services
container.bind<PDFLibProvider>(PDFLibProvider).toSelf().inSingletonScope();
container.bind<PDFKitProvider>(PDFKitProvider).toSelf().inSingletonScope();
container.bind<ITemplateService>(TYPES.TemplateService).to(TemplateService).inSingletonScope();
container.bind<IPDFGenerationService>(TYPES.PDFGenerationService).to(PDFGenerationService).inSingletonScope();
container.bind<DocumentController>(DocumentController).toSelf().inSingletonScope();

// Register Auth service and controller
container.bind<IAuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<AuthController>(AuthController).toSelf().inSingletonScope();

// Register BuyBox module services
container.bind<BuyBoxHistoryRepository>(BuyBoxHistoryRepository).toSelf();
container.bind<RepricingRuleRepository>(RepricingRuleRepository).toSelf();
container.bind<RepricingEventRepository>(RepricingEventRepository).toSelf();
container.bind<RepricingEngineService>(RepricingEngineService).toSelf();
container.bind<RepricingSchedulerService>(RepricingSchedulerService).toSelf();
container.bind<RepricingController>(RepricingController).toSelf();
container.bind<BuyBoxController>(BuyBoxController).toSelf();
container.bind<BuyBoxMonitoringService>(BuyBoxMonitoringService).toSelf();
container.bind<BuyBoxMonitorFactory>(BuyBoxMonitorFactory).toSelf();

// Register AI Insights module services
container.bind<InsightRepository>(InsightRepository).toSelf();
container.bind<ScheduledJobRepository>(ScheduledJobRepository).toSelf();
container.bind<InsightGenerationService>(InsightGenerationService).toSelf();
container.bind<InsightSchedulerService>(InsightSchedulerService).toSelf();
container.bind<InsightDataService>(InsightDataService).toSelf();
container.bind<DeepseekLlmService>(DeepseekLlmService).toSelf();
container.bind<InsightController>(InsightController).toSelf();
container.bind<ScheduledJobController>(ScheduledJobController).toSelf();

// Register Credits module services
container.bind<CreditService>(CreditService).toSelf();

// Register Controllers
container.bind<InventoryController>(InventoryController).toSelf().inSingletonScope();
container.bind<OrderIngestionController>(OrderIngestionController).toSelf().inSingletonScope();

// Register Product Ingestion Module
import { ProductIngestionService, IProductIngestionService } from '../modules/product-ingestion/services/product-ingestion.service';
container.bind<IProductIngestionService>(ProductIngestionService).toSelf().inSingletonScope();

// Register Marketplace module services
container.bind<Container>('Container').toConstantValue(container);
container.bind<AmazonAdapter>(AmazonAdapter).toSelf().inTransientScope();
container.bind<ShopifyAdapter>(ShopifyAdapter).toSelf().inTransientScope();
container.bind<TakealotAdapter>(TakealotAdapter).toSelf().inTransientScope();
container.bind<MarketplaceAdapterFactory>(MarketplaceAdapterFactory).toSelf().inSingletonScope();
container.bind<MarketplaceAdapterFactoryService>(MarketplaceAdapterFactoryService).toSelf().inSingletonScope();

export { container };