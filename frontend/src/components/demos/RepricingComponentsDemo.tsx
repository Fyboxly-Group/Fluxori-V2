import { useState } from 'react';
import { 
  Container, Title, Grid, Stack, Tabs, Text, Group,
  ThemeIcon, Button, Switch, Divider
} from '@mantine/core';
import { 
  IconRuler, IconBuildingStore, IconSettings,
  IconShoppingCart, IconBulb, IconStar, IconEye
} from '@tabler/icons-react';
import RuleBuilder, { RepricingRule } from '../buybox/RuleBuilder';
import AIRecommendationsCarousel, { ProductRecommendation } from '../ai/AIRecommendationsCarousel';
import AIProcessingIndicator from '../ai/AIProcessingIndicator';

export const RepricingComponentsDemo: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [rules, setRules] = useState<RepricingRule[]>([
    {
      id: '1',
      name: 'Beat Amazon Buy Box',
      strategy: 'beat',
      marketplace: 'amazon',
      condition: 'all',
      strategyValue: 0.5,
      minimumPrice: 5.99,
      maximumPrice: undefined,
      schedule: 'hourly',
      active: true,
      priority: 10
    }
  ]);
  const [activeTab, setActiveTab] = useState('rule-builder');
  const [showInitialRule, setShowInitialRule] = useState(true);
  
  // Sample product recommendations
  const recommendations: ProductRecommendation[] = [
    {
      id: '1',
      name: 'Wireless Noise Cancelling Headphones',
      image: 'https://via.placeholder.com/300x180?text=Headphones',
      price: 149.99,
      originalPrice: 199.99,
      category: 'Electronics',
      confidence: 0.92,
      relationshipType: 'frequently_bought_together',
      badges: ['Best Seller']
    },
    {
      id: '2',
      name: 'Bluetooth Speaker with 24hr Battery',
      image: 'https://via.placeholder.com/300x180?text=Speaker',
      price: 79.99,
      category: 'Electronics',
      confidence: 0.85,
      relationshipType: 'similar'
    },
    {
      id: '3',
      name: 'Headphone Carrying Case',
      image: 'https://via.placeholder.com/300x180?text=Case',
      price: 24.99,
      originalPrice: 29.99,
      category: 'Accessories',
      confidence: 0.78,
      relationshipType: 'complementary'
    },
    {
      id: '4',
      name: 'Premium Audio Cable',
      image: 'https://via.placeholder.com/300x180?text=Cable',
      price: 19.99,
      category: 'Accessories',
      confidence: 0.67,
      relationshipType: 'complementary'
    },
    {
      id: '5',
      name: 'Smart Watch with Fitness Tracking',
      image: 'https://via.placeholder.com/300x180?text=Watch',
      price: 129.99,
      originalPrice: 159.99,
      category: 'Electronics',
      confidence: 0.62,
      relationshipType: 'trending',
      badges: ['Hot Item']
    }
  ];
  
  // Handle rule save
  const handleSaveRule = (rule: RepricingRule) => {
    // If editing existing rule, update it
    if (rule.id) {
      setRules(prevRules => 
        prevRules.map(r => r.id === rule.id ? rule : r)
      );
    } else {
      // Add new rule with generated id
      setRules(prevRules => [
        ...prevRules, 
        { ...rule, id: `rule-${prevRules.length + 1}` }
      ]);
    }
    
    // Toggle to show a different rule next
    setShowInitialRule(!showInitialRule);
  };
  
  // Handle product actions
  const handleViewProduct = (productId: string) => {
    console.log(`Viewing product: ${productId}`);
  };
  
  const handleAddToCart = (productId: string) => {
    console.log(`Adding product to cart: ${productId}`);
  };
  
  return (
    <Container size="xl" py="xl">
      <Stack spacing="xl">
        <Title order={1}>Repricing & Recommendations</Title>
        
        <Group position="apart" mb="xs">
          <Text size="lg">Advanced AI-driven pricing and product recommendations</Text>
          <Switch 
            label="AI Processing" 
            checked={processing} 
            onChange={(e) => setProcessing(e.currentTarget.checked)} 
          />
        </Group>
        
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab 
              value="rule-builder" 
              icon={<IconRuler size={16} />}
            >
              Rule Builder
            </Tabs.Tab>
            <Tabs.Tab 
              value="recommendations" 
              icon={<IconBuildingStore size={16} />}
            >
              AI Recommendations
            </Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="rule-builder" pt="md">
            <AIProcessingIndicator active={processing}>
              <RuleBuilder 
                initialRule={showInitialRule ? rules[0] : undefined}
                onSave={handleSaveRule}
              />
            </AIProcessingIndicator>
            
            <Divider my="xl" />
            
            <Group position="apart">
              <Stack spacing={0}>
                <Text weight={500}>Existing Rules</Text>
                <Text size="sm" color="dimmed">You have {rules.length} active repricing rules</Text>
              </Stack>
              
              <Button 
                variant="light" 
                leftIcon={<IconSettings size={16} />}
                onClick={() => setShowInitialRule(!showInitialRule)}
              >
                {showInitialRule ? 'Create New Rule' : 'Edit Existing Rule'}
              </Button>
            </Group>
          </Tabs.Panel>
          
          <Tabs.Panel value="recommendations" pt="md">
            <AIProcessingIndicator active={processing}>
              <AIRecommendationsCarousel
                recommendations={recommendations}
                onViewProduct={handleViewProduct}
                onAddToCart={handleAddToCart}
              />
            </AIProcessingIndicator>
            
            <Stack mt="xl" spacing="xs">
              <Text weight={500}>How Recommendations Work</Text>
              <Text size="sm">
                Our AI analyzes customer behavior, purchase history, and product attributes to create 
                personalized product recommendations that increase average order value and customer satisfaction.
              </Text>
              
              <Grid mt="md">
                <Grid.Col span={3}>
                  <Group spacing="xs">
                    <ThemeIcon color="blue" variant="light">
                      <IconShoppingCart size={16} />
                    </ThemeIcon>
                    <Text weight={500} size="sm">Frequently Bought Together</Text>
                  </Group>
                  <Text size="xs" color="dimmed">
                    Products that customers often purchase together
                  </Text>
                </Grid.Col>
                
                <Grid.Col span={3}>
                  <Group spacing="xs">
                    <ThemeIcon color="teal" variant="light">
                      <IconBulb size={16} />
                    </ThemeIcon>
                    <Text weight={500} size="sm">Similar Products</Text>
                  </Group>
                  <Text size="xs" color="dimmed">
                    Alternative products with similar attributes
                  </Text>
                </Grid.Col>
                
                <Grid.Col span={3}>
                  <Group spacing="xs">
                    <ThemeIcon color="grape" variant="light">
                      <IconStar size={16} />
                    </ThemeIcon>
                    <Text weight={500} size="sm">Complementary Items</Text>
                  </Group>
                  <Text size="xs" color="dimmed">
                    Products that enhance or complement each other
                  </Text>
                </Grid.Col>
                
                <Grid.Col span={3}>
                  <Group spacing="xs">
                    <ThemeIcon color="orange" variant="light">
                      <IconEye size={16} />
                    </ThemeIcon>
                    <Text weight={500} size="sm">Trending Items</Text>
                  </Group>
                  <Text size="xs" color="dimmed">
                    Popular products gaining traction in the market
                  </Text>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
};

export default RepricingComponentsDemo;