import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectionStatus, SyncStatus } from '../../../../api/connections.api';
import { MarketplaceSyncStatusWidget } from '../MarketplaceSyncStatusWidget';

import { convertChakraProps, withAriaLabel } from '@/utils';

// Mock the useConnectionStatuses hook
jest.mock('../../hooks/useConnections': any, (_: any) => ({
  useConnectionStatuses: jest.fn((_: any) => ({
    data: [
      {
        id: '1',
        marketplaceId: 'amazon',
        marketplaceName: 'Amazon',
        connectionStatus: ConnectionStatus.CONNECTED,
        syncStatus: SyncStatus.SUCCESS,
        lastSyncTimestamp: '2023-01-01T12:00:00Z',
        lastSyncTime: '2 hours ago',
      },
      {
        id: '2',
        marketplaceId: 'shopify',
        marketplaceName: 'Shopify',
        connectionStatus: ConnectionStatus.CONNECTED,
        syncStatus: SyncStatus.IDLE,
        lastSyncTimestamp: '2023-01-01T10:00:00Z',
        lastSyncTime: '4 hours ago',
      },
    ],
    loading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

// Create a wrapped component with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('MarketplaceSyncStatusWidget': any, (_: any) => {
  test('renders widget with marketplace statuses': any, async (_: any) => {
    render(<MarketplaceSyncStatusWidget />, { wrapper: createWrapper() });

    // Wait for component to render with data
    await waitFor((_: any) => {
      expect(screen.getByText('Marketplace Sync Status')).toBeInTheDocument();
    });

    // Check if marketplace info is displayed
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('Shopify')).toBeInTheDocument();
    
    // Check if sync info is displayed
    expect(screen.getByText('Last synced: 2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('Last synced: 4 hours ago')).toBeInTheDocument();
    
    // Check if status badges are displayed
    expect(screen.getAllByText('connected').length).toBe(2);
  });

  test('respects the maxItems prop': any, async (_: any) => {
    render(<MarketplaceSyncStatusWidget maxItems={1} />, { wrapper: createWrapper() });

    // Wait for component to render with data
    await waitFor((_: any) => {
      expect(screen.getByText('Marketplace Sync Status')).toBeInTheDocument();
    });

    // Check if only one marketplace is shown
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.queryByText('Shopify')).not.toBeInTheDocument();
    
    // Check if "more connections" message is shown
    expect(screen.getByText('+1 more connections')).toBeInTheDocument();
  });
});