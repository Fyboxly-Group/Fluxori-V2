import React, { useState, useEffect } from 'react';
import {
  AppShell as MantineAppShell,
  Header,
  Navbar,
  Footer,
  Aside,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Box,
  Group,
  Title,
  ActionIcon,
  useMantineColorScheme,
  Divider,
  Breadcrumbs,
  Anchor,
  ScrollArea,
  UnstyledButton,
  ThemeIcon,
  createStyles,
  rem,
  Badge,
  Menu,
  Avatar,
} from '@mantine/core';
import { useAnimatedMount } from '@/hooks/useAnimation';
import { initGSAP } from '@/animations/gsap';
import { 
  IconSun, 
  IconMoonStars, 
  IconMenu2, 
  IconDashboard, 
  IconPackage, 
  IconTruck, 
  IconUsers, 
  IconShoppingCart, 
  IconSettings, 
  IconFileAnalytics, 
  IconBell, 
  IconSearch, 
  IconLogout, 
  IconUserCircle 
} from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import useAppStore from '@/store/useAppStore';
import useAuth from '@/hooks/useAuth';

// Create styles for the navigation items
const useStyles = createStyles((theme) => ({
  navLink: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },
  navLinkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },
  navIcon: {
    marginRight: theme.spacing.sm,
  },
  navbar: {
    borderRight: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },
  header: {
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },
  userMenu: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },
  mobileMenu: {
    [theme.fn.largerThan('xs')]: {
      display: 'none',
    },
  },
}));

// Define navigation items
const navItems = [
  { icon: IconDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: IconPackage, label: 'Inventory', href: '/inventory' },
  { icon: IconShoppingCart, label: 'Orders', href: '/orders' },
  { icon: IconTruck, label: 'Shipments', href: '/shipments' },
  { icon: IconUsers, label: 'Customers', href: '/customers' },
  { icon: IconFileAnalytics, label: 'Analytics', href: '/analytics' },
  { icon: IconSettings, label: 'Settings', href: '/settings' },
];

export interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Application main layout component with responsive sidebar and animations
 */
export const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  title = 'Fluxori V2' 
}) => {
  const theme = useMantineTheme();
  const { classes, cx } = useStyles();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Get state from store
  const { 
    sidebarOpen, 
    toggleSidebar, 
    setSidebarOpen,
    breadcrumbs,
    notifications
  } = useAppStore();
  
  // Handle mobile/tablet sidebar
  const [mobileOpened, setMobileOpened] = useState(false);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Initialize GSAP when component mounts
  useEffect(() => {
    initGSAP();
  }, []);
  
  // Animation references
  const headerRef = useAnimatedMount('fadeInUp', { duration: 0.4 });
  const navbarRef = useAnimatedMount('fadeInUp', { delay: 0.1, duration: 0.4 });
  const contentRef = useAnimatedMount('fadeInUp', { delay: 0.2, duration: 0.5 });
  
  // Handler for navigation items
  const handleNavClick = (href: string) => {
    // Close mobile sidebar when navigating
    setMobileOpened(false);
  };
  
  return (
    <MantineAppShell
      styles={{
        main: {
          background: isDark ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!mobileOpened}
          width={{ sm: 200, lg: 260 }}
          ref={navbarRef}
          className={classes.navbar}
        >
          <Navbar.Section grow component={ScrollArea}>
            {navItems.map((item) => (
              <Link 
                href={item.href} 
                key={item.label}
                passHref
                legacyBehavior
              >
                <UnstyledButton
                  component="a"
                  className={cx(classes.navLink, { [classes.navLinkActive]: pathname === item.href })}
                  onClick={() => handleNavClick(item.href)}
                >
                  <ThemeIcon variant="light" className={classes.navIcon}>
                    <item.icon size={18} />
                  </ThemeIcon>
                  <span>{item.label}</span>
                </UnstyledButton>
              </Link>
            ))}
          </Navbar.Section>
          
          <Navbar.Section>
            <Divider my="sm" />
            <Group position="center">
              <Text size="xs" color="dimmed">
                Fluxori V2 © {new Date().getFullYear()}
              </Text>
            </Group>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={60} p="md" ref={headerRef} className={classes.header}>
          <Group position="apart" sx={{ height: '100%' }}>
            <Group>
              <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                <Burger
                  opened={mobileOpened}
                  onClick={() => setMobileOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                />
              </MediaQuery>

              <Title order={4}>{title}</Title>
              
              {breadcrumbs && breadcrumbs.length > 0 && (
                <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                  <Breadcrumbs separator="→" ml="xl">
                    {breadcrumbs.map((item, index) => (
                      <div key={index}>
                        {item.href ? (
                          <Anchor component={Link} href={item.href} size="sm">
                            {item.label}
                          </Anchor>
                        ) : (
                          <Text size="sm">{item.label}</Text>
                        )}
                      </div>
                    ))}
                  </Breadcrumbs>
                </MediaQuery>
              )}
            </Group>
            
            <Group>
              <ActionIcon variant="default" size="lg">
                <IconSearch size={20} />
              </ActionIcon>
              
              <Menu 
                width={300} 
                position="bottom-end" 
                shadow="lg"
                withArrow
              >
                <Menu.Target>
                  <ActionIcon
                    variant="default"
                    size="lg"
                    sx={{ position: 'relative' }}
                  >
                    <IconBell size={20} />
                    {unreadCount > 0 && (
                      <Badge 
                        size="xs" 
                        variant="filled" 
                        color="red"
                        sx={{ position: 'absolute', top: -5, right: -5 }}
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Notifications</Menu.Label>
                  {notifications.length === 0 ? (
                    <Menu.Item>No notifications</Menu.Item>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <Menu.Item 
                        key={notification.id}
                        icon={
                          <ThemeIcon 
                            color={notification.type} 
                            variant="light" 
                            size="sm"
                          >
                            <IconBell size={14} />
                          </ThemeIcon>
                        }
                        sx={(theme) => ({
                          fontWeight: notification.read ? 400 : 600,
                        })}
                      >
                        <Text size="sm">{notification.message}</Text>
                        <Text size="xs" color="dimmed">
                          {new Date(notification.date).toLocaleTimeString()}
                        </Text>
                      </Menu.Item>
                    ))
                  )}
                  {notifications.length > 5 && (
                    <Menu.Item component={Link} href="/notifications">
                      View all notifications
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
              
              <Menu 
                width={200} 
                position="bottom-end" 
                shadow="lg"
                withArrow
                closeOnItemClick
              >
                <Menu.Target>
                  <UnstyledButton className={classes.userMenu}>
                    <Group spacing="xs">
                      <Avatar
                        size={32}
                        color="blue"
                        radius="xl"
                      >
                        {user?.name?.substring(0, 2) || 'U'}
                      </Avatar>
                      <div>
                        <Text size="sm" weight={500}>
                          {user?.name || 'User'}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {user?.email || 'user@example.com'}
                        </Text>
                      </div>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item 
                    icon={<IconUserCircle size={16} />}
                    component={Link}
                    href="/profile"
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Item 
                    icon={<IconSettings size={16} />}
                    component={Link}
                    href="/settings"
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                    icon={<IconSun size={16} />}
                    onClick={() => toggleColorScheme()}
                  >
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                    icon={<IconLogout size={16} />}
                    color="red"
                    onClick={logout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              
              <MediaQuery largerThan="xs" styles={{ display: 'none' }}>
                <Menu 
                  width={200} 
                  position="bottom-end" 
                  shadow="lg"
                  withArrow
                  className={classes.mobileMenu}
                >
                  <Menu.Target>
                    <ActionIcon size="lg" variant="default">
                      <IconMenu2 size={20} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item 
                      icon={<IconUserCircle size={16} />}
                    >
                      {user?.name || 'User'}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item 
                      icon={<IconSun size={16} />}
                      onClick={() => toggleColorScheme()}
                    >
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item 
                      icon={<IconLogout size={16} />}
                      color="red"
                      onClick={logout}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </MediaQuery>
            </Group>
          </Group>
        </Header>
      }
    >
      <Box p="md" ref={contentRef}>
        {children}
      </Box>
    </MantineAppShell>
  );
};

export default AppShell;