# Fluxori-V2 Motion Design Guide

This document outlines the motion design principles, patterns, and implementation guidelines for the Fluxori-V2 frontend. It serves as the authoritative reference for creating consistent, purposeful animations that convey the advanced AI-powered capabilities of our e-commerce platform.

## Core Principles

Our motion design is built on three fundamental principles that guide all animation decisions:

### 1. Purposeful Intelligence

Animations should communicate meaning and intelligence, reflecting our AI-powered platform:

- **Informative Motion**: Every animation serves a purpose - guiding attention, showing relationships, or providing feedback
- **Spatial Relationships**: Movement helps users understand how interface elements relate to each other
- **Context Preservation**: Transitions maintain context and continuity between states
- **Priority Signaling**: More important elements receive more pronounced animations
- **Hierarchy of Motion**: Animation scale correlates with the hierarchy of information
- **AI Feedback**: Subtle animations indicate AI processing and decision-making

### 2. Fluid Efficiency

Animations are smooth and efficient, optimized for performance:

- **Performance First**: All animations are optimized for minimal CPU/GPU impact
- **Natural Physics**: Movement follows natural physical properties with appropriate easing and momentum
- **Timing Discipline**: Animations are quick enough to feel responsive but slow enough to be perceived
- **Reduced Motion Support**: All animations respect user preferences for reduced motion
- **Resource Awareness**: Animation complexity scales with device capabilities
- **Caching & Precomputation**: Advanced animations are prepared beforehand when possible

### 3. Precision & Accuracy

Animations are exact and intentional, with carefully calibrated timing:

- **Calibrated Timing**: Precise durations for different animation types
- **Purposeful Easing**: Specific easing functions for different motion purposes
- **Coordinated Sequences**: Related elements animate in harmonious coordination
- **Pixel-Perfect Motion**: Animations execute exactly as designed without visual artifacts
- **Consistent Implementation**: Similar UI elements animate in similar ways
- **Predictive Motion**: Animations anticipate user actions where appropriate

## Fluxori's Motion Identity

The motion design for Fluxori-V2 has a distinctive character that reinforces our brand identity as an advanced AI e-commerce platform:

### Sophisticated & Intelligent

- **Fluid Transitions**: Smooth, precisely timed animations that feel intelligent rather than mechanical
- **Responsive Feedback**: Animations that respond to user input in ways that feel predictive and smart
- **Data-Driven Movement**: Visualizations that bring data to life through meaningful animation
- **AI Processing Indicators**: Subtle animations that communicate AI processing without distraction

### Modern & Professional

- **Clean Motion Paths**: Direct, purposeful movement without unnecessary flourishes
- **Refined Timing**: Well-calibrated animation durations that feel professional
- **Subtle Dimensionality**: Light use of 3D effects for depth without excessive showiness
- **Consistent Choreography**: Harmonious coordination between related elements

### Powerful & Efficient

- **Performance-Optimized**: Animations that maintain 60fps even on mobile devices
- **Purposeful Effects**: Every animation serves a functional purpose
- **Progressive Enhancement**: More powerful devices get richer animations
- **Resource-Conscious**: Animation complexity adapts to available system resources

## Motion Categories

### 1. AI-Powered Interactions

Animations that communicate AI capabilities:

- **Processing Indicators**: Subtle wave or pulse effects during AI analysis
- **Confidence Visualization**: Animation intensity correlated with AI confidence
- **Intelligence Transitions**: Smooth morphing between data representations
- **Generative Reveals**: Progressive disclosure of AI-generated content
- **Streaming Responses**: Character-by-character text animations for AI responses

```typescript
// AI typing effect for chat responses
const typingEffect = (element, text, speed = 30) => {
  const chars = text.split('');
  let i = 0;
  
  gsap.set(element, { opacity: 1 });
  
  const typeNextChar = () => {
    if (i < chars.length) {
      element.textContent += chars[i];
      i++;
      gsap.delayedCall(speed / 1000, typeNextChar);
    }
  };
  
  typeNextChar();
};
```

### 2. Entrance & Exit

Animations that introduce or remove elements from the interface:

- **Fade + Scale**: Primary elements fade and scale up slightly on entrance
- **Staggered Appearance**: Related elements appear in sequence
- **Reveal**: Content reveals from behind existing elements
- **Subtle Exit**: Elements fade out with minimal motion on exit
- **Data Emergence**: Data points that emerge organically onto charts and visualizations

### 3. State Changes

Animations that reflect changes in element states:

- **Toggle**: Smooth transitions between on/off, expanded/collapsed
- **Selection**: Visual feedback for selected items
- **Loading**: Animated indicators for processing states
- **Success/Error**: Clear animation patterns for outcomes
- **Price Changes**: Number animations with color transitions for pricing updates

### 4. User Input Feedback

Responsive animations that provide immediate feedback:

- **Button Press**: Subtle scale change on press
- **Form Interaction**: Highlight fields with focus animations
- **Drag Operations**: Visual cues during drag and drop
- **Gesture Feedback**: Visual responses to touch/mouse gestures
- **Validation Feedback**: Animated checkmarks and indicators for form validation

### 5. System Status & Real-Time Updates

Animations that communicate system status:

- **Progress Indicators**: Animated progress bars and spinners
- **Notification Alerts**: Attention-grabbing yet unobtrusive notifications
- **Background Processing**: Subtle animation cues for background tasks
- **State Synchronization**: Visual cues for real-time updates
- **Marketplace Status**: Animated indicators for marketplace connectivity

### 6. Data Visualization Animations

Specialized animations for data representation:

- **Chart Building**: Sequential construction of chart elements
- **Data Point Transitions**: Smooth movement when data values change
- **Highlighting Patterns**: Motion to emphasize trends or anomalies
- **Filtering Effects**: Smooth transitions when applying filters
- **Buy Box Movement**: Visual representation of Buy Box ownership changes

## Advanced GSAP Techniques for Mantine UI

### Premium Plugin Integration

Leveraging GSAP's Business License premium plugins:

#### SplitText for Advanced Typography

```typescript
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

const animateHeading = (element) => {
  const split = new SplitText(element, { type: "chars, words" });
  
  gsap.from(split.chars, {
    opacity: 0,
    y: 20,
    stagger: 0.02,
    duration: 0.8,
    ease: "power2.out"
  });
  
  return split; // Return for cleanup
};
```

#### DrawSVG for Logo and Icon Animations

```typescript
import { DrawSVG } from 'gsap/DrawSVG';
gsap.registerPlugin(DrawSVG);

const animateLogo = (svgElement) => {
  const paths = svgElement.querySelectorAll('path');
  
  gsap.set(paths, { drawSVG: "0%" });
  
  return gsap.to(paths, {
    drawSVG: "100%",
    duration: 1.5,
    stagger: 0.1,
    ease: "power2.inOut"
  });
};
```

#### MorphSVG for Shape Transformations

```typescript
import { MorphSVG } from 'gsap/MorphSVG';
gsap.registerPlugin(MorphSVG);

const morphButtons = (fromShape, toShape) => {
  return gsap.to(fromShape, {
    morphSVG: toShape,
    duration: 0.5,
    ease: "power2.inOut"
  });
};
```

### Mantine UI Component Animation Enhancers

Custom animation hooks for Mantine UI components:

#### AnimatedMantineTransition

```tsx
import { Transition, TransitionProps } from '@mantine/core';
import { useCallback } from 'react';
import { gsap } from 'gsap';

interface AnimatedTransitionProps extends TransitionProps {
  onBeforeEnter?: (node: HTMLElement) => void;
  onAfterEnter?: (node: HTMLElement) => void;
  onBeforeExit?: (node: HTMLElement) => void;
  onAfterExit?: (node: HTMLElement) => void;
}

export const AnimatedMantineTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  onBeforeEnter,
  onAfterEnter,
  onBeforeExit,
  onAfterExit,
  ...props
}) => {
  const handleEnter = useCallback((node: HTMLElement) => {
    onBeforeEnter?.(node);
    gsap.set(node, { opacity: 0, y: 20 });
  }, [onBeforeEnter]);
  
  const handleEntered = useCallback((node: HTMLElement) => {
    gsap.to(node, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    onAfterEnter?.(node);
  }, [onAfterEnter]);
  
  const handleExit = useCallback((node: HTMLElement) => {
    onBeforeExit?.(node);
    gsap.to(node, { opacity: 0, y: -20, duration: 0.3, ease: "power2.in" });
  }, [onBeforeExit]);
  
  const handleExited = useCallback((node: HTMLElement) => {
    onAfterExit?.(node);
  }, [onAfterExit]);
  
  return (
    <Transition
      onEnter={handleEnter}
      onEntered={handleEntered}
      onExit={handleExit}
      onExited={handleExited}
      {...props}
    >
      {children}
    </Transition>
  );
};
```

#### Animated Number Counter for Statistics

```tsx
import { Text, TextProps } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedCounterProps extends TextProps {
  from: number;
  to: number;
  duration?: number;
  formatValue?: (value: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from,
  to,
  duration = 2,
  formatValue = (value) => Math.round(value).toLocaleString(),
  ...props
}) => {
  const counterRef = useRef({ value: from });
  const textRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const updateText = () => {
      if (textRef.current) {
        textRef.current.textContent = formatValue(counterRef.current.value);
      }
    };
    
    gsap.to(counterRef.current, {
      value: to,
      duration,
      ease: "power2.out",
      onUpdate: updateText
    });
  }, [to, duration, formatValue]);
  
  return <Text ref={textRef} {...props}>{formatValue(from)}</Text>;
};
```

## E-Commerce Specific Animation Patterns

### Marketplace Connection Animations

```tsx
import { Button, Group, Text } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ConnectionStatusProps {
  connected: boolean;
  marketplaceName: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connected,
  marketplaceName
}) => {
  const statusRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (statusRef.current && indicatorRef.current) {
      const timeline = gsap.timeline();
      
      if (connected) {
        timeline
          .to(indicatorRef.current, {
            backgroundColor: 'var(--mantine-color-green-6)',
            boxShadow: '0 0 8px var(--mantine-color-green-6)',
            scale: 1.2,
            duration: 0.4
          })
          .to(indicatorRef.current, {
            scale: 1,
            duration: 0.3
          })
          .to(statusRef.current, {
            color: 'var(--mantine-color-green-6)',
            duration: 0.3
          }, "-=0.3");
      } else {
        timeline
          .to(indicatorRef.current, {
            backgroundColor: 'var(--mantine-color-red-6)',
            boxShadow: '0 0 5px rgba(0,0,0,0)',
            scale: 0.9,
            duration: 0.4
          })
          .to(statusRef.current, {
            color: 'var(--mantine-color-red-6)',
            duration: 0.3
          }, "-=0.3");
      }
    }
  }, [connected]);
  
  return (
    <Group spacing="sm" align="center">
      <div 
        ref={indicatorRef} 
        style={{ 
          width: 12, 
          height: 12, 
          borderRadius: '50%', 
          backgroundColor: connected ? 'green' : 'red' 
        }} 
      />
      <Text ref={statusRef}>
        {marketplaceName}: {connected ? 'Connected' : 'Disconnected'}
      </Text>
    </Group>
  );
};
```

### Price Change Animations

```tsx
import { Text, TextProps } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface PriceChangeProps extends TextProps {
  currentPrice: number;
  previousPrice?: number;
  currency?: string;
}

export const PriceChange: React.FC<PriceChangeProps> = ({
  currentPrice,
  previousPrice,
  currency = '$',
  ...props
}) => {
  const priceRef = useRef<HTMLDivElement>(null);
  const [displayedPrice, setDisplayedPrice] = useState(currentPrice);
  
  useEffect(() => {
    if (priceRef.current && previousPrice !== undefined && previousPrice !== currentPrice) {
      const isIncrease = currentPrice > previousPrice;
      
      // First flash the background appropriate color
      gsap.to(priceRef.current, {
        backgroundColor: isIncrease ? 'rgba(0, 255, 0, 0.15)' : 'rgba(255, 0, 0, 0.15)',
        duration: 0.2,
        onComplete: () => {
          // Animate the number change
          gsap.to({ value: previousPrice }, {
            value: currentPrice,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate: function() {
              setDisplayedPrice(this.targets()[0].value);
            }
          });
          
          // Fade out the background
          gsap.to(priceRef.current, {
            backgroundColor: 'rgba(0, 0, 0, 0)',
            duration: 1.5,
            delay: 0.2
          });
        }
      });
    }
  }, [currentPrice, previousPrice]);
  
  return (
    <Text ref={priceRef} {...props}>
      {currency}{displayedPrice.toFixed(2)}
    </Text>
  );
};
```

### Buy Box Monitoring Animation

```tsx
import { Paper, Group, Text, Stack } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface BuyBoxStatusProps {
  hasWon: boolean;
  previousOwner?: string;
  currentOwner: string;
}

export const BuyBoxStatus: React.FC<BuyBoxStatusProps> = ({
  hasWon,
  previousOwner,
  currentOwner
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const hasChanged = previousOwner && previousOwner !== currentOwner;
  
  useEffect(() => {
    if (containerRef.current && statusRef.current && hasChanged) {
      const timeline = gsap.timeline();
      
      // Pulse animation for ownership change
      timeline
        .to(containerRef.current, {
          scale: 1.03,
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
          duration: 0.3
        })
        .to(containerRef.current, {
          scale: 1,
          boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
          duration: 0.4,
          ease: 'power2.out'
        });
      
      // Status text animation
      gsap.fromTo(statusRef.current, 
        { 
          y: -20, 
          opacity: 0,
          color: hasWon ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)'
        },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.4,
          delay: 0.3
        }
      );
    }
  }, [hasWon, hasChanged, currentOwner]);
  
  return (
    <Paper ref={containerRef} p="md" withBorder>
      <Stack spacing="sm">
        <Group position="apart">
          <Text size="sm" color="dimmed">Buy Box Owner:</Text>
          <Text weight={500}>{currentOwner}</Text>
        </Group>
        
        <div ref={statusRef} style={{ textAlign: 'center' }}>
          {hasWon ? (
            <Text color="green" weight={600}>You have the Buy Box!</Text>
          ) : (
            <Text color="red" weight={600}>Competitor has the Buy Box</Text>
          )}
        </div>
      </Stack>
    </Paper>
  );
};
```

## Timing & Easing Guidelines (Enhanced)

### Duration Standards

| Animation Type | Duration | Notes |
|----------------|----------|-------|
| Micro-interactions | 100-200ms | Button press, hover effects |
| UI Feedback | 200-300ms | Form validation, selection states |
| Content Transitions | 300-400ms | Panel changes, content updates |
| Page Transitions | 400-500ms | Moving between major views |
| Data Visualizations | 600-800ms | Chart building, data transitions |
| AI Processing | 700-1000ms | Indicating AI operations |
| Emphasis Animations | 500-800ms | Important alerts, onboarding elements |
| Elaborate Sequences | 800-1200ms | Complex, multi-stage animations |

### Advanced Easing Functions

| Purpose | Easing Function | Use Case |
|---------|----------------|----------|
| Natural Movement | `power2.out` | General UI movement, default choice |
| Subtle Effects | `power1.inOut` | Background changes, color shifts |
| Energetic Motion | `power3.out` | Enthusiastic entrance animations |
| Playful Bounce | `back.out(1.5)` | Success states, positive feedback |
| Elastic Effect | `elastic.out(1, 0.3)` | Attention-grabbing elements |
| Realistic Physics | `power4.inOut` | Large object movement |
| Dramatic Pause | Custom with slow middle | Guided focus on important elements |
| AI Processing | `power2.inOut` | Smooth pulsing for AI operation indicators |
| Data Transitions | `power3.inOut` | Smooth transitions between data states |
| Alert Attention | `elastic.out(1, 0.5)` | Critical notifications that need attention |

## Performance Optimization for E-Commerce Scale

### High-Performance Animation Strategies

- **GSAP Timeline Optimization**: Group related animations in timelines for efficient management
- **Off-DOM Preparation**: Prepare complex animations before adding elements to the DOM
- **GPU Acceleration**: Use `will-change` for complex animations, with caution
- **Debounced Real-time Updates**: Buffer rapid data changes to avoid excessive reanimation
- **Selective Animation**: Only animate visible elements, use IntersectionObserver
- **Staggered Loading**: Progressive revealing of interface elements based on importance

```typescript
// High-performance list rendering with virtualization + animation
const VirtualizedAnimatedList = ({ items, itemHeight, visibleHeight }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(0);
  const visibleCount = Math.ceil(visibleHeight / itemHeight) + 1;
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const newStart = Math.floor(scrollTop / itemHeight);
      setStart(newStart);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [itemHeight]);
  
  useEffect(() => {
    // Animate only visible items
    const visibleElements = document.querySelectorAll('.list-item-visible');
    
    gsap.fromTo(visibleElements, 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        stagger: 0.05, 
        duration: 0.4,
        ease: 'power2.out',
        overwrite: true
      }
    );
  }, [start]);
  
  return (
    <div 
      ref={containerRef}
      style={{ height: visibleHeight, overflow: 'auto' }}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {items.slice(start, start + visibleCount).map((item, index) => (
          <div 
            key={item.id}
            className="list-item-visible"
            style={{
              position: 'absolute',
              top: (start + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Accessibility & Performance Considerations (Enhanced)

### Advanced Reduced Motion Strategy

Our approach to respecting user preferences while maintaining necessary motion:

- **Three-Tier Motion System**: 
  - Full motion (default)
  - Essential motion only (reduced)
  - Minimal transitions (highly reduced)
- **Contextual Importance**: Maintain motion that conveys critical status information
- **Preference Detection**: Check both OS-level and app-specific preferences
- **Progressive Enhancement**: Build the core experience without motion, then enhance

```typescript
// Comprehensive motion preference management
import { useEffect, useState } from 'react';

export const useMotionPreference = () => {
  const [motionPreference, setMotionPreference] = useState({
    reduced: false,
    userConfigured: false,
    level: 'full' // 'full', 'essential', or 'minimal'
  });
  
  useEffect(() => {
    // Check OS-level preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (query: MediaQueryListEvent | MediaQueryList) => {
      const reduced = query.matches;
      setMotionPreference(prev => ({
        ...prev,
        reduced,
        level: prev.userConfigured ? prev.level : (reduced ? 'essential' : 'full')
      }));
    };
    
    updateMotionPreference(reducedMotionQuery);
    reducedMotionQuery.addEventListener('change', updateMotionPreference);
    
    // Check for app-specific setting (e.g., from localStorage)
    const userSetting = localStorage.getItem('motionPreference');
    if (userSetting) {
      setMotionPreference(prev => ({
        ...prev,
        userConfigured: true,
        level: userSetting as 'full' | 'essential' | 'minimal'
      }));
    }
    
    return () => {
      reducedMotionQuery.removeEventListener('change', updateMotionPreference);
    };
  }, []);
  
  // Function to update the user's preference
  const setUserMotionPreference = (level: 'full' | 'essential' | 'minimal') => {
    localStorage.setItem('motionPreference', level);
    setMotionPreference(prev => ({
      ...prev,
      userConfigured: true,
      level
    }));
  };
  
  return {
    motionPreference,
    setUserMotionPreference
  };
};
```

### Performance Budgeting & Monitoring

- **Animation Budget**: Establish performance budgets for different device categories
- **Automated Testing**: Performance regression testing in CI/CD pipeline
- **User-Centric Metrics**: Monitor real-user metrics for animation performance
- **Adaptive Quality**: Scale animation complexity based on device performance
- **Layout Thrashing Prevention**: Batch DOM reads and writes with GSAP utilities

```typescript
// Device capability detection for adaptive animations
export const detectDeviceCapabilities = () => {
  // Basic performance estimation
  let performanceLevel = 'high';
  
  // Check if running on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    performanceLevel = 'medium';
  }
  
  // Try to detect low-end devices
  if (
    navigator.hardwareConcurrency <= 2 || 
    (navigator.deviceMemory && navigator.deviceMemory < 4)
  ) {
    performanceLevel = 'low';
  }
  
  // Return animation configs based on capability
  return {
    performanceLevel,
    animationSettings: {
      high: {
        enableParallax: true,
        enableComplexTransitions: true,
        enableTextAnimation: true,
        staggerAmount: 0.05,
        maxAnimatedElements: 100
      },
      medium: {
        enableParallax: false,
        enableComplexTransitions: true,
        enableTextAnimation: true,
        staggerAmount: 0.03,
        maxAnimatedElements: 50
      },
      low: {
        enableParallax: false,
        enableComplexTransitions: false,
        enableTextAnimation: false,
        staggerAmount: 0.02,
        maxAnimatedElements: 20
      }
    }
  };
};
```

## AI-Commerce Integration Patterns

### AI Insights Animation

```tsx
import { Paper, Text, Group, Stack, ThemeIcon } from '@mantine/core';
import { IconBulb, IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

interface InsightCardProps {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  newInsight?: boolean;
}

export const AIInsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  impact,
  confidence,
  newInsight = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (cardRef.current && titleRef.current && descRef.current) {
      let splitTitle: SplitText | null = null;
      let splitDesc: SplitText | null = null;
      
      if (newInsight) {
        // Apply entrance animation for new insights
        const timeline = gsap.timeline();
        
        // Card entrance
        timeline.fromTo(cardRef.current,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }
        );
        
        // Split and animate title
        splitTitle = new SplitText(titleRef.current, { type: 'words,chars' });
        timeline.fromTo(splitTitle.chars,
          { opacity: 0, y: 10 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.4, 
            stagger: 0.02, 
            ease: 'power2.out' 
          },
          '-=0.3'
        );
        
        // Animate description with offset
        splitDesc = new SplitText(descRef.current, { type: 'lines' });
        timeline.fromTo(splitDesc.lines,
          { opacity: 0, y: 10 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.4, 
            stagger: 0.05, 
            ease: 'power2.out' 
          },
          '-=0.2'
        );
        
        // Add confidence indicator animation
        const confidenceBar = cardRef.current.querySelector('.confidence-indicator');
        if (confidenceBar) {
          timeline.fromTo(confidenceBar,
            { width: 0 },
            { 
              width: `${confidence * 100}%`, 
              duration: 0.8, 
              ease: 'power2.inOut' 
            },
            '-=0.4'
          );
        }
      }
      
      // Clean up SplitText instances
      return () => {
        if (splitTitle) splitTitle.revert();
        if (splitDesc) splitDesc.revert();
      };
    }
  }, [newInsight, confidence]);
  
  // Icon and color based on impact
  const getImpactDetails = () => {
    switch (impact) {
      case 'positive':
        return { 
          icon: <IconArrowUpRight size={18} />, 
          color: 'teal',
          label: 'Positive Impact' 
        };
      case 'negative':
        return { 
          icon: <IconArrowDownRight size={18} />, 
          color: 'red',
          label: 'Negative Impact' 
        };
      default:
        return { 
          icon: <IconBulb size={18} />, 
          color: 'blue',
          label: 'Information' 
        };
    }
  };
  
  const impactDetails = getImpactDetails();
  
  return (
    <Paper ref={cardRef} p="md" withBorder shadow="sm">
      <Stack spacing="sm">
        <Group position="apart">
          <Group spacing="xs">
            <ThemeIcon color={impactDetails.color} variant="light" size="md">
              {impactDetails.icon}
            </ThemeIcon>
            <Text ref={titleRef} weight={600} size="lg">{title}</Text>
          </Group>
          <Text size="xs" color="dimmed">{impactDetails.label}</Text>
        </Group>
        
        <Text ref={descRef} size="sm" color="dimmed">{description}</Text>
        
        <div style={{ marginTop: 8 }}>
          <Text size="xs" mb={4}>AI Confidence</Text>
          <div style={{ height: 4, background: 'var(--mantine-color-gray-2)', borderRadius: 2, overflow: 'hidden' }}>
            <div 
              className="confidence-indicator"
              style={{ 
                width: `${confidence * 100}%`, 
                height: '100%', 
                background: `var(--mantine-color-${impactDetails.color}-6)`,
                borderRadius: 2
              }} 
            />
          </div>
        </div>
      </Stack>
    </Paper>
  );
};
```

## Examples of Advanced Motion Patterns

### AI-powered Product Recommendations

- **Confidence Level Indicators**: Animated bars showing AI confidence in recommendations
- **Related Product Connections**: Animated lines connecting related products
- **Smart Filtering**: Smooth transitions as AI filters change based on behavior
- **Interest Heatmaps**: Gradual color transitions indicating predicted interest areas

### E-Commerce Dashboard Insights

- **Trend Indicators**: Animated arrows and slopes showing market direction
- **Opportunity Highlighting**: Pulsing highlights around actionable insights
- **Algorithmic Price Recommendations**: Animated transitions between price points
- **Competitive Position Visualization**: Animated position changes in market rankings
- **Sales Velocity**: Animated flow indicators for high-velocity products

### Marketplace Integrations

- **Connection Status**: Animated indicators showing API connection health
- **Synchronization Progress**: Elegant progress animations for sync operations
- **Cross-Platform Analytics**: Animated transitions between marketplace comparisons
- **Inventory Allocation**: Visual flow animations showing inventory distribution

---

Last Updated: April 2, 2025 - Enhanced for modern AI-powered e-commerce with full Mantine UI + GSAP integration