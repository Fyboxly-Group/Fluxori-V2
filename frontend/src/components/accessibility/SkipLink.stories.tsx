import type { Meta, StoryObj } from '@storybook/react';
import { SkipLink } from './SkipLink';

// Mock element for target
const withMainContent = (Story) => {
  return (
    <div>
      <Story />
      <div id="main-content" tabIndex={-1} style={{ marginTop: 100, padding: 20, border: '1px solid #ccc' }}>
        <h1>Main Content</h1>
        <p>This is the main content area that will receive focus when the skip link is activated.</p>
        <p>To test the skip link, press Tab to focus on it, then press Enter to activate it. The focus will move to this content area.</p>
      </div>
    </div>
  );
};

/**
 * The SkipLink component provides keyboard accessibility by allowing users to skip navigation 
 * and jump directly to the main content. This is particularly important for keyboard and screen 
 * reader users who would otherwise need to tab through all navigation items on every page.
 * 
 * ## Accessibility Features
 * 
 * - Visually hidden until focused, then appears at the top of the page
 * - Activatable with both mouse click and keyboard (Enter or Space)
 * - Sets focus on the target element when activated
 * - Temporary tabindex to make non-focusable elements focusable
 * 
 * ## Usage Guidelines
 * 
 * - Place at the very beginning of your page content
 * - Target should typically be the main content area with id="main-content"
 * - The target element should have role="main" if it's the main content area
 * - For complex pages, consider multiple skip links to different sections
 */
const meta: Meta<typeof SkipLink> = {
  title: 'Accessibility/SkipLink',
  component: SkipLink,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A component that allows keyboard users to skip navigation and jump directly to the main content.',
      },
    },
  },
  tags: ['autodocs', 'a11y'],
  decorators: [withMainContent],
  argTypes: {
    targetId: {
      control: 'text',
      description: 'ID of the element to focus when the skip link is activated',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Required' },
      },
    },
    label: {
      control: 'text',
      description: 'Text content of the skip link',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Skip to main content' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SkipLink>;

export const Default: Story = {
  args: {
    targetId: 'main-content',
    label: 'Skip to main content',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default skip link configuration targeting an element with id="main-content".',
      },
    },
  },
};

export const CustomLabel: Story = {
  args: {
    targetId: 'main-content',
    label: 'Skip to content',
  },
  parameters: {
    docs: {
      description: {
        story: 'Skip link with custom label text.',
      },
    },
  },
};
