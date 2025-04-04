import { Request, Response } from 'express';
import { XeroContactService } from "../services/xero-contact.service";
const xeroContactService = new XeroContactService();
import { XeroAuthService } from "../services/xero-auth.service";
const xeroAuthService = new XeroAuthService();

/**
 * Controller for Xero contact endpoints
 */
class XeroContactController {
  /**
   * Get contacts from Xero
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async getContacts(req: Request, res: Response): Promise<void> {
    try {
      const { userId, organizationId } = req.query;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
      const where = req.query.where as string | undefined;
      
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
      
      // Get contacts
      const contacts = await xeroContactService.getContacts(credentials, page, pageSize, where);
      
      res.status(200).json({
        success: true,
        data: contacts,
      });
    } catch(error) {
      console.error('Error getting Xero contacts:', error);
      res.status(500).json({
        success: false,
        message: `Error getting Xero contacts: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Get a specific contact by ID
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async getContactById(req: Request, res: Response): Promise<void> {
    try {
      const { userId, organizationId } = req.query;
      const { contactId } = req.params;
      
      // Validate required parameters
      if(!userId || !organizationId || !contactId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: userId, organizationId, contactId',
        });
        return;
      }
      
      // Get user credentials
      const credentials = await xeroAuthService.getUserCredentials(
        userId as string,
        organizationId as string
      );
      
      // Get contact
      const contact = await xeroContactService.getContactById(credentials, contactId);
      
      if(!contact) {
        res.status(404).json({
          success: false,
          message: `Contact ${contactId} not found`,
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: contact,
      });
    } catch(error) {
      console.error('Error getting Xero contact:', error);
      res.status(500).json({
        success: false,
        message: `Error getting Xero contact: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Create a new contact in Xero
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async createContact(req: Request, res: Response): Promise<void> {
    try {
      const { userId, organizationId, contactData } = req.body;
      
      // Validate required parameters
      if(!userId || !organizationId || !contactData) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: userId, organizationId, contactData',
        });
        return;
      }
      
      // Get user credentials
      const credentials = await xeroAuthService.getUserCredentials(userId, organizationId);
      
      // Create contact
      const contact = await xeroContactService.createContact(credentials, contactData);
      
      res.status(201).json({
        success: true,
        message: 'Contact created successfully',
        data: contact,
      });
    } catch(error) {
      console.error('Error creating Xero contact:', error);
      res.status(500).json({
        success: false,
        message: `Error creating Xero contact: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Update an existing contact in Xero
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async updateContact(req: Request, res: Response): Promise<void> {
    try {
      const { userId, organizationId, contactData } = req.body;
      const { contactId } = req.params;
      
      // Validate required parameters
      if(!userId || !organizationId || !contactData || !contactId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: userId, organizationId, contactData, contactId',
        });
        return;
      }
      
      // Get user credentials
      const credentials = await xeroAuthService.getUserCredentials(userId, organizationId);
      
      // Update contact
      const contact = await xeroContactService.updateContact(credentials, contactId, contactData);
      
      res.status(200).json({
        success: true,
        message: 'Contact updated successfully',
        data: contact,
      });
    } catch(error) {
      console.error('Error updating Xero contact:', error);
      res.status(500).json({
        success: false,
        message: `Error updating Xero contact: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Sync a Fluxori customer to Xero
   * 
   * @param req - Express request
   * @param res - Express response
   */
  public async syncCustomerToXero(req: Request, res: Response): Promise<void> {
    try {
      const { userId, organizationId } = req.body;
      const { customerId } = req.params;
      
      // Validate required parameters
      if(!userId || !organizationId || !customerId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameters: userId, organizationId, customerId',
        });
        return;
      }
      
      // Get user credentials
      const credentials = await xeroAuthService.getUserCredentials(userId, organizationId);
      
      // Sync customer
      const result = await xeroContactService.syncCustomerToXero(credentials, customerId);
      
      if(result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            contactId: result.contactId,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch(error) {
      console.error('Error syncing customer to Xero:', error);
      res.status(500).json({
        success: false,
        message: `Error syncing customer to Xero: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }
}

export default new XeroContactController();