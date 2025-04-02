import { useState, useEffect } from 'react';
import { 
  Modal, 
  Text, 
  createStyles, 
  Button, 
  Table, 
  Kbd, 
  Group, 
  ScrollArea,
  Tabs,
  useMantineColorScheme,
} from '@mantine/core';
import { IconKeyboard, IconCommand, IconBrandMeta } from '@tabler/icons-react';
import { setupKeyboardShortcuts } from '@/utils/accessibility/keyboard';
import { useI18n } from '@/hooks/accessibility/useI18n';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  category: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  additionalCategories?: string[];
}

const useStyles = createStyles((theme) => ({
  shortcutItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.xs}px 0`,
    borderBottom: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    
    '&:last-of-type': {
      borderBottom: 'none',
    },
  },
  
  modalBody: {
    padding: 0,
  },
  
  commandKey: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  keyGroup: {
    display: 'flex',
    gap: theme.spacing.xs,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  
  toggleButton: {
    position: 'fixed',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1000,
    boxShadow: theme.shadows.md,
    borderRadius: theme.radius.xl,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
  },
}));

export function KeyboardShortcutsHelp({
  shortcuts,
  additionalCategories = [],
}: KeyboardShortcutsHelpProps) {
  const { classes } = useStyles();
  const { colorScheme } = useMantineColorScheme();
  const { t } = useI18n();
  const [opened, setOpened] = useState(false);
  const isDarkMode = colorScheme === 'dark';
  
  // Set up the keyboard shortcut to open the help modal
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts([
      {
        key: '?',
        shiftKey: true,
        handler: () => setOpened(true),
      },
    ]);
    
    return cleanup;
  }, []);
  
  // Get unique categories
  const categories = [
    'Navigation',
    'Actions',
    'UI',
    ...additionalCategories,
    // Add any shortcuts with categories not in the list above
    ...Array.from(new Set(shortcuts.map(s => s.category))),
  ];
  
  // Format the key combination for display
  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
    
    return (
      <Group spacing="xs" className={classes.keyGroup}>
        {shortcut.metaKey && (
          <Kbd className={classes.commandKey}>
            {isMac ? <IconCommand size={14} /> : <IconBrandMeta size={14} />}
          </Kbd>
        )}
        {shortcut.ctrlKey && <Kbd>Ctrl</Kbd>}
        {shortcut.altKey && <Kbd>{isMac ? 'Option' : 'Alt'}</Kbd>}
        {shortcut.shiftKey && <Kbd>Shift</Kbd>}
        <Kbd>{shortcut.key.toUpperCase()}</Kbd>
      </Group>
    );
  };

  return (
    <>
      <Button
        leftIcon={<IconKeyboard size={18} />}
        className={classes.toggleButton}
        onClick={() => setOpened(true)}
        variant="filled"
        size="sm"
        color="gray"
      >
        Keyboard Shortcuts
      </Button>
      
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Keyboard Shortcuts"
        size="lg"
        classNames={{ body: classes.modalBody }}
      >
        <Tabs defaultValue="Navigation">
          <Tabs.List>
            {categories.map(category => (
              <Tabs.Tab key={category} value={category}>
                {category}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          
          {categories.map(category => (
            <Tabs.Panel key={category} value={category} pt="md">
              <ScrollArea style={{ height: 400 }}>
                <Table striped highlightOnHover>
                  <thead>
                    <tr>
                      <th>Shortcut</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortcuts
                      .filter(shortcut => shortcut.category === category)
                      .map((shortcut, index) => (
                        <tr key={index}>
                          <td>{formatShortcut(shortcut)}</td>
                          <td>
                            <Text>{shortcut.description}</Text>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </ScrollArea>
            </Tabs.Panel>
          ))}
        </Tabs>
        
        <Text size="sm" color="dimmed" mt="md" p="md">
          Press <Kbd>Shift</Kbd> + <Kbd>?</Kbd> to open this dialog anytime.
        </Text>
      </Modal>
    </>
  );
}