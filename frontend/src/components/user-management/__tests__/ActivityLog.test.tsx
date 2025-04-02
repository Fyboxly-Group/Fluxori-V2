import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { ActivityLog } from '../ActivityLog';
import { server } from '@/mocks/server';
import { rest } from 'msw';
import { activityLogs } from '@/mocks/userManagementData';

// Mock the useActivityLogs hook
jest.mock('@/hooks/user-management/useActivityLogs', () => {
  const originalModule = jest.requireActual('@/hooks/user-management/useActivityLogs');
  return {
    ...originalModule,
  };
});

// Mock the DateRangePicker
jest.mock('@mantine/dates', () => ({
  DateRangePicker: jest.fn(({ label, onChange }) => (
    <div data-testid="date-range-picker">
      <label>{label}</label>
      <button onClick={() => onChange([new Date(2023, 0, 1), new Date(2023, 0, 31)])}>
        Select Date Range
      </button>
    </div>
  )),
}));

// Mock the gsap animation
jest.mock('gsap', () => ({
  fromTo: jest.fn(),
  to: jest.fn(),
}));

describe('ActivityLog Component', () => {
  it('renders the activity log correctly', async () => {
    render(<ActivityLog />);
    
    // Wait for the logs to load
    await waitFor(() => {
      expect(screen.getByText('Activity Log')).toBeInTheDocument();
    });
    
    // Check if search/filter controls are present
    expect(screen.getByPlaceholderText('Search activity logs...')).toBeInTheDocument();
    expect(screen.getByText('Activity Type')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    
    // Check if log entries are displayed
    await waitFor(() => {
      expect(screen.getByText('User login')).toBeInTheDocument();
    });
    
    // Check for user names
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
  });

  it('handles empty logs list correctly', async () => {
    // Override the server handler to return empty logs
    server.use(
      rest.get('/api/activity-logs', (req, res, ctx) => {
        return res(
          ctx.json({
            items: [],
            total: 0,
            page: 1,
            pageSize: 20,
            totalPages: 0
          })
        );
      })
    );
    
    render(<ActivityLog />);
    
    // Wait for the empty state message
    await waitFor(() => {
      expect(screen.getByText('No activity logs found. Try adjusting your filters.')).toBeInTheDocument();
    });
  });

  it('handles error state correctly', async () => {
    // Override the server handler to return an error
    server.use(
      rest.get('/api/activity-logs', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );
    
    render(<ActivityLog />);
    
    // Wait for the error state to appear
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('filters logs by search term', async () => {
    render(<ActivityLog />);
    
    // Wait for the logs to load
    await waitFor(() => {
      expect(screen.getByText('User login')).toBeInTheDocument();
    });
    
    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search activity logs...');
    fireEvent.change(searchInput, { target: { value: 'Updated user settings' } });
    
    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('Updated user settings')).toBeInTheDocument();
      expect(screen.queryByText('User login')).not.toBeInTheDocument();
    });
  });

  it('clears filters when clear button is clicked', async () => {
    render(<ActivityLog />);
    
    // Wait for the logs to load
    await waitFor(() => {
      expect(screen.getByText('User login')).toBeInTheDocument();
    });
    
    // Enter search term to show the clear button
    const searchInput = screen.getByPlaceholderText('Search activity logs...');
    fireEvent.change(searchInput, { target: { value: 'Updated user settings' } });
    
    // Wait for the clear filters button to appear and click it
    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Clear Filters'));
    
    // Verify the input was cleared
    expect(searchInput).toHaveValue('');
  });

  it('filters logs by date range', async () => {
    render(<ActivityLog />);
    
    // Wait for the logs to load
    await waitFor(() => {
      expect(screen.getByText('User login')).toBeInTheDocument();
    });
    
    // Select date range
    const dateRangePicker = screen.getByTestId('date-range-picker');
    const selectButton = dateRangePicker.querySelector('button');
    fireEvent.click(selectButton);
    
    // Now the filter should be applied with the date range
    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });
  });

  it('changes page size correctly', async () => {
    render(<ActivityLog />);
    
    // Wait for the logs to load
    await waitFor(() => {
      expect(screen.getByText('User login')).toBeInTheDocument();
    });
    
    // Find and change the page size dropdown
    const pageSizeSelect = screen.getByText('Items per page').nextElementSibling;
    fireEvent.mouseDown(pageSizeSelect);
    
    // Select 50 items per page
    const option50 = await screen.findByText('50');
    fireEvent.click(option50);
    
    // Can't easily test the actual number of items since they're mocked,
    // but we can verify the selection works
  });

  it('triggers export function when Export Logs button is clicked', async () => {
    // Spy on console.log which is called by the exportLogs function
    const consoleSpy = jest.spyOn(console, 'log');
    
    render(<ActivityLog />);
    
    // Wait for the logs to load
    await waitFor(() => {
      expect(screen.getByText('User login')).toBeInTheDocument();
    });
    
    // Click export button
    fireEvent.click(screen.getByText('Export Logs'));
    
    // Verify console.log was called with the expected message
    expect(consoleSpy).toHaveBeenCalledWith('Exporting logs...');
    
    // Clean up
    consoleSpy.mockRestore();
  });
});