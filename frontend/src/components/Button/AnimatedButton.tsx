import React from 'react';
import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import gsap from 'gsap';

export interface AnimatedButtonProps extends MantineButtonProps {
  /** Enable hover animation */
  animateHover?: boolean;
  /** Enable click animation */
  animateClick?: boolean;
}

/**
 * AnimatedButton component that extends Mantine Button with GSAP animations
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  animateHover = true,
  animateClick = true,
  ...props
}) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { hovered, ref: hoverRef } = useHover<HTMLButtonElement>();
  
  // Combine refs
  const setRefs = (element: HTMLButtonElement | null) => {
    buttonRef.current = element;
    if (typeof hoverRef === 'function') {
      hoverRef(element);
    } else if (hoverRef) {
      hoverRef.current = element;
    }
  };
  
  // Hover animation effect
  React.useEffect(() => {
    if (!animateHover || !buttonRef.current) return;
    
    if (hovered) {
      gsap.to(buttonRef.current, {
        scale: 1.03,
        duration: 0.2,
        ease: 'power1.out'
      });
    } else {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power1.out'
      });
    }
  }, [hovered, animateHover]);
  
  // Click animation
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animateClick && buttonRef.current) {
      const button = buttonRef.current;
      
      gsap.timeline()
        .to(button, {
          scale: 0.97,
          duration: 0.1,
          ease: 'power1.in'
        })
        .to(button, {
          scale: 1,
          duration: 0.2,
          ease: 'elastic.out(1.2, 0.5)'
        });
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  return (
    <MantineButton
      ref={setRefs}
      onClick={handleClick}
      {...props}
    >
      {children}
    </MantineButton>
  );
};

export default AnimatedButton;