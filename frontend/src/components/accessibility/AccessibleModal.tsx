import { useEffect, useRef } from 'react';
import { Modal, ModalProps, useMantineTheme } from '@mantine/core';
import { useFocusTrap } from '@/hooks/accessibility/useFocusTrap';
import { announce } from '@/utils/accessibility/announcer';
import { useRTL } from './RTLProvider';
import { useAnimation } from '@/hooks/useAnimation';
import { useAnimationA11y } from '@/hooks/accessibility/useAnimationA11y';

interface AccessibleModalProps extends Omit<ModalProps, 'opened' | 'onClose'> {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel?: string;
  focusAfterClose?: HTMLElement | null;
  announceOnOpen?: boolean;
  announceOnClose?: boolean;
  customOpenAnnouncement?: string;
  customCloseAnnouncement?: string;
}

/**
 * Accessible Modal component with focus trapping, screen reader
 * announcements, and RTL support.
 */
export function AccessibleModal({
  isOpen,
  onClose,
  ariaLabel,
  children,
  title,
  focusAfterClose = null,
  announceOnOpen = true,
  announceOnClose = true,
  customOpenAnnouncement,
  customCloseAnnouncement,
  ...props
}: AccessibleModalProps) {
  const theme = useMantineTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const { direction } = useRTL();
  const { trapFocus, releaseFocus } = useFocusTrap({
    active: isOpen,
    initialFocus: true,
    returnFocusOnDeactivate: true,
    escapeDeactivates: true,
    onDeactivate: onClose,
  });
  
  // Use animation utilities for accessible animations
  const { animationRef, animate } = useAnimation();
  const { setAriaAttributes } = useAnimationA11y({
    animationType: isOpen ? 'enter' : 'exit',
    announcementEnter: customOpenAnnouncement || `Dialog opened: ${title || ariaLabel || 'Modal dialog'}`,
    announcementExit: customCloseAnnouncement || `Dialog closed: ${title || ariaLabel || 'Modal dialog'}`,
    announceAnimations: false, // We'll handle announcements manually
  });
  
  // Handle focus trapping and announcements when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Handle modal open
      trapFocus(modalRef.current);
      
      // Announce to screen readers
      if (announceOnOpen) {
        announce(
          customOpenAnnouncement || 
          `Dialog opened: ${title || ariaLabel || 'Modal dialog'}`,
          'assertive'
        );
      }
      
      // Run opening animation
      if (modalRef.current) {
        animate(modalRef.current, {
          from: { opacity: 0, scale: 0.9 },
          to: { opacity: 1, scale: 1 },
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    } else {
      // Handle modal close
      releaseFocus(focusAfterClose);
      
      // Announce to screen readers
      if (announceOnClose) {
        announce(
          customCloseAnnouncement || 
          `Dialog closed: ${title || ariaLabel || 'Modal dialog'}`,
          'polite'
        );
      }
    }
    
    // Cleanup function
    return () => {
      releaseFocus(focusAfterClose);
    };
  }, [isOpen, trapFocus, releaseFocus, focusAfterClose, announceOnOpen, announceOnClose]);
  
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={title}
      dir={direction}
      ref={(node) => {
        // @ts-ignore - Mantine's ref type doesn't match ours, but this works
        modalRef.current = node?.modalRef?.current || null;
        
        // Apply animation ref
        if (node?.modalRef?.current) {
          animationRef.current = node.modalRef.current;
          setAriaAttributes(node.modalRef.current);
        }
      }}
      trapFocus={false} // We're handling focus trapping ourselves
      aria-label={ariaLabel || (typeof title === 'string' ? title : 'Modal dialog')}
      returnFocus={false} // We're handling focus return ourselves
      {...props}
    >
      {children}
    </Modal>
  );
}