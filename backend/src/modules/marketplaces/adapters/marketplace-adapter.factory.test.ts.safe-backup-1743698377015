import { MarketplaceAdapterFactory } from './marketplace-adapter.factory';
import { ApiError } from '../../../middleware/error.middleware';

describe('MarketplaceAdapterFactory', () => {
  let factory: MarketplaceAdapterFactory;
  
  beforeEach(() => {
    factory = MarketplaceAdapterFactory.getInstance();
    factory.clearAdapterInstances(); // Clear any existing adapter instances
  });
  
  it('should create a singleton instance', () => {
    const instance1 = MarketplaceAdapterFactory.getInstance();
    const instance2 = MarketplaceAdapterFactory.getInstance();
    
    expect(instance1).toBe(instance2);
  });
  
  it('should return a Takealot adapter for takealot marketplace ID', async () => {
    const mockCredentials = { apiKey: 'test-key', apiSecret: 'test-secret' };
    
    const adapter = await factory.getAdapter('takealot', mockCredentials);
    
    expect(adapter).toBeDefined();
    expect(adapter.marketplaceId).toBe('takealot');
    expect(adapter.marketplaceName).toBe('Takealot');
  });
  
  it('should return an Amazon adapter for amazon_us marketplace ID', async () => {
    const mockCredentials = { 
      sellerId: 'test-seller',
      accessToken: 'test-token'
    };
    
    const adapter = await factory.getAdapter('amazon_us', mockCredentials);
    
    expect(adapter).toBeDefined();
    expect(adapter.marketplaceId).toBe('amazon');
    expect(adapter.marketplaceName).toBe('Amazon');
  });
  
  it('should return a Shopify adapter for shopify marketplace ID', async () => {
    const mockCredentials = { 
      storeId: 'test-store',
      accessToken: 'test-token'
    };
    
    const adapter = await factory.getAdapter('shopify', mockCredentials);
    
    expect(adapter).toBeDefined();
    expect(adapter.marketplaceId).toBe('shopify');
    expect(adapter.marketplaceName).toBe('Shopify');
  });
  
  it('should throw an error for unsupported marketplace ID', async () => {
    const mockCredentials = { apiKey: 'test-key' };
    
    await expect(factory.getAdapter('unsupported-marketplace', mockCredentials))
      .rejects
      .toThrow(ApiError);
  });
  
  it('should reuse an adapter instance for the same marketplace ID', async () => {
    const mockCredentials = { apiKey: 'test-key', apiSecret: 'test-secret' };
    
    const adapter1 = await factory.getAdapter('takealot', mockCredentials);
    const adapter2 = await factory.getAdapter('takealot', mockCredentials);
    
    expect(adapter1).toBe(adapter2);
  });
  
  it('should create a new adapter instance after clearing the cache', async () => {
    const mockCredentials = { apiKey: 'test-key', apiSecret: 'test-secret' };
    
    const adapter1 = await factory.getAdapter('takealot', mockCredentials);
    factory.clearAdapterInstances('takealot');
    const adapter2 = await factory.getAdapter('takealot', mockCredentials);
    
    expect(adapter1).not.toBe(adapter2);
  });
});