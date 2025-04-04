/**
 * Configuration for the international trade module providers
 */

/**
 * DHL Express API Configuration
 */
export const DHL_CONFIG = {
  apiBaseUrl: 'https://api.dhl.com/express/v1',
  authUrl: 'https://api.dhl.com/auth/v4/accesstoken',
  services: {
    EXPRESS: {
      code: 'D',
      name: 'DHL Express'
    },
    PARCEL: {
      code: 'P',
      name: 'DHL Parcel'
    },
    FREIGHT: {
      code: 'T',
      name: 'DHL Freight'
    },
    URGENT: {
      code: 'U',
      name: 'DHL Same Day'
    },
    ECONOMY: {
      code: 'Y',
      name: 'DHL Economy Select'
    },
    EXPRESS_WORLDWIDE: {
      code: 'E',
      name: 'DHL Express Worldwide'
    }
  },
  packagingTypes: {
    BOX: 'BD',
    DOCUMENT: 'DC',
    PALLET: 'PL',
    ENVELOPE: 'DF',
    TUBE: 'TU'
  }
};

/**
 * FedEx API Configuration
 */
export const FEDEX_CONFIG = {
  apiBaseUrl: 'https://apis.fedex.com/rate/v1',
  authUrl: 'https://apis.fedex.com/oauth/token',
  services: {
    INTERNATIONAL_PRIORITY: {
      code: 'INTERNATIONAL_PRIORITY',
      name: 'FedEx International Priority'
    },
    INTERNATIONAL_ECONOMY: {
      code: 'INTERNATIONAL_ECONOMY',
      name: 'FedEx International Economy'
    },
    INTERNATIONAL_FIRST: {
      code: 'INTERNATIONAL_FIRST',
      name: 'FedEx International First'
    },
    INTERNATIONAL_PRIORITY_EXPRESS: {
      code: 'INTERNATIONAL_PRIORITY_EXPRESS',
      name: 'FedEx International Priority Express'
    }
  },
  packagingTypes: {
    BOX: 'YOUR_PACKAGING',
    ENVELOPE: 'FEDEX_ENVELOPE',
    PAK: 'FEDEX_PAK',
    BOX_SMALL: 'FEDEX_BOX',
    TUBE: 'FEDEX_TUBE'
  }
};

/**
 * Common configuration for all shipping providers
 */
export const SHIPPING_PROVIDERS_CONFIG = {
  defaultProvider: 'dhl',
  availableProviders: ['dhl', 'fedex'],
  providerNames: {
    dhl: 'DHL Express',
    fedex: 'FedEx'
  },
  defaultCurrency: 'USD',
  requiresAuthentication: true,
  defaultWeightUnit: 'kg',
  defaultDimensionUnit: 'cm',
  defaultPackagingType: 'box',
  defaultServiceType: 'express',
  incoterms: [
    {
      code: 'EXW',
      name: 'Ex Works',
      description: 'The seller makes the goods available at their premises.'
    },
    {
      code: 'FCA',
      name: 'Free Carrier',
      description: 'The seller delivers the goods to a carrier appointed by the buyer.'
    },
    {
      code: 'CPT',
      name: 'Carriage Paid To',
      description: 'The seller pays for carriage to the named destination.'
    },
    {
      code: 'CIP',
      name: 'Carriage and Insurance Paid To',
      description: 'The seller pays for carriage and insurance to the named destination.'
    },
    {
      code: 'DAP',
      name: 'Delivered at Place',
      description: 'The seller delivers when the goods are placed at the disposal of the buyer at the named place.'
    },
    {
      code: 'DPU',
      name: 'Delivered at Place Unloaded',
      description: 'The seller delivers and unloads the goods at the named place.'
    },
    {
      code: 'DDP',
      name: 'Delivered Duty Paid',
      description: 'The seller is responsible for delivering goods to the named place, cleared for import and with all duties paid.'
    }
  ]
};