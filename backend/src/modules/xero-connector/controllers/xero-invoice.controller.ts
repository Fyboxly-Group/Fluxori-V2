// @ts-nocheck - Added by final-ts-fix.js
import { Request, Response } from 'express';
import { XeroInvoiceService } from "../services/xero-invoice.service";
const xeroInvoiceService = new XeroInvoiceService();
import { XeroAuthService } from "../services/xero-auth.service";
const xeroAuthService = new XeroAuthService();
import { XeroSyncService } from "../services/xero-sync.service";
const xeroSyncService = new XeroSyncService();
import { FluxoriOrderData } from '../types';

/**
 * Controller for Xero invoice endpoints
 */
class XeroInvoiceController {
  /**
   * Create a Xero invoice from Fluxori order data
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async createInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { userId, organizationId, orderData } = req.body;
      
      // Validate required parameters
      if(!userId || !organizationId || !orderData) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: userId, organizationId, and orderData',
        });
        return;
      }
      
      // Get user credentials
      const credentials = await xeroAuthService.getUserCredentials(userId, organizationId);
      
      // Create invoice
      const result = await xeroInvoiceService.createXeroInvoice(
        orderData as FluxoriOrderData,
        credentials
      );
      
      if(result.success) {
        res.status(200).json({
          success: true,
          message: 'Invoice created successfully',
          data: {
            invoiceId: result.invoiceId,
            invoiceNumber: result.invoiceNumber,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: `Failed to create invoice: ${result.error}`,
        });
      }
    } catch(error) {
      console.error('Error creating Xero invoice:', error);
      res.status(500).json({
        success: false,
        message: `Error creating Xero invoice: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Sync an order to Xero(create invoice);
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async syncOrderToXero(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      
      if(!orderId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameter: orderId',
        });
        return;
      }
      
      // Sync order to Xero
      const result = await xeroSyncService.syncOrderToXero(orderId);
      
      if(result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch(error) {
      console.error('Error syncing order to Xero:', error);
      res.status(500).json({
        success: false,
        message: `Error syncing order to Xero: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Get Xero connection status for a user
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async getConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if(!userId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameter: userId',
        });
        return;
      }
      
      // Get connection details
      const connectionDetails = await xeroSyncService.getXeroConnectionDetails(userId);
      
      res.status(200).json({
        success: true,
        data: connectionDetails || { connected: false },
      });
    } catch(error) {
      console.error('Error getting Xero connection status:', error);
      res.status(500).json({
        success: false,
        message: `Error getting Xero connection status: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }
}

export default new XeroInvoiceController();