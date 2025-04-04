/**
 * Amazon Inventory API Modules
 * Exports all inventory-related modules and interfaces
 * 
 * This module provides comprehensive inventory management capabilities for Amazon sellers:
 * 
 * Key modules:
 * - FBA Inventory - Manage Fulfillment by Amazon inventory
 * - FBA Small and Light - Manage enrollment in the Small and Light program
 * - FBA Inbound Eligibility - Check product eligibility for inbound shipping
 * - Inventory Planning - Advanced inventory forecasting and optimization
 * 
 * The Inventory Planning module provides:
 * - Inventory level recommendations based on sales velocity
 * - Sales velocity metrics and trend analysis
 * - FBA fee estimation for inventory planning
 * - Inventory health assessment
 * - Reorder planning with budget constraints
 * - Low inventory and excess inventory reporting
 * 
 * Usage example:
 * ```typescript
 * // Initialize the inventory planning module
 * const inventoryPlanning = createInventoryPlanningModule(
 *   apiRequest,
 *   'A2EUQ1WTGCTBG2', // US marketplace
 *   moduleRegistry
 * );
 * 
 * // Get inventory recommendations
 * const recommendations = await inventoryPlanning.getInventoryRecommendations(['SKU123']);
 * 
 * // Get inventory health assessment
 * const healthAssessment = await inventoryPlanning.assessInventoryHealth(['SKU123']);
 * ```
 */

export * from './fba';
export * from './fba-small-light';
export * from './fba-inbound-eligibility';
export * from './inventory-planning';
export * from './inventory-planning-factory';