import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Tabs,
  Code,
  Accordion,
  List,
  ThemeIcon,
  Divider,
  Alert,
  Box,
} from '@mantine/core';
import {
  IconKeyboard,
  IconBraille,
  IconLanguage,
  IconDirections,
  IconCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconAccessible,
  IconFocus,
  IconWorld,
} from '@tabler/icons-react';

export default function AccessibilityDocs() {
  return (
    <Container size="xl" px="md" py="xl">
      <Title order={1} mb="md">
        Accessibility Documentation
      </Title>
      
      <Text mb="xl">
        This documentation covers the accessibility features implemented in the Fluxori-V2 frontend,
        including keyboard navigation, screen reader compatibility, internationalization, RTL support,
        and motion preferences.
      </Text>
      
      <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="xl">
        <Text weight={500}>Commitment to Accessibility</Text>
        <Text size="sm">
          Our application is designed to be accessible to all users, regardless of abilities or preferences.
          We follow WCAG 2.1 AA guidelines and continuously test and improve our accessibility features.
        </Text>
      </Alert>
      
      <Tabs defaultValue="keyboard">
        <Tabs.List mb="md">
          <Tabs.Tab value="keyboard" icon={<IconKeyboard size={14} />}>Keyboard Navigation</Tabs.Tab>
          <Tabs.Tab value="screen-reader" icon={<IconBraille size={14} />}>Screen Reader</Tabs.Tab>
          <Tabs.Tab value="internationalization" icon={<IconLanguage size={14} />}>Internationalization</Tabs.Tab>
          <Tabs.Tab value="rtl" icon={<IconDirections size={14} />}>RTL Support</Tabs.Tab>
          <Tabs.Tab value="motion" icon={<IconFocus size={14} />}>Motion Preferences</Tabs.Tab>
          <Tabs.Tab value="components" icon={<IconAccessible size={14} />}>Accessible Components</Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="keyboard">
          <Paper p="md" withBorder shadow="sm" mb="md">
            <Title order={2} mb="md">Keyboard Navigation</Title>
            
            <Text mb="md">
              Our application is fully navigable using only a keyboard. We have implemented the following
              keyboard navigation features:
            </Text>
            
            <Stack spacing="lg">
              <Box>
                <Title order={3} mb="sm">Skip Links</Title>
                <Text mb="xs">
                  Skip links allow keyboard users to bypass navigation and jump directly to the main content.
                  Press Tab when first loading a page to reveal the skip link.
                </Text>
                <Code block>
                  {`<SkipLink targetId="main-content" />`}
                </Code>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">Keyboard Shortcuts</Title>
                <Text mb="xs">
                  We provide keyboard shortcuts for common actions. Press <Code>Shift + ?</Code> anywhere
                  in the application to view all available keyboard shortcuts.
                </Text>
                <List spacing="xs">
                  <List.Item icon={<ThemeIcon color="blue" size={20} radius="xl"><IconCheck size={12} /></ThemeIcon>}>
                    <Code>Shift + ?</Code>: Show keyboard shortcuts help
                  </List.Item>
                  <List.Item icon={<ThemeIcon color="blue" size={20} radius="xl"><IconCheck size={12} /></ThemeIcon>}>
                    <Code>Alt + Shift + A</Code>: Open accessibility settings
                  </List.Item>
                  <List.Item icon={<ThemeIcon color="blue" size={20} radius="xl"><IconCheck size={12} /></ThemeIcon>}>
                    <Code>Esc</Code>: Close dialogs or menus
                  </List.Item>
                </List>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">Focus Management</Title>
                <Text mb="xs">
                  We ensure proper focus management for modals, dialogs, and other interactive elements.
                  Focus is trapped within modal dialogs and returned to the triggering element when closed.
                </Text>
                <Text size="sm" color="dimmed">
                  Our focus management follows these principles:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Focus is trapped within modal dialogs</List.Item>
                  <List.Item>Focus returns to the triggering element when a dialog is closed</List.Item>
                  <List.Item>Focus order follows the visual order of elements</List.Item>
                  <List.Item>Keyboard focus is visually indicated</List.Item>
                </List>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">Keyboard Focus Styles</Title>
                <Text mb="xs">
                  All interactive elements have visible focus styles. We detect keyboard navigation
                  and apply enhanced focus styles for keyboard users.
                </Text>
                <Alert icon={<IconInfoCircle size={16} />} color="cyan" variant="light">
                  <Text size="sm">
                    The <Code>user-is-tabbing</Code> class is added to the body element when a user
                    starts navigating with the keyboard. This class can be used to enhance focus styles.
                  </Text>
                </Alert>
              </Box>
            </Stack>
          </Paper>
        </Tabs.Panel>
        
        <Tabs.Panel value="screen-reader">
          <Paper p="md" withBorder shadow="sm" mb="md">
            <Title order={2} mb="md">Screen Reader Compatibility</Title>
            
            <Text mb="md">
              Our application is designed to work with screen readers. We follow ARIA best practices
              and provide appropriate announcements for dynamic content changes.
            </Text>
            
            <Stack spacing="lg">
              <Box>
                <Title order={3} mb="sm">ARIA Attributes</Title>
                <Text mb="xs">
                  We use ARIA attributes to provide semantic information to assistive technologies.
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>ARIA landmarks for navigation, main content, and complementary areas</List.Item>
                  <List.Item>ARIA labels for buttons, links, and other interactive elements</List.Item>
                  <List.Item>ARIA roles for custom UI components</List.Item>
                  <List.Item>ARIA states for toggles, expanded/collapsed sections, and selected items</List.Item>
                </List>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">Live Announcements</Title>
                <Text mb="xs">
                  We use ARIA live regions to announce dynamic content changes to screen readers.
                </Text>
                <Code block mb="sm">
                  {`import { announce } from '@/utils/accessibility/announcer';

// Announce a message to screen readers
announce('Form submitted successfully', 'polite');

// For critical alerts, use 'assertive'
announce('Error: Form submission failed', 'assertive');`}
                </Code>
                <Text size="sm" mb="xs">
                  The announcer utility creates and manages ARIA live regions with the following features:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Polite announcements for non-critical updates</List.Item>
                  <List.Item>Assertive announcements for critical alerts</List.Item>
                  <List.Item>Automatic cleanup to prevent memory leaks</List.Item>
                </List>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">Accessible Animations</Title>
                <Text mb="xs">
                  Animations are made accessible with appropriate ARIA attributes and respect for
                  the user's motion preferences.
                </Text>
                <Code block>
                  {`const { setAriaAttributes } = useAnimationA11y({
  animationType: 'enter',
  announcementEnter: 'Content has appeared',
  announcementExit: 'Content has disappeared',
});

// Apply ARIA attributes to the animated element
setAriaAttributes(elementRef.current);`}
                </Code>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">Form Accessibility</Title>
                <Text mb="xs">
                  Forms are designed to be accessible with proper labels, error messages, and
                  validation feedback.
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>All form inputs have associated labels</List.Item>
                  <List.Item>Error messages are linked to inputs with aria-describedby</List.Item>
                  <List.Item>Required fields are indicated with aria-required</List.Item>
                  <List.Item>Form validation errors are announced to screen readers</List.Item>
                </List>
              </Box>
            </Stack>
          </Paper>
        </Tabs.Panel>
        
        <Tabs.Panel value="internationalization">
          <Paper p="md" withBorder shadow="sm" mb="md">
            <Title order={2} mb="md">Internationalization</Title>
            
            <Text mb="md">
              Our application supports multiple languages with a comprehensive internationalization system.
            </Text>
            
            <Stack spacing="lg">
              <Box>
                <Title order={3} mb="sm">Language Selection</Title>
                <Text mb="xs">
                  Users can select their preferred language from the accessibility settings panel or
                  using the language switcher component.
                </Text>
                <Code block>
                  {`<LanguageSwitcher variant="dropdown" />`}
                </Code>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">Translation System</Title>
                <Text mb="xs">
                  We use a simple but powerful translation system that supports nested keys and
                  variable interpolation.
                </Text>
                <Code block mb="sm">
                  {`// Using the t function from useI18n hook
const { t } = useI18n();

// Simple translation
t('common.save'); // "Save"

// With variable interpolation
t('errors.required', { field: 'Email' }); // "Email is required"`}
                </Code>
                <Text size="sm">
                  Translation files are structured as nested objects with language-specific values.
                </Text>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">Date, Number, and Currency Formatting</Title>
                <Text mb="xs">
                  Dates, numbers, and currency values are formatted according to the user's selected locale.
                </Text>
                <Accordion>
                  <Accordion.Item value="date">
                    <Accordion.Control>Date Formatting</Accordion.Control>
                    <Accordion.Panel>
                      <Code block>
                        {`// Format a date according to the user's locale
const { formatDate } = useI18n();

// Default format (e.g., "Jun 12, 2023" in English)
formatDate(new Date());

// Custom format
formatDate(new Date(), 'MM/dd/yyyy');`}
                      </Code>
                    </Accordion.Panel>
                  </Accordion.Item>
                  
                  <Accordion.Item value="number">
                    <Accordion.Control>Number Formatting</Accordion.Control>
                    <Accordion.Panel>
                      <Code block>
                        {`// Format a number according to the user's locale
const { formatNumber } = useI18n();

// Default format (e.g., "1,234.56" in English)
formatNumber(1234.56);

// With options
formatNumber(1234.56, { maximumFractionDigits: 1 }); // "1,234.6"`}
                      </Code>
                    </Accordion.Panel>
                  </Accordion.Item>
                  
                  <Accordion.Item value="currency">
                    <Accordion.Control>Currency Formatting</Accordion.Control>
                    <Accordion.Panel>
                      <Code block>
                        {`// Format a currency value according to the user's locale
const { formatCurrency } = useI18n();

// Default currency (USD) in user's locale
formatCurrency(1234.56);

// Different currency
formatCurrency(1234.56, 'EUR'); // "€1,234.56" in English`}
                      </Code>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">Adding New Languages</Title>
                <Text mb="xs">
                  To add a new language to the application, create a new translation file in the
                  <Code>src/locales</Code> directory.
                </Text>
                <Text size="sm">Example structure for a new language file:</Text>
                <Code block>
                  {`// src/locales/fr.ts
export default {
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    // ...other common terms
  },
  errors: {
    required: '{field} est requis',
    invalid: '{field} est invalide',
    // ...other error messages
  },
  // ...other sections
};`}
                </Code>
              </Box>
            </Stack>
          </Paper>
        </Tabs.Panel>
        
        <Tabs.Panel value="rtl">
          <Paper p="md" withBorder shadow="sm" mb="md">
            <Title order={2} mb="md">RTL (Right-to-Left) Support</Title>
            
            <Text mb="md">
              Our application supports right-to-left languages like Arabic, Hebrew, and Persian with
              automatic RTL layout switching.
            </Text>
            
            <Stack spacing="lg">
              <Box>
                <Title order={3} mb="sm">RTL Direction Management</Title>
                <Text mb="xs">
                  The RTL direction is automatically set based on the selected language, or it can be
                  manually toggled in the accessibility settings.
                </Text>
                <Code block>
                  {`// Use the useRTL hook for RTL direction
const { direction, isRTL, toggleDirection } = useRTL();

// Check if the current direction is RTL
if (isRTL) {
  // Handle RTL-specific logic
}

// Toggle between LTR and RTL
toggleDirection();

// Set direction directly
setDirection('rtl');`}
                </Code>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">RTL-Aware Components</Title>
                <Text mb="xs">
                  Our UI components are designed to work in both LTR and RTL layouts. The RTL layout
                  is achieved through the DirectionProvider from Mantine UI.
                </Text>
                <Text size="sm" mb="xs">
                  Key RTL features:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Automatic mirroring of UI layouts</List.Item>
                  <List.Item>Proper alignment of text and components</List.Item>
                  <List.Item>RTL-aware positioning of popups and tooltips</List.Item>
                  <List.Item>Correct handling of margin and padding</List.Item>
                </List>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">RTL Detection</Title>
                <Text mb="xs">
                  RTL languages are automatically detected based on the language code.
                </Text>
                <Code block>
                  {`// RTL languages
const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'dv', 'ha', 'ji', 'ps', 'sd', 'ug', 'yi'];

// Check if a language is RTL
function isRTL(lang: string): boolean {
  return rtlLanguages.includes(lang);
}`}
                </Code>
              </Box>
              
              <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="outline">
                <Text weight={500}>RTL Testing</Text>
                <Text size="sm">
                  When developing new components, always test them in both LTR and RTL layouts to ensure
                  proper alignment and positioning. You can toggle the direction using the accessibility
                  settings panel or programmatically with <Code>setDirection('rtl')</Code>.
                </Text>
              </Alert>
            </Stack>
          </Paper>
        </Tabs.Panel>
        
        <Tabs.Panel value="motion">
          <Paper p="md" withBorder shadow="sm" mb="md">
            <Title order={2} mb="md">Motion Preferences</Title>
            
            <Text mb="md">
              Our application respects users' motion preferences and provides options to reduce or
              disable animations.
            </Text>
            
            <Stack spacing="lg">
              <Box>
                <Title order={3} mb="sm">Motion Preference Settings</Title>
                <Text mb="xs">
                  Users can set their motion preference in the accessibility settings panel. We provide
                  three levels of motion:
                </Text>
                <List>
                  <List.Item>
                    <Text weight={500}>Full</Text>
                    <Text size="sm">All animations enabled with complete motion effects</Text>
                  </List.Item>
                  <List.Item>
                    <Text weight={500}>Reduced</Text>
                    <Text size="sm">Only essential animations with simplified motion</Text>
                  </List.Item>
                  <List.Item>
                    <Text weight={500}>None</Text>
                    <Text size="sm">No animations, static interface only</Text>
                  </List.Item>
                </List>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">System Preference Detection</Title>
                <Text mb="xs">
                  By default, we respect the user's system preference for reduced motion
                  (prefers-reduced-motion media query).
                </Text>
                <Code block>
                  {`// Initialize motion preferences
initializeMotionPreferences();

// The system preference is automatically detected
// Users can override it with their own preference`}
                </Code>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">Using Motion Preferences in Code</Title>
                <Text mb="xs">
                  Developers can check the user's motion preference to conditionally apply animations.
                </Text>
                <Code block>
                  {`// Check if animations should be shown
import { shouldAnimate } from '@/utils/accessibility/motionPreferences';

// For any animation
if (shouldAnimate()) {
  // Apply animation
}

// For specific animation types
if (shouldAnimate('essential')) {
  // Apply essential animation
}

if (shouldAnimate('decorative')) {
  // Apply decorative animation
}`}
                </Code>
              </Box>
              
              <Box>
                <Title order={3} mb="sm">CSS-Based Motion Preferences</Title>
                <Text mb="xs">
                  CSS animations can be conditionally applied based on the user's motion preference
                  using the <Code>data-motion</Code> attribute on the root element.
                </Text>
                <Code block>
                  {`/* Full animations */
[data-motion="full"] .element {
  transition: transform 0.3s ease;
}

/* Reduced animations */
[data-motion="reduced"] .element {
  transition: opacity 0.2s ease;
}

/* No animations */
[data-motion="none"] .element {
  transition: none;
}`}
                </Code>
              </Box>
              
              <Alert icon={<IconAlertTriangle size={16} />} color="orange">
                <Text weight={500}>Important Considerations</Text>
                <Text size="sm">
                  Always provide alternatives for animations that convey meaning, such as loading states,
                  success/error indicators, and progress feedback. Users with motion preferences set to
                  "None" should still receive this information in a static format.
                </Text>
              </Alert>
            </Stack>
          </Paper>
        </Tabs.Panel>
        
        <Tabs.Panel value="components">
          <Paper p="md" withBorder shadow="sm" mb="md">
            <Title order={2} mb="md">Accessible Components</Title>
            
            <Text mb="md">
              We have created several accessible components to help build inclusive user interfaces.
            </Text>
            
            <Stack spacing="lg">
              <Box>
                <Title order={3} mb="sm">SkipLink</Title>
                <Text mb="xs">
                  Allows keyboard users to skip navigation and jump directly to the main content.
                </Text>
                <Code block>
                  {`<SkipLink targetId="main-content" label="Skip to main content" />`}
                </Code>
              </Box>
              
              <Divider />
              
              <Box>
                <Title order={3} mb="sm">AccessibleModal</Title>
                <Text mb="xs">
                  An enhanced modal component with proper focus management, screen reader announcements,
                  and RTL support.
                </Text>
                <Code block>
                  {`<AccessibleModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  ariaLabel="Modal description for screen readers"
  announceOnOpen={true}
  announceOnClose={true}
>
  Modal content
</AccessibleModal>`}
                </Code>
              </Box>
              
              <Divider />
              
              <Box>
                <Title order={3} mb="sm">LanguageSwitcher</Title>
                <Text mb="xs">
                  Allows users to select their preferred language with different display variants.
                </Text>
                <Code block>
                  {`// Dropdown variant
<LanguageSwitcher variant="dropdown" />

// Buttons variant
<LanguageSwitcher variant="buttons" />

// Menu variant
<LanguageSwitcher variant="menu" />

// With custom options
<LanguageSwitcher showLabel={false} showIcon={true} buttonSize="sm" />`}
                </Code>
              </Box>
              
              <Divider />
              
              <Box>
                <Title order={3} mb="sm">MotionPreferenceSelector</Title>
                <Text mb="xs">
                  Allows users to set their motion preference with different display options.
                </Text>
                <Code block>
                  {`// Standard display
<MotionPreferenceSelector />

// Compact display
<MotionPreferenceSelector compact={true} />

// Without reset button
<MotionPreferenceSelector showReset={false} />

// Without tooltips
<MotionPreferenceSelector showTooltips={false} />`}
                </Code>
              </Box>
              
              <Divider />
              
              <Box>
                <Title order={3} mb="sm">KeyboardShortcutsHelp</Title>
                <Text mb="xs">
                  Displays a modal with all available keyboard shortcuts, categorized for easy reference.
                </Text>
                <Code block>
                  {`// Define your shortcuts
const shortcuts = [
  {
    key: 'h',
    description: 'Go to home page',
    category: 'Navigation',
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Save current form',
    category: 'Actions',
  },
  // ...more shortcuts
];

// Display the shortcuts help
<KeyboardShortcutsHelp shortcuts={shortcuts} />`}
                </Code>
              </Box>
              
              <Divider />
              
              <Box>
                <Title order={3} mb="sm">AccessibilitySettings</Title>
                <Text mb="xs">
                  A comprehensive settings panel for all accessibility options, including language,
                  motion preferences, text size, and high contrast mode.
                </Text>
                <Code block>
                  {`// Standard display
<AccessibilitySettings />

// With icon only
<AccessibilitySettings buttonVariant="icon" />

// With text only
<AccessibilitySettings buttonVariant="text" />

// With custom size
<AccessibilitySettings buttonSize="lg" />`}
                </Code>
              </Box>
              
              <Alert icon={<IconWorld size={16} />} color="green" variant="light">
                <Text weight={500}>Providers</Text>
                <Text size="sm">
                  All accessibility features are available through context providers that should be
                  included in your application's root component:
                </Text>
                <Code mt="xs" block>
                  {`// Main providers
<I18nProvider messages={messages} initialLang="en">
  <RTLProvider>
    {/* Rest of your application */}
  </RTLProvider>
</I18nProvider>`}
                </Code>
              </Alert>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
      
      <Paper p="md" withBorder shadow="sm" mt="xl">
        <Title order={2} mb="md">Testing Accessibility</Title>
        
        <Text mb="md">
          We have implemented comprehensive testing for all accessibility features, including both
          unit tests and integration tests.
        </Text>
        
        <Stack spacing="md">
          <Box>
            <Title order={3} mb="sm">Accessibility Matchers</Title>
            <Text mb="xs">
              We have custom Jest matchers for accessibility testing, such as <Code>toBeAccessible</Code>,
              which checks for alt text or ARIA labels.
            </Text>
            <Code block>
              {`// Test that an element is accessible
it('has appropriate accessibility attributes', () => {
  const { getByRole } = render(<MyComponent />);
  const element = getByRole('button');
  expect(element).toBeAccessible();
});`}
            </Code>
          </Box>
          
          <Box>
            <Title order={3} mb="sm">Testing Screen Reader Announcements</Title>
            <Text mb="xs">
              We test that screen reader announcements are made when expected.
            </Text>
            <Code block>
              {`// Test that an announcement is made
it('announces success message', () => {
  // Mock the announce function
  const announceMock = jest.fn();
  jest.mock('@/utils/accessibility/announcer', () => ({
    announce: announceMock,
  }));
  
  // Render component and trigger action
  const { getByRole } = render(<MyComponent />);
  fireEvent.click(getByRole('button'));
  
  // Check that announce was called with expected message
  expect(announceMock).toHaveBeenCalledWith(
    'Success message',
    'polite'
  );
});`}
            </Code>
          </Box>
          
          <Box>
            <Title order={3} mb="sm">Testing Keyboard Navigation</Title>
            <Text mb="xs">
              We test keyboard navigation to ensure that all interactive elements are properly focusable.
            </Text>
            <Code block>
              {`// Test keyboard navigation
it('allows keyboard navigation', () => {
  const { getByRole } = render(<MyComponent />);
  
  // Focus the first button
  const button = getByRole('button');
  button.focus();
  
  // Press Tab to move focus to the next element
  fireEvent.keyDown(document.activeElement, { key: 'Tab' });
  
  // Check that focus moved to the next element
  expect(document.activeElement).toBe(getByRole('textbox'));
});`}
            </Code>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}