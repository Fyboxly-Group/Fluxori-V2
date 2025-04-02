/**
 * Simplified declaration file for Chakra UI components
 * This helps Next.js resolve imports correctly
 */

declare module '@chakra-ui/react' {
  export * from '@chakra-ui/react/dist';
}

// Add direct path declarations if needed
declare module '@chakra-ui/react/box' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/button' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/heading' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/text' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/form-control' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/input' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/card' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/link' {
  export * from '@chakra-ui/react';
}

// Add more modules as needed
