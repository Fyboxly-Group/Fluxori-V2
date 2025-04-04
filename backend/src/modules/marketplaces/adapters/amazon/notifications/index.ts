/**
 * Amazon Notifications API Modules
 * 
 * This module provides access to Amazon Selling Partner API notifications functionality.
 * It allows sellers to subscribe to notifications for various Amazon events and manage
 * notification subscriptions. Key event types include order changes, feed processing,
 * report updates, fulfillment statuses, and inventory changes.
 * 
 * The module supports multiple destination types (SQS, EventBridge, SNS) and provides
 * comprehensive notification management with pagination support for listing notifications.
 */

export * from './notifications';
export * from './notifications-factory';