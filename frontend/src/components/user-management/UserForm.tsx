import { useEffect, useRef } from 'react';
import {
  Box,
  TextInput,
  PasswordInput,
  Select,
  Checkbox,
  Grid,
  Button,
  Divider,
  Text,
  Group,
  Card,
  Tabs,
  Avatar,
  Switch,
  Textarea,
  ColorSwatch
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconUser,
  IconShield,
  IconSettings,
  IconBell,
  IconLock,
  IconDevices,
  IconSave,
  IconX
} from '@tabler/icons-react';
import { User, UserRole, UserStatus } from '@/types/user-management';
import { useRoles } from '@/hooks/user-management/useRoles';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface UserFormProps {
  user?: User;
  isCreating?: boolean;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export function UserForm({ 
  user, 
  isCreating = false,
  onSubmit, 
  onCancel 
}: UserFormProps) {
  const { roles } = useRoles();
  const formRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Form initialization with default values
  const form = useForm({
    initialValues: {
      email: user?.email || '',
      role: user?.role || 'user' as UserRole,
      status: user?.status || 'active' as UserStatus,
      profile: {
        firstName: user?.profile?.firstName || '',
        lastName: user?.profile?.lastName || '',
        jobTitle: user?.profile?.jobTitle || '',
        department: user?.profile?.department || '',
        phoneNumber: user?.profile?.phoneNumber || '',
        timezone: user?.profile?.timezone || 'America/New_York',
        language: user?.profile?.language || 'en',
        theme: user?.profile?.theme || 'system',
        motionPreference: user?.profile?.motionPreference || 'full',
        emailNotifications: user?.profile?.emailNotifications ?? true,
        smsNotifications: user?.profile?.smsNotifications ?? false,
        pushNotifications: user?.profile?.pushNotifications ?? true
      },
      password: '',
      confirmPassword: '',
      twoFactorEnabled: user?.twoFactorEnabled || false,
      twoFactorMethod: user?.twoFactorMethod || 'none',
      sendInvite: isCreating,
      requirePasswordChange: isCreating || user?.requirePasswordChange || false
    },
    
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => {
        if (isCreating && !value) return 'Password is required';
        if (value && value.length < 8) return 'Password must be at least 8 characters';
        return null;
      },
      confirmPassword: (value, values) => 
        value === values.password ? null : 'Passwords do not match',
      profile: {
        firstName: (value) => (value ? null : 'First name is required'),
        lastName: (value) => (value ? null : 'Last name is required')
      }
    }
  });
  
  // Get role options
  const roleOptions = roles.map(role => ({
    value: role.id.replace('role-', '') as UserRole,
    label: role.name
  }));
  
  // Get status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' }
  ];
  
  // Get language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' }
  ];
  
  // Get timezone options (simplified for demo)
  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];
  
  // Get theme options
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Preference' }
  ];
  
  // Get motion preference options
  const motionOptions = [
    { value: 'full', label: 'Full Animations' },
    { value: 'moderate', label: 'Moderate Animations' },
    { value: 'minimal', label: 'Minimal Animations' }
  ];
  
  // Get two-factor options
  const twoFactorOptions = [
    { value: 'none', label: 'Disabled' },
    { value: 'app', label: 'Authenticator App' },
    { value: 'sms', label: 'SMS' },
    { value: 'email', label: 'Email' }
  ];
  
  // Handle form submission
  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values);
  });
  
  // Animate form fields when mounted
  useEffect(() => {
    if (formRef.current && motionLevel !== 'minimal') {
      // Select form fields for animation
      const formElements = formRef.current.querySelectorAll('input, select, textarea, .mantine-Switch-root');
      
      gsap.fromTo(
        formElements,
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.03, 
          ease: 'power2.out' 
        }
      );
    }
  }, [motionLevel]);
  
  return (
    <Box ref={formRef}>
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="profile">
          <Tabs.List mb="md">
            <Tabs.Tab value="profile" icon={<IconUser size={16} />}>Profile</Tabs.Tab>
            <Tabs.Tab value="security" icon={<IconLock size={16} />}>Security</Tabs.Tab>
            <Tabs.Tab value="permissions" icon={<IconShield size={16} />}>Permissions</Tabs.Tab>
            <Tabs.Tab value="preferences" icon={<IconSettings size={16} />}>Preferences</Tabs.Tab>
            <Tabs.Tab value="notifications" icon={<IconBell size={16} />}>Notifications</Tabs.Tab>
            {!isCreating && (
              <Tabs.Tab value="devices" icon={<IconDevices size={16} />}>Devices</Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="profile">
            <Card p="md" withBorder mb="lg">
              <Text weight={500} mb="md">User Information</Text>
              
              <Grid>
                <Grid.Col span={12}>
                  <TextInput
                    label="Email Address"
                    placeholder="user@example.com"
                    required
                    {...form.getInputProps('email')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <TextInput
                    label="First Name"
                    placeholder="First Name"
                    required
                    {...form.getInputProps('profile.firstName')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <TextInput
                    label="Last Name"
                    placeholder="Last Name"
                    required
                    {...form.getInputProps('profile.lastName')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <TextInput
                    label="Job Title"
                    placeholder="Job Title"
                    {...form.getInputProps('profile.jobTitle')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <TextInput
                    label="Department"
                    placeholder="Department"
                    {...form.getInputProps('profile.department')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <TextInput
                    label="Phone Number"
                    placeholder="Phone Number"
                    {...form.getInputProps('profile.phoneNumber')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  {!isCreating && (
                    <Box pt={28}>
                      <Group spacing="md">
                        <Avatar 
                          size={60} 
                          color="blue" 
                          radius="xl"
                          src={user?.profile.avatar}
                        >
                          {form.values.profile.firstName.charAt(0)}
                          {form.values.profile.lastName.charAt(0)}
                        </Avatar>
                        <div>
                          <Text size="sm" color="dimmed">Profile Picture</Text>
                          <Button size="xs" mt={5} variant="outline">
                            Change
                          </Button>
                        </div>
                      </Group>
                    </Box>
                  )}
                </Grid.Col>
              </Grid>
            </Card>
            
            <Card p="md" withBorder>
              <Text weight={500} mb="md">System Status</Text>
              
              <Grid>
                <Grid.Col span={6}>
                  <Select
                    label="User Role"
                    placeholder="Select Role"
                    data={roleOptions}
                    required
                    {...form.getInputProps('role')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Select
                    label="Status"
                    placeholder="Select Status"
                    data={statusOptions}
                    required
                    {...form.getInputProps('status')}
                  />
                </Grid.Col>
                
                {isCreating && (
                  <Grid.Col span={12}>
                    <Checkbox
                      label="Send invitation email to this user"
                      mt="md"
                      {...form.getInputProps('sendInvite', { type: 'checkbox' })}
                    />
                  </Grid.Col>
                )}
              </Grid>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="security">
            <Card p="md" withBorder mb="lg">
              <Text weight={500} mb="md">Password Settings</Text>
              
              <Grid>
                <Grid.Col span={isCreating ? 6 : 12}>
                  <PasswordInput
                    label={isCreating ? "Password" : "New Password"}
                    placeholder="Enter password"
                    {...form.getInputProps('password')}
                    required={isCreating}
                  />
                </Grid.Col>
                
                <Grid.Col span={isCreating ? 6 : 12}>
                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm password"
                    {...form.getInputProps('confirmPassword')}
                    required={isCreating}
                  />
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Checkbox
                    label="User must change password on next login"
                    mt="md"
                    {...form.getInputProps('requirePasswordChange', { type: 'checkbox' })}
                  />
                </Grid.Col>
              </Grid>
              
              <Divider my="md" />
              
              <Text weight={500} mb="md">Two-Factor Authentication</Text>
              
              <Grid>
                <Grid.Col span={12}>
                  <Switch
                    label="Enable Two-Factor Authentication"
                    checked={form.values.twoFactorEnabled}
                    onChange={(event) => form.setFieldValue('twoFactorEnabled', event.currentTarget.checked)}
                    mb="md"
                  />
                </Grid.Col>
                
                {form.values.twoFactorEnabled && (
                  <Grid.Col span={6}>
                    <Select
                      label="Authentication Method"
                      placeholder="Select Method"
                      data={twoFactorOptions}
                      required
                      {...form.getInputProps('twoFactorMethod')}
                    />
                  </Grid.Col>
                )}
              </Grid>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="permissions">
            <Card p="md" withBorder>
              <Text weight={500} mb="md">Role-Based Permissions</Text>
              
              <Text size="sm" color="dimmed" mb="lg">
                This user has the <Text span weight={500}>{form.values.role}</Text> role, which includes the following permissions.
                To manage individual permissions, you can create or modify roles in the Roles section.
              </Text>
              
              <Grid>
                {/* This would be replaced with a dynamic permission display based on the selected role */}
                <Grid.Col span={4}>
                  <Card p="sm" withBorder>
                    <Text weight={500} size="sm">Inventory</Text>
                    <Text size="xs" color="dimmed">View, Create, Edit, Delete</Text>
                  </Card>
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <Card p="sm" withBorder>
                    <Text weight={500} size="sm">Orders</Text>
                    <Text size="xs" color="dimmed">View, Create, Edit, Delete</Text>
                  </Card>
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <Card p="sm" withBorder>
                    <Text weight={500} size="sm">Reports</Text>
                    <Text size="xs" color="dimmed">View, Create, Edit</Text>
                  </Card>
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <Card p="sm" withBorder>
                    <Text weight={500} size="sm">Settings</Text>
                    <Text size="xs" color="dimmed">View</Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="preferences">
            <Card p="md" withBorder>
              <Text weight={500} mb="md">User Preferences</Text>
              
              <Grid>
                <Grid.Col span={6}>
                  <Select
                    label="Language"
                    placeholder="Select Language"
                    data={languageOptions}
                    {...form.getInputProps('profile.language')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Select
                    label="Timezone"
                    placeholder="Select Timezone"
                    data={timezoneOptions}
                    {...form.getInputProps('profile.timezone')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Select
                    label="Theme"
                    placeholder="Select Theme"
                    data={themeOptions}
                    {...form.getInputProps('profile.theme')}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Select
                    label="Motion Preference"
                    placeholder="Select Motion Preference"
                    data={motionOptions}
                    {...form.getInputProps('profile.motionPreference')}
                  />
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Box mt="md">
                    <Text weight={500} mb="xs">Theme Preview</Text>
                    <Group>
                      <ColorSwatch color="#ffffff" size={30} />
                      <Text size="sm">Light</Text>
                      
                      <ColorSwatch color="#333333" size={30} />
                      <Text size="sm">Dark</Text>
                      
                      <ColorSwatch color="#4dabf7" size={30} />
                      <Text size="sm">Primary</Text>
                      
                      <ColorSwatch color="#37b24d" size={30} />
                      <Text size="sm">Secondary</Text>
                    </Group>
                  </Box>
                </Grid.Col>
              </Grid>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="notifications">
            <Card p="md" withBorder>
              <Text weight={500} mb="md">Notification Settings</Text>
              
              <Grid>
                <Grid.Col span={12}>
                  <Switch
                    label="Email Notifications"
                    description="Receive notifications via email"
                    checked={form.values.profile.emailNotifications}
                    onChange={(event) => form.setFieldValue('profile.emailNotifications', event.currentTarget.checked)}
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Switch
                    label="SMS Notifications"
                    description="Receive notifications via SMS"
                    checked={form.values.profile.smsNotifications}
                    onChange={(event) => form.setFieldValue('profile.smsNotifications', event.currentTarget.checked)}
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Switch
                    label="Push Notifications"
                    description="Receive in-app push notifications"
                    checked={form.values.profile.pushNotifications}
                    onChange={(event) => form.setFieldValue('profile.pushNotifications', event.currentTarget.checked)}
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Textarea
                    label="Notification Categories"
                    description="Please set up notification categories in the Notifications section"
                    disabled
                    value="System alerts, Order updates, Inventory alerts, Security notifications"
                  />
                </Grid.Col>
              </Grid>
            </Card>
          </Tabs.Panel>

          {!isCreating && (
            <Tabs.Panel value="devices">
              <Card p="md" withBorder>
                <Text weight={500} mb="md">Active Devices</Text>
                
                {user?.devices && user.devices.length > 0 ? (
                  <Grid>
                    {user.devices.map((device, index) => (
                      <Grid.Col span={6} key={device.id}>
                        <Card p="sm" withBorder>
                          <Group position="apart">
                            <Text weight={500} size="sm">
                              {device.name}
                              {device.isCurrent && (
                                <Badge ml="xs" size="xs" color="green">Current</Badge>
                              )}
                            </Text>
                            {device.isCurrent ? (
                              <Badge size="sm" color="blue">Active Now</Badge>
                            ) : (
                              <Text size="xs" color="dimmed">
                                Last active: {new Date(device.lastActive).toLocaleString()}
                              </Text>
                            )}
                          </Group>
                          <Text size="xs" color="dimmed">
                            {device.browser} on {device.os}
                          </Text>
                          <Text size="xs" color="dimmed">
                            IP: {device.ipAddress}
                          </Text>
                          <Group position="apart" mt="xs">
                            <Text size="xs" weight={500}>
                              {device.trusted ? (
                                <Badge size="xs" color="green">Trusted</Badge>
                              ) : (
                                <Badge size="xs" color="yellow">Not Trusted</Badge>
                              )}
                            </Text>
                            {!device.isCurrent && (
                              <Button size="xs" color="red" variant="subtle" compact>
                                Sign Out
                              </Button>
                            )}
                          </Group>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                ) : (
                  <Text color="dimmed">No active devices found.</Text>
                )}
              </Card>
            </Tabs.Panel>
          )}
        </Tabs>
        
        <Group position="right" mt="xl">
          <Button variant="default" onClick={onCancel} leftIcon={<IconX size={16} />}>
            Cancel
          </Button>
          <Button type="submit" leftIcon={<IconSave size={16} />}>
            {isCreating ? 'Create User' : 'Update User'}
          </Button>
        </Group>
      </form>
    </Box>
  );
}