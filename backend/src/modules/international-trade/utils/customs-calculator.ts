/**
 * Customs calculator in international-trade module
 * Calculates duties, taxes, and other customs fees for international shipments
 */

import { ApiError } from '../../../middleware/error.middleware';

/**
 * Shipment item interface for duty calculation
 */
export interface IShipmentDutyItem {
  /**
   * Description of the item
   */
  description: string;
  
  /**
   * Optional HS code for the item
   */
  hsCode?: string;
  
  /**
   * Quantity of items
   */
  quantity: number;
  
  /**
   * Value per unit in the specified currency
   */
  unitValue: number;
  
  /**
   * Optional weight of the item
   */
  weight?: number;
}

/**
 * Additional fee structure
 */
export interface ICustomsFee {
  /**
   * Name of the fee
   */
  name: string;
  
  /**
   * Amount of the fee in the specified currency
   */
  amount: number;
}

/**
 * Duty calculation result interface
 */
export interface IDutyCalculationResult {
  /**
   * Total duty amount
   */
  totalDuty: number;
  
  /**
   * Total tax amount (VAT/GST)
   */
  totalTax: number;
  
  /**
   * Total of all additional fees
   */
  totalFees: number;
  
  /**
   * Total of all charges (duty + tax + fees)
   */
  totalCharges: number;
  
  /**
   * Detailed breakdown of calculations
   */
  breakdown: {
    /**
     * Duty rate used (as a decimal)
     */
    dutyRate: number;
    
    /**
     * Calculated duty amount
     */
    dutyAmount: number;
    
    /**
     * Tax rate used (as a decimal)
     */
    taxRate: number;
    
    /**
     * Calculated tax amount
     */
    taxAmount: number;
    
    /**
     * List of additional fees
     */
    additionalFees: ICustomsFee[];
  };
  
  /**
   * Currency code for all monetary values
   */
  currency: string;
}

/**
 * Duty calculation parameters interface
 */
export interface IDutyCalculationParams {
  /**
   * Country code of origin
   */
  originCountry: string;
  
  /**
   * Country code of destination
   */
  destinationCountry: string;
  
  /**
   * Items in the shipment
   */
  items: IShipmentDutyItem[];
  
  /**
   * Total declared value of the shipment
   */
  totalValue: number;
  
  /**
   * Optional total weight of the shipment
   */
  totalWeight?: number;
  
  /**
   * Optional shipping cost (included in dutiable value)
   */
  shippingCost?: number;
  
  /**
   * Optional insurance cost (included in dutiable value)
   */
  insuranceCost?: number;
  
  /**
   * Currency code for all monetary values
   */
  currency: string;
}

/**
 * Estimate range result interface
 */
export interface IDutyEstimateRange {
  /**
   * Minimum possible charges
   */
  minimum: IDutyCalculationResult;
  
  /**
   * Average/expected charges
   */
  average: IDutyCalculationResult;
  
  /**
   * Maximum possible charges
   */
  maximum: IDutyCalculationResult;
}

/**
 * Service to calculate customs duties and taxes
 */
export class CustomsCalculator {
  // Simplified duty rates by country (in a real system, this would be a comprehensive database)
  private dutyRates: Record<string, number> = {
    'US': 0.039, // 3.9% average duty rate
    'CA': 0.047, // 4.7% average duty rate
    'GB': 0.029, // 2.9% average duty rate
    'AU': 0.052, // 5.2% average duty rate
    'NZ': 0.032, // 3.2% average duty rate
    'EU': 0.028, // 2.8% average duty rate for EU countries
    'CN': 0.098, // 9.8% average duty rate
    'JP': 0.041, // 4.1% average duty rate
    'SG': 0.012, // 1.2% average duty rate
    'DEFAULT': 0.06 // 6% default rate
  };

  // Simplified VAT/GST rates by country
  private taxRates: Record<string, number> = {
    'US': 0, // No federal VAT/GST, but states may have sales tax
    'CA': 0.05, // 5% GST
    'GB': 0.20, // 20% VAT
    'DE': 0.19, // 19% VAT
    'FR': 0.20, // 20% VAT
    'IT': 0.22, // 22% VAT
    'ES': 0.21, // 21% VAT
    'AU': 0.10, // 10% GST
    'NZ': 0.15, // 15% GST
    'JP': 0.10, // 10% consumption tax
    'SG': 0.08, // 8% GST
    'DEFAULT': 0.15 // 15% default rate
  };

  // EU country codes for VAT calculation
  private euCountries: string[] = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];

  /**
   * Calculate duty and taxes for a shipment
   * 
   * @param params Calculation parameters
   * @returns Calculation result
   */
  calculate(params: IDutyCalculationParams): IDutyCalculationResult {
    try {
      // Get duty and tax rates
      const dutyRate = this.getDutyRate(params.destinationCountry);
      const taxRate = this.getTaxRate(params.destinationCountry);
      
      // Calculate dutiable value (goods + shipping + insurance)
      const dutiableValue = params.totalValue + 
        (params.shippingCost || 0) + 
        (params.insuranceCost || 0);
      
      // Calculate duty amount
      const dutyAmount = dutiableValue * dutyRate;
      
      // Calculate tax amount (on goods value + duty in most countries)
      const taxableValue = dutiableValue + dutyAmount;
      const taxAmount = taxableValue * taxRate;
      
      // Calculate additional fees (customs processing, etc.)
      const additionalFees = this.calculateAdditionalFees(
        params.destinationCountry,
        dutiableValue,
        params.items
      );
      
      // Calculate total fees
      const totalFees = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
      
      // Calculate total charges
      const totalCharges = dutyAmount + taxAmount + totalFees;
      
      // Return calculation result
      return {
        totalDuty: dutyAmount,
        totalTax: taxAmount,
        totalFees: totalFees,
        totalCharges: totalCharges,
        breakdown: {
          dutyRate: dutyRate,
          dutyAmount: dutyAmount,
          taxRate: taxRate,
          taxAmount: taxAmount,
          additionalFees: additionalFees
        },
        currency: params.currency
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error calculating customs duties: ${errorMessage}`);
    }
  }

  /**
   * Calculate minimum, average and maximum possible customs charges
   * for a given shipment to provide an estimate range
   * 
   * @param params Calculation parameters
   * @returns Object with min, avg, max possible charges
   */
  calculateEstimateRange(params: IDutyCalculationParams): IDutyEstimateRange {
    try {
      // Get standard calculation
      const average = this.calculate(params);
      
      // Calculate minimum (duty rate -25%, no additional fees)
      const minDutyRate = this.getDutyRate(params.destinationCountry) * 0.75;
      const minTaxRate = this.getTaxRate(params.destinationCountry);
      
      const minDutiableValue = params.totalValue + 
        (params.shippingCost || 0) * 0.75 + 
        (params.insuranceCost || 0) * 0.75;
      
      const minDutyAmount = minDutiableValue * minDutyRate;
      const minTaxableValue = minDutiableValue + minDutyAmount;
      const minTaxAmount = minTaxableValue * minTaxRate;
      
      const minimum: IDutyCalculationResult = {
        totalDuty: minDutyAmount,
        totalTax: minTaxAmount,
        totalFees: 0, // No additional fees in minimum case
        totalCharges: minDutyAmount + minTaxAmount,
        breakdown: {
          dutyRate: minDutyRate,
          dutyAmount: minDutyAmount,
          taxRate: minTaxRate,
          taxAmount: minTaxAmount,
          additionalFees: []
        },
        currency: params.currency
      };
      
      // Calculate maximum (duty rate +25%, additional fees, high estimates)
      const maxDutyRate = this.getDutyRate(params.destinationCountry) * 1.25;
      const maxTaxRate = this.getTaxRate(params.destinationCountry) * 1.1; // Some countries have different tax bands
      
      const maxDutiableValue = params.totalValue * 1.1 + // Sometimes customs increases declared value
        (params.shippingCost || 0) * 1.2 + 
        (params.insuranceCost || 0) * 1.2;
      
      const maxDutyAmount = maxDutiableValue * maxDutyRate;
      const maxTaxableValue = maxDutiableValue + maxDutyAmount;
      const maxTaxAmount = maxTaxableValue * maxTaxRate;
      
      // Calculate enhanced additional fees
      const enhancedFees = this.calculateAdditionalFees(
        params.destinationCountry,
        maxDutiableValue,
        params.items,
        true // Use enhanced fees
      );
      
      const maxTotalFees = enhancedFees.reduce((sum, fee) => sum + fee.amount, 0);
      
      const maximum: IDutyCalculationResult = {
        totalDuty: maxDutyAmount,
        totalTax: maxTaxAmount,
        totalFees: maxTotalFees,
        totalCharges: maxDutyAmount + maxTaxAmount + maxTotalFees,
        breakdown: {
          dutyRate: maxDutyRate,
          dutyAmount: maxDutyAmount,
          taxRate: maxTaxRate,
          taxAmount: maxTaxAmount,
          additionalFees: enhancedFees
        },
        currency: params.currency
      };
      
      return { minimum, average, maximum };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error calculating customs estimate range: ${errorMessage}`);
    }
  }
  
  /**
   * Get duty rate for a destination country
   * 
   * @param countryCode Destination country code
   * @returns Duty rate as a decimal
   */
  private getDutyRate(countryCode: string): number {
    // For EU countries, use the EU rate
    if (this.euCountries.includes(countryCode)) {
      return this.dutyRates['EU'] || this.dutyRates['DEFAULT'];
    }
    
    return this.dutyRates[countryCode] || this.dutyRates['DEFAULT'];
  }
  
  /**
   * Get tax rate for a destination country
   * 
   * @param countryCode Destination country code
   * @returns Tax rate as a decimal
   */
  private getTaxRate(countryCode: string): number {
    return this.taxRates[countryCode] || this.taxRates['DEFAULT'];
  }
  
  /**
   * Calculate additional customs fees
   * 
   * @param countryCode Destination country code
   * @param dutiableValue Value used for duty calculation
   * @param items Shipment items
   * @param enhanced Whether to use enhanced (higher) fees for estimation
   * @returns Array of fee objects
   */
  private calculateAdditionalFees(
    countryCode: string,
    dutiableValue: number,
    items: IShipmentDutyItem[],
    enhanced = false
  ): ICustomsFee[] {
    const fees: ICustomsFee[] = [];
    
    // Most countries charge a customs processing fee
    let processingFee = 15; // Base fee
    if (dutiableValue > 1000) {
      processingFee = 25; // Higher fee for higher value
    }
    if (enhanced) {
      processingFee *= 1.5; // Enhanced fee for max estimate
    }
    
    fees.push({
      name: 'Customs Processing',
      amount: processingFee
    });
    
    // For specific destination countries
    if (['US', 'CA', 'AU'].includes(countryCode)) {
      // MPF - Merchandise Processing Fee (US, Canada, Australia)
      const mpfRate = 0.003472; // 0.3472%
      const mpfMin = 27.23;
      const mpfMax = 528.33;
      
      let mpfAmount = dutiableValue * mpfRate;
      mpfAmount = Math.max(mpfMin, Math.min(mpfAmount, mpfMax));
      
      if (enhanced) {
        mpfAmount *= 1.2; // Enhanced fee for max estimate
      }
      
      fees.push({
        name: 'Merchandise Processing',
        amount: mpfAmount
      });
    }
    
    // For US destinations
    if (countryCode === 'US') {
      // HMF - Harbor Maintenance Fee (US only)
      const hmfRate = 0.00125; // 0.125%
      let hmfAmount = dutiableValue * hmfRate;
      
      if (enhanced) {
        hmfAmount *= 1.2; // Enhanced fee for max estimate
      }
      
      fees.push({
        name: 'Harbor Maintenance',
        amount: hmfAmount
      });
    }
    
    return fees;
  }
}

export default CustomsCalculator;