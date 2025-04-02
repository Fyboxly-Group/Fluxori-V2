import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { MantineProvider, DirectionProvider } from '@mantine/core';
import { useI18n } from '@/hooks/accessibility/useI18n';

type Direction = 'ltr' | 'rtl';

interface RTLContextType {
  direction: Direction;
  isRTL: boolean;
  toggleDirection: () => void;
  setDirection: (dir: Direction) => void;
}

const RTLContext = createContext<RTLContextType>({
  direction: 'ltr',
  isRTL: false,
  toggleDirection: () => {},
  setDirection: () => {},
});

export const useRTL = () => useContext(RTLContext);

interface RTLProviderProps {
  children: ReactNode;
  initialDirection?: Direction;
}

export function RTLProvider({ 
  children, 
  initialDirection = 'ltr' 
}: RTLProviderProps) {
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const { language } = useI18n();
  
  // Automatically set direction based on language when language changes
  useEffect(() => {
    // List of RTL languages
    const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'dv', 'ha', 'ji', 'ps', 'sd', 'ug', 'yi'];
    
    if (language && rtlLanguages.includes(language)) {
      setDirection('rtl');
    } else {
      setDirection('ltr');
    }
  }, [language]);

  const isRTL = direction === 'rtl';
  
  const toggleDirection = () => {
    setDirection(prev => prev === 'ltr' ? 'rtl' : 'ltr');
  };

  const contextValue: RTLContextType = {
    direction,
    isRTL,
    toggleDirection,
    setDirection,
  };

  return (
    <RTLContext.Provider value={contextValue}>
      <DirectionProvider initialDirection={direction}>
        {children}
      </DirectionProvider>
    </RTLContext.Provider>
  );
}