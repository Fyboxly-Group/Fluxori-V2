import { BuyBoxProduct, BuyBoxAnalytics, Marketplace, RepricingEvent } from '@/types/buybox';

// Helper function to generate random dates within a specific time range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random decimal between min and max with fixed precision
const randomDecimal = (min: number, max: number, precision: number = 2) => {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(precision));
};

// Generate price history for a product
const generatePriceHistory = (
  currentPrice: number,
  competitorPrice: number,
  days: number = 30,
  volatility: number = 0.05
) => {
  const history = [];
  let yourPrice = currentPrice;
  let buyBoxPrice = competitorPrice;
  
  // Starting date (n days ago)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    // Add some random variation to prices
    yourPrice += randomDecimal(-volatility, volatility, 2);
    buyBoxPrice += randomDecimal(-volatility, volatility, 2);
    
    // Keep prices positive
    yourPrice = Math.max(yourPrice, currentPrice * 0.7);
    buyBoxPrice = Math.max(buyBoxPrice, competitorPrice * 0.7);
    
    // Determine who has the buy box for this data point
    const hadBuyBox = yourPrice <= buyBoxPrice;
    
    // Create a date for this point
    const pointDate = new Date(startDate);
    pointDate.setDate(startDate.getDate() + i);
    
    history.push({
      timestamp: pointDate,
      yourPrice,
      buyBoxPrice,
      lowestPrice: Math.min(yourPrice, buyBoxPrice, yourPrice * 0.9),
      highestPrice: Math.max(yourPrice, buyBoxPrice, buyBoxPrice * 1.1),
      hadBuyBox
    });
  }
  
  return history;
};

// Generate mock marketplace competitor data
const generateCompetitors = (
  basePrice: number, 
  count: number = 5, 
  buyBoxIndex: number | null = null
) => {
  const competitors = [];
  const competitorNames = [
    'GreenSales', 'CloudRetail', 'GlobalGoods', 'StarShop', 
    'QualityConnect', 'MegaStore', 'VentureGroup', 'BestValue',
    'PrimeSeller', 'TopChoice', 'EliteRetail', 'DailyDeals',
    'MarketKing', 'TrendyStore', 'FastSeller', 'BargainHub'
  ];
  
  const conditions = [
    'New', 'Used - Like New', 'Used - Good', 'Used - Acceptable'
  ];
  
  const fulfillmentTypes = ['FBA', 'FBM', 'FBA', 'FBA', 'FBM']; // More FBA to be realistic
  
  for (let i = 0; i < count; i++) {
    // Randomize price around base price (some higher, some lower)
    const priceFactor = i === 0 ? 0.95 : randomDecimal(0.9, 1.15, 2);
    const price = basePrice * priceFactor;
    
    // Some will have shipping costs
    const hasShippingCost = fulfillmentTypes[i % fulfillmentTypes.length] === 'FBM' && Math.random() > 0.3;
    
    competitors.push({
      id: `comp-${i + 1}`,
      name: competitorNames[i % competitorNames.length],
      rating: randomDecimal(3.5, 5.0, 1),
      price,
      shipping: hasShippingCost ? randomDecimal(3.99, 8.99, 2) : undefined,
      hasBuyBox: buyBoxIndex === i,
      fulfillmentType: fulfillmentTypes[i % fulfillmentTypes.length],
      offerCount: Math.floor(Math.random() * 20) + 1,
      condition: i === 0 ? 'New' : conditions[i % conditions.length],
      arrivalDate: hasShippingCost ? randomDate(
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      ) : undefined
    });
  }
  
  return competitors;
};

// Generate mock product data
export const generateMockProducts = (count: number = 15): BuyBoxProduct[] => {
  const products = [];
  const marketplaces: Marketplace[] = ['amazon', 'takealot', 'shopify', 'other'];
  const productNames = [
    'Wireless Bluetooth Headphones',
    'Smart LED Light Bulb (Pack of a 4)',
    'Ergonomic Office Chair',
    'Fitness Tracker Watch',
    'Stainless Steel Water Bottle',
    'Portable External SSD (1TB)',
    'Digital Kitchen Scale',
    'Sunrise Alarm Clock with Multiple Sounds',
    'Wireless Charging Pad',
    'Adjustable Laptop Stand',
    'Ultra HD Webcam with Microphone',
    'Compact Air Purifier',
    'Noise Cancelling Earbuds',
    'Insulated Travel Coffee Mug',
    'WiFi Range Extender',
    'HD Dash Camera with Night Vision',
    'Gaming Mouse with RGB Lighting',
    'Compact Standing Desk Converter',
    'Smart WiFi Plug (Pack of 2)',
    'Floating Shelf Set (Set of 3)'
  ];
  
  for (let i = 0; i < count; i++) {
    const marketplace = marketplaces[i % marketplaces.length];
    const baseSku = `SKU-${(i + 1).toString().padStart(5, '0')}`;
    const basePrice = randomDecimal(15.99, 149.99, 2);
    const previousPrice = Math.random() > 0.7 ? basePrice + randomDecimal(-5, 5, 2) : undefined;
    
    // Determine if this product has the Buy Box
    const hasBuyBox = Math.random() > 0.6;
    
    // Generate competitors, deciding which one has the Buy Box if this product doesn't
    const buyBoxCompetitorIndex = hasBuyBox ? null : Math.floor(Math.random() * 3);
    const competitors = generateCompetitors(basePrice, Math.floor(Math.random() * 6) + 2, buyBoxCompetitorIndex);
    
    // Find the buy box price (either your price or the competitor with the Buy Box)
    const buyBoxPrice = hasBuyBox 
      ? basePrice 
      : (competitors.find(c => c.hasBuyBox)?.price || basePrice);
    
    // Generate price history
    const priceHistory = generatePriceHistory(basePrice, buyBoxPrice);
    
    // Calculate win rate from price history
    const winRate = priceHistory.filter(p => p.hadBuyBox).length / priceHistory.length;
    
    products.push({
      id: `prod-${i + 1}`,
      sku: marketplace === 'amazon' ? `A${baseSku}` : 
           marketplace === 'takealot' ? `T${baseSku}` :
           marketplace === 'shopify' ? `S${baseSku}` : baseSku,
      name: productNames[i % productNames.length],
      marketplace,
      price: basePrice,
      previousPrice,
      buyBoxPrice,
      lowestPrice: Math.min(...competitors.map(c => c.price), basePrice),
      highestPrice: Math.max(...competitors.map(c => c.price), basePrice),
      hasBuyBox,
      buyBoxWinRate: winRate,
      ruleId: Math.random() > 0.7 ? `rule-${Math.floor(Math.random() * 5) + 1}` : undefined,
      ruleName: Math.random() > 0.7 ? `Automated ${marketplace} Rule` : undefined,
      lastPriceChange: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      imageUrl: `https://placehold.co/400x400/webp?text=${marketplace.charAt(0).toUpperCase()}`,
      category: i % 2 === 0 ? 'Electronics' : i % 3 === 0 ? 'Home & Kitchen' : 'Office Products',
      brand: i % 2 === 0 ? 'TechPro' : i % 3 === 0 ? 'HomeEssentials' : 'OfficeMaster',
      competitors,
      priceHistory,
      suggestedPrice: Math.random() > 0.7 ? basePrice * 0.95 : undefined,
      profitMargin: randomDecimal(0.15, 0.45, 2),
      estimatedSales: Math.floor(Math.random() * 500) + 50,
      isMonitored: Math.random() > 0.2
    });
  }
  
  return products;
};

// Generate mock reprice events
const generateMockRepricingEvents = (count: number = 20): RepricingEvent[] => {
  const events = [];
  const marketplaces: Marketplace[] = ['amazon', 'takealot', 'shopify', 'other'];
  const productNames = [
    'Wireless Bluetooth Headphones',
    'Smart LED Light Bulb (Pack of a 4)',
    'Ergonomic Office Chair',
    'Fitness Tracker Watch',
    'Stainless Steel Water Bottle'
  ];
  const ruleNames = [
    'Beat Competitors by 1%',
    'Match Buy Box Price',
    'Hourly Amazon Repricing',
    'Weekend Sales Boost',
    'Maintain Margin Rule'
  ];
  const statusOptions = ['success', 'failed', 'skipped'] as const;
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
    const previousPrice = randomDecimal(20, 150, 2);
    const buyBoxPrice = previousPrice * randomDecimal(0.9, 1.1, 2);
    const newPrice = Math.random() > 0.3 ? 
      Math.min(previousPrice, buyBoxPrice) - randomDecimal(0.5, 2, 2) : 
      previousPrice * randomDecimal(0.95, 1.05, 2);
    const buyBoxWon = newPrice <= buyBoxPrice;
    const status = i < count - 3 ? 'success' : statusOptions[i % 3];
    
    events.push({
      id: `event-${i + 1}`,
      timestamp,
      ruleId: `rule-${(i % 5) + 1}`,
      ruleName: ruleNames[i % ruleNames.length],
      productId: `prod-${(i % 10) + 1}`,
      productName: productNames[i % productNames.length],
      marketplace: marketplaces[i % marketplaces.length],
      previousPrice,
      newPrice,
      buyBoxPrice,
      buyBoxWon,
      status,
      reason: status === 'failed' ? 'Price below minimum threshold' : 
              status === 'skipped' ? 'No change required' : undefined,
      creditsUsed: status === 'success' ? 1 : 0
    });
  }
  
  // Sort by timestamp, most recent first
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate mock analytics data
export const generateMockAnalytics = (): BuyBoxAnalytics => {
  const totalProducts = 120;
  const monitoredProducts = 87;
  const activeRules = 8;
  const totalRules = 12;
  const buyBoxWinRate = randomDecimal(0.6, 0.85, 2);
  const lastDayEvents = 43;
  const lastDayWins = 31;
  const recentEvents = generateMockRepricingEvents();
  
  // Generate marketplace distribution
  const marketplaceDistribution = [
    {
      marketplace: 'amazon' as Marketplace,
      count: 45,
      winRate: randomDecimal(0.65, 0.8, 2)
    },
    {
      marketplace: 'takealot' as Marketplace,
      count: 23,
      winRate: randomDecimal(0.55, 0.75, 2)
    },
    {
      marketplace: 'shopify' as Marketplace,
      count: 12,
      winRate: randomDecimal(0.7, 0.9, 2)
    },
    {
      marketplace: 'other' as Marketplace,
      count: 7,
      winRate: randomDecimal(0.5, 0.7, 2)
    }
  ];
  
  // Generate top performing products
  const topPerformingProducts = [
    {
      id: 'prod-1',
      name: 'Wireless Bluetooth Headphones',
      winRate: randomDecimal(0.85, 0.95, 2),
      marketplace: 'amazon' as Marketplace
    },
    {
      id: 'prod-5',
      name: 'Stainless Steel Water Bottle',
      winRate: randomDecimal(0.8, 0.9, 2),
      marketplace: 'shopify' as Marketplace
    },
    {
      id: 'prod-3',
      name: 'Ergonomic Office Chair',
      winRate: randomDecimal(0.75, 0.85, 2),
      marketplace: 'takealot' as Marketplace
    },
    {
      id: 'prod-2',
      name: 'Smart LED Light Bulb (Pack of a 4)',
      winRate: randomDecimal(0.7, 0.8, 2),
      marketplace: 'amazon' as Marketplace
    },
    {
      id: 'prod-4',
      name: 'Fitness Tracker Watch',
      winRate: randomDecimal(0.65, 0.75, 2),
      marketplace: 'amazon' as Marketplace
    }
  ];
  
  return {
    totalProducts,
    monitoredProducts,
    buyBoxWinRate,
    averageBuyBoxPrice: randomDecimal(45, 65, 2),
    totalRules,
    activeRules,
    lastDayEvents,
    lastDayWins,
    marketplaceDistribution,
    topPerformingProducts,
    recentEvents
  };
};

// Export functions for getting data
export const getBuyBoxData = () => {
  return {
    products: generateMockProducts(),
    analytics: generateMockAnalytics()
  };
};