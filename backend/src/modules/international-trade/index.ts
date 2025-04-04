/**
 * International Trade Module
 * Provides shipping, customs, and compliance services for international shipments
 */

// Export services
export { ComplianceService } from './services/compliance.service';
export { ShippingRateService } from './services/shipping-rate.service';
export { CustomsDocumentService } from './services/customs-document.service';
export { InternationalTradeService } from './services/international-trade.service';

// Export controllers
export { InternationalTradeController } from './controllers/international-trade.controller';

// Export adapters
export { DHLAdapter } from './adapters/dhl/dhl.adapter';
export { FedExAdapter } from './adapters/fedex/fedex.adapter';
export { BaseShippingAdapter } from './adapters/common/base-shipping-adapter';

// Export utility services
export { CustomsCalculator } from './utils/customs-calculator';
export { HsCodeLookup } from './utils/hs-code-lookup';

// Export routes
import routes from './routes/international-trade.routes';
export { routes as internationalTradeRoutes };

// Export configurations
export * from './config/trade-providers.config';

// Export model interfaces
export {
  IInternationalTrade,
  IInternationalTradeDocument,
  IInternationalTradeModel,
  IInternationalShipment,
  ICustomsDeclaration,
  IAddress,
  IDimensions,
  IShipmentItem,
  ICustomsItem,
  InternationalShipment,
  CustomsDeclaration
} from './models/international-trade.model';

// Export shipping provider interfaces
export {
  IShippingProvider,
  IShippingProviderAuth,
  IRateRequest,
  IShippingRate,
  IShipmentRequest,
  ICreatedShipment,
  ITrackingRequest,
  ITrackingInfo,
  ITrackingEvent
} from './interfaces/shipping-provider.interface';

// Export document-related types
export {
  IDutyCalculationResult,
  IDutyCalculationParams
} from './utils/customs-calculator';

export {
  IHsCodeResult
} from './utils/hs-code-lookup';
