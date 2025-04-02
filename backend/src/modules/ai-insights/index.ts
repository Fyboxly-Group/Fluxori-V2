/**
 * AI Insights module
 * Provides AI-powered business insights for marketplace data
 */

import { insightRoutes } from './routes/insight.routes';
import { container } from '../../config/inversify';
import { Logger } from 'winston';
import { InsightSchedulerService } from './services/insight-scheduler.service';

/**
 * Initialize the AI Insights module
 */
export const initializeAIInsightsModule = async (): Promise<void> => {
  try {
    const logger = container.get<Logger>('Logger');
    logger.info('Initializing AI Insights module');
    
    // Initialize the scheduler to load and schedule any existing jobs
    const schedulerService = container.get(InsightSchedulerService);
    await schedulerService.initialize();
    
    logger.info('AI Insights module initialized');
  } catch (error) {
    console.error('Error initializing AI Insights module:', error);
  }
};

export { insightRoutes };
export { InsightGenerationService } from './services/insight-generation.service';
export { InsightSchedulerService } from './services/insight-scheduler.service';
export { InsightDataService } from './services/insight-data.service';
export { DeepSeekLLMService } from './services/deepseek-llm.service';
export { InsightRepository } from './repositories/insight.repository';
export { ScheduledJobRepository } from './repositories/scheduled-job.repository';
export { 
  InsightType, 
  InsightStatus, 
  InsightPriority, 
  InsightSource,
  InsightModel,
  InsightFeedback
} from './interfaces/insight.interface';