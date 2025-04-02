import { useState, useEffect, MouseEvent, KeyboardEvent } from 'react';
import { createStyles } from '@mantine/core';

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

const useStyles = createStyles((theme) => ({
  skipLink: {
    position: 'absolute',
    top: '-50px', // Hidden by default
    left: '0',
    background: theme.colors.blue[6],
    color: theme.white,
    padding: '10px 15px',
    zIndex: 1000,
    transition: 'top 0.3s',
    fontWeight: 500,
    borderRadius: '0 0 4px 0',
    
    '&:focus': {
      top: '0', // Visible when focused
      outline: `2px solid ${theme.colors.blue[9]}`,
      textDecoration: 'none',
    },
  },
}));

/**
 * SkipLink component for keyboard accessibility
 * 
 * This component creates a link that's visually hidden but becomes
 * visible when focused with keyboard navigation. It allows keyboard
 * users to skip navigation and jump directly to the main content.
 */
export function SkipLink({ targetId, label = 'Skip to main content' }: SkipLinkProps) {
  const { classes } = useStyles();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Only render on client-side to avoid hydration issues
  if (!isMounted) {
    return null;
  }
  
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      // Reset tabIndex after focus
      setTimeout(() => {
        if (target) target.removeAttribute('tabindex');
      }, 1000);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick(e as unknown as MouseEvent<HTMLAnchorElement>);
    }
  };
  
  return (
    <a 
      href={`#${targetId}`}
      className={classes.skipLink}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid="skip-link"
    >
      {label}
    </a>
  );
}