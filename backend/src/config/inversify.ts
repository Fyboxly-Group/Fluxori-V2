import { Container } from 'inversify';
import { Logger } from 'winston';
import winston from 'winston';
import { Firestore } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

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
import { DeepSeekLLMService } from '../modules/ai-insights/services/deepseek-llm.service';
import { InsightController } from '../modules/ai-insights/controllers/insight.controller';
import { ScheduledJobController } from '../modules/ai-insights/controllers/scheduled-job.controller';

// Credits module
import { CreditService } from '../modules/credits/services/credit.service';

// Initialize container
const container = new Container();

// Setup logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
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
container.bind<Logger>('Logger').toConstantValue(logger);
container.bind<Firestore>('Firestore').toConstantValue(firestore);

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
container.bind<DeepSeekLLMService>(DeepSeekLLMService).toSelf();
container.bind<InsightController>(InsightController).toSelf();
container.bind<ScheduledJobController>(ScheduledJobController).toSelf();

// Register Credits module services
container.bind<CreditService>(CreditService).toSelf();

export { container };