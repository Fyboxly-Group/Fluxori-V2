/**
 * Amazon SP-API Module Definitions
 * 
 * This file defines all available Amazon Selling Partner API modules
 * with their configuration details including versions, rate limits, etc.
 */

/**
 * Module definition interface for Amazon API modules
 */
export interface ModuleDefinition<T = any> {
  /**
   * The unique identifier for this module
   */
  moduleId: string;
  
  /**
   * Human-readable name of the module
   */
  name: string;
  
  /**
   * Description of what this module provides
   */
  description: string;
  
  /**
   * Available API versions for this module
   */
  versions: Array<{
    /**
     * Version identifier (e.g., "2022-09-10", "v1")
     */
    version: string;
    
    /**
     * Whether this is the default version to use
     */
    default: boolean;
  }>;
  
  /**
   * Rate limit configuration for this module
   */
  rateLimit: {
    /**
     * Maximum requests per second
     */
    requestsPerSecond: number;
    
    /**
     * Restored rate per second (for token bucket algorithm)
     */
    restoreRatePerSecond: number;
    
    /**
     * Maximum bucket size (for token bucket algorithm)
     */
    maxBucketSize: number;
  };
  
  /**
   * Additional module-specific configuration options
   */
  options?: T;
}

/**
 * All available Amazon SP-API modules
 */
export const SP_API_MODULES: ModuleDefinition[] = [
  // Catalog & Product Information
  {
    moduleId: "catalogItems",
    name: "Catalog Items",
    description: "Provides detailed product information from Amazon's catalog",
    versions: [
      { version: "2022-04-01", default: true },
      { version: "2020-12-01", default: false }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  
  // Listings & Restrictions
  {
    moduleId: "listingsItems",
    name: "Listings Items",
    description: "Create and manage product listings on Amazon",
    versions: [
      { version: "2021-08-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "listingsRestrictions",
    name: "Listings Restrictions",
    description: "Check restrictions on creating listings for products",
    versions: [
      { version: "2021-08-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "productTypeDefinitions",
    name: "Product Type Definitions",
    description: "Retrieve definitions for Amazon product types",
    versions: [
      { version: "2020-09-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "aplus",
    name: "A+ Content",
    description: "Create and manage A+ content for products",
    versions: [
      { version: "2020-11-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 100
    }
  },
  
  // Inventory & Fulfillment
  {
    moduleId: "fbaInventory",
    name: "FBA Inventory",
    description: "Manage inventory in Amazon's fulfillment centers",
    versions: [
      { version: "2022-05-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "fulfillmentInbound",
    name: "Fulfillment Inbound",
    description: "Create and manage inbound shipments to Amazon fulfillment centers",
    versions: [
      { version: "2020-10-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "warehouseAndDistribution",
    name: "Warehousing & Distribution",
    description: "Manage warehousing and distribution programs",
    versions: [
      { version: "2024-01-15", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "fbaInboundEligibility",
    name: "FBA Inbound Eligibility",
    description: "Check eligibility for inbound programs",
    versions: [
      { version: "2022-05-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "fbaSmallAndLight",
    name: "FBA Small & Light",
    description: "Manage FBA Small and Light program enrollment",
    versions: [
      { version: "2021-08-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "replenishment",
    name: "Replenishment",
    description: "Plan and manage inventory replenishment",
    versions: [
      { version: "2022-11-07", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "supplySource",
    name: "Supply Source",
    description: "Manage supply chain sources for fulfillment",
    versions: [
      { version: "2022-01-03", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  
  // Orders & Fulfillment
  {
    moduleId: "orders",
    name: "Orders",
    description: "Manage customer orders",
    versions: [
      { version: "v0", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 20,
      restoreRatePerSecond: 2,
      maxBucketSize: 144
    }
  },
  {
    moduleId: "fulfillmentOutbound",
    name: "Fulfillment Outbound",
    description: "Create and manage outbound fulfillment orders",
    versions: [
      { version: "2020-07-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "merchantFulfillment",
    name: "Merchant Fulfillment",
    description: "Create shipments using Amazon's contracted rates",
    versions: [
      { version: "v0", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "easyShip",
    name: "Easy Ship",
    description: "Create and manage Amazon Easy Ship orders",
    versions: [
      { version: "2022-03-23", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  
  // Shipping & Services
  {
    moduleId: "shipping",
    name: "Shipping",
    description: "Create shipments using Amazon's contracted carriers",
    versions: [
      { version: "v1", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "services",
    name: "Services",
    description: "Manage service orders for Amazon services",
    versions: [
      { version: "2022-03-23", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  
  // Pricing & Fees
  {
    moduleId: "productPricing",
    name: "Product Pricing",
    description: "Get pricing information and make pricing decisions",
    versions: [
      { version: "2022-05-01", default: true },
      { version: "v0", default: false }
    ],
    rateLimit: {
      requestsPerSecond: 10,
      restoreRatePerSecond: 1,
      maxBucketSize: 400
    }
  },
  {
    moduleId: "productFees",
    name: "Product Fees",
    description: "Get fee estimates for products on Amazon",
    versions: [
      { version: "v0", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  
  // Finance & Accounting
  {
    moduleId: "finances",
    name: "Finances",
    description: "Get financial transaction information",
    versions: [
      { version: "2024-02-15", default: true },
      { version: "v0", default: false }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 100
    }
  },
  {
    moduleId: "invoices",
    name: "Invoices",
    description: "Manage invoices for Amazon transactions",
    versions: [
      { version: "2024-02-15", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "shipmentInvoicing",
    name: "Shipment Invoicing",
    description: "Manage shipment invoices for cross-border sellers",
    versions: [
      { version: "v0", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  
  // Reports & Feeds
  {
    moduleId: "reports",
    name: "Reports",
    description: "Create and download reports on seller performance and operations",
    versions: [
      { version: "2021-06-30", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 2,
      restoreRatePerSecond: 0.2,
      maxBucketSize: 60
    }
  },
  {
    moduleId: "feeds",
    name: "Feeds",
    description: "Submit feed data to Amazon",
    versions: [
      { version: "2021-06-30", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 2,
      restoreRatePerSecond: 0.2,
      maxBucketSize: 60
    }
  },
  {
    moduleId: "dataKiosk",
    name: "Data Kiosk",
    description: "Access to analytical data about your business on Amazon",
    versions: [
      { version: "2023-11-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 100
    }
  },
  {
    moduleId: "sales",
    name: "Sales",
    description: "Get sales performance data",
    versions: [
      { version: "v1", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  
  // Communication & Notifications
  {
    moduleId: "messaging",
    name: "Messaging",
    description: "Send messages to buyers through Amazon's messaging system",
    versions: [
      { version: "v1", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 100
    }
  },
  {
    moduleId: "solicitations",
    name: "Solicitations",
    description: "Request product reviews from buyers",
    versions: [
      { version: "v1", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 75
    }
  },
  {
    moduleId: "notifications",
    name: "Notifications",
    description: "Subscribe to notifications for various Amazon events",
    versions: [
      { version: "v1", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  
  // Account Management
  {
    moduleId: "sellers",
    name: "Sellers",
    description: "Get information about the seller's account",
    versions: [
      { version: "v1", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "applicationIntegrations",
    name: "Application Integrations",
    description: "Manage application integration settings",
    versions: [
      { version: "2024-02-15", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "applicationManagement",
    name: "Application Management",
    description: "Manage application settings and permissions",
    versions: [
      { version: "2023-05-14", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  
  // Auth & Infrastructure
  {
    moduleId: "tokens",
    name: "Tokens",
    description: "Manage tokens for authentication",
    versions: [
      { version: "2021-03-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 100
    }
  },
  {
    moduleId: "authorization",
    name: "Authorization",
    description: "Manage authorization for Amazon services",
    versions: [
      { version: "v1", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  },
  {
    moduleId: "uploads",
    name: "Uploads",
    description: "Upload documents and images to Amazon",
    versions: [
      { version: "2020-11-01", default: true }
    ],
    rateLimit: {
      requestsPerSecond: 5,
      restoreRatePerSecond: 0.5,
      maxBucketSize: 200
    }
  }
];

/**
 * Get a module definition by name
 * 
 * @param name - The name of the module to get
 * @returns The module definition, or undefined if not found
 */
export function getModuleDefinitionByName(name: string): ModuleDefinition | undefined {
  return SP_API_MODULES.find(module => module.name === name);
}

/**
 * Get a module definition by ID
 * 
 * @param moduleId - The ID of the module to get
 * @returns The module definition, or undefined if not found
 */
export function getModuleDefinitionById(moduleId: string): ModuleDefinition | undefined {
  return SP_API_MODULES.find(module => module.moduleId === moduleId);
}

/**
 * Get the default version for a module
 * 
 * @param moduleId - The ID of the module
 * @returns The default version, or undefined if not found
 */
export function getModuleDefaultVersion(moduleId: string): string | undefined {
  const module = getModuleDefinitionById(moduleId);
  if (!module) return undefined;
  
  const defaultVersion = module.versions.find(v => v.default === true);
  return defaultVersion ? defaultVersion.version : undefined;
}

/**
 * Check if a version is valid for a module
 * 
 * @param moduleId - The ID of the module
 * @param version - The version to check
 * @returns True if the version is valid, false otherwise
 */
export function isValidModuleVersion(moduleId: string, version: string): boolean {
  const module = getModuleDefinitionById(moduleId);
  if (!module) return false;
  
  return module.versions.some(v => v.version === version);
}