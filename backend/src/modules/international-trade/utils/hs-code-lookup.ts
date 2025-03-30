/**
 * Harmonized System (HS) Code Utility
 * 
 * Provides functionality for validating and finding HS codes for products
 * HS codes are used in international trade to classify goods for customs purposes
 */

// Interfaces for HS code data structures
interface HsCodeResult {
  code: string;
  description: string;
  category: string;
}

interface DutyInfo {
  rate: number;
  type: string;
  notes?: string;
}

interface Restriction {
  country: string;
  type: string;
  description: string;
}

interface Document {
  type: string;
  description: string;
  required: boolean;
}

interface HsCodeDetails {
  code: string;
  description: string;
  category: string;
  duty: {
    [countryCode: string]: DutyInfo;
  };
  restrictions: Restriction[];
  documents: Document[];
}

// Simple cache for HS code lookups
const hsCodeCache: Map<string, string[]> = new Map();

/**
 * Validates a Harmonized System (HS) code format
 * @param hsCode The HS code to validate
 * @returns boolean indicating if the format is valid
 */
export function validateHsCodeFormat(hsCode: string): boolean {
  // Basic validation: HS codes are typically 6-10 digits
  // The first 6 digits are standardized internationally
  // Countries may add additional digits for subcategories
  const hsCodeRegex = /^\d{6,10}$/;
  return hsCodeRegex.test(hsCode);
}

/**
 * Looks up HS codes for a product description
 * @param description Product description to find HS codes for
 * @returns Promise<any> resolving to array of matching HS codes with descriptions
 */
export async function lookupHsCodes(description: string): Promise<HsCodeResult[]> {
  // Check cache first
  const cacheKey = description.toLowerCase().trim();
  
  if (hsCodeCache.has(cacheKey)) {
    const cachedCodes = hsCodeCache.get(cacheKey);
    if (cachedCodes) {
      return cachedCodes.map((code: any) => parseHsCodeResult(code));
    }
  }
  
  // This would normally call an external API service or database
  // For this implementation, we'll return mock data
  const mockResults = getMockHsCodeResults(description);
  
  // Cache the results
  hsCodeCache.set(
    cacheKey,
    mockResults.map((r: any) => `${r.code}|${r.description}|${r.category}`)
  );
  
  return mockResults;
}

/**
 * Parse a pipe-delimited HS code result string
 * @param resultString Pipe-delimited string with code, description, and category
 * @returns Parsed HS code object
 */
function parseHsCodeResult(resultString: string): HsCodeResult {
  const [code, description, category] = resultString.split('|');
  return {
    code,
    description,
    category
  };
}

/**
 * Gets mock HS code results for a product description
 * @param description Product description to find HS codes for
 * @returns Array of matching HS codes with descriptions
 */
function getMockHsCodeResults(description: string): HsCodeResult[] {
  const normalizedDescription = description.toLowerCase();
  
  // Match based on keywords in the description
  if (normalizedDescription.includes('laptop') || normalizedDescription.includes('computer')) {
    return [
      { code: '847130', description: 'Portable automatic data processing machines', category: 'Electronics' },
      { code: '847141', description: 'Data processing machines with CPU and input/output units', category: 'Electronics' }
    ];
  } else if (normalizedDescription.includes('phone') || normalizedDescription.includes('mobile')) {
    return [
      { code: '851712', description: 'Telephones for cellular networks or other wireless networks', category: 'Electronics' }
    ];
  } else if (normalizedDescription.includes('shirt') || normalizedDescription.includes('tshirt')) {
    return [
      { code: '610910', description: "T-shirts, singlets and other vests, knitted or crocheted, of cotton", category: 'Apparel' },
      { code: '610990', description: "T-shirts, singlets and other vests, knitted or crocheted, of other textile materials", category: 'Apparel' }
    ];
  } else if (normalizedDescription.includes('shoe') || normalizedDescription.includes('footwear')) {
    return [
      { code: '640299', description: "Other footwear with outer soles and uppers of rubber or plastics", category: 'Footwear' },
      { code: '640399', description: "Other footwear with outer soles of rubber and uppers of leather", category: 'Footwear' }
    ];
  } else {
    // Default to a generic product category
    return [
      { code: '999999', description: "Other articles not specified", category: 'Miscellaneous' }
    ];
  }
}

/**
 * Get additional information about an HS code
 * @param hsCode The HS code to get information for
 * @returns Promise<any> resolving to detailed information about the HS code
 */
export async function getHsCodeDetails(hsCode: string): Promise<HsCodeDetails> {
  // Validate the HS code format
  if (!validateHsCodeFormat(hsCode)) {
    throw new Error('Invalid HS code format');
  }
  
  // This would normally call an external API service or database
  // For this implementation, we'll return mock data based on the HS code
  return getMockHsCodeDetails(hsCode);
}

/**
 * Gets mock HS code details
 * @param hsCode The HS code to get details for
 * @returns Detailed information about the HS code
 */
function getMockHsCodeDetails(hsCode: string): HsCodeDetails {
  // Electronics - Laptops/Computers
  if (hsCode.startsWith('8471')) {
    return {
      code: hsCode,
      description: 'Automatic data processing machines and units thereof',
      category: 'Electronics',
      duty: {
        'US': { rate: 0, type: 'Free' },
        'EU': { rate: 0, type: 'Free' },
        'CN': { rate: 5, type: 'Ad Valorem', notes: 'Preferential duties may apply' },
        'JP': { rate: 0, type: 'Free' },
        'UK': { rate: 0, type: 'Free' }
      },
      restrictions: [
        {
          country: 'RU',
          type: 'SANCTIONS',
          description: 'Subject to export controls due to sanctions'
        }
      ],
      documents: [
        {
          type: 'COMMERCIAL_INVOICE',
          description: 'Commercial Invoice',
          required: true
        },
        {
          type: 'PACKING_LIST',
          description: 'Packing List',
          required: true
        },
        {
          type: 'CERTIFICATE_OF_ORIGIN',
          description: 'Certificate of Origin',
          required: false
        }
      ]
    };
  }
  // Electronics - Mobile Phones
  else if (hsCode.startsWith('8517')) {
    return {
      code: hsCode,
      description: 'Telephone sets, including smartphones and other telephones for cellular networks',
      category: 'Electronics',
      duty: {
        'US': { rate: 0, type: 'Free' },
        'EU': { rate: 0, type: 'Free' },
        'CN': { rate: 2, type: 'Ad Valorem', notes: 'Preferential duties may apply' },
        'JP': { rate: 0, type: 'Free' },
        'UK': { rate: 0, type: 'Free' }
      },
      restrictions: [
        {
          country: 'RU',
          type: 'SANCTIONS',
          description: 'Subject to export controls due to sanctions'
        }
      ],
      documents: [
        {
          type: 'COMMERCIAL_INVOICE',
          description: 'Commercial Invoice',
          required: true
        },
        {
          type: 'PACKING_LIST',
          description: 'Packing List',
          required: true
        },
        {
          type: 'CERTIFICATE_OF_ORIGIN',
          description: 'Certificate of Origin',
          required: false
        }
      ]
    };
  }
  // Apparel - T-shirts/Clothing
  else if (hsCode.startsWith('6109')) {
    return {
      code: hsCode,
      description: 'T-shirts, singlets and other vests, knitted or crocheted',
      category: 'Apparel',
      duty: {
        'US': { rate: 16.5, type: 'Ad Valorem', notes: 'Varies by fabric composition' },
        'EU': { rate: 12, type: 'Ad Valorem' },
        'CN': { rate: 10, type: 'Ad Valorem' },
        'JP': { rate: 9, type: 'Ad Valorem' },
        'UK': { rate: 12, type: 'Ad Valorem' }
      },
      restrictions: [],
      documents: [
        {
          type: 'COMMERCIAL_INVOICE',
          description: 'Commercial Invoice',
          required: true
        },
        {
          type: 'PACKING_LIST',
          description: 'Packing List',
          required: true
        },
        {
          type: 'CERTIFICATE_OF_ORIGIN',
          description: 'Certificate of Origin',
          required: true
        },
        {
          type: 'TEXTILE_DECLARATION',
          description: 'Textile Declaration',
          required: true
        }
      ]
    };
  }
  // Footwear - Shoes
  else if (hsCode.startsWith('6402') || hsCode.startsWith('6403')) {
    return {
      code: hsCode,
      description: 'Footwear with outer soles and uppers',
      category: 'Footwear',
      duty: {
        'US': { rate: 20, type: 'Ad Valorem', notes: 'Varies by material and value' },
        'EU': { rate: 8, type: 'Ad Valorem' },
        'CN': { rate: 15, type: 'Ad Valorem' },
        'JP': { rate: 10, type: 'Ad Valorem' },
        'UK': { rate: 8, type: 'Ad Valorem' }
      },
      restrictions: [],
      documents: [
        {
          type: 'COMMERCIAL_INVOICE',
          description: 'Commercial Invoice',
          required: true
        },
        {
          type: 'PACKING_LIST',
          description: 'Packing List',
          required: true
        },
        {
          type: 'CERTIFICATE_OF_ORIGIN',
          description: 'Certificate of Origin',
          required: true
        }
      ]
    };
  }
  // Default for unrecognized HS codes
  else {
    return {
      code: hsCode,
      description: 'Other articles not specified',
      category: 'Miscellaneous',
      duty: {
        'US': { rate: 5, type: 'Ad Valorem', notes: 'General rate for miscellaneous goods' },
        'EU': { rate: 5, type: 'Ad Valorem' },
        'CN': { rate: 10, type: 'Ad Valorem' },
        'JP': { rate: 5, type: 'Ad Valorem' },
        'UK': { rate: 5, type: 'Ad Valorem' }
      },
      restrictions: [],
      documents: [
        {
          type: 'COMMERCIAL_INVOICE',
          description: 'Commercial Invoice',
          required: true
        },
        {
          type: 'PACKING_LIST',
          description: 'Packing List',
          required: true
        }
      ]
    };
  }
}