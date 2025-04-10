// @ts-nocheck - Added by final-ts-fix.js
import { Injectable } from '../../../decorators/injectable.decorator';
import { Types } from 'mongoose';
import { AccountingAPI } from 'xero-node';
import { XeroAuthService } from './xero-auth.service';

/**
 * XeroInvoiceService for interacting with Xero
 */
@Injectable()
export class XeroInvoiceService {
  /**
   * Constructor
   */
  constructor(private xeroAuthService: XeroAuthService) {}
  
  /**
   * Get Xero client for the organization
   */
  async getClient(organizationId: Types.ObjectId): Promise<AccountingAPI> {
    return this.xeroAuthService.getClient(organizationId);
  }
}
