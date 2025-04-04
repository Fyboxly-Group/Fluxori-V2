/**
 * Amazon Fulfillment Inbound API Modules
 * 
 * Exports all fulfillment inbound-related modules, interfaces, and utility functions.
 * This module provides tools for working with Amazon's FBA Inbound Shipment API.
 * 
 * The Fulfillment Inbound API allows sellers to create and manage inbound shipments
 * to Amazon's fulfillment centers. This includes creating shipment plans, creating
 * and updating inbound shipments, and tracking shipment status and items.
 * 
 * Key capabilities:
 * - Create inbound shipment plans for sending inventory to Amazon FBA
 * - Create and update inbound shipments
 * - Track shipment status and items
 * - Retrieve shipment information and search for shipments
 * - Manage the fulfillment inbound workflow from planning to shipping
 */

// Fulfillment Inbound module for creating and managing inbound shipments
export * from './fulfillment-inbound';

// Factory function for creating Fulfillment Inbound module instances
export * from './fulfillment-inbound-factory';