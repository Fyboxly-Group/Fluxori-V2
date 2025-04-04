// @ts-nocheck - Added by final-ts-fix.js
import { IOrderMapper } from './order-mapper.interface';
import { MarketplaceOrder, OrderStatus as MarketplaceOrderStatus, PaymentStatus as MarketplacePaymentStatus } from '../../marketplaces/models/marketplace.models';
import { IOrder, OrderStatus, PaymentStatus, FulfillmentType } from '../models/order.model';
import mongoose from 'mongoose';

/**
 * Maps Takealot orders to Fluxori's standardized order format
 */
export class TakealotOrderMapper implements IOrderMapper {
  /**
   * Map a Takealot order to Fluxori's standardized order format
   * @param marketplaceOrder - Raw Takealot order
   * @param userId - The user ID
   * @param organizationId - The organization ID
   * @returns Standardized order object
   */
  public mapToFluxoriOrder(
    marketplaceOrder: MarketplaceOrder,
    userId: string,
    organizationId: string
  ): IOrder {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const orgObjectId = new mongoose.Types.ObjectId(organizationId);

    const orderStatus = this.mapOrderStatus(marketplaceOrder.orderStatus);
    const paymentStatus = this.mapPaymentStatus(marketplaceOrder.paymentStatus);

    // Combine first and last name for customer name if available
    const customerName = this.buildCustomerName(
      marketplaceOrder.customerDetails.firstName,
      marketplaceOrder.customerDetails.lastName
    );

    // Extract marketplace-specific data for reference
    const marketplaceData = {
      ...marketplaceOrder.marketplaceSpecific,
      salesChannel: marketplaceOrder.marketplaceSpecific?.salesChannel
    };

    return {
      userId: userObjectId,
      organizationId: orgObjectId,
      marketplaceId: 'takealot',
      marketplaceName: 'Takealot',
      marketplaceOrderId: marketplaceOrder.marketplaceOrderId,
      orderNumber: marketplaceOrder.id, // Use Takealot's order ID as the order number
      orderStatus,
      paymentStatus,
      customerEmail: marketplaceOrder.customerDetails.email,
      customerName,
      customerPhone: marketplaceOrder.customerDetails.phone,
      shippingAddress: marketplaceOrder.shippingDetails.address,
      billingAddress: marketplaceOrder.customerDetails.billingAddress,
      lineItems: marketplaceOrder.orderItems.map((item: any) => ({
        sku: item.sku,
        marketplaceProductId: item.marketplaceProductId,
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        tax: item.tax,
        discount: item.discount,
        total: item.total,
        imageUrl: item.imageUrl,
        attributes: item.attributes ? item.attributes.map((attr: any) => ({
          name: attr.name,
          value: String(attr.value)
        })) : []
      })),
      currency: marketplaceOrder.currencyCode || 'ZAR', // Default to ZAR for Takealot
      subtotal: marketplaceOrder.subtotal,
      tax: marketplaceOrder.tax,
      shipping: marketplaceOrder.shippingCost,
      discount: marketplaceOrder.discount,
      total: marketplaceOrder.total,
      notes: marketplaceOrder.notes,
      fulfillmentType: this.mapFulfillmentType(marketplaceOrder.fulfillmentType),
      orderDate: marketplaceOrder.createdAt,
      processedDate: new Date(),
      trackingNumber: marketplaceOrder.shippingDetails.trackingNumber,
      trackingCompany: marketplaceOrder.shippingDetails.carrier,
      trackingUrl: marketplaceOrder.shippingDetails.trackingUrl,
      estimatedDeliveryDate: marketplaceOrder.shippingDetails.estimatedDelivery,
      shippedDate: marketplaceOrder.shippingDetails.shippedAt,
      deliveredDate: marketplaceOrder.shippingDetails.deliveredAt,
      marketplaceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Map Takealot order status to Fluxori order status
   * @param takealotStatus - Takealot order status
   * @returns Fluxori order status
   */
  private mapOrderStatus(takealotStatus: MarketplaceOrderStatus | string): OrderStatus {
    switch (takealotStatus) {
      case MarketplaceOrderStatus.NEW:
      case 'New':
      case 'Received':
        return OrderStatus.NEW;
      case MarketplaceOrderStatus.PROCESSING:
      case 'Processing':
      case 'Packing':
        return OrderStatus.PROCESSING;
      case MarketplaceOrderStatus.SHIPPED:
      case 'Shipped':
      case 'In Transit':
        return OrderStatus.SHIPPED;
      case MarketplaceOrderStatus.DELIVERED:
      case 'Delivered':
        return OrderStatus.DELIVERED;
      case MarketplaceOrderStatus.CANCELED:
      case 'Cancelled':
      case 'Canceled':
        return OrderStatus.CANCELED;
      case MarketplaceOrderStatus.ON_HOLD:
      case 'On Hold':
        return OrderStatus.ON_HOLD;
      case MarketplaceOrderStatus.RETURNED:
      case 'Returned':
        return OrderStatus.RETURNED;
      case MarketplaceOrderStatus.REFUNDED:
      case 'Refunded':
        return OrderStatus.REFUNDED;
      case MarketplaceOrderStatus.COMPLETED:
      case 'Completed':
      case 'Finalised':
        return OrderStatus.COMPLETED;
      default:
        // If status is not recognized, default to NEW
        return OrderStatus.NEW;
    }
  }

  /**
   * Map Takealot payment status to Fluxori payment status
   * @param takealotPaymentStatus - Takealot payment status
   * @returns Fluxori payment status
   */
  private mapPaymentStatus(takealotPaymentStatus: MarketplacePaymentStatus | string): PaymentStatus {
    switch (takealotPaymentStatus) {
      case MarketplacePaymentStatus.PENDING:
      case 'Pending':
        return PaymentStatus.PENDING;
      case MarketplacePaymentStatus.AUTHORIZED:
      case 'Authorized':
        return PaymentStatus.AUTHORIZED;
      case MarketplacePaymentStatus.PAID:
      case 'Paid':
      case 'Complete':
        return PaymentStatus.PAID;
      case MarketplacePaymentStatus.PARTIALLY_PAID:
      case 'Partially Paid':
        return PaymentStatus.PARTIALLY_PAID;
      case MarketplacePaymentStatus.REFUNDED:
      case 'Refunded':
        return PaymentStatus.REFUNDED;
      case MarketplacePaymentStatus.PARTIALLY_REFUNDED:
      case 'Partially Refunded':
        return PaymentStatus.PARTIALLY_REFUNDED;
      case MarketplacePaymentStatus.FAILED:
      case 'Failed':
        return PaymentStatus.FAILED;
      case MarketplacePaymentStatus.VOIDED:
      case 'Voided':
        return PaymentStatus.VOIDED;
      default:
        // If status is not recognized, default to PENDING
        return PaymentStatus.PENDING;
    }
  }

  /**
   * Map fulfillment type to Fluxori format
   * @param fulfillmentType - Marketplace fulfillment type
   * @returns Fluxori fulfillment type
   */
  private mapFulfillmentType(
    fulfillmentType?: 'marketplace_fulfilled' | 'seller_fulfilled'
  ): FulfillmentType | undefined {
    if (!fulfillmentType) {
      return undefined;
    }
    
    switch (fulfillmentType) {
      case 'marketplace_fulfilled':
        return FulfillmentType.MARKETPLACE_FULFILLED;
      case 'seller_fulfilled':
        return FulfillmentType.SELLER_FULFILLED;
      default:
        return undefined;
    }
  }

  /**
   * Build a full customer name from first and last name
   * @param firstName - First name
   * @param lastName - Last name
   * @returns Full name or undefined if both are missing
   */
  private buildCustomerName(firstName?: string, lastName?: string): string | undefined {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
    return undefined;
  }
}