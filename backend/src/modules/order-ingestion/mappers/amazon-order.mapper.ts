import { IOrderMapper, orderMapperRegistry } from './order-mapper.interface';
import { 
  MarketplaceOrder, 
  OrderStatus as MarketplaceOrderStatus, 
  PaymentStatus as MarketplacePaymentStatus, 
  OrderItem 
} from '../../marketplaces/models/marketplace.models';
import { 
  IOrder, 
  OrderStatus, 
  PaymentStatus, 
  FulfillmentType,
  IOrderLineItem 
} from '../models/order.model';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Maps Amazon orders to Fluxori's standardized order format
 */
export class AmazonOrderMapper implements IOrderMapper {
  /**
   * Map an Amazon order to Fluxori's standardized order format
   * @param marketplaceOrder - Raw Amazon order
   * @param userId - The user ID
   * @param organizationId - The organization ID
   * @returns Standardized order object
   */
  public mapToFluxoriOrder(
    marketplaceOrder: MarketplaceOrder,
    userId: string,
    organizationId: string
  ): IOrder {
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
      isPrime: marketplaceOrder.marketplaceSpecific?.isPrime || false,
      fulfillmentChannel: marketplaceOrder.marketplaceSpecific?.fulfillmentChannel,
      amazonOrderType: marketplaceOrder.marketplaceSpecific?.orderType
    };

    // Determine the appropriate marketplace name based on marketplace specifics
    let marketplaceName = 'Amazon';
    if (marketplaceOrder.marketplaceSpecific?.marketplaceId) {
      const marketRegion = this.getMarketplaceRegion(marketplaceOrder.marketplaceSpecific.marketplaceId);
      if (marketRegion) {
        marketplaceName = `Amazon ${marketRegion}`;
      }
    }

    // Map line items
    const lineItems = this.mapLineItems(marketplaceOrder.orderItems);

    // Convert dates to Firestore timestamps
    const now = Timestamp.now();
    const orderDate = marketplaceOrder.createdAt ? 
      Timestamp.fromDate(new Date(marketplaceOrder.createdAt)) : 
      now;
    
    const shippedDate = marketplaceOrder.shippingDetails.shippedAt ? 
      Timestamp.fromDate(new Date(marketplaceOrder.shippingDetails.shippedAt)) : 
      undefined;
    
    const deliveredDate = marketplaceOrder.shippingDetails.deliveredAt ? 
      Timestamp.fromDate(new Date(marketplaceOrder.shippingDetails.deliveredAt)) : 
      undefined;
    
    const estimatedDeliveryDate = marketplaceOrder.shippingDetails.estimatedDelivery ? 
      Timestamp.fromDate(new Date(marketplaceOrder.shippingDetails.estimatedDelivery)) : 
      undefined;

    return {
      userId: userId,
      organizationId: organizationId,
      marketplaceId: 'amazon',
      marketplaceName,
      marketplaceOrderId: marketplaceOrder.marketplaceOrderId,
      orderNumber: marketplaceOrder.id, // Use Amazon's order ID as the order number
      orderStatus,
      paymentStatus,
      customerEmail: marketplaceOrder.customerDetails.email,
      customerName,
      customerPhone: marketplaceOrder.customerDetails.phone,
      shippingAddress: marketplaceOrder.shippingDetails.address,
      billingAddress: marketplaceOrder.customerDetails.billingAddress,
      lineItems,
      currency: marketplaceOrder.currencyCode,
      subtotal: marketplaceOrder.subtotal,
      tax: marketplaceOrder.tax,
      shipping: marketplaceOrder.shippingCost,
      discount: marketplaceOrder.discount,
      total: marketplaceOrder.total,
      notes: marketplaceOrder.notes,
      fulfillmentType: this.mapFulfillmentType(marketplaceOrder.marketplaceSpecific?.fulfillmentChannel),
      orderDate,
      processedDate: now,
      trackingNumber: marketplaceOrder.shippingDetails.trackingNumber,
      trackingCompany: marketplaceOrder.shippingDetails.carrier,
      trackingUrl: marketplaceOrder.shippingDetails.trackingUrl,
      estimatedDeliveryDate,
      shippedDate,
      deliveredDate,
      marketplaceData,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Map Amazon order items to Fluxori order line items
   * @param items - Amazon order items
   * @returns Fluxori order line items
   */
  private mapLineItems(items: OrderItem[]): IOrderLineItem[] {
    return items.map((item) => ({
      sku: item.sku,
      marketplaceProductId: item.marketplaceProductId || '',
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      tax: item.tax,
      discount: item.discount,
      total: item.total,
      imageUrl: item.imageUrl,
      attributes: item.attributes ? item.attributes.map((attr) => ({
        name: attr.name,
        value: String(attr.value)
      })) : []
    }));
  }

  /**
   * Map Amazon order status to Fluxori order status
   * @param amazonStatus - Amazon order status
   * @returns Fluxori order status
   */
  private mapOrderStatus(amazonStatus: MarketplaceOrderStatus | string): OrderStatus {
    switch (amazonStatus) {
      case MarketplaceOrderStatus.NEW:
      case 'Pending':
        return OrderStatus.NEW;
      case MarketplaceOrderStatus.PROCESSING:
      case 'Unshipped':
      case 'PartiallyShipped':
        return OrderStatus.PROCESSING;
      case MarketplaceOrderStatus.SHIPPED:
      case 'Shipped':
        return OrderStatus.SHIPPED;
      case MarketplaceOrderStatus.DELIVERED:
        return OrderStatus.DELIVERED;
      case MarketplaceOrderStatus.CANCELED:
      case 'Canceled':
        return OrderStatus.CANCELED;
      case MarketplaceOrderStatus.ON_HOLD:
        return OrderStatus.ON_HOLD;
      case MarketplaceOrderStatus.RETURNED:
        return OrderStatus.RETURNED;
      case MarketplaceOrderStatus.REFUNDED:
        return OrderStatus.REFUNDED;
      case MarketplaceOrderStatus.COMPLETED:
      case 'Completed':
        return OrderStatus.COMPLETED;
      default:
        // If status is not recognized, default to NEW
        return OrderStatus.NEW;
    }
  }

  /**
   * Map Amazon payment status to Fluxori payment status
   * @param amazonPaymentStatus - Amazon payment status
   * @returns Fluxori payment status
   */
  private mapPaymentStatus(amazonPaymentStatus: MarketplacePaymentStatus | string): PaymentStatus {
    switch (amazonPaymentStatus) {
      case MarketplacePaymentStatus.PENDING:
      case 'Pending':
        return PaymentStatus.PENDING;
      case MarketplacePaymentStatus.AUTHORIZED:
      case 'Authorized':
        return PaymentStatus.AUTHORIZED;
      case MarketplacePaymentStatus.PAID:
      case 'Captured':
        return PaymentStatus.PAID;
      case MarketplacePaymentStatus.PARTIALLY_PAID:
        return PaymentStatus.PARTIALLY_PAID;
      case MarketplacePaymentStatus.REFUNDED:
      case 'Refunded':
        return PaymentStatus.REFUNDED;
      case MarketplacePaymentStatus.PARTIALLY_REFUNDED:
      case 'PartiallyRefunded':
        return PaymentStatus.PARTIALLY_REFUNDED;
      case MarketplacePaymentStatus.FAILED:
      case 'Declined':
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
    fulfillmentType?: string
  ): FulfillmentType | undefined {
    if (!fulfillmentType) {
      return undefined;
    }
    
    switch (fulfillmentType.toLowerCase()) {
      case 'amazon':
      case 'fba':
      case 'amazon_fulfilled':
      case 'marketplace_fulfilled':
        return FulfillmentType.MARKETPLACE_FULFILLED;
      case 'merchant':
      case 'fbm':
      case 'merchant_fulfilled':
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

  /**
   * Get a human-readable marketplace region from Amazon marketplace ID
   * @param marketplaceId - Amazon marketplace ID
   * @returns Human-readable region
   */
  private getMarketplaceRegion(marketplaceId: string): string | undefined {
    const marketplaceRegions: Record<string, string> = {
      'A2EUQ1WTGCTBG2': 'Canada',
      'ATVPDKIKX0DER': 'US',
      'A1AM78C64UM0Y8': 'Mexico',
      'A1RKKUPIHCS9HS': 'Spain',
      'A1F83G8C2ARO7P': 'UK',
      'A13V1IB3VIYZZH': 'France',
      'AMEN7PMS3EDWL': 'Belgium',
      'A1PA6795UKMFR9': 'Germany',
      'APJ6JRA9NG5V4': 'Italy',
      'A1805IZSGTT6HS': 'Netherlands',
      'A17E79C6D8DWNP': 'Saudi Arabia',
      'A2VIGQ35RCS4UG': 'UAE',
      'A33AVAJ2PDY3EV': 'Turkey',
      'A21TJRUUN4KGV': 'India',
      'A19VAU5U5O7RUS': 'Singapore',
      'A39IBJ37TRP1C6': 'Australia',
      'A1VC38T7YXB528': 'Japan'
    };

    return marketplaceRegions[marketplaceId];
  }
}

// Register the mapper
const amazonOrderMapper = new AmazonOrderMapper();
orderMapperRegistry.registerMapper('amazon', amazonOrderMapper);

export default amazonOrderMapper;