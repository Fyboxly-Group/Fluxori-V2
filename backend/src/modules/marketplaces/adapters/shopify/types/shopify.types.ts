// Fixed by fix-remaining-typescript-errors.js
/**
 * Shopify API specific types for data conversion between Shopify and our marketplace models
 */

// Shopify Product Types
export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  template_suffix: string | null;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
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
  admin_graphql_api_id: string
}

export interface ShopifyOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
  admin_graphql_api_id: string
}

export interface ShopifyInventoryLevel {
  inventory_item_id: number;
  location_id: number;
  available: number;
  updated_at: string;
  admin_graphql_api_id: string
}

// Shopify Order Types
export interface ShopifyOrder {
  id: number;
  admin_graphql_api_id: string;
  app_id: number | null;
  browser_ip: string | null;
  buyer_accepts_marketing: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cart_token: string | null;
  checkout_id: number | null;
  checkout_token: string | null;
  client_details: ShopifyClientDetails | null;
  closed_at: string | null;
  confirmed: boolean;
  contact_email: string | null;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_total_duties_set: any | null;
  current_total_price: string;
  current_total_tax: string;
  customer: ShopifyCustomer | null;
  customer_locale: string | null;
  discount_applications: ShopifyDiscountApplication[];
  discount_codes: ShopifyDiscountCode[];
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillments: ShopifyFulfillment[];
  fulfillment_status: string | null;
  gateway: string | null;
  landing_site: string | null;
  landing_site_ref: string | null;
  line_items: ShopifyLineItem[];
  location_id: number | null;
  name: string;
  note: string | null;
  note_attributes: ShopifyNoteAttribute[];
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_duties_set: any | null;
  payment_details: ShopifyPaymentDetails | null;
  payment_gateway_names: string[];
  phone: string | null;
  presentment_currency: string;
  processed_at: string;
  processing_method: string;
  reference: string | null;
  referring_site: string | null;
  refunds: ShopifyRefund[];
  shipping_address: ShopifyAddress | null;
  shipping_lines: ShopifyShippingLine[];
  source_identifier: string | null;
  source_name: string | null;
  source_url: string | null;
  subtotal_price: string;
  tags: string;
  tax_lines: ShopifyTaxLine[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_line_items_price: string;
  total_outstanding: string;
  total_price: string;
  total_price_usd: string | null;
  total_shipping_price_set: any;
  total_tax: string;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: number | null;
  billing_address: ShopifyAddress | null;
  fulfillment_orders: any[];
}

export interface ShopifyClientDetails {
  accept_language: string | null;
  browser_height: number | null;
  browser_ip: string | null;
  browser_width: number | null;
  session_hash: string | null;
  user_agent: string | null;
}

export interface ShopifyCustomer {
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
  last_order_name: string | null;
  currency: string;
  addresses: ShopifyAddress[];
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string | null;
  tax_exemptions: any[];
  admin_graphql_api_id: string;
  default_address: ShopifyAddress
}

export interface ShopifyAddress {
  id?: number;
  customer_id?: number;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zip: string | null;
  phone: string | null;
  name: string | null;
  province_code: string | null;
  country_code: string | null;
  country_name: string | null;
  default?: boolean;
}

export interface ShopifyDiscountApplication {
  type: string;
  value: string;
  value_type: string;
  allocation_method: string;
  target_selection: string;
  target_type: string;
  code?: string;
}

export interface ShopifyDiscountCode {
  code: string;
  amount: string;
  type: string
}

export interface ShopifyFulfillment {
  id: number;
  admin_graphql_api_id: string;
  created_at: string;
  location_id: number;
  name: string;
  order_id: number;
  receipt: {
    testcase: boolean;
    authorization: string
  };
  service: string;
  shipment_status: string | null;
  status: string;
  tracking_company: string | null;
  tracking_number: string | null;
  tracking_numbers: string[];
  tracking_url: string | null;
  tracking_urls: string[];
  updated_at: string;
  line_items: ShopifyLineItem[];
}

export interface ShopifyLineItem {
  id: number;
  admin_graphql_api_id: string;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: string | null;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set: any;
  product_exists: boolean;
  product_id: number | null;
  properties: Array<{ name: string; value: string }>;
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: any;
  variant_id: number | null;
  variant_inventory_management: string | null;
  variant_title: string | null;
  tax_lines: ShopifyTaxLine[];
  duties: any[];
  discount_allocations: ShopifyDiscountAllocation[];
}

export interface ShopifyNoteAttribute {
  name: string;
  value: string
}

export interface ShopifyPaymentDetails {
  credit_card_bin: string | null;
  avs_result_code: string | null;
  cvv_result_code: string | null;
  credit_card_number: string;
  credit_card_company: string;
  credit_card_name: string | null;
  credit_card_wallet: string | null;
  credit_card_expiration_month: number | null;
  credit_card_expiration_year: number | null;
}

export interface ShopifyRefund {
  id: number;
  admin_graphql_api_id: string;
  created_at: string;
  note: string | null;
  order_id: number;
  processed_at: string;
  restock: boolean;
  total_duties_set: any | null;
  user_id: number;
  order_adjustments: any[];
  transactions: ShopifyTransaction[];
  refund_line_items: ShopifyRefundLineItem[];
  duties: any[];
}

export interface ShopifyRefundLineItem {
  id: number;
  line_item_id: number;
  location_id: number;
  quantity: number;
  restock_type: string;
  subtotal: number;
  total_tax: number;
  line_item: ShopifyLineItem
}

export interface ShopifyTransaction {
  id: number;
  admin_graphql_api_id: string;
  amount: string;
  authorization: string | null;
  created_at: string;
  currency: string;
  device_id: number | null;
  error_code: string | null;
  gateway: string;
  kind: string;
  location_id: number | null;
  message: string | null;
  order_id: number;
  parent_id: number | null;
  processed_at: string;
  receipt: any;
  source_name: string;
  status: string;
  test: boolean;
  user_id: number | null;
}

export interface ShopifyShippingLine {
  id: number;
  carrier_identifier: string | null;
  code: string;
  delivery_category: string | null;
  discounted_price: string;
  discounted_price_set: any;
  phone: string | null;
  price: string;
  price_set: any;
  requested_fulfillment_service_id: string | null;
  source: string;
  title: string;
  tax_lines: any[];
  discount_allocations: any[];
}

export interface ShopifyTaxLine {
  price: string;
  rate: number;
  title: string;
  price_set?: any;
  channel_liable?: boolean;
}

export interface ShopifyDiscountAllocation {
  amount: string;
  amount_set: any;
  discount_application_index: number
}

// Location
export interface ShopifyLocation {
  id: number;
  name: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zip: string | null;
  province: string | null;
  country: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  country_code: string | null;
  country_name: string | null;
  province_code: string | null;
  legacy: boolean;
  active: boolean;
  admin_graphql_api_id: string;
  localized_country_name: string | null;
  localized_province_name: string | null;
}

// Response wrappers
export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
  pagination?: ShopifyPagination;
}

export interface ShopifyProductResponse {
  product: ShopifyProduct
}

export interface ShopifyInventoryLevelsResponse {
  inventory_levels: ShopifyInventoryLevel[];
  pagination?: ShopifyPagination;
}

export interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
  pagination?: ShopifyPagination;
}

export interface ShopifyOrderResponse {
  order: ShopifyOrder
}

export interface ShopifyLocationsResponse {
  locations: ShopifyLocation[];
}

// Pagination
export interface ShopifyPagination {
  next?: string | null;
  previous?: string | null;
}