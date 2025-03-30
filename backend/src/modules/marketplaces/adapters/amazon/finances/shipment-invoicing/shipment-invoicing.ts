/**
 * Amazon Shipment Invoicing API Module
 * 
 * Implements the Amazon SP-API Shipment Invoicing API functionality.
 * This module enables management of shipment invoices, customs documentation,
 * and related financial operations for international shipments.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../../utils/amazon-error';
import { AmazonSPApi } from '../../schemas/amazon.generated';

/**
 * Shipment invoice status
 */
export type ShipmentInvoiceStatus = AmazonSPApi.ShipmentInvoicing.ShipmentInvoiceStatus;

/**
 * Money value
 */
export type Money = AmazonSPApi.ShipmentInvoicing.Money;

/**
 * Party identification
 */
export type PartyIdentification = AmazonSPApi.ShipmentInvoicing.PartyIdentification;

/**
 * Address
 */
export type Address = AmazonSPApi.ShipmentInvoicing.Address;

/**
 * Dimensions with unit
 */
export type Dimensions = AmazonSPApi.ShipmentInvoicing.Dimensions;

/**
 * Weight with unit
 */
export type Weight = AmazonSPApi.ShipmentInvoicing.Weight;

/**
 * Item quantity
 */
export type ItemQuantity = AmazonSPApi.ShipmentInvoicing.ItemQuantity;

/**
 * Tax detail
 */
export type TaxDetail = AmazonSPApi.ShipmentInvoicing.TaxDetail;

/**
 * Invoice item
 */
export type InvoiceItem = AmazonSPApi.ShipmentInvoicing.InvoiceItem;

/**
 * Invoice information
 */
export type ShipmentInvoice = AmazonSPApi.ShipmentInvoicing.ShipmentInvoice;

/**
 * Get Shipment Details response
 */
export type GetShipmentDetailsResponse = AmazonSPApi.ShipmentInvoicing.GetShipmentDetailsResponse;

/**
 * Submit Invoice Request
 */
export type SubmitInvoiceRequest = AmazonSPApi.ShipmentInvoicing.SubmitInvoiceRequest;

/**
 * Get Shipment Invoice Status Request
 */
export type GetShipmentInvoiceStatusRequest = AmazonSPApi.ShipmentInvoicing.GetShipmentInvoiceStatusRequest;

/**
 * Party information for invoice
 */
export type Party = AmazonSPApi.ShipmentInvoicing.Party;

/**
 * Implementation of the Amazon Shipment Invoicing API
 */
export class ShipmentInvoicingModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string,
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string
  ) {
    super('shipmentInvoicing', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise<any> that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise<any>.resolve();
  }
  
  /**
   * Get shipment details with invoice requirements
   * @param shipmentId Amazon shipment ID
   * @param marketplaceId Optional marketplace ID
   * @returns Shipment details
   */
  public async getShipmentDetails(
    shipmentId: string,
    marketplaceId?: string
  ): Promise<ApiResponse<GetShipmentDetailsResponse>> {
    if (!shipmentId) {
      throw AmazonErrorUtil.createError('Shipment ID is required to get shipment details', AmazonErrorCode.INVALID_INPUT);
    }
    
    const params: Record<string, any> = {
      marketplaceId: marketplaceId || this.marketplaceId
    };
    
    try {
      return await this.makeRequest<GetShipmentDetailsResponse>({
        method: 'GET',
        path: `/shipments/${shipmentId}`,
        params
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getShipmentDetails`);
    }
  }

  /**
   * Submit invoice for a shipment
   * @param request Submit invoice request
   * @returns Submitted invoice status
   */
  public async submitInvoice(request: SubmitInvoiceRequest): Promise<ApiResponse<void>> {
    if (!request.invoiceContent) {
      throw AmazonErrorUtil.createError('Invoice content is required to submit invoice', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!request.marketplaceId && !this.marketplaceId) {
      throw AmazonErrorUtil.createError('Marketplace ID is required to submit invoice', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<void>({
        method: 'POST',
        path: '/shipments/invoices',
        data: {
          invoiceContent: request.invoiceContent
        },
        headers: {
          'Content-Type': request.contentType || 'application/json'
        },
        params: {
          marketplaceId: request.marketplaceId || this.marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.submitInvoice`);
    }
  }

  /**
   * Get the invoice status for a shipment
   * @param request Shipment invoice status request
   * @returns Shipment invoice status
   */
  public async getInvoiceStatus(
    request: GetShipmentInvoiceStatusRequest
  ): Promise<ApiResponse<ShipmentInvoice>> {
    if (!request.shipmentId) {
      throw AmazonErrorUtil.createError('Shipment ID is required to get invoice status', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!request.marketplaceId && !this.marketplaceId) {
      throw AmazonErrorUtil.createError('Marketplace ID is required to get invoice status', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<ShipmentInvoice>({
        method: 'GET',
        path: `/shipments/${request.shipmentId}/invoices`,
        params: {
          marketplaceId: request.marketplaceId || this.marketplaceId
        }
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getInvoiceStatus`);
    }
  }

  /**
   * Create and submit a commercial invoice for a shipment
   * @param shipmentId Amazon shipment ID
   * @param shipFromParty Ship from party information
   * @param shipToParty Ship to party information
   * @param items Invoice items
   * @param marketplaceId Optional marketplace ID
   * @returns Success/failure status
   */
  public async createAndSubmitCommercialInvoice(
    shipmentId: string,
    shipFromParty: {
      address: Address;
      partyIdentification?: PartyIdentification[];
    },
    shipToParty: {
      address: Address;
      partyIdentification?: PartyIdentification[];
    },
    items: InvoiceItem[],
    marketplaceId?: string
  ): Promise<ApiResponse<void>> {
    // Get current date for invoice
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Create invoice object
    const invoice: ShipmentInvoice = {
      marketplaceId: marketplaceId || this.marketplaceId,
      shipmentId,
      invoiceStatus: 'WORKING',
      invoiceClassification: 'COMMERCIAL_INVOICE',
      shipDate: currentDate,
      invoiceNumber: `INV-${shipmentId}-${Date.now()}`,
      shipFromParty: {
        address: shipFromParty.address,
        partyIdentification: shipFromParty.partyIdentification
      },
      shipToParty: {
        address: shipToParty.address,
        partyIdentification: shipToParty.partyIdentification
      },
      items
    };
    
    // Convert to JSON string
    const invoiceContent = JSON.stringify(invoice);
    
    // Submit the invoice
    return this.submitInvoice({
      invoiceContent,
      marketplaceId: marketplaceId || this.marketplaceId,
      contentType: 'application/json'
    });
  }
  
  /**
   * Check if a shipment requires an invoice
   * @param shipmentId Amazon shipment ID
   * @param marketplaceId Optional marketplace ID
   * @returns Whether invoice is required and additional requirements
   */
  public async checkInvoiceRequirements(
    shipmentId: string,
    marketplaceId?: string
  ): Promise<AmazonSPApi.ShipmentInvoicing.InvoiceRequirements> {
    const response = await this.getShipmentDetails(shipmentId, marketplaceId);
    
    if (!response.data.shipmentDetails.invoiceRequirements) {
      return { requiresInvoice: false };
    }
    
    return response.data.shipmentDetails.invoiceRequirements;
  }
  
  /**
   * Create a commercial invoice for items with international shipping
   * @param amazonOrderId Amazon order ID
   * @param shipmentId Amazon shipment ID
   * @param sellerDetails Seller details
   * @param buyerDetails Buyer details
   * @param orderItems Order items
   * @param marketplaceId Optional marketplace ID
   * @returns Whether the invoice was submitted successfully
   */
  public async processInternationalShipmentInvoice(
    amazonOrderId: string,
    shipmentId: string,
    sellerDetails: {
      name: string;
      addressLine1: string;
      city: string;
      stateOrRegion: string;
      postalCode: string;
      countryCode: string;
      taxId?: string;
    },
    buyerDetails: {
      name: string;
      addressLine1: string;
      city: string;
      stateOrRegion: string;
      postalCode: string;
      countryCode: string;
    },
    orderItems: Array<{
      orderItemId: string;
      title: string;
      quantity: number;
      unitPrice: number;
      currencyCode: string;
      hsCode?: string;
      countryOfOrigin?: string;
    }>,
    marketplaceId?: string
  ): Promise<boolean> {
    try {
      // Check if invoice is required
      const requirements = await this.checkInvoiceRequirements(shipmentId, marketplaceId);
      
      if (!requirements.requiresInvoice) {
        // Invoice not required for this shipment
        return true;
      }
      
      // Prepare invoice items
      const invoiceItems: InvoiceItem[] = orderItems.map((item: any) => ({
        orderItemId: item.orderItemId,
        title: item.title,
        quantity: {
          amount: item.quantity,
          unit: 'Each'
        },
        unitPrice: {
          currencyCode: item.currencyCode,
          amount: item.unitPrice
        },
        itemPrice: {
          currencyCode: item.currencyCode,
          amount: item.quantity * item.unitPrice
        },
        hsCode: item.hsCode,
        countryOfOrigin: item.countryOfOrigin
      }));
      
      // Prepare party information
      const shipFromParty = {
        address: {
          name: sellerDetails.name,
          addressLine1: sellerDetails.addressLine1,
          city: sellerDetails.city,
          stateOrRegion: sellerDetails.stateOrRegion,
          postalCode: sellerDetails.postalCode,
          countryCode: sellerDetails.countryCode
        },
        partyIdentification: sellerDetails.taxId ? [{
          partyId: sellerDetails.taxId,
          idType: 'SHIPPER_TAX_REGISTRATION_NUMBER'
        }] : undefined
      };
      
      const shipToParty = {
        address: {
          name: buyerDetails.name,
          addressLine1: buyerDetails.addressLine1,
          city: buyerDetails.city,
          stateOrRegion: buyerDetails.stateOrRegion,
          postalCode: buyerDetails.postalCode,
          countryCode: buyerDetails.countryCode
        }
      };
      
      // Submit the invoice
      await this.createAndSubmitCommercialInvoice(shipmentId, shipFromParty, shipToParty, invoiceItems, marketplaceId);
      
      return true;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Failed to process international shipment invoice:', error);
      return false;
    }
  }
}