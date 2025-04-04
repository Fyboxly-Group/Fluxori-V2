import '../../../types/declarations/shopify-api';
import { ShopifyAdapter } from './shopify-adapter';
import { createAdminApiClient } from '@shopify/admin-api-client';
import { ProductStatus } from '../../models/marketplace.models';

// Mock the Shopify API client
jest.mock('@shopify/admin-api-client', () => ({
  createAdminApiClient: jest.fn(() => ({
    request: jest.fn()
  }))
}));

describe('ShopifyAdapter', () => {
  let adapter: ShopifyAdapter;
  const mockedClient = createAdminApiClient as jest.Mock;
  let mockRequest: jest.Mock;

  beforeEach(() => {
    // Reset and setup mocks
    jest.clearAllMocks();
    mockRequest = jest.fn();
    mockedClient.mockReturnValue({
      request: mockRequest
    });
    
    // Create a new adapter instance
    adapter = new ShopifyAdapter();
  });

  describe('initialize', () => {
    it('should initialize the adapter with valid credentials', async () => {
      // Arrange
      const credentials = {
        shop: 'test-shop.myshopify.com',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        accessToken: 'test-token'
      };
      
      // Mock successful connection test
      mockRequest.mockResolvedValueOnce({
        shop: {
          id: '12345',
          name: 'Test Shop'
        }
      });
      
      // Act
      await adapter.initialize(credentials);
      
      // Assert
      expect(mockedClient).toHaveBeenCalledWith({
        apiVersion: expect.any(String),
        accessToken: credentials.accessToken,
        apiKey: credentials.apiKey,
        apiSecretKey: credentials.apiSecret,
        hostName: credentials.shop
      });
      expect(adapter['credentials']).toEqual(credentials);
    });
    
    it('should throw an error if connection test fails', async () => {
      // Arrange
      const credentials = {
        shop: 'test-shop.myshopify.com',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        accessToken: 'test-token'
      };
      
      // Mock failed connection test
      mockRequest.mockRejectedValueOnce(new Error('API error'));
      
      // Act & Assert
      await expect(adapter.initialize(credentials)).rejects.toThrow();
    });
  });
  
  describe('testConnection', () => {
    it('should return connected true if API call succeeds', async () => {
      // Arrange
      adapter['credentials'] = {
        shop: 'test-shop.myshopify.com',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        accessToken: 'test-token'
      };
      
      mockRequest.mockResolvedValueOnce({
        shop: { id: '12345', name: 'Test Shop' }
      });
      
      // Act
      const result = await adapter.testConnection();
      
      // Assert
      expect(result.connected).toBe(true);
      expect(result.message).toEqual('Connected to Shopify: Test Shop');
    });
    
    it('should return connected false if API call fails', async () => {
      // Arrange
      adapter['credentials'] = {
        shop: 'test-shop.myshopify.com',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        accessToken: 'test-token'
      };
      
      mockRequest.mockRejectedValueOnce(new Error('API error'));
      
      // Act
      const result = await adapter.testConnection();
      
      // Assert
      expect(result.connected).toBe(false);
      expect(result.message).toContain('API error');
    });
  });
  
  describe('getProductBySku', () => {
    it('should return a product that matches the SKU', async () => {
      // Arrange
      adapter['credentials'] = {
        shop: 'test-shop.myshopify.com',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        accessToken: 'test-token'
      };
      
      const mockSku = 'TEST-SKU-123';
      const mockVariant = {
        id: 123456,
        sku: mockSku,
        price: '19.99',
        inventory_item_id: 789012
      };
      
      const mockProduct = {
        id: 987654,
        title: 'Test Product',
        body_html: '<p>Test description</p>',
        vendor: 'Test Vendor',
        product_type: 'Test Type',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        handle: 'test-product',
        variants: [mockVariant],
        images: [{ 
          id: 1,
          src: 'https://example.com/image.jpg',
          variant_ids: [123456],
          width: 800,
          height: 600
        }],
        status: 'active'
      };
      
      // Mock successful search
      mockRequest.mockResolvedValueOnce({
        products: [mockProduct]
      });
      
      // Act
      const result = await adapter.getProductBySku(mockSku);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.sku).toBe(mockSku);
        expect(result.data.name).toBe('Test Product');
        expect(result.data.status).toBe(ProductStatus.ACTIVE);
      }
    });
    
    it('should return an error if product with SKU is not found', async () => {
      // Arrange
      adapter['credentials'] = {
        shop: 'test-shop.myshopify.com',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        accessToken: 'test-token'
      };
      
      const mockSku = 'NONEXISTENT-SKU';
      
      // Mock empty search results
      mockRequest.mockResolvedValueOnce({
        products: []
      });
      
      // Act
      const result = await adapter.getProductBySku(mockSku);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      if (!result.success && result.error) {
        expect(result.error.message).toContain('Product not found with SKU');
      }
    });
  });
});