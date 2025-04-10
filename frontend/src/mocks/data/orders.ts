export const mockOrders = [
  {
    id: 'order-001',
    orderNumber: '10001',
    customer: {
      id: 'cust-001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1-555-123-4567',
    },
    items: [
      {
        id: 'item-001',
        sku: 'SKU-12345',
        name: 'Premium Headphones',
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99,
      },
      {
        id: 'item-002',
        sku: 'SKU-13579',
        name: 'Smartphone Power Bank',
        quantity: 2,
        unitPrice: 49.99,
        totalPrice: 99.98,
      },
    ],
    status: 'Processing',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express Shipping',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
    subtotal: 299.97,
    shippingCost: 15.00,
    tax: 25.50,
    discount: 0,
    total: 340.47,
    notes: 'Please deliver before 5 PM if possible',
    createdAt: '2024-03-20T14:30:00Z',
    updatedAt: '2024-03-21T09:15:00Z',
    marketplace: 'amazon',
    marketplaceOrderId: '111-2222333-4444555',
    shipment: {
      id: 'ship-001',
      trackingNumber: 'TRK12345US',
      carrier: 'FedEx',
      estimatedDelivery: '2024-03-25T00:00:00Z',
      status: 'In Transit',
      statusHistory: [
        {
          status: 'Order Received',
          timestamp: '2024-03-20T14:30:00Z',
          location: 'Online',
        },
        {
          status: 'Processing',
          timestamp: '2024-03-21T09:15:00Z',
          location: 'Warehouse A',
        },
        {
          status: 'Shipped',
          timestamp: '2024-03-22T11:20:00Z',
          location: 'Warehouse A',
        },
        {
          status: 'In Transit',
          timestamp: '2024-03-23T08:45:00Z',
          location: 'Distribution Center',
        },
      ],
    },
  },
  {
    id: 'order-002',
    orderNumber: '10002',
    customer: {
      id: 'cust-002',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1-555-987-6543',
    },
    items: [
      {
        id: 'item-003',
        sku: 'SKU-67890',
        name: 'Ergonomic Office Chair',
        quantity: 1,
        unitPrice: 249.99,
        totalPrice: 249.99,
      },
    ],
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'PayPal',
    shippingMethod: 'Standard Shipping',
    shippingAddress: {
      street: '456 Elm St',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'USA',
    },
    subtotal: 249.99,
    shippingCost: 10.00,
    tax: 21.25,
    discount: 25.00,
    total: 256.24,
    notes: '',
    createdAt: '2024-03-15T10:20:00Z',
    updatedAt: '2024-03-19T16:40:00Z',
    marketplace: 'takealot',
    marketplaceOrderId: 'TAK987654321',
    shipment: {
      id: 'ship-002',
      trackingNumber: 'TRK98765US',
      carrier: 'UPS',
      estimatedDelivery: '2024-03-19T00:00:00Z',
      status: 'Delivered',
      statusHistory: [
        {
          status: 'Order Received',
          timestamp: '2024-03-15T10:20:00Z',
          location: 'Online',
        },
        {
          status: 'Processing',
          timestamp: '2024-03-16T09:00:00Z',
          location: 'Warehouse B',
        },
        {
          status: 'Shipped',
          timestamp: '2024-03-17T11:30:00Z',
          location: 'Warehouse B',
        },
        {
          status: 'In Transit',
          timestamp: '2024-03-18T08:15:00Z',
          location: 'Distribution Center',
        },
        {
          status: 'Out for Delivery',
          timestamp: '2024-03-19T09:20:00Z',
          location: 'Los Angeles',
        },
        {
          status: 'Delivered',
          timestamp: '2024-03-19T16:40:00Z',
          location: 'Los Angeles',
        },
      ],
    },
  },
];
