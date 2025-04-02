import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { RoleManagement } from '../RoleManagement';
import { server } from '@/mocks/server';
import { rest } from 'msw';
import { roles } from '@/mocks/userManagementData';

// Mock the useRoles hook
jest.mock('@/hooks/user-management/useRoles', () => {
  const originalModule = jest.requireActual('@/hooks/user-management/useRoles');
  return {
    ...originalModule,
  };
});

// Mock the gsap animation
jest.mock('gsap', () => ({
  fromTo: jest.fn(),
  to: jest.fn(),
}));

describe('RoleManagement Component', () => {
  it('renders the roles list correctly', async () => {
    render(<RoleManagement />);
    
    // Wait for the roles to load
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });
    
    // Check if component headers are present
    expect(screen.getByText('Role Management')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
    
    // Check if system roles are present
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Guest')).toBeInTheDocument();
  });

  it('displays role details when a role is selected', async () => {
    render(<RoleManagement />);
    
    // Wait for the roles to load
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });
    
    // Click on the first role
    const roleCards = screen.getAllByText('permissions');
    fireEvent.click(roleCards[0].closest('.role-card'));
    
    // Wait for role details to appear
    await waitFor(() => {
      expect(screen.getByText('Permissions')).toBeInTheDocument();
    });
    
    // Check for permission categories
    expect(screen.getByText('inventory')).toBeInTheDocument();
    expect(screen.getByText('orders')).toBeInTheDocument();
    expect(screen.getByText('reports')).toBeInTheDocument();
  });

  it('handles empty roles list correctly', async () => {
    // Override the server handler to return empty roles
    server.use(
      rest.get('/api/roles', (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );
    
    render(<RoleManagement />);
    
    // Wait for the empty state message
    await waitFor(() => {
      expect(screen.getByText('No roles defined.')).toBeInTheDocument();
    });
  });

  it('handles error state correctly', async () => {
    // Override the server handler to return an error
    server.use(
      rest.get('/api/roles', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );
    
    render(<RoleManagement />);
    
    // Wait for the error state to appear
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('enters edit mode when edit button is clicked', async () => {
    render(<RoleManagement />);
    
    // Wait for the roles to load
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });
    
    // Click on the first role
    const roleCards = screen.getAllByText('permissions');
    fireEvent.click(roleCards[0].closest('.role-card'));
    
    // Wait for role details to appear and click edit
    await waitFor(() => {
      expect(screen.getByText('Edit Role')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Edit Role'));
    
    // Check for edit mode elements
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Apply Template')).toBeInTheDocument();
  });

  it('can create a new role', async () => {
    render(<RoleManagement />);
    
    // Wait for the roles to load
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });
    
    // Click create role button
    fireEvent.click(screen.getByText('Create Role'));
    
    // Check for create mode elements
    expect(screen.getByText('Create Role', { selector: 'button' })).toBeInTheDocument();
    
    // Enter role name
    const nameInput = screen.getByDisplayValue('New Role');
    fireEvent.change(nameInput, { target: { value: 'Test Role' } });
    
    // Should be in edit mode with permission checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // Toggle some permissions
    fireEvent.click(checkboxes[0]);
    
    // Click Apply Template for admin to add all permissions
    fireEvent.click(screen.getByText('Admin'));
    
    // Create the role
    fireEvent.click(screen.getByText('Create Role', { selector: 'button' }));
  });

  it('shows role actions menu when dots button is clicked', async () => {
    render(<RoleManagement />);
    
    // Wait for the roles to load
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });
    
    // Find and click the dots menu button on the first role
    const menuButtons = screen.getAllByRole('button', { name: /dots/ });
    fireEvent.click(menuButtons[0]);
    
    // Check for menu options
    expect(screen.getByText('Edit Role', { selector: 'div.mantine-Menu-item' })).toBeInTheDocument();
    expect(screen.getByText('Clone Role')).toBeInTheDocument();
    expect(screen.getByText('Assign Users')).toBeInTheDocument();
  });

  it('can apply permission templates', async () => {
    render(<RoleManagement />);
    
    // Wait for the roles to load
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });
    
    // Click create role button to enter create mode
    fireEvent.click(screen.getByText('Create Role'));
    
    // Apply templates one by one and verify they work
    fireEvent.click(screen.getByText('Admin'));
    fireEvent.click(screen.getByText('Manager'));
    fireEvent.click(screen.getByText('User'));
    fireEvent.click(screen.getByText('Guest'));
  });

  it('shows confirmation dialog when deleting a custom role', async () => {
    render(<RoleManagement />);
    
    // Wait for the roles to load
    await waitFor(() => {
      expect(screen.getByText('Inventory Manager')).toBeInTheDocument(); // Non-system role
    });
    
    // Find the Inventory Manager role (non-system) and click it
    fireEvent.click(screen.getByText('Inventory Manager').closest('.role-card'));
    
    // Open menu and click delete
    const menuButtons = screen.getAllByRole('button', { name: /dots/ });
    // Find the right menu button (for the selected role)
    let targetMenuButton;
    for (const button of menuButtons) {
      if (button.closest('.role-card').textContent.includes('Inventory Manager')) {
        targetMenuButton = button;
        break;
      }
    }
    
    fireEvent.click(targetMenuButton);
    
    // Click delete option
    fireEvent.click(screen.getByText('Delete Role', { selector: 'div.mantine-Menu-item' }));
    
    // Check for confirmation dialog
    expect(screen.getByText(/Are you sure you want to delete the role/)).toBeInTheDocument();
    expect(screen.getByText('Delete Role', { selector: 'button' })).toBeInTheDocument();
    
    // Click delete to confirm
    fireEvent.click(screen.getByText('Delete Role', { selector: 'button' }));
  });
});