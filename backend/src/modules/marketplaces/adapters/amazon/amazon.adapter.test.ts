import { AmazonAdapter } from './amazon.adapter';
import { MarketplaceCredentials, ProductStatus } from '../../models/marketplace.models';
import axios from 'axios';
import { amazonConfig } from '../../config/amazon.config';

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
      delete: jest.fn(),
      patch: jest.fn()
    }),
    post: jest.fn(),
    defaults: { baseURL: '' }
  };
});

describe('AmazonAdapter', () => {
  let adapter: AmazonAdapter;
  let mockAxiosInstance: any;
  
  // Sample credentials for testing
  const testCredentials: MarketplaceCredentials = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    refreshToken: 'test-refresh-token',
    sellerId: 'test-seller-id',
    amazonMarketplaceId: 'ATVPDKIKX0DER' // US marketplace
  };
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create adapter instance
    adapter = new AmazonAdapter();
    
    // Get the mock axios instance
    mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
    
    // Mock token refresh success
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        token_type: 'bearer',
        expires_in: 3600
      }
    });
    
    // Mock catalog status check for initialization
    mockAxiosInstance.get.mockResolvedValueOnce({
      data: {
        payload: {
          status: 'GREEN'
        }
      },
      headers: {
        'x-amzn-ratelimit-limit': '0.5',
        'x-amzn-quota-remaining': '10',
        'x-amzn-ratelimit-reset': '5'
      }
    });
  });

  describe('initialize', () => {
    it('should initialize with valid credentials', async () => {
      // Initialize adapter
      await adapter.initialize(testCredentials);
      
      // Check if the API client was created
      expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
        timeout: expect.any(Number),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': expect.any(String)
        })
      }));
      
      // Check if token was refreshed
      expect(axios.post).toHaveBeenCalledWith(
        amazonConfig.auth.tokenUrl,
        expect.any(String),
        expect.any(Object)
      );
      
      // Check if the adapter made a test connection
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `/catalog/${amazonConfig.apiVersions.catalogItems}/status`,
        expect.any(Object)
      );
    });
    
    it('should throw error if required credentials are missing', async () => {
      // Attempt to initialize with invalid credentials
      await expect(adapter.initialize({ clientId: 'client-id' }))
        .rejects.toThrow('Amazon adapter requires clientId, clientSecret, refreshToken, and sellerId');
    });
    
    it('should throw error if connection test fails', async () => {
      // Mock a failed token refresh
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Token refresh failed'));
      
      // Attempt to initialize
      await expect(adapter.initialize(testCredentials))
        .rejects.toThrow('Failed to refresh Amazon access token');
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
      // Mock responses for each API call
      
      // Inventory response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          payload: {
            inventory: {
              sku: 'TEST-SKU-123',
              asin: 'B123456789',
              condition: 'New',
              inventoryDetails: {
                fulfillmentAvailability: [
                  {
                    quantity: 10,
                    fulfillmentChannelCode: 'DEFAULT'
                  }
                ]
              }
            }
          }
        }
      });
      
      // Pricing response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          payload: {
            price: {
              sku: 'TEST-SKU-123',
              asin: 'B123456789',
              price: {
                listingPrice: {
                  amount: 29.99,
                  currencyCode: 'USD'
                }
              },
              status: 'ACTIVE'
            }
          }
        }
      });
      
      // Catalog response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          payload: {
            items: [
              {
                asin: 'B123456789',
                attributes: {
                  title: 'Test Amazon Product',
                  description: 'This is a test product description',
                  images: [
                    { link: 'https://example.com/image1.jpg' },
                    { link: 'https://example.com/image2.jpg' }
                  ]
                },
                productTypes: {
                  'PRIMARY': 'ELECTRONICS'
                }
              }
            ]
          }
        }
      });
      
      // Listing response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          payload: {
            sku: 'TEST-SKU-123',
            status: 'ACTIVE',
            marketplaceId: 'ATVPDKIKX0DER',
            asin: 'B123456789',
            productType: 'ELECTRONICS',
            createdDate: '2023-01-01T00:00:00Z',
            lastUpdatedDate: '2023-01-02T00:00:00Z'
          }
        }
      });
      
      // Call method
      const result = await adapter.getProductBySku('TEST-SKU-123');
      
      // Verify API calls
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(4);
      
      // Verify result
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      if (result.data) {
        expect(result.data.id).toBe('B123456789');
        expect(result.data.sku).toBe('TEST-SKU-123');
        expect(result.data.title).toBe('Test Amazon Product');
        expect(result.data.price).toBe(29.99);
        expect(result.data.stockLevel).toBe(10);
        expect(result.data.status).toBe(ProductStatus.ACTIVE);
        expect(result.data.images).toHaveLength(2);
        expect(result.data.images[0]).toBe('https://example.com/image1.jpg');
        expect(result.data.marketplaceId).toBe('amazon');
        expect(result.data.marketplaceSku).toBe('TEST-SKU-123');
        expect(result.data.marketplaceUrl).toContain('B123456789');
      }
    });
    
    it('should handle product not found', async () => {
      // Mock inventory response with no data
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          payload: null,
          errors: [
            {
              code: 'NOT_FOUND',
              message: 'Inventory not found for SKU'
            }
          ]
        }
      });
      
      // Call method
      const result = await adapter.getProductBySku('NONEXISTENT-SKU');
      
      // Verify result
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('INVENTORY_NOT_FOUND');
    });
    
    it('should handle API errors', async () => {
      // Mock API error
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            errors: [
              {
                code: 'InvalidInput',
                message: 'Invalid request parameters'
              }
            ]
          }
        }
      });
      
      // Call method
      const result = await adapter.getProductBySku('TEST-SKU-123');
      
      // Verify result
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('API_ERROR');
    });
  });

  describe('getRecentOrders', () => {
    beforeEach(async () => {
      // Initialize adapter before tests
      await adapter.initialize(testCredentials);
      
      // Reset mock for next tests
      mockAxiosInstance.get.mockReset();
    });
    
    it('should fetch recent orders', async () => {
      // Mock orders response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          payload: {
            Orders: [
              {
                amazonOrderId: 'ORDER123',
                sellerOrderId: null,
                purchaseDate: '2023-01-01T10:00:00Z',
                lastUpdateDate: '2023-01-01T12:00:00Z',
                orderStatus: 'Unshipped',
                fulfillmentChannel: 'MFN',
                salesChannel: 'Amazon.com',
                orderTotal: {
                  currencyCode: 'USD',
                  amount: '59.99'
                },
                numberOfItemsShipped: 0,
                numberOfItemsUnshipped: 2,
                paymentMethod: 'CreditCard',
                marketplaceId: 'ATVPDKIKX0DER',
                buyerInfo: {
                  buyerEmail: 'test@example.com',
                  buyerName: 'Test Buyer'
                },
                shippingAddress: {
                  name: 'Test Buyer',
                  addressLine1: '123 Test St',
                  city: 'Seattle',
                  stateOrRegion: 'WA',
                  postalCode: '98101',
                  countryCode: 'US',
                  phone: '555-123-4567'
                }
              }
            ]
          }
        }
      });
      
      // Mock order items response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          payload: {
            OrderItems: [
              {
                asin: 'B123456789',
                sellerSKU: 'TEST-SKU-123',
                orderItemId: 'ITEM123',
                title: 'Test Product',
                quantityOrdered: 2,
                itemPrice: {
                  currencyCode: 'USD',
                  amount: '29.99'
                }
              }
            ]
          }
        }
      });
      
      // Call method
      const sinceDate = new Date('2023-01-01T00:00:00Z');
      const result = await adapter.getRecentOrders(sinceDate, 0, 10);
      
      // Verify API calls
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      
      // Verify result
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(-1); // Not provided by Amazon API
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(10);
      
      // Verify order details
      const order = result.data[0];
      expect(order.id).toBe('ORDER123');
      expect(order.marketplaceOrderId).toBe('ORDER123');
      expect(order.customerDetails.email).toBe('test@example.com');
      expect(order.orderItems).toHaveLength(1);
      expect(order.orderItems[0].sku).toBe('TEST-SKU-123');
      expect(order.orderItems[0].quantity).toBe(2);
      expect(order.orderItems[0].unitPrice).toBe(29.99);
      expect(order.total).toBe(59.99);
      expect(order.marketplaceSpecific?.amazonOrderId).toBe('ORDER123');
    });
    
    it('should handle empty orders response', async () => {
      // Mock empty orders response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          payload: {
            Orders: []
          }
        }
      });
      
      // Call method
      const sinceDate = new Date('2023-01-01T00:00:00Z');
      const result = await adapter.getRecentOrders(sinceDate, 0, 10);
      
      // Verify result
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasNext).toBe(false);
    });
  });

  // Additional tests could be added for other methods
  // This is a basic test suite to demonstrate the approach
});