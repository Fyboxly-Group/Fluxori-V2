import { useEffect, useRef } from 'react';
import { Box, Text, Group, ThemeIcon, Paper } from '@mantine/core';
import { IconBrain } from '@tabler/icons-react';
import { gsap } from 'gsap';

export interface AIProcessingIndicatorProps {
  active: boolean;
  label?: string;
  intensity?: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const AIProcessingIndicator: React.FC<AIProcessingIndicatorProps> = ({
  active,
  label = 'AI Processing',
  intensity = 'medium',
  size = 'md',
  showIcon = true,
  children,
  className,
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  
  // Get size values
  const getSize = () => {
    switch (size) {
      case 'sm': return { padding: '8px', fontSize: 12, iconSize: 14 };
      case 'lg': return { padding: '16px', fontSize: 16, iconSize: 20 };
      default: return { padding: '12px', fontSize: 14, iconSize: 16 };
    }
  };
  
  // Get intensity values
  const getIntensity = () => {
    switch (intensity) {
      case 'low': return { opacity: 0.03, duration: 3, delay: 0 };
      case 'high': return { opacity: 0.15, duration: 1.2, delay: 0.2 };
      default: return { opacity: 0.08, duration: 2, delay: 0.1 };
    }
  };
  
  const sizeValues = getSize();
  const intensityValues = getIntensity();
  
  // Animation effect
  useEffect(() => {
    if (containerRef.current && pulseRef.current && bgRef.current) {
      // Kill any existing animations
      gsap.killTweensOf([pulseRef.current, bgRef.current]);
      
      if (active) {
        // Create subtle wave effect for the background
        gsap.to(bgRef.current, {
          background: `linear-gradient(90deg, 
            rgba(0,122,255,${intensityValues.opacity / 3}) 0%, 
            rgba(0,122,255,${intensityValues.opacity}) 50%, 
            rgba(0,122,255,${intensityValues.opacity / 3}) 100%)`,
          backgroundSize: '200% 100%',
          backgroundPosition: '0% 0%',
          duration: 0.5,
          ease: 'power2.out'
        });
        
        gsap.to(bgRef.current, {
          backgroundPosition: '100% 0%',
          duration: intensityValues.duration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: intensityValues.delay
        });
        
        // Create pulse animation for the container
        gsap.fromTo(pulseRef.current,
          { boxShadow: `0 0 0 0 rgba(0,122,255,0)` },
          { 
            boxShadow: `0 0 0 8px rgba(0,122,255,0)`, 
            duration: intensityValues.duration * 0.8,
            repeat: -1,
            ease: 'sine.in'
          }
        );
      } else {
        // Reset to default state
        gsap.to(bgRef.current, {
          background: 'transparent',
          duration: 0.5,
          ease: 'power2.out'
        });
        
        gsap.to(pulseRef.current, {
          boxShadow: '0 0 0 0 rgba(0,122,255,0)',
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    }
  }, [active, intensity]);
  
  // If no children, return the pill-style indicator
  if (!children) {
    return (
      <Paper
        ref={containerRef}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: '100px',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s ease',
          ...style
        }}
      >
        <div
          ref={bgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0
          }}
        />
        
        <div
          ref={pulseRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            borderRadius: '100px'
          }}
        />
        
        <Group spacing="xs" p={sizeValues.padding} style={{ position: 'relative', zIndex: 1 }}>
          {showIcon && (
            <ThemeIcon size={sizeValues.iconSize} radius="xl" color="blue" variant="light">
              <IconBrain size={sizeValues.iconSize - 4} />
            </ThemeIcon>
          )}
          
          <Text size={sizeValues.fontSize} weight={500}>
            {label}
          </Text>
        </Group>
      </Paper>
    );
  }
  
  // If children are provided, wrap them with the indicator effect
  return (
    <Box
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        ...style
      }}
    >
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}
      />
      
      <div
        ref={pulseRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1
        }}
      />
      
      {active && showIcon && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 2
          }}
        >
          <ThemeIcon size={sizeValues.iconSize} radius="xl" color="blue" variant="filled">
            <IconBrain size={sizeValues.iconSize - 4} />
          </ThemeIcon>
        </div>
      )}
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </Box>
  );
};

export default AIProcessingIndicator;