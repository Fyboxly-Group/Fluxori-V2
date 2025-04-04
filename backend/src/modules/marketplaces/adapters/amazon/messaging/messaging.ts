/**
 * Amazon Messaging API Module
 * 
 * Implements the Amazon SP-API Messaging API functionality.
 * This module allows sellers to send messages to buyers regarding their orders.
 * It provides capabilities for order updates, shipping notifications, and 
 * responses to customer inquiries.
 */

import { ApiRequestFunction, ApiResponse, BaseModule } from '../../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../../utils/amazon-error';

/**
 * Types of messages that can be sent
 */
export type MessageType = 
  | 'WARRANTY'
  | 'PRODUCT_DETAIL'
  | 'PRODUCT_CUSTOMIZATION'
  | 'AMAZON_PAY'
  | 'ORDER_FULFILLMENT'
  | 'ORDER_DETAIL'
  | 'ORDER_RETURN'
  | 'UNEXPECTED_PROBLEM'
  | 'OTHER';

/**
 * Message attachment
 */
export interface Attachment {
  /**
   * MIME content type of the attachment
   */
  contentType: string;
  
  /**
   * Filename of the attachment
   */
  fileName: string;
  
  /**
   * Base64-encoded attachment data
   */
  attachmentData: string;
}

/**
 * Single messaging action available for an order
 */
export interface MessagingAction {
  /**
   * Name/type of the action
   */
  name: MessageType;
  
  /**
   * Whether the action is enabled
   */
  enabled: boolean;
}

/**
 * Response for messaging actions query
 */
export interface GetMessagingActionsForOrderResponse {
  /**
   * List of available messaging actions
   */
  actions: MessagingAction[];
}

/**
 * Get messaging configuration options
 */
export interface GetMessagingConfigOptions {
  /**
   * Marketplace ID
   */
  marketplaceId: string;
}

/**
 * Message configuration details
 */
export interface MessageConfiguration {
  /**
   * Whether the seller can send a warranty message
   */
  allowsWarranty?: boolean;
  
  /**
   * Whether the seller can send a product details message
   */
  allowsProductDetails?: boolean;
  
  /**
   * Whether the seller can send a product customization message
   */
  allowsProductCustomization?: boolean;
  
  /**
   * Whether the seller can send an Amazon Pay message
   */
  allowsAmazonPay?: boolean;
  
  /**
   * Whether the seller can send an order fulfillment message
   */
  allowsOrderFulfillment?: boolean;
  
  /**
   * Whether the seller can send an order detail message
   */
  allowsOrderDetails?: boolean;
  
  /**
   * Whether the seller can send an order return message
   */
  allowsOrderReturn?: boolean;
  
  /**
   * Whether the seller can send an unexpected problem message
   */
  allowsUnexpectedProblem?: boolean;
  
  /**
   * Whether the seller can send a different type of message
   */
  allowsOther?: boolean;
}

/**
 * Message options for sending to a buyer
 */
export interface SendMessageOptions {
  /**
   * Marketplace ID
   */
  marketplaceId: string;
  
  /**
   * Type of message being sent
   */
  messageType: MessageType;
  
  /**
   * Subject of the message
   */
  subject?: string;
  
  /**
   * Body of the message in HTML format
   */
  htmlBody?: string;
  
  /**
   * Body of the message in plain text format
   */
  textBody?: string;
  
  /**
   * Attachments to include with the message
   */
  attachments?: Attachment[];
}

/**
 * Tracking details for a shipment
 */
export interface TrackingDetails {
  /**
   * Tracking number
   */
  trackingNumber: string;
  
  /**
   * Carrier for the shipment (e.g. USPS, UPS, FedEx)
   */
  carrier: string;
}

/**
 * Fulfillment information for sending a fulfillment message
 */
export interface FulfillmentInfo {
  /**
   * Tracking details for the shipment
   */
  tracking?: TrackingDetails;
  
  /**
   * Additional message to include
   */
  additionalMessage?: string;
}

/**
 * Order details information for sending a message
 */
export interface OrderDetailsInfo {
  /**
   * Subject of the message
   */
  subject: string;
  
  /**
   * Body of the message
   */
  body: string;
}

/**
 * Warranty information for sending a warranty message
 */
export interface WarrantyInfo {
  /**
   * Subject of the message
   */
  subject: string;
  
  /**
   * Body of the message
   */
  body: string;
  
  /**
   * Warranty document to attach
   */
  attachment?: {
    /**
     * Name of the attachment
     */
    fileName: string;
    
    /**
     * Content of the attachment in base64 format
     */
    data: string;
  };
}

/**
 * Interface for messaging module options
 */
export interface MessagingModuleOptions {
  /**
   * Default marketplace ID to use if not specified
   */
  defaultMarketplaceId?: string;
}

/**
 * Generic message response
 */
export interface MessageResponse {
  /**
   * Success status of the message
   */
  success: boolean;
}

/**
 * Implementation of the Amazon Messaging API
 */
export class MessagingModule implements BaseModule<MessagingModuleOptions> {
  /**
   * The unique identifier for this module
   */
  public readonly moduleId: string = 'messaging';
  
  /**
   * The human-readable name of this module
   */
  public readonly moduleName: string = 'Messaging';
  
  /**
   * The base URL path for API requests
   */
  public readonly basePath: string = '/messaging/v1';
  
  /**
   * API version
   */
  public readonly apiVersion: string;
  
  /**
   * Marketplace ID
   */
  public readonly marketplaceId: string;
  
  /**
   * Additional configuration options for this module
   */
  public readonly options: MessagingModuleOptions = {};
  
  /**
   * The API request function used by this module
   */
  public readonly apiRequest: ApiRequestFunction;
  
  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param options Optional module-specific configuration
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string,
    options?: MessagingModuleOptions
  ) {
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
    
    if (options) {
      this.options = {
        ...this.options,
        ...options
      };
    }
  }
  
  /**
   * Get messaging configuration for a specific order
   * @param amazonOrderId Amazon order ID
   * @param options Configuration options
   * @returns Messaging configuration for the order
   */
  public async getMessagingConfiguration(
    amazonOrderId: string, 
    options: GetMessagingConfigOptions
  ): Promise<ApiResponse<GetMessagingActionsForOrderResponse>> {
    if (!amazonOrderId) {
      throw AmazonErrorHandler.createError(
        'Amazon Order ID is required to get messaging configuration', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to get messaging configuration', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      return await this.apiRequest<GetMessagingActionsForOrderResponse>(
        `${this.basePath}/orders/${encodeURIComponent(amazonOrderId)}/messaging`,
        'GET',
        {
          params: {
            marketplaceIds: options.marketplaceId
          }
        }
      );
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Send a message to a buyer
   * @param amazonOrderId Amazon order ID
   * @param options Message options
   * @returns Response indicating message success
   */
  public async sendMessage(
    amazonOrderId: string, 
    options: SendMessageOptions
  ): Promise<ApiResponse<MessageResponse>> {
    if (!amazonOrderId) {
      throw AmazonErrorHandler.createError(
        'Amazon Order ID is required to send a message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to send a message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.messageType) {
      throw AmazonErrorHandler.createError(
        'Message type is required to send a message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!options.htmlBody && !options.textBody) {
      throw AmazonErrorHandler.createError(
        'Either HTML body or text body is required to send a message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const messageData: Record<string, any> = {};
    
    // Add basic message data
    if (options.subject) {
      messageData.subject = options.subject;
    }
    
    if (options.htmlBody) {
      messageData.htmlBody = options.htmlBody;
    }
    
    if (options.textBody) {
      messageData.textBody = options.textBody;
    }
    
    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      messageData.attachments = options.attachments.map(attachment => ({
        contentType: attachment.contentType,
        fileName: attachment.fileName,
        attachmentData: attachment.attachmentData
      }));
    }
    
    try {
      const endpoint = `/orders/${encodeURIComponent(amazonOrderId)}/messages/${options.messageType.toLowerCase()}`;
      
      return await this.apiRequest<MessageResponse>(
        `${this.basePath}${endpoint}`,
        'POST',
        {
          params: {
            marketplaceIds: options.marketplaceId
          },
          data: messageData
        }
      );
    } catch (error) {
      throw error instanceof Error
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Send a confirmation message for order fulfillment
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID
   * @param fulfillmentInfo Fulfillment details
   * @returns Response indicating message success
   */
  public async sendOrderFulfillmentMessage(
    amazonOrderId: string, 
    marketplaceId: string, 
    fulfillmentInfo: FulfillmentInfo
  ): Promise<ApiResponse<MessageResponse>> {
    if (!amazonOrderId) {
      throw AmazonErrorHandler.createError(
        'Amazon Order ID is required to send order fulfillment message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to send order fulfillment message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    let messageBody = 'Your order has been shipped.';
    
    if (fulfillmentInfo.tracking) {
      messageBody += ` Tracking Number: ${fulfillmentInfo.tracking.trackingNumber}, Carrier: ${fulfillmentInfo.tracking.carrier}`;
    }
    
    if (fulfillmentInfo.additionalMessage) {
      messageBody += `\n\n${fulfillmentInfo.additionalMessage}`;
    }
    
    return this.sendMessage(amazonOrderId, {
      marketplaceId,
      messageType: 'ORDER_FULFILLMENT',
      subject: 'Your order has been shipped',
      textBody: messageBody
    });
  }
  
  /**
   * Send a message regarding order details
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID
   * @param detailsInfo Order details information
   * @returns Response indicating message success
   */
  public async sendOrderDetailsMessage(
    amazonOrderId: string, 
    marketplaceId: string, 
    detailsInfo: OrderDetailsInfo
  ): Promise<ApiResponse<MessageResponse>> {
    if (!amazonOrderId) {
      throw AmazonErrorHandler.createError(
        'Amazon Order ID is required to send order details message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to send order details message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!detailsInfo.subject || !detailsInfo.body) {
      throw AmazonErrorHandler.createError(
        'Subject and body are required to send order details message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.sendMessage(amazonOrderId, {
      marketplaceId,
      messageType: 'ORDER_DETAIL',
      subject: detailsInfo.subject,
      textBody: detailsInfo.body
    });
  }
  
  /**
   * Send a return-related message
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID
   * @param returnInfo Return information
   * @returns Response indicating message success
   */
  public async sendOrderReturnMessage(
    amazonOrderId: string, 
    marketplaceId: string, 
    returnInfo: OrderDetailsInfo
  ): Promise<ApiResponse<MessageResponse>> {
    if (!amazonOrderId) {
      throw AmazonErrorHandler.createError(
        'Amazon Order ID is required to send order return message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to send order return message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!returnInfo.subject || !returnInfo.body) {
      throw AmazonErrorHandler.createError(
        'Subject and body are required to send order return message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    return this.sendMessage(amazonOrderId, {
      marketplaceId,
      messageType: 'ORDER_RETURN',
      subject: returnInfo.subject,
      textBody: returnInfo.body
    });
  }
  
  /**
   * Send a warranty message
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID
   * @param warrantyInfo Warranty information
   * @returns Response indicating message success
   */
  public async sendWarrantyMessage(
    amazonOrderId: string, 
    marketplaceId: string, 
    warrantyInfo: WarrantyInfo
  ): Promise<ApiResponse<MessageResponse>> {
    if (!amazonOrderId) {
      throw AmazonErrorHandler.createError(
        'Amazon Order ID is required to send warranty message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!marketplaceId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to send warranty message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    if (!warrantyInfo.subject || !warrantyInfo.body) {
      throw AmazonErrorHandler.createError(
        'Subject and body are required to send warranty message', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    const options: SendMessageOptions = {
      marketplaceId,
      messageType: 'WARRANTY',
      subject: warrantyInfo.subject,
      textBody: warrantyInfo.body
    };
    
    // Add attachment if provided
    if (warrantyInfo.attachment) {
      options.attachments = [{
        contentType: 'application/pdf',
        fileName: warrantyInfo.attachment.fileName,
        attachmentData: warrantyInfo.attachment.data
      }];
    }
    
    return this.sendMessage(amazonOrderId, options);
  }
  
  /**
   * Check if messaging is allowed for a specific order type
   * @param amazonOrderId Amazon order ID
   * @param messageType Type of message to check
   * @param marketplaceId Marketplace ID
   * @returns Whether the specified message type is allowed
   */
  public async isMessagingAllowed(
    amazonOrderId: string, 
    messageType: MessageType, 
    marketplaceId?: string
  ): Promise<boolean> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to check if messaging is allowed', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getMessagingConfiguration(amazonOrderId, {
        marketplaceId: mktId
      });
      
      // Check if the message type is in the allowed actions
      return response.data?.actions?.some(action => action.name === messageType) || false;
    } catch (error) {
      console.error(`Error checking if messaging is allowed for order ${amazonOrderId}:`, error);
      return false;
    }
  }
  
  /**
   * Get message templates for the allowed message types
   * @param amazonOrderId Amazon order ID
   * @param marketplaceId Marketplace ID
   * @returns Configuration with allowed message types
   */
  public async getAllowedMessageTypes(
    amazonOrderId: string, 
    marketplaceId?: string
  ): Promise<MessageConfiguration> {
    const mktId = marketplaceId || this.marketplaceId;
    
    if (!mktId) {
      throw AmazonErrorHandler.createError(
        'Marketplace ID is required to get allowed message types', 
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.getMessagingConfiguration(amazonOrderId, {
        marketplaceId: mktId
      });
      
      const config: MessageConfiguration = {};
      
      // Check which message types are allowed
      if (response.data?.actions) {
        response.data.actions.forEach(action => {
          switch (action.name) {
            case 'WARRANTY':
              config.allowsWarranty = true;
              break;
            case 'PRODUCT_DETAIL':
              config.allowsProductDetails = true;
              break;
            case 'PRODUCT_CUSTOMIZATION':
              config.allowsProductCustomization = true;
              break;
            case 'AMAZON_PAY':
              config.allowsAmazonPay = true;
              break;
            case 'ORDER_FULFILLMENT':
              config.allowsOrderFulfillment = true;
              break;
            case 'ORDER_DETAIL':
              config.allowsOrderDetails = true;
              break;
            case 'ORDER_RETURN':
              config.allowsOrderReturn = true;
              break;
            case 'UNEXPECTED_PROBLEM':
              config.allowsUnexpectedProblem = true;
              break;
            case 'OTHER':
              config.allowsOther = true;
              break;
          }
        });
      }
      
      return config;
    } catch (error) {
      console.error(`Error getting allowed message types for order ${amazonOrderId}:`, error);
      return {};
    }
  }
}