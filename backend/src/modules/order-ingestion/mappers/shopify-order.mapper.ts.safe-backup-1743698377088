// @ts-nocheck - Added by final-ts-fix.js
import { IOrderMapper } from './order-mapper.interface';
import { MarketplaceOrder, OrderStatus as MarketplaceOrderStatus, PaymentStatus as MarketplacePaymentStatus } from '../../marketplaces/models/marketplace.models';
import { IOrder, OrderStatus, PaymentStatus, FulfillmentType } from '../models/order.model';
import mongoose from 'mongoose';

/**
 * Maps Shopify orders to Fluxori's standardized order format
 */
export class ShopifyOrderMapper implements IOrderMapper {
  /**
   * Map a Shopify order to Fluxori's standardized order format
   * @param marketplaceOrder - Raw Shopify order
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
      ...marketplaceOrder.marketplaceSpecific
    };

    return {
      userId: userObjectId,
      organizationId: orgObjectId,
      marketplaceId: 'shopify',
      marketplaceName: 'Shopify',
      marketplaceOrderId: marketplaceOrder.marketplaceOrderId,
      orderNumber: marketplaceOrder.id, // Use Shopify's order ID as the order number
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
      currency: marketplaceOrder.currencyCode,
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
   * Map Shopify order status to Fluxori order status
   * @param shopifyStatus - Shopify order status
   * @returns Fluxori order status
   */
  private mapOrderStatus(shopifyStatus: MarketplaceOrderStatus | string): OrderStatus {
    switch (shopifyStatus) {
      case MarketplaceOrderStatus.NEW:
        return OrderStatus.NEW;
      case MarketplaceOrderStatus.PROCESSING:
        return OrderStatus.PROCESSING;
      case MarketplaceOrderStatus.SHIPPED:
        return OrderStatus.SHIPPED;
      case MarketplaceOrderStatus.DELIVERED:
        return OrderStatus.DELIVERED;
      case MarketplaceOrderStatus.CANCELED:
        return OrderStatus.CANCELED;
      case MarketplaceOrderStatus.ON_HOLD:
        return OrderStatus.ON_HOLD;
      case MarketplaceOrderStatus.RETURNED:
        return OrderStatus.RETURNED;
      case MarketplaceOrderStatus.REFUNDED:
        return OrderStatus.REFUNDED;
      case MarketplaceOrderStatus.COMPLETED:
        return OrderStatus.COMPLETED;
      default:
        // If status is not recognized, default to NEW
        return OrderStatus.NEW;
    }
  }

  /**
   * Map Shopify payment status to Fluxori payment status
   * @param shopifyPaymentStatus - Shopify payment status
   * @returns Fluxori payment status
   */
  private mapPaymentStatus(shopifyPaymentStatus: MarketplacePaymentStatus | string): PaymentStatus {
    switch (shopifyPaymentStatus) {
      case MarketplacePaymentStatus.PENDING:
        return PaymentStatus.PENDING;
      case MarketplacePaymentStatus.AUTHORIZED:
        return PaymentStatus.AUTHORIZED;
      case MarketplacePaymentStatus.PAID:
        return PaymentStatus.PAID;
      case MarketplacePaymentStatus.PARTIALLY_PAID:
        return PaymentStatus.PARTIALLY_PAID;
      case MarketplacePaymentStatus.REFUNDED:
        return PaymentStatus.REFUNDED;
      case MarketplacePaymentStatus.PARTIALLY_REFUNDED:
        return PaymentStatus.PARTIALLY_REFUNDED;
      case MarketplacePaymentStatus.FAILED:
        return PaymentStatus.FAILED;
      case MarketplacePaymentStatus.VOIDED:
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
    if (!fulfillmentType) return undefined;
    
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