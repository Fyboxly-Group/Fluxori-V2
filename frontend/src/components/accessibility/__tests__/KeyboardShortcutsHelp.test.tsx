import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { KeyboardShortcutsHelp } from '../KeyboardShortcutsHelp';
import * as keyboard from '@/utils/accessibility/keyboard';

// Mock the keyboard utility
jest.mock('@/utils/accessibility/keyboard', () => ({
  setupKeyboardShortcuts: jest.fn().mockReturnValue(jest.fn()),
}));

// Mock the useI18n hook
jest.mock('@/hooks/accessibility/useI18n', () => ({
  useI18n: jest.fn().mockReturnValue({
    t: jest.fn((key) => key),
  }),
}));

// Sample shortcuts for testing
const testShortcuts = [
  {
    key: 'h',
    description: 'Go to home page',
    category: 'Navigation',
  },
  {
    key: 'd',
    description: 'Go to dashboard',
    category: 'Navigation',
  },
  {
    key: 'n',
    description: 'Create new item',
    category: 'Actions',
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Save current form',
    category: 'Actions',
  },
];

describe('KeyboardShortcutsHelp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the toggle button', () => {
    render(<KeyboardShortcutsHelp shortcuts={testShortcuts} />);
    
    // Toggle button should be rendered
    const toggleButton = screen.getByRole('button', { name: /Keyboard Shortcuts/i });
    expect(toggleButton).toBeInTheDocument();
  });
  
  it('shows modal when toggle button is clicked', async () => {
    render(<KeyboardShortcutsHelp shortcuts={testShortcuts} />);
    
    // Click the toggle button
    const toggleButton = screen.getByRole('button', { name: /Keyboard Shortcuts/i });
    fireEvent.click(toggleButton);
    
    // Modal should appear
    await waitFor(() => {
      const modalTitle = screen.getByText('Keyboard Shortcuts');
      expect(modalTitle).toBeInTheDocument();
    });
  });
  
  it('displays shortcut categories as tabs', async () => {
    render(<KeyboardShortcutsHelp shortcuts={testShortcuts} />);
    
    // Open the modal
    const toggleButton = screen.getByRole('button', { name: /Keyboard Shortcuts/i });
    fireEvent.click(toggleButton);
    
    // Check for category tabs
    await waitFor(() => {
      const navigationTab = screen.getByRole('tab', { name: 'Navigation' });
      const actionsTab = screen.getByRole('tab', { name: 'Actions' });
      
      expect(navigationTab).toBeInTheDocument();
      expect(actionsTab).toBeInTheDocument();
    });
  });
  
  it('displays shortcuts in a table', async () => {
    render(<KeyboardShortcutsHelp shortcuts={testShortcuts} />);
    
    // Open the modal
    const toggleButton = screen.getByRole('button', { name: /Keyboard Shortcuts/i });
    fireEvent.click(toggleButton);
    
    // Check for shortcut descriptions
    await waitFor(() => {
      // By default, the Navigation tab should be active
      expect(screen.getByText('Go to home page')).toBeInTheDocument();
      expect(screen.getByText('Go to dashboard')).toBeInTheDocument();
      
      // Actions tab content should not be visible yet
      expect(screen.queryByText('Create new item')).not.toBeInTheDocument();
    });
    
    // Switch to Actions tab
    const actionsTab = screen.getByRole('tab', { name: 'Actions' });
    fireEvent.click(actionsTab);
    
    // Actions tab content should now be visible
    await waitFor(() => {
      expect(screen.getByText('Create new item')).toBeInTheDocument();
      expect(screen.getByText('Save current form')).toBeInTheDocument();
    });
  });
  
  it('displays keyboard key combinations correctly', async () => {
    render(<KeyboardShortcutsHelp shortcuts={testShortcuts} />);
    
    // Open the modal
    const toggleButton = screen.getByRole('button', { name: /Keyboard Shortcuts/i });
    fireEvent.click(toggleButton);
    
    // Check for key combinations
    await waitFor(() => {
      // Navigate to Actions tab to see complex key combinations
      const actionsTab = screen.getByRole('tab', { name: 'Actions' });
      fireEvent.click(actionsTab);
      
      // Look for Ctrl+S keyboard shortcut
      const shortcutElements = screen.getAllByRole('cell');
      const ctrlSRow = Array.from(shortcutElements).find(el => 
        el.textContent?.includes('Ctrl') && el.textContent?.includes('S')
      );
      
      expect(ctrlSRow).toBeInTheDocument();
    });
  });
  
  it('sets up global keyboard shortcut to open help', () => {
    render(<KeyboardShortcutsHelp shortcuts={testShortcuts} />);
    
    // Check if setupKeyboardShortcuts was called with shift+? shortcut
    expect(keyboard.setupKeyboardShortcuts).toHaveBeenCalledWith([
      expect.objectContaining({
        key: '?',
        shiftKey: true,
      }),
    ]);
  });
  
  it('closes modal when close button is clicked', async () => {
    render(<KeyboardShortcutsHelp shortcuts={testShortcuts} />);
    
    // Open the modal
    const toggleButton = screen.getByRole('button', { name: /Keyboard Shortcuts/i });
    fireEvent.click(toggleButton);
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });
    
    // Close the modal
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);
    
    // Modal should disappear
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  
  it('accepts additional categories', async () => {
    render(
      <KeyboardShortcutsHelp 
        shortcuts={testShortcuts} 
        additionalCategories={['Custom']} 
      />
    );
    
    // Open the modal
    const toggleButton = screen.getByRole('button', { name: /Keyboard Shortcuts/i });
    fireEvent.click(toggleButton);
    
    // Check for custom category tab
    await waitFor(() => {
      const customTab = screen.getByRole('tab', { name: 'Custom' });
      expect(customTab).toBeInTheDocument();
    });
  });
});