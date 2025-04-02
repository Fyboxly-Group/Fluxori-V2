import { Container, Title, Text, Paper, Stack, Group, Button, Box, Divider } from '@mantine/core';
import { SkipLink } from '@/components/accessibility/SkipLink';
import { AccessibilitySettings } from '@/components/accessibility/AccessibilitySettings';
import { LanguageSwitcher } from '@/components/accessibility/LanguageSwitcher';
import { MotionPreferenceSelector } from '@/components/accessibility/MotionPreferenceSelector';
import { KeyboardShortcutsHelp } from '@/components/accessibility/KeyboardShortcutsHelp';
import { IconAccessible, IconBraille, IconDirections, IconLanguage, IconMouse } from '@tabler/icons-react';

export default function AccessibilityPage() {
  // Sample keyboard shortcuts for the demo
  const shortcuts = [
    {
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts help',
      category: 'General',
    },
    {
      key: 'a',
      altKey: true,
      shiftKey: true,
      description: 'Open accessibility settings',
      category: 'General',
    },
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
      key: 'i',
      description: 'Go to inventory',
      category: 'Navigation',
    },
    {
      key: 'o',
      description: 'Go to orders',
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
    {
      key: 'f',
      ctrlKey: true,
      description: 'Open search',
      category: 'UI',
    },
    {
      key: 'Escape',
      description: 'Close modal or menu',
      category: 'UI',
    },
  ];

  return (
    <>
      <SkipLink targetId="main-content" />
      <KeyboardShortcutsHelp shortcuts={shortcuts} />
      
      <Container size="xl" px="md" py="xl">
        <Title order={1} mb="md" id="main-content" tabIndex={-1}>
          Accessibility Features
        </Title>
        
        <Text mb="xl">
          This page demonstrates the accessibility features implemented to ensure that the application
          is usable by everyone, regardless of abilities or preferences.
        </Text>
        
        <Stack spacing="xl">
          <Paper p="md" withBorder shadow="sm">
            <Group position="apart" align="flex-start" noWrap>
              <Box>
                <Group mb="sm">
                  <IconAccessible size={24} />
                  <Title order={2}>Accessibility Settings</Title>
                </Group>
                <Text>
                  A comprehensive accessibility panel that allows users to customize their experience,
                  including language preferences, motion preferences, font size, and high contrast mode.
                </Text>
              </Box>
              
              <AccessibilitySettings buttonVariant="both" />
            </Group>
          </Paper>
          
          <Paper p="md" withBorder shadow="sm">
            <Group position="apart" align="flex-start" noWrap>
              <Box>
                <Group mb="sm">
                  <IconLanguage size={24} />
                  <Title order={2}>Language Selection</Title>
                </Group>
                <Text>
                  Users can select their preferred language from multiple options.
                  The interface automatically adapts to the selected language.
                </Text>
              </Box>
              
              <LanguageSwitcher variant="dropdown" />
            </Group>
            
            <Divider my="md" />
            
            <Text weight={500} mb="sm">Alternative Display Options:</Text>
            <Group>
              <LanguageSwitcher variant="buttons" />
            </Group>
          </Paper>
          
          <Paper p="md" withBorder shadow="sm">
            <Group position="apart" align="flex-start" noWrap>
              <Box>
                <Group mb="sm">
                  <IconDirections size={24} />
                  <Title order={2}>Motion Preferences</Title>
                </Group>
                <Text>
                  Users can adjust animation settings based on their preference or needs.
                  Options include full animations, reduced animations, or no animations.
                </Text>
              </Box>
              
              <MotionPreferenceSelector />
            </Group>
          </Paper>
          
          <Paper p="md" withBorder shadow="sm">
            <Group mb="sm">
              <IconMouse size={24} />
              <Title order={2}>Keyboard Navigation</Title>
            </Group>
            <Text mb="md">
              The application fully supports keyboard navigation. Users can navigate
              through interactive elements using the Tab key and activate them with Enter.
              Many convenient keyboard shortcuts are also available.
            </Text>
            
            <Button variant="light" mb="md">Try tabbing to this button</Button>
            
            <Text>
              Press <strong>Shift + ?</strong> anywhere in the application to view all available keyboard shortcuts.
            </Text>
          </Paper>
          
          <Paper p="md" withBorder shadow="sm">
            <Group mb="sm">
              <IconBraille size={24} />
              <Title order={2}>Screen Reader Support</Title>
            </Group>
            <Text>
              The application is designed to work with screen readers. All interactive elements
              have appropriate ARIA attributes, and dynamic content changes are announced to
              screen readers. The application also provides skip links for easier navigation.
            </Text>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}