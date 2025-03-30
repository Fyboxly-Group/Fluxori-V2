/**
 * Amazon Module Registry Helper
 * 
 * Provides utility functions to simplify working with the module registry
 * and initializing API modules.
 */

import { ModuleRegistry } from './module-registry';
import { getDefaultModuleVersion } from './module-definitions';

// Import module factories
import { CatalogModuleFactory } from '../catalog';
import { OrdersModuleFactory } from '../orders';
import { FbaInventoryModuleFactory } from '../inventory/fba';
import { FbaSmallAndLightModuleFactory } from '../inventory/fba-small-light';
import { FbaInboundEligibilityModuleFactory } from '../inventory/fba-inbound-eligibility';
import { WarehousingModuleFactory } from '../warehousing';
import { SupplySourceModuleFactory } from '../supply-source';
import { ReplenishmentModuleFactory } from '../replenishment';
import { ProductPricingModuleFactory } from '../pricing';
import { ListingsModuleFactory } from '../listings';
import { ReportsModuleFactory } from '../reports';
import { FeedsModuleFactory } from '../feeds';
import { DataKioskModuleFactory } from '../data-kiosk';
import { SalesModuleFactory } from '../sales';
import { FinancesModuleFactory } from '../finances';
import { InvoicesModuleFactory } from '../finances/invoices';
import { ShipmentInvoicingModuleFactory } from '../finances/shipment-invoicing';
import { NotificationsModuleFactory } from '../notifications';
import { SellersModuleFactory } from '../sellers';
import { MessagingModuleFactory } from '../messaging';
import { SolicitationsModuleFactory } from '../solicitations';
import { VendorsModuleFactory } from '../vendors';
import { TokensModuleFactory } from '../tokens';
import { UploadsModuleFactory } from '../uploads';
import { AuthorizationModuleFactory } from '../authorization';
import { B2BModuleFactory } from '../b2b';
import { BrandProtectionModuleFactory } from '../brand-protection';
import { ProductFeesModuleFactory } from '../fees';
import { ProductTypeModuleFactory } from '../product-types';
import { FulfillmentInboundModuleFactory } from '../fulfillment/inbound';
import { FulfillmentOutboundModuleFactory } from '../fulfillment/outbound';
import { MerchantFulfillmentModuleFactory } from '../fulfillment/merchant';
import { EasyShipModuleFactory } from '../easyship';
import { ApplicationManagementModuleFactory, ApplicationIntegrationsModuleFactory } from '../application';
import { APlusContentModuleFactory } from '../aplus';
import { RestrictionsModuleFactory } from '../restrictions';

/**
 * Helper for working with the Amazon SP-API module registry
 */
export class RegistryHelper {
  /**
   * Create and initialize a registry with the most commonly used API modules
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @returns Initialized module registry
   */
  public static async createCommonModulesRegistry(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string
  ): Promise<ModuleRegistry> {
    const registry = new ModuleRegistry();
    
    // Create catalog modules
    CatalogModuleFactory.createCatalogItemsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create order modules
    OrdersModuleFactory.createOrdersModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create inventory modules
    FbaInventoryModuleFactory.createFbaInventoryModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create pricing modules
    ProductPricingModuleFactory.createProductPricingModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create listings modules
    ListingsModuleFactory.createListingsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create reports modules
    ReportsModuleFactory.createReportsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create feeds modules
    FeedsModuleFactory.createFeedsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Initialize all modules
    await registry.initializeAllModules();
    
    return registry;
  }
  
  /**
   * Create and initialize a registry with all available API modules
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @returns Initialized module registry
   */
  public static async createAllModulesRegistry(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string
  ): Promise<ModuleRegistry> {
    const registry = new ModuleRegistry();
    
    // Create catalog modules
    CatalogModuleFactory.createCatalogItemsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    ProductTypeModuleFactory.createProductTypeDefinitionsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create A+ content module
    APlusContentModuleFactory.createAPlusContentModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create order modules
    OrdersModuleFactory.createOrdersModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create inventory modules
    FbaInventoryModuleFactory.createFbaInventoryModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create FBA Small and Light module
    FbaSmallAndLightModuleFactory.createFbaSmallAndLightModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create FBA Inbound Eligibility module
    FbaInboundEligibilityModuleFactory.createFbaInboundEligibilityModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create Warehousing module
    WarehousingModuleFactory.createWarehousingModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create Supply Source module
    SupplySourceModuleFactory.createSupplySourceModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create Replenishment module
    ReplenishmentModuleFactory.createReplenishmentModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create pricing modules
    ProductPricingModuleFactory.createProductPricingModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create listings modules
    ListingsModuleFactory.createListingsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create listings restrictions module
    RestrictionsModuleFactory.createListingsRestrictionsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create reports modules
    ReportsModuleFactory.createReportsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create feeds modules
    FeedsModuleFactory.createFeedsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create data kiosk module
    DataKioskModuleFactory.createDataKioskModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create sales module
    SalesModuleFactory.createSalesModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create finances modules
    FinancesModuleFactory.createFinancesModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create invoices module
    InvoicesModuleFactory.createInvoicesModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create shipment invoicing module
    ShipmentInvoicingModuleFactory.createShipmentInvoicingModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create notifications modules
    NotificationsModuleFactory.createNotificationsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create sellers modules
    SellersModuleFactory.createSellersModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create messaging module
    MessagingModuleFactory.createMessagingModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create solicitations module
    SolicitationsModuleFactory.createSolicitationsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create vendors module
    VendorsModuleFactory.createVendorsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create application management module
    ApplicationManagementModuleFactory.createApplicationManagementModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create application integrations module
    ApplicationIntegrationsModuleFactory.createApplicationIntegrationsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create tokens module
    TokensModuleFactory.createTokensModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create uploads module
    UploadsModuleFactory.createUploadsModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create authorization module
    AuthorizationModuleFactory.createAuthorizationModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create B2B module
    B2BModuleFactory.createB2BModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create Brand Protection module
    BrandProtectionModuleFactory.createBrandProtectionModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create product fees modules
    ProductFeesModuleFactory.createProductFeesModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create fulfillment modules
    FulfillmentInboundModuleFactory.createFulfillmentInboundModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    FulfillmentOutboundModuleFactory.createFulfillmentOutboundModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    MerchantFulfillmentModuleFactory.createMerchantFulfillmentModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Create Easy Ship module
    EasyShipModuleFactory.createEasyShipModule(
      makeApiRequest,
      marketplaceId,
      registry
    );
    
    // Initialize all modules
    await registry.initializeAllModules();
    
    return registry;
  }
  
  /**
   * Initialize a registry with specific modules
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param moduleNames Names of modules to initialize
   * @returns Initialized module registry
   */
  public static async createCustomModulesRegistry(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    moduleNames: string[]
  ): Promise<ModuleRegistry> {
    const registry = new ModuleRegistry();
    
    // Create only the requested modules
    for (const moduleName of moduleNames) {
      switch (moduleName) {
        case 'catalogItems':
          CatalogModuleFactory.createCatalogItemsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'productTypeDefinitions':
          ProductTypeModuleFactory.createProductTypeDefinitionsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'aplus':
          APlusContentModuleFactory.createAPlusContentModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'orders':
          OrdersModuleFactory.createOrdersModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'fbaInventory':
          FbaInventoryModuleFactory.createFbaInventoryModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'fbaSmallAndLight':
          FbaSmallAndLightModuleFactory.createFbaSmallAndLightModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'fbaInboundEligibility':
          FbaInboundEligibilityModuleFactory.createFbaInboundEligibilityModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'warehouseAndDistribution':
          WarehousingModuleFactory.createWarehousingModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'supplySource':
          SupplySourceModuleFactory.createSupplySourceModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'replenishment':
          ReplenishmentModuleFactory.createReplenishmentModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'productPricing':
          ProductPricingModuleFactory.createProductPricingModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'listingsItems':
          ListingsModuleFactory.createListingsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'listingsRestrictions':
          RestrictionsModuleFactory.createListingsRestrictionsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'reports':
          ReportsModuleFactory.createReportsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'feeds':
          FeedsModuleFactory.createFeedsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'dataKiosk':
          DataKioskModuleFactory.createDataKioskModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'sales':
          SalesModuleFactory.createSalesModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'finances':
          FinancesModuleFactory.createFinancesModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'invoices':
          InvoicesModuleFactory.createInvoicesModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'shipmentInvoicing':
          ShipmentInvoicingModuleFactory.createShipmentInvoicingModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'notifications':
          NotificationsModuleFactory.createNotificationsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'sellers':
          SellersModuleFactory.createSellersModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'messaging':
          MessagingModuleFactory.createMessagingModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'solicitations':
          SolicitationsModuleFactory.createSolicitationsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'vendors':
          VendorsModuleFactory.createVendorsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'applicationManagement':
          ApplicationManagementModuleFactory.createApplicationManagementModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'applicationIntegrations':
          ApplicationIntegrationsModuleFactory.createApplicationIntegrationsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'tokens':
          TokensModuleFactory.createTokensModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'uploads':
          UploadsModuleFactory.createUploadsModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'authorization':
          AuthorizationModuleFactory.createAuthorizationModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'b2b':
          B2BModuleFactory.createB2BModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'brandProtection':
          BrandProtectionModuleFactory.createBrandProtectionModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'productFees':
          ProductFeesModuleFactory.createProductFeesModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'fulfillmentInbound':
          FulfillmentInboundModuleFactory.createFulfillmentInboundModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'fulfillmentOutbound':
          FulfillmentOutboundModuleFactory.createFulfillmentOutboundModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'merchantFulfillment':
          MerchantFulfillmentModuleFactory.createMerchantFulfillmentModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
        case 'easyShip':
          EasyShipModuleFactory.createEasyShipModule(
            makeApiRequest,
            marketplaceId,
            registry
          );
          break;
      }
    }
    
    // Initialize all modules
    await registry.initializeAllModules();
    
    return registry;
  }
  
  /**
   * Initialize a registry with a specific category of modules
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param category Category of modules to initialize
   * @returns Initialized module registry
   */
  public static async createCategoryModulesRegistry(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    category: 'catalog' | 'inventory' | 'orders' | 'pricing' | 'listings' | 'reports' | 'feeds' | 'finances' | 'account' | 'fulfillment' | 'specialized' | 'all'
  ): Promise<ModuleRegistry> {
    const registry = new ModuleRegistry();
    
    if (category === 'catalog' || category === 'all') {
      CatalogModuleFactory.createCatalogItemsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      ProductTypeModuleFactory.createProductTypeDefinitionsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      APlusContentModuleFactory.createAPlusContentModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    if (category === 'inventory' || category === 'all') {
      FbaInventoryModuleFactory.createFbaInventoryModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      FbaSmallAndLightModuleFactory.createFbaSmallAndLightModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      FbaInboundEligibilityModuleFactory.createFbaInboundEligibilityModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      SupplySourceModuleFactory.createSupplySourceModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      ReplenishmentModuleFactory.createReplenishmentModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    if (category === 'orders' || category === 'all') {
      OrdersModuleFactory.createOrdersModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    if (category === 'pricing' || category === 'all') {
      ProductPricingModuleFactory.createProductPricingModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      ProductFeesModuleFactory.createProductFeesModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    if (category === 'listings' || category === 'all') {
      ListingsModuleFactory.createListingsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      RestrictionsModuleFactory.createListingsRestrictionsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    if (category === 'reports' || category === 'all') {
      ReportsModuleFactory.createReportsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      DataKioskModuleFactory.createDataKioskModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      SalesModuleFactory.createSalesModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    if (category === 'feeds' || category === 'all') {
      FeedsModuleFactory.createFeedsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    if (category === 'finances' || category === 'all') {
      FinancesModuleFactory.createFinancesModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      InvoicesModuleFactory.createInvoicesModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      ShipmentInvoicingModuleFactory.createShipmentInvoicingModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    if (category === 'account' || category === 'all') {
      NotificationsModuleFactory.createNotificationsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      SellersModuleFactory.createSellersModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      MessagingModuleFactory.createMessagingModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      SolicitationsModuleFactory.createSolicitationsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      VendorsModuleFactory.createVendorsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      ApplicationManagementModuleFactory.createApplicationManagementModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      ApplicationIntegrationsModuleFactory.createApplicationIntegrationsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      TokensModuleFactory.createTokensModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      UploadsModuleFactory.createUploadsModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      AuthorizationModuleFactory.createAuthorizationModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    if (category === 'fulfillment' || category === 'all') {
      FulfillmentInboundModuleFactory.createFulfillmentInboundModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      FulfillmentOutboundModuleFactory.createFulfillmentOutboundModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      MerchantFulfillmentModuleFactory.createMerchantFulfillmentModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      EasyShipModuleFactory.createEasyShipModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    if (category === 'specialized' || category === 'all') {
      B2BModuleFactory.createB2BModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
      
      BrandProtectionModuleFactory.createBrandProtectionModule(
        makeApiRequest,
        marketplaceId,
        registry
      );
    }
    
    // Initialize all modules
    await registry.initializeAllModules();
    
    return registry;
  }
}