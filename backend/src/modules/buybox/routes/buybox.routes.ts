/**
 * Buy Box Routes
 * 
 * API routes for Buy Box functionality
 */
import { Router } from 'express';
import { BuyBoxController } from '../controllers/buybox.controller';
import { authenticate } from '../../../middleware/auth.middleware';

/**
 * Initialize Buy Box routes
 * @returns Express router
 */
export function initBuyBoxRoutes(): Router {
  const router = Router();
  const controller = new BuyBoxController();
  
  // Apply authentication middleware
  router.use(authenticate);
  
  // Initialize Buy Box monitoring for a product
  router.post('/init', controller.initializeMonitoring.bind(controller));
  
  // Stop Buy Box monitoring for a product
  router.post('/stop', controller.stopMonitoring.bind(controller));
  
  // Initialize Buy Box monitoring for all products on a marketplace
  router.post('/init-marketplace', controller.initializeMonitoringForMarketplace.bind(controller));
  
  // Check Buy Box status for a product
  router.post('/check', controller.checkBuyBoxStatus.bind(controller));
  
  // Get Buy Box history for a product
  router.get('/history/:productId/:marketplaceId', controller.getBuyBoxHistory.bind(controller));
  
  // Get Buy Box histories for a marketplace
  router.get('/marketplace/:marketplaceId', controller.getBuyBoxHistoriesByMarketplace.bind(controller));
  
  // Apply repricing rules
  router.post('/apply-rules', controller.applyRepricingRules.bind(controller));
  
  return router;
}

/**
 * Initialize API routes in main application
 * @param app Express application
 */
export function initApiRoutes(app: any): void {
  const buyBoxRoutes = initBuyBoxRoutes();
  app.use('/api/buybox', buyBoxRoutes);
}