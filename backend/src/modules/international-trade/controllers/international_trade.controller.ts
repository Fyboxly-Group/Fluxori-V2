/**
 * This file is kept for backward compatibility
 * Please use the new international-trade.controller.ts file instead
 */

import internationalTradeController, {
  createShipment,
  getShipmentDetails,
  listShipments,
  createCustomsDeclaration,
  getComplianceInfo,
  getShippingRates,
  generateDocuments,
  trackShipment
} from './international-trade.controller';

export {
  createShipment,
  getShipmentDetails,
  listShipments,
  createCustomsDeclaration,
  getComplianceInfo,
  getShippingRates,
  generateDocuments,
  trackShipment
};

// Export controller methods for backward compatibility
export const international_tradeController = {
  createShipment,
  getShipmentDetails,
  listShipments,
  createCustomsDeclaration,
  getComplianceInfo,
  getShippingRates,
  generateDocuments,
  trackShipment
};

export default internationalTradeController;