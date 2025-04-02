// @ts-nocheck - Added by final-ts-fix.js
import { Request, Response } from 'express';
import { XeroConfigService } from "../services/xero-config.service";
const xeroConfigService = new XeroConfigService();
import { XeroAuthService } from "../services/xero-auth.service";
const xeroAuthService = new XeroAuthService();

/**
 * Controller for Xero configuration endpoints
 */
class XeroConfigController {
  /**
   * Get Xero configuration
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async getConfig(req: Request, res: Response): Promise<void> {
    try {
      // Get config
      const config = await xeroConfigService.getConfig();
      
      res.status(200).json({
        success: true,
        data: config,
      });
    } catch(error) {
      console.error('Error getting Xero config:', error);
      res.status(500).json({
        success: false,
        message: `Error getting Xero config: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Update Xero configuration
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const configData = req.body;
      
      // Update config
      const config = await xeroConfigService.updateConfig(configData);
      
      res.status(200).json({
        success: true,
        message: 'Xero configuration updated successfully',
        data: config,
      });
    } catch(error) {
      console.error('Error updating Xero config:', error);
      res.status(500).json({
        success: false,
        message: `Error updating Xero config: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Test Xero connection
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const { userId, organizationId } = req.body;
      
      // Validate required parameters
      if(!userId || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: userId and organizationId',
        });
        return;
      }
      
      // Get user credentials
      const credentials = await xeroAuthService.getUserCredentials(userId, organizationId);
      
      // Test connection
      const result = await xeroConfigService.testConnection(credentials);
      
      res.status(200).json({
        success: result.success,
        message: result.message,
        data: result.tenantName ? { tenantName: result.tenantName } : undefined,
      });
    } catch(error) {
      console.error('Error testing Xero connection:', error);
      res.status(500).json({
        success: false,
        message: `Error testing Xero connection: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }
}

export default new XeroConfigController();