import {
  User,
  UserRole,
  UserStatus,
  Role,
  Permission,
  UserDevice,
  ActivityLogEntry,
  LoginHistoryEntry,
  UserInvite,
  OrganizationSettings
} from '@/types/user-management';

// Helper functions for date generation
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const hoursAgo = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
};

// Sample permissions
export const permissions: Record<string, Permission[]> = {
  admin: [
    { scope: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
    { scope: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
    { scope: 'reports', actions: ['view', 'create', 'edit', 'delete'] },
    { scope: 'settings', actions: ['view', 'create', 'edit', 'delete'] },
    { scope: 'users', actions: ['view', 'create', 'edit', 'delete'] },
    { scope: 'connections', actions: ['view', 'create', 'edit', 'delete'] },
    { scope: 'warehouses', actions: ['view', 'create', 'edit', 'delete'] },
    { scope: 'suppliers', actions: ['view', 'create', 'edit', 'delete'] }
  ],
  manager: [
    { scope: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
    { scope: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
    { scope: 'reports', actions: ['view', 'create', 'edit'] },
    { scope: 'settings', actions: ['view'] },
    { scope: 'users', actions: ['view'] },
    { scope: 'connections', actions: ['view', 'create', 'edit'] },
    { scope: 'warehouses', actions: ['view', 'create', 'edit'] },
    { scope: 'suppliers', actions: ['view', 'create', 'edit'] }
  ],
  user: [
    { scope: 'inventory', actions: ['view', 'create', 'edit'] },
    { scope: 'orders', actions: ['view', 'create', 'edit'] },
    { scope: 'reports', actions: ['view', 'create'] },
    { scope: 'settings', actions: ['view'] },
    { scope: 'connections', actions: ['view'] },
    { scope: 'warehouses', actions: ['view'] },
    { scope: 'suppliers', actions: ['view'] }
  ],
  guest: [
    { scope: 'inventory', actions: ['view'] },
    { scope: 'orders', actions: ['view'] },
    { scope: 'reports', actions: ['view'] }
  ]
};

// Sample roles
export const roles: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Full access to all system functions and settings',
    permissions: permissions.admin,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
    isSystem: true
  },
  {
    id: 'role-manager',
    name: 'Manager',
    description: 'Manage inventory, orders, and reports',
    permissions: permissions.manager,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
    isSystem: true
  },
  {
    id: 'role-user',
    name: 'User',
    description: 'Regular user with limited editing capabilities',
    permissions: permissions.user,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
    isSystem: true
  },
  {
    id: 'role-guest',
    name: 'Guest',
    description: 'View-only access to basic features',
    permissions: permissions.guest,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
    isSystem: true
  },
  {
    id: 'role-custom-1',
    name: 'Inventory Manager',
    description: 'Specialized role for inventory management',
    permissions: [
      { scope: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
      { scope: 'warehouses', actions: ['view', 'create', 'edit', 'delete'] },
      { scope: 'suppliers', actions: ['view', 'create', 'edit', 'delete'] },
      { scope: 'reports', actions: ['view', 'create'] }
    ],
    createdAt: daysAgo(90),
    updatedAt: daysAgo(15),
    isSystem: false
  },
  {
    id: 'role-custom-2',
    name: 'Order Processor',
    description: 'Specialized role for order processing',
    permissions: [
      { scope: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
      { scope: 'inventory', actions: ['view'] },
      { scope: 'reports', actions: ['view', 'create'] }
    ],
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
    isSystem: false
  }
];

// Generate sample devices
const generateDevices = (userId: string, count: number = 2): UserDevice[] => {
  const devices: UserDevice[] = [];
  
  const deviceTypes = ['desktop', 'tablet', 'mobile'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const os = ['Windows 10', 'macOS', 'iOS', 'Android', 'Linux'];
  
  for (let i = 0; i < count; i++) {
    const isCurrent = i === 0;
    devices.push({
      id: `device-${userId}-${i}`,
      name: isCurrent ? 'Current Device' : `Device ${i + 1}`,
      type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)] as 'desktop' | 'tablet' | 'mobile' | 'unknown',
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: os[Math.floor(Math.random() * os.length)],
      lastActive: isCurrent ? new Date() : hoursAgo(Math.floor(Math.random() * 240) + 1),
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      trusted: isCurrent || Math.random() > 0.3,
      isCurrent
    });
  }
  
  return devices;
};

// Sample users
export const users: User[] = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    profile: {
      firstName: 'Alex',
      lastName: 'Johnson',
      jobTitle: 'System Administrator',
      department: 'IT',
      phoneNumber: '+1 (555) 123-4567',
      timezone: 'America/New_York',
      language: 'en',
      theme: 'system',
      motionPreference: 'full',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true
    },
    permissions: permissions.admin,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(5),
    lastLogin: hoursAgo(2),
    twoFactorEnabled: true,
    twoFactorMethod: 'app',
    devices: generateDevices('user-1', 3),
    passwordLastChanged: daysAgo(30),
    requirePasswordChange: false,
    organizationId: 'org-1',
    isSystemAdmin: true
  },
  {
    id: 'user-2',
    email: 'manager@example.com',
    role: 'manager',
    status: 'active',
    profile: {
      firstName: 'Taylor',
      lastName: 'Smith',
      jobTitle: 'Operations Manager',
      department: 'Operations',
      phoneNumber: '+1 (555) 234-5678',
      timezone: 'America/Chicago',
      language: 'en',
      theme: 'light',
      motionPreference: 'moderate',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    },
    permissions: permissions.manager,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(10),
    lastLogin: hoursAgo(5),
    twoFactorEnabled: true,
    twoFactorMethod: 'app',
    devices: generateDevices('user-2', 2),
    passwordLastChanged: daysAgo(45),
    requirePasswordChange: false,
    organizationId: 'org-1',
    isSystemAdmin: false
  },
  {
    id: 'user-3',
    email: 'user@example.com',
    role: 'user',
    status: 'active',
    profile: {
      firstName: 'Jordan',
      lastName: 'Lee',
      jobTitle: 'Inventory Specialist',
      department: 'Warehouse',
      phoneNumber: '+1 (555) 345-6789',
      timezone: 'America/Los_Angeles',
      language: 'en',
      theme: 'dark',
      motionPreference: 'minimal',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: false
    },
    permissions: permissions.user,
    createdAt: daysAgo(250),
    updatedAt: daysAgo(15),
    lastLogin: daysAgo(1),
    twoFactorEnabled: false,
    twoFactorMethod: 'none',
    devices: generateDevices('user-3', 1),
    passwordLastChanged: daysAgo(60),
    requirePasswordChange: false,
    organizationId: 'org-1',
    isSystemAdmin: false
  },
  {
    id: 'user-4',
    email: 'guest@example.com',
    role: 'guest',
    status: 'active',
    profile: {
      firstName: 'Casey',
      lastName: 'Brown',
      jobTitle: 'Consultant',
      department: 'External',
      timezone: 'Europe/London',
      language: 'en',
      theme: 'system',
      motionPreference: 'moderate',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: false
    },
    permissions: permissions.guest,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(120),
    lastLogin: daysAgo(5),
    twoFactorEnabled: false,
    twoFactorMethod: 'none',
    devices: generateDevices('user-4', 1),
    passwordLastChanged: daysAgo(120),
    requirePasswordChange: false,
    organizationId: 'org-1',
    isSystemAdmin: false
  },
  {
    id: 'user-5',
    email: 'inactive@example.com',
    role: 'user',
    status: 'inactive',
    profile: {
      firstName: 'Morgan',
      lastName: 'Wilson',
      jobTitle: 'Former Employee',
      department: 'Sales',
      timezone: 'America/New_York',
      language: 'en',
      theme: 'light',
      motionPreference: 'full',
      emailNotifications: false,
      smsNotifications: false,
      pushNotifications: false
    },
    permissions: permissions.user,
    createdAt: daysAgo(400),
    updatedAt: daysAgo(60),
    lastLogin: daysAgo(65),
    twoFactorEnabled: false,
    twoFactorMethod: 'none',
    devices: generateDevices('user-5', 0),
    passwordLastChanged: daysAgo(100),
    requirePasswordChange: false,
    organizationId: 'org-1',
    isSystemAdmin: false
  },
  {
    id: 'user-6',
    email: 'pending@example.com',
    role: 'user',
    status: 'pending',
    profile: {
      firstName: 'Riley',
      lastName: 'Garcia',
      jobTitle: 'New Hire',
      department: 'Customer Service',
      timezone: 'America/New_York',
      language: 'en',
      theme: 'system',
      motionPreference: 'full',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true
    },
    permissions: permissions.user,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    twoFactorEnabled: false,
    twoFactorMethod: 'none',
    devices: [],
    requirePasswordChange: true,
    organizationId: 'org-1',
    isSystemAdmin: false
  }
];

// Sample login history
export const loginHistory: Record<string, LoginHistoryEntry[]> = {
  'user-1': [
    {
      id: 'login-1',
      timestamp: hoursAgo(2),
      ipAddress: '192.168.1.1',
      device: 'Desktop',
      browser: 'Chrome 98.0.4758.102',
      os: 'Windows 10',
      location: 'New York, US',
      successful: true
    },
    {
      id: 'login-2',
      timestamp: daysAgo(1),
      ipAddress: '192.168.1.1',
      device: 'Desktop',
      browser: 'Chrome 98.0.4758.102',
      os: 'Windows 10',
      location: 'New York, US',
      successful: true
    },
    {
      id: 'login-3',
      timestamp: daysAgo(2),
      ipAddress: '192.168.1.1',
      device: 'Desktop',
      browser: 'Chrome 98.0.4758.102',
      os: 'Windows 10',
      location: 'New York, US',
      successful: false,
      failureReason: 'Incorrect password'
    }
  ],
  'user-2': [
    {
      id: 'login-4',
      timestamp: hoursAgo(5),
      ipAddress: '192.168.2.1',
      device: 'Mobile',
      browser: 'Safari 15.1',
      os: 'iOS 15.3',
      location: 'Chicago, US',
      successful: true
    },
    {
      id: 'login-5',
      timestamp: daysAgo(2),
      ipAddress: '192.168.2.2',
      device: 'Desktop',
      browser: 'Firefox 97.0',
      os: 'macOS 12.2',
      location: 'Chicago, US',
      successful: true
    }
  ]
};

// Sample activity logs
export const activityLogs: ActivityLogEntry[] = [
  {
    id: 'activity-1',
    userId: 'user-1',
    userName: 'Alex Johnson',
    timestamp: hoursAgo(1),
    type: 'resource_edit',
    description: 'Updated user settings',
    ipAddress: '192.168.1.1',
    resourceType: 'user',
    resourceId: 'user-2',
    details: {
      changes: {
        role: {
          previous: 'user',
          new: 'manager'
        }
      }
    }
  },
  {
    id: 'activity-2',
    userId: 'user-1',
    userName: 'Alex Johnson',
    timestamp: hoursAgo(2),
    type: 'login',
    description: 'User login',
    ipAddress: '192.168.1.1'
  },
  {
    id: 'activity-3',
    userId: 'user-2',
    userName: 'Taylor Smith',
    timestamp: hoursAgo(5),
    type: 'login',
    description: 'User login',
    ipAddress: '192.168.2.1'
  },
  {
    id: 'activity-4',
    userId: 'user-2',
    userName: 'Taylor Smith',
    timestamp: hoursAgo(4),
    type: 'resource_create',
    description: 'Created new inventory item',
    ipAddress: '192.168.2.1',
    resourceType: 'inventory',
    resourceId: 'inv-123'
  },
  {
    id: 'activity-5',
    userId: 'user-1',
    userName: 'Alex Johnson',
    timestamp: daysAgo(1),
    type: 'settings_change',
    description: 'Updated organization settings',
    ipAddress: '192.168.1.1',
    resourceType: 'organization',
    resourceId: 'org-1',
    details: {
      changes: {
        securitySettings: {
          passwordPolicy: {
            minLength: {
              previous: 8,
              new: 10
            }
          }
        }
      }
    }
  }
];

// Sample user invites
export const userInvites: UserInvite[] = [
  {
    id: 'invite-1',
    email: 'new-user@example.com',
    role: 'user',
    invitedBy: 'user-1',
    invitedAt: daysAgo(3),
    expiresAt: daysAgo(-4), // Expires in 4 days
    status: 'pending',
    message: 'Please join our team as an inventory specialist.'
  },
  {
    id: 'invite-2',
    email: 'expired@example.com',
    role: 'user',
    invitedBy: 'user-1',
    invitedAt: daysAgo(10),
    expiresAt: daysAgo(3), // Expired 3 days ago
    status: 'expired',
    message: 'We need your expertise on our team.'
  },
  {
    id: 'invite-3',
    email: 'accepted@example.com',
    role: 'manager',
    invitedBy: 'user-1',
    invitedAt: daysAgo(5),
    expiresAt: daysAgo(-2), // Would expire in 2 days
    status: 'accepted',
    message: 'Welcome to the management team!'
  }
];

// Sample organization settings
export const organizationSettings: OrganizationSettings = {
  id: 'org-1',
  name: 'Fluxori Inc.',
  logo: '/images/logo.svg',
  primaryColor: '#4dabf7',
  secondaryColor: '#37b24d',
  defaultLanguage: 'en',
  defaultTimezone: 'America/New_York',
  defaultTheme: 'system',
  securitySettings: {
    passwordPolicy: {
      minLength: 10,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90,
      preventReuseCount: 5
    },
    loginAttempts: 5,
    lockoutDuration: 30, // minutes
    sessionTimeout: 60, // minutes
    requireTwoFactor: false,
    allowedIpRanges: ['192.168.0.0/16'],
    singleSessionOnly: false
  },
  createdAt: daysAgo(365),
  updatedAt: daysAgo(10)
};