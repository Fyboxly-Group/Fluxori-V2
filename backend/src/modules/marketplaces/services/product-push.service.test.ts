import { ProductPushService } from './product-push.service';
import { MarketplaceAdapterFactory } from '../adapters/marketplace-adapter.factory';
import { MarketplaceCredentialsService } from './marketplace-credentials.service';
import { ApiError } from '../../../middleware/error.middleware';
import { IMarketplaceAdapter } from '../adapters/interfaces/marketplace-adapter.interface';

// Mock the dependencies
jest.mock('../adapters/marketplace-adapter.factory');
jest.mock('./marketplace-credentials.service');

describe('ProductPushService', () => {
  let service: ProductPushService;
  let mockAdapterFactory: jest.Mocked<MarketplaceAdapterFactory>;
  let mockCredentialsService: jest.Mocked<MarketplaceCredentialsService>;
  let mockTakealotAdapter: jest.Mocked<IMarketplaceAdapter>;
  let mockAmazonAdapter: jest.Mocked<IMarketplaceAdapter>;
  let mockShopifyAdapter: jest.Mocked<IMarketplaceAdapter>;
  
  beforeEach(() => {
    // Reset the singleton instance before each test
    (ProductPushService as any).instance = undefined;
    
    // Create mock adapters for each marketplace
    mockTakealotAdapter = {
      marketplaceId: 'takealot',
      marketplaceName: 'Takealot',
      initialize: jest.fn(),
      testConnection: jest.fn(),
      getRateLimitStatus: jest.fn(),
      getProductBySku: jest.fn(),
      getProductById: jest.fn(),
      getProductsBySkus: jest.fn(),
      getProducts: jest.fn(),
      updateStock: jest.fn().mockResolvedValue({
        success: true,
        data: { successful: ['SKU-123'], failed: [] }
      }),
      updatePrices: jest.fn().mockResolvedValue({
        success: true,
        data: { successful: ['SKU-123'], failed: [] }
      }),
      updateStatus: jest.fn().mockResolvedValue({
        success: true,
        data: { successful: ['SKU-123'], failed: [] }
      }),
      getOrders: jest.fn(),
      getRecentOrders: jest.fn(),
      getOrderById: jest.fn(),
      acknowledgeOrder: jest.fn(),
      updateOrderStatus: jest.fn(),
      getCategories: jest.fn(),
      getCategoryAttributes: jest.fn(),
      getMarketplaceHealth: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<IMarketplaceAdapter>;
    
    mockAmazonAdapter = {
      marketplaceId: 'amazon',
      marketplaceName: 'Amazon',
      initialize: jest.fn(),
      testConnection: jest.fn(),
      getRateLimitStatus: jest.fn(),
      getProductBySku: jest.fn(),
      getProductById: jest.fn(),
      getProductsBySkus: jest.fn(),
      getProducts: jest.fn(),
      updateStock: jest.fn().mockResolvedValue({
        success: true,
        data: { successful: ['SKU-123'], failed: [] }
      }),
      updatePrices: jest.fn().mockResolvedValue({
        success: true,
        data: { successful: ['SKU-123'], failed: [] }
      }),
      updateStatus: jest.fn().mockResolvedValue({
        success: true,
        data: { successful: ['SKU-123'], failed: [] }
      }),
      getOrders: jest.fn(),
      getRecentOrders: jest.fn(),
      getOrderById: jest.fn(),
      acknowledgeOrder: jest.fn(),
      updateOrderStatus: jest.fn(),
      getCategories: jest.fn(),
      getCategoryAttributes: jest.fn(),
      getMarketplaceHealth: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<IMarketplaceAdapter>;
    
    mockShopifyAdapter = {
      marketplaceId: 'shopify',
      marketplaceName: 'Shopify',
      initialize: jest.fn(),
      testConnection: jest.fn(),
      getRateLimitStatus: jest.fn(),
      getProductBySku: jest.fn(),
      getProductById: jest.fn(),
      getProductsBySkus: jest.fn(),
      getProducts: jest.fn(),
      updateStock: jest.fn().mockResolvedValue({
        success: true,
        data: { successful: ['SKU-123'], failed: [] }
      }),
      updatePrices: jest.fn().mockResolvedValue({
        success: true,
        data: { successful: ['SKU-123'], failed: [] }
      }),
      updateStatus: jest.fn().mockResolvedValue({
        success: true,
        data: { successful: ['SKU-123'], failed: [] }
      }),
      getOrders: jest.fn(),
      getRecentOrders: jest.fn(),
      getOrderById: jest.fn(),
      acknowledgeOrder: jest.fn(),
      updateOrderStatus: jest.fn(),
      getCategories: jest.fn(),
      getCategoryAttributes: jest.fn(),
      getMarketplaceHealth: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<IMarketplaceAdapter>;
    
    // Mock adapter factory to return different adapters based on marketplaceId
    mockAdapterFactory = {
      getInstance: jest.fn().mockReturnThis(),
      getAdapter: jest.fn().mockImplementation((marketplaceId, credentials) => {
        if (marketplaceId.toLowerCase() === 'takealot') {
          return Promise.resolve(mockTakealotAdapter);
        } else if (marketplaceId.toLowerCase().startsWith('amazon')) {
          return Promise.resolve(mockAmazonAdapter);
        } else if (marketplaceId.toLowerCase().startsWith('shopify')) {
          return Promise.resolve(mockShopifyAdapter);
        } else {
          throw new ApiError(404, `Marketplace ${marketplaceId} is not supported`);
        }
      }),
      clearAdapterInstances: jest.fn(),
    } as unknown as jest.Mocked<MarketplaceAdapterFactory>;
    
    // Mock credentials service
    mockCredentialsService = {
      getInstance: jest.fn().mockReturnThis(),
      getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key' }),
      storeCredentials: jest.fn(),
      deleteCredentials: jest.fn(),
      hasCredentials: jest.fn(),
    } as unknown as jest.Mocked<MarketplaceCredentialsService>;
    
    // Set up the mock implementations
    (MarketplaceAdapterFactory.getInstance as jest.Mock).mockReturnValue(mockAdapterFactory);
    (MarketplaceCredentialsService.getInstance as jest.Mock).mockReturnValue(mockCredentialsService);
    
    // Get the service instance
    service = ProductPushService.getInstance();
  });
  
  it('should be a singleton', () => {
    const instance1 = ProductPushService.getInstance();
    const instance2 = ProductPushService.getInstance();
    
    expect(instance1).toBe(instance2);
  });
  
  it('should push price updates to Takealot marketplace', async () => {
    const result = await service.pushProductUpdate(
      '123',
      'takealot',
      'user123',
      { price: 99.99 }
    );
    
    // Verify credentials were retrieved
    expect(mockCredentialsService.getCredentials).toHaveBeenCalledWith('user123', 'takealot');
    
    // Verify adapter was retrieved
    expect(mockAdapterFactory.getAdapter).toHaveBeenCalledWith('takealot', { apiKey: 'test-key' });
    
    // Verify price update was called on the correct adapter
    expect(mockTakealotAdapter.updatePrices).toHaveBeenCalledWith([{
      sku: 'SKU-123',
      price: 99.99
    }]);
    
    // Verify response
    expect(result.success).toBe(true);
    expect(result.marketplaceId).toBe('takealot');
    expect(result.productId).toBe('123');
    expect(result.details).toHaveProperty('fields', ['price']);
  });
  
  it('should push stock updates to Amazon marketplace', async () => {
    const result = await service.pushProductUpdate(
      '123',
      'amazon_us',
      'user123',
      { stock: 42 }
    );
    
    // Verify credentials were retrieved for the correct marketplace
    expect(mockCredentialsService.getCredentials).toHaveBeenCalledWith('user123', 'amazon_us');
    
    // Verify adapter was retrieved for the correct marketplace
    expect(mockAdapterFactory.getAdapter).toHaveBeenCalledWith('amazon_us', { apiKey: 'test-key' });
    
    // Verify stock update was called on the Amazon adapter
    expect(mockAmazonAdapter.updateStock).toHaveBeenCalledWith([{
      sku: 'SKU-123',
      quantity: 42
    }]);
    
    // Verify response
    expect(result.success).toBe(true);
    expect(result.marketplaceId).toBe('amazon_us');
    expect(result.productId).toBe('123');
    expect(result.details).toHaveProperty('fields', ['stock']);
  });
  
  it('should push status updates to Shopify marketplace', async () => {
    const result = await service.pushProductUpdate(
      '123',
      'shopify',
      'user123',
      { status: 'inactive' }
    );
    
    // Verify credentials were retrieved for the correct marketplace
    expect(mockCredentialsService.getCredentials).toHaveBeenCalledWith('user123', 'shopify');
    
    // Verify adapter was retrieved for the correct marketplace
    expect(mockAdapterFactory.getAdapter).toHaveBeenCalledWith('shopify', { apiKey: 'test-key' });
    
    // Verify status update was called on the Shopify adapter
    expect(mockShopifyAdapter.updateStatus).toHaveBeenCalledWith([{
      sku: 'SKU-123',
      status: 'inactive'
    }]);
    
    // Verify response
    expect(result.success).toBe(true);
    expect(result.marketplaceId).toBe('shopify');
    expect(result.productId).toBe('123');
    expect(result.details).toHaveProperty('fields', ['status']);
  });
  
  it('should handle multiple updates simultaneously', async () => {
    const result = await service.pushProductUpdate(
      '123',
      'takealot',
      'user123',
      { 
        price: 99.99,
        stock: 42,
        status: 'active'
      }
    );
    
    // Verify all adapter methods were called on the correct adapter
    expect(mockTakealotAdapter.updatePrices).toHaveBeenCalled();
    expect(mockTakealotAdapter.updateStock).toHaveBeenCalled();
    expect(mockTakealotAdapter.updateStatus).toHaveBeenCalled();
    
    // Verify no other adapters were used
    expect(mockAmazonAdapter.updatePrices).not.toHaveBeenCalled();
    expect(mockShopifyAdapter.updatePrices).not.toHaveBeenCalled();
    
    // Verify response
    expect(result.success).toBe(true);
    expect(result.details).toHaveProperty('fields', ['price', 'stock', 'status']);
  });
  
  it('should handle RRP (recommended retail price) correctly', async () => {
    await service.pushProductUpdate(
      '123',
      'takealot',
      'user123',
      { 
        price: 79.99,
        rrp: 99.99
      }
    );
    
    // Verify price update includes RRP logic
    expect(mockTakealotAdapter.updatePrices).toHaveBeenCalledWith([{
      sku: 'SKU-123',
      price: 99.99,  // RRP becomes the regular price
      salePrice: 79.99  // Original price becomes the sale price
    }]);
  });
  
  it('should handle adapter failures', async () => {
    // Mock adapter method to fail
    mockTakealotAdapter.updatePrices.mockResolvedValueOnce({
      success: false,
      error: { message: 'API rate limit exceeded' },
      data: { successful: [], failed: [{ sku: 'SKU-123', reason: 'Rate limit exceeded' }] }
    });
    
    const result = await service.pushProductUpdate(
      '123',
      'takealot',
      'user123',
      { price: 99.99 }
    );
    
    // Verify response indicates failure
    expect(result.success).toBe(false);
    expect(result.message).toContain('Some updates failed');
  });
  
  it('should handle credentials not found error', async () => {
    // Mock credentials service to throw error
    mockCredentialsService.getCredentials.mockRejectedValueOnce(
      new ApiError(404, 'No credentials found for marketplace takealot')
    );
    
    await expect(service.pushProductUpdate(
      '123',
      'takealot',
      'user123',
      { price: 99.99 }
    )).rejects.toThrow(ApiError);
  });
  
  it('should handle unsupported marketplace error', async () => {
    // Mock adapter factory to throw error for unsupported marketplace
    mockAdapterFactory.getAdapter.mockImplementation((marketplaceId, credentials) => {
      if (marketplaceId === 'unsupported-marketplace') {
        return Promise.reject(new ApiError(404, 'Marketplace unsupported-marketplace is not supported'));
      }
      return Promise.resolve(mockTakealotAdapter);
    });
    
    await expect(service.pushProductUpdate(
      '123',
      'unsupported-marketplace',
      'user123',
      { price: 99.99 }
    )).rejects.toThrow(ApiError);
  });
});