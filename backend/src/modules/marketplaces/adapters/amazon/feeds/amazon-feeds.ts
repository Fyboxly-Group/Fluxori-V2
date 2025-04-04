/**
 * Amazon SP-API Feeds Utility Module
 * 
 * Provides utility functions and type definitions for working with
 * Amazon Seller Central feeds.
 */
import { FeedType, FeedDocument, Feed, FeedProcessingStatus } from './feeds';

/**
 * Feed document content types supported by Amazon
 */
export enum FeedContentType {
  /**
   * XML content type
   */
  XML = 'text/xml; charset=UTF-8',
  
  /**
   * JSON content type
   */
  JSON = 'application/json; charset=UTF-8',
  
  /**
   * Tab-delimited text content type
   */
  TAB_DELIMITED = 'text/tab-separated-values; charset=UTF-8',
  
  /**
   * Plain text content type
   */
  TEXT = 'text/plain; charset=UTF-8'
}

/**
 * Feed processing result
 */
export interface FeedProcessingResult {
  /**
   * Feed processing status
   */
  status: FeedProcessingStatus;
  
  /**
   * Feed ID
   */
  feedId: string;
  
  /**
   * Feed result document (if available)
   */
  resultDocument?: FeedDocument;
  
  /**
   * Feed result content (if downloaded)
   */
  resultContent?: string;
  
  /**
   * Feed result summary
   */
  summary?: {
    /**
     * Number of processed records
     */
    processed: number;
    
    /**
     * Number of successful records
     */
    successful: number;
    
    /**
     * Number of failed records
     */
    failed: number;
    
    /**
     * Number of records with warnings
     */
    warnings: number;
  };
  
  /**
   * Processing errors (if any)
   */
  errors?: Array<{
    /**
     * Error code
     */
    code: string;
    
    /**
     * Error message
     */
    message: string;
    
    /**
     * Affected record ID (if applicable)
     */
    recordId?: string;
  }>;
}

/**
 * XML feed template generator
 * 
 * @param type Feed type
 * @param records Feed records (XML content)
 * @returns Formatted XML feed content
 */
export function generateXmlFeed(type: FeedType, records: string): string {
  const timestamp = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
  <Header>
    <DocumentVersion>1.01</DocumentVersion>
    <MerchantIdentifier>MERCHANT_ID</MerchantIdentifier>
  </Header>
  <MessageType>${type}</MessageType>
  <PurgeAndReplace>false</PurgeAndReplace>
  <Message>
    <MessageID>1</MessageID>
    <OperationType>Update</OperationType>
    <${timestamp}>
      ${records}
    </${timestamp}>
  </Message>
</AmazonEnvelope>`;
}

/**
 * JSON feed template generator
 * 
 * @param type Feed type
 * @param records Feed records (as objects)
 * @returns Formatted JSON feed content
 */
export function generateJsonFeed(type: FeedType, records: any[]): string {
  const feedData = {
    header: {
      documentVersion: '1.01',
      merchantIdentifier: 'MERCHANT_ID'
    },
    messageType: type,
    purgeAndReplace: false,
    messages: records.map((record, index) => ({
      messageId: (index + 1).toString(),
      operationType: 'Update',
      ...record
    }))
  };
  
  return JSON.stringify(feedData, null, 2);
}

/**
 * Create a product data feed (simple wrapper)
 * 
 * @param products List of product data objects
 * @returns JSON feed content for product data
 */
export function createProductFeed(products: any[]): string {
  return generateJsonFeed(FeedType.PRODUCT_JSON, products);
}

/**
 * Create an inventory update feed
 * 
 * @param inventoryUpdates List of inventory update objects
 * @returns JSON feed content for inventory updates
 */
export function createInventoryFeed(inventoryUpdates: Array<{
  sku: string;
  quantity: number;
  fulfillmentLatency?: number;
}>): string {
  const records = inventoryUpdates.map(update => ({
    inventory: {
      sku: update.sku,
      quantity: update.quantity,
      fulfillmentLatency: update.fulfillmentLatency || 1
    }
  }));
  
  return generateJsonFeed(FeedType.INVENTORY_JSON, records);
}

/**
 * Create a pricing update feed
 * 
 * @param pricingUpdates List of pricing update objects
 * @returns JSON feed content for pricing updates
 */
export function createPricingFeed(pricingUpdates: Array<{
  sku: string;
  price: number;
  currency?: string;
  salePrice?: number;
  salePriceStartDate?: string;
  salePriceEndDate?: string;
}>): string {
  const records = pricingUpdates.map(update => ({
    price: {
      sku: update.sku,
      standardPrice: {
        value: update.price,
        currency: update.currency || 'USD'
      },
      ...(update.salePrice ? {
        salePrice: {
          value: update.salePrice,
          currency: update.currency || 'USD'
        },
        salePriceStartDate: update.salePriceStartDate,
        salePriceEndDate: update.salePriceEndDate
      } : {})
    }
  }));
  
  return generateJsonFeed(FeedType.PRICING_JSON, records);
}

/**
 * Parse a feed processing result document
 * 
 * @param content Feed result document content
 * @param contentType Feed result document content type
 * @returns Parsed processing result
 */
export function parseFeedResult(content: string, contentType: string): FeedProcessingResult['summary'] & { errors: any[] } {
  // Initialize summary
  const summary = {
    processed: 0,
    successful: 0,
    failed: 0,
    warnings: 0,
    errors: []
  };
  
  try {
    // Handle different content types
    if (contentType.includes('json')) {
      // Parse JSON result
      const result = JSON.parse(content);
      
      // Extract summary information
      if (result.summary) {
        summary.processed = result.summary.processed || 0;
        summary.successful = result.summary.successful || 0;
        summary.failed = result.summary.failed || 0;
        summary.warnings = result.summary.warnings || 0;
      }
      
      // Extract errors
      if (result.errors && Array.isArray(result.errors)) {
        summary.errors = result.errors;
      }
    } else if (contentType.includes('xml')) {
      // For XML parsing, a more robust approach would be to use a proper XML parser
      // This is a simplified approach
      
      // Count processed items
      const processedMatch = content.match(/<ProcessedCount>(\d+)<\/ProcessedCount>/);
      if (processedMatch) {
        summary.processed = parseInt(processedMatch[1], 10);
      }
      
      // Count successful items
      const successfulMatch = content.match(/<SuccessCount>(\d+)<\/SuccessCount>/);
      if (successfulMatch) {
        summary.successful = parseInt(successfulMatch[1], 10);
      }
      
      // Count failed items
      const failedMatch = content.match(/<FailureCount>(\d+)<\/FailureCount>/);
      if (failedMatch) {
        summary.failed = parseInt(failedMatch[1], 10);
      }
      
      // Extract errors
      const errorRegex = /<Error>[\s\S]*?<Code>(.*?)<\/Code>[\s\S]*?<Message>(.*?)<\/Message>(?:[\s\S]*?<RecordId>(.*?)<\/RecordId>)?[\s\S]*?<\/Error>/g;
      let errorMatch;
      
      while ((errorMatch = errorRegex.exec(content)) !== null) {
        summary.errors.push({
          code: errorMatch[1],
          message: errorMatch[2],
          recordId: errorMatch[3] || undefined
        });
      }
    } else if (contentType.includes('tab-separated-values') || contentType.includes('text/plain')) {
      // Parse tab-delimited or plain text result
      const lines = content.split('\n');
      
      // Assume the first line is a header
      const headerLine = lines[0];
      const hasHeader = headerLine && (
        headerLine.includes('status') || 
        headerLine.includes('result') || 
        headerLine.includes('error')
      );
      
      // Skip header if present
      const startLine = hasHeader ? 1 : 0;
      
      // Process each line
      for (let i = startLine; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        summary.processed++;
        
        // Check if line indicates an error
        if (
          line.includes('ERROR') || 
          line.includes('FAILURE') || 
          line.includes('REJECTED')
        ) {
          summary.failed++;
          
          // Extract error information
          const parts = line.split('\t');
          if (parts.length >= 2) {
            summary.errors.push({
              code: 'ERROR',
              message: parts[1] || 'Unknown error',
              recordId: parts[0] || undefined
            });
          }
        } else if (
          line.includes('WARNING')
        ) {
          summary.warnings++;
          summary.successful++;
        } else {
          summary.successful++;
        }
      }
    }
  } catch (error) {
    // If parsing fails, add a parsing error
    summary.errors.push({
      code: 'PARSING_ERROR',
      message: `Failed to parse feed result: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  return summary;
}

/**
 * Check if a feed is completed successfully
 * 
 * @param feed Feed to check
 * @returns True if feed completed successfully
 */
export function isFeedSuccessful(feed: Feed): boolean {
  return feed.processingStatus === FeedProcessingStatus.DONE;
}

/**
 * Check if a feed has failed
 * 
 * @param feed Feed to check
 * @returns True if feed failed
 */
export function isFeedFailed(feed: Feed): boolean {
  return feed.processingStatus === FeedProcessingStatus.FATAL;
}

/**
 * Check if a feed is still processing
 * 
 * @param feed Feed to check
 * @returns True if feed is still processing
 */
export function isFeedProcessing(feed: Feed): boolean {
  return [
    FeedProcessingStatus.PROCESSING,
    FeedProcessingStatus.IN_QUEUE,
    FeedProcessingStatus.IN_PROGRESS
  ].includes(feed.processingStatus);
}

/**
 * Format feed status for display
 * 
 * @param status Feed processing status
 * @returns Human-readable status
 */
export function formatFeedStatus(status: FeedProcessingStatus): string {
  switch (status) {
    case FeedProcessingStatus.DONE:
      return 'Completed';
    case FeedProcessingStatus.FATAL:
      return 'Failed';
    case FeedProcessingStatus.CANCELLED:
      return 'Cancelled';
    case FeedProcessingStatus.IN_QUEUE:
      return 'Queued';
    case FeedProcessingStatus.IN_PROGRESS:
      return 'In Progress';
    case FeedProcessingStatus.PROCESSING:
      return 'Processing';
    default:
      return status;
  }
}

/**
 * Format feed type for display
 * 
 * @param feedType Feed type
 * @returns Human-readable feed type
 */
export function formatFeedType(feedType: string): string {
  // Handle known feed types
  switch (feedType) {
    case FeedType.INVENTORY_JSON:
      return 'Inventory Update';
    case FeedType.INVENTORY_XML:
      return 'Inventory Update (XML)';
    case FeedType.PRICING_JSON:
      return 'Pricing Update';
    case FeedType.PRODUCT_JSON:
      return 'Product Update';
    case FeedType.PRODUCT_XML:
      return 'Product Update (XML)';
    case FeedType.ORDER_ACKNOWLEDGEMENT:
      return 'Order Acknowledgement';
    case FeedType.ORDER_FULFILLMENT:
      return 'Order Fulfillment';
    case FeedType.PRODUCT_IMAGES:
      return 'Product Images';
    case FeedType.LISTINGS_DATA:
      return 'Listings Update';
    default:
      // Format unknown feed types
      return feedType
        .replace(/^POST_/, '')
        .replace(/_/g, ' ')
        .replace(/DATA$/, '')
        .replace(/JSON$/, ' (JSON)')
        .trim();
  }
}

export default {
  FeedContentType,
  generateXmlFeed,
  generateJsonFeed,
  createProductFeed,
  createInventoryFeed,
  createPricingFeed,
  parseFeedResult,
  isFeedSuccessful,
  isFeedFailed,
  isFeedProcessing,
  formatFeedStatus,
  formatFeedType
};