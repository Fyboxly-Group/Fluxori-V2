import { productIngestionService, productSyncConfigService } from '../index';
import { productMapperRegistry } from '../mappers';
import Product from '../models/product.model';
import ProductSyncConfig, { SyncDirection } from '../models/product-sync-config.model';
import Warehouse from '../models/warehouse.model';
import { MarketplaceProduct, ProductStatus } from '../../marketplaces/models/marketplace.models';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../models/product.model');
jest.mock('../models/product-sync-config.model');
jest.mock('../models/warehouse.model');
jest.mock('../../../utils/logger');

describe('ProductIngestionService', () => {
  // Sample data for tests
  const userId = '60d5ec8c67d0d7e8f42a0000';
  const organizationId = '60d5ec8c67d0d7e8f42a0001';
  const marketplaceId = 'shopify';
  const defaultWarehouseId = '60d5ec8c67d0d7e8f42a0002';
  
  // Mock Shopify product data
  const mockShopifyProduct: MarketplaceProduct = {
    id: 'shop_123',
    sku: 'PROD-001',
    title: 'Test Product',
    description: 'Test product description',
    images: ['https://example.com/image.jpg'],
    price: 19.99,
    currencyCode: 'USD',
    stockLevel: 25,
    status: ProductStatus.ACTIVE,
    createdAt: new Date('2023-01-15T12:00:00Z'),
    updatedAt: new Date('2023-01-15T12:00:00Z'),
    marketplaceId: 'shopify',
    metadata: {
      vendor: 'Test Vendor',
      productType: 'Test Category',
      handle: 'test-product',
      shopDomain: 'test-shop.myshopify.com'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mongoose
    (mongoose.startSession as jest.Mock).mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(true),
      abortTransaction: jest.fn().mockResolvedValue(true),
      endSession: jest.fn()
    });
    
    // Mock Product.findOne
    (Product.findOne as jest.Mock).mockReturnValue({
      session: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null)
    });
    
    // Mock Product constructor and save
    (Product as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        _id: 'new_product_id',
        sku: mockShopifyProduct.sku,
        save: jest.fn().mockResolvedValue(true),
        logConflict: jest.fn().mockResolvedValue(true),
        updateStock: jest.fn().mockResolvedValue(true),
        addMarketplaceReference: jest.fn().mockResolvedValue(true)
      })
    }));
    
    // Mock ProductSyncConfig.findOne
    (ProductSyncConfig.findOne as jest.Mock).mockResolvedValue({
      createProducts: true,
      stockSync: {
        direction: SyncDirection.FROM_MARKETPLACE
      },
      priceSync: {
        direction: SyncDirection.NONE
      },
      productDataSync: {
        direction: SyncDirection.NONE
      },
      logConflicts: true
    });
    
    // Mock Warehouse.findOne
    (Warehouse.findOne as jest.Mock).mockResolvedValue({
      _id: defaultWarehouseId,
      name: 'Default Warehouse',
      code: 'DEFAULT',
      isDefault: true,
      isActive: true
    });
  });

  describe('processProducts', () => {
    it('should process and create new products', async () => {
      // Setup
      const products = [mockShopifyProduct];
      
      // Execute
      await productIngestionService.processProducts(products, userId, organizationId, marketplaceId);
      
      // Verify
      expect(Product).toHaveBeenCalled();
      expect(Product.findOne).toHaveBeenCalled();
      expect(ProductSyncConfig.findOne).toHaveBeenCalled();
    });

    it('should handle empty products array', async () => {
      // Setup
      const products: MarketplaceProduct[] = [];
      
      // Execute
      await productIngestionService.processProducts(products, userId, organizationId, marketplaceId);
      
      // Verify
      expect(Product).not.toHaveBeenCalled();
      expect(Product.findOne).not.toHaveBeenCalled();
    });
  });

  describe('ingestProducts', () => {
    it('should handle unsupported marketplaces', async () => {
      // Setup
      jest.spyOn(productMapperRegistry, 'hasMapper').mockReturnValue(false);
      
      // Execute
      const result = await productIngestionService.ingestProducts(
        'unsupported_marketplace',
        userId,
        organizationId,
        [mockShopifyProduct]
      );
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(Product).not.toHaveBeenCalled();
    });

    it('should update existing products if they exist', async () => {
      // Setup
      const existingProduct = {
        _id: 'existing_product_id',
        sku: mockShopifyProduct.sku,
        name: 'Existing Product',
        basePrice: 24.99,
        status: 'active',
        stockLevels: [],
        marketplaceReferences: [],
        save: jest.fn().mockResolvedValue(true),
        logConflict: jest.fn().mockResolvedValue(true),
        updateStock: jest.fn().mockResolvedValue(true),
        addMarketplaceReference: jest.fn().mockResolvedValue(true)
      };
      
      (Product.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingProduct)
      });
      
      // Execute
      const result = await productIngestionService.ingestProducts(
        marketplaceId,
        userId,
        organizationId,
        [mockShopifyProduct]
      );
      
      // Verify
      expect(result.success).toBe(true);
      expect(existingProduct.updateStock).toHaveBeenCalled();
      expect(existingProduct.addMarketplaceReference).toHaveBeenCalled();
      expect(existingProduct.save).toHaveBeenCalled();
    });

    it('should skip creating new products if not configured to do so', async () => {
      // Setup
      (ProductSyncConfig.findOne as jest.Mock).mockResolvedValue({
        createProducts: false,
        stockSync: {
          direction: SyncDirection.FROM_MARKETPLACE
        },
        priceSync: {
          direction: SyncDirection.NONE
        },
        productDataSync: {
          direction: SyncDirection.NONE
        },
        logConflicts: true
      });
      
      // Execute
      const result = await productIngestionService.ingestProducts(
        marketplaceId,
        userId,
        organizationId,
        [mockShopifyProduct]
      );
      
      // Verify
      expect(result.productsSkipped).toBe(1);
      expect(Product).not.toHaveBeenCalled();
    });
  });

  describe('Warehouse Handling', () => {
    it('should use the default warehouse when no specific warehouse is configured', async () => {
      // Execute
      await productIngestionService.processProducts(
        [mockShopifyProduct],
        userId,
        organizationId,
        marketplaceId
      );
      
      // Verify
      expect(Warehouse.findOne).toHaveBeenCalled();
    });

    it('should create a default warehouse if none exists', async () => {
      // Setup
      (Warehouse.findOne as jest.Mock).mockResolvedValueOnce(null);
      (Warehouse as jest.Mock).mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue({
          _id: defaultWarehouseId,
          name: 'Default Warehouse',
          code: 'DEFAULT',
          isDefault: true,
          isActive: true
        })
      }));
      
      // Execute
      await productSyncConfigService.getDefaultWarehouseId(userId, organizationId);
      
      // Verify
      expect(Warehouse).toHaveBeenCalled();
    });
  });

  describe('Conflict Logging', () => {
    it('should log conflicts when configured', async () => {
      // Setup
      const existingProduct = {
        _id: 'existing_product_id',
        sku: mockShopifyProduct.sku,
        name: 'Different Name',
        basePrice: 24.99,
        status: 'active',
        stockLevels: [],
        marketplaceReferences: [],
        conflicts: [],
        save: jest.fn().mockResolvedValue(true),
        logConflict: jest.fn().mockResolvedValue(true),
        updateStock: jest.fn().mockResolvedValue(true),
        addMarketplaceReference: jest.fn().mockResolvedValue(true)
      };
      
      (Product.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingProduct)
      });
      
      // Mock the mapper to return differences
      jest.spyOn(productMapperRegistry, 'getMapper').mockReturnValue({
        mapToFluxoriProduct: jest.fn().mockReturnValue({
          name: mockShopifyProduct.title,
          basePrice: mockShopifyProduct.price,
          marketplaceReferences: [{
            marketplaceId: 'shopify',
            marketplaceProductId: mockShopifyProduct.id
          }]
        }),
        getWarehouseId: jest.fn().mockReturnValue(defaultWarehouseId),
        findDifferences: jest.fn().mockReturnValue([
          {
            field: 'name',
            fluxoriValue: 'Different Name',
            marketplaceValue: mockShopifyProduct.title
          },
          {
            field: 'price',
            fluxoriValue: 24.99,
            marketplaceValue: mockShopifyProduct.price
          }
        ])
      });
      
      // Execute
      const result = await productIngestionService.ingestProducts(
        marketplaceId,
        userId,
        organizationId,
        [mockShopifyProduct]
      );
      
      // Verify
      expect(existingProduct.logConflict).toHaveBeenCalledTimes(2);
      expect(result.conflicts).toBe(2);
    });
  });
});