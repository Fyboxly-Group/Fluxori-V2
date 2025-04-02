'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  Group, 
  Card, 
  Title, 
  Grid, 
  Stack, 
  Select,
  Container,
  Divider,
  Paper,
  Slider,
  Switch,
  Code,
  Tabs,
  CopyButton,
  Tooltip,
  ActionIcon,
  Badge
} from '@mantine/core';
import { 
  IconPlaylistAdd, 
  IconArrowRight, 
  IconCheck, 
  IconCopy,
  IconInfoCircle,
  IconArrowLeft,
  IconBrandGithub
} from '@tabler/icons-react';
import { PageTransition } from '@/components/PageTransition/PageTransition';
import { AdvancedPageTransition, TransitionEffect } from '@/components/PageTransition/AdvancedPageTransition';
import { useMotionPreference } from '@/hooks/useMotionPreference';

const transitionEffects = [
  { value: 'fade', label: 'Fade', description: 'Simple opacity transition' },
  { value: 'slideUp', label: 'Slide Up', description: 'Slides in from the bottom' },
  { value: 'slideDown', label: 'Slide Down', description: 'Slides in from the top' },
  { value: 'slideLeft', label: 'Slide Left', description: 'Slides in from the right' },
  { value: 'slideRight', label: 'Slide Right', description: 'Slides in from the left' },
  { value: 'scale', label: 'Scale', description: 'Scales up from a smaller size' },
  { value: 'flip', label: 'Flip', description: 'Flips in with a 3D effect' },
  { value: 'rotate', label: 'Rotate', description: 'Rotates in slightly' },
  { value: 'wipe', label: 'Wipe', description: 'Wipes in from left to right' },
  { value: 'reveal', label: 'Reveal', description: 'Reveals content with a sliding curtain' }
];

export default function AnimationGuidePage() {
  const [effect, setEffect] = useState<TransitionEffect>('fade');
  const [duration, setDuration] = useState(0.5);
  const [replay, setReplay] = useState(false);
  const [skipExit, setSkipExit] = useState(true);
  const { setMotionLevel, motionLevel } = useMotionPreference();
  const [activeTab, setActiveTab] = useState('playground');
  
  // Force component remount to replay animation
  const handleReplay = () => {
    setReplay(true);
    setTimeout(() => setReplay(false), 50);
  };
  
  // Create example code string based on current settings
  const codeExample = `
import { AdvancedPageTransition } from '@/components/PageTransition/AdvancedPageTransition';

export default function MyPage() {
  return (
    <AdvancedPageTransition
      effect="${effect}"
      duration={${duration}}
      skipExit={${skipExit}}
    >
      <div>
        {/* Your page content here */}
      </div>
    </AdvancedPageTransition>
  );
}
  `.trim();
  
  return (
    <PageTransition>
      <Container size="lg" py="xl">
        <Group position="apart" mb="xl">
          <div>
            <Title order={2} mb="xs">Page Transition Effects</Title>
            <Text color="dimmed">
              Explore enhanced page transitions for better user experience
            </Text>
          </div>
          
          <Group>
            <Button 
              variant="subtle" 
              leftIcon={<IconArrowLeft size={16} />}
              component="a"
              href="/docs/animation"
            >
              Back to Animation
            </Button>
            <Button 
              variant="light" 
              leftIcon={<IconBrandGithub size={16} />}
              component="a"
              href="/docs"
            >
              Documentation
            </Button>
          </Group>
        </Group>
        
        <Tabs value={activeTab} onTabChange={setActiveTab} mb="md">
          <Tabs.List>
            <Tabs.Tab value="playground">Interactive Playground</Tabs.Tab>
            <Tabs.Tab value="guide">Implementation Guide</Tabs.Tab>
            <Tabs.Tab value="api">API Reference</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        
        {activeTab === 'playground' && (
          <Grid gutter="xl">
            <Grid.Col md={4}>
              <Card withBorder p="lg">
                <Title order={3} mb="md">Configuration</Title>
                
                <Stack spacing="md">
                  <Select
                    label="Transition Effect"
                    description="Choose the transition animation style"
                    data={transitionEffects}
                    value={effect}
                    onChange={(value) => value && setEffect(value as TransitionEffect)}
                  />
                  
                  <Box>
                    <Text weight={500} size="sm" mb="xs">Animation Duration: {duration}s</Text>
                    <Slider
                      min={0.1}
                      max={2}
                      step={0.1}
                      value={duration}
                      onChange={setDuration}
                      marks={[
                        { value: 0.2, label: '0.2s' },
                        { value: 1, label: '1s' },
                        { value: 2, label: '2s' }
                      ]}
                    />
                  </Box>
                  
                  <Switch
                    label="Skip Exit Animation"
                    description="Only perform entrance animations"
                    checked={skipExit}
                    onChange={(event) => setSkipExit(event.currentTarget.checked)}
                  />
                  
                  <Divider />
                  
                  <Select
                    label="Motion Preference"
                    description="Change global motion setting"
                    data={[
                      { value: 'full', label: 'Full Animations' },
                      { value: 'moderate', label: 'Moderate Animations' },
                      { value: 'minimal', label: 'Minimal Animations' }
                    ]}
                    value={motionLevel}
                    onChange={(value) => value && setMotionLevel(value)}
                  />
                  
                  <Button
                    leftIcon={<IconPlaylistAdd size={16} />}
                    onClick={handleReplay}
                    mt="md"
                  >
                    Replay Animation
                  </Button>
                </Stack>
              </Card>
              
              <Card withBorder p="lg" mt="lg">
                <Title order={3} mb="md">Implementation</Title>
                <Text mb="md" size="sm">
                  Use the <Code>AdvancedPageTransition</Code> component to add animations to your pages:
                </Text>
                
                <Paper withBorder p="md" style={{ maxHeight: 250, overflow: 'auto' }}>
                  <Group position="right" mb="xs">
                    <CopyButton value={codeExample}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied' : 'Copy code'}>
                          <ActionIcon size="sm" onClick={copy}>
                            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                  <pre style={{ margin: 0 }}>
                    <code>{codeExample}</code>
                  </pre>
                </Paper>
              </Card>
            </Grid.Col>
            
            <Grid.Col md={8}>
              <Title order={3} mb="lg">Preview</Title>
              
              {!replay && (
                <Card withBorder shadow="sm" p={0} style={{ overflow: 'hidden', height: 500, position: 'relative' }}>
                  <Badge 
                    color="blue" 
                    sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      right: 16, 
                      zIndex: 10 
                    }}
                  >
                    {transitionEffects.find(e => e.value === effect)?.label || 'Custom'} Effect
                  </Badge>
                  
                  <AdvancedPageTransition
                    effect={effect}
                    duration={duration}
                    skipExit={skipExit}
                  >
                    <Box p="xl">
                      <Title order={2} mb="md">
                        {transitionEffects.find(e => e.value === effect)?.label || 'Transition'} Effect
                      </Title>
                      
                      <Text mb="xl">
                        {transitionEffects.find(e => e.value === effect)?.description || 'Custom transition effect'}
                      </Text>
                      
                      <Grid>
                        {[1, 2, 3, 4].map(i => (
                          <Grid.Col key={i} span={6}>
                            <Card withBorder p="md">
                              <Title order={4} mb="sm">Content Card {i}</Title>
                              <Text>This card is part of the animated content that transitions in and out.</Text>
                              <Button variant="light" mt="md" rightIcon={<IconArrowRight size={16} />}>
                                Learn More
                              </Button>
                            </Card>
                          </Grid.Col>
                        ))}
                      </Grid>
                    </Box>
                  </AdvancedPageTransition>
                </Card>
              )}
            </Grid.Col>
          </Grid>
        )}
        
        {activeTab === 'guide' && (
          <Stack spacing="xl">
            <Paper withBorder p="xl">
              <Title order={3} mb="md">Implementation Guide</Title>
              <Text mb="xl">
                Page transitions create visual continuity between routes and states in your application.
                They help users understand where they are in the navigation flow and provide feedback about their actions.
              </Text>
              
              <Grid>
                <Grid.Col md={4}>
                  <Card withBorder>
                    <Title order={4} mb="sm">Dashboard & Analytics</Title>
                    <Text mb="md">
                      Use the <Badge>Scale</Badge> or <Badge>Fade</Badge> effect for dashboard pages. 
                      These subtle animations don't distract from important metrics and data visualization.
                    </Text>
                    <Text size="sm" color="dimmed">
                      Recommended duration: 0.4-0.6s
                    </Text>
                  </Card>
                </Grid.Col>
                
                <Grid.Col md={4}>
                  <Card withBorder>
                    <Title order={4} mb="sm">Detail Views</Title>
                    <Text mb="md">
                      Use the <Badge>SlideLeft</Badge> or <Badge>SlideRight</Badge> effects for detail pages to create a 
                      sense of navigation depth. SlideLeft is ideal for forward navigation 
                      and SlideRight for backward.
                    </Text>
                    <Text size="sm" color="dimmed">
                      Recommended duration: 0.3-0.5s
                    </Text>
                  </Card>
                </Grid.Col>
                
                <Grid.Col md={4}>
                  <Card withBorder>
                    <Title order={4} mb="sm">Forms & Wizards</Title>
                    <Text mb="md">
                      Use the <Badge>Wipe</Badge> or <Badge>Reveal</Badge> effect for multi-step
                      forms and wizards to create a sense of progress and continuation between steps.
                    </Text>
                    <Text size="sm" color="dimmed">
                      Recommended duration: 0.5-0.8s
                    </Text>
                  </Card>
                </Grid.Col>
              </Grid>
              
              <Divider my="xl" />
              
              <Title order={4} mb="md">Best Practices</Title>
              
              <Grid>
                <Grid.Col md={6}>
                  <Stack spacing="md">
                    <Group spacing="xs" noWrap align="flex-start">
                      <IconInfoCircle size={18} style={{ marginTop: 4 }} />
                      <div>
                        <Text weight={600}>Consistency</Text>
                        <Text size="sm">
                          Use consistent transition patterns throughout your application. For example, 
                          always use the same effect for navigating between similar pages.
                        </Text>
                      </div>
                    </Group>
                    
                    <Group spacing="xs" noWrap align="flex-start">
                      <IconInfoCircle size={18} style={{ marginTop: 4 }} />
                      <div>
                        <Text weight={600}>Direction</Text>
                        <Text size="sm">
                          Use directional transitions to reinforce navigation flow. Sliding left typically 
                          indicates forward navigation, while sliding right suggests backward navigation.
                        </Text>
                      </div>
                    </Group>
                    
                    <Group spacing="xs" noWrap align="flex-start">
                      <IconInfoCircle size={18} style={{ marginTop: 4 }} />
                      <div>
                        <Text weight={600}>Performance</Text>
                        <Text size="sm">
                          Monitor performance impact of transitions, especially on lower-end devices. 
                          The component automatically optimizes for performance, but complex pages may need adjustment.
                        </Text>
                      </div>
                    </Group>
                  </Stack>
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <Stack spacing="md">
                    <Group spacing="xs" noWrap align="flex-start">
                      <IconInfoCircle size={18} style={{ marginTop: 4 }} />
                      <div>
                        <Text weight={600}>Duration</Text>
                        <Text size="sm">
                          Keep transitions between 300-800ms. Shorter for simple transitions, 
                          longer for more complex effects. Anything longer than 1 second will feel sluggish.
                        </Text>
                      </div>
                    </Group>
                    
                    <Group spacing="xs" noWrap align="flex-start">
                      <IconInfoCircle size={18} style={{ marginTop: 4 }} />
                      <div>
                        <Text weight={600}>Accessibility</Text>
                        <Text size="sm">
                          The component automatically respects user motion preferences. 
                          Users with 'prefers-reduced-motion' enabled will see simplified transitions.
                        </Text>
                      </div>
                    </Group>
                    
                    <Group spacing="xs" noWrap align="flex-start">
                      <IconInfoCircle size={18} style={{ marginTop: 4 }} />
                      <div>
                        <Text weight={600}>Route Changes</Text>
                        <Text size="sm">
                          For Next.js applications, the component handles route changes automatically. 
                          Set <Code>trackRouteChanges</Code> to <Code>true</Code> to enable exit animations on navigation.
                        </Text>
                      </div>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>
            
            <Paper withBorder p="xl">
              <Title order={3} mb="md">Advanced Usage</Title>
              
              <Stack spacing="lg">
                <div>
                  <Title order={4} mb="sm">Custom Easing</Title>
                  <Text mb="md">
                    You can customize the easing function to create different feels for your transitions:
                  </Text>
                  <Box p="md" sx={{ background: '#f5f5f5', borderRadius: '4px' }}>
                    <Code block>
{`<AdvancedPageTransition
  effect="scale"
  easing="elastic.out(1, 0.3)"
>
  <YourContent />
</AdvancedPageTransition>`}
                    </Code>
                  </Box>
                </div>
                
                <div>
                  <Title order={4} mb="sm">Animation Events</Title>
                  <Text mb="md">
                    Use animation lifecycle events to trigger additional actions:
                  </Text>
                  <Box p="md" sx={{ background: '#f5f5f5', borderRadius: '4px' }}>
                    <Code block>
{`<AdvancedPageTransition
  effect="slideLeft"
  onEnterComplete={() => {
    // Animation has finished, trigger additional effect
    gsap.to('.special-element', { 
      scale: 1.2, 
      duration: 0.3, 
      yoyo: true, 
      repeat: 1 
    });
  }}
>
  <YourContent />
</AdvancedPageTransition>`}
                    </Code>
                  </Box>
                </div>
                
                <div>
                  <Title order={4} mb="sm">Conditional Effects</Title>
                  <Text mb="md">
                    Adjust the transition effect based on navigation direction:
                  </Text>
                  <Box p="md" sx={{ background: '#f5f5f5', borderRadius: '4px' }}>
                    <Code block>
{`const direction = useNavigationDirection(); // Custom hook for tracking direction

<AdvancedPageTransition
  effect={direction === 'forward' ? 'slideLeft' : 'slideRight'}
>
  <YourContent />
</AdvancedPageTransition>`}
                    </Code>
                  </Box>
                </div>
              </Stack>
            </Paper>
          </Stack>
        )}
        
        {activeTab === 'api' && (
          <Paper withBorder p="xl">
            <Title order={3} mb="lg">API Reference</Title>
            
            <Text weight={600} mb="xs">AdvancedPageTransition Props</Text>
            
            <Box p="lg" mb="xl" sx={{ background: '#f5f5f5', borderRadius: '8px' }}>
              <Stack spacing="md">
                <Group>
                  <Code>children</Code>
                  <Text size="sm"><em>ReactNode</em> (required)</Text>
                </Group>
                <Text size="sm">The content to be animated.</Text>
                
                <Group>
                  <Code>effect</Code>
                  <Text size="sm"><em>TransitionEffect</em> = "fade"</Text>
                </Group>
                <Text size="sm">The type of transition effect to apply. Options: 'fade', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'scale', 'flip', 'rotate', 'wipe', 'reveal'</Text>
                
                <Group>
                  <Code>duration</Code>
                  <Text size="sm"><em>number</em> = 0.5</Text>
                </Group>
                <Text size="sm">Duration of the transition in seconds.</Text>
                
                <Group>
                  <Code>skipExit</Code>
                  <Text size="sm"><em>boolean</em> = false</Text>
                </Group>
                <Text size="sm">Whether to skip exit animations (useful for initial page load).</Text>
                
                <Group>
                  <Code>easing</Code>
                  <Text size="sm"><em>string</em> = "power2.inOut"</Text>
                </Group>
                <Text size="sm">Custom easing function for the transition. Supports all GSAP easing functions.</Text>
                
                <Group>
                  <Code>trackRouteChanges</Code>
                  <Text size="sm"><em>boolean</em> = true</Text>
                </Group>
                <Text size="sm">Whether to track route changes for exit animations.</Text>
                
                <Group>
                  <Code>onEnterStart</Code>
                  <Text size="sm"><em>() => void</em></Text>
                </Group>
                <Text size="sm">Callback when enter animation starts.</Text>
                
                <Group>
                  <Code>onEnterComplete</Code>
                  <Text size="sm"><em>() => void</em></Text>
                </Group>
                <Text size="sm">Callback when enter animation completes.</Text>
                
                <Group>
                  <Code>onExitStart</Code>
                  <Text size="sm"><em>() => void</em></Text>
                </Group>
                <Text size="sm">Callback when exit animation starts.</Text>
                
                <Group>
                  <Code>onExitComplete</Code>
                  <Text size="sm"><em>() => void</em></Text>
                </Group>
                <Text size="sm">Callback when exit animation completes.</Text>
              </Stack>
            </Box>
            
            <Text weight={600} mb="xs">TransitionEffect Type</Text>
            
            <Box p="lg" sx={{ background: '#f5f5f5', borderRadius: '8px' }}>
              <Code block>
{`type TransitionEffect =
  | 'fade'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scale'
  | 'flip'
  | 'rotate'
  | 'wipe'
  | 'reveal';`}
              </Code>
            </Box>
          </Paper>
        )}
      </Container>
    </PageTransition>
  );
}