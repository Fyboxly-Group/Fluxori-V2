import { rest } from 'msw';
import { mockInventoryItems } from './data/inventory';
import { mockOrders } from './data/orders';
import { mockUser } from './data/user';
import { users, roles, activityLogs, organizationSettings } from './userManagementData';

export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'mock-token-xxx',
        user: mockUser,
      })
    );
  }),

  // Inventory endpoints
  rest.get('/api/inventory', (req, res, ctx) => {
    return res(
      ctx.json({
        items: mockInventoryItems,
        total: mockInventoryItems.length,
      })
    );
  }),

  rest.get('/api/inventory/:id', (req, res, ctx) => {
    const { id } = req.params;
    const item = mockInventoryItems.find(item => item.id === id);
    
    if (!item) {
      return res(ctx.status(404), ctx.json({ message: 'Item not found' }));
    }
    
    return res(ctx.json(item));
  }),

  // Orders endpoints
  rest.get('/api/orders', (req, res, ctx) => {
    return res(
      ctx.json({
        orders: mockOrders,
        total: mockOrders.length,
      })
    );
  }),

  rest.get('/api/orders/:id', (req, res, ctx) => {
    const { id } = req.params;
    const order = mockOrders.find(order => order.id === id);
    
    if (!order) {
      return res(ctx.status(404), ctx.json({ message: 'Order not found' }));
    }
    
    return res(ctx.json(order));
  }),

  // Notification endpoints
  rest.get('/api/notifications', (req, res, ctx) => {
    return res(
      ctx.json({
        notifications: [
          {
            id: '1',
            title: 'New order received',
            message: 'You have received a new order #12345',
            read: false,
            createdAt: new Date().toISOString(),
            type: 'order',
          },
          {
            id: '2',
            title: 'Low stock alert',
            message: 'Product SKU-123 is running low on stock',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            type: 'inventory',
          },
        ],
      })
    );
  }),

  // User Management endpoints
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        items: users,
        total: users.length,
        page: 1,
        pageSize: 10,
        totalPages: Math.ceil(users.length / 10)
      })
    );
  }),

  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const user = users.find(user => user.id === id);
    
    if (!user) {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }
    
    return res(ctx.json(user));
  }),

  rest.post('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-user-id',
        ...req.body
      })
    );
  }),

  rest.put('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const user = users.find(user => user.id === id);
    
    if (!user) {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }
    
    return res(ctx.json({
      ...user,
      ...req.body,
    }));
  }),

  rest.delete('/api/users/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Roles endpoints
  rest.get('/api/roles', (req, res, ctx) => {
    return res(ctx.json(roles));
  }),

  rest.get('/api/roles/:id', (req, res, ctx) => {
    const { id } = req.params;
    const role = roles.find(role => role.id === id);
    
    if (!role) {
      return res(ctx.status(404), ctx.json({ message: 'Role not found' }));
    }
    
    return res(ctx.json(role));
  }),

  // Activity logs endpoints
  rest.get('/api/activity-logs', (req, res, ctx) => {
    return res(
      ctx.json({
        items: activityLogs,
        total: activityLogs.length,
        page: 1,
        pageSize: 20,
        totalPages: Math.ceil(activityLogs.length / 20)
      })
    );
  }),

  // Organization settings endpoints
  rest.get('/api/organization-settings', (req, res, ctx) => {
    return res(ctx.json(organizationSettings));
  }),

  rest.put('/api/organization-settings', (req, res, ctx) => {
    return res(ctx.json({
      ...organizationSettings,
      ...req.body,
    }));
  }),

  // Add more handlers as needed
];