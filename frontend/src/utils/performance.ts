/**
 * Performance monitoring utilities for measuring and tracking performance metrics
 */

// Performance marking utility for components
export const measureComponentPerformance = (
  componentName: string,
  action: 'mount' | 'update' | 'unmount'
) => {
  if (typeof window === 'undefined' || !window.performance || !window.performance.mark) {
    return;
  }

  const markName = `${componentName}-${action}`;
  try {
    performance.mark(markName);
    
    // For mount and update, measure time since navigation start
    if (action === 'mount' || action === 'update') {
      performance.measure(
        `${componentName}-${action}-duration`,
        undefined,
        markName
      );
    }
    
    // For mount, log the time to console in development
    if (action === 'mount' && process.env.NODE_ENV === 'development') {
      const entries = performance.getEntriesByName(`${componentName}-mount-duration`);
      if (entries.length > 0) {
        console.log(
          `%c${componentName} mounted in ${entries[0].duration.toFixed(2)}ms`,
          'color: #3498db; font-weight: bold;'
        );
      }
    }
  } catch (err) {
    // Silently fail
  }
};

// Hook to measure React component render performance
export const useComponentPerformance = (componentName: string) => {
  // Track mount time
  React.useEffect(() => {
    measureComponentPerformance(componentName, 'mount');
    
    return () => {
      measureComponentPerformance(componentName, 'unmount');
    };
  }, [componentName]);
  
  // Track update time using layout effect
  React.useLayoutEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const markName = `${componentName}-update`;
      performance.mark(markName);
    }
  });
};

// Animation performance metric collection
export const measureAnimationPerformance = (
  animationName: string, 
  startTime: number
) => {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Log animation performance in development
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `%c${animationName} completed in ${duration.toFixed(2)}ms`,
      'color: #9b59b6; font-weight: bold;'
    );
  }
  
  // Store metrics for analysis
  if (!window.__ANIMATION_METRICS__) {
    window.__ANIMATION_METRICS__ = [];
  }
  
  window.__ANIMATION_METRICS__.push({
    name: animationName,
    duration,
    timestamp: new Date().toISOString()
  });
  
  // Keep only the last 100 metrics
  if (window.__ANIMATION_METRICS__.length > 100) {
    window.__ANIMATION_METRICS__.shift();
  }
};

// Calculate FPS during animations
export const calculateFPS = (): number => {
  if (typeof window === 'undefined') return 60;
  
  if (!window.__FPS__) {
    window.__FPS__ = {
      frameCount: 0,
      lastTime: performance.now(),
      value: 60
    };
    
    const countFrame = () => {
      window.__FPS__.frameCount++;
      requestAnimationFrame(countFrame);
    };
    
    // Start counting frames
    requestAnimationFrame(countFrame);
    
    // Calculate FPS every second
    setInterval(() => {
      const now = performance.now();
      const elapsed = now - window.__FPS__.lastTime;
      window.__FPS__.value = Math.round((window.__FPS__.frameCount * 1000) / elapsed);
      window.__FPS__.frameCount = 0;
      window.__FPS__.lastTime = now;
    }, 1000);
  }
  
  return window.__FPS__.value;
};

// Define global types for metrics
declare global {
  interface Window {
    __ANIMATION_METRICS__?: Array<{
      name: string;
      duration: number;
      timestamp: string;
    }>;
    __FPS__?: {
      frameCount: number;
      lastTime: number;
      value: number;
    };
  }
}

// Performance monitoring widget (can be imported and used in development)
export const PerformanceMonitor: React.FC<{ visible?: boolean }> = ({ 
  visible = process.env.NODE_ENV === 'development' 
}) => {
  const [metrics, setMetrics] = React.useState<{
    fps: number;
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
    };
    recentAnimations: Array<{
      name: string;
      duration: number;
    }>;
  }>({
    fps: 60,
    recentAnimations: []
  });
  
  React.useEffect(() => {
    if (!visible) return;
    
    const updateMetrics = () => {
      setMetrics({
        fps: calculateFPS(),
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : undefined,
        recentAnimations: window.__ANIMATION_METRICS__ 
          ? window.__ANIMATION_METRICS__.slice(-5) 
          : []
      });
      
      requestAnimationFrame(updateMetrics);
    };
    
    requestAnimationFrame(updateMetrics);
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: 4,
        fontSize: 12,
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: 300,
        maxHeight: 200,
        overflow: 'auto'
      }}
    >
      <div>FPS: {metrics.fps}</div>
      {metrics.memory && (
        <div>
          Memory: {(metrics.memory.usedJSHeapSize / 1048576).toFixed(2)} MB / 
          {(metrics.memory.totalJSHeapSize / 1048576).toFixed(2)} MB
        </div>
      )}
      <div style={{ marginTop: 4 }}>
        <div>Recent Animations:</div>
        {metrics.recentAnimations.map((anim, i) => (
          <div key={i}>
            {anim.name}: {anim.duration.toFixed(2)}ms
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  measureComponentPerformance,
  useComponentPerformance,
  measureAnimationPerformance,
  calculateFPS,
  PerformanceMonitor
};