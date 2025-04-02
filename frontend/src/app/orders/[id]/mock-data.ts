import { Order } from '@/types/order';

export const mockOrderData: Order = {
  id: 'ord-12345',
  order_number: '10538',
  reference_number: 'REF-XYZ-789',
  channel: 'marketplace',
  marketplace: 'Amazon',
  marketplace_order_id: '114-3941689-8772232',
  date_created: new Date('2025-03-25T14:30:00Z'),
  date_modified: new Date('2025-03-26T09:15:00Z'),
  customer: {
    id: 'cust-789',
    email: 'john.customer@example.com',
    first_name: 'John',
    last_name: 'Customer',
    phone: '+1 (555) 123-4567',
    company: 'Acme Inc.'
  },
  shipping_address: {
    first_name: 'John',
    last_name: 'Customer',
    company: 'Acme Inc.',
    address_line1: '123 Main Street',
    address_line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567',
    email: 'john.customer@example.com'
  },
  billing_address: {
    first_name: 'John',
    last_name: 'Customer',
    company: 'Acme Inc.',
    address_line1: '123 Main Street',
    address_line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567',
    email: 'john.customer@example.com'
  },
  items: [
    {
      id: 'item-1',
      product_id: 'prod-abc-123',
      name: 'Premium Wireless Headphones',
      sku: 'SKU-WH-001',
      quantity: 1,
      price: 149.99,
      tax: 15.00,
      discount: 20.00,
      total: 144.99,
      image_url: 'https://placehold.co/600x400?text=Headphones',
      variation: {
        color: 'Black',
        connectivity: 'Bluetooth 5.2'
      },
      warehouse_id: 'wh-main',
      fulfillment_status: 'partially_fulfilled'
    },
    {
      id: 'item-2',
      product_id: 'prod-def-456',
      name: 'Smartphone Fast Charger 65W',
      sku: 'SKU-CHR-065',
      quantity: 2,
      price: 39.99,
      tax: 8.00,
      discount: 5.00,
      total: 82.98,
      image_url: 'https://placehold.co/600x400?text=Charger',
      warehouse_id: 'wh-main',
      fulfillment_status: 'fulfilled'
    },
    {
      id: 'item-3',
      product_id: 'prod-ghi-789',
      name: 'Waterproof Bluetooth Speaker',
      sku: 'SKU-SPK-101',
      quantity: 1,
      price: 89.99,
      tax: 9.00,
      discount: 0.00,
      total: 98.99,
      image_url: 'https://placehold.co/600x400?text=Speaker',
      variation: {
        color: 'Blue',
        batteryLife: '24 hours'
      },
      fulfillment_status: 'unfulfilled'
    }
  ],
  shipments: [
    {
      id: 'ship-1',
      carrier: 'FedEx',
      tracking_number: '794605896123',
      tracking_url: 'https://www.fedex.com/tracking/794605896123',
      status: 'delivered',
      estimated_delivery: new Date('2025-03-28T17:00:00Z'),
      shipped_date: new Date('2025-03-26T10:30:00Z'),
      items: [
        {
          order_item_id: 'item-1',
          quantity: 1
        },
        {
          order_item_id: 'item-2',
          quantity: 1
        }
      ],
      origin_address: {
        city: 'Atlanta',
        state: 'GA',
        country: 'United States'
      },
      destination_address: {
        city: 'New York',
        state: 'NY',
        country: 'United States'
      },
      events: [
        {
          id: 'event-1',
          timestamp: new Date('2025-03-26T10:45:00Z'),
          location: 'Atlanta, GA',
          status: 'information_received',
          description: 'Shipment information sent to FedEx',
          lat: 33.7490,
          lng: -84.3880
        },
        {
          id: 'event-2',
          timestamp: new Date('2025-03-26T14:30:00Z'),
          location: 'Atlanta, GA',
          status: 'in_transit',
          description: 'Picked up',
          lat: 33.7490,
          lng: -84.3880
        },
        {
          id: 'event-3',
          timestamp: new Date('2025-03-27T03:15:00Z'),
          location: 'Memphis, TN',
          status: 'in_transit',
          description: 'Arrived at FedEx hub',
          lat: 35.1495,
          lng: -90.0490
        },
        {
          id: 'event-4',
          timestamp: new Date('2025-03-27T07:45:00Z'),
          location: 'Memphis, TN',
          status: 'in_transit',
          description: 'Departed FedEx hub',
          lat: 35.1495,
          lng: -90.0490
        },
        {
          id: 'event-5',
          timestamp: new Date('2025-03-27T22:10:00Z'),
          location: 'New York, NY',
          status: 'in_transit',
          description: 'Arrived at FedEx destination facility',
          lat: 40.7128,
          lng: -74.0060
        },
        {
          id: 'event-6',
          timestamp: new Date('2025-03-28T08:30:00Z'),
          location: 'New York, NY',
          status: 'out_for_delivery',
          description: 'On FedEx vehicle for delivery',
          lat: 40.7128,
          lng: -74.0060
        },
        {
          id: 'event-7',
          timestamp: new Date('2025-03-28T14:22:00Z'),
          location: 'New York, NY',
          status: 'delivered',
          description: 'Delivered - Signed for by J. CUSTOMER',
          lat: 40.7128,
          lng: -74.0060
        }
      ]
    },
    {
      id: 'ship-2',
      carrier: 'UPS',
      tracking_number: '1Z9999999999999999',
      tracking_url: 'https://www.ups.com/track?tracknum=1Z9999999999999999',
      status: 'in_transit',
      estimated_delivery: new Date('2025-03-30T17:00:00Z'),
      shipped_date: new Date('2025-03-28T11:15:00Z'),
      items: [
        {
          order_item_id: 'item-2',
          quantity: 1
        }
      ],
      origin_address: {
        city: 'Dallas',
        state: 'TX',
        country: 'United States'
      },
      destination_address: {
        city: 'New York',
        state: 'NY',
        country: 'United States'
      },
      events: [
        {
          id: 'event-8',
          timestamp: new Date('2025-03-28T11:15:00Z'),
          location: 'Dallas, TX',
          status: 'information_received',
          description: 'Shipment information received',
          lat: 32.7767,
          lng: -96.7970
        },
        {
          id: 'event-9',
          timestamp: new Date('2025-03-28T15:45:00Z'),
          location: 'Dallas, TX',
          status: 'in_transit',
          description: 'Package picked up',
          lat: 32.7767,
          lng: -96.7970
        },
        {
          id: 'event-10',
          timestamp: new Date('2025-03-28T23:30:00Z'),
          location: 'Memphis, TN',
          status: 'in_transit',
          description: 'Arrived at UPS Facility',
          lat: 35.1495,
          lng: -90.0490
        }
      ]
    }
  ],
  payments: [
    {
      id: 'payment-1',
      amount: 326.96,
      payment_method: 'credit_card',
      transaction_id: 'txn_1234567890',
      status: 'paid',
      date: new Date('2025-03-25T14:35:00Z'),
      currency: 'USD',
      notes: 'Visa ending in 4242'
    }
  ],
  documents: [
    {
      id: 'doc-1',
      type: 'invoice',
      title: 'Invoice #INV-10538',
      file_url: '/sample-docs/invoice.pdf',
      created_at: new Date('2025-03-25T14:40:00Z'),
      mime_type: 'application/pdf',
      size: 256000,
      preview_url: '/sample-docs/invoice.pdf'
    },
    {
      id: 'doc-2',
      type: 'packing_slip',
      title: 'Packing Slip #PCK-10538-1',
      file_url: '/sample-docs/packing-slip-1.pdf',
      created_at: new Date('2025-03-26T10:15:00Z'),
      mime_type: 'application/pdf',
      size: 198000,
      preview_url: '/sample-docs/packing-slip-1.pdf'
    },
    {
      id: 'doc-3',
      type: 'packing_slip',
      title: 'Packing Slip #PCK-10538-2',
      file_url: '/sample-docs/packing-slip-2.pdf',
      created_at: new Date('2025-03-28T11:10:00Z'),
      mime_type: 'application/pdf',
      size: 190000,
      preview_url: '/sample-docs/packing-slip-2.pdf'
    },
    {
      id: 'doc-4',
      type: 'receipt',
      title: 'Receipt #RCT-10538',
      file_url: '/sample-docs/receipt.pdf',
      created_at: new Date('2025-03-25T14:45:00Z'),
      mime_type: 'application/pdf',
      size: 145000,
      preview_url: '/sample-docs/receipt.pdf'
    }
  ],
  timeline: [
    {
      id: 'timeline-1',
      timestamp: new Date('2025-03-25T14:30:00Z'),
      type: 'order_created',
      title: 'Order Created',
      description: 'Order #10538 was created via Amazon Marketplace.',
      metadata: {
        channel: 'marketplace',
        marketplace: 'Amazon'
      }
    },
    {
      id: 'timeline-2',
      timestamp: new Date('2025-03-25T14:35:00Z'),
      type: 'payment',
      title: 'Payment Received',
      description: 'Payment of $326.96 received via credit card.',
      metadata: {
        payment_id: 'payment-1',
        amount: 326.96,
        method: 'credit_card'
      }
    },
    {
      id: 'timeline-3',
      timestamp: new Date('2025-03-25T15:10:00Z'),
      type: 'status_change',
      title: 'Status Changed',
      description: 'Order status changed from "pending" to "processing".',
      user_id: 'user-123',
      user_name: 'System',
      metadata: {
        old_status: 'pending',
        new_status: 'processing'
      }
    },
    {
      id: 'timeline-4',
      timestamp: new Date('2025-03-26T09:15:00Z'),
      type: 'note',
      title: 'Note Added',
      description: 'Customer requested delivery to be left at the front door if no one is home.',
      user_id: 'user-456',
      user_name: 'Sarah Johnson',
      metadata: {
        note_id: 'note-1'
      }
    },
    {
      id: 'timeline-5',
      timestamp: new Date('2025-03-26T10:30:00Z'),
      type: 'shipment',
      title: 'Shipment Created',
      description: 'Shipment #ship-1 created with carrier FedEx, tracking number 794605896123.',
      user_id: 'user-789',
      user_name: 'Mark Wilson',
      metadata: {
        shipment_id: 'ship-1',
        carrier: 'FedEx',
        tracking_number: '794605896123'
      }
    },
    {
      id: 'timeline-6',
      timestamp: new Date('2025-03-26T14:30:00Z'),
      type: 'status_change',
      title: 'Status Changed',
      description: 'Order status changed from "processing" to "partially_shipped".',
      user_id: 'user-123',
      user_name: 'System',
      metadata: {
        old_status: 'processing',
        new_status: 'partially_shipped'
      }
    },
    {
      id: 'timeline-7',
      timestamp: new Date('2025-03-28T11:15:00Z'),
      type: 'shipment',
      title: 'Shipment Created',
      description: 'Shipment #ship-2 created with carrier UPS, tracking number 1Z9999999999999999.',
      user_id: 'user-789',
      user_name: 'Mark Wilson',
      metadata: {
        shipment_id: 'ship-2',
        carrier: 'UPS',
        tracking_number: '1Z9999999999999999'
      }
    },
    {
      id: 'timeline-8',
      timestamp: new Date('2025-03-28T14:22:00Z'),
      type: 'shipment',
      title: 'Shipment Delivered',
      description: 'Shipment #ship-1 was delivered. Signed for by J. CUSTOMER.',
      metadata: {
        shipment_id: 'ship-1',
        carrier: 'FedEx',
        tracking_number: '794605896123'
      }
    },
    {
      id: 'timeline-9',
      timestamp: new Date('2025-03-29T10:45:00Z'),
      type: 'note',
      title: 'Note Added',
      description: 'Customer confirmed receipt of first shipment and is satisfied with the products.',
      user_id: 'user-456',
      user_name: 'Sarah Johnson',
      metadata: {
        note_id: 'note-2'
      }
    }
  ],
  status: 'partially_shipped',
  payment_status: 'paid',
  total_items: 4,
  subtotal: 319.96,
  shipping_total: 0,
  tax_total: 32.00,
  discount_total: 25.00,
  total: 326.96,
  currency: 'USD',
  notes: 'Customer is a VIP client. Expedited shipping provided at no extra charge.',
  tags: ['VIP', 'Amazon', 'International'],
  is_priority: true,
  warehouse_id: 'wh-main',
  shipping_method: 'Express',
  shipping_provider: 'FedEx'
};