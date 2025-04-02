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
  Badge,
  Divider,
  Box,
  Code,
  Anchor,
  ScrollArea
} from '@mantine/core';
import { 
  IconCode, 
  IconComponents, 
  IconAnimation, 
  IconAccessibility, 
  IconPalette, 
  IconArrowRight, 
  IconGitPullRequest, 
  IconChartBar,
  IconDeviceLaptop
} from '@tabler/icons-react';
import { useAnimatedMount, useStaggerAnimation } from '@/hooks/useAnimation';
import gsap from 'gsap';

export default function DocsPage() {
  const theme = useMantineTheme();
  const containerRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const staggerRef = useStaggerAnimation({ stagger: 0.05 });
  
  const [activeTab, setActiveTab] = useState<string | null>('components');
  
  return (
    <Container fluid px="md" pb="xl" ref={containerRef}>
      <Stack spacing="xl">
        <Group position="apart" py="md">
          <div>
            <Title order={1}>Fluxori Component Library</Title>
            <Text size="lg" color="dimmed">
              Documentation, examples and design patterns
            </Text>
          </div>
          
          <Badge size="xl" color="blue">v1.0.0</Badge>
        </Group>
        
        <Tabs value={activeTab} onTabChange={setActiveTab} variant="pills">
          <Tabs.List grow mb="xl">
            <Tabs.Tab 
              value="components" 
              icon={<IconComponents size={16} />}
            >
              Components
            </Tabs.Tab>
            <Tabs.Tab 
              value="animation" 
              icon={<IconAnimation size={16} />}
            >
              Animation Patterns
            </Tabs.Tab>
            <Tabs.Tab 
              value="guidelines" 
              icon={<IconPalette size={16} />}
            >
              Design Guidelines
            </Tabs.Tab>
            <Tabs.Tab 
              value="accessibility" 
              icon={<IconAccessibility size={16} />}
            >
              Accessibility
            </Tabs.Tab>
            <Tabs.Tab 
              value="code" 
              icon={<IconCode size={16} />}
            >
              Code Patterns
            </Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="components">
            <Stack spacing="xl">
              <Text>
                Explore our component library with interactive examples and usage patterns.
                Each component follows our design system and includes built-in animations
                that respect user motion preferences.
              </Text>
              
              <Grid ref={staggerRef}>
                <Grid.Col md={4}>
                  <ComponentCard
                    title="UI Components"
                    description="Basic building blocks like buttons, inputs, cards with GSAP-enhanced animations"
                    count={18}
                    icon={<IconComponents size={24} />}
                    href="/docs/components/ui"
                  />
                </Grid.Col>
                
                <Grid.Col md={4}>
                  <ComponentCard
                    title="Data Visualization"
                    description="Charts, graphs and stats with animated transitions powered by GSAP"
                    count={12}
                    icon={<IconChartBar size={24} />}
                    href="/docs/components/visualization"
                  />
                </Grid.Col>
                
                <Grid.Col md={4}>
                  <ComponentCard
                    title="AI Components"
                    description="AI-specific components with specialized animations and confidence visualization"
                    count={9}
                    icon={<IconDeviceLaptop size={24} />}
                    href="/docs/components/ai"
                  />
                </Grid.Col>
                
                <Grid.Col md={4}>
                  <ComponentCard
                    title="E-Commerce"
                    description="Specialized components for marketplaces, pricing, and product management"
                    count={15}
                    icon={<IconGitPullRequest size={24} />}
                    href="/docs/components/ecommerce"
                  />
                </Grid.Col>
                
                <Grid.Col md={4}>
                  <ComponentCard
                    title="Layout System"
                    description="Responsive grid, container and layout components with GSAP transitions"
                    count={8}
                    icon={<IconComponents size={24} />}
                    href="/docs/components/layout"
                  />
                </Grid.Col>
                
                <Grid.Col md={4}>
                  <ComponentCard
                    title="Form Components"
                    description="Interactive form elements with validation and animation feedback"
                    count={14}
                    icon={<IconComponents size={24} />}
                    href="/docs/components/form"
                  />
                </Grid.Col>
              </Grid>
              
              <Paper withBorder p="lg" radius="md">
                <Stack spacing="md">
                  <Title order={3}>Getting Started</Title>
                  <Text>
                    The Fluxori Component Library is built on top of Mantine UI, enhanced with 
                    GSAP animations and following our design system. To use these components in your
                    project, follow these steps:
                  </Text>
                  
                  <Code block>
                    {`// Import the component you need
import { BuyBoxStatusCard } from '@/components/buybox/BuyBoxStatusCard';

// Use it in your component
function MyComponent() {
  return (
    <BuyBoxStatusCard
      hasWon={true}
      currentOwner="You"
      yourPrice={24.99}
      competitorPrice={26.99}
    />
  );
}`}
                  </Code>
                  
                  <Group position="apart" mt="md">
                    <Text weight={500}>View detailed getting started guide</Text>
                    <Button
                      variant="light"
                      rightIcon={<IconArrowRight size={16} />}
                      component="a"
                      href="/docs/getting-started"
                    >
                      Read Guide
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>
          
          <Tabs.Panel value="animation">
            <Stack spacing="xl">
              <Text>
                Our animation system is built on GSAP with premium plugins and follows
                a structured motion design language. Explore our animation patterns and
                learn how to implement them in your components.
              </Text>
              
              <Grid ref={staggerRef}>
                <Grid.Col md={6}>
                  <AnimationPatternCard
                    title="Entrance Animations"
                    description="Consistent patterns for component mounting and entering viewport"
                    animationType="entrance"
                    href="/docs/animation/entrance"
                  />
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <AnimationPatternCard
                    title="State Transitions"
                    description="Smooth animations between different component states and modes"
                    animationType="transition"
                    href="/docs/animation/transitions"
                  />
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <AnimationPatternCard
                    title="Micro-interactions"
                    description="Subtle feedback animations for user interactions and hover states"
                    animationType="micro"
                    href="/docs/animation/micro-interactions"
                  />
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <AnimationPatternCard
                    title="Page Transitions"
                    description="Coordinated animations between routes with context preservation"
                    animationType="page"
                    href="/docs/animation/page-transitions"
                  />
                </Grid.Col>
              </Grid>
              
              <Paper withBorder p="lg" radius="md">
                <Stack spacing="md">
                  <Title order={3}>Animation Hooks</Title>
                  <Text>
                    We provide several React hooks that make it easy to implement our animation
                    patterns in your components:
                  </Text>
                  
                  <Grid>
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>useAnimatedMount</Title>
                        <Text size="sm">
                          Animate component entrance when it mounts
                        </Text>
                        <Code size="xs">
                          {`const ref = useAnimatedMount('fadeInUp');`}
                        </Code>
                      </Stack>
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>useStaggerAnimation</Title>
                        <Text size="sm">
                          Create staggered animations for multiple elements
                        </Text>
                        <Code size="xs">
                          {`const ref = useStaggerAnimation({ stagger: 0.05 });`}
                        </Code>
                      </Stack>
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>useAnimateOnScroll</Title>
                        <Text size="sm">
                          Trigger animations when elements enter the viewport
                        </Text>
                        <Code size="xs">
                          {`const { ref, isInView } = useAnimateOnScroll('fadeIn');`}
                        </Code>
                      </Stack>
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>useDrawSVG</Title>
                        <Text size="sm">
                          Create SVG path drawing animations
                        </Text>
                        <Code size="xs">
                          {`const ref = useDrawSVG({ duration: 1.5 });`}
                        </Code>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                  
                  <Group position="apart" mt="md">
                    <Text weight={500}>View animation hooks documentation</Text>
                    <Button
                      variant="light"
                      rightIcon={<IconArrowRight size={16} />}
                      component="a"
                      href="/docs/animation/hooks"
                    >
                      View Hooks
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>
          
          <Tabs.Panel value="guidelines">
            <Stack spacing="xl">
              <Text>
                Our design system follows a set of principles that ensure consistency, 
                accessibility, and a delightful user experience. Explore our guidelines
                to understand how to implement and extend our components.
              </Text>
              
              <Grid columns={12} ref={staggerRef}>
                <Grid.Col span={12}>
                  <Paper withBorder p="lg" radius="md">
                    <Stack spacing="lg">
                      <Title order={3}>Motion Design Principles</Title>
                      
                      <Grid>
                        <Grid.Col md={4}>
                          <Stack spacing="xs">
                            <Title order={5}>Purposeful Intelligence</Title>
                            <Text size="sm">
                              Animations communicate meaning and purpose, guiding users
                              through interfaces and providing feedback.
                            </Text>
                            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                              <li>Informative motion guides attention</li>
                              <li>Context transitions preserve understanding</li>
                              <li>Responsive feedback reinforces actions</li>
                            </ul>
                          </Stack>
                        </Grid.Col>
                        
                        <Grid.Col md={4}>
                          <Stack spacing="xs">
                            <Title order={5}>Fluid Efficiency</Title>
                            <Text size="sm">
                              Animations are smooth and efficient, optimized for performance
                              across different devices.
                            </Text>
                            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                              <li>Performance-first implementation</li>
                              <li>Natural physics and easing</li>
                              <li>Consistent timing for similar actions</li>
                              <li>Reduced motion support</li>
                            </ul>
                          </Stack>
                        </Grid.Col>
                        
                        <Grid.Col md={4}>
                          <Stack spacing="xs">
                            <Title order={5}>Precision & Accuracy</Title>
                            <Text size="sm">
                              Animations are exact and intentional with carefully calibrated
                              timing and coordination.
                            </Text>
                            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                              <li>Calibrated timing (300-500ms primary, 150-250ms micro)</li>
                              <li>Purposeful easing for different types</li>
                              <li>Coordinated sequences for related elements</li>
                              <li>Pixel-perfect execution</li>
                            </ul>
                          </Stack>
                        </Grid.Col>
                      </Grid>
                      
                      <Divider />
                      
                      <Group position="apart">
                        <Text weight={500}>View full motion design guide</Text>
                        <Button
                          variant="light"
                          rightIcon={<IconArrowRight size={16} />}
                          component="a"
                          href="/docs/guidelines/motion-design"
                        >
                          Read Guide
                        </Button>
                      </Group>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <Paper withBorder p="lg" radius="md">
                    <Stack spacing="md">
                      <Title order={3}>Color System</Title>
                      <Text size="sm">
                        Our color system is designed to be accessible, consistent, and
                        expressive. We use a core palette with semantic variations.
                      </Text>
                      
                      <Grid>
                        {['blue', 'green', 'red', 'orange', 'gray'].map((color) => (
                          <Grid.Col span={12} key={color}>
                            <Group spacing={8} noWrap>
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 4,
                                  backgroundColor: theme.colors[color][6],
                                }}
                              />
                              <Text size="sm" weight={500} transform="capitalize">
                                {color}
                              </Text>
                              <Text size="xs" color="dimmed">
                                {theme.colors[color][6]}
                              </Text>
                            </Group>
                          </Grid.Col>
                        ))}
                      </Grid>
                      
                      <Anchor href="/docs/guidelines/colors" size="sm">
                        View full color palette →
                      </Anchor>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <Paper withBorder p="lg" radius="md">
                    <Stack spacing="md">
                      <Title order={3}>Typography</Title>
                      <Text size="sm">
                        Our typography system uses a clear hierarchy with specific
                        font weights, sizes, and line heights for different purposes.
                      </Text>
                      
                      <Stack spacing={8}>
                        <Title order={1} size="h2">Heading 1</Title>
                        <Title order={2} size="h3">Heading 2</Title>
                        <Title order={3} size="h4">Heading 3</Title>
                        <Title order={4} size="h5">Heading 4</Title>
                        <Text size="md">Body text (medium)</Text>
                        <Text size="sm">Body text (small)</Text>
                        <Text size="xs">Caption text</Text>
                      </Stack>
                      
                      <Anchor href="/docs/guidelines/typography" size="sm">
                        View typography guidelines →
                      </Anchor>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
              
              <Paper withBorder p="lg" radius="md">
                <Stack spacing="md">
                  <Title order={3}>Component Design Principles</Title>
                  <Grid>
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>Consistency</Title>
                        <Text size="sm">
                          Components follow consistent patterns for props, animations,
                          and user interactions. Similar components behave similarly.
                        </Text>
                      </Stack>
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>Composability</Title>
                        <Text size="sm">
                          Components are designed to work together in various combinations
                          and can be composed to create more complex interfaces.
                        </Text>
                      </Stack>
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>Accessibility</Title>
                        <Text size="sm">
                          All components are designed with accessibility in mind,
                          following WCAG guidelines and supporting keyboard navigation.
                        </Text>
                      </Stack>
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>Responsive Design</Title>
                        <Text size="sm">
                          Components adapt to different screen sizes and device
                          capabilities, providing a consistent experience.
                        </Text>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                  
                  <Group position="apart" mt="md">
                    <Text weight={500}>View detailed design principles</Text>
                    <Button
                      variant="light"
                      rightIcon={<IconArrowRight size={16} />}
                      component="a"
                      href="/docs/guidelines/principles"
                    >
                      Read More
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>
          
          <Tabs.Panel value="accessibility">
            <Stack spacing="xl">
              <Text>
                Our components are designed to be accessible to all users, including those
                with disabilities. We follow WCAG guidelines and provide features for
                different user needs.
              </Text>
              
              <Grid ref={staggerRef}>
                <Grid.Col md={6}>
                  <Paper withBorder p="lg" radius="md" h="100%">
                    <Stack spacing="md">
                      <Title order={3}>Reduced Motion</Title>
                      <Text size="sm">
                        All animations respect the user's motion preferences, with three
                        levels of motion intensity that can be configured:
                      </Text>
                      
                      <Stack spacing={8}>
                        <Group noWrap>
                          <Badge color="green">Full</Badge>
                          <Text size="sm">All animations at full intensity</Text>
                        </Group>
                        <Group noWrap>
                          <Badge color="blue">Moderate</Badge>
                          <Text size="sm">Reduced animation intensity and duration</Text>
                        </Group>
                        <Group noWrap>
                          <Badge color="orange">Minimal</Badge>
                          <Text size="sm">Essential animations only, minimal motion</Text>
                        </Group>
                      </Stack>
                      
                      <Text size="sm">
                        Our <Code>useMotionPreference</Code> hook detects system settings
                        and allows users to customize their preference.
                      </Text>
                      
                      <Anchor href="/docs/accessibility/reduced-motion" size="sm">
                        View reduced motion implementation →
                      </Anchor>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <Paper withBorder p="lg" radius="md" h="100%">
                    <Stack spacing="md">
                      <Title order={3}>Keyboard Navigation</Title>
                      <Text size="sm">
                        All interactive components support keyboard navigation and follow
                        standard patterns for keyboard shortcuts and focus management.
                      </Text>
                      
                      <Stack spacing={8}>
                        <Group noWrap>
                          <Code>Tab</Code>
                          <Text size="sm">Navigate between interactive elements</Text>
                        </Group>
                        <Group noWrap>
                          <Code>Enter/Space</Code>
                          <Text size="sm">Activate buttons and controls</Text>
                        </Group>
                        <Group noWrap>
                          <Code>Escape</Code>
                          <Text size="sm">Close modals, dropdowns, and menus</Text>
                        </Group>
                        <Group noWrap>
                          <Code>Arrow Keys</Code>
                          <Text size="sm">Navigate within components like tabs, menus</Text>
                        </Group>
                      </Stack>
                      
                      <Text size="sm">
                        We use visible focus indicators and proper focus management for
                        complex components and modal dialogs.
                      </Text>
                      
                      <Anchor href="/docs/accessibility/keyboard" size="sm">
                        View keyboard navigation guidelines →
                      </Anchor>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <Paper withBorder p="lg" radius="md" h="100%">
                    <Stack spacing="md">
                      <Title order={3}>Screen Reader Support</Title>
                      <Text size="sm">
                        Components include proper ARIA attributes and follow semantic HTML
                        practices to ensure screen reader compatibility.
                      </Text>
                      
                      <Stack spacing={8}>
                        <Text size="sm">
                          <strong>Proper Labeling:</strong> All interactive elements have
                          accessible labels and descriptions.
                        </Text>
                        <Text size="sm">
                          <strong>ARIA Attributes:</strong> Components use appropriate ARIA
                          roles, states, and properties.
                        </Text>
                        <Text size="sm">
                          <strong>Semantic HTML:</strong> We use semantic HTML elements
                          whenever possible.
                        </Text>
                        <Text size="sm">
                          <strong>Announcements:</strong> Dynamic content changes are announced
                          to screen readers.
                        </Text>
                      </Stack>
                      
                      <Anchor href="/docs/accessibility/screen-readers" size="sm">
                        View screen reader guidelines →
                      </Anchor>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <Paper withBorder p="lg" radius="md" h="100%">
                    <Stack spacing="md">
                      <Title order={3}>Color & Contrast</Title>
                      <Text size="sm">
                        Our color system ensures sufficient contrast ratios and does not
                        rely solely on color to convey meaning.
                      </Text>
                      
                      <Stack spacing={8}>
                        <Text size="sm">
                          <strong>Contrast Ratios:</strong> Text meets WCAG AA standards
                          with at least 4.5:1 contrast against backgrounds.
                        </Text>
                        <Text size="sm">
                          <strong>Color Independence:</strong> Information is conveyed using
                          multiple cues, not just color.
                        </Text>
                        <Text size="sm">
                          <strong>High Contrast Mode:</strong> Components are tested in high
                          contrast mode for Windows users.
                        </Text>
                        <Text size="sm">
                          <strong>Focus Indicators:</strong> Visible focus indicators with
                          sufficient contrast.
                        </Text>
                      </Stack>
                      
                      <Anchor href="/docs/accessibility/color-contrast" size="sm">
                        View color accessibility guidelines →
                      </Anchor>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
              
              <Paper withBorder p="lg" radius="md">
                <Stack spacing="md">
                  <Title order={3}>Accessibility Testing & Compliance</Title>
                  <Text>
                    We test our components against WCAG 2.1 AA standards using both automated
                    and manual testing methods. Our accessibility testing process includes:
                  </Text>
                  
                  <Grid>
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>Automated Testing</Title>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                          <li>Axe DevTools for automated compliance checks</li>
                          <li>Lighthouse for performance and accessibility audits</li>
                          <li>ESLint accessibility plugin for code-level checks</li>
                          <li>Contrast ratio validation tools</li>
                        </ul>
                      </Stack>
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>Manual Testing</Title>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                          <li>Keyboard navigation testing</li>
                          <li>Screen reader testing with NVDA, JAWS, and VoiceOver</li>
                          <li>Testing with various motion settings</li>
                          <li>High contrast mode testing</li>
                          <li>Testing with zoom and magnification</li>
                        </ul>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                  
                  <Group position="apart" mt="md">
                    <Text weight={500}>View accessibility compliance report</Text>
                    <Button
                      variant="light"
                      rightIcon={<IconArrowRight size={16} />}
                      component="a"
                      href="/docs/accessibility/compliance"
                    >
                      View Report
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>
          
          <Tabs.Panel value="code">
            <Stack spacing="xl">
              <Text>
                Our component library follows consistent code patterns and best practices.
                Explore our code guidelines to understand how components are structured
                and how to create new ones.
              </Text>
              
              <Grid ref={staggerRef}>
                <Grid.Col md={6}>
                  <Paper withBorder p="lg" radius="md" h="100%">
                    <Stack spacing="md">
                      <Title order={3}>Component Structure</Title>
                      <Text size="sm">
                        All components follow a consistent structure with proper TypeScript
                        typing, consistent props patterns, and clear organization.
                      </Text>
                      
                      <ScrollArea h={280}>
                        <Code block>
{`import React, { useEffect, useRef } from 'react';
import { Paper, Group, Text, Stack } from '@mantine/core';
import { useAnimatedMount } from '@/hooks/useAnimation';
import gsap from 'gsap';

export interface ComponentNameProps {
  /** Description of the prop */
  mainProp: string;
  /** Optional description with default */
  optionalProp?: number;
  /** Description of callback prop */
  onAction?: (value: string) => void;
  /** Custom style class */
  className?: string;
}

/**
 * Component description with usage information
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  mainProp,
  optionalProp = 100,
  onAction,
  className
}) => {
  const containerRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Animation or other side effects
  useEffect(() => {
    if (!elementRef.current) return;
    
    // Create animation with GSAP
    const animation = gsap.to(elementRef.current, {
      // animation properties
    });
    
    return () => {
      animation.kill();
    };
  }, [mainProp]);
  
  // Helper function for internal logic
  const handleInternalEvent = () => {
    if (onAction) {
      onAction(mainProp);
    }
  };
  
  return (
    <Paper ref={containerRef} className={className}>
      <Stack spacing="md">
        <Group position="apart">
          <Text>{mainProp}</Text>
          <div ref={elementRef}>
            {/* Component content */}
          </div>
        </Group>
      </Stack>
    </Paper>
  );
};

export default ComponentName;`}
                        </Code>
                      </ScrollArea>
                      
                      <Text size="sm">
                        This structure ensures consistent props definitions, proper typing,
                        clear documentation, and organized animations.
                      </Text>
                      
                      <Anchor href="/docs/code/component-structure" size="sm">
                        View component structure guide →
                      </Anchor>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <Paper withBorder p="lg" radius="md" h="100%">
                    <Stack spacing="md">
                      <Title order={3}>Animation Patterns</Title>
                      <Text size="sm">
                        We've standardized our GSAP animation patterns into reusable hooks
                        and utilities that make implementing animations consistent.
                      </Text>
                      
                      <ScrollArea h={280}>
                        <Code block>
{`// Example 1: Component Mount Animation
const containerRef = useAnimatedMount('fadeInUp', { 
  duration: 0.5,
  delay: 0.2 
});

// Example 2: Staggered Children Animation
const listRef = useStaggerAnimation({
  stagger: 0.05,
  duration: 0.4,
  y: 10
});

// Example 3: Animate Element on Click
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
      ease: 'back.out(1.5)'
    });
};

// Example 4: SVG Path Animation
const svgRef = useDrawSVG({
  duration: 1.5,
  ease: 'power2.inOut'
});

// Example 5: Scroll-Triggered Animation
const { ref, isInView } = useAnimateOnScroll('fadeIn', {
  threshold: 0.3,
  start: 'top 80%',
  end: 'bottom 20%'
});`}
                        </Code>
                      </ScrollArea>
                      
                      <Text size="sm">
                        These patterns ensure consistent animation behavior across components
                        while allowing flexibility for specific needs.
                      </Text>
                      
                      <Anchor href="/docs/code/animation-patterns" size="sm">
                        View animation code patterns →
                      </Anchor>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <Paper withBorder p="lg" radius="md" h="100%">
                    <Stack spacing="md">
                      <Title order={3}>Type Definitions</Title>
                      <Text size="sm">
                        Our component library uses TypeScript for type safety. We follow
                        consistent patterns for defining props, interfaces, and types.
                      </Text>
                      
                      <ScrollArea h={240}>
                        <Code block>
{`// Component Props Interface
export interface ComponentNameProps {
  /** Required prop with documentation */
  requiredProp: string;
  
  /** Optional prop with default value */
  optionalProp?: number;
  
  /** Callback function type */
  onAction?: (value: string) => void;
  
  /** Union type for limited options */
  variant?: 'default' | 'primary' | 'secondary';
  
  /** Boolean flag */
  disabled?: boolean;
  
  /** Custom class name */
  className?: string;
}

// Data Model Types
export interface DataModel {
  id: string;
  name: string;
  value: number;
  status: DataStatus;
  metadata?: Record<string, any>;
}

export type DataStatus = 'active' | 'inactive' | 'pending';

// Enumerated Values
export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc'
}

// Generic Types
export type SelectOption<T> = {
  label: string;
  value: T;
  disabled?: boolean;
};`}
                        </Code>
                      </ScrollArea>
                      
                      <Text size="sm">
                        Consistent type definitions make components more maintainable,
                        provide better developer experience, and prevent bugs.
                      </Text>
                      
                      <Anchor href="/docs/code/typescript-patterns" size="sm">
                        View TypeScript patterns guide →
                      </Anchor>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <Paper withBorder p="lg" radius="md" h="100%">
                    <Stack spacing="md">
                      <Title order={3}>Testing Patterns</Title>
                      <Text size="sm">
                        Our components include comprehensive tests to ensure functionality,
                        accessibility, and animation behavior.
                      </Text>
                      
                      <ScrollArea h={240}>
                        <Code block>
{`import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly with required props', () => {
    render(<ComponentName mainProp="Test Value" />);
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });
  
  it('applies optional props correctly', () => {
    render(
      <ComponentName 
        mainProp="Test" 
        optionalProp={200}
      />
    );
    
    // Test that optional prop is applied
  });
  
  it('calls onAction when triggered', () => {
    const mockHandler = jest.fn();
    render(
      <ComponentName 
        mainProp="Test" 
        onAction={mockHandler} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalledWith('Test');
  });
  
  it('has proper accessibility attributes', () => {
    render(<ComponentName mainProp="Test" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });
}):`}
                        </Code>
                      </ScrollArea>
                      
                      <Text size="sm">
                        Our testing approach ensures components work correctly, maintain
                        accessibility, and provide a consistent user experience.
                      </Text>
                      
                      <Anchor href="/docs/code/testing-patterns" size="sm">
                        View testing guidelines →
                      </Anchor>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
              
              <Paper withBorder p="lg" radius="md">
                <Stack spacing="md">
                  <Title order={3}>Creating New Components</Title>
                  <Text>
                    When creating new components for the library, follow these guidelines
                    to ensure consistency and quality:
                  </Text>
                  
                  <Grid>
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>Component Checklist</Title>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                          <li>Follow the standard component structure</li>
                          <li>Use proper TypeScript typing for props</li>
                          <li>Document props with JSDoc comments</li>
                          <li>Include a component description</li>
                          <li>Implement animations using our hooks</li>
                          <li>Support responsive layouts</li>
                          <li>Ensure accessibility compliance</li>
                          <li>Write comprehensive tests</li>
                        </ul>
                      </Stack>
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <Stack spacing="xs">
                        <Title order={5}>Tools & Resources</Title>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                          <li>Component generator script</li>
                          <li>Storybook for component development</li>
                          <li>Accessibility testing tools</li>
                          <li>Animation debugging utilities</li>
                          <li>Performance testing tools</li>
                          <li>Component template repository</li>
                        </ul>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                  
                  <Group position="apart" mt="md">
                    <Text weight={500}>View component creation guide</Text>
                    <Button
                      variant="light"
                      rightIcon={<IconArrowRight size={16} />}
                      component="a"
                      href="/docs/code/creating-components"
                    >
                      Read Guide
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}

// Helper component for component category cards
function ComponentCard({ 
  title, 
  description, 
  count, 
  icon, 
  href 
}: { 
  title: string; 
  description: string; 
  count: number; 
  icon: React.ReactNode;
  href: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Add hover animation
  useEffect(() => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -5,
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        duration: 0.2,
        ease: 'power2.out'
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        duration: 0.2,
        ease: 'power2.out'
      });
    };
    
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return (
    <Paper 
      ref={cardRef}
      withBorder 
      p="lg" 
      radius="md" 
      component="a"
      href={href}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <Stack spacing="sm" style={{ flex: 1 }}>
        <Group position="apart" align="flex-start">
          <Group spacing="sm">
            {icon}
            <Title order={3}>{title}</Title>
          </Group>
          <Badge size="lg">{count}</Badge>
        </Group>
        <Text>{description}</Text>
        <Text color="blue" size="sm" style={{ marginTop: 'auto' }}>
          View documentation →
        </Text>
      </Stack>
    </Paper>
  );
}

// Helper component for animation pattern cards
function AnimationPatternCard({ 
  title, 
  description, 
  animationType,
  href 
}: { 
  title: string; 
  description: string; 
  animationType: 'entrance' | 'transition' | 'micro' | 'page';
  href: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<HTMLDivElement>(null);
  
  // Add hover animation and animation demo
  useEffect(() => {
    if (!cardRef.current || !animationRef.current) return;
    
    const card = cardRef.current;
    const animationElement = animationRef.current;
    let animation: gsap.core.Timeline | null = null;
    
    // Create appropriate animation based on type
    switch (animationType) {
      case 'entrance':
        animation = gsap.timeline({ paused: true })
          .fromTo(animationElement, 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
          );
        break;
      case 'transition':
        animation = gsap.timeline({ paused: true })
          .to(animationElement, { x: 20, duration: 0.3, ease: 'power1.inOut' })
          .to(animationElement, { opacity: 0, duration: 0.2 }, 0.1)
          .set(animationElement, { x: -20 })
          .to(animationElement, { opacity: 1, duration: 0.2 })
          .to(animationElement, { x: 0, duration: 0.3, ease: 'power1.out' });
        break;
      case 'micro':
        animation = gsap.timeline({ paused: true })
          .to(animationElement, { 
            scale: 1.1, 
            duration: 0.15, 
            ease: 'power1.out' 
          })
          .to(animationElement, { 
            scale: 1, 
            duration: 0.15, 
            ease: 'power3.out' 
          });
        break;
      case 'page':
        animation = gsap.timeline({ paused: true })
          .fromTo(animationElement, 
            { opacity: 0, scale: 0.95 }, 
            { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
          );
        break;
    }
    
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -5,
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        duration: 0.2,
        ease: 'power2.out'
      });
      
      if (animation) {
        animation.restart();
      }
    };
    
    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        duration: 0.2,
        ease: 'power2.out'
      });
    };
    
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      if (animation) {
        animation.kill();
      }
    };
  }, [animationType]);
  
  return (
    <Paper 
      ref={cardRef}
      withBorder 
      p="lg" 
      radius="md" 
      component="a"
      href={href}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <Stack spacing="md" style={{ flex: 1 }}>
        <div
          ref={animationRef}
          style={{
            padding: '8px 12px',
            background: 'rgba(0, 120, 255, 0.1)',
            borderRadius: '4px',
            display: 'inline-block',
            width: 'fit-content'
          }}
        >
          <Title order={3}>{title}</Title>
        </div>
        
        <Text>{description}</Text>
        
        <Text size="sm" color="dimmed" style={{ marginTop: 'auto' }}>
          Hover to see animation demo
        </Text>
        
        <Text color="blue" size="sm">
          View pattern details →
        </Text>
      </Stack>
    </Paper>
  );
}