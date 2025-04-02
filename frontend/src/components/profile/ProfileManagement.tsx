import React, { useRef, useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Avatar,
  Text,
  Group,
  Title,
  Stack,
  Button,
  TextInput,
  Tabs,
  Select,
  Switch,
  Divider,
  Grid,
  Card,
  Badge,
  Box,
  ActionIcon,
  useMantineTheme,
  Skeleton,
  SimpleGrid,
  Modal,
  PasswordInput,
  Progress,
  SegmentedControl,
  Tooltip
} from '@mantine/core';
import {
  IconUser,
  IconShield,
  IconBell,
  IconKey,
  IconDevices,
  IconPencil,
  IconDeviceFloppy,
  IconTrash,
  IconX,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconLogout,
  IconSettings,
  IconHistory,
  IconChevronRight,
  IconCheck
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import gsap from 'gsap';
import { useAnimatedMount } from '@/hooks/useAnimation';
import { useMotionPreference } from '@/hooks/useMotionPreference';

// Sample user data type
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user';
  jobTitle?: string;
  organization: string;
  organizationId: string;
  lastLogin: Date;
  createdAt: Date;
  twoFactorEnabled: boolean;
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    dailyDigest: boolean;
    aiInsights: boolean;
    pricingAlerts: boolean;
    inventoryAlerts: boolean;
    orderUpdates: boolean;
  };
  apiKeys: Array<{
    id: string;
    name: string;
    createdAt: Date;
    lastUsed?: Date;
    scopes: string[];
  }>;
  devices: Array<{
    id: string;
    name: string;
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    lastUsed: Date;
    browser: string;
    os: string;
  }>;
  motionPreference?: 'full' | 'essential' | 'minimal';
}

// Activity history entry type
interface ActivityEntry {
  id: string;
  action: string;
  timestamp: Date;
  ip?: string;
  device?: string;
  details?: string;
  category: 'security' | 'content' | 'settings' | 'auth';
}

// Sample password strength requirements
const passwordRequirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
  let multiplier = password.length > 7 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

const requirements = passwordRequirements;

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text color={meets ? 'teal' : 'red'} size="sm" mt={5}>
      <Group spacing={5}>
        {meets ? <IconCheck size={14} /> : <IconX size={14} />}
        <Text>{label}</Text>
      </Group>
    </Text>
  );
}

interface ProfileManagementProps {
  /** User profile data */
  user?: UserProfile;
  /** Whether data is loading */
  loading?: boolean;
  /** Activity history entries */
  activityHistory?: ActivityEntry[];
  /** Function called when profile is updated */
  onUpdateProfile?: (data: Partial<UserProfile>) => void;
  /** Function called when password is changed */
  onChangePassword?: (oldPassword: string, newPassword: string) => void;
  /** Function called when API key is created */
  onCreateApiKey?: (name: string, scopes: string[]) => void;
  /** Function called when API key is deleted */
  onDeleteApiKey?: (keyId: string) => void;
  /** Function called when notification preferences are updated */
  onUpdateNotificationPreferences?: (preferences: UserProfile['notificationPreferences']) => void;
  /** Function called when motion preference is updated */
  onUpdateMotionPreference?: (preference: 'full' | 'essential' | 'minimal') => void;
  /** Function called when device is removed */
  onRemoveDevice?: (deviceId: string) => void;
  /** Function called when two-factor authentication is toggled */
  onToggleTwoFactor?: (enabled: boolean) => void;
}

/**
 * Comprehensive profile and account management component
 * with animations that follow Fluxori's Motion Design Guide
 */
export const ProfileManagement: React.FC<ProfileManagementProps> = ({
  user,
  loading = false,
  activityHistory = [],
  onUpdateProfile,
  onChangePassword,
  onCreateApiKey,
  onDeleteApiKey,
  onUpdateNotificationPreferences,
  onUpdateMotionPreference,
  onRemoveDevice,
  onToggleTwoFactor
}) => {
  const theme = useMantineTheme();
  const containerRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const [activeTab, setActiveTab] = useState('profile');
  const tabContentRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordModalOpened, { open: openPasswordModal, close: closePasswordModal }] = useDisclosure(false);
  const [apiKeyModalOpened, { open: openApiKeyModal, close: closeApiKeyModal }] = useDisclosure(false);
  const [twoFactorModalOpened, { open: openTwoFactorModal, close: closeTwoFactorModal }] = useDisclosure(false);
  const { motionPreference, setUserMotionPreference } = useMotionPreference();
  
  // Form state
  const [formData, setFormData] = useState<Partial<UserProfile>>(user || {});
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [apiKeyData, setApiKeyData] = useState({
    name: '',
    scopes: ['read:inventory', 'read:orders']
  });
  
  // Password strength
  const [passwordVisible, setPasswordVisible] = useState(false);
  const strength = getStrength(passwordData.new);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(passwordData.new)} />
  ));
  
  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  // Sample user data (for demo purposes)
  const sampleUser: UserProfile = {
    id: '1234567890',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    phone: '+1 (555) 123-4567',
    role: 'admin',
    jobTitle: 'E-commerce Manager',
    organization: 'Acme Corporation',
    organizationId: 'org_123456',
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    createdAt: new Date(2023, 3, 15), // April 15, 2023
    twoFactorEnabled: true,
    notificationPreferences: {
      email: true,
      inApp: true,
      dailyDigest: false,
      aiInsights: true,
      pricingAlerts: true,
      inventoryAlerts: true,
      orderUpdates: true
    },
    apiKeys: [
      {
        id: 'key1',
        name: 'Inventory Integration',
        createdAt: new Date(2023, 6, 10),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        scopes: ['read:inventory', 'write:inventory']
      },
      {
        id: 'key2',
        name: 'Order Analytics',
        createdAt: new Date(2023, 8, 22),
        lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        scopes: ['read:orders', 'read:analytics']
      }
    ],
    devices: [
      {
        id: 'device1',
        name: 'Work Laptop',
        type: 'desktop',
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
        browser: 'Chrome 120',
        os: 'Windows 11'
      },
      {
        id: 'device2',
        name: 'iPhone 14',
        type: 'mobile',
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        browser: 'Safari',
        os: 'iOS 17'
      },
      {
        id: 'device3',
        name: 'iPad Pro',
        type: 'tablet',
        lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        browser: 'Safari',
        os: 'iPadOS 16'
      }
    ],
    motionPreference: 'full'
  };

  // Sample activity history
  const sampleActivity: ActivityEntry[] = [
    {
      id: 'act1',
      action: 'Logged in',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      category: 'auth'
    },
    {
      id: 'act2',
      action: 'Changed password',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      category: 'security'
    },
    {
      id: 'act3',
      action: 'Created API key',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      details: 'API Key: Order Analytics',
      category: 'settings'
    },
    {
      id: 'act4',
      action: 'Updated profile information',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      ip: '192.168.1.1',
      category: 'settings'
    },
    {
      id: 'act5',
      action: 'Changed notification preferences',
      timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      category: 'settings'
    }
  ];

  // Use sample data when no data is provided
  const userData = user || (loading ? undefined : sampleUser);
  const userActivity = activityHistory.length > 0 ? activityHistory : sampleActivity;

  // Handle tab change with animation
  const handleTabChange = (value: string) => {
    if (!tabContentRef.current) {
      setActiveTab(value);
      return;
    }
    
    gsap.to(tabContentRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(value);
        gsap.to(tabContentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
          delay: 0.1
        });
      }
    });
  };

  // Toggle edit mode with animation
  const toggleEditMode = () => {
    if (editMode) {
      // Save changes
      if (onUpdateProfile) {
        onUpdateProfile(formData);
      }
    }
    
    const formFields = document.querySelectorAll('.profile-form-field');
    
    if (editMode) {
      // Animation for exiting edit mode
      gsap.to(formFields, {
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        duration: 0.3,
        stagger: 0.05,
        ease: 'power2.out'
      });
    } else {
      // Animation for entering edit mode
      gsap.fromTo(formFields,
        { 
          borderColor: 'transparent',
          backgroundColor: 'transparent'
        },
        { 
          borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          boxShadow: '0 0 0 1px ' + (theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]),
          duration: 0.3,
          stagger: 0.05,
          ease: 'power2.out'
        }
      );
    }
    
    setEditMode(!editMode);
  };

  // Update form data
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle password change
  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      // Show error (in a real app)
      return;
    }
    
    if (onChangePassword) {
      onChangePassword(passwordData.current, passwordData.new);
    }
    
    setPasswordData({
      current: '',
      new: '',
      confirm: ''
    });
    
    closePasswordModal();
    
    // Show success animation on button
    const changePasswordButton = document.querySelector('.change-password-button');
    if (changePasswordButton) {
      gsap.fromTo(changePasswordButton,
        { backgroundColor: theme.colors.green[5] },
        { 
          backgroundColor: theme.colors.blue[5], 
          duration: 1,
          ease: 'power2.out'
        }
      );
    }
  };

  // Create new API key
  const handleCreateApiKey = () => {
    if (onCreateApiKey) {
      onCreateApiKey(apiKeyData.name, apiKeyData.scopes);
    }
    
    setApiKeyData({
      name: '',
      scopes: ['read:inventory', 'read:orders']
    });
    
    closeApiKeyModal();
  };

  // Delete API key with animation
  const handleDeleteApiKey = (keyId: string) => {
    const keyElement = document.querySelector(`[data-key-id="${keyId}"]`);
    
    if (keyElement) {
      gsap.to(keyElement, {
        opacity: 0,
        x: -20,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (onDeleteApiKey) {
            onDeleteApiKey(keyId);
          }
        }
      });
    } else if (onDeleteApiKey) {
      onDeleteApiKey(keyId);
    }
  };

  // Remove device with animation
  const handleRemoveDevice = (deviceId: string) => {
    const deviceElement = document.querySelector(`[data-device-id="${deviceId}"]`);
    
    if (deviceElement) {
      gsap.to(deviceElement, {
        opacity: 0,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (onRemoveDevice) {
            onRemoveDevice(deviceId);
          }
        }
      });
    } else if (onRemoveDevice) {
      onRemoveDevice(deviceId);
    }
  };

  // Toggle notification preference
  const handleNotificationToggle = (key: keyof UserProfile['notificationPreferences'], value: boolean) => {
    if (!userData) return;
    
    const updatedPreferences = {
      ...userData.notificationPreferences,
      [key]: value
    };
    
    setFormData(prev => ({
      ...prev,
      notificationPreferences: updatedPreferences
    }));
    
    if (onUpdateNotificationPreferences) {
      onUpdateNotificationPreferences(updatedPreferences);
    }
    
    // Animate the toggle
    const toggleElement = document.querySelector(`.notification-toggle-${key}`);
    if (toggleElement) {
      gsap.fromTo(toggleElement, 
        { scale: 0.8 }, 
        { 
          scale: 1, 
          duration: 0.3, 
          ease: 'elastic.out(1, 0.5)' 
        }
      );
    }
  };

  // Update motion preference
  const handleMotionPreferenceChange = (value: 'full' | 'essential' | 'minimal') => {
    setUserMotionPreference(value);
    
    if (onUpdateMotionPreference) {
      onUpdateMotionPreference(value);
    }
  };

  // Toggle two-factor authentication
  const handleToggleTwoFactor = (enabled: boolean) => {
    if (onToggleTwoFactor) {
      onToggleTwoFactor(enabled);
    }
    
    setFormData(prev => ({
      ...prev,
      twoFactorEnabled: enabled
    }));
    
    if (enabled) {
      openTwoFactorModal();
    } else {
      closeTwoFactorModal();
    }
  };

  // Format date as relative string
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get device icon
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop':
        return <IconDeviceDesktop size={18} />;
      case 'mobile':
        return <IconDeviceMobile size={18} />;
      case 'tablet':
        return <IconDeviceTablet size={18} />;
      default:
        return <IconDevices size={18} />;
    }
  };

  // Get avatar initials
  const getInitials = (): string => {
    if (!userData) return '';
    
    const first = userData.firstName?.charAt(0) || '';
    const last = userData.lastName?.charAt(0) || '';
    
    return (first + last).toUpperCase();
  };

  return (
    <Container size="xl" py="xl" ref={containerRef}>
      <Paper withBorder p="xl" radius="md" mb="xl">
        {loading ? (
          <Group noWrap align="flex-start">
            <Skeleton height={100} circle />
            <div style={{ flex: 1 }}>
              <Skeleton height={30} width="40%" mb="sm" />
              <Skeleton height={20} width="60%" mb="sm" />
              <Skeleton height={15} width="30%" />
            </div>
          </Group>
        ) : (
          <Group noWrap align="flex-start">
            <Avatar 
              src={userData?.avatar} 
              size={100} 
              radius={100} 
              color="blue"
            >
              {getInitials()}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Title order={2}>
                {userData?.firstName} {userData?.lastName}
              </Title>
              <Text size="lg" color="dimmed">
                {userData?.jobTitle || 'Team Member'} at {userData?.organization}
              </Text>
              <Group spacing={6} mt={4}>
                <Badge color="blue">{userData?.role}</Badge>
                {userData?.twoFactorEnabled && (
                  <Badge color="green" leftSection={<IconShield size={14} />}>
                    2FA Enabled
                  </Badge>
                )}
              </Group>
            </div>
            <Button 
              leftIcon={editMode ? <IconDeviceFloppy size={18} /> : <IconPencil size={18} />}
              onClick={toggleEditMode}
              variant={editMode ? 'filled' : 'outline'}
            >
              {editMode ? 'Save Profile' : 'Edit Profile'}
            </Button>
          </Group>
        )}
      </Paper>

      <Tabs value={activeTab} onTabChange={handleTabChange}>
        <Tabs.List mb="md">
          <Tabs.Tab value="profile" icon={<IconUser size={16} />}>
            Profile
          </Tabs.Tab>
          <Tabs.Tab value="security" icon={<IconShield size={16} />}>
            Security
          </Tabs.Tab>
          <Tabs.Tab value="notifications" icon={<IconBell size={16} />}>
            Notifications
          </Tabs.Tab>
          <Tabs.Tab value="api" icon={<IconKey size={16} />}>
            API Keys
          </Tabs.Tab>
          <Tabs.Tab value="devices" icon={<IconDevices size={16} />}>
            Devices
          </Tabs.Tab>
          <Tabs.Tab value="activity" icon={<IconHistory size={16} />}>
            Activity
          </Tabs.Tab>
          <Tabs.Tab value="preferences" icon={<IconSettings size={16} />}>
            Preferences
          </Tabs.Tab>
        </Tabs.List>

        <div ref={tabContentRef}>
          {activeTab === 'profile' && (
            <Paper withBorder p="xl" radius="md">
              <Title order={3} mb="md">Profile Information</Title>
              
              <Grid gutter="md">
                <Grid.Col span={12} md={6}>
                  <TextInput
                    label="First Name"
                    value={formData.firstName || ''}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                    disabled={!editMode}
                    classNames={{ input: 'profile-form-field' }}
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={12} md={6}>
                  <TextInput
                    label="Last Name"
                    value={formData.lastName || ''}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                    disabled={!editMode}
                    classNames={{ input: 'profile-form-field' }}
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={12} md={6}>
                  <TextInput
                    label="Email Address"
                    value={formData.email || ''}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    disabled={!editMode}
                    classNames={{ input: 'profile-form-field' }}
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={12} md={6}>
                  <TextInput
                    label="Phone Number"
                    value={formData.phone || ''}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    disabled={!editMode}
                    classNames={{ input: 'profile-form-field' }}
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={12} md={6}>
                  <TextInput
                    label="Job Title"
                    value={formData.jobTitle || ''}
                    onChange={(e) => handleFormChange('jobTitle', e.target.value)}
                    disabled={!editMode}
                    classNames={{ input: 'profile-form-field' }}
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={12} md={6}>
                  <Select
                    label="Role"
                    value={formData.role}
                    onChange={(value) => handleFormChange('role', value)}
                    data={[
                      { value: 'admin', label: 'Administrator' },
                      { value: 'manager', label: 'Manager' },
                      { value: 'user', label: 'Regular User' }
                    ]}
                    disabled={!editMode}
                    classNames={{ input: 'profile-form-field' }}
                    mb="md"
                  />
                </Grid.Col>
              </Grid>
              
              <Divider my="lg" />
              
              <Group position="apart">
                <div>
                  <Text size="sm" weight={500} mb={4}>Account Information</Text>
                  <Text size="xs" color="dimmed">
                    Created on {userData?.createdAt.toLocaleDateString()}
                  </Text>
                  <Text size="xs" color="dimmed">
                    Last login: {userData ? formatRelativeTime(userData.lastLogin) : 'Unknown'}
                  </Text>
                </div>
                
                <Group>
                  <Button 
                    variant="light" 
                    color="red"
                    leftIcon={<IconLogout size={16} />}
                  >
                    Sign Out
                  </Button>
                </Group>
              </Group>
            </Paper>
          )}
          
          {activeTab === 'security' && (
            <Paper withBorder p="xl" radius="md">
              <Title order={3} mb="md">Security Settings</Title>
              
              <SimpleGrid cols={1} spacing="xl">
                <Card withBorder p="lg" radius="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>Password</Text>
                      <Text size="sm" color="dimmed">
                        Change your account password
                      </Text>
                    </div>
                    
                    <Button 
                      variant="outline"
                      onClick={openPasswordModal}
                      className="change-password-button"
                    >
                      Change Password
                    </Button>
                  </Group>
                </Card>
                
                <Card withBorder p="lg" radius="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>Two-Factor Authentication</Text>
                      <Text size="sm" color="dimmed">
                        Add an extra layer of security to your account
                      </Text>
                      <Text size="xs" mt={4} color={userData?.twoFactorEnabled ? 'green' : 'dimmed'}>
                        {userData?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </Text>
                    </div>
                    
                    <Switch
                      checked={userData?.twoFactorEnabled || false}
                      onChange={(e) => handleToggleTwoFactor(e.currentTarget.checked)}
                      size="lg"
                    />
                  </Group>
                </Card>
                
                <Card withBorder p="lg" radius="md">
                  <Group position="apart">
                    <div>
                      <Text weight={500}>Active Sessions</Text>
                      <Text size="sm" color="dimmed">
                        View and manage your active login sessions
                      </Text>
                    </div>
                    
                    <Button variant="light">
                      View Sessions
                    </Button>
                  </Group>
                </Card>
              </SimpleGrid>
            </Paper>
          )}
          
          {activeTab === 'notifications' && (
            <Paper withBorder p="xl" radius="md">
              <Title order={3} mb="md">Notification Preferences</Title>
              
              <Text mb="lg" color="dimmed">
                Configure how and when you receive notifications
              </Text>
              
              <Title order={4} mb="sm">Delivery Methods</Title>
              <SimpleGrid cols={2} spacing="md" breakpoints={[{ maxWidth: 'sm', cols: 1 }]} mb="xl">
                <Card withBorder p="lg" radius="md">
                  <Group position="apart">
                    <Text weight={500}>Email Notifications</Text>
                    <Switch
                      className={`notification-toggle-email`}
                      checked={userData?.notificationPreferences.email || false}
                      onChange={(e) => handleNotificationToggle('email', e.currentTarget.checked)}
                    />
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">
                    Receive notifications via email
                  </Text>
                </Card>
                
                <Card withBorder p="lg" radius="md">
                  <Group position="apart">
                    <Text weight={500}>In-App Notifications</Text>
                    <Switch
                      className={`notification-toggle-inApp`}
                      checked={userData?.notificationPreferences.inApp || false}
                      onChange={(e) => handleNotificationToggle('inApp', e.currentTarget.checked)}
                    />
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">
                    Receive notifications within the app
                  </Text>
                </Card>
                
                <Card withBorder p="lg" radius="md">
                  <Group position="apart">
                    <Text weight={500}>Daily Digest</Text>
                    <Switch
                      className={`notification-toggle-dailyDigest`}
                      checked={userData?.notificationPreferences.dailyDigest || false}
                      onChange={(e) => handleNotificationToggle('dailyDigest', e.currentTarget.checked)}
                    />
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">
                    Receive a daily summary of important events
                  </Text>
                </Card>
              </SimpleGrid>
              
              <Title order={4} mb="sm">Notification Categories</Title>
              <SimpleGrid cols={2} spacing="md" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                <Card withBorder p="lg" radius="md">
                  <Group position="apart">
                    <Text weight={500}>AI Insights</Text>
                    <Switch
                      className={`notification-toggle-aiInsights`}
                      checked={userData?.notificationPreferences.aiInsights || false}
                      onChange={(e) => handleNotificationToggle('aiInsights', e.currentTarget.checked)}
                    />
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">
                    New insights from our AI system
                  </Text>
                </Card>
                
                <Card withBorder p="lg" radius="md">
                  <Group position="apart">
                    <Text weight={500}>Pricing Alerts</Text>
                    <Switch
                      className={`notification-toggle-pricingAlerts`}
                      checked={userData?.notificationPreferences.pricingAlerts || false}
                      onChange={(e) => handleNotificationToggle('pricingAlerts', e.currentTarget.checked)}
                    />
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">
                    Price changes and Buy Box alerts
                  </Text>
                </Card>
                
                <Card withBorder p="lg" radius="md">
                  <Group position="apart">
                    <Text weight={500}>Inventory Alerts</Text>
                    <Switch
                      className={`notification-toggle-inventoryAlerts`}
                      checked={userData?.notificationPreferences.inventoryAlerts || false}
                      onChange={(e) => handleNotificationToggle('inventoryAlerts', e.currentTarget.checked)}
                    />
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">
                    Low stock and inventory issues
                  </Text>
                </Card>
                
                <Card withBorder p="lg" radius="md">
                  <Group position="apart">
                    <Text weight={500}>Order Updates</Text>
                    <Switch
                      className={`notification-toggle-orderUpdates`}
                      checked={userData?.notificationPreferences.orderUpdates || false}
                      onChange={(e) => handleNotificationToggle('orderUpdates', e.currentTarget.checked)}
                    />
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">
                    Order status changes and updates
                  </Text>
                </Card>
              </SimpleGrid>
            </Paper>
          )}
          
          {activeTab === 'api' && (
            <Paper withBorder p="xl" radius="md">
              <Group position="apart" mb="lg">
                <Title order={3}>API Keys</Title>
                <Button 
                  leftIcon={<IconPlus size={16} />}
                  onClick={openApiKeyModal}
                >
                  Create New Key
                </Button>
              </Group>
              
              <Text mb="lg" color="dimmed">
                API keys allow external applications to authenticate with the Fluxori API.
              </Text>
              
              {loading ? (
                <div>
                  <Skeleton height={100} radius="md" mb="md" />
                  <Skeleton height={100} radius="md" mb="md" />
                </div>
              ) : userData?.apiKeys && userData.apiKeys.length > 0 ? (
                <Stack spacing="md">
                  {userData.apiKeys.map((key) => (
                    <Card 
                      key={key.id} 
                      withBorder 
                      data-key-id={key.id}
                      sx={{ overflow: 'visible' }}
                    >
                      <Group position="apart">
                        <div>
                          <Text weight={500}>{key.name}</Text>
                          <Text size="xs" color="dimmed" mt={2}>
                            Created: {key.createdAt.toLocaleDateString()}
                          </Text>
                          {key.lastUsed && (
                            <Text size="xs" color="dimmed">
                              Last used: {formatRelativeTime(key.lastUsed)}
                            </Text>
                          )}
                        </div>
                        
                        <Group>
                          <Box>
                            <Text size="xs" color="dimmed" mb={2}>Scopes:</Text>
                            <Group spacing={4}>
                              {key.scopes.map((scope) => (
                                <Badge key={scope} size="sm">{scope}</Badge>
                              ))}
                            </Group>
                          </Box>
                          
                          <ActionIcon 
                            color="red" 
                            variant="subtle"
                            onClick={() => handleDeleteApiKey(key.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Card withBorder p="lg" radius="md">
                  <Stack align="center" spacing="sm" py="md">
                    <IconKey size={48} opacity={0.2} />
                    <Text align="center">No API keys found</Text>
                    <Text size="sm" color="dimmed" align="center">
                      Create your first API key to integrate with external services
                    </Text>
                    <Button 
                      variant="outline"
                      leftIcon={<IconPlus size={16} />}
                      onClick={openApiKeyModal}
                      mt="sm"
                    >
                      Create New Key
                    </Button>
                  </Stack>
                </Card>
              )}
            </Paper>
          )}
          
          {activeTab === 'devices' && (
            <Paper withBorder p="xl" radius="md">
              <Title order={3} mb="lg">Connected Devices</Title>
              
              {loading ? (
                <div>
                  <Skeleton height={100} radius="md" mb="md" />
                  <Skeleton height={100} radius="md" mb="md" />
                  <Skeleton height={100} radius="md" mb="md" />
                </div>
              ) : userData?.devices && userData.devices.length > 0 ? (
                <Stack spacing="md">
                  {userData.devices.map((device) => (
                    <Card 
                      key={device.id} 
                      withBorder 
                      p="lg" 
                      data-device-id={device.id}
                    >
                      <Group position="apart">
                        <Group>
                          <ThemeIcon 
                            size="xl" 
                            variant="light" 
                            color="blue" 
                            radius="xl"
                          >
                            {getDeviceIcon(device.type)}
                          </ThemeIcon>
                          
                          <div>
                            <Group spacing={8}>
                              <Text weight={500}>{device.name}</Text>
                              {device.lastUsed && 
                               new Date().getTime() - device.lastUsed.getTime() < 2 * 60 * 60 * 1000 && (
                                <Badge color="green" size="xs">Active Now</Badge>
                              )}
                            </Group>
                            <Text size="sm" color="dimmed">
                              {device.browser} on {device.os}
                            </Text>
                            <Text size="xs" color="dimmed">
                              Last active: {formatRelativeTime(device.lastUsed)}
                            </Text>
                          </div>
                        </Group>
                        
                        <Button 
                          variant="subtle" 
                          color="red"
                          compact
                          onClick={() => handleRemoveDevice(device.id)}
                        >
                          Remove
                        </Button>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Card withBorder p="lg" radius="md">
                  <Stack align="center" spacing="sm" py="md">
                    <IconDevices size={48} opacity={0.2} />
                    <Text align="center">No devices found</Text>
                    <Text size="sm" color="dimmed" align="center">
                      Your login devices will appear here
                    </Text>
                  </Stack>
                </Card>
              )}
            </Paper>
          )}
          
          {activeTab === 'activity' && (
            <Paper withBorder p="xl" radius="md">
              <Title order={3} mb="lg">Activity History</Title>
              
              {loading ? (
                <div>
                  <Skeleton height={60} radius="md" mb="md" />
                  <Skeleton height={60} radius="md" mb="md" />
                  <Skeleton height={60} radius="md" mb="md" />
                  <Skeleton height={60} radius="md" mb="md" />
                </div>
              ) : userActivity.length > 0 ? (
                <div>
                  {userActivity.map((activity) => (
                    <Paper 
                      key={activity.id} 
                      withBorder 
                      p="md" 
                      radius="md" 
                      mb="md"
                      sx={(theme) => ({
                        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(5px)'
                        }
                      })}
                    >
                      <Group position="apart">
                        <div>
                          <Group spacing={6}>
                            <Text weight={500}>{activity.action}</Text>
                            <Badge 
                              size="xs" 
                              color={
                                activity.category === 'security' ? 'red' :
                                activity.category === 'auth' ? 'blue' :
                                activity.category === 'content' ? 'green' :
                                'gray'
                              }
                            >
                              {activity.category}
                            </Badge>
                          </Group>
                          
                          {activity.details && (
                            <Text size="sm" color="dimmed" mt={2}>
                              {activity.details}
                            </Text>
                          )}
                          
                          <Group spacing={6} mt={4}>
                            {activity.ip && (
                              <Text size="xs" color="dimmed">IP: {activity.ip}</Text>
                            )}
                            {activity.device && (
                              <Text size="xs" color="dimmed">Device: {activity.device}</Text>
                            )}
                          </Group>
                        </div>
                        
                        <Group>
                          <Text size="sm">{formatRelativeTime(activity.timestamp)}</Text>
                          <IconChevronRight size={16} />
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                  
                  <Group position="center" mt="xl">
                    <Button variant="outline">Load More</Button>
                  </Group>
                </div>
              ) : (
                <Stack align="center" spacing="sm" py="md">
                  <IconHistory size={48} opacity={0.2} />
                  <Text align="center">No activity found</Text>
                  <Text size="sm" color="dimmed" align="center">
                    Your account activity will appear here
                  </Text>
                </Stack>
              )}
            </Paper>
          )}
          
          {activeTab === 'preferences' && (
            <Paper withBorder p="xl" radius="md">
              <Title order={3} mb="lg">Application Preferences</Title>
              
              <SimpleGrid cols={1} spacing="xl">
                <Card withBorder p="lg" radius="md">
                  <Text weight={500} mb="md">Animation & Motion</Text>
                  
                  <Text size="sm" color="dimmed" mb="md">
                    Control how animations and transitions appear throughout the application
                  </Text>
                  
                  <SegmentedControl
                    value={motionPreference.level}
                    onChange={(value) => handleMotionPreferenceChange(value as 'full' | 'essential' | 'minimal')}
                    data={[
                      { label: 'Full', value: 'full' },
                      { label: 'Essential', value: 'essential' },
                      { label: 'Minimal', value: 'minimal' }
                    ]}
                    mb="sm"
                  />
                  
                  <Text size="xs" color="dimmed">
                    {motionPreference.level === 'full' && 'All animations and transitions enabled for the richest experience.'}
                    {motionPreference.level === 'essential' && 'Only essential animations that convey meaning are shown.'}
                    {motionPreference.level === 'minimal' && 'Most animations disabled for a simpler experience.'}
                  </Text>
                </Card>
                
                <Card withBorder p="lg" radius="md">
                  <Text weight={500} mb="md">Language Preference</Text>
                  
                  <Select
                    data={[
                      { value: 'en', label: 'English' },
                      { value: 'fr', label: 'French' },
                      { value: 'de', label: 'German' },
                      { value: 'es', label: 'Spanish' }
                    ]}
                    defaultValue="en"
                    mb="sm"
                  />
                  
                  <Text size="xs" color="dimmed">
                    Changes the language throughout the application. Requires reload to take effect.
                  </Text>
                </Card>
                
                <Card withBorder p="lg" radius="md">
                  <Text weight={500} mb="md">Time Zone</Text>
                  
                  <Select
                    data={[
                      { value: 'UTC', label: 'Universal Time (UTC)' },
                      { value: 'America/New_York', label: 'Eastern Time (ET)' },
                      { value: 'America/Chicago', label: 'Central Time (CT)' },
                      { value: 'America/Denver', label: 'Mountain Time (MT)' },
                      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                      { value: 'Europe/London', label: 'British Time (GMT)' },
                      { value: 'Europe/Paris', label: 'Central European Time (CET)' },
                      { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' }
                    ]}
                    defaultValue="UTC"
                    mb="sm"
                  />
                  
                  <Text size="xs" color="dimmed">
                    Sets how dates and times are displayed throughout the application.
                  </Text>
                </Card>
              </SimpleGrid>
            </Paper>
          )}
        </div>
      </Tabs>
      
      {/* Password Change Modal */}
      <Modal
        opened={passwordModalOpened}
        onClose={closePasswordModal}
        title="Change Password"
        centered
      >
        <Stack spacing="md">
          <PasswordInput
            label="Current Password"
            placeholder="Enter your current password"
            value={passwordData.current}
            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
            required
          />
          
          <PasswordInput
            label="New Password"
            placeholder="Enter your new password"
            value={passwordData.new}
            visible={passwordVisible}
            onVisibilityChange={setPasswordVisible}
            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
            required
          />
          
          <Progress color={strength > 80 ? 'green' : strength > 50 ? 'yellow' : 'red'} value={strength} size="xs" mb="xs" />
          
          <PasswordRequirement label="At least 8 characters" meets={passwordData.new.length >= 8} />
          {checks}
          
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={passwordData.confirm}
            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
            error={
              passwordData.new !== passwordData.confirm && passwordData.confirm
                ? "Passwords don't match"
                : null
            }
            required
          />
          
          <Group position="right" mt="md">
            <Button variant="light" onClick={closePasswordModal}>Cancel</Button>
            <Button onClick={handlePasswordChange} disabled={
              !passwordData.current || 
              !passwordData.new || 
              passwordData.new !== passwordData.confirm || 
              strength < 50
            }>
              Change Password
            </Button>
          </Group>
        </Stack>
      </Modal>
      
      {/* API Key Creation Modal */}
      <Modal
        opened={apiKeyModalOpened}
        onClose={closeApiKeyModal}
        title="Create New API Key"
        centered
      >
        <Stack spacing="md">
          <TextInput
            label="API Key Name"
            placeholder="e.g., Inventory Integration"
            value={apiKeyData.name}
            onChange={(e) => setApiKeyData({ ...apiKeyData, name: e.target.value })}
            required
          />
          
          <div>
            <Text weight={500} size="sm" mb="xs">API Scopes</Text>
            <Text size="xs" color="dimmed" mb="sm">
              Select the permissions this API key will have
            </Text>
            
            <Stack spacing="xs">
              <Switch
                label="Read Inventory"
                checked={apiKeyData.scopes.includes('read:inventory')}
                onChange={(e) => {
                  const newScopes = e.currentTarget.checked
                    ? [...apiKeyData.scopes, 'read:inventory']
                    : apiKeyData.scopes.filter(s => s !== 'read:inventory');
                  setApiKeyData({ ...apiKeyData, scopes: newScopes });
                }}
              />
              
              <Switch
                label="Write Inventory"
                checked={apiKeyData.scopes.includes('write:inventory')}
                onChange={(e) => {
                  const newScopes = e.currentTarget.checked
                    ? [...apiKeyData.scopes, 'write:inventory']
                    : apiKeyData.scopes.filter(s => s !== 'write:inventory');
                  setApiKeyData({ ...apiKeyData, scopes: newScopes });
                }}
              />
              
              <Switch
                label="Read Orders"
                checked={apiKeyData.scopes.includes('read:orders')}
                onChange={(e) => {
                  const newScopes = e.currentTarget.checked
                    ? [...apiKeyData.scopes, 'read:orders']
                    : apiKeyData.scopes.filter(s => s !== 'read:orders');
                  setApiKeyData({ ...apiKeyData, scopes: newScopes });
                }}
              />
              
              <Switch
                label="Write Orders"
                checked={apiKeyData.scopes.includes('write:orders')}
                onChange={(e) => {
                  const newScopes = e.currentTarget.checked
                    ? [...apiKeyData.scopes, 'write:orders']
                    : apiKeyData.scopes.filter(s => s !== 'write:orders');
                  setApiKeyData({ ...apiKeyData, scopes: newScopes });
                }}
              />
              
              <Switch
                label="Read Analytics"
                checked={apiKeyData.scopes.includes('read:analytics')}
                onChange={(e) => {
                  const newScopes = e.currentTarget.checked
                    ? [...apiKeyData.scopes, 'read:analytics']
                    : apiKeyData.scopes.filter(s => s !== 'read:analytics');
                  setApiKeyData({ ...apiKeyData, scopes: newScopes });
                }}
              />
            </Stack>
          </div>
          
          <Text size="xs" color="dimmed">
            Note: API keys grant access to your account. Keep them secure and never share them publicly.
          </Text>
          
          <Group position="right" mt="md">
            <Button variant="light" onClick={closeApiKeyModal}>Cancel</Button>
            <Button onClick={handleCreateApiKey} disabled={!apiKeyData.name || apiKeyData.scopes.length === 0}>
              Create API Key
            </Button>
          </Group>
        </Stack>
      </Modal>
      
      {/* Two-Factor Authentication Modal */}
      <Modal
        opened={twoFactorModalOpened}
        onClose={closeTwoFactorModal}
        title="Set Up Two-Factor Authentication"
        centered
      >
        <Stack spacing="md" align="center">
          <Text align="center" mb="sm">
            Scan this QR code with your authenticator app to set up two-factor authentication.
          </Text>
          
          <Paper withBorder p="md">
            {/* Placeholder for QR code - in a real app, this would be an actual QR code */}
            <div style={{ width: 200, height: 200, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text align="center">QR Code Placeholder</Text>
            </div>
          </Paper>
          
          <TextInput
            label="Enter verification code"
            placeholder="6-digit code from your authenticator app"
            mt="md"
            width="100%"
          />
          
          <Group position="right" mt="md" sx={{ width: '100%' }}>
            <Button variant="light" onClick={closeTwoFactorModal}>Cancel</Button>
            <Button>Verify and Enable</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default ProfileManagement;