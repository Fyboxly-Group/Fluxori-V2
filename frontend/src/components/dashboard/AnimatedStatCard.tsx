import { useEffect, useRef, useState } from 'react';
import { Paper, Text, Group, Select, Stack, ThemeIcon } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';
import { gsap } from 'gsap';

export interface TimeRange {
  value: string;
  label: string;
}

export interface AnimatedStatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: (value: number) => string;
  icon?: React.ReactNode;
  color?: string;
  timeRanges?: TimeRange[];
  defaultTimeRange?: string;
  onTimeRangeChange?: (value: string) => void;
  className?: string;
  precision?: number;
}

export const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({
  title,
  value,
  previousValue,
  format = (val) => val.toLocaleString(),
  icon,
  color = 'blue',
  timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ],
  defaultTimeRange = 'week',
  onTimeRangeChange,
  className,
  precision = 0
}) => {
  const [timeRange, setTimeRange] = useState(defaultTimeRange);
  const [displayValue, setDisplayValue] = useState(value);
  const valueRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef(value);
  
  // Handle time range change
  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    }
  };
  
  // Calculate percentage change
  const percentChange = previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;
  
  // Animate value change
  useEffect(() => {
    if (valueRef.current && value !== prevValueRef.current) {
      // Animate the number
      gsap.to({ val: prevValueRef.current }, {
        val: value,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: function() {
          const newVal = Number(this.targets()[0].val.toFixed(precision));
          setDisplayValue(newVal);
        }
      });
      
      // Add a subtle pulse animation to the card
      if (cardRef.current) {
        // Create a more sophisticated animation sequence
        const tl = gsap.timeline();
        
        tl.fromTo(cardRef.current,
          { boxShadow: '0 0 0 rgba(0,0,0,0.1)' },
          { 
            boxShadow: '0 0 20px rgba(0,0,0,0.15)', 
            duration: 0.4,
            ease: 'power2.in'
          }
        )
        .to(cardRef.current, {
          y: -3,
          duration: 0.3,
          ease: 'power2.out'
        }, "-=0.2")
        .to(cardRef.current, {
          boxShadow: '0 0 0 rgba(0,0,0,0.1)',
          y: 0, 
          duration: 0.5,
          ease: 'power2.inOut'
        }, "+=0.1");
        
        // Also animate the percentage change indicator if it exists
        const percentageElement = cardRef.current.querySelector('.percentage-change');
        if (percentageElement && percentChange !== 0) {
          gsap.fromTo(percentageElement,
            { scale: 0.5, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              duration: 0.5, 
              delay: 0.3,
              ease: 'back.out(1.7)'
            }
          );
        }
      }
      
      // Update ref
      prevValueRef.current = value;
    }
  }, [value, precision, percentChange]);
  
  // Entrance animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);
  
  return (
    <Paper ref={cardRef} p="md" withBorder shadow="sm" className={className}>
      <Stack spacing="sm">
        <Group position="apart">
          <Group spacing="xs">
            {icon && (
              <ThemeIcon color={color} variant="light" size="md">
                {icon}
              </ThemeIcon>
            )}
            <Text weight={500}>{title}</Text>
          </Group>
          
          <Select
            size="xs"
            value={timeRange}
            onChange={handleTimeRangeChange}
            data={timeRanges}
            styles={{
              input: {
                fontWeight: 500,
                height: 26,
                minHeight: 26,
                lineHeight: 1
              }
            }}
          />
        </Group>
        
        <div>
          <Text ref={valueRef} size="xl" weight={700}>
            {format(displayValue)}
          </Text>
          
          {previousValue !== undefined && (
            <Group spacing="xs" mt={4} className="percentage-change">
              <ThemeIcon 
                color={percentChange > 0 ? 'green' : percentChange < 0 ? 'red' : 'gray'} 
                variant="light" 
                size="sm"
                sx={{
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.2)'
                  }
                }}
              >
                {percentChange > 0 ? (
                  <IconTrendingUp size={12} />
                ) : percentChange < 0 ? (
                  <IconTrendingDown size={12} />
                ) : (
                  <IconMinus size={12} />
                )}
              </ThemeIcon>
              
              <Text 
                size="xs" 
                color={percentChange > 0 ? 'green' : percentChange < 0 ? 'red' : 'dimmed'}
              >
                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
              </Text>
            </Group>
          )}
        </div>
      </Stack>
    </Paper>
  );
};

export default AnimatedStatCard;