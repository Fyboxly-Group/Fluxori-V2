import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Stack, 
  Title, 
  Text, 
  Divider,

  Group,
  Switch,
  useMantineTheme,
} from '@mantine/core';
import { IconAccessible, IconCheck } from '@tabler/icons-react';
import { AccessibleModal } from './AccessibleModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MotionPreferenceSelector } from './MotionPreferenceSelector';
import { useI18n } from '@/hooks/accessibility/useI18n';
import { useRTL } from './RTLProvider';
import { setupKeyboardDetection } from '@/utils/accessibility/keyboard';
import { announce } from '@/utils/accessibility/announcer';

interface AccessibilitySettingsProps {
  buttonVariant?: 'icon' | 'text' | 'both';
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disableKeyboardDetection?: boolean;
}

export function AccessibilitySettings({
  buttonVariant = 'both',
  buttonSize = 'sm',
  disableKeyboardDetection = false,
}: AccessibilitySettingsProps) {
  const theme = useMantineTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useI18n();
  const { direction, toggleDirection } = useRTL();
  const [fontScale, setFontScale] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  
  // Setup keyboard detection
  useEffect(() => {
    if (!disableKeyboardDetection) {
      setupKeyboardDetection();
    }
    
    // Add keyboard shortcut for accessibility panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' && e.altKey && e.shiftKey) {
        e.preventDefault();
        setIsOpen(true);
        announce('Accessibility settings panel opened', 'assertive');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disableKeyboardDetection]);
  
  // Apply font scaling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = `${fontScale}%`;
    }
  }, [fontScale]);
  
  // Apply high contrast mode
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (highContrast) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
      } else {
        document.documentElement.removeAttribute('data-high-contrast');
      }
    }
  }, [highContrast]);
  
  const handleFontSizeChange = (newSize: number) => {
    setFontScale(newSize);
    announce(`Font size set to ${newSize} percent`, 'polite');
  };
  
  const handleHighContrastChange = (checked: boolean) => {
    setHighContrast(checked);
    announce(`High contrast mode ${checked ? 'enabled' : 'disabled'}`, 'polite');
  };
  
  // Button content based on variant
  const buttonContent = () => {
    if (buttonVariant === 'icon') {
      return <IconAccessible size={18} />;
    } else if (buttonVariant === 'text') {
      return 'Accessibility';
    } else {
      return (
        <>
          <IconAccessible size={18} />
          <Text>Accessibility</Text>
        </>
      );
    }
  };
  
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="subtle"
        size={buttonSize}
        aria-label="Open accessibility settings"
        leftIcon={buttonVariant === 'both' ? <IconAccessible size={18} /> : undefined}
      >
        {buttonContent()}
      </Button>
      
      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Accessibility Settings"
        size="md"
        ariaLabel="Accessibility Settings Panel"
      >
        <Stack spacing="md" p="md">
          <Box>
            <Title order={3} mb="xs">Language & Direction</Title>
            <Text size="sm" color="dimmed" mb="sm">
              Choose your preferred language and text direction
            </Text>
            
            <Group position="apart" align="flex-start">
              <Box>
                <Text weight={500} mb="xs">Language</Text>
                <LanguageSwitcher variant="dropdown" />
              </Box>
              
              <Box>
                <Text weight={500} mb="xs">Text Direction</Text>
                <Button
                  onClick={toggleDirection}
                  variant="light"
                  rightIcon={direction === 'rtl' ? <IconCheck size={14} /> : undefined}
                >
                  {direction === 'ltr' ? 'Left to Right' : 'Right to Left'}
                </Button>
              </Box>
            </Group>
          </Box>
          
          <Divider />
          
          <Box>
            <Title order={3} mb="xs">Motion & Animation</Title>
            <Text size="sm" color="dimmed" mb="sm">
              Adjust animation settings based on your preference
            </Text>
            
            <MotionPreferenceSelector showTooltips showReset />
          </Box>
          
          <Divider />
          
          <Box>
            <Title order={3} mb="xs">Text & Display</Title>
            <Text size="sm" color="dimmed" mb="sm">
              Customize text size and contrast settings
            </Text>
            
            <Stack spacing="sm">
              <Box>
                <Text weight={500} mb="xs">Font Size</Text>
                <Group spacing="md">
                  {[75, 100, 125, 150, 175].map(size => (
                    <Button
                      key={size}
                      variant={fontScale === size ? 'filled' : 'light'}
                      size="sm"
                      compact
                      onClick={() => handleFontSizeChange(size)}
                    >
                      {size}%
                    </Button>
                  ))}
                </Group>
              </Box>
              
              <Box>
                <Group position="apart">
                  <Text weight={500}>High Contrast Mode</Text>
                  <Switch
                    checked={highContrast}
                    onChange={(event) => handleHighContrastChange(event.currentTarget.checked)}
                    aria-label="Toggle high contrast mode"
                  />
                </Group>
                <Text size="sm" color="dimmed">
                  Increase contrast for better readability
                </Text>
              </Box>
            </Stack>
          </Box>
          
          <Divider />
          
          <Box>
            <Title order={3} mb="xs">Keyboard Navigation</Title>
            <Text size="sm" mb="sm">
              Keyboard shortcuts for quick access:
            </Text>
            
            <Stack spacing="xs">
              <Text size="sm">
                • <strong>Shift + ?</strong>: Open keyboard shortcuts help
              </Text>
              <Text size="sm">
                • <strong>Alt + Shift + A</strong>: Open this accessibility panel
              </Text>
              <Text size="sm">
                • <strong>Tab</strong>: Navigate between interactive elements
              </Text>
              <Text size="sm">
                • <strong>Esc</strong>: Close dialogs or menus
              </Text>
            </Stack>
          </Box>
        </Stack>
      </AccessibleModal>
    </>
  );
}