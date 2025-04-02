// TypeScript checked
/**
 * Scheduler for inventory reorder point checks
 * This scheduler runs periodically to check inventory levels against reorder points
 * and creates alerts for items that need to be reordered
 */

import { CronJob } from 'cron';
import InventoryReorderCheckService from '../services/inventory-reorder-check.service';
import config from '../config';
import logger from '../utils/logger';

// Run every 6 hours by default(configurable)
const cronSchedule = config.inventoryReorderCheckCron || '0 */6 * * *';

export const setupInventoryReorderCheckScheduler = (): CronJob => {
  const job = new CronJob(
    cronSchedule,
    async() => {
      logger.info('[Scheduler] Starting inventory reorder point check...');
      
      try {
        const result = await InventoryReorderCheckService.checkOrganizationInventory({ organizationId: 'system' });
        
        logger.info(`[Scheduler] Inventory reorder check completed:
- Checked ${result.lowStockItems} items
- Created ${result.alertsCreated} new alerts
${result.errors?.length ? `- Errors: ${result.errors.length}` : '- No errors'}`);
        
        if(result.errors?.length) {
          logger.error(`[Scheduler] Inventory reorder check errors: ${JSON.stringify(result.errors)}`);
        }
      } catch(error) {
        logger.error(`[Scheduler] Inventory reorder check failed: ${error}`);
      }
    },
    null, // onComplete
    false, // start
    'UTC' // timezone
  );
  
  return job;
};

export default setupInventoryReorderCheckScheduler;