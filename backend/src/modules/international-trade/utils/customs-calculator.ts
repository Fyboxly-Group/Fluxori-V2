import { getHsCodeDetails } from './hs-code-lookup';

/**
 * Customs Duty Calculator
 * 
 * Provides functionality for calculating customs duties, taxes, and fees
 * for international shipments based on HS codes, countries, and values
 */

/**
 * Calculate customs duties for a shipment
 * @param items Array of items with HS codes, values, and quantities
 * @param originCountry Origin country code
 * @param destinationCountry Destination country code
 * @returns Promise<any> resolving to duties calculation result
 */
export async function calculateDuties(
  items: Array<{
    hsCode: string;
    description: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
    currency: string;
  }>,
  originCountry: string,
  destinationCountry: string
): Promise<{
  totalDuty: number;
  totalTax: number;
  totalFees: number;
  grandTotal: number;
  currency: string;
  itemizedResults: Array<{
    hsCode: string;
    description: string;
    dutyRate: number;
    dutyAmount: number;
    taxRate: number;
    taxAmount: number;
    feesAmount: number;
  }>;
}> {
  // Arrays to collect the results
  const itemizedResults: Array<{
    hsCode: string;
    description: string;
    dutyRate: number;
    dutyAmount: number;
    taxRate: number;
    taxAmount: number;
    feesAmount: number;
  }> = [];
  
  // Process each item
  for (const item of items) {
    // Get HS code details for duty rates
    const hsDetails = await getHsCodeDetails(item.hsCode);
    
    // Get the duty rate for the destination country
    const dutyInfo = hsDetails.duty[destinationCountry] || { rate: 0, type: 'Free' };
    const dutyRate = dutyInfo.rate / 100; // Convert percentage to decimal
    
    // Calculate duty amount
    const dutyAmount = item.totalValue * dutyRate;
    
    // Get import tax rate for the destination country
    const taxRate = getImportTaxRate(destinationCountry);
    
    // Calculate import tax (VAT/GST/Sales tax)
    // In most countries, tax is applied to the value + duty
    const taxAmount = (item.totalValue + dutyAmount) * taxRate;
    
    // Calculate additional customs fees
    const feesAmount = calculateCustomsFees(
      destinationCountry,
      item.totalValue,
      item.hsCode
    );
    
    // Add to the itemized results
    itemizedResults.push({
      hsCode: item.hsCode,
      description: item.description,
      dutyRate: dutyRate * 100, // Convert back to percentage for display
      dutyAmount,
      taxRate: taxRate * 100, // Convert back to percentage for display
      taxAmount,
      feesAmount
    });
  }
  
  // Calculate totals
  const totalDuty = itemizedResults.reduce((sum, item) => sum + item.dutyAmount, 0);
  const totalTax = itemizedResults.reduce((sum, item) => sum + item.taxAmount, 0);
  const totalFees = itemizedResults.reduce((sum, item) => sum + item.feesAmount, 0);
  const grandTotal = totalDuty + totalTax + totalFees;
  
  // Use the currency from the first item (assuming all items use the same currency)
  const currency = items[0]?.currency || 'USD';
  
  return {
    totalDuty,
    totalTax,
    totalFees,
    grandTotal,
    currency,
    itemizedResults
  };
}

/**
 * Get the import tax rate for a country
 * @param countryCode Country code
 * @returns Tax rate (as a decimal)
 */
function getImportTaxRate(countryCode: string): number {
  // Mock implementation - in a real system this would come from a database
  // or external API of current tax rates
  const taxRates: Record<string, number> = {
    'US': 0, // The US doesn't have a federal VAT/GST
    'CA': 0.05, // Canada GST is 5%
    'GB': 0.20, // UK VAT is 20%
    'DE': 0.19, // Germany VAT is 19%
    'FR': 0.20, // France VAT is 20%
    'IT': 0.22, // Italy VAT is 22%
    'ES': 0.21, // Spain VAT is 21%
    'NL': 0.21, // Netherlands VAT is 21%
    'AU': 0.10, // Australia GST is 10%
    'NZ': 0.15, // New Zealand GST is 15%
    'JP': 0.10, // Japan consumption tax is 10%
    'CN': 0.13, // China VAT is 13%
    'IN': 0.18, // India GST is 18% for most goods
    'BR': 0.17, // Brazil ICMS (equivalent) averages around 17%
    'ZA': 0.15  // South Africa VAT is 15%
  };
  
  return taxRates[countryCode] || 0;
}

/**
 * Calculate additional customs fees based on country, value, and HS code
 * @param countryCode Destination country code
 * @param value Total value of the item
 * @param hsCode HS code of the item
 * @returns Total fees amount
 */
function calculateCustomsFees(
  countryCode: string,
  value: number,
  hsCode: string
): number {
  // Mock implementation - in a real system this would be more comprehensive
  let fees = 0;
  
  switch (countryCode) {
    case 'US':
      // Merchandise Processing Fee (MPF) for the US
      if (value > 2500) {
        fees = Math.min(Math.max(value * 0.003464, 27.75), 538.40);
      } else if (value > 800) {
        fees = 2.22; // Simplified MPF for shipments between $800 and $2500
      }
      break;
      
    case 'CA':
      // Canada customs handling fee
      fees = 9.95;
      break;
      
    case 'GB':
      // UK customs handling fee
      fees = 8.00;
      break;
      
    case 'AU':
      // Australia import processing charge
      if (value > 1000) {
        fees = value <= 10000 ? 90 : 190;
      }
      break;
      
    default:
      // Default handling fee for other countries
      fees = 10.00;
  }
  
  return fees;
}

/**
 * Check if a shipment qualifies for de minimis exemption
 * (exemption from duties and taxes based on low value)
 * @param totalValue Total shipment value
 * @param countryCode Destination country code
 * @returns Boolean indicating if shipment is exempt
 */
export function checkDeMinimisExemption(
  totalValue: number,
  countryCode: string
): boolean {
  // Mock implementation - in a real system this would come from an up-to-date source
  const deMinimisThresholds: Record<string, number> = {
    'US': 800, // US de minimis threshold is $800
    'CA': 150, // Canada de minimis is CAD 150 for duties (CAD 40 for taxes)
    'GB': 135, // UK de minimis is GBP 135 (for VAT)
    'DE': 150, // EU standard is EUR 150 for duties (EUR 22 for VAT)
    'FR': 150,
    'IT': 150,
    'ES': 150,
    'NL': 150,
    'AU': 1000, // Australia de minimis is AUD 1000
    'NZ': 1000, // New Zealand de minimis is NZD 1000
    'JP': 10000, // Japan de minimis is JPY 10,000
    'CN': 50, // China de minimis is CNY 50
    'IN': 100, // India de minimis is INR 100
    'BR': 50, // Brazil de minimis is USD 50
    'ZA': 500  // South Africa de minimis is ZAR 500
  };
  
  const threshold = deMinimisThresholds[countryCode] || 0;
  return totalValue <= threshold;
}

/**
 * Get prohibited and restricted items for a country
 * @param countryCode Destination country code
 * @returns Array of prohibited and restricted item categories
 */
export function getProhibitedItems(countryCode: string): Array<{
  category: string;
  description: string;
  isProhibited: boolean;
  requiresPermit: boolean;
  permitInfo?: string;
}> {
  // Mock implementation - in a real system this would be a comprehensive database
  const prohibitedItems: Record<string, Array<{
    category: string;
    description: string;
    isProhibited: boolean;
    requiresPermit: boolean;
    permitInfo?: string;
  }>> = {
    'US': [
      {
        category: 'Narcotics',
        description: 'Illegal drugs and narcotics',
        isProhibited: true,
        requiresPermit: false
      },
      {
        category: 'Firearms',
        description: 'Guns, ammunition, and parts',
        isProhibited: false,
        requiresPermit: true,
        permitInfo: 'ATF permit required'
      },
      {
        category: 'Agricultural Products',
        description: 'Plants, seeds, and produce',
        isProhibited: false,
        requiresPermit: true,
        permitInfo: 'USDA permit may be required'
      }
    ],
    'GB': [
      {
        category: 'Narcotics',
        description: 'Illegal drugs and narcotics',
        isProhibited: true,
        requiresPermit: false
      },
      {
        category: 'Firearms',
        description: 'Guns, ammunition, and parts',
        isProhibited: true,
        requiresPermit: false
      },
      {
        category: 'Meat Products',
        description: 'Meat and meat products',
        isProhibited: false,
        requiresPermit: true,
        permitInfo: 'Import license required'
      }
    ],
    // Add more countries as needed
  };
  
  return prohibitedItems[countryCode] || [];
}