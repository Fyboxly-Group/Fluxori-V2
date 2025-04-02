// @ts-nocheck - Added by final-ts-fix.js
import { Request, Response } from 'express';
import { XeroAccountService } from "../services/xero-account.service";
const xeroAccountService = new XeroAccountService();
import { XeroAuthService } from "../services/xero-auth.service";
const xeroAuthService = new XeroAuthService();
import { AccountMapping } from '../types';

/**
 * Controller for Xero account endpoints
 */
class XeroAccountController {
  /**
   * Get accounts from Xero
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async getAccounts(req: Request, res: Response): Promise<void> {
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
      
      // Get accounts
      const accounts = await xeroAccountService.getAccounts(credentials);
      
      res.status(200).json({
        success: true,
        data: accounts,
      });
    } catch(error) {
      console.error('Error getting Xero accounts:', error);
      res.status(500).json({
        success: false,
        message: `Error getting Xero accounts: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Get tax rates from Xero
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async getTaxRates(req: Request, res: Response): Promise<void> {
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
      
      // Get tax rates
      const taxRates = await xeroAccountService.getTaxRates(credentials);
      
      res.status(200).json({
        success: true,
        data: taxRates,
      });
    } catch(error) {
      console.error('Error getting Xero tax rates:', error);
      res.status(500).json({
        success: false,
        message: `Error getting Xero tax rates: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Create account mapping
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async createAccountMapping(req: Request, res: Response): Promise<void> {
    try {
      const mappingData: AccountMapping = req.body;
      
      // Validate required parameters
      if(!mappingData.xeroAccountId || !mappingData.xeroAccountCode || !mappingData.xeroAccountName) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: xeroAccountId, xeroAccountCode, xeroAccountName',
        });
        return;
      }
      
      // Create mapping
      const mapping = await xeroAccountService.createAccountMapping(mappingData);
      
      res.status(201).json({
        success: true,
        message: 'Account mapping created successfully',
        data: mapping,
      });
    } catch(error) {
      console.error('Error creating account mapping:', error);
      res.status(500).json({
        success: false,
        message: `Error creating account mapping: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Get account mappings
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async getAccountMappings(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.query;
      
      // Get mappings
      const mappings = await xeroAccountService.getAccountMappings(categoryId as string);
      
      res.status(200).json({
        success: true,
        data: mappings,
      });
    } catch(error) {
      console.error('Error getting account mappings:', error);
      res.status(500).json({
        success: false,
        message: `Error getting account mappings: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Delete account mapping
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async deleteAccountMapping(req: Request, res: Response): Promise<void> {
    try {
      const { mappingId } = req.params;
      
      // Delete mapping
      const success = await xeroAccountService.deleteAccountMapping(mappingId);
      
      if(success) {
        res.status(200).json({
          success: true,
          message: 'Account mapping deleted successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Account mapping not found',
        });
      }
    } catch(error) {
      console.error('Error deleting account mapping:', error);
      res.status(500).json({
        success: false,
        message: `Error deleting account mapping: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      });
    }
  }
}

export default new XeroAccountController();