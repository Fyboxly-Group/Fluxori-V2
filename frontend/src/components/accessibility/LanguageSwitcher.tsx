import { useState } from 'react';
import { Menu, Button, createStyles, UnstyledButton, Group, Text } from '@mantine/core';
import { useI18n } from '@/hooks/accessibility/useI18n';
import { supportedLocales } from '@/utils/accessibility/i18n';
import { useRTL } from './RTLProvider';
import { IconWorld, IconCheck } from '@tabler/icons-react';

interface LanguageSwitcherProps {
  variant?: 'menu' | 'dropdown' | 'buttons';
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  showIcon?: boolean;
}

const useStyles = createStyles((theme) => ({
  languageButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    transition: 'background-color 0.2s ease',
    
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' 
        ? theme.colors.dark[5] 
        : theme.colors.gray[1],
    },
  },
  
  active: {
    backgroundColor: theme.colorScheme === 'dark' 
      ? theme.colors.dark[6] 
      : theme.colors.gray[2],
  },

  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
}));

export function LanguageSwitcher({
  variant = 'menu',
  buttonSize = 'sm',
  showLabel = true,
  showIcon = true,
}: LanguageSwitcherProps) {
  const { classes, cx } = useStyles();
  const { language, setLanguage } = useI18n();
  const { direction } = useRTL();
  const [opened, setOpened] = useState(false);
  
  // Flags for languages
  const languageFlags: Record<string, string> = {
    en: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    ar: '🇸🇦',
    zh: '🇨🇳',
  };
  
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setOpened(false);
  };
  
  // For menu and dropdown variants
  const menuItems = Object.entries(supportedLocales).map(([code, name]) => (
    <Menu.Item
      key={code}
      icon={
        <>
          {languageFlags[code]}{' '}
          {language === code && <IconCheck size={14} stroke={1.5} />}
        </>
      }
      onClick={() => handleLanguageChange(code)}
    >
      {name}
    </Menu.Item>
  ));
  
  // For buttons variant
  const buttons = Object.entries(supportedLocales).map(([code, name]) => (
    <UnstyledButton
      key={code}
      className={cx(classes.languageButton, { [classes.active]: language === code })}
      onClick={() => handleLanguageChange(code)}
      aria-label={`Switch to ${name}`}
    >
      <Group spacing="xs" noWrap>
        {languageFlags[code]}
        <Text size="sm">{name}</Text>
      </Group>
    </UnstyledButton>
  ));
  
  if (variant === 'buttons') {
    return <div className={classes.buttonGroup}>{buttons}</div>;
  }
  
  if (variant === 'dropdown') {
    return (
      <Menu
        dir={direction}
        position="bottom-end"
        opened={opened}
        onChange={setOpened}
      >
        <Menu.Target>
          <Button
            size={buttonSize}
            variant="subtle"
            leftIcon={showIcon ? <IconWorld size={18} /> : undefined}
            aria-label="Change language"
          >
            {showLabel ? supportedLocales[language] : languageFlags[language]}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>{menuItems}</Menu.Dropdown>
      </Menu>
    );
  }
  
  // Default to menu variant
  return (
    <Menu
      dir={direction}
      position="bottom-end"
      opened={opened}
      onChange={setOpened}
    >
      <Menu.Target>
        <Button
          size={buttonSize}
          variant="subtle"
          leftIcon={showIcon ? <IconWorld size={18} /> : undefined}
          aria-label="Change language"
        >
          {showLabel ? supportedLocales[language] : languageFlags[language]}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>{menuItems}</Menu.Dropdown>
    </Menu>
  );
}