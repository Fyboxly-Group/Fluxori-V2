import React from 'react';
import { Paper, Title, Text, Box, Divider, Group, ActionIcon, Tooltip, Stack } from '@mantine/core';
import { useAnimatedMount } from '@/hooks/useAnimation';
import { IconInfoCircle } from '@tabler/icons-react';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  info?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  rightSection?: React.ReactNode;
}

/**
 * Form section component with title, description and collapsible content
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  info,
  collapsible = false,
  defaultCollapsed = false,
  rightSection,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const contentRef = useAnimatedMount('fadeInUp', { delay: 0.1 });
  
  return (
    <Paper p="md" radius="md" withBorder>
      <Box mb={description ? 'xs' : 'md'}>
        <Group position="apart" noWrap>
          <Group spacing="xs">
            <Title order={4}>{title}</Title>
            
            {info && (
              <Tooltip label={info} width={220} multiline position="top-start">
                <ActionIcon size="sm" radius="xl" variant="subtle" color="gray">
                  <IconInfoCircle size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
          
          {rightSection && <div>{rightSection}</div>}
        </Group>
        
        {description && (
          <Text color="dimmed" size="sm" mb="md" mt={4} style={{ maxWidth: '90%' }}>
            {description}
          </Text>
        )}
      </Box>
      
      <Divider mb="md" />
      
      <Box ref={contentRef}>
        {children}
      </Box>
    </Paper>
  );
};

export default FormSection;