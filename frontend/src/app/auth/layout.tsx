/// <reference path="../../types/module-declarations.d.ts" />
'use client'

import React from 'react';
;
import { useColorMode } from '@/components/stubs/ChakraStubs';;
;
;
;

// Fix for Next.js module resolution
import { ChakraProvider } from "@chakra-ui/react";
import { Box, IconButton, Flex } from '@/utils/chakra/components';

;

// Placeholder for icons
const SunIcon = () => <Box>☀️</Box>
const MoonIcon = () => <Box>🌙</Box>

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { colorMode, toggleColorMode } = useColorMode()
  
  return (
    <Box minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
      {/* Color mode toggle */}
      <IconButton
        aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
        icon={colorMode === 'light' ? <MoonIcon   /> : <SunIcon />}
        position="absolute"
        top="4"
        right="4"
        zIndex="overlay"
        onClick={toggleColorMode}
        variant="ghost"
      />
      
      <Flex 
        minH="100vh" 
        align="center" 
        justify="center" 
        p={4}
      >
        {children}
      </Flex>
    </Box>
  )
}