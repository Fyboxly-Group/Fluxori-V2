/**
 * Routes for AI insights
 */

import express from 'express';
import { container } from '../../../config/inversify';
import { InsightController } from '../controllers/insight.controller';
import { ScheduledJobController } from '../controllers/scheduled-job.controller';

// Create router
const insightRoutes = express.Router();

// Get controllers from container
const insightController = container.get(InsightController);
const scheduledJobController = container.get(ScheduledJobController);

// Insight routes
insightRoutes.post(
  '/insights',
  InsightController.validateInsightRequest,
  insightController.generateInsight
);

insightRoutes.get(
  '/insights',
  insightController.getInsights
);

insightRoutes.get(
  '/insights/:id',
  insightController.getInsightById
);

insightRoutes.delete(
  '/insights/:id',
  insightController.deleteInsight
);

insightRoutes.post(
  '/insights/:id/feedback',
  insightController.submitFeedback
);

insightRoutes.get(
  '/insights/type/:type',
  insightController.getInsightsByType
);

insightRoutes.get(
  '/insights/entity/:entityType/:entityId',
  insightController.getInsightsByEntity
);

// Scheduled job routes
insightRoutes.post(
  '/scheduled-jobs',
  ScheduledJobController.validateScheduledJob,
  scheduledJobController.createJob
);

insightRoutes.get(
  '/scheduled-jobs',
  scheduledJobController.getJobs
);

insightRoutes.get(
  '/scheduled-jobs/:id',
  scheduledJobController.getJobById
);

insightRoutes.put(
  '/scheduled-jobs/:id',
  scheduledJobController.updateJob
);

insightRoutes.delete(
  '/scheduled-jobs/:id',
  scheduledJobController.deleteJob
);

insightRoutes.post(
  '/scheduled-jobs/:id/run',
  scheduledJobController.runJobNow
);

insightRoutes.get(
  '/scheduled-jobs/type/:type',
  scheduledJobController.getJobsByType
);

export { insightRoutes };