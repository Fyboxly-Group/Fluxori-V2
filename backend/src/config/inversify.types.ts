/**
 * Dependency Injection Container Types
 */
export const TYPES = {
  // Core services
  Logger: Symbol.for('Logger'),
  Firestore: Symbol.for('Firestore'),
  LoggerService: Symbol.for('LoggerService'),
  InventoryService: Symbol.for('InventoryService'),
  OrganizationService: Symbol.for('OrganizationService'),
  
  // Storage
  GCSStorageProvider: Symbol.for('GCSStorageProvider'),
  S3StorageProvider: Symbol.for('S3StorageProvider'),
  LocalStorageProvider: Symbol.for('LocalStorageProvider'),
  StorageService: Symbol.for('StorageService'),
  
  // PDF
  PDFGenerationService: Symbol.for('PDFGenerationService'),
  TemplateService: Symbol.for('TemplateService'),
  
  // Auth
  AuthService: Symbol.for('AuthService'),
  
  // Marketplace
  MarketplaceAdapterFactory: Symbol.for('MarketplaceAdapterFactory'),
  MarketplaceAdapterFactoryService: Symbol.for('MarketplaceAdapterFactoryService'),
  
  // Controllers
  InventoryController: Symbol.for('InventoryController'),
  
  // Modules
  ProductIngestionService: Symbol.for('ProductIngestionService'),
  OrderIngestionService: Symbol.for('OrderIngestionService'),
  
  // BuyBox
  BuyBoxHistoryRepository: Symbol.for('BuyBoxHistoryRepository'),
  RepricingRuleRepository: Symbol.for('RepricingRuleRepository'),
  RepricingEventRepository: Symbol.for('RepricingEventRepository'),
  RepricingEngineService: Symbol.for('RepricingEngineService'),
  RepricingSchedulerService: Symbol.for('RepricingSchedulerService'),
  RepricingController: Symbol.for('RepricingController'),
  BuyBoxController: Symbol.for('BuyBoxController'),
  BuyBoxMonitoringService: Symbol.for('BuyBoxMonitoringService'),
  BuyBoxMonitorFactory: Symbol.for('BuyBoxMonitorFactory'),
  
  // AI Insights
  InsightRepository: Symbol.for('InsightRepository'),
  ScheduledJobRepository: Symbol.for('ScheduledJobRepository'),
  InsightGenerationService: Symbol.for('InsightGenerationService'),
  InsightSchedulerService: Symbol.for('InsightSchedulerService'),
  InsightDataService: Symbol.for('InsightDataService'),
  DeepSeekLLMService: Symbol.for('DeepSeekLLMService'),
  InsightController: Symbol.for('InsightController'),
  ScheduledJobController: Symbol.for('ScheduledJobController'),
  
  // Credits
  CreditService: Symbol.for('CreditService'),
};