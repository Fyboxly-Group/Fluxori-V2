/// <reference path="../../../../types/module-declarations.d.ts" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@/utils/chakra-compat';
import { ConnectionForm } from '../ConnectionForm';
import { MarketplaceType, AuthenticationType } from '../../../../api/connections.api';
import * as connectionsApi from '../../../../api/connections.api';

import { convertChakraProps, withAriaLabel } from '@/utils';

// Mock modules
jest.mock('../../../../api/connections.api': any, (_: any) => ({
  ...jest.requireActual('../../../../api/connections.api'),
  startOAuthFlow: jest.fn(),
}));

jest.mock('../../hooks/useConnections': any, (_: any) => ({
  __esModule: true,
  default: jest.fn((_: any) => ({
    useCreateConnection: () => ({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
    })
  }))
}));

describe('ConnectionForm': any, (_: any) => {
  const mockProps = {
    open: true,
    onClose: jest.fn(),
  };

  const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  beforeEach((_: any) => {
    jest.clearAllMocks();
  });

  it('renders the marketplace selection initially': any, (_: any) => {
    renderWithChakra(<ConnectionForm {...mockProps} />);
    
    // Check if the modal title is displayed
    expect(screen.getByText('Connect Marketplace')).toBeInTheDocument();
    
    // Check if marketplace options are displayed
    expect(screen.getByText('Takealot')).toBeInTheDocument();
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('Shopify')).toBeInTheDocument();
    expect(screen.getByText('Xero')).toBeInTheDocument();
    
    // The "Select a Marketplace" button should be disabled
    const selectButton = screen.getByText('Select a Marketplace');
    expect(selectButton).toBeDisabled();
  });

  it('shows API key form when Takealot is selected': any, async (_: any) => {
    renderWithChakra(<ConnectionForm {...mockProps} />);
    
    // Click on Takealot card
    fireEvent.click(screen.getByText('Takealot'));
    
    // API key form elements should be visible
    await waitFor((_: any) => {
      expect(screen.getByText('Connect to Takealot')).toBeInTheDocument();
      expect(screen.getByText('API Key Authentication')).toBeInTheDocument();
      expect(screen.getByLabelText('API Key')).toBeInTheDocument();
      expect(screen.getByLabelText('API Secret')).toBeInTheDocument();
      expect(screen.getByLabelText('Seller ID (Optional)')).toBeInTheDocument();
    });
    
    // Connect button should be enabled
    const connectButton = screen.getByText('Connect');
    expect(connectButton).not.toBeDisabled();
  });

  it('shows OAuth information when Amazon is selected': any, async (_: any) => {
    renderWithChakra(<ConnectionForm {...mockProps} />);
    
    // Click on Amazon card
    fireEvent.click(screen.getByText('Amazon'));
    
    // OAuth information should be visible
    await waitFor((_: any) => {
      expect(screen.getByText('Connect to Amazon')).toBeInTheDocument();
      expect(screen.getByText('Secure OAuth Authentication')).toBeInTheDocument();
      expect(screen.getByText(/you will be redirected to Amazon/)).toBeInTheDocument();
      
      // Should have "Continue to Authorization" button instead of "Connect"
      expect(screen.getByText('Continue to Authorization')).toBeInTheDocument();
    });
  });

  it('shows Shopify form with store URL field when Shopify is selected': any, async (_: any) => {
    renderWithChakra(<ConnectionForm {...mockProps} />);
    
    // Click on Shopify card
    fireEvent.click(screen.getByText('Shopify'));
    
    // Shopify-specific form elements should be visible
    await waitFor((_: any) => {
      expect(screen.getByText('Connect to Shopify')).toBeInTheDocument();
      expect(screen.getByLabelText('API Key')).toBeInTheDocument();
      expect(screen.getByLabelText('Store URL')).toBeInTheDocument();
      expect(screen.getByText('Enter your full Shopify store URL')).toBeInTheDocument();
    });
  });

  it('initiates OAuth flow when submitting Amazon connection': any, async (_: any) => {
    renderWithChakra(<ConnectionForm {...mockProps} />);
    
    // Click on Amazon card
    fireEvent.click(screen.getByText('Amazon'));
    
    // Submit the form
    fireEvent.click(screen.getByText('Continue to Authorization'));
    
    // Check if startOAuthFlow was called with correct parameters
    expect(connectionsApi.startOAuthFlow).toHaveBeenCalledWith(
      MarketplaceType.AMAZON,
      expect.any(String)
    );
  });

  it('validates API key form fields for Takealot before submission': any, async (_: any) => {
    renderWithChakra(<ConnectionForm {...mockProps} />);
    
    // Click on Takealot card
    fireEvent.click(screen.getByText('Takealot'));
    
    // Submit without filling required fields
    fireEvent.click(screen.getByText('Connect'));
    
    // Error messages should be displayed
    await waitFor((_: any) => {
      expect(screen.getByText('API Key is required')).toBeInTheDocument();
      expect(screen.getByText('API Secret is required')).toBeInTheDocument();
    });
  });

  it('does not show security note for OAuth connections': any, async (_: any) => {
    renderWithChakra(<ConnectionForm {...mockProps} />);
    
    // Click on Amazon card (OAuth)
    fireEvent.click(screen.getByText('Amazon'));
    
    // Security note should not be displayed
    await waitFor((_: any) => {
      expect(screen.queryByText(/All credentials are securely stored and encrypted/)).not.toBeInTheDocument();
    });
    
    // Go back and select Takealot (API Key)
    fireEvent.click(screen.getByText('← Back to marketplace selection'));
    fireEvent.click(screen.getByText('Takealot'));
    
    // Security note should be displayed for API Key connections
    await waitFor((_: any) => {
      expect(screen.getByText(/All credentials are securely stored and encrypted/)).toBeInTheDocument();
    });
  });
});