import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AccessibleModal } from './AccessibleModal';
import { Button, Text, TextInput, Group, Stack } from '@mantine/core';

/**
 * The AccessibleModal component is an enhanced version of Mantine's Modal with improved
 * accessibility features such as better focus management, screen reader announcements,
 * and RTL support.
 * 
 * ## Accessibility Features
 * 
 * - Focus trapping within the modal when open
 * - Focus returns to the triggering element when closed
 * - Screen reader announcements on open and close
 * - Support for right-to-left (RTL) layouts
 * - Accessible animations with appropriate ARIA attributes
 * - Escape key closes the modal
 * 
 * ## Usage
 * 
 * ```tsx
 * import { useState } from 'react';
 * import { AccessibleModal } from '@/components/accessibility/AccessibleModal';
 * import { Button } from '@mantine/core';
 * 
 * function MyComponent() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   
 *   return (
 *     <>
 *       <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
 *       
 *       <AccessibleModal
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         title="Accessible Modal"
 *         ariaLabel="Subscription options modal"
 *       >
 *         <p>This is an accessible modal dialog</p>
 *         <Button onClick={() => setIsOpen(false)}>Close</Button>
 *       </AccessibleModal>
 *     </>
 *   );
 * }
 * ```
 */
const meta: Meta<typeof AccessibleModal> = {
  title: 'Accessibility/AccessibleModal',
  component: AccessibleModal,
  parameters: {
    docs: {
      description: {
        component: 'An accessible modal dialog component with focus management and screen reader announcements.',
      },
    },
  },
  tags: ['autodocs', 'a11y'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is currently open',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClose: {
      action: 'closed',
      description: 'Function called when the modal should close',
      table: {
        type: { summary: 'function' },
      },
    },
    title: {
      control: 'text',
      description: 'Title displayed in the modal header',
      table: {
        type: { summary: 'string | ReactNode' },
      },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name for the modal (used by screen readers)',
      table: {
        type: { summary: 'string' },
      },
    },
    announceOnOpen: {
      control: 'boolean',
      description: 'Whether to announce the modal opening to screen readers',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    announceOnClose: {
      control: 'boolean',
      description: 'Whether to announce the modal closing to screen readers',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    customOpenAnnouncement: {
      control: 'text',
      description: 'Custom announcement text when the modal opens',
      table: {
        type: { summary: 'string' },
      },
    },
    customCloseAnnouncement: {
      control: 'text',
      description: 'Custom announcement text when the modal closes',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AccessibleModal>;

// Template with actual state for the modal
const Template = (args) => {
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  return (
    <>
      <Button onClick={() => setOpened(true)}>Open Modal</Button>
      
      <AccessibleModal
        {...args}
        isOpen={opened}
        onClose={() => setOpened(false)}
      >
        <Stack spacing="md">
          <Text>Please fill out the form below:</Text>
          
          <TextInput 
            label="Name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          
          <TextInput 
            label="Email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            type="email"
          />
          
          <Group position="right" mt="md">
            <Button variant="outline" onClick={() => setOpened(false)}>Cancel</Button>
            <Button onClick={() => {
              alert(`Submitted: ${name}, ${email}`);
              setOpened(false);
            }}>Submit</Button>
          </Group>
        </Stack>
      </AccessibleModal>
    </>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    title: 'Contact Form',
    ariaLabel: 'Contact form modal',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default accessible modal with a form inside. Try navigating using Tab key to experience focus trapping.',
      },
    },
  },
};

export const WithCustomAnnouncements: Story = {
  render: (args) => <Template {...args} />,
  args: {
    title: 'Newsletter Subscription',
    ariaLabel: 'Newsletter subscription form',
    size: 'md',
    customOpenAnnouncement: 'Newsletter subscription form is now open. Please provide your information.',
    customCloseAnnouncement: 'Newsletter subscription form has been closed.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with custom screen reader announcements for better accessibility context.',
      },
    },
  },
};

export const NoHeaderModal: Story = {
  render: (args) => <Template {...args} />,
  args: {
    title: undefined,
    ariaLabel: 'Form without visible header',
    size: 'sm',
    withCloseButton: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal without a header, showing that ariaLabel is essential in this case for screen reader users.',
      },
    },
  },
};
