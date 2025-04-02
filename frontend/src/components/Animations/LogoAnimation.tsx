import React, { useEffect, useRef } from 'react';
import { Box, useMantineTheme } from '@mantine/core';
import { useDrawSVG, useTextReveal } from '@/hooks/useAnimation';
import { isGSAPPluginAvailable, drawSVG, morphSVG, revealText } from '@/animations/gsap';
import gsap from 'gsap';

interface LogoAnimationProps {
  delay?: number;
  loop?: boolean;
  onComplete?: () => void;
}

/**
 * Animated logo component using GSAP Business features
 */
export const LogoAnimation: React.FC<LogoAnimationProps> = ({
  delay = 0,
  loop = false,
  onComplete,
}) => {
  const theme = useMantineTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useTextReveal({ delay: delay + 1.2, stagger: 0.05 });
  const iconRef = useDrawSVG({ delay, duration: 1.5 });
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create master timeline
    const masterTl = gsap.timeline({
      delay,
      onComplete,
      repeat: loop ? -1 : 0,
      repeatDelay: loop ? 2 : 0,
    });
    
    const container = containerRef.current;
    const paths = container.querySelectorAll('path');
    const textElement = container.querySelector('.logo-text');
    
    // Create logo animation sequence
    const sequence = gsap.timeline();
    
    // Draw SVG paths using DrawSVG plugin if available
    if (isGSAPPluginAvailable('DrawSVG')) {
      sequence.fromTo(
        paths, 
        { drawSVG: '0%' }, 
        { 
          drawSVG: '100%', 
          duration: 1.5, 
          stagger: 0.15,
          ease: 'power2.inOut'
        }
      );
    } else {
      // Fallback animation if DrawSVG is not available
      sequence.fromTo(
        paths, 
        { opacity: 0, scale: 0.8 }, 
        { 
          opacity: 1, 
          scale: 1, 
          duration: 1.5, 
          stagger: 0.15,
          ease: 'power2.out'
        }
      );
    }
    
    // Add color change animation
    sequence.to(
      paths, 
      { 
        stroke: theme.colors.brand[6], 
        duration: 0.5, 
        stagger: 0.05,
        ease: 'power2.inOut'
      },
      '-=0.5'
    );
    
    // Add text reveal animation with SplitText if available
    if (textElement) {
      if (isGSAPPluginAvailable('SplitText')) {
        // This will use SplitText via the revealText function
        sequence.add(
          revealText(textElement, { 
            duration: 0.8, 
            stagger: 0.05, 
            ease: 'power2.out' 
          }),
          '-=0.3'
        );
      } else {
        // Fallback animation if SplitText is not available
        sequence.fromTo(
          textElement,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.3'
        );
      }
    }
    
    // Add the sequence to the master timeline
    masterTl.add(sequence);
    
    // Clean up the animation when the component unmounts
    return () => {
      masterTl.kill();
    };
  }, [delay, loop, onComplete, theme.colors]);
  
  return (
    <Box ref={containerRef} sx={{ position: 'relative', maxWidth: 400, margin: '0 auto' }}>
      {/* SVG Logo */}
      <svg 
        viewBox="0 0 240 80" 
        width="100%" 
        height="100%" 
        fill="none" 
        ref={iconRef}
      >
        <path 
          d="M40 20 C40 8.954 48.954 0 60 0 H180 C191.046 0 200 8.954 200 20 V60 C200 71.046 191.046 80 180 80 H60 C48.954 80 40 71.046 40 60 V20 Z" 
          stroke={theme.colors.brand[5]} 
          strokeWidth="3" 
          fill="none" 
        />
        <path 
          d="M60 40 L90 20 L120 60 L150 20 L180 40" 
          stroke={theme.colors.brand[5]} 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M70 60 L170 60" 
          stroke={theme.colors.brand[5]} 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round" 
        />
      </svg>
      
      {/* Logo Text */}
      <Box 
        className="logo-text" 
        ref={textRef}
        sx={{ 
          textAlign: 'center', 
          marginTop: theme.spacing.md,
          fontFamily: theme.headings.fontFamily,
          fontWeight: 700,
          fontSize: 28,
          color: theme.colors.brand[6]
        }}
      >
        FLUXORI
      </Box>
    </Box>
  );
};

export default LogoAnimation;