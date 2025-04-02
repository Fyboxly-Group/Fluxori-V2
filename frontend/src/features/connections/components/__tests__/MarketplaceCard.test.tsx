/// <reference path="../../../../types/module-declarations.d.ts" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@/utils/chakra-compat';
import { MarketplaceCard } from '../MarketplaceCard';
import { ConnectionStatus } from '../../../../api/connections.api';

describe('MarketplaceCard': any, (_: any) => {
  const mockProps = {
    id: 'test-id',
    marketplaceId: 'shopify',
    marketplaceName: 'Shopify',
    status: ConnectionStatus.CONNECTED,
    lastChecked: new Date(),
    description: 'Test marketplace description',
    onConnect: jest.fn(),
    onDelete: jest.fn(),
    onTest: jest.fn(),
    isTestLoading: false,
    isDeleteLoading: false,
  };

  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  it('renders marketplace information correctly': any, (_: any) => {
    renderWithChakra(
      <MarketplaceCard {...mockProps} />
    );
    
    // Check if marketplace name is displayed
    expect(screen.getByText('Shopify')).toBeInTheDocument();
    
    // Check if description is displayed
    expect(screen.getByText('Test marketplace description')).toBeInTheDocument();
    
    // Check if status is displayed
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows test and disconnect buttons for connected status': any, (_: any) => {
    renderWithChakra(
      <MarketplaceCard 
        {...mockProps} 
        status={ConnectionStatus.CONNECTED} 
      />
    );
    
    // Check if test button is displayed
    expect(screen.getByText('Test')).toBeInTheDocument();
    
    // Check if disconnect button is displayed
    expect(screen.getByText('Disconnect')).toBeInTheDocument();
    
    // Connect button should not be displayed
    expect(screen.queryByText('Connect')).not.toBeInTheDocument();
  });

  it('shows connect button for disconnected status': any, (_: any) => {
    renderWithChakra(
      <MarketplaceCard 
        {...mockProps} 
        status={ConnectionStatus.DISCONNECTED} 
      />
    );
    
    // Check if connect button is displayed
    expect(screen.getByText('Connect')).toBeInTheDocument();
    
    // Test and disconnect buttons should not be displayed
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
    expect(screen.queryByText('Disconnect')).not.toBeInTheDocument();
  });

  it('calls the onConnect callback when Connect button is clicked': any, (_: any) => {
    renderWithChakra(
      <MarketplaceCard 
        {...mockProps} 
        status={ConnectionStatus.DISCONNECTED} 
      />
    );
    
    // Click connect button
    fireEvent.click(screen.getByText('Connect'));
    
    // Check if onConnect was called
    expect(mockProps.onConnect).toHaveBeenCalled();
  });

  it('calls the onTest callback when Test button is clicked': any, (_: any) => {
    renderWithChakra(
      <MarketplaceCard 
        {...mockProps} 
        status={ConnectionStatus.CONNECTED} 
      />
    );
    
    // Click test button
    fireEvent.click(screen.getByText('Test'));
    
    // Check if onTest was called with the correct ID
    expect(mockProps.onTest).toHaveBeenCalledWith('test-id');
  });

  it('shows alert dialog when Disconnect button is clicked': any, (_: any) => {
    renderWithChakra(
      <MarketplaceCard 
        {...mockProps} 
        status={ConnectionStatus.CONNECTED} 
      />
    );
    
    // Click disconnect button
    fireEvent.click(screen.getByText('Disconnect'));
    
    // Check if alert dialog is shown
    expect(screen.getByText('Disconnect Shopify')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to disconnect from Shopify/)).toBeInTheDocument();
  });

  it('calls onDelete when disconnect is confirmed in the dialog': any, (_: any) => {
    renderWithChakra(
      <MarketplaceCard 
        {...mockProps} 
        status={ConnectionStatus.CONNECTED} 
      />
    );
    
    // Click disconnect button to open dialog
    fireEvent.click(screen.getByText('Disconnect'));
    
    // Click confirm button in the dialog
    fireEvent.click(screen.getByText('Disconnect', { selector: 'button[color="red"]' }));
    
    // Check if onDelete was called with the correct ID
    expect(mockProps.onDelete).toHaveBeenCalledWith('test-id');
  });

  it('displays error message when provided': any, (_: any) => {
    const errorMessage = 'Connection failed: Authentication error';
    renderWithChakra(
      <MarketplaceCard 
        {...mockProps} 
        status={ConnectionStatus.ERROR}
        lastError={errorMessage}
      />
    );
    
    // Check if error message is displayed
    expect(screen.getByText(/Error: Connection failed: Authentication error/)).toBeInTheDocument();
  });
});