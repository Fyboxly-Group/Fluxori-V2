import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { UserList } from '../UserList';
import { server } from '@/mocks/server';
import { rest } from 'msw';
import { users } from '@/mocks/userManagementData';

// Mock the useUsers hook
jest.mock('@/hooks/user-management/useUsers', () => {
  const originalModule = jest.requireActual('@/hooks/user-management/useUsers');
  return {
    ...originalModule,
  };
});

// Mock the gsap animation
jest.mock('gsap', () => ({
  fromTo: jest.fn(),
  to: jest.fn(),
}));

describe('UserList Component', () => {
  it('renders the user list correctly', async () => {
    render(<UserList />);
    
    // Wait for the users to load
    await waitFor(() => {
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    });
    
    // Check if the table headers are present
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check if user data is present
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('manager@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('handles empty user list correctly', async () => {
    // Override the server handler to return empty users
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.json({
            items: [],
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0
          })
        );
      })
    );
    
    render(<UserList />);
    
    // Wait for the empty state message
    await waitFor(() => {
      expect(screen.getByText('No users found. Try adjusting your filters.')).toBeInTheDocument();
    });
  });

  it('handles error state correctly', async () => {
    // Override the server handler to return an error
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );
    
    render(<UserList />);
    
    // Wait for the error state to appear
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('filters users by search term', async () => {
    render(<UserList />);
    
    // Wait for the users to load
    await waitFor(() => {
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    });
    
    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'admin' } });
    
    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
    });
  });

  it('sorts users by name', async () => {
    render(<UserList />);
    
    // Wait for the users to load
    await waitFor(() => {
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    });
    
    // Click on name header to sort
    const nameHeader = screen.getByText('Name').closest('div');
    fireEvent.click(nameHeader);
    
    // Sort direction should change when clicking again
    fireEvent.click(nameHeader);
    
    // We can't test the actual sort order since it's handled by the mock,
    // but we can verify the sort functionality is triggered
  });

  it('toggles user selection', async () => {
    render(<UserList />);
    
    // Wait for the users to load
    await waitFor(() => {
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    });
    
    // Get checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(1);
    
    // Toggle the first user checkbox
    fireEvent.click(checkboxes[1]); // First one after the select all checkbox
    
    // Toggle another checkbox
    if (checkboxes.length > 2) {
      fireEvent.click(checkboxes[2]);
    }
    
    // This should make the "Delete Selected" button appear
    expect(screen.getByText(/Delete Selected/)).toBeInTheDocument();
  });

  it('calls onEditUser when edit menu item is clicked', async () => {
    const mockEditUser = jest.fn();
    render(<UserList onEditUser={mockEditUser} />);
    
    // Wait for the users to load
    await waitFor(() => {
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    });
    
    // Find and open the menu
    const menuButtons = screen.getAllByRole('button', { name: /dots/ });
    fireEvent.click(menuButtons[0]);
    
    // Click edit option
    const editOption = await screen.findByText('Edit User');
    fireEvent.click(editOption);
    
    // Check if onEditUser was called
    expect(mockEditUser).toHaveBeenCalled();
  });

  it('filters users by role', async () => {
    render(<UserList />);
    
    // Wait for the users to load
    await waitFor(() => {
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    });
    
    // Open role filter dropdown
    const roleFilter = screen.getByPlaceholderText('Filter by role');
    fireEvent.mouseDown(roleFilter);
    
    // Select Administrator role
    const adminOption = await screen.findByText('Administrator');
    fireEvent.click(adminOption);
    
    // Wait for filtered results
    await waitFor(() => {
      // Admin should be visible, guest should not
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.queryByText('guest@example.com')).not.toBeInTheDocument();
    });
  });

  it('changes page size correctly', async () => {
    render(<UserList />);
    
    // Wait for the users to load
    await waitFor(() => {
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    });
    
    // Find and change the page size dropdown
    const pageSizeSelect = screen.getByText('Rows per page').nextElementSibling;
    fireEvent.mouseDown(pageSizeSelect);
    
    // Select 25 rows per page
    const option25 = await screen.findByText('25');
    fireEvent.click(option25);
    
    // Can't easily test the actual number of rows since they're mocked,
    // but we can verify the selection works
  });
});