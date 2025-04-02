import React, { useEffect, useRef } from 'react';
import { Card, CardProps, Title, Text, Group } from '@mantine/core';
import { useAnimatedMount } from '@/hooks/useAnimation';
import { useHover } from '@mantine/hooks';
import gsap from 'gsap';

export interface AnimatedCardProps extends CardProps {
  /** Card title */
  title?: string;
  /** Card subtitle or description */
  description?: string;
  /** Whether to animate on hover */
  animateOnHover?: boolean;
  /** Type of entrance animation */
  entranceAnimation?: 'fadeInUp' | 'fadeIn' | 'scaleIn';
  /** Delay for the entrance animation */
  animationDelay?: number;
}

/**
 * AnimatedCard component with GSAP animations
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  title,
  description,
  animateOnHover = true,
  entranceAnimation = 'fadeInUp',
  animationDelay = 0,
  ...props
}) => {
  // Set up animations
  const cardRef = useAnimatedMount(entranceAnimation, {
    delay: animationDelay,
    duration: 0.6
  });
  
  const { hovered, ref: hoverRef } = useHover<HTMLDivElement>();
  
  // Combine refs
  const setRefs = (element: HTMLDivElement | null) => {
    // Cast to any to work with RefObject<HTMLDivElement> type
    (cardRef as any).current = element;
    if (typeof hoverRef === 'function') {
      hoverRef(element);
    } else if (hoverRef) {
      hoverRef.current = element;
    }
  };
  
  // Hover animation effect
  useEffect(() => {
    if (!animateOnHover || !(cardRef as any).current) return;
    
    const shadowTl = gsap.timeline({ paused: true })
      .to((cardRef as any).current, {
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        y: -5,
        duration: 0.3,
        ease: 'power2.out'
      });
    
    if (hovered) {
      shadowTl.play();
    } else {
      shadowTl.reverse();
    }
    
    return () => {
      shadowTl.kill();
    };
  }, [hovered, animateOnHover, cardRef]);
  
  return (
    <Card
      ref={setRefs}
      shadow="sm"
      radius="md"
      withBorder
      {...props}
    >
      {title && (
        <Group position="apart" mb={description ? 'xs' : 'md'}>
          <Title order={4}>{title}</Title>
        </Group>
      )}
      
      {description && (
        <Text color="dimmed" size="sm" mb="md">
          {description}
        </Text>
      )}
      
      {children}
    </Card>
  );
};

export default AnimatedCard;