/**
 * HS Code Lookup Utility
 * Helps find and validate Harmonized System (HS) codes for international shipments
 */

import { ApiError } from '../../../middleware/error.middleware';

/**
 * Section/chapter structure in HS classification
 */
export interface IHsClassification {
  /**
   * Numeric identifier for the classification level
   */
  id: string;
  
  /**
   * Human-readable title for this classification
   */
  title: string;
}

/**
 * Restriction information for specific HS codes
 */
export interface IHsRestriction {
  /**
   * Country code this restriction applies to
   */
  countryCode: string;
  
  /**
   * Type of restriction (quota, license, prohibition, etc)
   */
  type: string;
  
  /**
   * Description of the restriction
   */
  description: string;
}

/**
 * Interface for HS code lookup result
 */
export interface IHsCodeResult {
  /**
   * The HS code (e.g., 8471.30.00)
   */
  hsCode: string;
  
  /**
   * Description of the product category
   */
  description: string;
  
  /**
   * Section information
   */
  section?: IHsClassification;
  
  /**
   * Chapter information 
   */
  chapter?: IHsClassification;
  
  /**
   * Heading information
   */
  heading?: IHsClassification;
  
  /**
   * Subheading information
   */
  subheading?: IHsClassification;
  
  /**
   * Confidence score for search matches (0.0-1.0)
   */
  matchConfidence: number;
  
  /**
   * Duty rates by country
   */
  dutyRates?: Record<string, number>;
  
  /**
   * Restrictions applicable to this HS code
   */
  restrictions?: IHsRestriction[];
}

/**
 * Database entry for an HS code
 */
interface IHsCodeDatabaseEntry {
  /**
   * The HS code
   */
  code: string;
  
  /**
   * Description of the product category
   */
  description: string;
  
  /**
   * Section information
   */
  section: IHsClassification;
  
  /**
   * Chapter information
   */
  chapter: IHsClassification;
  
  /**
   * Heading information
   */
  heading: IHsClassification;
  
  /**
   * Subheading information
   */
  subheading?: IHsClassification;
  
  /**
   * Keywords for improved searching
   */
  keywords: string[];
  
  /**
   * Duty rates by country code
   */
  dutyRates?: Record<string, number>;
  
  /**
   * Restrictions applicable to this HS code
   */
  restrictions?: IHsRestriction[];
}

/**
 * Simple restriction result interface
 */
export interface ISimpleRestriction {
  /**
   * Type of restriction (quota, license, prohibition, etc)
   */
  type: string;
  
  /**
   * Description of the restriction
   */
  description: string;
}

/**
 * HS Code lookup service
 */
export class HsCodeLookup {
  // Simplified sample HS code database (in a real system, this would be a database or API call)
  private hsCodeDatabase: IHsCodeDatabaseEntry[] = [
    {
      code: '8471.30.00',
      description: 'Portable digital automatic data processing machines, weighing not more than 10kg',
      section: { id: '16', title: 'Machinery and Mechanical Appliances' },
      chapter: { id: '84', title: 'Nuclear Reactors, Boilers, Machinery' },
      heading: { id: '8471', title: 'Automatic Data Processing Machines' },
      subheading: { id: '8471.30', title: 'Portable Computers' },
      keywords: ['laptop', 'notebook', 'computer', 'portable computer', 'tablet'],
      dutyRates: {
        'US': 0,
        'EU': 0,
        'CN': 0.08
      }
    },
    {
      code: '8517.12.00',
      description: 'Telephones for cellular networks or for other wireless networks',
      section: { id: '16', title: 'Machinery and Mechanical Appliances' },
      chapter: { id: '85', title: 'Electrical Machinery and Equipment' },
      heading: { id: '8517', title: 'Telephone Sets' },
      subheading: { id: '8517.12', title: 'Mobile Phones' },
      keywords: ['smartphone', 'mobile phone', 'cell phone', 'cellular phone', 'wireless phone'],
      dutyRates: {
        'US': 0,
        'EU': 0,
        'CN': 0.08
      }
    },
    {
      code: '6110.20.00',
      description: 'Jerseys, pullovers, cardigans, waistcoats and similar articles, knitted or crocheted, of cotton',
      section: { id: '11', title: 'Textiles and Textile Articles' },
      chapter: { id: '61', title: 'Articles of Apparel, Knitted or Crocheted' },
      heading: { id: '6110', title: 'Sweaters, Pullovers, Sweatshirts' },
      keywords: ['sweater', 'pullover', 'jumper', 'cardigan', 'sweatshirt', 'cotton sweater'],
      dutyRates: {
        'US': 0.16,
        'EU': 0.12,
        'CN': 0.14
      },
      restrictions: [
        { countryCode: 'US', type: 'quota', description: 'Subject to textile quota' }
      ]
    },
    {
      code: '8481.80.00',
      description: 'Taps, cocks, valves and similar appliances for pipes, boiler shells, tanks, vats or the like',
      section: { id: '16', title: 'Machinery and Mechanical Appliances' },
      chapter: { id: '84', title: 'Nuclear Reactors, Boilers, Machinery' },
      heading: { id: '8481', title: 'Taps, Cocks, Valves & Similar Appliances' },
      keywords: ['valve', 'tap', 'faucet', 'pipe fitting', 'plumbing part'],
      dutyRates: {
        'US': 0.035,
        'EU': 0.027,
        'CN': 0.07
      }
    },
    {
      code: '4901.99.00',
      description: 'Printed books, brochures, leaflets and similar printed matter',
      section: { id: '10', title: 'Pulp of wood; Paper and Paperboard' },
      chapter: { id: '49', title: 'Printed Books, Newspapers, Pictures' },
      heading: { id: '4901', title: 'Printed Books, Brochures, Leaflets' },
      keywords: ['book', 'printed book', 'hardcover', 'paperback', 'novel', 'textbook'],
      dutyRates: {
        'US': 0,
        'EU': 0,
        'CN': 0
      }
    }
  ];

  /**
   * Search for HS codes based on product description
   * 
   * @param productDescription Description of the product
   * @param limit Maximum number of results to return
   * @returns Array of matching HS codes with metadata
   */
  search(productDescription: string, limit = 5): IHsCodeResult[] {
    try {
      if (!productDescription || typeof productDescription !== 'string') {
        throw new ApiError(400, 'Product description is required and must be a string');
      }
      
      const results: IHsCodeResult[] = [];
      const searchTerms = productDescription.toLowerCase().split(' ');
      
      // Search the database for matching keywords
      for (const hsEntry of this.hsCodeDatabase) {
        // Calculate match score based on keyword matches
        let matchScore = 0;
        for (const searchTerm of searchTerms) {
          // Skip common words
          if (['a', 'an', 'the', 'and', 'or', 'of', 'for', 'with', 'in', 'on'].includes(searchTerm)) {
            continue;
          }
          
          // Check if the term is in the description
          if (hsEntry.description.toLowerCase().includes(searchTerm)) {
            matchScore += 0.5;
          }
          
          // Check if the term matches a keyword exactly
          for (const keyword of hsEntry.keywords) {
            if (keyword === searchTerm) {
              matchScore += 1;
            } else if (keyword.includes(searchTerm)) {
              matchScore += 0.5;
            }
          }
        }
        
        // If there's a match, add to results
        if (matchScore > 0) {
          // Calculate confidence score (0.0 - 1.0)
          const confidence = Math.min(1, matchScore / Math.max(1, searchTerms.length));
          
          results.push({
            hsCode: hsEntry.code,
            description: hsEntry.description,
            section: hsEntry.section,
            chapter: hsEntry.chapter,
            heading: hsEntry.heading,
            subheading: hsEntry.subheading,
            matchConfidence: confidence,
            dutyRates: hsEntry.dutyRates,
            restrictions: hsEntry.restrictions
          });
        }
      }
      
      // Sort results by confidence score (descending)
      results.sort((a, b) => b.matchConfidence - a.matchConfidence);
      
      // Return the top results up to the limit
      return results.slice(0, limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error looking up HS codes: ${errorMessage}`);
    }
  }

  /**
   * Get detailed information for a specific HS code
   * 
   * @param hsCode The HS code to look up (e.g., "8471.30.00")
   * @returns Detailed HS code information or null if not found
   */
  getHsCodeDetails(hsCode: string): IHsCodeResult | null {
    try {
      if (!hsCode || typeof hsCode !== 'string') {
        throw new ApiError(400, 'HS code is required and must be a string');
      }
      
      // Find the entry in the database
      const hsEntry = this.hsCodeDatabase.find(entry => entry.code === hsCode);
      
      if (!hsEntry) {
        return null;
      }
      
      // Return the detailed information
      return {
        hsCode: hsEntry.code,
        description: hsEntry.description,
        section: hsEntry.section,
        chapter: hsEntry.chapter,
        heading: hsEntry.heading,
        subheading: hsEntry.subheading,
        matchConfidence: 1.0, // It's an exact match by code
        dutyRates: hsEntry.dutyRates,
        restrictions: hsEntry.restrictions
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error getting HS code details: ${errorMessage}`);
    }
  }

  /**
   * Validate if an HS code is valid and properly formatted
   * 
   * @param hsCode HS code to validate
   * @returns Boolean indicating if the code is valid
   */
  validateHsCode(hsCode: string): boolean {
    if (!hsCode || typeof hsCode !== 'string') {
      return false;
    }
    
    // Basic format validation (6-10 digits with optional periods)
    const hsCodePattern = /^(\d{2})(\.?)(\d{2})(\.?)(\d{2})(\.?)(\d{0,4})$/;
    if (!hsCodePattern.test(hsCode)) {
      return false;
    }
    
    // Check if it exists in our database (in a real system, you'd check against a complete database)
    const exists = this.hsCodeDatabase.some(entry => {
      // Normalize format for comparison (remove dots)
      const normalizedCode = entry.code.replace(/\./g, '');
      const normalizedInput = hsCode.replace(/\./g, '');
      
      // Check if the input matches or is a parent code
      return normalizedCode.startsWith(normalizedInput);
    });
    
    return exists;
  }

  /**
   * Get HS code restrictions for a specific country
   * 
   * @param hsCode HS code to check
   * @param countryCode Country to check restrictions for
   * @returns Array of restrictions or empty array if none
   */
  getRestrictions(hsCode: string, countryCode: string): ISimpleRestriction[] {
    try {
      if (!hsCode || typeof hsCode !== 'string') {
        throw new ApiError(400, 'HS code is required and must be a string');
      }
      
      if (!countryCode || typeof countryCode !== 'string') {
        throw new ApiError(400, 'Country code is required and must be a string');
      }
      
      // Find the entry in the database
      const hsEntry = this.hsCodeDatabase.find(entry => entry.code === hsCode);
      
      if (!hsEntry || !hsEntry.restrictions) {
        return [];
      }
      
      // Filter restrictions by country
      const countryRestrictions = hsEntry.restrictions.filter(r => 
        r.countryCode === countryCode || r.countryCode === 'ALL'
      );
      
      // Format the response
      return countryRestrictions.map(r => ({
        type: r.type,
        description: r.description
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error getting HS code restrictions: ${errorMessage}`);
    }
  }
}

export default HsCodeLookup;