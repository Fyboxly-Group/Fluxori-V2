import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Order status types
 */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

/**
 * Payment status types
 */
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';

/**
 * Order interface defining the data structure
 */
export interface IOrder {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
    subtotal: number;
  }[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  orderStatus: OrderStatus;
  shipment?: mongoose.Types.ObjectId;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Document interface for Mongoose
 */
export interface IOrderDocument extends IOrder, Document {}

/**
 * Mongoose schema definition
 */
const orderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'InventoryItem',
          required: true,
        },
        sku: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        discount: {
          type: Number,
          default: 0,
          min: 0,
        },
        tax: {
          type: Number,
          default: 0,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxTotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discountTotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      name: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    billingAddress: {
      name: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'refunded', 'failed'],
      default: 'pending',
    },
    transactionId: {
      type: String,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    shipment: {
      type: Schema.Types.ObjectId,
      ref: 'Shipment',
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

/**
 * Instance methods
 */
orderSchema.methods.isPaid = function(this: IOrderDocument): boolean {
  return this.paymentStatus === 'paid';
};

/**
 * Static methods
 */
interface OrderModel extends Model<IOrderDocument> {
  findPendingOrders(): Promise<IOrderDocument[]>;
}

orderSchema.statics.findPendingOrders = function(this: Model<IOrderDocument>): Promise<IOrderDocument[]> {
  return this.find({ orderStatus: 'pending' }).sort({ createdAt: 1 });
};

/**
 * Create and export the model
 */
const Order = mongoose.model<IOrderDocument, OrderModel>('Order', orderSchema);

export default Order;