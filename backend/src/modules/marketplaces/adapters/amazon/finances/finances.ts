/**
 * Amazon Finances API Module
 * 
 * Implements the Amazon SP-API Finances API functionality.
 * This module handles financial data, including settlements, transactions, and refunds.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';
import { AmazonSPApi } from '../schemas/amazon.generated';

/**
 * Type aliases from schema
 */
export type FinancialEventGroupStatus = AmazonSPApi.Finances.FinancialEventGroupStatus;
export type FinancialTransactionType = AmazonSPApi.Finances.FinancialTransactionType;
export type FinancialEventGroup = AmazonSPApi.Finances.FinancialEventGroup;
export type FinancialEvents = AmazonSPApi.Finances.FinancialEvents;
export type Money = AmazonSPApi.Finances.Money;
export type Fee = AmazonSPApi.Finances.Fee;

/**
 * Parameters for listing financial event groups
 */
export interface ListFinancialEventGroupsParams {
  /**
   * Maximum number of event groups to return
   */
  maxResultsPerPage?: number;
  
  /**
   * Token for pagination
   */
  nextToken?: string;
  
  /**
   * Financial event group started after this date
   */
  financialEventGroupStartedAfter?: Date;
  
  /**
   * Financial event group started before this date
   */
  financialEventGroupStartedBefore?: Date;
}

/**
 * Parameters for listing financial events
 */
export interface ListFinancialEventsParams {
  /**
   * Maximum number of events to return
   */
  maxResultsPerPage?: number;
  
  /**
   * Token for pagination
   */
  nextToken?: string;
  
  /**
   * Amazon Order ID
   */
  amazonOrderId?: string;
  
  /**
   * Financial event group ID
   */
  financialEventGroupId?: string;
  
  /**
   * Posted after this date
   */
  postedAfter?: Date;
  
  /**
   * Posted before this date
   */
  postedBefore?: Date;
}

/**
 * Implementation of the Amazon Finances API
 */
export class FinancesModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string,
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string
  ) {
    super('finances', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise<any> that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise<any>.resolve();
  }
  
  /**
   * List financial event groups
   * @param params Parameters for listing financial event groups
   * @returns Financial event groups
   */
  public async listFinancialEventGroups(
    params: ListFinancialEventGroupsParams = {}
  ): Promise<ApiResponse<AmazonSPApi.Finances.ListFinancialEventGroupsResponse>> {
    const queryParams: Record<string, any> = {};
    
    if (params.maxResultsPerPage) {
      queryParams.MaxResultsPerPage = params.maxResultsPerPage;
    }
    
    if (params.nextToken) {
      queryParams.NextToken = params.nextToken;
    }
    
    if (params.financialEventGroupStartedAfter) {
      queryParams.FinancialEventGroupStartedAfter = params.financialEventGroupStartedAfter.toISOString();
    }
    
    if (params.financialEventGroupStartedBefore) {
      queryParams.FinancialEventGroupStartedBefore = params.financialEventGroupStartedBefore.toISOString();
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Finances.ListFinancialEventGroupsResponse>({
        method: 'GET',
        path: '/financialEventGroups',
        params: queryParams
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.listFinancialEventGroups`);
    }
  }

  /**
   * Get a financial event group by ID
   * @param eventGroupId Financial event group ID
   * @returns Financial event group
   */
  public async getFinancialEventGroup(
    eventGroupId: string
  ): Promise<ApiResponse<AmazonSPApi.Finances.GetFinancialEventGroupResponse>> {
    if (!eventGroupId) {
      throw AmazonErrorUtil.createError(
        'Financial event group ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Finances.GetFinancialEventGroupResponse>({
        method: 'GET',
        path: `/financialEventGroups/${eventGroupId}`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getFinancialEventGroup`);
    }
  }

  /**
   * List financial events
   * @param params Parameters for listing financial events
   * @returns Financial events
   */
  public async listFinancialEvents(
    params: ListFinancialEventsParams = {}
  ): Promise<ApiResponse<AmazonSPApi.Finances.ListFinancialEventsResponse>> {
    const queryParams: Record<string, any> = {};
    
    if (params.maxResultsPerPage) {
      queryParams.MaxResultsPerPage = params.maxResultsPerPage;
    }
    
    if (params.nextToken) {
      queryParams.NextToken = params.nextToken;
    }
    
    if (params.amazonOrderId) {
      queryParams.AmazonOrderId = params.amazonOrderId;
    }
    
    if (params.financialEventGroupId) {
      queryParams.FinancialEventGroupId = params.financialEventGroupId;
    }
    
    if (params.postedAfter) {
      queryParams.PostedAfter = params.postedAfter.toISOString();
    }
    
    if (params.postedBefore) {
      queryParams.PostedBefore = params.postedBefore.toISOString();
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Finances.ListFinancialEventsResponse>({
        method: 'GET',
        path: '/financialEvents',
        params: queryParams
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.listFinancialEvents`);
    }
  }

  /**
   * Get financial events for an order
   * @param orderId Amazon order ID
   * @returns Financial events for the order
   */
  public async getFinancialEventsForOrder(
    orderId: string
  ): Promise<ApiResponse<AmazonSPApi.Finances.GetFinancialEventsForOrderResponse>> {
    if (!orderId) {
      throw AmazonErrorUtil.createError(
        'Order ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.Finances.GetFinancialEventsForOrderResponse>({
        method: 'GET',
        path: `/orders/${orderId}/financialEvents`
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getFinancialEventsForOrder`);
    }
  }

  /**
   * Get all financial event groups (handles pagination)
   * @param params Parameters for listing financial event groups
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All financial event groups
   */
  public async getAllFinancialEventGroups(
    params: Omit<ListFinancialEventGroupsParams, 'nextToken'> = {},
    maxPages: number = 10
  ): Promise<FinancialEventGroup[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allEventGroups: FinancialEventGroup[] = [];
    
    do {
      // Update params with next token if available
      const pageParams: ListFinancialEventGroupsParams = {
        ...params,
        nextToken
      };
      
      const response = await this.listFinancialEventGroups(pageParams);
      
      // Add event groups to our collection
      if (response.data.financialEventGroupList && response.data.financialEventGroupList.length > 0) {
        allEventGroups.push(...response.data.financialEventGroupList);
      }
      
      // Get next token for pagination
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allEventGroups;
  }
  
  /**
   * Get all financial events (handles pagination)
   * @param params Parameters for listing financial events
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All financial events
   */
  public async getAllFinancialEvents(
    params: Omit<ListFinancialEventsParams, 'nextToken'> = {},
    maxPages: number = 10
  ): Promise<FinancialEvents> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allEvents: FinancialEvents = {
      shipmentEventList: [],
      refundEventList: [],
      guaranteeClaimEventList: [],
      chargebackEventList: [],
      payWithAmazonEventList: [],
      serviceProviderCreditEventList: [],
      retrochargeEventList: [],
      rentalTransactionEventList: [],
      productAdsPaymentEventList: [],
      serviceFeeEventList: [],
      debtRecoveryEventList: [],
      loanServicingEventList: [],
      adjustmentEventList: [],
      safeTProgramEventList: []
    };
    
    do {
      // Update params with next token if available
      const pageParams: ListFinancialEventsParams = {
        ...params,
        nextToken
      };
      
      const response = await this.listFinancialEvents(pageParams);
      const events = response.data.financialEvents;
      
      // Merge all event lists
      for (const listKey of Object.keys(allEvents)) {
        if (events[listKey as keyof typeof events] && Array.isArray(events[listKey as keyof typeof events])) {
          (allEvents[listKey as keyof typeof allEvents] as any[]).push(...(events[listKey as keyof typeof events] as any[]));
        }
      }

      // Get next token for pagination
      nextToken = response.data.nextToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allEvents;
  }
  
  /**
   * Get recent financial event groups
   * @param days Number of days to look back (default: 30)
   * @returns Recent financial event groups
   */
  public async getRecentFinancialEventGroups(days: number = 30): Promise<FinancialEventGroup[]> {
    // Calculate the start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all financial event groups started after the start date
    return this.getAllFinancialEventGroups({
      financialEventGroupStartedAfter: startDate
    });
  }
  
  /**
   * Get recent financial events
   * @param days Number of days to look back (default: 30)
   * @returns Recent financial events
   */
  public async getRecentFinancialEvents(days: number = 30): Promise<FinancialEvents> {
    // Calculate the start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all financial events posted after the start date
    return this.getAllFinancialEvents({
      postedAfter: startDate
    });
  }
  
  /**
   * Get a summary of recent settlements
   * @param days Number of days to look back (default: 90)
   * @returns Settlement summary
   */
  public async getSettlementSummary(days: number = 90): Promise<{
    settlementCount: number;
    totalAmount: number;
    currency: string;
    settlementGroups: Array<{
      settlementId: string;
      startDate: Date;
      endDate: Date;
      depositDate: Date;
      totalAmount: number;
      currency: string;
      transactionCount: number;
    }>;
  }> {
    // Get recent event groups
    const eventGroups = await this.getRecentFinancialEventGroups(days);
    
    // Filter closed settlement groups
    const settlements = eventGroups.filter((group: any) => 
      group.financialEventGroupStatus === 'Closed' &&
      group.financialEventGroupType === 'Settlement');
    
    // Build settlement summary
    let totalAmount = 0;
    const currency = settlements[0]?.originalTotal?.currencyCode || 'USD';
    
    const settlementGroups = settlements.map((settlement: any) => {
      const amount = parseFloat(settlement.originalTotal?.amount || '0');
      totalAmount += amount;
      
      return {
        settlementId: settlement.financialEventGroupId,
        startDate: new Date(settlement.startDate),
        endDate: new Date(settlement.endDate),
        depositDate: new Date(settlement.fundTransferDate || settlement.endDate),
        totalAmount: amount,
        currency: settlement.originalTotal?.currencyCode || 'USD',
        transactionCount: settlement.fundTransferStatus === 'COMPLETED' ? 
          parseInt(settlement.transactionCount || '0') : 0
      };
    });

    return {
      settlementCount: settlements.length,
      totalAmount,
      currency,
      settlementGroups
    };
  }
  
  /**
   * Get a summary of fees for a date range
   * @param startDate Start date
   * @param endDate End date (defaults to current date)
   * @returns Fee summary
   */
  public async getFeeSummary(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<{
    totalFees: number;
    feeBreakdown: Record<string, number>;
    currency: string;
  }> {
    // Get all financial events for the date range
    const events = await this.getAllFinancialEvents({
      postedAfter: startDate,
      postedBefore: endDate
    });

    // Extract all fee events
    const feeEvents = events.serviceFeeEventList || [];
    
    // Calculate fee summary
    const feeBreakdown: Record<string, number> = {};
    let totalFees = 0;
    let currency = 'USD';
    
    for (const feeEvent of feeEvents) {
      if (feeEvent.feeList && Array.isArray(feeEvent.feeList)) {
        for (const fee of feeEvent.feeList) {
          const feeType = fee.feeType || 'Unknown';
          const amount = parseFloat(fee.feeAmount?.amount || '0');
          
          if (!feeBreakdown[feeType]) {
            feeBreakdown[feeType] = 0;
          }
          
          feeBreakdown[feeType] += amount;
          totalFees += amount;
          
          // Use the currency from the first fee amount
          if (!currency && fee.feeAmount?.currencyCode) {
            currency = fee.feeAmount.currencyCode;
          }
        }
      }
    }

    return {
      totalFees,
      feeBreakdown,
      currency
    };
  }
  
  /**
   * Get a summary of refunds for a date range
   * @param startDate Start date
   * @param endDate End date (defaults to current date)
   * @returns Refund summary
   */
  public async getRefundSummary(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<{
    totalRefunds: number;
    refundCount: number;
    currency: string;
    refundsByReason: Record<string, {
      count: number;
      amount: number;
    }>;
  }> {
    // Get all financial events for the date range
    const events = await this.getAllFinancialEvents({
      postedAfter: startDate,
      postedBefore: endDate
    });

    // Extract all refund events
    const refundEvents = events.refundEventList || [];
    
    // Calculate refund summary
    const refundsByReason: Record<string, {
      count: number;
      amount: number;
    }> = {};
    
    let totalRefunds = 0;
    let refundCount = 0;
    let currency = 'USD';
    
    for (const refundEvent of refundEvents) {
      const refundAmount = parseFloat(refundEvent.refundAmount?.amount || '0');
      const reason = refundEvent.refundType || 'Unknown';
      
      if (!refundsByReason[reason]) {
        refundsByReason[reason] = {
          count: 0,
          amount: 0
        };
      }
      
      refundsByReason[reason].count += 1;
      refundsByReason[reason].amount += refundAmount;
      
      totalRefunds += refundAmount;
      refundCount += 1;
      
      // Use the currency from the first refund amount
      if (!currency && refundEvent.refundAmount?.currencyCode) {
        currency = refundEvent.refundAmount.currencyCode;
      }
    }

    return {
      totalRefunds,
      refundCount,
      currency,
      refundsByReason
    };
  }
}