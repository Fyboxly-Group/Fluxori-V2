import { useEffect, useState } from 'react';

export type MotionLevel = 'full' | 'essential' | 'minimal';

export interface MotionPreference {
  /**
   * Whether reduced motion is enabled at OS level
   */
  reduced: boolean;
  
  /**
   * Whether the user has configured a specific motion preference
   */
  userConfigured: boolean;
  
  /**
   * Motion level setting:
   * - full: All animations
   * - essential: Only animations that are essential for UX
   * - minimal: Bare minimum transitions
   */
  level: MotionLevel;
}

/**
 * Hook to manage and detect motion preferences
 * Adheres to Fluxori's Motion Design Guide accessibility considerations
 */
export const useMotionPreference = () => {
  const [motionPreference, setMotionPreference] = useState<MotionPreference>({
    reduced: false,
    userConfigured: false,
    level: 'full'
  });
  
  useEffect(() => {
    // Check OS-level preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (query: MediaQueryListEvent | MediaQueryList) => {
      const reduced = query.matches;
      setMotionPreference(prev => ({
        ...prev,
        reduced,
        level: prev.userConfigured ? prev.level : (reduced ? 'essential' : 'full')
      }));
    };
    
    updateMotionPreference(reducedMotionQuery);
    
    // Setup event listener
    const handleChange = (e: MediaQueryListEvent) => updateMotionPreference(e);
    reducedMotionQuery.addEventListener('change', handleChange);
    
    // Check for app-specific setting (from localStorage)
    const userSetting = localStorage.getItem('motionPreference');
    if (userSetting) {
      setMotionPreference(prev => ({
        ...prev,
        userConfigured: true,
        level: userSetting as MotionLevel
      }));
    }
    
    return () => {
      reducedMotionQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  /**
   * Update the user's motion preference
   * @param level Motion level preference
   */
  const setUserMotionPreference = (level: MotionLevel) => {
    localStorage.setItem('motionPreference', level);
    setMotionPreference(prev => ({
      ...prev,
      userConfigured: true,
      level
    }));
  };
  
  return {
    motionPreference,
    setUserMotionPreference
  };
};

export default useMotionPreference;