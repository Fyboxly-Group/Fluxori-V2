/**
 * Tokens API Module
 * 
 * Provides functionality for managing restricted data tokens (RDT)
 * which are used to access restricted information like customer data.
 * 
 * The Tokens API allows sellers to create temporary authentication tokens
 * for accessing restricted operations like:
 * - Customer PII (Personally Identifiable Information)
 * - Shipping address details
 * - Buyer information
 * - Messaging capabilities
 * - Report downloads
 * - Feed document access
 * 
 * Key features:
 * - Create tokens for specific API operations
 * - Set custom expiration periods for tokens
 * - Generate tokens for customer data access
 * - Access buyer information with proper authentication
 * - Create tokens for messaging customers
 * - Access report and feed documents securely
 * 
 * Usage example:
 * ```typescript
 * // Create a token for accessing customer information for an order
 * const tokenInfo = await amazonClient.tokens.createTokenForCustomerPII(['ORDER_ID']);
 * 
 * // Create a token for accessing buyer information
 * const buyerInfo = await amazonClient.tokens.getBuyerInfoWithToken('ORDER_ID');
 * 
 * // Create a token for messaging a customer
 * const messagingToken = await amazonClient.tokens.createTokenForMessaging(['ORDER_ID']);
 * ```
 * 
 * @module tokens
 */

export * from './tokens';
export * from './tokens-factory';