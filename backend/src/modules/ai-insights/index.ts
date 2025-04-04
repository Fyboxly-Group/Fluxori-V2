/**
 * AI Insights module index
 * Exports all controllers, routes, and services from the module
 */

// Import routes
import insightRoutes from './routes/insight.routes';

// Export controllers for direct use
export { InsightController } from './controllers/insight.controller';
export { ScheduledJobController } from './controllers/scheduled-job.controller';

// Export services for direct use
export { InsightGenerationService } from './services/insight-generation.service';
export { InsightDataService } from './services/insight-data.service';
export { InsightSchedulerService } from './services/insight-scheduler.service';
export { DeepseekLlmService } from './services/deepseek-llm.service';

// Export for registration in app.ts
export default {
  routes: {
    path: '/api/insights',
    router: insightRoutes
  }
};