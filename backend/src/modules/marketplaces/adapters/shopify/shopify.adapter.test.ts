import '../../../types/declarations/shopify-api';
import { ShopifyAdapter } from './shopify.adapter';
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
      request: mockRequest;
    });
    
    // Create a new adapter instance
    adapter = new ShopifyAdapter();
  });

  describe('initialize', () => {
    it('should throw an error if shopDomain is missing', async() => {
      await expect(adapter.initialize({
        accessToken: 'test-token';
      })).rejects.toThrow('Shop domain is required for Shopify adapter');
    });

    it('should throw an error if auth credentials are missing', async() => {
      await expect(adapter.initialize({
        shopDomain: 'test-store.myshopify.com';
      })).rejects.toThrow('Either access token or API key/secret pair is required');
    });

    it('should initialize with access token', async() => {
      // Mock successful API responses
      mockRequest.mockImplementation((params: any) => {
        if(params.path === 'locations') {
          return { 
            locations: [{ id: 123, active: true, legacy: false, name: 'Test Location' }]
          };
        }
        if(params.path === 'shop') {
          return { shop: { name: 'Test Shop' } };
        }
        return {};
      });
      
      await adapter.initialize({
        shopDomain: 'test-store.myshopify.com',
        accessToken: 'test-token';
      });
      
      // Verify client created with correct params
      expect(mockedClient).toHaveBeenCalledWith({
        apiVersion: expect.any(String);,
        hostName: 'test-store.myshopify.com',
        session: {
          accessToken: 'test-token',
          apiKey: '',
          apiSecretKey: '';
        }
      });
      
      // Verify API calls
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: 'locations';
      });
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: 'shop';
      });
  });
});
  
  describe('testConnection', () => {
    beforeEach(async() => {
      // Setup successful initialization
      mockRequest.mockImplementation((params: any) => {
        if(params.path === 'locations') {
          return { 
            locations: [{ id: 123, active: true, legacy: false, name: 'Test Location' }]
          };
        }
        if(params.path === 'shop') {
          return { shop: { name: 'Test Shop' } };
        }
        return {};
      });
      
      await adapter.initialize({
        shopDomain: 'test-store.myshopify.com',
        accessToken: 'test-token';
      });
      
      // Reset for fresh test
      mockRequest.mockReset();
    });
    
    it('should return connected status when API call succeeds', async() => {
      mockRequest.mockResolvedValueOnce({ 
        shop: { name: 'Test Shop' } 
      });
      
      const result = await adapter.testConnection();
      
      expect(result.connected).toBe(true);
      expect(result.message).toContain('Successfully connected');
    });
    
    it('should return not connected status when API call fails', async() => {
      mockRequest.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await adapter.testConnection();
      
      expect(result.connected).toBe(false);
      expect(result.message).toContain('Failed to connect');
    });
  });

  describe('getProductBySku', () => {
    beforeEach(async() => {
      // Setup successful initialization
      mockRequest.mockImplementation((params: any) => {
        if(params.path === 'locations') {
          return { 
            locations: [{ id: 123, active: true, legacy: false, name: 'Test Location' }]
          };
        }
        if(params.path === 'shop') {
          return { shop: { name: 'Test Shop' } };
        }
        return {};
      });
      
      await adapter.initialize({
        shopDomain: 'test-store.myshopify.com',
        accessToken: 'test-token';
      });
      
      // Reset for fresh test
      mockRequest.mockReset();
    });
    
    it('should return product when found by SKU', async() => {
      const testSku = 'TEST-SKU-123';
      const testProduct = {
        id: 1,
        title: 'Test Product',
        body_html: '<p>Description</p>',
        vendor: 'Test Vendor',
        product_type: 'Test Type',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        published_at: '2023-01-01T00:00:00Z',
        status: 'active';,
        variants: [{
          id: 101,
          product_id: 1,
          title: 'Default',
          price: '19.99',
          sku: testSku,
          position: 1,
          inventory_policy: 'deny',
          compare_at_price: null,
          inventory_management: 'shopify',
          option1: null,
          option2: null,
          option3: null,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
          taxable: true,
          barcode: null,
          grams: 0,
          image_id: null,
          weight: 0,
          weight_unit: 'kg',
          inventory_item_id: 1001,
          inventory_quantity: 10,
          old_inventory_quantity: 10,
          requires_shipping: true,
          admin_graphql_api_id: '';
        }],
        options: [],
        images: [],
        image: null;
      };
      
      // Mock the product search by SKU
      mockRequest.mockImplementation((params: any) => {
        if(params.path === 'products' && params.query) {
          return { 
            products: [testProduct]
          };
        }
        if(params.path === `products/${testProduct.id}`) {
          return { product: testProduct };
        }
        return {};
      });
      
      const result = await adapter.getProductBySku(testSku);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if(result.data) {
        expect(result.data.sku).toBe(testSku);
        expect(result.data.title).toBe('Test Product - Default');
        expect(result.data.price).toBe(19.99);
        expect(result.data.status).toBe(ProductStatus.ACTIVE);
      }
    });
    
    it('should return error when product not found', async() => {
      const testSku = 'NONEXISTENT-SKU';
      
      // Mock the product search with no results
      mockRequest.mockResolvedValueOnce({ products: [] });
      
      const result = await adapter.getProductBySku(testSku);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      if(result.error) {
        expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
      }
    });
  });
});