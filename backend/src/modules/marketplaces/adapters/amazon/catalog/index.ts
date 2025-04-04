/**
 * Amazon Catalog API Modules
 * 
 * Exports all catalog-related modules, interfaces, and utility functions.
 * This module provides tools for working with Amazon's Catalog API.
 * 
 * The Catalog API allows sellers to retrieve detailed product information
 * from Amazon's catalog, search for products, and get product details by
 * various identifiers such as ASIN, UPC, EAN, etc.
 * 
 * Key capabilities:
 * - Search Amazon's product catalog by keywords, identifiers, or classification
 * - Retrieve detailed product information including images, descriptions, and attributes
 * - Get sales rank data for products
 * - Access product variations and relationships
 * - Get product identifiers across marketplaces
 */

// Catalog items module for searching and retrieving catalog data
export * from './catalog-items';

// Factory function for creating catalog modules in the registry
export * from './catalog-factory';

// Utility functions and common interfaces for catalog data
export * from './catalog';

// Default export for CatalogUtils
export { default } from './catalog';