/**
 * Feedback Module
 * Entry point for feedback functionality
 */
import { Express } from 'express';
import feedbackRoutes from './routes/feedback.routes';

/**
 * Register feedback module routes
 * @param app Express application
 */
export function registerFeedbackModule(app: Express): void {
  // Register routes
  app.use('/api/feedback', feedbackRoutes);
  
  console.log('Feedback module registered');
}