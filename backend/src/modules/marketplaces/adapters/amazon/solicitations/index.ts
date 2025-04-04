/**
 * Amazon Solicitations API Module
 * 
 * Provides functionality for requesting reviews and feedback from buyers
 * within Amazon's terms of service and policies. The Solicitations API
 * allows sellers to programmatically request product reviews and seller
 * feedback from buyers, while adhering to Amazon's communication guidelines.
 * 
 * This module allows merchants to:
 * - Check eligibility for sending review/feedback requests
 * - Send product review requests
 * - Send seller feedback requests
 * - Get reasons why a solicitation might not be allowed
 * - Determine all available solicitation actions for an order
 * 
 * Key features:
 * - Type-safe interfaces for all solicitation operations
 * - Comprehensive error handling with detailed messages
 * - Configurable logging for solicitation results
 * - Automatic retry support for transient errors
 * - Utility methods for common solicitation patterns
 * - Proper rate limiting to follow Amazon's requirements
 * 
 * Usage examples:
 * ```typescript
 * // Check if a review request is allowed
 * const canRequestReview = await amazonClient.solicitations.isProductReviewAllowed('ORDER_ID');
 * 
 * // Request a product review
 * if (canRequestReview) {
 *   const result = await amazonClient.solicitations.requestProductReview('ORDER_ID');
 * }
 * 
 * // Get all allowed solicitation types for an order
 * const allowedTypes = await amazonClient.solicitations.getAllowedSolicitationTypes('ORDER_ID');
 * 
 * // Check why a solicitation might not be allowed
 * const reason = await amazonClient.solicitations.getSolicitationDisallowedReason(
 *   'ORDER_ID', 
 *   'REQUEST_REVIEW'
 * );
 * ```
 * 
 * All operations follow Amazon's terms of service and rate limiting requirements.
 * 
 * @module solicitations
 */

export * from './solicitations';
export * from './solicitations-factory';