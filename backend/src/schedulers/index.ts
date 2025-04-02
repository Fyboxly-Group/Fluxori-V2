// TypeScript checked
/**
 * Scheduler initialization module
 * This file initializes and manages all scheduled jobs in the application
 */

import { CronJob } from 'cron';
import logger from '../utils/logger';
import setupInventoryReorderCheckScheduler from './inventory-reorder-check.scheduler';

interface SchedulerRegistry {
  [key: string]: CronJob;
}

/**
 * Initialize all schedulers
 * @returns Object containing all initialized scheduler jobs
 */
export const initializeSchedulers = (): SchedulerRegistry => {
  logger.info('[Schedulers] Initializing application schedulers...');
  
  const schedulers: SchedulerRegistry = {};
  
  try {
    // Initialize inventory reorder check scheduler
    const inventoryReorderJob = setupInventoryReorderCheckScheduler();
    inventoryReorderJob.start();
    schedulers.inventoryReorderCheck = inventoryReorderJob;
    logger.info('[Schedulers] Inventory reorder check scheduler initialized');
    
    // Add more schedulers here as needed
    
    logger.info(`[Schedulers] Successfully initialized ${Object.keys(schedulers).length} schedulers`);
  } catch(error) {
    logger.error(`[Schedulers] Failed to initialize schedulers: ${error}`);
  }
  
  return schedulers;
};

/**
 * Stop all schedulers
 * @param schedulers Scheduler registry containing all active jobs
 */
export const stopSchedulers = (schedulers: SchedulerRegistry): void => {
  logger.info('[Schedulers] Stopping application schedulers...');
  
  try {
    for(const [name, job] of Object.entries(schedulers)) {
      job.stop();
      logger.info(`[Schedulers] Stopped ${name} scheduler`);
    }
    
    logger.info(`[Schedulers] Successfully stopped ${Object.keys(schedulers).length} schedulers`);
  } catch(error) {
    logger.error(`[Schedulers] Failed to stop schedulers: ${error}`);
  }
};

export default {
  initializeSchedulers,
  stopSchedulers,
};