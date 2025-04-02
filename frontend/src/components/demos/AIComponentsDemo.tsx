import { useState, useEffect } from 'react';
import { Container, Title, Grid, Stack, Button, Group, Text, Switch } from '@mantine/core';
import { IconBrain, IconTrendingUp, IconShoppingCart, IconClock } from '@tabler/icons-react';
import AIInsightCard from '../ai/AIInsightCard';
import AIProcessingIndicator from '../ai/AIProcessingIndicator';
import BuyBoxStatusCard from '../buybox/BuyBoxStatusCard';
import ShipmentTimeline from '../shipment/ShipmentTimeline';
import AnimatedStatCard from '../dashboard/AnimatedStatCard';

export const AIComponentsDemo: React.FC = () => {
  // Demo state
  const [processingActive, setProcessingActive] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [buyBoxOwner, setBuyBoxOwner] = useState('Your Store');
  const [yourPrice, setYourPrice] = useState(49.99);
  const [prevPrice, setPrevPrice] = useState(49.99);
  const [competitorPrice, setCompetitorPrice] = useState(52.99);
  const [hasWon, setHasWon] = useState(true);
  const [showNewInsight, setShowNewInsight] = useState(false);
  
  // Simulate price changes
  const changePrice = () => {
    setPrevPrice(yourPrice);
    const newPrice = Number((yourPrice - (Math.random() * 2)).toFixed(2));
    setYourPrice(newPrice);
    
    if (newPrice < competitorPrice) {
      setBuyBoxOwner('Your Store');
      setHasWon(true);
    } else {
      setBuyBoxOwner('Competitor Inc.');
      setHasWon(false);
    }
  };
  
  // Simulate competitor price changes
  const changeCompetitorPrice = () => {
    const newPrice = Number((competitorPrice - (Math.random() * 5)).toFixed(2));
    setCompetitorPrice(newPrice);
    
    if (yourPrice < newPrice) {
      setBuyBoxOwner('Your Store');
      setHasWon(true);
    } else {
      setBuyBoxOwner('Competitor Inc.');
      setHasWon(false);
    }
  };
  
  // Sample shipment events
  const shipmentEvents = [
    {
      id: '1',
      status: 'shipped' as const,
      location: 'New York, NY',
      timestamp: new Date(2025, 3, 1, 9, 30),
      description: 'Package has been shipped from our warehouse'
    },
    {
      id: '2',
      status: 'in_transit' as const,
      location: 'Chicago, IL',
      timestamp: new Date(2025, 3, 1, 18, 45),
      description: 'Package arrived at distribution center'
    },
    {
      id: '3',
      status: 'in_transit' as const,
      location: 'Denver, CO',
      timestamp: new Date(2025, 3, 2, 11, 15),
      description: 'Package in transit to next facility',
      isActive: true
    },
    {
      id: '4',
      status: 'pending' as const,
      location: 'Los Angeles, CA',
      timestamp: new Date(2025, 3, 3, 8, 0),
      description: 'Expected delivery to destination'
    }
  ];
  
  // Create some demo stats data
  const [salesValue, setSalesValue] = useState(12675);
  const [prevSalesValue, setPrevSalesValue] = useState(10980);
  const [ordersValue, setOrdersValue] = useState(189);
  const [prevOrdersValue, setPrevOrdersValue] = useState(163);
  
  // When time range changes, update stats
  useEffect(() => {
    const multipliers: Record<string, number> = {
      today: 0.2,
      week: 1,
      month: 4.2,
      quarter: 12.5,
      year: 52
    };
    
    const multiplier = multipliers[timeRange] || 1;
    const randomFactor = 0.85 + (Math.random() * 0.3); // Random factor between 0.85 and 1.15
    
    const baseSales = 12675;
    const newSales = Math.round(baseSales * multiplier * randomFactor);
    const prevSales = Math.round(baseSales * multiplier * 0.9); // 90% of current value
    
    const baseOrders = 189;
    const newOrders = Math.round(baseOrders * multiplier * randomFactor);
    const prevOrders = Math.round(baseOrders * multiplier * 0.85); // 85% of current value
    
    setSalesValue(newSales);
    setPrevSalesValue(prevSales);
    setOrdersValue(newOrders);
    setPrevOrdersValue(prevOrders);
  }, [timeRange]);
  
  return (
    <Container size="xl" py="xl">
      <Stack spacing="xl">
        <Title order={1}>AI-Enhanced Component Demo</Title>
        
        <Group position="apart" mb="md">
          <Switch 
            label="AI Processing" 
            checked={processingActive} 
            onChange={(e) => setProcessingActive(e.currentTarget.checked)} 
          />
          <Button onClick={() => setShowNewInsight(!showNewInsight)}>
            {showNewInsight ? 'Hide' : 'Show'} New Insight
          </Button>
        </Group>
        
        <AIProcessingIndicator 
          active={processingActive} 
          label="AI Analysis Running"
          intensity="medium"
        />
        
        <Grid>
          <Grid.Col md={6}>
            <AIInsightCard
              title="Sales Opportunity Detected"
              description="Based on current market trends, lowering your price by $2.50 could increase your Buy Box win rate by 35% and lead to a 28% increase in overall sales volume."
              impact="positive"
              confidence={0.87}
              newInsight={showNewInsight}
            />
          </Grid.Col>
          
          <Grid.Col md={6}>
            <AIProcessingIndicator active={processingActive} showIcon>
              <BuyBoxStatusCard
                hasWon={hasWon}
                previousOwner={hasWon ? 'Competitor Inc.' : 'Your Store'}
                currentOwner={buyBoxOwner}
                yourPrice={yourPrice}
                previousPrice={prevPrice}
                competitorPrice={competitorPrice}
              />
            </AIProcessingIndicator>
          </Grid.Col>
          
          <Grid.Col md={6}>
            <ShipmentTimeline 
              events={shipmentEvents}
              title="Order #12345 Tracking"
            />
          </Grid.Col>
          
          <Grid.Col md={6}>
            <Grid>
              <Grid.Col span={6}>
                <AnimatedStatCard
                  title="Total Sales"
                  value={salesValue}
                  previousValue={prevSalesValue}
                  format={(val) => `$${val.toLocaleString()}`}
                  icon={<IconTrendingUp size={16} />}
                  color="blue"
                  timeRanges={[
                    { value: 'today', label: 'Today' },
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                    { value: 'quarter', label: 'This Quarter' },
                    { value: 'year', label: 'This Year' }
                  ]}
                  defaultTimeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <AnimatedStatCard
                  title="Orders"
                  value={ordersValue}
                  previousValue={prevOrdersValue}
                  icon={<IconShoppingCart size={16} />}
                  color="indigo"
                  timeRanges={[
                    { value: 'today', label: 'Today' },
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                    { value: 'quarter', label: 'This Quarter' },
                    { value: 'year', label: 'This Year' }
                  ]}
                  defaultTimeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <AIInsightCard
                  title="Inventory Alert"
                  description="You are likely to run out of stock for 5 top-selling products within the next 7 days based on current sales velocity. Consider reordering now to avoid stockouts."
                  impact="negative"
                  confidence={0.92}
                />
              </Grid.Col>
            </Grid>
          </Grid.Col>
        </Grid>
        
        <Group position="center" mt="xl">
          <Button onClick={changePrice} color="blue">
            Change Your Price
          </Button>
          <Button onClick={changeCompetitorPrice} color="violet">
            Change Competitor Price
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};

export default AIComponentsDemo;