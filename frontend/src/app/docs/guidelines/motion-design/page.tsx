'use client';

import React, { useEffect, useRef } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Grid, 
  Paper, 
  Button, 
  Group, 
  Stack, 
  useMantineTheme,
  Timeline,
  Divider,
  Box,
  Code,
  ScrollArea,
  ThemeIcon,
  Blockquote,
  List,
  Anchor
} from '@mantine/core';
import { 
  IconArrowLeft,
  IconBrandGithub,
  IconPlus,
  IconCheck,
  IconInfoCircle,
  IconX
} from '@tabler/icons-react';
import { useAnimatedMount, useStaggerAnimation } from '@/hooks/useAnimation';
import gsap from 'gsap';

export default function MotionDesignGuidePage() {
  const theme = useMantineTheme();
  const containerRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const staggerRef = useStaggerAnimation({ stagger: 0.05 });
  
  return (
    <Container fluid px="md" pb="xl" ref={containerRef}>
      <Stack spacing="xl">
        <Group position="apart" py="md">
          <div>
            <Title order={1}>Motion Design Guide</Title>
            <Text size="lg" color="dimmed">
              Principles and guidelines for animation in Fluxori
            </Text>
          </div>
          
          <Button 
            leftIcon={<IconArrowLeft size={16} />}
            variant="light" 
            component="a" 
            href="/docs/guidelines"
          >
            Back to Guidelines
          </Button>
        </Group>
        
        <Grid>
          <Grid.Col md={8}>
            <Paper withBorder p="xl" radius="md">
              <Stack spacing="lg">
                <Title order={2}>Core Principles</Title>
                
                <Text>
                  Our motion design language is built on three core principles that guide all animations
                  in Fluxori. These principles ensure that animations are purposeful, efficient, and precise.
                </Text>
                
                <Grid ref={staggerRef}>
                  <Grid.Col md={6}>
                    <MotionPrinciple
                      title="Purposeful Intelligence"
                      description="Animations communicate meaning and intention, guiding users through the interface and providing feedback."
                      points={[
                        "Informative Motion guides attention and communicates status",
                        "Context Transitions preserve understanding between states",
                        "Responsive Feedback provides immediate visual responses",
                        "Hierarchy of Motion gives priority to important elements"
                      ]}
                    />
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <MotionPrinciple
                      title="Fluid Efficiency"
                      description="Animations are smooth and efficient, optimized for performance across devices."
                      points={[
                        "Performance-First implementation for minimal CPU/GPU impact",
                        "Natural Physics with appropriate easing and momentum",
                        "Consistent Timing for similar actions",
                        "Reduced Motion Support respects user preferences"
                      ]}
                    />
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <MotionPrinciple
                      title="Precision & Accuracy"
                      description="Animations are exact and intentional with carefully calibrated timing."
                      points={[
                        "Calibrated Timing (300-500ms primary, 150-250ms micro)",
                        "Purposeful Easing appropriate for different animation types",
                        "Coordinated Sequences for related elements",
                        "Pixel-Perfect Motion with no unintended artifacts"
                      ]}
                    />
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <MotionPrinciple
                      title="Accessibility Focus"
                      description="Animations respect user needs and preferences for motion and interactions."
                      points={[
                        "Motion Preferences respected at system and user levels",
                        "Alternative Feedback for users with reduced motion",
                        "Tiered Motion Intensity with customizable levels",
                        "Non-essential motion can be reduced or disabled"
                      ]}
                    />
                  </Grid.Col>
                </Grid>
                
                <Divider my="lg" />
                
                <Title order={2}>Animation Timing</Title>
                
                <Text mb="md">
                  Timing is critical for animations to feel natural and consistent. We follow these
                  guidelines for animation durations across the application.
                </Text>
                
                <Grid>
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Primary Transitions</Title>
                        <Text size="sm">
                          Major UI transitions, page changes, and modal dialogs
                        </Text>
                        <TimingExample
                          duration={0.5}
                          label="400-600ms"
                          description="Page transitions, modal dialogs, major UI state changes"
                        />
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Secondary Transitions</Title>
                        <Text size="sm">
                          Section expansions, tab switches, and panel changes
                        </Text>
                        <TimingExample
                          duration={0.35}
                          label="300-400ms"
                          description="Tab switches, expansion panels, menu opening"
                        />
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Micro-interactions</Title>
                        <Text size="sm">
                          Button presses, hover effects, and small UI feedbacks
                        </Text>
                        <TimingExample
                          duration={0.2}
                          label="150-250ms"
                          description="Button clicks, hover effects, small UI feedback"
                        />
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Stagger Amounts</Title>
                        <Text size="sm">
                          Delay between animated elements in lists or grids
                        </Text>
                        <StaggerExample
                          stagger={0.05}
                          label="30-80ms"
                          description="Lists, grids, multiple related elements"
                        />
                      </Stack>
                    </Paper>
                  </Grid.Col>
                </Grid>
                
                <Divider my="lg" />
                
                <Title order={2}>Easing Functions</Title>
                
                <Text mb="md">
                  Easing functions define how animations accelerate and decelerate. We use specific
                  easing functions for different animation types to create natural and pleasing motion.
                </Text>
                
                <Grid>
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Standard Transitions</Title>
                        <Code>power2.out</Code>
                        <Text size="sm">
                          For most UI transitions, creating a natural deceleration at the end
                        </Text>
                        <EasingExample
                          ease="power2.out"
                          label="power2.out"
                          description="Most UI transitions, entrances, and reveals"
                        />
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Emphasis Animations</Title>
                        <Code>back.out(1.7)</Code>
                        <Text size="sm">
                          For animations that need extra emphasis or attention-grabbing qualities
                        </Text>
                        <EasingExample
                          ease="back.out(1.7)"
                          label="back.out(1.7)"
                          description="Call-to-action elements, important notifications"
                        />
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Subtle Effects</Title>
                        <Code>power1.inOut</Code>
                        <Text size="sm">
                          For subtle animations that should feel gentle and unobtrusive
                        </Text>
                        <EasingExample
                          ease="power1.inOut"
                          label="power1.inOut"
                          description="Background effects, color changes, opacity transitions"
                        />
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Bouncy Effects</Title>
                        <Code>elastic.out(1, 0.3)</Code>
                        <Text size="sm">
                          For playful animations with a bouncy, elastic quality
                        </Text>
                        <EasingExample
                          ease="elastic.out(1, 0.3)"
                          label="elastic.out(1, 0.3)"
                          description="Success states, celebratory animations, certain micro-interactions"
                        />
                      </Stack>
                    </Paper>
                  </Grid.Col>
                </Grid>
                
                <Divider my="lg" />
                
                <Title order={2}>Animation Choreography</Title>
                
                <Text mb="md">
                  Animation choreography defines patterns for how elements should animate in different contexts.
                  These patterns create predictable and pleasing motion experiences.
                </Text>
                
                <Grid>
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Enter Animations</Title>
                        <Text size="sm">
                          Elements entering the viewport or being added to the DOM
                        </Text>
                        <Code block>
{`// Fade + subtle movement
gsap.fromTo(element,
  { opacity: 0, y: 20 },
  { 
    opacity: 1, 
    y: 0, 
    duration: 0.5, 
    ease: 'power2.out' 
  }
);`}
                        </Code>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Exit Animations</Title>
                        <Text size="sm">
                          Elements leaving the viewport or being removed from the DOM
                        </Text>
                        <Code block>
{`// Fade out with subtle movement
gsap.to(element, { 
  opacity: 0, 
  y: -10, 
  duration: 0.3, 
  ease: 'power1.in'
});`}
                        </Code>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Focus Animations</Title>
                        <Text size="sm">
                          Highlighting elements that need attention
                        </Text>
                        <Code block>
{`// Scale + highlight
gsap.timeline()
  .to(element, {
    scale: 1.05,
    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.5)',
    duration: 0.2,
    ease: 'power1.out'
  })
  .to(element, {
    scale: 1,
    duration: 0.3,
    ease: 'power2.out'
  }, '+=0.1');`}
                        </Code>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Error States</Title>
                        <Text size="sm">
                          Indicating errors or invalid inputs
                        </Text>
                        <Code block>
{`// Shake + highlight
gsap.timeline()
  .to(element, {
    x: -6,
    duration: 0.05,
    ease: 'power1.inOut'
  })
  .to(element, {
    x: 6,
    duration: 0.1,
    ease: 'power1.inOut'
  })
  .to(element, {
    x: -6,
    duration: 0.1,
    ease: 'power1.inOut'
  })
  .to(element, {
    x: 0,
    duration: 0.05,
    ease: 'power1.inOut'
  });`}
                        </Code>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                </Grid>
                
                <Divider my="lg" />
                
                <Title order={2}>Motion Preference System</Title>
                
                <Text mb="md">
                  We respect user motion preferences with a tiered system that allows for different
                  levels of animation intensity. This system is implemented with the <Code>useMotionPreference</Code> hook.
                </Text>
                
                <Grid>
                  <Grid.Col md={4}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Group spacing={4}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              background: theme.colors.green[6] 
                            }} 
                          />
                          <Title order={4}>Full Motion</Title>
                        </Group>
                        <Text size="sm">
                          All animations at full intensity and duration
                        </Text>
                        <List size="sm" spacing="xs" mt="xs">
                          <List.Item>Complex entrance animations</List.Item>
                          <List.Item>Staggered sequences</List.Item>
                          <List.Item>Path animations and SVG drawing</List.Item>
                          <List.Item>Parallax and scroll effects</List.Item>
                          <List.Item>Full micro-interactions</List.Item>
                        </List>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={4}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Group spacing={4}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              background: theme.colors.blue[6] 
                            }} 
                          />
                          <Title order={4}>Moderate Motion</Title>
                        </Group>
                        <Text size="sm">
                          Reduced animation intensity and duration
                        </Text>
                        <List size="sm" spacing="xs" mt="xs">
                          <List.Item>Simplified entrance animations</List.Item>
                          <List.Item>Limited staggering effects</List.Item>
                          <List.Item>Static SVG display instead of drawing</List.Item>
                          <List.Item>No parallax effects</List.Item>
                          <List.Item>Subtle micro-interactions only</List.Item>
                        </List>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={4}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Group spacing={4}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              background: theme.colors.orange[6] 
                            }} 
                          />
                          <Title order={4}>Minimal Motion</Title>
                        </Group>
                        <Text size="sm">
                          Essential animations only, minimal motion
                        </Text>
                        <List size="sm" spacing="xs" mt="xs">
                          <List.Item>Simple opacity fade transitions</List.Item>
                          <List.Item>No movement animations</List.Item>
                          <List.Item>Static display of elements</List.Item>
                          <List.Item>No scroll-triggered animations</List.Item>
                          <List.Item>Alternative non-motion feedback</List.Item>
                        </List>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                </Grid>
                
                <Blockquote
                  mt="md"
                  icon={<IconInfoCircle size={24} />}
                  iconSize={32}
                  color="blue"
                >
                  <Text size="sm">
                    The motion preference system checks system settings (<Code>prefers-reduced-motion</Code>)
                    by default, but also allows users to customize their preference in the application
                    settings. If the system setting is "reduce", we default to "minimal" but users can
                    still choose to increase motion if they prefer.
                  </Text>
                </Blockquote>
                
                <Divider my="lg" />
                
                <Title order={2}>Performance Considerations</Title>
                
                <Text mb="md">
                  Animation performance is critical for a smooth user experience. We follow these guidelines
                  to ensure animations perform well across devices.
                </Text>
                
                <Grid>
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Optimized Properties</Title>
                        <Text size="sm">
                          Prioritize animating these properties for best performance:
                        </Text>
                        <List size="sm" spacing="xs" icon={<IconCheck size={16} color={theme.colors.green[6]} />}>
                          <List.Item>
                            <Code>transform</Code> (translate, scale, rotate)
                          </List.Item>
                          <List.Item>
                            <Code>opacity</Code>
                          </List.Item>
                        </List>
                        <Text size="sm" mt="sm">
                          Avoid animating these properties when possible:
                        </Text>
                        <List size="sm" spacing="xs" icon={<IconX size={16} color={theme.colors.red[6]} />}>
                          <List.Item>
                            <Code>width/height</Code> (use <Code>scaleX/scaleY</Code> instead)
                          </List.Item>
                          <List.Item>
                            <Code>top/left/right/bottom</Code> (use <Code>transform</Code> instead)
                          </List.Item>
                          <List.Item>
                            <Code>margin/padding</Code>
                          </List.Item>
                        </List>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>FLIP Technique</Title>
                        <Text size="sm">
                          Use the FLIP technique (First, Last, Invert, Play) for animating layout changes.
                          This technique measures the start and end positions, then animates between them
                          efficiently using transforms.
                        </Text>
                        <Code block>
{`// FLIP animation example
// 1. First: measure element's starting position
const first = element.getBoundingClientRect();

// 2. Last: apply the new state that changes position
element.classList.add('new-state');

// 3. Invert: calculate the difference and apply transform
const last = element.getBoundingClientRect();
const deltaX = first.left - last.left;
const deltaY = first.top - last.top;

// Apply transform to make it appear in original position
gsap.set(element, { 
  x: deltaX, 
  y: deltaY 
});

// 4. Play: animate to final position
gsap.to(element, {
  x: 0,
  y: 0,
  duration: 0.4,
  ease: 'power2.out'
});`}
                        </Code>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Hardware Acceleration</Title>
                        <Text size="sm">
                          Use hardware acceleration for complex animations by forcing GPU rendering:
                        </Text>
                        <Code block>
{`// Force GPU rendering with will-change
.animated-element {
  will-change: transform, opacity;
}

// Only use during animation to avoid memory issues
// Add class before animation, remove after
element.classList.add('animating');
gsap.to(element, {
  // animation properties
  onComplete: () => element.classList.remove('animating')
});`}
                        </Code>
                        <Text size="sm" color="dimmed">
                          Note: Use <Code>will-change</Code> sparingly as it can consume GPU memory.
                        </Text>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col md={6}>
                    <Paper withBorder p="md" radius="md">
                      <Stack spacing="sm">
                        <Title order={4}>Device Capability Detection</Title>
                        <Text size="sm">
                          Adapt animation complexity based on device capabilities:
                        </Text>
                        <Code block>
{`// Check device capability
const isLowPowerDevice = () => {
  // Check for low-end devices
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    navigator.hardwareConcurrency <= 4 ||
    // More checks can be added here
    false
  );
};

// Use simpler animations on low-power devices
const animationPreset = isLowPowerDevice() 
  ? 'simple' 
  : 'complex';

// Apply appropriate animation
if (animationPreset === 'simple') {
  // Simple fade animation
  gsap.fromTo(element, 
    { opacity: 0 }, 
    { opacity: 1, duration: 0.3 }
  );
} else {
  // More complex animation
  gsap.fromTo(element, 
    { opacity: 0, y: 20, scale: 0.95 }, 
    { opacity: 1, y: 0, scale: 1, duration: 0.5 }
  );
}`}
                        </Code>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Grid.Col>
          
          <Grid.Col md={4}>
            <div style={{ position: 'sticky', top: 20 }}>
              <Paper withBorder p="xl" radius="md">
                <Stack spacing="md">
                  <Title order={3}>On This Page</Title>
                  
                  <List spacing="xs">
                    <List.Item>
                      <Anchor href="#core-principles">Core Principles</Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="#animation-timing">Animation Timing</Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="#easing-functions">Easing Functions</Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="#animation-choreography">Animation Choreography</Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="#motion-preference-system">Motion Preference System</Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="#performance-considerations">Performance Considerations</Anchor>
                    </List.Item>
                  </List>
                </Stack>
              </Paper>
              
              <Paper withBorder p="xl" radius="md" mt="xl">
                <Stack spacing="md">
                  <Title order={3}>Resources</Title>
                  
                  <List spacing="xs">
                    <List.Item>
                      <Anchor href="https://greensock.com/docs/" target="_blank">
                        GSAP Documentation
                      </Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="https://cubic-bezier.com/" target="_blank">
                        Cubic Bezier Generator
                      </Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="https://motion.dev/" target="_blank">
                        Motion One Documentation
                      </Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="https://web.dev/articles/prefers-reduced-motion" target="_blank">
                        Prefers-Reduced-Motion Guide
                      </Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="https://www.joshwcomeau.com/animation/css-transitions/" target="_blank">
                        Interactive Guide to CSS Transitions
                      </Anchor>
                    </List.Item>
                  </List>
                  
                  <Button
                    leftIcon={<IconBrandGithub size={16} />}
                    variant="default"
                    component="a"
                    href="/docs/animation/hooks"
                  >
                    Animation Hooks Documentation
                  </Button>
                </Stack>
              </Paper>
              
              <Paper withBorder p="xl" radius="md" mt="xl">
                <Stack spacing="md">
                  <Title order={3}>Animation Types</Title>
                  
                  <List spacing="xs">
                    <List.Item>
                      <Anchor href="/docs/animation/entrance">
                        Entrance Animations
                      </Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="/docs/animation/transitions">
                        State Transitions
                      </Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="/docs/animation/micro-interactions">
                        Micro-interactions
                      </Anchor>
                    </List.Item>
                    <List.Item>
                      <Anchor href="/docs/animation/page-transitions">
                        Page Transitions
                      </Anchor>
                    </List.Item>
                  </List>
                </Stack>
              </Paper>
            </div>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

// Helper components
function MotionPrinciple({ 
  title, 
  description, 
  points 
}: { 
  title: string; 
  description: string; 
  points: string[] 
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Add hover animation
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const handleMouseEnter = () => {
      gsap.to(container, {
        y: -5,
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(container, {
        y: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return (
    <Paper
      withBorder
      p="lg"
      radius="md"
      ref={containerRef}
      sx={{
        height: '100%',
        transition: 'transform 0.3s, box-shadow 0.3s',
      }}
    >
      <Stack spacing="xs">
        <Title order={3}>{title}</Title>
        <Text size="sm">{description}</Text>
        <List size="sm" spacing="xs" mt="xs">
          {points.map((point, index) => (
            <List.Item key={index}>{point}</List.Item>
          ))}
        </List>
      </Stack>
    </Paper>
  );
}

function TimingExample({ 
  duration, 
  label, 
  description 
}: { 
  duration: number; 
  label: string; 
  description: string 
}) {
  const ballRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  
  const playAnimation = () => {
    if (!ballRef.current || !lineRef.current) return;
    
    // Reset
    gsap.set(ballRef.current, { left: 0 });
    gsap.set(lineRef.current, { width: 0 });
    
    // Animate
    gsap.to(ballRef.current, {
      left: 'calc(100% - 24px)',
      duration,
      ease: 'power2.out'
    });
    
    gsap.to(lineRef.current, {
      width: '100%',
      duration,
      ease: 'none'
    });
  };
  
  // Play animation on mount
  useEffect(() => {
    playAnimation();
    
    // Play animation on click anywhere in the container
    const container = ballRef.current?.parentElement;
    if (container) {
      container.addEventListener('click', playAnimation);
      
      return () => {
        container.removeEventListener('click', playAnimation);
      };
    }
  }, []);
  
  return (
    <div>
      <Group position="apart" mb="xs">
        <Text size="sm" weight={500}>{label}</Text>
        <Text size="xs" color="dimmed">{duration * 1000}ms</Text>
      </Group>
      
      <div 
        style={{ 
          position: 'relative', 
          height: 24, 
          backgroundColor: '#f1f3f5', 
          borderRadius: 12,
          marginBottom: 8,
          cursor: 'pointer'
        }}
      >
        <div 
          ref={lineRef}
          style={{ 
            position: 'absolute',
            top: 11,
            left: 0,
            height: 2,
            backgroundColor: '#4dabf7',
            width: 0
          }}
        />
        <div 
          ref={ballRef}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: 24,
            height: 24,
            backgroundColor: '#4dabf7',
            borderRadius: '50%'
          }}
        />
      </div>
      
      <Text size="xs" color="dimmed">{description}</Text>
    </div>
  );
}

function StaggerExample({ 
  stagger, 
  label, 
  description 
}: { 
  stagger: number; 
  label: string; 
  description: string 
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const playAnimation = () => {
    if (!containerRef.current) return;
    
    const dots = containerRef.current.querySelectorAll('.stagger-dot');
    
    // Reset
    gsap.set(dots, { scale: 0 });
    
    // Animate
    gsap.to(dots, {
      scale: 1,
      duration: 0.4,
      stagger,
      ease: 'power2.out'
    });
  };
  
  // Play animation on mount
  useEffect(() => {
    playAnimation();
    
    // Play animation on click anywhere in the container
    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', playAnimation);
      
      return () => {
        container.removeEventListener('click', playAnimation);
      };
    }
  }, []);
  
  return (
    <div>
      <Group position="apart" mb="xs">
        <Text size="sm" weight={500}>{label}</Text>
        <Text size="xs" color="dimmed">{stagger * 1000}ms</Text>
      </Group>
      
      <div 
        ref={containerRef}
        style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          height: 24, 
          marginBottom: 8,
          cursor: 'pointer'
        }}
      >
        {Array(5).fill(0).map((_, i) => (
          <div
            key={i}
            className="stagger-dot"
            style={{
              width: 24,
              height: 24,
              backgroundColor: `rgba(77, 171, 247, ${1 - i * 0.15})`,
              borderRadius: '50%',
              transform: 'scale(0)'
            }}
          />
        ))}
      </div>
      
      <Text size="xs" color="dimmed">{description}</Text>
    </div>
  );
}

function EasingExample({ 
  ease, 
  label, 
  description 
}: { 
  ease: string; 
  label: string; 
  description: string 
}) {
  const ballRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  
  const playAnimation = () => {
    if (!ballRef.current || !lineRef.current) return;
    
    // Reset
    gsap.set(ballRef.current, { left: 0 });
    gsap.set(lineRef.current, { width: 0 });
    
    // Animate
    gsap.to(ballRef.current, {
      left: 'calc(100% - 24px)',
      duration: 1.5,
      ease
    });
    
    gsap.to(lineRef.current, {
      width: '100%',
      duration: 1.5,
      ease: 'none'
    });
  };
  
  // Play animation on mount
  useEffect(() => {
    playAnimation();
    
    // Play animation on click anywhere in the container
    const container = ballRef.current?.parentElement;
    if (container) {
      container.addEventListener('click', playAnimation);
      
      return () => {
        container.removeEventListener('click', playAnimation);
      };
    }
  }, []);
  
  return (
    <div>
      <Group position="apart" mb="xs">
        <Text size="sm" weight={500}>{label}</Text>
      </Group>
      
      <div 
        style={{ 
          position: 'relative', 
          height: 24, 
          backgroundColor: '#f1f3f5', 
          borderRadius: 12,
          marginBottom: 8,
          cursor: 'pointer'
        }}
      >
        <div 
          ref={lineRef}
          style={{ 
            position: 'absolute',
            top: 11,
            left: 0,
            height: 2,
            backgroundColor: '#4dabf7',
            width: 0
          }}
        />
        <div 
          ref={ballRef}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: 24,
            height: 24,
            backgroundColor: '#4dabf7',
            borderRadius: '50%'
          }}
        />
      </div>
      
      <Text size="xs" color="dimmed">{description}</Text>
    </div>
  );
}