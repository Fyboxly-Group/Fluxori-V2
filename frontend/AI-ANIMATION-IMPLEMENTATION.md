# AI-Specific Animation Implementation Plan

This document outlines our specialized approach to animating AI-powered features in the Fluxori-V2 frontend. These animations not only provide visual appeal but also communicate the intelligence and capabilities of our AI systems to users.

## Core Principles for AI Animation

### Visual Intelligence Signaling

Our animations for AI components subtly communicate:

1. **Processing Activity**: When AI is analyzing or processing data
2. **Confidence Level**: The AI's confidence in its recommendations or analyses
3. **Intelligence Level**: The sophistication of the underlying AI model (e.g., simple vs. advanced analysis)
4. **Data Relationships**: How different data points or insights are connected
5. **Predictive Nature**: How the AI anticipates user needs or market changes

### Technical Implementation Guidelines

All AI animations should adhere to:

1. **Performance Priority**: Never impede the user experience or system performance
2. **Meaningful Motion**: Every animation must communicate something specific about the AI's function
3. **Subtle Sophistication**: Animations should feel intelligent but not flashy or gimmicky
4. **Consistent Visual Language**: Maintain a consistent animation system across all AI features
5. **Accessibility**: Provide alternatives for users with reduced motion preferences

## Key AI Animation Patterns

### 1. AI Processing Indicators

```typescript
// Subtle wave animation for AI processing
export const aiProcessingAnimation = (element: HTMLElement, active: boolean) => {
  if (!element) return;
  
  // Kill any existing animations
  gsap.killTweensOf(element);
  
  if (active) {
    // Create subtle wave effect
    return gsap.to(element, {
      background: 'linear-gradient(90deg, rgba(0,136,255,0.05) 0%, rgba(0,136,255,0.1) 50%, rgba(0,136,255,0.05) 100%)',
      backgroundSize: '200% 100%',
      backgroundPosition: '0% 0%',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  } else {
    // Reset to default state
    return gsap.to(element, {
      background: 'transparent',
      duration: 0.5
    });
  }
};
```

```tsx
// React implementation
import { useEffect, useRef } from 'react';
import { aiProcessingAnimation } from '@/animations/ai';

export const AIProcessingIndicator: React.FC<{ 
  active: boolean;
  children: React.ReactNode;
}> = ({ active, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      aiProcessingAnimation(containerRef.current, active);
    }
  }, [active]);
  
  return (
    <div ref={containerRef} className="ai-processing-container">
      {children}
    </div>
  );
};
```

### 2. Confidence Visualization

```tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Box, Text } from '@mantine/core';

interface ConfidenceIndicatorProps {
  confidence: number; // 0-1
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  label = 'AI Confidence',
  size = 'md',
  animated = true
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const previousConfidence = useRef(confidence);
  
  const getHeight = () => {
    switch (size) {
      case 'sm': return 3;
      case 'lg': return 6;
      default: return 4;
    }
  };
  
  useEffect(() => {
    if (barRef.current && animated) {
      // Animate from previous value to new value
      gsap.fromTo(barRef.current, 
        { width: `${previousConfidence.current * 100}%` },
        { 
          width: `${confidence * 100}%`, 
          duration: 0.8, 
          ease: 'power2.inOut',
          onComplete: () => {
            previousConfidence.current = confidence;
          }
        }
      );
    }
  }, [confidence, animated]);
  
  // Color based on confidence level
  const getColor = () => {
    if (confidence >= 0.8) return 'var(--mantine-color-green-6)';
    if (confidence >= 0.5) return 'var(--mantine-color-blue-6)';
    if (confidence >= 0.3) return 'var(--mantine-color-yellow-6)';
    return 'var(--mantine-color-red-6)';
  };
  
  return (
    <Box>
      {label && <Text size="xs" mb={4}>{label}</Text>}
      <Box 
        style={{ 
          height: getHeight(), 
          background: 'var(--mantine-color-gray-2)', 
          borderRadius: getHeight() / 2,
          overflow: 'hidden' 
        }}
      >
        <div 
          ref={barRef}
          style={{
            width: animated ? `${previousConfidence.current * 100}%` : `${confidence * 100}%`,
            height: '100%',
            background: getColor(),
            borderRadius: getHeight() / 2
          }}
        />
      </Box>
    </Box>
  );
};
```

### 3. AI Chat Response Animation

```tsx
import { useEffect, useRef, useState } from 'react';
import { Text, Paper, Avatar, Box } from '@mantine/core';
import { gsap } from 'gsap';

interface AIChatMessageProps {
  message: string;
  avatar?: string;
  timestamp?: Date;
  streaming?: boolean;
  typingSpeed?: number; // characters per second
}

export const AIChatMessage: React.FC<AIChatMessageProps> = ({
  message,
  avatar = '/ai-avatar.png',
  timestamp = new Date(),
  streaming = false,
  typingSpeed = 30
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(streaming);
  const timeoutRef = useRef<number | null>(null);
  
  // Format time as HH:MM
  const formattedTime = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Reset animation when message changes
  useEffect(() => {
    if (streaming) {
      setDisplayedText('');
      setIsTyping(true);
    } else {
      setDisplayedText(message);
      setIsTyping(false);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, streaming]);
  
  // Handle streaming animation
  useEffect(() => {
    if (isTyping && streaming) {
      let i = displayedText.length;
      
      const typeNextChar = () => {
        if (i < message.length) {
          setDisplayedText(message.substring(0, i + 1));
          i++;
          timeoutRef.current = window.setTimeout(
            typeNextChar, 
            1000 / typingSpeed
          );
        } else {
          setIsTyping(false);
        }
      };
      
      timeoutRef.current = window.setTimeout(typeNextChar, 1000 / typingSpeed);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isTyping, message, displayedText, streaming, typingSpeed]);
  
  // Entrance animation
  useEffect(() => {
    if (messageRef.current) {
      gsap.fromTo(messageRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, []);
  
  return (
    <Box ref={messageRef} style={{ display: 'flex', marginBottom: 16 }}>
      <Avatar src={avatar} radius="xl" size="md" mr={12} />
      <div style={{ flex: 1 }}>
        <Paper p="sm" withBorder radius="md" style={{ 
          backgroundColor: 'var(--mantine-color-blue-0)',
          borderColor: 'var(--mantine-color-blue-2)'
        }}>
          <Text>{displayedText}</Text>
          {isTyping && (
            <Box 
              style={{ 
                display: 'inline-block', 
                marginLeft: 4,
                verticalAlign: 'middle' 
              }}
            >
              <span className="typing-indicator" />
            </Box>
          )}
        </Paper>
        <Text size="xs" color="dimmed" mt={4}>
          {formattedTime}
        </Text>
      </div>
    </Box>
  );
};
```

```css
/* CSS for typing indicator */
.typing-indicator {
  display: inline-block;
  position: relative;
  width: 16px;
  height: 16px;
}

.typing-indicator::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 16px;
  height: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  animation: typingPulse 1.5s infinite;
}

@keyframes typingPulse {
  0%, 100% { opacity: 0.2; width: 4px; }
  50% { opacity: 0.5; width: 16px; }
}
```

### 4. AI Insights Card

```tsx
import { useEffect, useRef } from 'react';
import { Paper, Text, ThemeIcon, Group, Stack } from '@mantine/core';
import { IconBulb, IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

interface AIInsightProps {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  isNew?: boolean;
}

export const AIInsight: React.FC<AIInsightProps> = ({
  title,
  description,
  impact,
  confidence,
  isNew = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const confidenceRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!cardRef.current || !titleRef.current || !descRef.current || !confidenceRef.current) return;
    
    // Basic entrance animation for all cards
    const timeline = gsap.timeline();
    
    timeline.fromTo(cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
    
    // Special animation for new insights
    if (isNew) {
      // Split and animate title
      const titleSplit = new SplitText(titleRef.current, { type: 'chars,words' });
      timeline.fromTo(titleSplit.chars,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.02, ease: 'power2.out' },
        '-=0.2'
      );
      
      // Animate confidence bar
      timeline.fromTo(confidenceRef.current,
        { width: 0 },
        { width: `${confidence * 100}%`, duration: 0.6, ease: 'power2.inOut' },
        '-=0.3'
      );
      
      // Highlight effect
      timeline.fromTo(cardRef.current,
        { boxShadow: '0 0 0 0 rgba(0,120,255,0)' },
        { 
          boxShadow: '0 0 0 4px rgba(0,120,255,0.2)', 
          duration: 0.4,
          ease: 'power2.out' 
        }
      );
      
      timeline.to(cardRef.current,
        { 
          boxShadow: '0 0 0 0 rgba(0,120,255,0)', 
          duration: 0.8,
          ease: 'power2.out' 
        }
      );
      
      return () => {
        titleSplit.revert();
      };
    }
    
    // Default animation for confidence bar
    timeline.fromTo(confidenceRef.current,
      { width: 0 },
      { width: `${confidence * 100}%`, duration: 0.6, ease: 'power2.out' },
      '-=0.2'
    );
  }, [isNew, confidence]);
  
  // Impact-based styling
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
    <Paper 
      ref={cardRef} 
      p="md" 
      withBorder 
      shadow="sm"
      style={{ 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isNew && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: `var(--mantine-color-${impactDetails.color}-6)`,
            color: 'white',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 'bold',
            transform: 'translateX(30%) translateY(-5%) rotate(45deg)',
            width: '100px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          NEW
        </div>
      )}
      
      <Stack spacing="sm">
        <Group position="apart">
          <Group spacing="xs">
            <ThemeIcon color={impactDetails.color} variant="light" size="md">
              {impactDetails.icon}
            </ThemeIcon>
            <Text 
              ref={titleRef} 
              weight={600} 
              size="lg"
            >
              {title}
            </Text>
          </Group>
          <Text size="xs" color="dimmed">{impactDetails.label}</Text>
        </Group>
        
        <Text ref={descRef} size="sm" color="dimmed">
          {description}
        </Text>
        
        <Stack spacing={4} mt={4}>
          <Text size="xs" weight={500}>AI Confidence</Text>
          <div 
            style={{ 
              height: 4, 
              backgroundColor: 'var(--mantine-color-gray-2)',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <div
              ref={confidenceRef}
              style={{
                width: `${confidence * 100}%`,
                height: '100%',
                backgroundColor: `var(--mantine-color-${impactDetails.color}-6)`,
                borderRadius: 2
              }}
            />
          </div>
        </Stack>
      </Stack>
    </Paper>
  );
};
```

### 5. AI Data Visualization

```tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Paper, Text, Group, Stack } from '@mantine/core';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AIDataVisualizationProps {
  title: string;
  data: DataPoint[];
  description?: string;
  highlighted?: string;
  maxValue?: number;
}

export const AIDataVisualization: React.FC<AIDataVisualizationProps> = ({
  title,
  data,
  description,
  highlighted,
  maxValue
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const highestValue = maxValue || Math.max(...data.map(d => d.value));
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const bars = containerRef.current.querySelectorAll('.data-bar');
    const labels = containerRef.current.querySelectorAll('.data-label');
    const values = containerRef.current.querySelectorAll('.data-value');
    
    // Animate the data visualization
    const timeline = gsap.timeline();
    
    // Staggered entrance for labels
    timeline.fromTo(labels,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
    
    // Bar growth animation
    timeline.fromTo(bars,
      { width: 0 },
      { 
        width: (i) => `${(data[i].value / highestValue) * 100}%`, 
        duration: 0.8, 
        stagger: 0.05, 
        ease: 'power2.out' 
      },
      '-=0.3'
    );
    
    // Values fade in
    timeline.fromTo(values,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
      '-=0.6'
    );
    
    // If there's a highlighted item, give it special treatment
    if (highlighted) {
      const highlightedIndex = data.findIndex(d => d.label === highlighted);
      if (highlightedIndex !== -1) {
        const highlightedBar = bars[highlightedIndex];
        const highlightedLabel = labels[highlightedIndex];
        const highlightedValue = values[highlightedIndex];
        
        timeline.to([highlightedBar, highlightedLabel, highlightedValue],
          { 
            scale: 1.05, 
            fontWeight: 'bold',
            filter: 'brightness(1.1)',
            duration: 0.3,
            ease: 'back.out(1.7)'
          },
          '+=0.2'
        );
      }
    }
  }, [data, highlighted, highestValue]);
  
  return (
    <Paper p="md" withBorder>
      <Stack spacing="lg">
        <Text weight={600} size="lg">{title}</Text>
        
        {description && (
          <Text size="sm" color="dimmed">{description}</Text>
        )}
        
        <div ref={containerRef}>
          {data.map((item, index) => (
            <Group position="apart" key={item.label} mb={8} align="center">
              <Text 
                className="data-label" 
                size="sm"
                style={{ 
                  minWidth: '100px',
                  fontWeight: item.label === highlighted ? 600 : 400
                }}
              >
                {item.label}
              </Text>
              
              <div style={{ 
                flex: 1, 
                height: 24, 
                backgroundColor: 'var(--mantine-color-gray-1)',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div 
                  className="data-bar"
                  style={{ 
                    width: `${(item.value / highestValue) * 100}%`,
                    height: '100%',
                    backgroundColor: item.color || 'var(--mantine-color-blue-6)',
                    borderRadius: 4,
                    transformOrigin: 'left center'
                  }}
                />
              </div>
              
              <Text 
                className="data-value" 
                size="sm" 
                ml={12}
                style={{ 
                  minWidth: '50px',
                  textAlign: 'right',
                  fontWeight: item.label === highlighted ? 600 : 400
                }}
              >
                {item.value.toLocaleString()}
              </Text>
            </Group>
          ))}
        </div>
      </Stack>
    </Paper>
  );
};
```

## Implementation Timeline

### Phase 1: Core AI Animation Infrastructure (Week 1)
- Set up animation utilities for AI-specific patterns
- Create basic components for confidence visualization
- Implement AI processing indicators
- Build animated AI chat response system

### Phase 2: Data Visualization Enhancements (Week 2)
- Create animated data bar/chart components
- Implement AI insights cards with entrance animations
- Build confidence-based animation intensity system
- Add text reveal animations for AI-generated content

### Phase 3: Integration with Business Features (Week 3)
- Implement Buy Box prediction animations
- Create price recommendation components with transitions
- Build marketplace integration status animations
- Add inventory recommendation visualizations

### Phase 4: Advanced AI Animation Patterns (Week 4)
- Implement AI data relationship visualizations
- Create heatmap animations for interest areas
- Build AI-driven filtering animations
- Add predictive animation patterns

## Performance Considerations

For AI animations specifically:

1. **Prioritize CPU Performance**: AI operations themselves can be CPU-intensive, so animations must be GPU-accelerated
2. **Variable Animation Detail**: Reduce animation complexity on lower-end devices
3. **Idle Animation Prevention**: Only animate when necessary, avoid constant animations
4. **Batch Updates**: Group AI data updates to prevent excessive re-rendering
5. **Progressive Loading**: Load and animate high-priority AI insights first

## Development Guidelines

1. Follow a test-driven approach for animation components
2. Document all AI animation patterns in Storybook
3. Include reduced motion alternatives for all AI animations
4. Implement device capability detection for adaptive animations
5. Use consistent easing and timing across all AI components

---

Last Updated: April 2, 2025