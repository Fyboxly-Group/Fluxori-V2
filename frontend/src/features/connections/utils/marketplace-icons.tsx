/// <reference path="../../../types/module-declarations.d.ts" />
import { Icon } from '@/utils/chakra-compat';;
import React from 'react';
;
import { 
  Store, 
  ShoppingBag, 
  FileText, // Changed FileInvoice to FileText 
  Package2, 
  MessageCircle, 
  CreditCard, 
  Globe 
} from 'lucide-react';

// Add reference to utility types
/// <reference path="../../types/utility-types.d.ts" />

// Define marketplace icon types
export enum MarketplaceIconType {
  AMAZON = 'amazon',
  AMAZON_US = 'amazon_us',
  AMAZON_UK = 'amazon_uk',
  AMAZON_EU = 'amazon_eu',
  SHOPIFY = 'shopify',
  TAKEALOT = 'takealot',
  XERO = 'xero',
  DEFAULT = 'default',
}

/**
 * Get the icon component for a specific marketplace
 * @param marketplaceId - The marketplace ID
 * @returns The icon component
 */
export const getMarketplaceIcon = (marketplaceId?: string) => {
  switch (marketplaceId?.toLowerCase()) {
    case MarketplaceIconType.AMAZON:
    case MarketplaceIconType.AMAZON_US:
    case MarketplaceIconType.AMAZON_UK:
    case MarketplaceIconType.AMAZON_EU:
      return ShoppingBag;
    case MarketplaceIconType.SHOPIFY:
      return Store;
    case MarketplaceIconType.TAKEALOT:
      return Package; 
    case MarketplaceIconType.XERO:
      return FileText; // Changed FileInvoice to FileText
    default:
      return Globe; 
  }
};

/**
 * Get the color for a specific marketplace
 * @param marketplaceId - The marketplace ID
 * @returns The color code
 */
export const getMarketplaceColor = (marketplaceId?: string) => {
  switch (marketplaceId?.toLowerCase()) {
    case MarketplaceIconType.AMAZON:
    case MarketplaceIconType.AMAZON_US:
    case MarketplaceIconType.AMAZON_UK:
    case MarketplaceIconType.AMAZON_EU:
      return '#FF9900';
    case MarketplaceIconType.SHOPIFY:
      return '#95BF47';
    case MarketplaceIconType.TAKEALOT:
      return '#0077BE';
    case MarketplaceIconType.XERO:
      return '#13B5EA';
    default:
      return 'gray.500';
  }
};

/**
 * Marketplace icon component
 */
interface MarketplaceIconProps {
  marketplaceId: string;
  boxSize?: string | number;
  color?: string;
}

export const MarketplaceIcon: React.FC<MarketplaceIconProps> = ({ 
  marketplaceId, 
  boxSize = 6, 
  color 
}) => {
  const IconComponent = getMarketplaceIcon(marketplaceId);
  const iconColor = color || getMarketplaceColor(marketplaceId);
  
  return (
    <Icon 
      as={IconComponent} 
      boxSize={boxSize} 
      color={iconColor}
      aria-label={`${marketplaceId} icon`}
    />
  );
};

export default MarketplaceIcon;