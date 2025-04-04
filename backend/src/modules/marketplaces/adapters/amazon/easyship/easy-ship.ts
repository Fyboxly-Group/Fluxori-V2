/**
 * Amazon Easy Ship API Module
 * 
 * Implements the Amazon SP-API Easy Ship API functionality.
 * This module enables the management of Easy Ship orders, which
 * is Amazon's service for delivery and cash on delivery collection.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Package dimensions
 */
export interface Dimensions {
  /**
   * Length of the package
   */
  length: number;
  
  /**
   * Width of the package
   */
  width: number;
  
  /**
   * Height of the package
   */
  height: number;
  
  /**
   * Unit of the dimensions
   */
  unit: 'cm' | 'in';
}

/**
 * Package weight
 */
export interface Weight {
  /**
   * Weight value
   */
  value: number;
  
  /**
   * Unit of the weight
   */
  unit: 'g' | 'kg' | 'oz' | 'lb';
}

/**
 * Item level details
 */
export interface Item {
  /**
   * Order item identifier
   */
  orderItemId: string;
  
  /**
   * ASINs of the item
   */
  asin?: string;
  
  /**
   * Title of the item
   */
  title?: string;
  
  /**
   * Quantity of the item
   */
  quantity: number;
  
  /**
   * Item dimensions
   */
  itemDimensions?: Dimensions;
  
  /**
   * Item weight
   */
  itemWeight?: Weight;
}

/**
 * Time slot for scheduling Easy Ship pickups
 */
export interface TimeSlot {
  /**
   * Start time of the slot (ISO 8601 format)
   */
  startTime: string;
  
  /**
   * End time of the slot (ISO 8601 format)
   */
  endTime: string;
}

/**
 * Package details for Easy Ship
 */
export interface PackageDetails {
  /**
   * Package dimensions
   */
  dimensions: Dimensions;
  
  /**
   * Package weight
   */
  weight: Weight;
  
  /**
   * Items in the package
   */
  items: Item[];
}

/**
 * Schedule request details
 */
export interface CreateScheduleRequest {
  /**
   * Amazon order ID
   */
  amazonOrderId: string;
  
  /**
   * Marketplace ID (optional, will use the module's marketplace ID if not provided)
   */
  marketplaceId?: string;
  
  /**
   * Pickup time slot
   */
  timeSlot: TimeSlot;
  
  /**
   * Package details
   */
  packageDetails: PackageDetails;
}

/**
 * Schedule response
 */
export interface CreateScheduleResponse {
  /**
   * The scheduled pickup ID
   */
  scheduledPackageId: string;
  
  /**
   * Confirmed time slot
   */
  timeSlot: TimeSlot;
}

/**
 * Implementation of the Amazon Easy Ship API
 */
export class EasyShipModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string,
    makeApiRequest: ApiRequestFunction,
    marketplaceId: string
  ) {
    super('easyShip', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise.resolve();
  }
  
  /**
   * Create a schedule for Easy Ship orders
   * @param details The schedule details
   * @returns The created schedule
   */
  public async createSchedule(details: CreateScheduleRequest): Promise<ApiResponse<CreateScheduleResponse>> {
    if (!details.marketplaceId && !this.marketplaceId) {
      throw AmazonErrorUtil.createError('Marketplace ID is required to create schedule', AmazonErrorCode.INVALID_INPUT);
    }
    
    // Validate required fields
    if (!details.amazonOrderId) {
      throw AmazonErrorUtil.createError('Amazon order ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!details.timeSlot) {
      throw AmazonErrorUtil.createError('Time slot is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!details.packageDetails) {
      throw AmazonErrorUtil.createError('Package details are required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<CreateScheduleResponse>({
        method: 'POST',
        path: '/schedule',
        data: {
          ...details,
          marketplaceId: details.marketplaceId || this.marketplaceId
        }
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.createSchedule`);
    }
  }
  
  /**
   * Get list of available time slots for Easy Ship orders
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Optional marketplace ID (uses module's marketplace ID if not provided)
   * @returns List of available time slots
   */
  public async getTimeSlots(amazonOrderId: string, marketplaceId?: string): Promise<ApiResponse<TimeSlot[]>> {
    if (!amazonOrderId) {
      throw AmazonErrorUtil.createError('Amazon order ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    const params: Record<string, any> = {
      amazonOrderId,
      marketplaceId: marketplaceId || this.marketplaceId
    };
    
    try {
      return await this.makeRequest<TimeSlot[]>({
        method: 'GET',
        path: '/timeSlots',
        params
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getTimeSlots`);
    }
  }
  
  /**
   * Update or cancel an existing Easy Ship order schedule
   * @param scheduledPackageId ID of the scheduled package
   * @param updateAction Action to perform (reschedule or cancel)
   * @param timeSlot New time slot (required for reschedule, ignored for cancel)
   * @returns Updated schedule
   */
  public async updateSchedule(
    scheduledPackageId: string, 
    updateAction: 'reschedule' | 'cancel',
    timeSlot?: TimeSlot
  ): Promise<ApiResponse<CreateScheduleResponse>> {
    if (!scheduledPackageId) {
      throw AmazonErrorUtil.createError('Scheduled package ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (updateAction === 'reschedule' && !timeSlot) {
      throw AmazonErrorUtil.createError('Time slot is required for reschedule action', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<CreateScheduleResponse>({
        method: 'PATCH',
        path: `/schedule/${scheduledPackageId}`,
        data: {
          action: updateAction,
          timeSlot: updateAction === 'reschedule' ? timeSlot : undefined,
          marketplaceId: this.marketplaceId
        }
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.updateSchedule`);
    }
  }
  
  /**
   * Get the shipping label for an Easy Ship order
   * @param scheduledPackageId ID of the scheduled package
   * @param labelFormat Format of the label (PDF, PNG, etc.)
   * @returns Shipping label data
   */
  public async getShippingLabel(
    scheduledPackageId: string,
    labelFormat: 'PDF' | 'PNG' = 'PDF'
  ): Promise<ApiResponse<{ labelData: string }>> {
    if (!scheduledPackageId) {
      throw AmazonErrorUtil.createError('Scheduled package ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<{ labelData: string }>({
        method: 'GET',
        path: `/shippingLabel/${scheduledPackageId}`,
        params: {
          labelFormat,
          marketplaceId: this.marketplaceId
        }
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getShippingLabel`);
    }
  }
  
  /**
   * Get the status of an Easy Ship order
   * @param amazonOrderId Amazon order ID
   * @returns Order status
   */
  public async getOrderStatus(amazonOrderId: string): Promise<ApiResponse<{
    amazonOrderId: string;
    scheduledPackageId?: string;
    status: 'SCHEDULED' | 'PICKING_UP' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
    statusDetails?: string;
  }>> {
    if (!amazonOrderId) {
      throw AmazonErrorUtil.createError('Amazon order ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<{
        amazonOrderId: string;
        scheduledPackageId?: string;
        status: 'SCHEDULED' | 'PICKING_UP' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
        statusDetails?: string;
      }>({
        method: 'GET',
        path: `/order/${amazonOrderId}`,
        params: {
          marketplaceId: this.marketplaceId
        }
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getOrderStatus`);
    }
  }
}