/// <reference path="../../types/module-declarations.d.ts" />
import React from 'react';
import { Box  } from '@/utils/chakra-compat';
import { IconButton  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Bell } from 'lucide-react';
import { ResponsiveValue } from '../../utils/chakra-utils';

interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  variant?: string;
  position?: string;
  ariaLabel?: string;
  icon?: React.ReactElement;
  isRound?: boolean;
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
}

export function NotificationBell({ count = 0, onClick }: NotificationBellProps) {
  return (
    <Box position="relative" display="inline-block">
      <IconButton
        aria-label="Notifications"
        icon={<Bell size={18}  />}
        variant="ghost"
        onClick={onClick}
      />
      {count > 0 && (
        <Badge
          colorScheme="red"
          borderRadius="full"
          position="absolute"
          top="-2px"
          right="-2px"
          fontSize="0.8em"
          minW="1.6em"
          textAlign="center"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </Box>
  );
}

export default NotificationBell;