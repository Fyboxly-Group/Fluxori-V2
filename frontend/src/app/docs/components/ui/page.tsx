'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Tabs, 
  Grid, 
  Paper, 
  Button, 
  Group, 
  Stack, 
  useMantineTheme,
  Divider,
  Box,
  Code,
  ScrollArea,
  Accordion,
  CopyButton,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { 
  IconCode, 
  IconEye, 
  IconProps, 
  IconCheck,
  IconCopy,
  IconInfoCircle
} from '@tabler/icons-react';
import { useAnimatedMount, useStaggerAnimation } from '@/hooks/useAnimation';
import { BuyBoxStatusCard } from '@/components/buybox/BuyBoxStatusCard';
import { PriceHistoryChartJS } from '@/components/buybox/PriceHistoryChartJS';
import { CompetitorPriceTable } from '@/components/buybox/CompetitorPriceTable';
import { MarketPositionVisualization } from '@/components/buybox/MarketPositionVisualization';
import { BuyBoxMonitoringDashboard } from '@/components/buybox/BuyBoxMonitoringDashboard';
import { Prism } from '@mantine/prism';

// Sample data for components
const buyBoxSampleData = {
  hasWon: true,
  previousOwner: 'Competitor',
  currentOwner: 'You',
  yourPrice: 24.99,
  competitorPrice: 26.99,
  previousPrice: 27.99
};

const competitorsSampleData = [
  {
    id: 'comp-1',
    name: 'Top Seller',
    rating: 4.8,
    price: 26.99,
    hasBuyBox: false,
    fulfillmentType: 'FBA',
    condition: 'New'
  },
  {
    id: 'comp-2',
    name: 'Value Store',
    rating: 4.2,
    price: 23.99,
    shipping: 3.99,
    hasBuyBox: false,
    fulfillmentType: 'FBM',
    condition: 'New'
  },
  {
    id: 'comp-3',
    name: 'Discount Retailer',
    rating: 3.9,
    price: 22.99,
    shipping: 4.99,
    hasBuyBox: false,
    fulfillmentType: 'FBM',
    condition: 'Used - Like New'
  }
];

// Simplified product data for visualization
const productSampleData = {
  id: 'prod-1',
  sku: 'ABC123',
  name: 'Sample Product',
  marketplace: 'amazon',
  price: 24.99,
  previousPrice: 27.99,
  buyBoxPrice: 24.99,
  lowestPrice: 22.99,
  highestPrice: 32.99,
  hasBuyBox: true,
  buyBoxWinRate: 0.75,
  competitors: competitorsSampleData,
  priceHistory: [],
  isMonitored: true
};

export default function UIComponentsPage() {
  const theme = useMantineTheme();
  const containerRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const staggerRef = useStaggerAnimation({ stagger: 0.05 });
  
  return (
    <Container fluid px="md" pb="xl" ref={containerRef}>
      <Stack spacing="xl">
        <Group position="apart" py="md">
          <div>
            <Title order={1}>UI Components</Title>
            <Text size="lg" color="dimmed">
              Explore UI components with interactive examples
            </Text>
          </div>
          
          <Button 
            variant="light" 
            component="a" 
            href="/docs"
          >
            Back to Documentation
          </Button>
        </Group>
        
        <Paper withBorder p="xl" radius="md">
          <Stack spacing="lg">
            <Title order={2} id="buybox-components">
              Buy Box Monitoring Components
            </Title>
            
            <Text>
              These components are designed for monitoring and visualizing Buy Box 
              status, competitor pricing, and market position for e-commerce products.
              Each component includes GSAP animations following our motion design principles.
            </Text>
            
            <Accordion>
              <Accordion.Item value="buybox-status-card">
                <Accordion.Control>
                  <Group>
                    <Title order={4}>BuyBoxStatusCard</Title>
                    <Text size="sm" color="dimmed">
                      Displays Buy Box ownership status with animated transitions
                    </Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <ComponentShowcase
                    title="BuyBoxStatusCard"
                    description="Displays Buy Box ownership status with price comparison and animated transitions when ownership changes."
                    props={[
                      { name: 'hasWon', type: 'boolean', description: 'Whether the user has won the Buy Box' },
                      { name: 'previousOwner', type: 'string', description: 'Previous owner of the Buy Box (optional)' },
                      { name: 'currentOwner', type: 'string', description: 'Current owner of the Buy Box' },
                      { name: 'yourPrice', type: 'number', description: 'Your current price' },
                      { name: 'competitorPrice', type: 'number', description: 'Competitor price (optional)' },
                      { name: 'previousPrice', type: 'number', description: 'Previous price (optional)' },
                      { name: 'className', type: 'string', description: 'Optional CSS class' }
                    ]}
                    codeExample={`<BuyBoxStatusCard
  hasWon={true}
  previousOwner="Competitor"
  currentOwner="You"
  yourPrice={24.99}
  competitorPrice={26.99}
  previousPrice={27.99}
/>`}
                    component={
                      <Box p="md">
                        <BuyBoxStatusCard
                          hasWon={buyBoxSampleData.hasWon}
                          previousOwner={buyBoxSampleData.previousOwner}
                          currentOwner={buyBoxSampleData.currentOwner}
                          yourPrice={buyBoxSampleData.yourPrice}
                          competitorPrice={buyBoxSampleData.competitorPrice}
                          previousPrice={buyBoxSampleData.previousPrice}
                        />
                      </Box>
                    }
                  />
                </Accordion.Panel>
              </Accordion.Item>
              
              <Accordion.Item value="competitor-price-table">
                <Accordion.Control>
                  <Group>
                    <Title order={4}>CompetitorPriceTable</Title>
                    <Text size="sm" color="dimmed">
                      Table of competitor prices with price difference highlighting
                    </Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <ComponentShowcase
                    title="CompetitorPriceTable"
                    description="Displays a table of competitors with their prices, conditions, and fulfillment types. Highlights price differences and indicates which competitor has the Buy Box."
                    props={[
                      { name: 'competitors', type: 'Competitor[]', description: 'Array of competitor data' },
                      { name: 'yourPrice', type: 'number', description: 'Your current price' },
                      { name: 'loading', type: 'boolean', description: 'Whether data is loading' },
                      { name: 'currency', type: 'string', description: 'Currency symbol (default: $)' },
                      { name: 'yourCondition', type: 'string', description: 'Your product condition' },
                      { name: 'yourFulfillment', type: 'string', description: 'Your fulfillment type' },
                      { name: 'title', type: 'string', description: 'Title for the component' },
                      { name: 'onSelectCompetitor', type: 'function', description: 'Called when a competitor is selected' },
                      { name: 'className', type: 'string', description: 'Optional CSS class' }
                    ]}
                    codeExample={`<CompetitorPriceTable
  competitors={[
    {
      id: 'comp-1',
      name: 'Top Seller',
      rating: 4.8,
      price: 26.99,
      hasBuyBox: false,
      fulfillmentType: 'FBA',
      condition: 'New'
    },
    // More competitors...
  ]}
  yourPrice={24.99}
/>`}
                    component={
                      <Box p="md">
                        <CompetitorPriceTable
                          competitors={competitorsSampleData}
                          yourPrice={buyBoxSampleData.yourPrice}
                        />
                      </Box>
                    }
                  />
                </Accordion.Panel>
              </Accordion.Item>
              
              <Accordion.Item value="market-position-visualization">
                <Accordion.Control>
                  <Group>
                    <Title order={4}>MarketPositionVisualization</Title>
                    <Text size="sm" color="dimmed">
                      SVG visualization of price positions in the market
                    </Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <ComponentShowcase
                    title="MarketPositionVisualization"
                    description="Visualizes market position showing your price in relation to competitors with interactive animations for highlighting position changes."
                    props={[
                      { name: 'product', type: 'BuyBoxProduct', description: 'Product data for visualization' },
                      { name: 'minPrice', type: 'number', description: 'Minimum price for scale (optional)' },
                      { name: 'maxPrice', type: 'number', description: 'Maximum price for scale (optional)' },
                      { name: 'width', type: 'number', description: 'Width of visualization (default: 400)' },
                      { name: 'height', type: 'number', description: 'Height of visualization (default: 180)' },
                      { name: 'className', type: 'string', description: 'Optional CSS class' }
                    ]}
                    codeExample={`<MarketPositionVisualization
  product={product}
  width={400}
  height={180}
/>`}
                    component={
                      <Box p="md">
                        <MarketPositionVisualization
                          product={productSampleData}
                          width={400}
                          height={180}
                        />
                      </Box>
                    }
                  />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Stack>
        </Paper>
        
        <Paper withBorder p="xl" radius="md">
          <Stack spacing="lg">
            <Title order={2} id="animation-patterns">
              Animation Patterns
            </Title>
            
            <Text>
              Our components use consistent animation patterns implemented with GSAP.
              These animations follow our motion design principles and respect user
              motion preferences.
            </Text>
            
            <Grid>
              <Grid.Col md={6}>
                <Paper withBorder p="md" radius="md">
                  <Stack spacing="md">
                    <Title order={4}>Entrance Animations</Title>
                    <Text size="sm">
                      Components animate when they mount or enter the viewport:
                    </Text>
                    <Code block>
{`// Mount animation
const containerRef = useAnimatedMount('fadeInUp', { 
  duration: 0.5 
});

// Scroll trigger animation
const { ref, isInView } = useAnimateOnScroll('fadeIn', {
  threshold: 0.3
});`}
                    </Code>
                    <Text size="sm">
                      This creates consistent entrance effects across the application
                      while respecting user motion preferences.
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Paper withBorder p="md" radius="md">
                  <Stack spacing="md">
                    <Title order={4}>State Transitions</Title>
                    <Text size="sm">
                      Components animate smoothly between states:
                    </Text>
                    <Code block>
{`// Animate on state change
useEffect(() => {
  if (isExpanded && contentRef.current) {
    gsap.timeline()
      .fromTo(
        contentRef.current,
        { height: 0, opacity: 0 },
        { 
          height: 'auto', 
          opacity: 1, 
          duration: 0.4, 
          ease: 'power2.out' 
        }
      );
  }
}, [isExpanded]);`}
                    </Code>
                    <Text size="sm">
                      State transitions preserve context and provide visual feedback
                      about component changes.
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Paper withBorder p="md" radius="md">
                  <Stack spacing="md">
                    <Title order={4}>Staggered Animations</Title>
                    <Text size="sm">
                      Lists and grids animate with staggered timing:
                    </Text>
                    <Code block>
{`// Staggered list animation
const listRef = useStaggerAnimation({
  stagger: 0.05,
  y: 10,
  duration: 0.4
});

// Use in component
<div ref={listRef}>
  {items.map(item => (
    <ListItem key={item.id} {...item} />
  ))}
</div>`}
                    </Code>
                    <Text size="sm">
                      Staggered animations create a sense of organization and guide
                      the user's attention through lists of items.
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Paper withBorder p="md" radius="md">
                  <Stack spacing="md">
                    <Title order={4}>Micro-interactions</Title>
                    <Text size="sm">
                      Subtle animations for user feedback:
                    </Text>
                    <Code block>
{`// Button click feedback
const handleClick = () => {
  if (!buttonRef.current) return;
  
  gsap.timeline()
    .to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.in'
    })
    .to(buttonRef.current, {
      scale: 1,
      duration: 0.2,
      ease: 'elastic.out(1.2, 0.5)'
    });
};`}
                    </Code>
                    <Text size="sm">
                      Micro-interactions provide immediate feedback for user actions
                      without disrupting their workflow.
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>
        
        <Paper withBorder p="xl" radius="md">
          <Stack spacing="lg">
            <Title order={2} id="usage-guidelines">
              Usage Guidelines
            </Title>
            
            <Text>
              Follow these guidelines when using our components to ensure consistency
              and proper integration with the Fluxori design system.
            </Text>
            
            <Grid>
              <Grid.Col md={6}>
                <Paper withBorder p="md" radius="md">
                  <Stack spacing="md">
                    <Group spacing={8}>
                      <IconInfoCircle size={18} />
                      <Title order={4}>Component Composition</Title>
                    </Group>
                    <Text size="sm">
                      Our components are designed to work together in various combinations.
                      For Buy Box monitoring, consider using these patterns:
                    </Text>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                      <li>
                        <Text size="sm">
                          Use <Code>BuyBoxStatusCard</Code> as a quick overview of Buy Box status.
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Combine with <Code>CompetitorPriceTable</Code> for detailed competitor analysis.
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Add <Code>MarketPositionVisualization</Code> to show relative price positions.
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Use <Code>BuyBoxMonitoringDashboard</Code> for a complete monitoring solution.
                        </Text>
                      </li>
                    </ul>
                  </Stack>
                </Paper>
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Paper withBorder p="md" radius="md">
                  <Stack spacing="md">
                    <Group spacing={8}>
                      <IconInfoCircle size={18} />
                      <Title order={4}>Responsive Design</Title>
                    </Group>
                    <Text size="sm">
                      Our components adapt to different screen sizes:
                    </Text>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                      <li>
                        <Text size="sm">
                          Use Mantine <Code>Grid</Code> for responsive layouts.
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Components will adapt to container width.
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Set explicit width/height only when necessary.
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Test on various screen sizes for proper display.
                        </Text>
                      </li>
                    </ul>
                  </Stack>
                </Paper>
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Paper withBorder p="md" radius="md">
                  <Stack spacing="md">
                    <Group spacing={8}>
                      <IconInfoCircle size={18} />
                      <Title order={4}>Animation Consistency</Title>
                    </Group>
                    <Text size="sm">
                      Keep animations consistent throughout the application:
                    </Text>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                      <li>
                        <Text size="sm">
                          Use our animation hooks for standard animations.
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Follow timing guidelines (300-500ms for primary animations).
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Use consistent easing functions (<Code>'power2.out'</Code> for most animations).
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Respect user motion preferences with <Code>useMotionPreference</Code>.
                        </Text>
                      </li>
                    </ul>
                  </Stack>
                </Paper>
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Paper withBorder p="md" radius="md">
                  <Stack spacing="md">
                    <Group spacing={8}>
                      <IconInfoCircle size={18} />
                      <Title order={4}>Accessibility</Title>
                    </Group>
                    <Text size="sm">
                      Ensure your implementations remain accessible:
                    </Text>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                      <li>
                        <Text size="sm">
                          Respect <Code>prefers-reduced-motion</Code> settings.
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Ensure sufficient color contrast for text and UI elements.
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Don't rely solely on color to convey information.
                        </Text>
                      </li>
                      <li>
                        <Text size="sm">
                          Include proper ARIA attributes for interactive elements.
                        </Text>
                      </li>
                    </ul>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

// Component Showcase helper component
interface PropDefinition {
  name: string;
  type: string;
  description: string;
}

interface ComponentShowcaseProps {
  title: string;
  description: string;
  props: PropDefinition[];
  codeExample: string;
  component: React.ReactNode;
}

function ComponentShowcase({
  title,
  description,
  props,
  codeExample,
  component
}: ComponentShowcaseProps) {
  const [activeTab, setActiveTab] = useState<string | null>('preview');
  
  return (
    <Stack spacing="md">
      <Text>{description}</Text>
      
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="preview" icon={<IconEye size={14} />}>
            Preview
          </Tabs.Tab>
          <Tabs.Tab value="props" icon={<IconProps size={14} />}>
            Props
          </Tabs.Tab>
          <Tabs.Tab value="code" icon={<IconCode size={14} />}>
            Code
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="preview" pt="md">
          <Paper withBorder p="md" radius="md">
            {component}
          </Paper>
        </Tabs.Panel>
        
        <Tabs.Panel value="props" pt="md">
          <Paper withBorder radius="md">
            <ScrollArea h={300}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #eee' }}>
                      Prop
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #eee' }}>
                      Type
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #eee' }}>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {props.map((prop) => (
                    <tr key={prop.name}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <Code>{prop.name}</Code>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <Text size="sm" color="dimmed">
                          {prop.type}
                        </Text>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <Text size="sm">{prop.description}</Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>
        
        <Tabs.Panel value="code" pt="md">
          <Paper withBorder p={0} radius="md" style={{ position: 'relative' }}>
            <CopyButton value={codeExample}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy code'} position="left">
                  <ActionIcon
                    style={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      zIndex: 10,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                    onClick={copy}
                  >
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
            <Prism language="tsx">
              {codeExample}
            </Prism>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}