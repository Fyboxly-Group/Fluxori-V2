// @ts-nocheck - Added by final-ts-fix.js
import { Request, Response } from 'express';
import { syncOrchestratorService } from '../services/sync-orchestrator.service';
import logger from '../../../utils/logger';

/**
 * Controller for the sync orchestrator
 */
class SyncOrchestratorController {
  /**
   * Start the sync orchestrator
   */
  public startSyncService = async (req: Request, res: Response): Promise<Response> => {
    try {
      syncOrchestratorService.start();
      return res.status(200).json({
        success: true,
        message: 'Sync service started successfully',
        intervalMinutes: syncOrchestratorService['syncIntervalMinutes']
      });
    } catch (error) {
      logger.error('Error starting sync service:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to start sync service',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * Stop the sync orchestrator
   */
  public stopSyncService = async (req: Request, res: Response): Promise<Response> => {
    try {
      syncOrchestratorService.stop();
      return res.status(200).json({
        success: true,
        message: 'Sync service stopped successfully'
      });
    } catch (error) {
      logger.error('Error stopping sync service:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to stop sync service',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * Update the sync interval
   */
  public updateSyncInterval = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { intervalMinutes } = req.body;
      
      if (!intervalMinutes || typeof intervalMinutes !== 'number' || intervalMinutes < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid interval. Must be a number greater than 0.'
        });
      }

      syncOrchestratorService.updateSyncInterval(intervalMinutes);
      
      return res.status(200).json({
        success: true,
        message: `Sync interval updated to ${intervalMinutes} minutes`
      });
    } catch (error) {
      logger.error('Error updating sync interval:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update sync interval',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * Get sync status
   */
  public getSyncStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const status = syncOrchestratorService.getSyncStatus();
      
      return res.status(200).json({
        success: true,
        ...status
      });
    } catch (error) {
      logger.error('Error getting sync status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get sync status',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * Trigger sync for specific connections manually
   */
  public triggerSync = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { connectionIds } = req.body;
      
      if (!connectionIds || !Array.isArray(connectionIds) || connectionIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Connection IDs are required'
        });
      }

      // For long-running operations, respond immediately and run in background
      res.status(202).json({
        success: true,
        message: `Sync triggered for ${connectionIds.length} connections`,
        connectionIds
      });

      // Run the sync in the background
      syncOrchestratorService.forceSyncConnections(connectionIds)
        .then(results => {
          logger.info(`Manual sync completed for ${results.length} connections`);
          logger.debug('Sync results:', results);
        })
        .catch(error => {
          logger.error('Error in manual sync:', error);
        });
    } catch (error) {
      logger.error('Error triggering sync:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to trigger sync',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * Force a full sync for all active connections
   */
  public forceFullSync = async (req: Request, res: Response): Promise<Response> => {
    try {
      // For long-running operations, respond immediately and run in background
      res.status(202).json({
        success: true,
        message: 'Full sync cycle started'
      });

      // Run the sync in the background
      syncOrchestratorService.runSync()
        .then(results => {
          logger.info(`Full sync completed: ${results.successfulConnections} successful, ${results.failedConnections} failed`);
        })
        .catch(error => {
          logger.error('Error in full sync:', error);
        });
    } catch (error) {
      logger.error('Error triggering full sync:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to trigger full sync',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * Handle Cloud Scheduler triggered sync
   * This is the endpoint that Cloud Scheduler will call on the scheduled interval
   */
  public handleScheduledSync = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Validate the scheduler request
      if (!syncOrchestratorService.validateSchedulerRequest(req.headers)) {
        logger.warn('Unauthorized scheduler request received', { 
          ip: req.ip, 
          userAgent: req.headers['user-agent'] 
        });
        
        return res.status(403).json({
          success: false,
          message: 'Unauthorized scheduler request'
        });
      }
      
      // For long-running operations, respond immediately
      // This prevents Cloud Scheduler from retrying due to timeout
      res.status(202).json({
        success: true,
        message: 'Scheduled sync cycle started'
      });

      // Run the sync in the background
      syncOrchestratorService.runSync()
        .then(results => {
          logger.info(`Scheduled sync completed: ${results.successfulConnections} successful, ${results.failedConnections} failed`);
        })
        .catch(error => {
          logger.error('Error in scheduled sync:', error);
        });
    } catch (error) {
      logger.error('Error handling scheduled sync:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to handle scheduled sync',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
}

export default new SyncOrchestratorController();