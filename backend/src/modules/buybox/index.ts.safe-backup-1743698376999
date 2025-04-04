import { container } from '../../config/inversify';
import { Logger } from 'winston';
import { RepricingSchedulerService } from './services/repricing-scheduler.service';
import buyboxRoutes from './routes/buybox.routes';
import repricingRoutes from './routes/repricing.routes';

export const initializeBuyBoxModule = (): void => {
  const logger = container.get<Logger>('Logger');
  logger.info('Initializing BuyBox module');
  
  // Start the repricing scheduler
  const repricingScheduler = container.get(RepricingSchedulerService);
  repricingScheduler.start();
  
  logger.info('BuyBox module initialized and scheduler started');
};

export { buyboxRoutes, repricingRoutes };