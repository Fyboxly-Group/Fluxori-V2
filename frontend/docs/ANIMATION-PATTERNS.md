# Animation Patterns Guide

This guide documents the animation patterns used throughout the Fluxori V2 frontend application, powered by GSAP.

## Table of Contents

- [Animation Principles](#animation-principles)
- [Animation Hooks](#animation-hooks)
- [Common Animation Patterns](#common-animation-patterns)
- [Performance Optimization](#performance-optimization)
- [Accessibility Considerations](#accessibility-considerations)
- [Motion Preference Support](#motion-preference-support)
- [Advanced Animation Techniques](#advanced-animation-techniques)

## Animation Principles

Our animation system follows these core principles:

### 1. Purposeful Intelligence

Animations should communicate meaning and provide feedback:

- **Informative Motion**: Animations reflect system status and guide attention
- **Context Transitions**: Movement preserves spatial and contextual relationships
- **Responsive Feedback**: Animations provide immediate visual feedback
- **Hierarchy of Motion**: Important elements receive more pronounced animations

### 2. Fluid Efficiency

Animations should be smooth and performant:

- **Performance-First**: Optimized for minimal CPU/GPU impact
- **Natural Physics**: Following natural physics with appropriate easing and momentum
- **Consistent Timing**: Similar actions have consistent durations
- **Reduced Motion Support**: Respecting user preferences for reduced motion

### 3. Precision & Accuracy

Animations should be carefully calibrated:

- **Calibrated Timing**: 300-500ms for primary animations, 150-250ms for micro-interactions
- **Purposeful Easing**: Appropriate curves for different animation types
- **Coordinated Sequences**: Related elements animate in coordinated sequences
- **Pixel-Perfect Motion**: Animations move exactly as designed

## Animation Hooks

### `useAnimation`

Basic animation hook for simple effects.

```tsx
import { useAnimation } from '@/hooks/useAnimation';

function MyComponent() {
  const { ref, play, pause, restart } = useAnimation({
    animation: 'fadeIn',
    duration: 0.5,
    delay: 0.2
  });

  return <div ref={ref}>This will animate in</div>;
}
```

**Parameters:**

```ts
interface AnimationOptions {
  animation: 'fadeIn' | 'fadeOut' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'custom';
  duration?: number;
  delay?: number;
  ease?: string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  onComplete?: () => void;
}
```

### `useEnhancedAnimation`

Advanced animation hook with additional features.

```tsx
import { useEnhancedAnimation } from '@/hooks/useEnhancedAnimation';

function MyComponent() {
  const { ref, controls, timeline, scope } = useEnhancedAnimation({
    scope: 'myAnimation',
    timeline: {
      repeat: 0,
      yoyo: false,
      defaults: { 
        duration: 0.5, 
        ease: 'power2.out' 
      }
    }
  });

  const handleAnimate = () => {
    // Create a complex animation sequence
    timeline.current
      .to(scope.current.title, { y: 0, opacity: 1 })
      .to(scope.current.items, { y: 0, opacity: 1, stagger: 0.1 }, '-=0.3')
      .play();
  };

  return (
    <div ref={ref}>
      <h2 data-scope="title">Title</h2>
      <ul>
        <li data-scope="items">Item 1</li>
        <li data-scope="items">Item 2</li>
        <li data-scope="items">Item 3</li>
      </ul>
      <button onClick={handleAnimate}>Animate</button>
    </div>
  );
}
```

**Parameters:**

```ts
interface EnhancedAnimationOptions {
  scope?: string;
  timeline?: {
    defaults?: gsap.TweenVars;
    repeat?: number;
    yoyo?: boolean;
    paused?: boolean;
  };
  onComplete?: () => void;
  onReverseComplete?: () => void;
}
```

### `useAnimationOnScroll`

Hook for triggering animations on scroll.

```tsx
import { useAnimationOnScroll } from '@/hooks/useAnimationOnScroll';

function MyComponent() {
  const { ref } = useAnimationOnScroll({
    animation: 'fadeIn',
    threshold: 0.3,
    triggerOnce: true
  });

  return <div ref={ref}>This will animate when scrolled into view</div>;
}
```

**Parameters:**

```ts
interface ScrollAnimationOptions {
  animation: 'fadeIn' | 'fadeOut' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'custom';
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
  duration?: number;
  delay?: number;
  ease?: string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  onEnter?: () => void;
  onExit?: () => void;
}
```

### `useStaggerAnimation`

Hook for creating staggered animations for lists.

```tsx
import { useStaggerAnimation } from '@/hooks/useStaggerAnimation';

function MyList({ items }) {
  const { ref, play } = useStaggerAnimation({
    stagger: 0.1,
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    childSelector: '.list-item',
    delay: 0.2
  });

  return (
    <ul ref={ref}>
      {items.map(item => (
        <li key={item.id} className="list-item">{item.name}</li>
      ))}
    </ul>
  );
}
```

**Parameters:**

```ts
interface StaggerAnimationOptions {
  stagger: number;
  from?: gsap.TweenVars;
  to: gsap.TweenVars;
  childSelector: string;
  delay?: number;
  duration?: number;
  ease?: string;
  direction?: 'from-start' | 'from-end' | 'center' | 'edges';
  onComplete?: () => void;
}
```

### `useMotionPreference`

Hook for respecting user motion preferences.

```tsx
import { useMotionPreference } from '@/hooks/useMotionPreference';

function MyComponent() {
  const { motionLevel, reduced, setMotionLevel } = useMotionPreference();

  // Scale animation complexity based on motion level
  const animateDuration = motionLevel === 'minimal' ? 0 : 
                          motionLevel === 'moderate' ? 0.3 : 0.6;

  return (
    <div>
      {!reduced && (
        <AnimatedElement duration={animateDuration} />
      )}
      <select 
        value={motionLevel} 
        onChange={e => setMotionLevel(e.target.value)}
      >
        <option value="minimal">Minimal</option>
        <option value="moderate">Moderate</option>
        <option value="full">Full</option>
      </select>
    </div>
  );
}
```

**Return Values:**

```ts
interface MotionPreferenceReturnValue {
  motionLevel: 'minimal' | 'moderate' | 'full';
  reduced: boolean; // true if prefers-reduced-motion is enabled
  setMotionLevel: (level: 'minimal' | 'moderate' | 'full') => void;
  savePreference: (save: boolean) => void; // whether to persist preference
}
```

## Common Animation Patterns

### Entrance Animations

Standard entrance animations for components:

```tsx
// Fade in and slide up
gsap.from(element, {
  opacity: 0,
  y: 20,
  duration: 0.4,
  ease: 'power2.out'
});

// Staggered list items
gsap.from(listItems, {
  opacity: 0,
  y: 20,
  stagger: 0.08,
  duration: 0.4,
  ease: 'power2.out'
});

// Card entrance with scale
gsap.from(card, {
  opacity: 0,
  scale: 0.95,
  duration: 0.5,
  ease: 'back.out(1.7)'
});
```

### Feedback Animations

Animations for user feedback:

```tsx
// Button press animation
const handleButtonPress = () => {
  gsap.to(buttonRef.current, {
    scale: 0.95,
    duration: 0.1,
    ease: 'power2.in',
    onComplete: () => {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'back.out(3)'
      });
    }
  });
};

// Success animation with checkmark
const animateSuccess = () => {
  const tl = gsap.timeline();
  
  tl.to(circleRef.current, {
    scale: 1,
    opacity: 1,
    duration: 0.3,
    ease: 'power2.out'
  });
  
  tl.to(checkmarkRef.current, {
    strokeDashoffset: 0,
    duration: 0.5,
    ease: 'power2.inOut'
  }, '-=0.1');
};

// Error shake animation
const animateError = () => {
  gsap.timeline()
    .to(elementRef.current, { x: -6, duration: 0.1, ease: 'power2.inOut' })
    .to(elementRef.current, { x: 6, duration: 0.1, ease: 'power2.inOut' })
    .to(elementRef.current, { x: -3, duration: 0.1, ease: 'power2.inOut' })
    .to(elementRef.current, { x: 3, duration: 0.1, ease: 'power2.inOut' })
    .to(elementRef.current, { x: 0, duration: 0.1, ease: 'power2.inOut' });
};
```

### State Transition Animations

Animations for component state changes:

```tsx
// Expand/collapse animation
const toggleExpand = () => {
  const element = containerRef.current;
  const content = contentRef.current;
  
  if (isExpanded) {
    // Collapse
    gsap.to(content, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => setIsExpanded(false)
    });
  } else {
    // Expand
    setIsExpanded(true);
    gsap.from(content, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  }
};

// Tab switching animation
const switchTab = (index) => {
  const tl = gsap.timeline();
  
  // Fade out current content
  tl.to(currentContent, {
    opacity: 0,
    y: -10,
    duration: 0.2,
    ease: 'power1.in'
  });
  
  // Update active tab
  setActiveTab(index);
  
  // Fade in new content
  tl.to(newContent, {
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: 'power2.out'
  }, '+=0.05');
};
```

## Performance Optimization

### Hardware Acceleration

Enable hardware acceleration for smoother animations:

```tsx
// Use CSS transforms and opacity for best performance
gsap.set(element, { willChange: 'transform, opacity' });
gsap.to(element, {
  x: 100,
  opacity: 1,
  duration: 0.5,
  ease: 'power2.out',
  onComplete: () => {
    // Remove willChange after animation
    gsap.set(element, { willChange: 'auto' });
  }
});
```

### Animation Optimization

Techniques for optimizing animation performance:

```tsx
// Batch DOM operations with GSAP
const tl = gsap.timeline();
tl.to(items, { opacity: 1, duration: 0.3 });
tl.to(title, { y: 0, duration: 0.3 }, '-=0.2');
tl.to(button, { scale: 1, duration: 0.3 }, '-=0.2');

// Use requestAnimationFrame for throttling
let animationFrame;
const handleScroll = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  
  animationFrame = requestAnimationFrame(() => {
    // Animation logic here
    const scrollPosition = window.scrollY;
    gsap.to(element, { y: scrollPosition * 0.5 });
  });
};

// Cancel animations when component unmounts
useEffect(() => {
  const ctx = gsap.context(() => {
    // Animations here
  }, containerRef);
  
  return () => ctx.revert(); // Important for cleanup
}, []);
```

### Animation Budget

Guidelines for managing animation performance:

1. **Limit animated elements**: Keep the number of simultaneously animated elements under 20 for optimal performance
2. **Use transforms & opacity**: Avoid animating properties that cause layout reflows
3. **Stagger large lists**: For large lists, use stagger animations with higher intervals
4. **Reduce animation complexity**: Scale back animation complexity based on device capabilities
5. **Monitor FPS**: Use performance monitoring to detect animation bottlenecks

## Accessibility Considerations

### Respecting User Preferences

Always respect user preferences for reduced motion:

```tsx
import { useMotionPreference } from '@/hooks/useMotionPreference';

function AnimatedComponent() {
  const { reduced, motionLevel } = useMotionPreference();
  
  useEffect(() => {
    if (reduced || motionLevel === 'minimal') {
      // Skip animations or use simplified versions
      gsap.set(element, { opacity: 1, y: 0 });
    } else {
      // Use full animations
      gsap.from(element, {
        opacity: 0,
        y: 30,
        duration: motionLevel === 'moderate' ? 0.3 : 0.6,
        ease: 'power2.out'
      });
    }
  }, [reduced, motionLevel]);
  
  return <div ref={elementRef}>Content</div>;
}
```

### Animation Alternatives

Always provide non-animated alternatives for accessibility:

```tsx
function ExpandableSection({ title, children }) {
  const { reduced } = useMotionPreference();
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);
  
  const toggleExpand = () => {
    if (reduced) {
      // Immediately toggle without animation
      setIsExpanded(!isExpanded);
    } else {
      // Animate expansion/collapse
      if (isExpanded) {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          onComplete: () => setIsExpanded(false)
        });
      } else {
        setIsExpanded(true);
        gsap.from(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3
        });
      }
    }
  };
  
  return (
    <div>
      <button 
        onClick={toggleExpand}
        aria-expanded={isExpanded}
        aria-controls="content"
      >
        {title}
      </button>
      <div 
        id="content"
        ref={contentRef}
        aria-hidden={!isExpanded}
        style={{ display: isExpanded ? 'block' : 'none' }}
      >
        {children}
      </div>
    </div>
  );
}
```

## Motion Preference Support

Our application supports three levels of motion:

### 1. Minimal Motion

For users who prefer minimal or no animations:

- Skip entrance/exit animations
- No transition animations
- No decorative animations
- Use immediate state changes
- No parallax or scroll effects

### 2. Moderate Motion

A balanced approach with essential animations:

- Simplified entrance/exit animations (shorter, less movement)
- Basic feedback animations
- Simplified transitions
- No complex or decorative animations
- Reduced parallax and scroll effects

### 3. Full Motion

Complete motion design experience:

- Full entrance/exit animations
- Rich feedback animations with sequences
- Complex transitions with multiple elements
- Decorative animations
- Full parallax and scroll effects

## Advanced Animation Techniques

### GSAP Timeline Sequencing

Creating complex sequenced animations:

```tsx
function SequencedAnimation() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    const title = container.querySelector('.title');
    const items = container.querySelectorAll('.item');
    const button = container.querySelector('.button');
    
    const tl = gsap.timeline({
      defaults: { duration: 0.5, ease: 'power2.out' }
    });
    
    // Sequence multiple animations
    tl.from(title, { opacity: 0, y: -20 })
      .from(items, { opacity: 0, y: 20, stagger: 0.1 }, '-=0.2')
      .from(button, { opacity: 0, scale: 0.9 }, '-=0.3');
    
    return () => tl.kill(); // Clean up
  }, []);
  
  return (
    <div ref={containerRef}>
      <h2 className="title">Title</h2>
      <ul>
        <li className="item">Item 1</li>
        <li className="item">Item 2</li>
        <li className="item">Item 3</li>
      </ul>
      <button className="button">Submit</button>
    </div>
  );
}
```

### SplitText Animations

Text animations using GSAP's SplitText plugin:

```tsx
import { SplitText } from '@/animations/gsap';

function TextAnimation() {
  const textRef = useRef(null);
  
  useEffect(() => {
    if (!textRef.current) return;
    
    // Split text into characters
    const splitText = new SplitText(textRef.current, {
      type: 'chars,words',
      charsClass: 'character',
      wordsClass: 'word'
    });
    
    // Animate characters
    gsap.from(splitText.chars, {
      opacity: 0,
      y: 20,
      rotationX: -90,
      stagger: 0.02,
      duration: 0.5,
      ease: 'back.out(1.7)',
      onComplete: () => splitText.revert() // Clean up
    });
    
    return () => {
      splitText.revert();
    };
  }, []);
  
  return (
    <h1 ref={textRef} className="animated-title">
      Animated Heading Text
    </h1>
  );
}
```

### SVG Path Animations

Animating SVG paths with GSAP's DrawSVG plugin:

```tsx
import { DrawSVG } from '@/animations/gsap';

function PathAnimation() {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const paths = svgRef.current.querySelectorAll('path');
    
    // Set initial state
    gsap.set(paths, { drawSVG: 0 });
    
    // Animate paths
    const tl = gsap.timeline();
    tl.to(paths, {
      drawSVG: '100%',
      duration: 1.5,
      stagger: 0.1,
      ease: 'power2.inOut'
    });
    
    return () => tl.kill();
  }, []);
  
  return (
    <svg ref={svgRef} width="200" height="200" viewBox="0 0 200 200">
      <path d="M20,50 Q100,20 180,50" stroke="black" fill="none" />
      <path d="M20,100 Q100,70 180,100" stroke="black" fill="none" />
      <path d="M20,150 Q100,120 180,150" stroke="black" fill="none" />
    </svg>
  );
}
```

### Scroll-Driven Animations

Creating scroll-triggered animations:

```tsx
import { ScrollTrigger } from '@/animations/gsap';

function ScrollAnimation() {
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const section = sectionRef.current;
    const title = section.querySelector('.title');
    const image = section.querySelector('.image');
    const content = section.querySelector('.content');
    
    // Create scroll-triggered animation
    gsap.registerPlugin(ScrollTrigger);
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        // markers: true // Useful for debugging
      }
    });
    
    tl.from(title, { opacity: 0, y: 50, duration: 0.6 })
      .from(image, { opacity: 0, scale: 0.8, duration: 0.6 }, '-=0.4')
      .from(content, { opacity: 0, y: 30, duration: 0.6 }, '-=0.4');
    
    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    };
  }, []);
  
  return (
    <section ref={sectionRef} className="scroll-section">
      <h2 className="title">Section Title</h2>
      <img src="/image.jpg" alt="Description" className="image" />
      <div className="content">
        <p>Content paragraph...</p>
      </div>
    </section>
  );
}
```