import React, { useEffect, useRef } from 'react';
import { Card, Text, Group, ThemeIcon, Badge, Tooltip, useMantineTheme, Box } from '@mantine/core';
import { useAnimatedMount } from '@/hooks/useAnimation';
import gsap from 'gsap';

export interface AnimatedStatCardProps {
  /** Main metric value to display */
  value: string | number;
  /** Title of the stat */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Previous value for comparison */
  previousValue?: string | number;
  /** Icon for the stat */
  icon?: React.ReactNode;
  /** Percentage change from previous period */
  change?: number;
  /** Change direction (up is good, down is bad usually) */
  changeDirection?: 'positive' | 'negative';
  /** Label for the change period (e.g. "vs last month") */
  changePeriod?: string;
  /** Whether to animate the value counting up */
  animateValue?: boolean;
  /** Duration for number animation in seconds */
  animationDuration?: number;
  /** Delay before animation starts in seconds */
  animationDelay?: number;
}

/**
 * Animated stat card component with value counting animation
 * and dynamic styling based on change direction
 */
export const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({
  value,
  title,
  subtitle,
  previousValue,
  icon,
  change,
  changeDirection = 'positive',
  changePeriod = 'vs last period',
  animateValue = true,
  animationDuration = 1.5,
  animationDelay = 0.2,
}) => {
  const theme = useMantineTheme();
  const valueRef = useRef<HTMLDivElement>(null);
  const cardRef = useAnimatedMount('scaleIn', { duration: 0.4 });
  
  // Get color based on change direction
  const getChangeColor = (): string => {
    if (!change || change === 0) return 'gray';
    
    const isPositiveChange = change > 0;
    
    // If the change direction is positive, then positive change is green
    // Otherwise, positive change is red (e.g. for metrics where lower is better)
    if (changeDirection === 'positive') {
      return isPositiveChange ? 'green' : 'red';
    } else {
      return isPositiveChange ? 'red' : 'green';
    }
  };
  
  // Format the change value for display
  const formatChange = (): string => {
    if (!change) return '0%';
    
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };
  
  // Animate the value counting up
  useEffect(() => {
    if (!valueRef.current || !animateValue) return;
    
    let start = 0;
    const end = typeof value === 'number' ? value : 0;
    const duration = animationDuration;
    const element = valueRef.current;
    
    // For string values, don't animate
    if (typeof value === 'string') {
      element.textContent = value;
      return;
    }
    
    // Start from previous value if available
    if (typeof previousValue === 'number') {
      start = previousValue;
    }
    
    // Determine if we need to format with decimals
    const hasDecimals = String(value).includes('.');
    const decimalPlaces = hasDecimals ? String(value).split('.')[1].length : 0;
    
    // Create the counter animation with gsap
    gsap.fromTo(
      element,
      { innerHTML: start },
      {
        innerHTML: end,
        duration,
        delay: animationDelay,
        ease: 'power2.out',
        onUpdate: function() {
          // Format the number as it's counting up
          const current = parseFloat(this.targets()[0].innerHTML);
          element.textContent = hasDecimals 
            ? current.toFixed(decimalPlaces) 
            : Math.round(current).toString();
        }
      }
    );
    
    // Create subtle pulsing effect for emphasis
    gsap.fromTo(
      element,
      { scale: 1 },
      {
        scale: 1.05,
        duration: duration * 0.5,
        delay: animationDelay,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      }
    );
  }, [value, previousValue, animateValue, animationDuration, animationDelay]);
  
  return (
    <Card ref={cardRef} shadow="sm" radius="md" withBorder p="md">
      <Group position="apart" noWrap>
        <div>
          <Text size="xs" color="dimmed" weight={500}>
            {title}
          </Text>
          
          <Text 
            ref={valueRef}
            size="xl" 
            weight={700}
            style={{ fontSize: 28, lineHeight: 1.3 }}
          >
            {typeof value === 'number' ? '0' : value}
          </Text>
          
          {subtitle && (
            <Text size="xs" color="dimmed" mt={4}>
              {subtitle}
            </Text>
          )}
        </div>
        
        {icon && (
          <ThemeIcon 
            size={48} 
            radius="md" 
            variant="light"
            color={change ? getChangeColor() : 'blue'}
          >
            {icon}
          </ThemeIcon>
        )}
      </Group>
      
      {change !== undefined && (
        <Group position="apart" mt="md">
          <Tooltip label={`Previous value: ${previousValue}`} disabled={!previousValue}>
            <Badge 
              color={getChangeColor()} 
              variant="light"
              size="sm"
            >
              {formatChange()}
            </Badge>
          </Tooltip>
          
          <Text size="xs" color="dimmed">
            {changePeriod}
          </Text>
        </Group>
      )}
      
      {/* Optional sparkline or mini chart could go here */}
      <Box mt="md" h={30}>
        {/* Placeholder for future sparkline chart */}
      </Box>
    </Card>
  );
};

export default AnimatedStatCard;