import { useEffect, useState } from 'react';
import { createStyles, SegmentedControl, Box, Tooltip, Text, Group } from '@mantine/core';
import { 
  IconWind, 
  IconWindOff, 
  IconBraces, 
  IconInfoCircle 
} from '@tabler/icons-react';
import { 
  getMotionPreference, 
  setMotionPreference, 
  resetMotionPreference,
  MotionPreference 
} from '@/utils/accessibility/motionPreferences';
import { useI18n } from '@/hooks/accessibility/useI18n';
import { announce } from '@/utils/accessibility/announcer';

interface MotionPreferenceSelectorProps {
  showTooltips?: boolean;
  showReset?: boolean;
  compact?: boolean;
}

const useStyles = createStyles((theme) => ({
  resetButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    color: theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[7],
    fontSize: theme.fontSizes.xs,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    
    '&:hover': {
      color: theme.colorScheme === 'dark' ? theme.colors.gray[3] : theme.colors.gray[9],
      textDecoration: 'underline',
    },
  },
  
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    alignItems: 'flex-start',
  },
  
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  }
}));

export function MotionPreferenceSelector({
  showTooltips = true,
  showReset = true,
  compact = false,
}: MotionPreferenceSelectorProps) {
  const { classes } = useStyles();
  const { t } = useI18n();
  const [preference, setPreference] = useState<MotionPreference>('full');
  
  // Get the user's current preference on mount
  useEffect(() => {
    setPreference(getMotionPreference());
    
    // Listen for preference changes from other components
    const handlePreferenceChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setPreference(customEvent.detail.preference);
    };
    
    document.addEventListener('motionpreference', handlePreferenceChange);
    
    return () => {
      document.removeEventListener('motionpreference', handlePreferenceChange);
    };
  }, []);
  
  const handleChange = (value: string) => {
    const newPreference = value as MotionPreference;
    setMotionPreference(newPreference);
    setPreference(newPreference);
    
    // Announce to screen readers
    const messages = {
      full: 'Full animations enabled',
      reduced: 'Reduced animations enabled',
      none: 'Animations disabled',
    };
    announce(messages[newPreference]);
  };
  
  const handleReset = () => {
    resetMotionPreference();
    const newPreference = getMotionPreference();
    setPreference(newPreference);
    
    // Announce to screen readers
    announce('Animation preferences reset to system default');
  };
  
  const getTooltipLabel = (preference: MotionPreference) => {
    switch (preference) {
      case 'full':
        return 'Full animations with complete motion effects';
      case 'reduced':
        return 'Essential animations only, with simplified motion';
      case 'none':
        return 'No animations, static interface only';
      default:
        return '';
    }
  };
  
  return (
    <div className={classes.container}>
      <SegmentedControl
        value={preference}
        onChange={handleChange}
        data={
          compact
            ? [
                {
                  value: 'full',
                  label: (
                    <Box className={classes.iconWrapper}>
                      <Tooltip 
                        label={showTooltips ? getTooltipLabel('full') : ''} 
                        disabled={!showTooltips}
                      >
                        <IconWind size={18} />
                      </Tooltip>
                    </Box>
                  ),
                },
                {
                  value: 'reduced',
                  label: (
                    <Box className={classes.iconWrapper}>
                      <Tooltip 
                        label={showTooltips ? getTooltipLabel('reduced') : ''} 
                        disabled={!showTooltips}
                      >
                        <IconBraces size={18} />
                      </Tooltip>
                    </Box>
                  ),
                },
                {
                  value: 'none',
                  label: (
                    <Box className={classes.iconWrapper}>
                      <Tooltip 
                        label={showTooltips ? getTooltipLabel('none') : ''} 
                        disabled={!showTooltips}
                      >
                        <IconWindOff size={18} />
                      </Tooltip>
                    </Box>
                  ),
                },
              ]
            : [
                {
                  value: 'full',
                  label: (
                    <Tooltip 
                      label={showTooltips ? getTooltipLabel('full') : ''} 
                      disabled={!showTooltips}
                    >
                      <Group spacing="xs">
                        <IconWind size={18} />
                        <Text size="sm">Full</Text>
                      </Group>
                    </Tooltip>
                  ),
                },
                {
                  value: 'reduced',
                  label: (
                    <Tooltip 
                      label={showTooltips ? getTooltipLabel('reduced') : ''} 
                      disabled={!showTooltips}
                    >
                      <Group spacing="xs">
                        <IconBraces size={18} />
                        <Text size="sm">Reduced</Text>
                      </Group>
                    </Tooltip>
                  ),
                },
                {
                  value: 'none',
                  label: (
                    <Tooltip 
                      label={showTooltips ? getTooltipLabel('none') : ''} 
                      disabled={!showTooltips}
                    >
                      <Group spacing="xs">
                        <IconWindOff size={18} />
                        <Text size="sm">None</Text>
                      </Group>
                    </Tooltip>
                  ),
                },
              ]
        }
      />
      
      {showReset && (
        <Tooltip label="Use your system's motion preference setting">
          <Group spacing="xs" className={classes.resetButton} onClick={handleReset}>
            <IconInfoCircle size={14} />
            <Text size="xs">Reset to system default</Text>
          </Group>
        </Tooltip>
      )}
    </div>
  );
}