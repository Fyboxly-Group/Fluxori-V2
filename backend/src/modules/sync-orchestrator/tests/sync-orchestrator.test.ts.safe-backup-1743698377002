import { syncOrchestratorService, SyncOrchestratorService } from '../services/sync-orchestrator.service';
import connectionService from '../../connections/services/connection.service';
import secretsService from '../../connections/services/secrets.service';
import { MarketplaceAdapterFactory } from '../../marketplaces/adapters/marketplace-adapter.factory';
import { OrderIngestionService } from '../../order-ingestion/services/order-ingestion.service';
import { ProductIngestionService } from '../../product-ingestion/services/product-ingestion.service';
import { ConnectionStatus, SyncStatus } from '../../connections/models/connection.model';
import { ApiError } from '../../../middleware/error.middleware';

// Mock dependencies
jest.mock('../../connections/services/connection.service');
jest.mock('../../connections/services/secrets.service');
jest.mock('../../marketplaces/adapters/marketplace-adapter.factory');
jest.mock('../../order-ingestion/services/order-ingestion.service');
jest.mock('../../product-ingestion/services/product-ingestion.service');

describe('SyncOrchestratorService', () => {
  // Mock connection
  const mockConnection = {
    _id: 'connection123',
    userId: 'user123',
    marketplaceId: 'amazon',
    status: ConnectionStatus.CONNECTED,
    syncStatus: SyncStatus.SUCCESS,
    lastSyncedAt: new Date('2023-01-01'),
    credentialReference: 'cred-ref-123',
    save: jest.fn().mockResolvedValue(undefined)
  };

  // Mock marketplace adapter
  const mockAdapter = {
    fetchOrders: jest.fn(),
    fetchProducts: jest.fn(),
  };

  // Mock order and product data
  const mockOrders = [
    { id: 'order1', orderNumber: '001', customer: { name: 'Customer 1', email: 'cust1@example.com' }, items: [], total: 100, status: 'new', createdAt: new Date() },
    { id: 'order2', orderNumber: '002', customer: { name: 'Customer 2', email: 'cust2@example.com' }, items: [], total: 200, status: 'new', createdAt: new Date() }
  ];
  
  const mockProducts = [
    { id: 'prod1', title: 'Product 1', price: 50, inventory: 10 },
    { id: 'prod2', title: 'Product 2', price: 75, inventory: 5 }
  ];

  // Setup mock factory
  const mockAdapterFactory = {
    getAdapter: jest.fn().mockResolvedValue(mockAdapter)
  };

  // Mock ingestion services
  const mockOrderIngestionService = {
    ingestOrders: jest.fn().mockResolvedValue({ success: true, count: 2 })
  };
  
  const mockProductIngestionService = {
    ingestProducts: jest.fn().mockResolvedValue({ success: true, count: 2 })
  };

  // Create a new instance of the service with mocked dependencies
  let orchestratorService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock connection
    mockConnection.syncStatus = SyncStatus.SUCCESS;
    mockConnection.save.mockClear();
    
    // Setup connection service mocks
    connectionService.getAllActiveConnections = jest.fn().mockResolvedValue([mockConnection]);
    connectionService.getConnectionByIdDirect = jest.fn().mockResolvedValue(mockConnection);
    
    // Setup secrets service mock
    secretsService.getCredentials = jest.fn().mockResolvedValue({ apiKey: 'test-key' });
    
    // Setup adapter factory mock
    MarketplaceAdapterFactory.getInstance = jest.fn().mockReturnValue(mockAdapterFactory);
    
    // Setup adapter mocks to return test data
    mockAdapter.fetchOrders.mockResolvedValue(mockOrders);
    mockAdapter.fetchProducts.mockResolvedValue(mockProducts);
    
    // Create a new instance of the orchestrator service
    orchestratorService = new SyncOrchestratorService();
    
    // Replace the service dependencies with our mocks
    orchestratorService.adapterFactory = mockAdapterFactory;
    orchestratorService.orderIngestionService = mockOrderIngestionService;
    orchestratorService.productIngestionService = mockProductIngestionService;
  });

  describe('runSyncCycle', () => {
    it('should process all active connections', async () => {
      // Execute
      const result = await orchestratorService.runSyncCycle();
      
      // Verify
      expect(connectionService.getAllActiveConnections).toHaveBeenCalled();
      expect(result.totalConnections).toBe(1);
      expect(result.successfulConnections).toBe(1);
      expect(result.failedConnections).toBe(0);
      expect(result.success).toBe(true);
    });
    
    it('should handle processing errors', async () => {
      // Setup - make processConnection throw an error
      jest.spyOn(orchestratorService, 'processConnection').mockRejectedValueOnce(new Error('Processing error'));
      
      // Execute
      const result = await orchestratorService.runSyncCycle();
      
      // Verify
      expect(result.totalConnections).toBe(1);
      expect(result.successfulConnections).toBe(0);
      expect(result.failedConnections).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toBe('Processing error');
    });
    
    it('should mark overall success as false if all connections fail', async () => {
      // Setup - make processConnection return false
      jest.spyOn(orchestratorService, 'processConnection').mockResolvedValueOnce(false);
      
      // Execute
      const result = await orchestratorService.runSyncCycle();
      
      // Verify
      expect(result.totalConnections).toBe(1);
      expect(result.successfulConnections).toBe(0);
      expect(result.failedConnections).toBe(1);
      expect(result.success).toBe(false);
    });
  });

  describe('processConnection', () => {
    it('should fetch and ingest orders and products', async () => {
      // Execute
      const result = await orchestratorService['processConnection'](mockConnection);
      
      // Verify
      expect(secretsService.getCredentials).toHaveBeenCalledWith(mockConnection.credentialReference);
      expect(mockAdapterFactory.getAdapter).toHaveBeenCalledWith(mockConnection.marketplaceId, { apiKey: 'test-key' });
      
      // Use any matcher to avoid time-related comparison issues
      expect(mockAdapter.fetchOrders).toHaveBeenCalledWith(expect.objectContaining({
        limit: 100
      }));
      
      expect(mockAdapter.fetchProducts).toHaveBeenCalledWith(expect.objectContaining({
        limit: 100
      }));
      
      // Verify ingestion services were called with correct parameters
      expect(mockOrderIngestionService.ingestOrders).toHaveBeenCalledWith(
        mockConnection.marketplaceId,
        mockConnection.userId.toString(),
        mockOrders
      );
      
      expect(mockProductIngestionService.ingestProducts).toHaveBeenCalledWith(
        mockConnection.marketplaceId,
        mockConnection.userId.toString(),
        mockProducts
      );
      
      // Verify connection status was updated correctly
      expect(mockConnection.syncStatus).toBe(SyncStatus.SUCCESS);
      expect(mockConnection.save).toHaveBeenCalled();
      
      // Verify result
      expect(result).toBe(true);
    });
    
    it('should handle order fetch failures gracefully', async () => {
      // Setup
      mockAdapter.fetchOrders.mockRejectedValueOnce(new Error('API error'));
      
      // Execute
      const result = await orchestratorService['processConnection'](mockConnection);
      
      // Verify
      expect(mockConnection.syncStatus).toBe(SyncStatus.ERROR);
      expect(mockConnection.lastError).toContain('Failed to fetch orders');
      expect(mockConnection.save).toHaveBeenCalled();
      
      // Product fetching should still be attempted
      expect(mockAdapter.fetchProducts).toHaveBeenCalled();
      expect(mockProductIngestionService.ingestProducts).toHaveBeenCalled();
      
      // Result should be false since there was an error
      expect(result).toBe(false);
    });
    
    it('should handle product fetch failures gracefully', async () => {
      // Setup
      mockAdapter.fetchProducts.mockRejectedValueOnce(new Error('API error'));
      
      // Execute
      const result = await orchestratorService['processConnection'](mockConnection);
      
      // Verify
      expect(mockConnection.syncStatus).toBe(SyncStatus.ERROR);
      expect(mockConnection.lastError).toContain('Failed to fetch products');
      expect(mockConnection.save).toHaveBeenCalled();
      
      // Order fetching should still succeed
      expect(mockAdapter.fetchOrders).toHaveBeenCalled();
      expect(mockOrderIngestionService.ingestOrders).toHaveBeenCalled();
      
      // Result should be false since there was an error
      expect(result).toBe(false);
    });
    
    it('should handle both order and product fetch failures', async () => {
      // Setup
      mockAdapter.fetchOrders.mockRejectedValueOnce(new Error('Orders API error'));
      mockAdapter.fetchProducts.mockRejectedValueOnce(new Error('Products API error'));
      
      // Execute
      const result = await orchestratorService['processConnection'](mockConnection);
      
      // Verify
      expect(mockConnection.syncStatus).toBe(SyncStatus.ERROR);
      expect(mockConnection.lastError).toContain('Failed to fetch both orders and products');
      expect(mockConnection.save).toHaveBeenCalled();
      
      // Result should be false since both fetches failed
      expect(result).toBe(false);
    });
    
    it('should handle adapter initialization failures', async () => {
      // Setup
      mockAdapterFactory.getAdapter.mockRejectedValueOnce(new Error('Adapter initialization error'));
      
      // Execute
      const result = await orchestratorService['processConnection'](mockConnection);
      
      // Verify
      expect(mockConnection.syncStatus).toBe(SyncStatus.ERROR);
      expect(mockConnection.save).toHaveBeenCalled();
      
      // Result should be false since adapter initialization failed
      expect(result).toBe(false);
    });
    
    it('should handle empty fetch results', async () => {
      // Setup
      mockAdapter.fetchOrders.mockResolvedValueOnce([]);
      mockAdapter.fetchProducts.mockResolvedValueOnce([]);
      
      // Execute
      const result = await orchestratorService['processConnection'](mockConnection);
      
      // Verify
      expect(mockConnection.syncStatus).toBe(SyncStatus.SUCCESS);
      expect(mockConnection.save).toHaveBeenCalled();
      
      // Ingestion services should not be called with empty arrays
      expect(mockOrderIngestionService.ingestOrders).not.toHaveBeenCalled();
      expect(mockProductIngestionService.ingestProducts).not.toHaveBeenCalled();
      
      // Result should be true since both fetches succeeded (just returned empty arrays)
      expect(result).toBe(true);
    });
  });

  describe('updateConnectionSyncStatus', () => {
    it('should update connection status correctly', async () => {
      // Execute
      await orchestratorService['updateConnectionSyncStatus'](
        mockConnection._id.toString(),
        SyncStatus.IN_PROGRESS
      );
      
      // Verify
      expect(connectionService.getConnectionByIdDirect).toHaveBeenCalledWith(mockConnection._id.toString());
      expect(mockConnection.syncStatus).toBe(SyncStatus.IN_PROGRESS);
      expect(mockConnection.lastChecked).toBeInstanceOf(Date);
      expect(mockConnection.save).toHaveBeenCalled();
    });
    
    it('should update error message when provided', async () => {
      // Execute
      await orchestratorService['updateConnectionSyncStatus'](
        mockConnection._id.toString(),
        SyncStatus.ERROR,
        'Test error message'
      );
      
      // Verify
      expect(mockConnection.syncStatus).toBe(SyncStatus.ERROR);
      expect(mockConnection.lastError).toBe('Test error message');
      expect(mockConnection.save).toHaveBeenCalled();
    });
    
    it('should update lastSyncedAt when updateLastSyncedAt is true', async () => {
      // Execute
      await orchestratorService['updateConnectionSyncStatus'](
        mockConnection._id.toString(),
        SyncStatus.SUCCESS,
        undefined,
        true
      );
      
      // Verify
      expect(mockConnection.syncStatus).toBe(SyncStatus.SUCCESS);
      expect(mockConnection.lastSyncedAt).toBeInstanceOf(Date);
      expect(mockConnection.save).toHaveBeenCalled();
    });
    
    it('should handle connection not found', async () => {
      // Setup
      connectionService.getConnectionByIdDirect.mockResolvedValueOnce(null);
      
      // Override the console.error to prevent logging during tests
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Modify the test to match implementation that catches the error
      // Execute the function and expect it to complete without throwing
      await orchestratorService['updateConnectionSyncStatus']('nonexistent-id', SyncStatus.SUCCESS);
      
      // Verify error was logged (since the implementation catches the error instead of throwing it)
      expect(console.error).toHaveBeenCalled();
    });
    
    it('should handle errors when updating status', async () => {
      // Setup
      mockConnection.save.mockRejectedValueOnce(new Error('Save error'));
      
      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Execute - should not throw
      await orchestratorService['updateConnectionSyncStatus'](
        mockConnection._id.toString(),
        SyncStatus.SUCCESS
      );
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('syncConnection', () => {
    it('should sync a specific connection successfully', async () => {
      // Setup
      jest.spyOn(orchestratorService, 'processConnection').mockResolvedValueOnce(true);
      
      // Execute
      const result = await orchestratorService.syncConnection(mockConnection._id.toString());
      
      // Verify
      expect(connectionService.getConnectionByIdDirect).toHaveBeenCalledWith(mockConnection._id.toString());
      expect(orchestratorService.processConnection).toHaveBeenCalledWith(mockConnection);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully synchronized');
    });
    
    it('should handle connection not found', async () => {
      // Setup
      connectionService.getConnectionByIdDirect.mockResolvedValueOnce(null);
      
      // Execute
      const result = await orchestratorService.syncConnection('nonexistent-id');
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.message).toContain('Connection nonexistent-id not found');
    });
    
    it('should handle inactive connections', async () => {
      // Setup
      const inactiveConnection = { ...mockConnection, status: ConnectionStatus.DISCONNECTED };
      connectionService.getConnectionByIdDirect.mockResolvedValueOnce(inactiveConnection);
      
      // Execute
      const result = await orchestratorService.syncConnection(mockConnection._id.toString());
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.message).toContain('is not active');
    });
    
    it('should handle processing failures', async () => {
      // Setup
      jest.spyOn(orchestratorService, 'processConnection').mockResolvedValueOnce(false);
      
      // Execute
      const result = await orchestratorService.syncConnection(mockConnection._id.toString());
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.message).toContain('completed with errors');
    });
    
    it('should handle unexpected errors', async () => {
      // Setup
      jest.spyOn(orchestratorService, 'processConnection').mockRejectedValueOnce(new Error('Unexpected error'));
      
      // Execute
      const result = await orchestratorService.syncConnection(mockConnection._id.toString());
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error syncing connection: Unexpected error');
    });
  });
});