/**
 * DHL Express API Configuration
 */
export const DHL_CONFIG = {
  apiBaseUrl: 'https://api-mock.dhl.com/mydhl/apiv1', // Use the actual API URL in production
  serviceTypes: {
    EXPRESS: {
      code: 'D',
      name: 'DHL Express'
    },
    EXPRESS_WORLDWIDE: {
      code: 'P',
      name: 'DHL Express Worldwide'
    },
    EXPRESS_9: {
      code: 'T',
      name: 'DHL Express 9:00'
    },
    EXPRESS_1030: {
      code: 'U',
      name: 'DHL Express 10:30'
    },
    EXPRESS_12: {
      code: 'Y',
      name: 'DHL Express 12:00'
    },
    EXPRESS_ECONOMY: {
      code: 'E',
      name: 'DHL Express Economy'
    }
  },
  packageTypes: {
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
  apiBaseUrl: 'https://api-gateway.fedex.com/api', // Use the actual API URL in production
  serviceTypes: {
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
  packageTypes: {
    BOX: 'YOUR_PACKAGING',
    DOCUMENT: 'FEDEX_ENVELOPE',
    PALLET: 'FEDEX_PAK',
    ENVELOPE: 'FEDEX_BOX',
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
  requireCustomsForInternational: true,
  weightUnits: ['kg', 'lb'],
  dimensionUnits: ['cm', 'in'],
  packageTypes: ['box', 'pallet', 'envelope', 'tube', 'other'],
  serviceTypes: ['express', 'standard', 'economy', 'priority'],
  incoterms: [
    {
      code: 'EXW',
      name: 'Ex Works',
      description: 'The seller makes the goods available at their premises.'
    },
    {
      code: 'FCA',
      name: 'Free Carrier',
      description: 'The seller delivers goods to the carrier specified by the buyer.'
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
      description: 'The seller delivers to a designated location, excluding import duties.'
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