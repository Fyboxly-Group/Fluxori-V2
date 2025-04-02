import React, { useState, useRef, useEffect } from 'react';
import { ActionIcon, Badge, Indicator, Menu, ThemeIcon, Text, createStyles, Group, Divider, Button, Box } from '@mantine/core';
import { IconBell, IconCheck, IconEye } from '@tabler/icons-react';
import { useHover } from '@mantine/hooks';
import gsap from 'gsap';
import { useAnimatedMount } from '@/hooks/useAnimation';

// Create styles for the component
const useStyles = createStyles((theme) => ({
  bellContainer: {
    position: 'relative',
  },
  indicator: {
    zIndex: 2,
  },
  notificationItem: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },
  notificationHeader: {
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
  },
  notificationFooter: {
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
  },
  markAllButton: {
    opacity: 0.7,
    '&:hover': {
      opacity: 1,
    },
  },
}));

// Notification types
export interface Notification {
  id: string;
  message: string;
  date: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  category?: string;
}

export interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewAllClick: () => void;
  maxPreview?: number;
  loading?: boolean;
}

/**
 * NotificationBell component with animation and real-time notification handling
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAllClick,
  maxPreview = 5,
  loading = false,
}) => {
  const { classes } = useStyles();
  const bellRef = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState(false);
  const { hovered, ref: hoverRef } = useHover<HTMLButtonElement>();
  const unreadCount = notifications.filter(n => !n.read).length;
  const menuRef = useAnimatedMount('fadeInUp', { duration: 0.3, disabled: !opened });
  
  // Combine refs for the bell
  const setRefs = (element: HTMLButtonElement | null) => {
    bellRef.current = element;
    if (typeof hoverRef === 'function') {
      hoverRef(element);
    } else if (hoverRef) {
      hoverRef.current = element;
    }
  };
  
  // Animation for new notification arrival
  const animateNewNotification = () => {
    if (!bellRef.current) return;
    
    // Create animation timeline
    const tl = gsap.timeline();
    
    // Bell shake animation
    tl.to(bellRef.current, {
      rotation: -15,
      duration: 0.1,
      ease: 'power1.inOut'
    }).to(bellRef.current, {
      rotation: 15,
      duration: 0.2,
      ease: 'power1.inOut'
    }).to(bellRef.current, {
      rotation: -8,
      duration: 0.1,
      ease: 'power1.inOut'
    }).to(bellRef.current, {
      rotation: 8,
      duration: 0.1,
      ease: 'power1.inOut'
    }).to(bellRef.current, {
      rotation: 0,
      duration: 0.1,
      ease: 'power1.out'
    });
    
    // Play the animation
    tl.play();
  };
  
  // Track notification count changes to trigger animation
  const prevCountRef = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      animateNewNotification();
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);
  
  // Handle hover effect
  useEffect(() => {
    if (!bellRef.current) return;
    
    if (hovered && unreadCount > 0) {
      gsap.to(bellRef.current, {
        y: -3,
        duration: 0.2,
        ease: 'power2.out'
      });
    } else {
      gsap.to(bellRef.current, {
        y: 0,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  }, [hovered, unreadCount]);
  
  // Get notification type color
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };
  
  // Format notification date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Handle mark as read
  const handleMarkAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onMarkAsRead(id);
  };
  
  return (
    <Menu 
      width={320} 
      position="bottom-end" 
      shadow="lg"
      opened={opened}
      onChange={setOpened}
      closeOnItemClick={false}
    >
      <Menu.Target>
        <Indicator 
          offset={7} 
          label={unreadCount > 0 ? unreadCount : undefined} 
          size={16} 
          disabled={unreadCount === 0}
          withBorder
          className={classes.indicator}
        >
          <ActionIcon
            ref={setRefs}
            variant="default"
            size="lg"
            radius="md"
            className={classes.bellContainer}
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>
      
      <Menu.Dropdown ref={menuRef}>
        <Box className={classes.notificationHeader}>
          <Group position="apart">
            <Text weight={600}>Notifications</Text>
            {unreadCount > 0 && (
              <Button 
                variant="subtle" 
                compact 
                size="xs" 
                onClick={onMarkAllAsRead}
                className={classes.markAllButton}
                rightIcon={<IconCheck size={14} />}
              >
                Mark all as read
              </Button>
            )}
          </Group>
        </Box>
        
        {notifications.length === 0 && !loading && (
          <Text color="dimmed" align="center" py="md">
            No notifications yet
          </Text>
        )}
        
        {loading && (
          <Text color="dimmed" align="center" py="md">
            Loading notifications...
          </Text>
        )}
        
        {notifications.slice(0, maxPreview).map((notification) => {
          // Create and animate each notification
          const itemRef = React.useRef<HTMLDivElement>(null);
          
          // When notification is read, trigger fade transition
          React.useEffect(() => {
            if (!notification.read && itemRef.current) {
              gsap.fromTo(
                itemRef.current,
                { x: -10, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
              );
            }
          }, [notification.read]);
          
          return (
            <div key={notification.id} ref={itemRef}>
              <Box className={classes.notificationItem}>
                <Group position="apart" noWrap>
                  <Group spacing="xs" noWrap style={{ flex: 1 }}>
                    <ThemeIcon 
                      size="sm" 
                      color={getNotificationTypeColor(notification.type)}
                      variant={notification.read ? 'light' : 'filled'}
                    >
                      <IconBell size={14} />
                    </ThemeIcon>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text 
                        size="sm" 
                        weight={notification.read ? 400 : 600} 
                        lineClamp={2}
                      >
                        {notification.message}
                      </Text>
                      <Group position="apart" mt={4}>
                        <Text size="xs" color="dimmed">
                          {formatDate(notification.date)}
                        </Text>
                        {!notification.read && (
                          <Button 
                            variant="subtle" 
                            compact 
                            size="xs"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            p={0}
                            style={{ height: 20 }}
                          >
                            Mark as read
                          </Button>
                        )}
                      </Group>
                    </div>
                  </Group>
                </Group>
              </Box>
              <Divider />
            </div>
          );
        })}
        
        {notifications.length > maxPreview && (
          <Box className={classes.notificationFooter}>
            <Button 
              fullWidth 
              variant="subtle" 
              size="xs" 
              onClick={onViewAllClick}
              rightIcon={<IconEye size={14} />}
            >
              View all notifications ({notifications.length})
            </Button>
          </Box>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default NotificationBell;