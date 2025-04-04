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
  admin_graphql_api_id: string;
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
  admin_graphql_api_id: string;
}

// Shopify Order Types
export interface ShopifyOrder {
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
  total_price_usd: string | null;
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
  landing_site_ref: string | null;
  order_number: string;
  discount_applications: ShopifyDiscountApplication[];
  discount_codes: ShopifyDiscountCode[];
  note_attributes: ShopifyNoteAttribute[];
  payment_gateway_names: string[];
  processing_method: string;
  checkout_id: number;
  source_name: string;
  fulfillment_status: string | null;
  tax_lines: ShopifyTaxLine[];
  tags: string;
  contact_email: string;
  order_status_url: string;
  presentment_currency: string;
  total_line_items_price_set: ShopifyPriceSet;
  total_discounts_set: ShopifyPriceSet;
  total_shipping_price_set: ShopifyPriceSet;
  subtotal_price_set: ShopifyPriceSet;
  total_price_set: ShopifyPriceSet;
  total_tax_set: ShopifyPriceSet;
  line_items: ShopifyLineItem[];
  shipping_lines: ShopifyShippingLine[];
  billing_address: ShopifyAddress;
  shipping_address: ShopifyAddress;
  fulfillments: ShopifyFulfillment[];
  client_details: ShopifyClientDetails;
  refunds: ShopifyRefund[];
  payment_details: ShopifyPaymentDetails;
  customer: ShopifyCustomer;
  admin_graphql_api_id: string;
}

export interface ShopifyLineItem {
  id: number;
  variant_id: number;
  title: string;
  quantity: number;
  sku: string;
  variant_title: string;
  vendor: string | null;
  fulfillment_service: string;
  product_id: number;
  requires_shipping: boolean;
  taxable: boolean;
  gift_card: boolean;
  name: string;
  variant_inventory_management: string;
  properties: ShopifyProperty[];
  product_exists: boolean;
  fulfillable_quantity: number;
  grams: number;
  price: string;
  total_discount: string;
  fulfillment_status: string | null;
  price_set: ShopifyPriceSet;
  total_discount_set: ShopifyPriceSet;
  discount_allocations: ShopifyDiscountAllocation[];
  duties: any[];
  admin_graphql_api_id: string;
  tax_lines: ShopifyTaxLine[];
  origin_location: ShopifyOriginLocation;
}

export interface ShopifyPriceSet {
  shop_money: ShopifyMoney;
  presentment_money: ShopifyMoney;
}

export interface ShopifyMoney {
  amount: string;
  currency_code: string;
}

export interface ShopifyProperty {
  name: string;
  value: string;
}

export interface ShopifyDiscountAllocation {
  amount: string;
  discount_application_index: number;
  amount_set: ShopifyPriceSet;
}

export interface ShopifyDiscountApplication {
  type: string;
  value: string;
  value_type: string;
  allocation_method: string;
  target_selection: string;
  target_type: string;
  description: string;
}

export interface ShopifyDiscountCode {
  code: string;
  amount: string;
  type: string;
}

export interface ShopifyNoteAttribute {
  name: string;
  value: string;
}

export interface ShopifyTaxLine {
  price: string;
  rate: number;
  title: string;
  price_set: ShopifyPriceSet;
}

export interface ShopifyShippingLine {
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
  price_set: ShopifyPriceSet;
  discounted_price_set: ShopifyPriceSet;
  discount_allocations: ShopifyDiscountAllocation[];
  tax_lines: ShopifyTaxLine[];
}

export interface ShopifyAddress {
  first_name: string;
  address1: string;
  phone: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  last_name: string;
  address2: string | null;
  company: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string;
  country_code: string;
  province_code: string;
}

export interface ShopifyFulfillment {
  id: number;
  order_id: number;
  status: string;
  created_at: string;
  service: string;
  updated_at: string;
  tracking_company: string;
  shipment_status: string | null;
  tracking_number: string;
  tracking_numbers: string[];
  tracking_url: string;
  tracking_urls: string[];
  receipt: ShopifyReceipt;
  line_items: ShopifyLineItem[];
  admin_graphql_api_id: string;
}

export interface ShopifyReceipt {
  testcase: boolean;
  authorization: string;
}

export interface ShopifyClientDetails {
  accept_language: string;
  browser_height: number | null;
  browser_ip: string;
  browser_width: number | null;
  session_hash: string | null;
  user_agent: string;
}

export interface ShopifyRefund {
  id: number;
  order_id: number;
  created_at: string;
  note: string;
  user_id: number;
  processed_at: string;
  restock: boolean;
  duties: any[];
  admin_graphql_api_id: string;
  refund_line_items: ShopifyRefundLineItem[];
  transactions: ShopifyTransaction[];
  order_adjustments: ShopifyOrderAdjustment[];
}

export interface ShopifyRefundLineItem {
  id: number;
  quantity: number;
  line_item_id: number;
  location_id: number;
  restock_type: string;
  subtotal: number;
  total_tax: number;
  subtotal_set: ShopifyPriceSet;
  total_tax_set: ShopifyPriceSet;
  line_item: ShopifyLineItem;
}

export interface ShopifyTransaction {
  id: number;
  order_id: number;
  kind: string;
  gateway: string;
  status: string;
  message: string | null;
  created_at: string;
  test: boolean;
  authorization: string;
  location_id: number | null;
  user_id: number | null;
  parent_id: number | null;
  processed_at: string;
  device_id: number | null;
  error_code: string | null;
  source_name: string;
  receipt: ShopifyReceipt;
  amount: string;
  currency: string;
  admin_graphql_api_id: string;
  payment_details: ShopifyPaymentDetails;
}

export interface ShopifyOrderAdjustment {
  id: number;
  order_id: number;
  refund_id: number;
  amount: string;
  tax_amount: string;
  kind: string;
  reason: string;
  amount_set: ShopifyPriceSet;
  tax_amount_set: ShopifyPriceSet;
}

export interface ShopifyPaymentDetails {
  credit_card_bin: string | null;
  avs_result_code: string | null;
  cvv_result_code: string | null;
  credit_card_number: string;
  credit_card_company: string;
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
  last_order_id: number;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  phone: string | null;
  tags: string;
  last_order_name: string;
  currency: string;
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string | null;
  tax_exemptions: any[];
  email_marketing_consent: ShopifyMarketingConsent;
  sms_marketing_consent: ShopifyMarketingConsent | null;
  admin_graphql_api_id: string;
  default_address: ShopifyAddress;
}

export interface ShopifyMarketingConsent {
  state: string;
  opt_in_level: string | null;
  consent_updated_at: string | null;
}

export interface ShopifyOriginLocation {
  id: number;
  country_code: string;
  province_code: string;
  name: string;
  address1: string;
  address2: string | null;
  city: string;
  zip: string;
}

// Shopify Inventory Types
export interface ShopifyInventoryItem {
  id: number;
  sku: string;
  created_at: string;
  updated_at: string;
  requires_shipping: boolean;
  cost: string | null;
  country_code_of_origin: string | null;
  province_code_of_origin: string | null;
  harmonized_system_code: string | null;
  tracked: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyInventoryLevel {
  inventory_item_id: number;
  location_id: number;
  available: number;
  updated_at: string;
  admin_graphql_api_id: string;
}

export interface ShopifyLocation {
  id: number;
  name: string;
  address1: string;
  address2: string | null;
  city: string;
  zip: string;
  province: string;
  country: string;
  phone: string;
  created_at: string;
  updated_at: string;
  country_code: string;
  country_name: string;
  province_code: string;
  legacy: boolean;
  active: boolean;
  admin_graphql_api_id: string;
}

// Shopify Collection Types
export interface ShopifyCollection {
  id: number;
  handle: string;
  title: string;
  updated_at: string;
  body_html: string;
  published_at: string;
  sort_order: string;
  template_suffix: string | null;
  published_scope: string;
  admin_graphql_api_id: string;
}

export interface ShopifySmartCollection extends ShopifyCollection {
  rules: ShopifyCollectionRule[];
  disjunctive: boolean;
}

export interface ShopifyCustomCollection extends ShopifyCollection {
  image: ShopifyImage | null;
}

export interface ShopifyCollectionRule {
  column: string;
  relation: string;
  condition: string;
}

// Shopify Error Types
export interface ShopifyError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Shopify Webhook Types
export interface ShopifyWebhook {
  id: number;
  address: string;
  topic: string;
  created_at: string;
  updated_at: string;
  format: string;
  fields: string[];
  metafield_namespaces: string[];
  api_version: string;
  private_metafield_namespaces: string[];
}

// API response wrappers
export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

export interface ShopifyProductResponse {
  product: ShopifyProduct;
}

export interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
}

export interface ShopifyOrderResponse {
  order: ShopifyOrder;
}

export interface ShopifyInventoryItemsResponse {
  inventory_items: ShopifyInventoryItem[];
}

export interface ShopifyInventoryLevelsResponse {
  inventory_levels: ShopifyInventoryLevel[];
}

export interface ShopifyLocationsResponse {
  locations: ShopifyLocation[];
}

export interface ShopifyCollectionsResponse {
  smart_collections: ShopifySmartCollection[];
  custom_collections: ShopifyCustomCollection[];
}

export interface ShopifyFulfillmentsResponse {
  fulfillments: ShopifyFulfillment[];
}

export interface ShopifyFulfillmentResponse {
  fulfillment: ShopifyFulfillment;
}