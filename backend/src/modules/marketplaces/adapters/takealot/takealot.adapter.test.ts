import { TakealotAdapter } from './takealot.adapter';
import { MarketplaceCredentials, ProductStatus } from '../../models/marketplace.models';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => {
  return {
    create: jest.fn().mockReturnValue({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      },
      get: jest.fn(),
      put: jest.fn(),
      post: jest.fn(),
      delete: jest.fn()
    }),
    defaults: { baseURL: '' }
  };
});

describe('TakealotAdapter', () => {
  let adapter: TakealotAdapter;
  let mockAxiosInstance: any;
  
  // Sample credentials for testing
  const testCredentials: MarketplaceCredentials = {
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    sellerId: 'test-seller-id'
  };
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create adapter instance
    adapter = new TakealotAdapter();
    
    // Get the mock axios instance
    mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
    
    // Set up successful response for initialization test
    mockAxiosInstance.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        code: 200,
        message: 'Connected to Takealot API',
        data: { sellerId: 'test-seller-id' }
      },
      headers: {
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': '99',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600)
      }
    });
  });

  describe('initialize', () => {
    it('should initialize with valid credentials', async () => {
      // Initialize adapter
      await adapter.initialize(testCredentials);
      
      // Check if the API client was created with correct URL
      expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
        baseURL: expect.stringContaining('seller-api.takealot.com'),
        timeout: expect.any(Number)
      }));
      
      // Check if the adapter made a test connection
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/seller', expect.any(Object));
    });
    
    it('should throw error if no API key provided', async () => {
      // Attempt to initialize with invalid credentials
      await expect(adapter.initialize({ apiSecret: 'secret' }))
        .rejects.toThrow('Takealot adapter requires an API key');
    });
    
    it('should throw error if connection test fails', async () => {
      // Mock a failed connection test
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Connection failed'));
      
      // Attempt to initialize
      await expect(adapter.initialize(testCredentials))
        .rejects.toThrow('Failed to connect to Takealot API');
    });
  });

  describe('getProductBySku', () => {
    beforeEach(async () => {
      // Initialize adapter before tests
      await adapter.initialize(testCredentials);
      
      // Reset mock for next tests
      mockAxiosInstance.get.mockReset();
    });
    
    it('should fetch a product by SKU', async () => {
      // Mock response for getProductBySku
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          status: 'success',
          code: 200,
          data: [
            {
              offer_id: 'offer123',
              tsin: 'TSIN123',
              sku: 'TEST-SKU-123',
              title: 'Test Product',
              description: 'Test Description',
              status: 'active',
              selling_price: 299.99,
              rrp: 349.99,
              leadtime_stock: 10,
              stock_at_takealot: 5,
              stock_on_hand: 15,
              fulfillment_type: 'MP',
              images: [
                { url: 'https://test.com/image1.jpg', is_primary: true },
                { url: 'https://test.com/image2.jpg', is_primary: false }
              ],
              category: {
                id: 'cat123',
                name: 'Test Category',
                path: ['Electronics', 'Test Category']
              },
              attributes: [
                { name: 'Color', value: 'Black' },
                { name: 'Size', value: 'Medium' }
              ],
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-02T00:00:00Z'
            }
          ]
        }
      });
      
      // Call method
      const result = await adapter.getProductBySku('TEST-SKU-123');
      
      // Verify API call
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/offers',
        expect.objectContaining({
          params: { sku: 'TEST-SKU-123' }
        })
      );
      
      // Verify result
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      if (result.data) {
        expect(result.data.id).toBe('offer123');
        expect(result.data.sku).toBe('TEST-SKU-123');
        expect(result.data.title).toBe('Test Product');
        expect(result.data.price).toBe(299.99);
        expect(result.data.status).toBe(ProductStatus.ACTIVE);
        expect(result.data.images).toHaveLength(2);
        expect(result.data.images[0]).toBe('https://test.com/image1.jpg');
        expect(result.data.marketplaceId).toBe('takealot');
        expect(result.data.marketplaceSku).toBe('TSIN123');
      }
    });
    
    it('should handle product not found', async () => {
      // Mock empty response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          status: 'success',
          code: 200,
          data: []
        }
      });
      
      // Call method
      const result = await adapter.getProductBySku('NONEXISTENT-SKU');
      
      // Verify result
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('PRODUCT_NOT_FOUND');
    });
    
    it('should handle API errors', async () => {
      // Mock API error
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            status: 'error',
            code: 400,
            message: 'Invalid request'
          }
        }
      });
      
      // Call method
      const result = await adapter.getProductBySku('TEST-SKU-123');
      
      // Verify result
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('400_ERROR');
    });
  });

  // Add more test cases for other methods
  // This is a basic test suite to demonstrate the approach
});

// Helper function to mock a successful API response
function mockSuccessResponse(data: any) {
  return {
    data: {
      status: 'success',
      code: 200,
      data
    }
  };
}