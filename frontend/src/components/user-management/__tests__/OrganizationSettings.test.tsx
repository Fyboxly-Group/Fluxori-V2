import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { OrganizationSettings } from '../OrganizationSettings';
import { server } from '@/mocks/server';
import { rest } from 'msw';
import { organizationSettings } from '@/mocks/userManagementData';

// Mock the useOrganizationSettings hook
jest.mock('@/hooks/user-management/useOrganizationSettings', () => {
  const originalModule = jest.requireActual('@/hooks/user-management/useOrganizationSettings');
  return {
    ...originalModule,
  };
});

// Mock the color picker
jest.mock('@mantine/core', () => {
  const originalModule = jest.requireActual('@mantine/core');
  return {
    ...originalModule,
    ColorInput: jest.fn(({ label, value, onChange }) => (
      <div data-testid="color-picker">
        <label>{label}</label>
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          data-testid={`color-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
      </div>
    )),
  };
});

// Mock the file input
jest.mock('@mantine/core', () => {
  const originalModule = jest.requireActual('@mantine/core');
  return {
    ...originalModule,
    FileInput: jest.fn(({ placeholder }) => (
      <div data-testid="file-input">
        <input type="file" placeholder={placeholder} />
      </div>
    )),
  };
});

// Mock the gsap animation
jest.mock('gsap', () => ({
  fromTo: jest.fn(),
  to: jest.fn(),
}));

describe('OrganizationSettings Component', () => {
  it('renders the organization settings correctly', async () => {
    render(<OrganizationSettings />);
    
    // Wait for the settings to load
    await waitFor(() => {
      expect(screen.getByText('Organization Settings')).toBeInTheDocument();
    });
    
    // Check if tabs are present
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Localization')).toBeInTheDocument();
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    
    // Check general settings section
    expect(screen.getByText('General Information')).toBeInTheDocument();
    expect(screen.getByText('Organization Name')).toBeInTheDocument();
    expect(screen.getByText('Organization Logo')).toBeInTheDocument();
  });

  it('handles loading state correctly', async () => {
    // Override the server handler to delay the response
    server.use(
      rest.get('/api/organization-settings', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.json(organizationSettings)
        );
      })
    );
    
    render(<OrganizationSettings />);
    
    // Should show loading state initially
    expect(screen.getByText('Organization Settings')).toBeInTheDocument();
    
    // Wait for the settings to load
    await waitFor(() => {
      expect(screen.getByText('General Information')).toBeInTheDocument();
    });
  });

  it('handles error state correctly', async () => {
    // Override the server handler to return an error
    server.use(
      rest.get('/api/organization-settings', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );
    
    render(<OrganizationSettings />);
    
    // Wait for the error state to appear
    await waitFor(() => {
      expect(screen.getByText(/Error loading settings:/)).toBeInTheDocument();
    });
  });

  it('enters edit mode when edit button is clicked', async () => {
    render(<OrganizationSettings />);
    
    // Wait for the settings to load
    await waitFor(() => {
      expect(screen.getByText('General Information')).toBeInTheDocument();
    });
    
    // Click edit button
    const editButton = screen.getByText('Edit', { selector: 'button' });
    fireEvent.click(editButton);
    
    // Check if save button appears, indicating edit mode
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    
    // Check if organization name input is enabled
    const orgNameInput = screen.getByLabelText('Organization Name');
    expect(orgNameInput).not.toBeDisabled();
  });

  it('can change between tabs', async () => {
    render(<OrganizationSettings />);
    
    // Wait for the settings to load
    await waitFor(() => {
      expect(screen.getByText('General Information')).toBeInTheDocument();
    });
    
    // Click on Security tab
    fireEvent.click(screen.getByText('Security'));
    expect(screen.getByText('Security Settings')).toBeInTheDocument();
    expect(screen.getByText('Max Login Attempts')).toBeInTheDocument();
    
    // Click on Appearance tab
    fireEvent.click(screen.getByText('Appearance'));
    expect(screen.getByText('Theme Preview')).toBeInTheDocument();
    
    // Click on Localization tab
    fireEvent.click(screen.getByText('Localization'));
    expect(screen.getByText('Default Language')).toBeInTheDocument();
    
    // Click on Authentication tab
    fireEvent.click(screen.getByText('Authentication'));
    expect(screen.getByText('Password Policy')).toBeInTheDocument();
    
    // Click on Advanced tab
    fireEvent.click(screen.getByText('Advanced'));
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });

  it('can edit security settings', async () => {
    render(<OrganizationSettings />);
    
    // Wait for the settings to load
    await waitFor(() => {
      expect(screen.getByText('General Information')).toBeInTheDocument();
    });
    
    // Click on Security tab
    fireEvent.click(screen.getByText('Security'));
    
    // Click edit button
    const editButtons = screen.getAllByText('Edit', { selector: 'button' });
    // Find the button in the Security tab
    let securityEditButton;
    for (const button of editButtons) {
      if (button.closest('div').textContent.includes('Security Settings')) {
        securityEditButton = button;
        break;
      }
    }
    
    fireEvent.click(securityEditButton);
    
    // Check if save button appears, indicating edit mode
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    
    // Try to change the lockout duration
    const lockoutInput = screen.getByLabelText('Lockout Duration (minutes)');
    fireEvent.change(lockoutInput, { target: { value: '45' } });
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));
  });

  it('can edit appearance settings', async () => {
    render(<OrganizationSettings />);
    
    // Wait for the settings to load
    await waitFor(() => {
      expect(screen.getByText('General Information')).toBeInTheDocument();
    });
    
    // Click on Appearance tab
    fireEvent.click(screen.getByText('Appearance'));
    
    // Click edit button
    const editButtons = screen.getAllByText('Edit', { selector: 'button' });
    // Find the button in the Appearance tab
    let appearanceEditButton;
    for (const button of editButtons) {
      if (button.closest('div').textContent.includes('Appearance')) {
        appearanceEditButton = button;
        break;
      }
    }
    
    fireEvent.click(appearanceEditButton);
    
    // Use the mocked color input to change colors
    const primaryColorInput = screen.getByTestId('color-input-primary-color');
    fireEvent.change(primaryColorInput, { target: { value: '#ff0000' } });
    
    // Change theme
    const themeSelect = screen.getByText('Default Theme').nextElementSibling;
    fireEvent.mouseDown(themeSelect);
    
    // Wait for dropdown options to appear
    await waitFor(() => {
      const darkOption = screen.getByText('Dark');
      fireEvent.click(darkOption);
    });
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));
  });

  it('can cancel edit mode', async () => {
    render(<OrganizationSettings />);
    
    // Wait for the settings to load
    await waitFor(() => {
      expect(screen.getByText('General Information')).toBeInTheDocument();
    });
    
    // Click edit button
    const editButton = screen.getByText('Edit', { selector: 'button' });
    fireEvent.click(editButton);
    
    // Check if we're in edit mode
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    
    // Try to edit the organization name
    const orgNameInput = screen.getByLabelText('Organization Name');
    fireEvent.change(orgNameInput, { target: { value: 'New Company Name' } });
    
    // Cancel edit mode
    fireEvent.click(screen.getByText('Cancel'));
    
    // Should be back in view mode
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('shows password policy preview in authentication tab', async () => {
    render(<OrganizationSettings />);
    
    // Wait for the settings to load
    await waitFor(() => {
      expect(screen.getByText('General Information')).toBeInTheDocument();
    });
    
    // Click on Authentication tab
    fireEvent.click(screen.getByText('Authentication'));
    
    // Check if password policy preview is shown
    expect(screen.getByText('Password Strength Estimation')).toBeInTheDocument();
    expect(screen.getByText('Example Password that Meets Requirements')).toBeInTheDocument();
  });
});