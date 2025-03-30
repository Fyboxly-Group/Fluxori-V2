import { Router } from 'express';
import internationalTradeRoutes from './routes/international-trade.routes';
import { InternationalTradeService } from './services/international-trade.service';
import { CustomsDocumentService } from './services/customs-document.service';
import { ShippingRateService } from './services/shipping-rate.service';
import { ComplianceService } from './services/compliance.service';
import { InternationalTradeController } from './controllers/international-trade.controller';
import { DHLAdapter } from './adapters/dhl/dhl.adapter';
import { FedExAdapter } from './adapters/fedex/fedex.adapter';
import { 
  InternationalShipment, 
  CustomsDeclaration, 
  TradeCompliance, 
  ShippingRate 
} from './models/international-trade.model';

/**
 * International Trade Module
 * 
 * Provides functionality for international shipping, customs documentation,
 * compliance checking, and shipping rate management across multiple carriers
 */
export class InternationalTradeModule {
  public router: Router;
  public tradeService: InternationalTradeService;
  public customsDocumentService: CustomsDocumentService;
  public shippingRateService: ShippingRateService;
  public complianceService: ComplianceService;

  constructor() {
    this.router = Router();
    
    // Initialize services
    this.customsDocumentService = new CustomsDocumentService();
    this.shippingRateService = new ShippingRateService();
    this.complianceService = new ComplianceService();
    this.tradeService = new InternationalTradeService(
      this.customsDocumentService,
      this.shippingRateService,
      this.complianceService
    );

    // Set up routes
    this.router.use('/international-trade', internationalTradeRoutes);
  }

  /**
   * Initialize the module
   */
  public async initialize(): Promise<void> {
    // Add any initialization logic here
    console.log('International Trade module initialized');
  }
}

// Export the module
export default new InternationalTradeModule();

// Export models
export { 
  InternationalShipment, 
  CustomsDeclaration, 
  TradeCompliance, 
  ShippingRate 
};

// Export services
export {
  InternationalTradeService,
  CustomsDocumentService,
  ShippingRateService,
  ComplianceService
};

// Export interfaces
export * from './interfaces/shipping-provider.interface';

// Export adapters
export { DHLAdapter, FedExAdapter };