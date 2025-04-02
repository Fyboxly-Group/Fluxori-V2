/// <reference path="../../types/module-declarations.d.ts" />
import React from 'react';
import { IconButton  } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
import { Sun, Moon } from 'lucide-react';

export function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  
  return (
    <IconButton
      aria-label="Toggle color mode"
      icon={colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      onClick={toggleColorMode}
      variant="ghost"
      size="md"
    />
  );
}

export default ColorModeToggle;