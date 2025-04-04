// Controllers for Xero sync operations
import { Request, Response } from 'express';
import { XeroBulkSyncService } from "../services/xero-bulk-sync.service";
const xeroBulkSyncService = new XeroBulkSyncService();
import { XeroAuthService } from "../services/xero-auth.service";
const xeroAuthService = new XeroAuthService();
import { SyncOperationType } from '../types';

/**
 * Controller for Xero sync endpoints
 */
class XeroSyncController {
  /**
   * Start a sync operation
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async startSync(req: Request, res: Response): Promise<void> {
    try {
      const { userId, organizationId, syncType } = req.body;
      
      // Validate required parameters
      if(!userId || !organizationId || !syncType) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: userId, organizationId, syncType',
        });
        return;
      }
      
      // Validate sync type
      const validSyncTypes: SyncOperationType[] = [
        'full',
        'invoices',
        'contacts',
        'payments',
        'accounts',
        'tax-rates',
      ];
      
      if(!validSyncTypes.includes(syncType as SyncOperationType)) {
        res.status(400).json({
          success: false,
          message: `Invalid sync type. Must be one of: ${validSyncTypes.join(', ')}`,
        });
        return;
      }
      
      // Start sync
      const syncStatus = await xeroBulkSyncService.startSync(
        userId,
        organizationId,
        syncType as SyncOperationType
      );
      
      res.status(200).json({
        success: true,
        message: `${syncType} sync started successfully`,
        data: syncStatus,
      });
    } catch(error) {
      console.error('Error starting sync:', error);
      res.status(500).json({
        success: false,
        message: `Error starting sync: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Get sync status
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async getSyncStatus(req: Request, res: Response): Promise<void> {
    try {
      const { syncId } = req.params;
      
      // Get sync status
      const syncStatus = await xeroBulkSyncService.getSyncStatus(syncId);
      
      if(!syncStatus) {
        res.status(404).json({
          success: false,
          message: `Sync operation ${syncId} not found`,
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: syncStatus,
      });
    } catch(error) {
      console.error('Error getting sync status:', error);
      res.status(500).json({
        success: false,
        message: `Error getting sync status: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Get recent sync operations
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async getRecentSyncs(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get recent syncs
      const syncs = await xeroBulkSyncService.getRecentSyncs(userId, limit);
      
      res.status(200).json({
        success: true,
        data: syncs,
      });
    } catch(error) {
      console.error('Error getting recent syncs:', error);
      res.status(500).json({
        success: false,
        message: `Error getting recent syncs: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Get reconciliation status
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async getReconciliationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId, organizationId } = req.query;
      
      // Validate required parameters
      if(!userId || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: userId and organizationId',
        });
        return;
      }
      
      // Get user credentials
      const credentials = await xeroAuthService.getUserCredentials(
        userId as string,
        organizationId as string
      );
      
      // Get reconciliation status
      const status = await xeroBulkSyncService.getReconciliationStatus(credentials);
      
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch(error) {
      console.error('Error getting reconciliation status:', error);
      res.status(500).json({
        success: false,
        message: `Error getting reconciliation status: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }
}

export default new XeroSyncController();