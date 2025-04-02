import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Text,
  Group,
  Button,
  Card,
  Grid,
  Tabs,
  TextInput,
  ColorInput,
  Select,
  NumberInput,
  Checkbox,
  Title,
  Divider,
  Slider,
  PasswordInput,
  Switch,
  FileInput,
  Textarea,
  Skeleton
} from '@mantine/core';
import {
  IconBuilding,
  IconShield,
  IconPalette,
  IconLanguage,
  IconLock,
  IconBrandOpenai,
  IconDeviceDesktop,
  IconAlertTriangle,
  IconUpload
} from '@tabler/icons-react';
import { useOrganizationSettings } from '@/hooks/user-management/useOrganizationSettings';
import { OrganizationSettings as OrgSettings } from '@/types/user-management';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

export function OrganizationSettings() {
  const { settings, isLoading, error, updateSettings, updatePasswordPolicy, updateSecuritySettings } = useOrganizationSettings();
  const [isEditMode, setIsEditMode] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Partial<OrgSettings>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const formRefs = {
    general: useRef<HTMLDivElement>(null),
    security: useRef<HTMLDivElement>(null),
    appearance: useRef<HTMLDivElement>(null),
    localization: useRef<HTMLDivElement>(null),
    authentication: useRef<HTMLDivElement>(null),
    advanced: useRef<HTMLDivElement>(null)
  };
  
  const { motionLevel } = useMotionPreference();
  
  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);
  
  // Toggle edit mode for a section
  const toggleEditMode = (section: string) => {
    setIsEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    
    // Reset form data for the section when canceling edit mode
    if (isEditMode[section] && settings) {
      setFormData(settings);
    }
  };
  
  // Handle input change
  const handleChange = (path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    setFormData(prev => {
      const result = { ...prev };
      let current = result;
      
      // Navigate to the nested object
      for (const key of keys) {
        current[key] = current[key] ? { ...current[key] } : {};
        current = current[key] as any;
      }
      
      // Set the value
      current[lastKey] = value;
      
      return result;
    });
  };
  
  // Save changes for a section
  const saveChanges = async (section: string) => {
    if (!settings) return;
    
    try {
      // Extract only the relevant part of the form data
      let updateData: Partial<OrgSettings> = {};
      
      switch (section) {
        case 'general':
          updateData = {
            name: formData.name,
            logo: formData.logo // In a real app, this would be handled differently with file upload
          };
          break;
          
        case 'security':
          updateData = {
            securitySettings: {
              ...settings.securitySettings,
              loginAttempts: formData.securitySettings?.loginAttempts,
              lockoutDuration: formData.securitySettings?.lockoutDuration,
              sessionTimeout: formData.securitySettings?.sessionTimeout,
              requireTwoFactor: formData.securitySettings?.requireTwoFactor,
              singleSessionOnly: formData.securitySettings?.singleSessionOnly,
              allowedIpRanges: formData.securitySettings?.allowedIpRanges
            }
          };
          break;
          
        case 'appearance':
          updateData = {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            defaultTheme: formData.defaultTheme
          };
          break;
          
        case 'localization':
          updateData = {
            defaultLanguage: formData.defaultLanguage,
            defaultTimezone: formData.defaultTimezone
          };
          break;
          
        case 'authentication':
          updateData = {
            securitySettings: {
              ...settings.securitySettings,
              passwordPolicy: formData.securitySettings?.passwordPolicy
            }
          };
          break;
      }
      
      const success = await updateSettings(updateData);
      
      if (success) {
        toggleEditMode(section);
      }
    } catch (err) {
      console.error('Failed to save changes:', err);
    }
  };
  
  // Language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' }
  ];
  
  // Timezone options (simplified for demo)
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
  
  // Theme options
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Preference' }
  ];
  
  // Animate form fields when edit mode changes
  useEffect(() => {
    if (motionLevel === 'minimal') return;
    
    // Find active edit sections
    Object.entries(isEditMode).forEach(([section, isEditing]) => {
      const ref = formRefs[section as keyof typeof formRefs];
      
      if (ref?.current && isEditing) {
        // Select input elements
        const inputElements = ref.current.querySelectorAll('input, select, textarea');
        
        gsap.fromTo(
          inputElements,
          { opacity: 0.5, y: 5 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.3, 
            stagger: 0.03, 
            ease: 'power2.out' 
          }
        );
      }
    });
  }, [isEditMode, motionLevel]);
  
  if (isLoading) {
    return (
      <Box>
        <Skeleton height={40} mb="xl" width={300} />
        <Skeleton height={200} mb="xl" />
        <Skeleton height={300} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Title order={2} mb="xl">Organization Settings</Title>
        <Card p="md" withBorder>
          <Text color="red">Error loading settings: {error}</Text>
        </Card>
      </Box>
    );
  }
  
  if (!settings || !formData.securitySettings) {
    return (
      <Box>
        <Title order={2} mb="xl">Organization Settings</Title>
        <Card p="md" withBorder>
          <Text color="dimmed">Loading settings...</Text>
        </Card>
      </Box>
    );
  }
  
  return (
    <Box>
      <Title order={2} mb="xl">Organization Settings</Title>
      
      <Tabs defaultValue="general">
        <Tabs.List mb="md">
          <Tabs.Tab value="general" icon={<IconBuilding size={16} />}>General</Tabs.Tab>
          <Tabs.Tab value="security" icon={<IconShield size={16} />}>Security</Tabs.Tab>
          <Tabs.Tab value="appearance" icon={<IconPalette size={16} />}>Appearance</Tabs.Tab>
          <Tabs.Tab value="localization" icon={<IconLanguage size={16} />}>Localization</Tabs.Tab>
          <Tabs.Tab value="authentication" icon={<IconLock size={16} />}>Authentication</Tabs.Tab>
          <Tabs.Tab value="advanced" icon={<IconDeviceDesktop size={16} />}>Advanced</Tabs.Tab>
        </Tabs.List>

        {/* General Settings */}
        <Tabs.Panel value="general">
          <Card p="md" withBorder ref={formRefs.general}>
            <Group position="apart" mb="lg">
              <Text weight={500} size="lg">General Information</Text>
              <Button 
                variant={isEditMode.general ? 'filled' : 'light'}
                onClick={() => toggleEditMode('general')}
              >
                {isEditMode.general ? 'Cancel' : 'Edit'}
              </Button>
            </Group>
            
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Organization Name"
                  placeholder="Your organization name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.currentTarget.value)}
                  disabled={!isEditMode.general}
                  mb="md"
                />
                
                <Box mb="md">
                  <Text weight={500} size="sm" mb="xs">Organization Logo</Text>
                  {isEditMode.general ? (
                    <FileInput
                      placeholder="Upload logo"
                      accept="image/png,image/jpeg,image/svg+xml"
                      value={logoFile}
                      onChange={setLogoFile}
                      icon={<IconUpload size={14} />}
                      mb="xs"
                    />
                  ) : (
                    <div>
                      {formData.logo ? (
                        <img 
                          src={formData.logo} 
                          alt="Organization Logo" 
                          style={{ maxWidth: '200px', maxHeight: '100px' }} 
                        />
                      ) : (
                        <Text color="dimmed">No logo uploaded</Text>
                      )}
                    </div>
                  )}
                </Box>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Textarea
                  label="Organization Description"
                  placeholder="Brief description of your organization"
                  minRows={4}
                  disabled={!isEditMode.general}
                  mb="md"
                />
                
                <TextInput
                  label="Website"
                  placeholder="https://www.example.com"
                  disabled={!isEditMode.general}
                  mb="md"
                />
              </Grid.Col>
            </Grid>
            
            {isEditMode.general && (
              <Group position="right" mt="md">
                <Button onClick={() => saveChanges('general')}>
                  Save Changes
                </Button>
              </Group>
            )}
          </Card>
        </Tabs.Panel>

        {/* Security Settings */}
        <Tabs.Panel value="security">
          <Card p="md" withBorder ref={formRefs.security}>
            <Group position="apart" mb="lg">
              <Text weight={500} size="lg">Security Settings</Text>
              <Button 
                variant={isEditMode.security ? 'filled' : 'light'}
                onClick={() => toggleEditMode('security')}
              >
                {isEditMode.security ? 'Cancel' : 'Edit'}
              </Button>
            </Group>
            
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Max Login Attempts"
                  description="Number of failed login attempts before account lockout"
                  value={formData.securitySettings?.loginAttempts || 5}
                  onChange={(value) => handleChange('securitySettings.loginAttempts', value)}
                  disabled={!isEditMode.security}
                  min={1}
                  max={10}
                  mb="md"
                />
                
                <NumberInput
                  label="Lockout Duration (minutes)"
                  description="Time period an account remains locked after exceeding max attempts"
                  value={formData.securitySettings?.lockoutDuration || 30}
                  onChange={(value) => handleChange('securitySettings.lockoutDuration', value)}
                  disabled={!isEditMode.security}
                  min={5}
                  max={1440}
                  mb="md"
                />
                
                <NumberInput
                  label="Session Timeout (minutes)"
                  description="Period of inactivity before a user is automatically logged out"
                  value={formData.securitySettings?.sessionTimeout || 60}
                  onChange={(value) => handleChange('securitySettings.sessionTimeout', value)}
                  disabled={!isEditMode.security}
                  min={5}
                  max={1440}
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Switch
                  label="Require Two-Factor Authentication"
                  description="Enforce two-factor authentication for all users"
                  checked={formData.securitySettings?.requireTwoFactor || false}
                  onChange={(event) => handleChange('securitySettings.requireTwoFactor', event.currentTarget.checked)}
                  disabled={!isEditMode.security}
                  mb="md"
                />
                
                <Switch
                  label="Single Session Only"
                  description="Prevent users from having multiple active sessions"
                  checked={formData.securitySettings?.singleSessionOnly || false}
                  onChange={(event) => handleChange('securitySettings.singleSessionOnly', event.currentTarget.checked)}
                  disabled={!isEditMode.security}
                  mb="md"
                />
                
                <TextInput
                  label="Allowed IP Ranges"
                  description="Comma-separated list of allowed IP ranges (CIDR notation)"
                  value={(formData.securitySettings?.allowedIpRanges || []).join(', ')}
                  onChange={(e) => {
                    const ranges = e.currentTarget.value
                      .split(',')
                      .map((range) => range.trim())
                      .filter(Boolean);
                    handleChange('securitySettings.allowedIpRanges', ranges);
                  }}
                  disabled={!isEditMode.security}
                  placeholder="e.g. 192.168.0.0/16, 10.0.0.0/8"
                  mb="md"
                />
              </Grid.Col>
            </Grid>
            
            {isEditMode.security && (
              <Group position="right" mt="md">
                <Button onClick={() => saveChanges('security')}>
                  Save Changes
                </Button>
              </Group>
            )}
          </Card>
        </Tabs.Panel>

        {/* Appearance Settings */}
        <Tabs.Panel value="appearance">
          <Card p="md" withBorder ref={formRefs.appearance}>
            <Group position="apart" mb="lg">
              <Text weight={500} size="lg">Appearance</Text>
              <Button 
                variant={isEditMode.appearance ? 'filled' : 'light'}
                onClick={() => toggleEditMode('appearance')}
              >
                {isEditMode.appearance ? 'Cancel' : 'Edit'}
              </Button>
            </Group>
            
            <Grid>
              <Grid.Col span={6}>
                <ColorInput
                  label="Primary Color"
                  description="Main theme color for the application"
                  value={formData.primaryColor || '#4dabf7'}
                  onChange={(value) => handleChange('primaryColor', value)}
                  disabled={!isEditMode.appearance}
                  disallowInput
                  mb="md"
                />
                
                <ColorInput
                  label="Secondary Color"
                  description="Accent color for the application"
                  value={formData.secondaryColor || '#37b24d'}
                  onChange={(value) => handleChange('secondaryColor', value)}
                  disabled={!isEditMode.appearance}
                  disallowInput
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Default Theme"
                  description="Default theme for new users"
                  data={themeOptions}
                  value={formData.defaultTheme || 'system'}
                  onChange={(value) => handleChange('defaultTheme', value)}
                  disabled={!isEditMode.appearance}
                  mb="md"
                />
                
                <Box mt={30}>
                  <Text weight={500} size="sm" mb="xs">Theme Preview</Text>
                  <Card p="md" style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
                    <Text weight={500} mb="xs">Light Theme</Text>
                    <Group mb="md">
                      <div 
                        style={{ 
                          backgroundColor: formData.primaryColor || '#4dabf7', 
                          width: 100, 
                          height: 40, 
                          borderRadius: 4 
                        }} 
                      />
                      <div 
                        style={{ 
                          backgroundColor: formData.secondaryColor || '#37b24d', 
                          width: 100, 
                          height: 40, 
                          borderRadius: 4 
                        }} 
                      />
                    </Group>
                  </Card>
                  
                  <Card p="md" mt="md" style={{ backgroundColor: '#1a1b1e', border: '1px solid #2c2e33', color: '#c1c2c5' }}>
                    <Text weight={500} mb="xs" style={{ color: '#c1c2c5' }}>Dark Theme</Text>
                    <Group mb="md">
                      <div 
                        style={{ 
                          backgroundColor: formData.primaryColor || '#4dabf7', 
                          width: 100, 
                          height: 40, 
                          borderRadius: 4 
                        }} 
                      />
                      <div 
                        style={{ 
                          backgroundColor: formData.secondaryColor || '#37b24d', 
                          width: 100, 
                          height: 40, 
                          borderRadius: 4 
                        }} 
                      />
                    </Group>
                  </Card>
                </Box>
              </Grid.Col>
            </Grid>
            
            {isEditMode.appearance && (
              <Group position="right" mt="md">
                <Button onClick={() => saveChanges('appearance')}>
                  Save Changes
                </Button>
              </Group>
            )}
          </Card>
        </Tabs.Panel>

        {/* Localization Settings */}
        <Tabs.Panel value="localization">
          <Card p="md" withBorder ref={formRefs.localization}>
            <Group position="apart" mb="lg">
              <Text weight={500} size="lg">Localization</Text>
              <Button 
                variant={isEditMode.localization ? 'filled' : 'light'}
                onClick={() => toggleEditMode('localization')}
              >
                {isEditMode.localization ? 'Cancel' : 'Edit'}
              </Button>
            </Group>
            
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Default Language"
                  description="Default language for new users"
                  data={languageOptions}
                  value={formData.defaultLanguage || 'en'}
                  onChange={(value) => handleChange('defaultLanguage', value)}
                  disabled={!isEditMode.localization}
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Default Timezone"
                  description="Default timezone for new users"
                  data={timezoneOptions}
                  value={formData.defaultTimezone || 'America/New_York'}
                  onChange={(value) => handleChange('defaultTimezone', value)}
                  disabled={!isEditMode.localization}
                  mb="md"
                />
              </Grid.Col>
            </Grid>
            
            {isEditMode.localization && (
              <Group position="right" mt="md">
                <Button onClick={() => saveChanges('localization')}>
                  Save Changes
                </Button>
              </Group>
            )}
          </Card>
        </Tabs.Panel>

        {/* Authentication Settings */}
        <Tabs.Panel value="authentication">
          <Card p="md" withBorder ref={formRefs.authentication}>
            <Group position="apart" mb="lg">
              <Text weight={500} size="lg">Password Policy</Text>
              <Button 
                variant={isEditMode.authentication ? 'filled' : 'light'}
                onClick={() => toggleEditMode('authentication')}
              >
                {isEditMode.authentication ? 'Cancel' : 'Edit'}
              </Button>
            </Group>
            
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Minimum Password Length"
                  description="Minimum number of characters for passwords"
                  value={formData.securitySettings?.passwordPolicy?.minLength || 8}
                  onChange={(value) => handleChange('securitySettings.passwordPolicy.minLength', value)}
                  disabled={!isEditMode.authentication}
                  min={6}
                  max={32}
                  mb="md"
                />
                
                <NumberInput
                  label="Password Expiry (days)"
                  description="Number of days before passwords must be changed (0 for never)"
                  value={formData.securitySettings?.passwordPolicy?.expiryDays || 90}
                  onChange={(value) => handleChange('securitySettings.passwordPolicy.expiryDays', value)}
                  disabled={!isEditMode.authentication}
                  min={0}
                  max={365}
                  mb="md"
                />
                
                <NumberInput
                  label="Password History Count"
                  description="Number of previous passwords that cannot be reused"
                  value={formData.securitySettings?.passwordPolicy?.preventReuseCount || 5}
                  onChange={(value) => handleChange('securitySettings.passwordPolicy.preventReuseCount', value)}
                  disabled={!isEditMode.authentication}
                  min={0}
                  max={24}
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Checkbox
                  label="Require Uppercase Letters"
                  checked={formData.securitySettings?.passwordPolicy?.requireUppercase || false}
                  onChange={(event) => handleChange('securitySettings.passwordPolicy.requireUppercase', event.currentTarget.checked)}
                  disabled={!isEditMode.authentication}
                  mb="md"
                />
                
                <Checkbox
                  label="Require Lowercase Letters"
                  checked={formData.securitySettings?.passwordPolicy?.requireLowercase || false}
                  onChange={(event) => handleChange('securitySettings.passwordPolicy.requireLowercase', event.currentTarget.checked)}
                  disabled={!isEditMode.authentication}
                  mb="md"
                />
                
                <Checkbox
                  label="Require Numbers"
                  checked={formData.securitySettings?.passwordPolicy?.requireNumbers || false}
                  onChange={(event) => handleChange('securitySettings.passwordPolicy.requireNumbers', event.currentTarget.checked)}
                  disabled={!isEditMode.authentication}
                  mb="md"
                />
                
                <Checkbox
                  label="Require Special Characters"
                  checked={formData.securitySettings?.passwordPolicy?.requireSpecialChars || false}
                  onChange={(event) => handleChange('securitySettings.passwordPolicy.requireSpecialChars', event.currentTarget.checked)}
                  disabled={!isEditMode.authentication}
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Divider my="lg" />
                <Text weight={500} mb="md">Password Strength Estimation</Text>
                
                <Box mb="lg">
                  <Text mb="xs">Current policy would create passwords with approximately:</Text>
                  <Slider
                    value={((formData.securitySettings?.passwordPolicy?.minLength || 8) * 
                      (1 + 
                        (formData.securitySettings?.passwordPolicy?.requireUppercase ? 0.5 : 0) + 
                        (formData.securitySettings?.passwordPolicy?.requireLowercase ? 0.5 : 0) + 
                        (formData.securitySettings?.passwordPolicy?.requireNumbers ? 0.5 : 0) + 
                        (formData.securitySettings?.passwordPolicy?.requireSpecialChars ? 0.5 : 0)
                      )) / 3}
                    min={0}
                    max={10}
                    step={0.1}
                    disabled
                    size="lg"
                    label={null}
                    marks={[
                      { value: 2, label: 'Weak' },
                      { value: 5, label: 'Medium' },
                      { value: 8, label: 'Strong' }
                    ]}
                    styles={(theme) => ({
                      track: {
                        background: 
                          'linear-gradient(90deg, rgb(223, 57, 57) 0%, rgb(234, 119, 85) 20%, rgb(238, 166, 43) 40%, rgb(230, 196, 74) 60%, rgb(162, 208, 81) 80%, rgb(107, 186, 112) 100%)'
                      }
                    })}
                  />
                </Box>
                
                <Text weight={500} mb="md">Example Password that Meets Requirements</Text>
                {formData.securitySettings?.passwordPolicy && (
                  <PasswordInput
                    placeholder="Example password"
                    disabled
                    value={generateExamplePassword(formData.securitySettings.passwordPolicy)}
                  />
                )}
              </Grid.Col>
            </Grid>
            
            {isEditMode.authentication && (
              <Group position="right" mt="md">
                <Button onClick={() => saveChanges('authentication')}>
                  Save Changes
                </Button>
              </Group>
            )}
          </Card>
        </Tabs.Panel>

        {/* Advanced Settings */}
        <Tabs.Panel value="advanced">
          <Card p="md" withBorder ref={formRefs.advanced}>
            <Group position="apart" mb="lg">
              <Text weight={500} size="lg">Advanced Settings</Text>
              <Button 
                variant={isEditMode.advanced ? 'filled' : 'light'}
                onClick={() => toggleEditMode('advanced')}
              >
                {isEditMode.advanced ? 'Cancel' : 'Edit'}
              </Button>
            </Group>
            
            <Group mb="lg" position="apart">
              <Box style={{ maxWidth: '80%' }}>
                <Text weight={500}>Danger Zone</Text>
                <Text color="dimmed" size="sm">
                  These actions cannot be undone. Make sure you really want to proceed.
                </Text>
              </Box>
              <IconAlertTriangle color="red" size={24} />
            </Group>
            
            <Card p="md" withBorder style={{ borderColor: 'red' }}>
              <Group position="apart">
                <div>
                  <Text>Reset Organization Settings</Text>
                  <Text size="sm" color="dimmed">
                    Resets all organization settings to default values. This will not affect user data.
                  </Text>
                </div>
                <Button 
                  color="red" 
                  variant="outline"
                  disabled={!isEditMode.advanced}
                >
                  Reset Settings
                </Button>
              </Group>
              
              <Divider my="md" />
              
              <Group position="apart">
                <div>
                  <Text>Export Organization Data</Text>
                  <Text size="sm" color="dimmed">
                    Export all organization data including users, roles, and settings.
                  </Text>
                </div>
                <Button 
                  variant="outline"
                  disabled={!isEditMode.advanced}
                >
                  Export Data
                </Button>
              </Group>
            </Card>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

// Helper function to generate an example password that meets requirements
function generateExamplePassword(policy: OrgSettings['securitySettings']['passwordPolicy']) {
  let password = '';
  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = policy;
  
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const specialChars = '!@#$%^&*_-+=';
  
  // Add required character types
  if (requireUppercase) password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  if (requireLowercase) password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  if (requireNumbers) password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  if (requireSpecialChars) password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill remaining length with random characters from all allowed sets
  let allowedChars = '';
  if (requireUppercase) allowedChars += uppercase;
  if (requireLowercase) allowedChars += lowercase;
  if (requireNumbers) allowedChars += numbers;
  if (requireSpecialChars) allowedChars += specialChars;
  
  // If nothing is required, use lowercase as default
  if (allowedChars === '') allowedChars = lowercase;
  
  while (password.length < minLength) {
    password += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}