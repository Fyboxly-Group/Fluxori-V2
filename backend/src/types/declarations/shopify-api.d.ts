/**
 * Type definitions for Shopify Admin API
 */

declare module '@shopify/admin-api-client' {
  export interface ApiClientOptions {
    apiVersion: string;
    hostName: string;
    session: {
      accessToken?: string;
      apiKey?: string;
      apiSecretKey?: string;
    };
  }

  export interface ApiClient {
    request<T = any>(params: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      path: string;
      query?: Record<string, any>;
      data?: Record<string, any>;
    }): Promise<T>;
  }

  export function createAdminApiClient(options: ApiClientOptions): ApiClient;
}

declare namespace Shopify {
  interface ShopifyAddress {
    address1?: string;
    address2?: string;
    city?: string;
    company?: string;
    country?: string;
    country_code?: string;
    country_name?: string;
    customer_id?: number;
    default?: boolean;
    first_name?: string;
    id?: number;
    last_name?: string;
    name?: string;
    phone?: string;
    province?: string;
    province_code?: string;
    zip?: string;
  }

  interface ShopifyLocation {
    id: number;
    name: string;
    active: boolean;
    legacy: boolean;
    address1?: string;
    address2?: string;
    city?: string;
    country_code?: string;
    province_code?: string;
    zip?: string;
    phone?: string;
  }

  interface ShopifyImage {
    id: number;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
  }

  interface ShopifyVariant {
    id: number;
    product_id: number;
    title: string;
    price: string;
    sku: string;
    position: number;
    inventory_policy: string;
    compare_at_price: string | null;
    inventory_management: string | null;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    created_at: string;
    updated_at: string;
    taxable: boolean;
    barcode: string | null;
    grams: number;
    image_id: number | null;
    weight: number;
    weight_unit: string;
    inventory_item_id: number;
    inventory_quantity: number;
    old_inventory_quantity: number;
    requires_shipping: boolean;
    admin_graphql_api_id: string;
  }

  interface ShopifyOption {
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: string[];
  }

  interface ShopifyProduct {
    id: number;
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    status: 'active' | 'archived' | 'draft';
    published_scope: string;
    tags: string;
    variants: ShopifyVariant[];
    options: ShopifyOption[];
    images: ShopifyImage[];
    image: ShopifyImage | null;
  }

  interface ShopifyCustomer {
    id: number;
    email: string;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    orders_count: number;
    state: string;
    total_spent: string;
    last_order_id: number | null;
    note: string | null;
    verified_email: boolean;
    multipass_identifier: string | null;
    tax_exempt: boolean;
    phone: string | null;
    tags: string;
    currency: string;
    addresses: ShopifyAddress[];
    accepts_marketing_updated_at: string;
    marketing_opt_in_level: string | null;
    admin_graphql_api_id: string;
  }

  interface ShopifyLineItem {
    id: number;
    variant_id: number;
    title: string;
    quantity: number;
    sku: string;
    variant_title: string;
    vendor: string | null;
    price: string;
    total_discount: string;
    fulfillment_service: string;
    requires_shipping: boolean;
    taxable: boolean;
    gift_card: boolean;
    name: string;
    variant_inventory_management: string;
    properties: Array<{ name: string; value: string }>;
    product_exists: boolean;
    fulfillable_quantity: number;
    grams: number;
    tax_lines: Array<{ title: string; price: string; rate: number }>;
    applied_discount: { description: string; value: string; value_type: string } | null;
    fulfillment_status: string | null;
  }

  interface ShopifyFulfillment {
    id: number;
    order_id: number;
    status: string;
    created_at: string;
    service: string;
    updated_at: string;
    tracking_company: string;
    tracking_number: string;
    tracking_numbers: string[];
    tracking_url: string;
    tracking_urls: string[];
    line_items: ShopifyLineItem[];
  }

  interface ShopifyOrder {
    id: number;
    email: string;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
    number: number;
    note: string | null;
    token: string;
    gateway: string;
    test: boolean;
    total_price: string;
    subtotal_price: string;
    total_weight: number;
    total_tax: string;
    taxes_included: boolean;
    currency: string;
    financial_status: string;
    confirmed: boolean;
    total_discounts: string;
    total_line_items_price: string;
    cart_token: string;
    buyer_accepts_marketing: boolean;
    name: string;
    referring_site: string;
    landing_site: string;
    cancelled_at: string | null;
    cancel_reason: string | null;
    total_price_usd: string;
    checkout_token: string;
    reference: string;
    user_id: number | null;
    location_id: number | null;
    source_identifier: string | null;
    source_url: string | null;
    processed_at: string;
    device_id: number | null;
    phone: string | null;
    customer_locale: string;
    app_id: number;
    browser_ip: string;
    client_details: {
      accept_language: string;
      browser_height: number;
      browser_ip: string;
      browser_width: number;
      session_hash: string;
      user_agent: string;
    };
    landing_site_ref: string | null;
    order_number: string;
    discount_applications: any[];
    discount_codes: any[];
    note_attributes: any[];
    payment_gateway_names: string[];
    processing_method: string;
    checkout_id: number;
    source_name: string;
    fulfillment_status: string | null;
    tax_lines: Array<{
      price: string;
      rate: number;
      title: string;
    }>;
    tags: string;
    contact_email: string;
    order_status_url: string;
    presentment_currency: string;
    total_line_items_price_set: {
      shop_money: { amount: string; currency_code: string };
      presentment_money: { amount: string; currency_code: string };
    };
    total_discounts_set: {
      shop_money: { amount: string; currency_code: string };
      presentment_money: { amount: string; currency_code: string };
    };
    total_shipping_price_set: {
      shop_money: { amount: string; currency_code: string };
      presentment_money: { amount: string; currency_code: string };
    };
    subtotal_price_set: {
      shop_money: { amount: string; currency_code: string };
      presentment_money: { amount: string; currency_code: string };
    };
    total_price_set: {
      shop_money: { amount: string; currency_code: string };
      presentment_money: { amount: string; currency_code: string };
    };
    total_tax_set: {
      shop_money: { amount: string; currency_code: string };
      presentment_money: { amount: string; currency_code: string };
    };
    line_items: ShopifyLineItem[];
    fulfillments: ShopifyFulfillment[];
    shipping_lines: Array<{
      id: number;
      title: string;
      price: string;
      code: string;
      source: string;
      phone: string | null;
      requested_fulfillment_service_id: string | null;
      delivery_category: string | null;
      carrier_identifier: string | null;
      discounted_price: string;
      price_set: {
        shop_money: { amount: string; currency_code: string };
        presentment_money: { amount: string; currency_code: string };
      };
      discounted_price_set: {
        shop_money: { amount: string; currency_code: string };
        presentment_money: { amount: string; currency_code: string };
      };
      tax_lines: any[];
    }>;
    billing_address: ShopifyAddress;
    shipping_address: ShopifyAddress;
    customer: ShopifyCustomer;
  }

  interface ShopifyInventoryLevel {
    inventory_item_id: number;
    location_id: number;
    available: number;
    updated_at: string;
  }

  interface ShopifyInventoryItem {
    id: number;
    sku: string;
    created_at: string;
    updated_at: string;
    requires_shipping: boolean;
    cost: string;
    country_code_of_origin: string | null;
    province_code_of_origin: string | null;
    tracked: boolean;
    admin_graphql_api_id: string;
  }

  interface ShopifyShop {
    id: number;
    name: string;
    email: string;
    domain: string;
    province: string;
    country: string;
    address1: string;
    zip: string;
    city: string;
    source: string | null;
    phone: string;
    latitude: number;
    longitude: number;
    primary_locale: string;
    address2: string | null;
    created_at: string;
    updated_at: string;
    country_code: string;
    country_name: string;
    currency: string;
    customer_email: string;
    timezone: string;
    shop_owner: string;
    money_format: string;
    money_with_currency_format: string;
    weight_unit: string;
    province_code: string;
    taxes_included: boolean;
    tax_shipping: boolean | null;
    county_taxes: boolean;
    plan_display_name: string;
    plan_name: string;
    has_discounts: boolean;
    has_gift_cards: boolean;
    myshopify_domain: string;
    google_apps_domain: string | null;
    google_apps_login_enabled: boolean | null;
    money_in_emails_format: string;
    money_with_currency_in_emails_format: string;
    eligible_for_payments: boolean;
    requires_extra_payments_agreement: boolean;
    password_enabled: boolean;
    has_storefront: boolean;
    eligible_for_card_reader_giveaway: boolean;
    finances: boolean;
    setup_required: boolean;
    force_ssl: boolean;
  }
}