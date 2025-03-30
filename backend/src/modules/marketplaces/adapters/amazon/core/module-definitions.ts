/**
 * Amazon SP-API Module Definitions
 * 
 * Defines all available Amazon Selling Partner API modules with their
 * namespaces, versions, and related metadata.
 */

/**
 * Module definition interface
 */
export interface ModuleDefinition {
  /**
   * Module name/namespace
   */
  name: string;
  
  /**
   * Display name for the module
   */
  displayName: string;
  
  /**
   * Available versions
   */
  versions: {
    /**
     * Version string
     */
    version: string;
    
    /**
     * Whether this is the default/recommended version
     */
    default?: boolean;
    
    /**
     * Whether this version is deprecated
     */
    deprecated?: boolean;
  }[];
  
  /**
   * Brief description of the module
   */
  description: string;
  
  /**
   * Rate limit details
   */
  rateLimit?: {
    /**
     * Rate limit restore rate per second
     */
    restoreRatePerSecond: number;
    
    /**
     * Burst capacity (maximum tokens)
     */
    burstCapacity: number;
    
    /**
     * Maximum daily request quota
     */
    maximumRequestQuota?: number;
  };
  
  /**
   * Module dependencies
   */
  dependencies?: string[];
}

/**
 * All available SP-API modules
 */
export const SP_API_MODULES: ModuleDefinition[] = [
  // Catalog Management Modules
  {
    name: "catalogItems",
    displayName: "Catalog Items API",
    versions: [
      { version: "2022-04-01", default: true },
      { version: "2020-12-01", deprecated: false }
    ],
    description: "Provides product catalog information and management",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "listingsItems",
    displayName: "Listings API",
    versions: [
      { version: "2021-08-01", default: true }
    ],
    description: "Create and manage product listings",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "listingsRestrictions",
    displayName: "Listings Restrictions API",
    versions: [
      { version: "2021-08-01", default: true }
    ],
    description: "Check restrictions on listings",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "productTypeDefinitions",
    displayName: "Product Type Definitions API",
    versions: [
      { version: "2020-09-01", default: true }
    ],
    description: "Retrieve product type definitions and requirements",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "aplus",
    displayName: "A+ Content API",
    versions: [
      { version: "2020-11-01", default: true }
    ],
    description: "Create and manage A+ content",
    rateLimit: {
      restoreRatePerSecond: 0.1,
      burstCapacity: 5,
      maximumRequestQuota: 100
    }
  },
  
  // Inventory Management Modules
  {
    name: "fbaInventory",
    displayName: "FBA Inventory API",
    versions: [
      { version: "2022-05-01", default: true }
    ],
    description: "Manage FBA inventory",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "fulfillmentInbound",
    displayName: "Fulfillment Inbound API",
    versions: [
      { version: "2024-03-20", default: true },
      { version: "2020-09-01", deprecated: false }
    ],
    description: "Create and manage inbound shipments to Amazon fulfillment centers",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "warehouseAndDistribution",
    displayName: "Warehousing And Distribution API",
    versions: [
      { version: "2024-05-09", default: true }
    ],
    description: "Manage warehousing and distribution operations",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "fbaInboundEligibility",
    displayName: "FBA Inbound Eligibility API",
    versions: [
      { version: "2022-05-01", default: true }
    ],
    description: "Check product eligibility for fulfillment by Amazon",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "fbaSmallAndLight",
    displayName: "FBA Small And Light API",
    versions: [
      { version: "2021-08-01", default: true }
    ],
    description: "Manage small and light inventory",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "replenishment",
    displayName: "Replenishment API",
    versions: [
      { version: "2022-11-07", default: true }
    ],
    description: "Plan and manage inventory replenishment",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "supplySource",
    displayName: "Supply Sources API",
    versions: [
      { version: "2022-11-07", default: true }
    ],
    description: "Manage supply sources for inventory",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  
  // Order Management Modules
  {
    name: "orders",
    displayName: "Orders API",
    versions: [
      { version: "v0", default: true }
    ],
    description: "Manage orders",
    rateLimit: {
      restoreRatePerSecond: 0.0167, // 1 request per minute
      burstCapacity: 20,
      maximumRequestQuota: 144 // Daily quota
    }
  },
  {
    name: "fulfillmentOutbound",
    displayName: "Fulfillment Outbound API",
    versions: [
      { version: "2020-07-01", default: true }
    ],
    description: "Create and manage fulfillment orders",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "merchantFulfillment",
    displayName: "Merchant Fulfillment API",
    versions: [
      { version: "v0", default: true }
    ],
    description: "Create and manage merchant-fulfilled shipments",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "easyShip",
    displayName: "Easy Ship API",
    versions: [
      { version: "2022-03-23", default: true }
    ],
    description: "Create and manage easy ship orders",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "shipping",
    displayName: "Shipping API",
    versions: [
      { version: "v1", default: true }
    ],
    description: "Create and manage shipments",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "services",
    displayName: "Services API",
    versions: [
      { version: "2022-03-01", default: true }
    ],
    description: "Manage service-based offers",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  
  // Pricing Modules
  {
    name: "productPricing",
    displayName: "Product Pricing API",
    versions: [
      { version: "2022-05-01", default: true },
      { version: "v0", deprecated: false }
    ],
    description: "Get pricing information",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 10,
      maximumRequestQuota: 400
    }
  },
  {
    name: "productFees",
    displayName: "Product Fees API",
    versions: [
      { version: "v0", default: true }
    ],
    description: "Get fee estimates",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  
  // Financial Modules
  {
    name: "finances",
    displayName: "Finances API",
    versions: [
      { version: "2024-06-19", default: true },
      { version: "v0", deprecated: false }
    ],
    description: "Get financial information",
    rateLimit: {
      restoreRatePerSecond: 0.25,
      burstCapacity: 5,
      maximumRequestQuota: 100
    }
  },
  {
    name: "invoices",
    displayName: "Invoices API",
    versions: [
      { version: "2024-06-19", default: true }
    ],
    description: "Manage invoices",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "shipmentInvoicing",
    displayName: "Shipment Invoicing API",
    versions: [
      { version: "v0", default: true }
    ],
    description: "Manage shipment invoices",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  
  // Data & Reporting Modules
  {
    name: "reports",
    displayName: "Reports API",
    versions: [
      { version: "2021-06-30", default: true }
    ],
    description: "Create and manage reports",
    rateLimit: {
      restoreRatePerSecond: 0.0083, // 1 req every 2 minutes
      burstCapacity: 2,
      maximumRequestQuota: 60 // Daily quota
    }
  },
  {
    name: "feeds",
    displayName: "Feeds API",
    versions: [
      { version: "2021-06-30", default: true }
    ],
    description: "Submit and manage data feeds",
    rateLimit: {
      restoreRatePerSecond: 0.0083, // 1 req every 2 minutes
      burstCapacity: 2,
      maximumRequestQuota: 60 // Daily quota
    }
  },
  {
    name: "dataKiosk",
    displayName: "Data Kiosk API",
    versions: [
      { version: "2023-11-15", default: true }
    ],
    description: "Access and analyze business data",
    rateLimit: {
      restoreRatePerSecond: 0.0333, // 1 req every 30 seconds
      burstCapacity: 5,
      maximumRequestQuota: 100
    }
  },
  {
    name: "sales",
    displayName: "Sales API",
    versions: [
      { version: "v1", default: true }
    ],
    description: "Get sales insights and metrics",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  
  // Communication & Marketing Modules
  {
    name: "messaging",
    displayName: "Messaging API",
    versions: [
      { version: "v1", default: true }
    ],
    description: "Send messages to buyers",
    rateLimit: {
      restoreRatePerSecond: 0.1,
      burstCapacity: 5,
      maximumRequestQuota: 100
    }
  },
  {
    name: "solicitations",
    displayName: "Solicitations API",
    versions: [
      { version: "v1", default: true }
    ],
    description: "Request reviews and feedback",
    rateLimit: {
      restoreRatePerSecond: 0.05,
      burstCapacity: 5,
      maximumRequestQuota: 75
    }
  },
  {
    name: "notifications",
    displayName: "Notifications API",
    versions: [
      { version: "v1", default: true }
    ],
    description: "Subscribe to notifications",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  
  // Account & Authorization Modules
  {
    name: "sellers",
    displayName: "Sellers API",
    versions: [
      { version: "v1", default: true }
    ],
    description: "Get information about the seller account",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "applicationIntegrations",
    displayName: "Application Integrations API",
    versions: [
      { version: "2024-04-01", default: true }
    ],
    description: "Manage application integrations",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "applicationManagement",
    displayName: "Application Management API",
    versions: [
      { version: "2023-11-30", default: true }
    ],
    description: "Manage application configuration",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "tokens",
    displayName: "Tokens API",
    versions: [
      { version: "2021-03-01", default: true }
    ],
    description: "Manage restricted data tokens",
    rateLimit: {
      restoreRatePerSecond: 0.1,
      burstCapacity: 5,
      maximumRequestQuota: 100
    }
  },
  {
    name: "authorization",
    displayName: "Authorization API",
    versions: [
      { version: "v1", default: true }
    ],
    description: "Manage authorization",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  },
  {
    name: "uploads",
    displayName: "Uploads API",
    versions: [
      { version: "2020-11-01", default: true }
    ],
    description: "Upload files",
    rateLimit: {
      restoreRatePerSecond: 0.5,
      burstCapacity: 5,
      maximumRequestQuota: 200
    }
  }
];

/**
 * Get a module definition by name
 * @param name Module name
 * @returns Module definition
 */
export function getModuleDefinition(name: string): ModuleDefinition | undefined {
  return SP_API_MODULES.find((module: any) => module.name === name);
}

/**
 * Get the default version for a module
 * @param name Module name
 * @returns Default version or undefined if not found
 */
export function getDefaultModuleVersion(name: string): string | undefined {
  const module = getModuleDefinition(name);
  if (!module) return undefined;
  
  const defaultVersion = module.versions.find((v: any) => v.default === true);
  return defaultVersion?.version;
}

/**
 * Get all available module names
 * @returns Array of module names
 */
export function getAllModuleNames(): string[] {
  return SP_API_MODULES.map((module: any) => module.name);
}