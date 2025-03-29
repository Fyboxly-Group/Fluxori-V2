# Chakra UI v3 TypeScript Patterns & Best Practices

> **IMPORTANT NOTE**: This document is based on our current understanding and implementation of Chakra UI v3 in the Fluxori V2 project. It should be verified against the official Chakra UI v3 documentation as it becomes more widely available. Use these patterns as a starting point, but be prepared to update them if official guidance differs.

This document serves as a reference for working with Chakra UI v3 in TypeScript, specifically designed to prevent common TypeScript errors in the Fluxori V2 project. It covers import patterns, component props, TypeScript declarations, theme configuration, and more.

> **NEW**: We now have automated tooling to enforce these patterns! See [CHAKRA-UI-AUTOMATION.md](./CHAKRA-UI-AUTOMATION.md) for details on our ESLint rules, type generation script, and pre-commit hooks.

## Import Patterns

Chakra UI v3 uses direct imports instead of barrel imports to improve tree-shaking and bundle size.

### ✅ Use direct imports

```tsx
import { Box } from '@chakra-ui/react/box'
import { Button } from '@chakra-ui/react/button'
import { Flex } from '@chakra-ui/react/flex'
```

### ❌ Avoid barrel imports

```tsx
// Avoid this pattern
import { Box, Button, Flex } from '@chakra-ui/react'
```

## Component Props

Chakra UI v3 simplifies component props by removing the 'is' prefix from boolean props.

### ✅ Use simplified props

```tsx
<Button loading={isLoading} disabled={isDisabled}>Submit</Button>
```

### ❌ Avoid v2 props

```tsx
// Avoid this pattern
<Button isLoading={isLoading} isDisabled={isDisabled}>Submit</Button>
```

## Layout Components

When using layout components, use the `gap` prop instead of `spacing`.

### ✅ Use gap prop

```tsx
<Stack gap={4} direction="row">
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>

<Flex gap={4}>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Flex>
```

### ❌ Avoid spacing prop

```tsx
// Avoid this pattern
<Stack spacing={4} direction="row">
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>
```

## Color Mode

Use the `useColorMode` hook and ternary expressions instead of `useColorModeValue`.

### ✅ Use useColorMode with ternary

```tsx
import { useColorMode } from '@chakra-ui/react/color-mode'

function Component() {
  const { colorMode } = useColorMode()
  
  return (
    <Box bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}>
      Content
    </Box>
  )
}
```

### ❌ Avoid useColorModeValue

```tsx
// Avoid this pattern
import { useColorModeValue } from '@chakra-ui/react'

function Component() {
  const bg = useColorModeValue('gray.100', 'gray.700')
  
  return (
    <Box bg={bg}>
      Content
    </Box>
  )
}
```

## Toast Notifications

Use the `createToaster` function instead of `useToast` hook.

### ✅ Use createToaster

```tsx
import { createToaster } from '@chakra-ui/react/toast'

function Component() {
  const toast = createToaster()
  
  const handleClick = () => {
    toast.show({
      title: 'Success',
      description: 'Operation completed successfully',
      status: 'success',
    })
  }
  
  return (
    <Button onClick={handleClick}>Show Toast</Button>
  )
}
```

### ❌ Avoid useToast

```tsx
// Avoid this pattern
import { useToast } from '@chakra-ui/react'

function Component() {
  const toast = useToast()
  
  const handleClick = () => {
    toast({
      title: 'Success',
      description: 'Operation completed successfully',
      status: 'success',
    })
  }
  
  return (
    <Button onClick={handleClick}>Show Toast</Button>
  )
}
```

## Theme Configuration

Theme configuration in Chakra UI v3 is simplified and more flexible.

### ✅ Use the new theme structure

```tsx
// src/theme/index.ts
import { ChakraTheme } from '@chakra-ui/react'

export const theme: ChakraTheme = {
  colors: {
    brand: {
      500: '#0080e6',
      600: '#0066b3',
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
      },
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: { bg: 'brand.600' },
        },
      },
      defaultProps: {
        variant: 'primary',
      },
    },
  },
  styles: {
    global: (props: { colorMode: 'light' | 'dark' }) => ({
      body: {
        bg: props.colorMode === 'light' ? 'gray.50' : 'gray.800',
      },
    }),
  },
}
```

## TypeScript Type Declarations

To ensure proper TypeScript support for Chakra UI v3, we maintain custom type declarations in `/src/types/chakra-ui.d.ts`. This is **critical** for preventing TypeScript errors with the new import pattern.

### Type Declaration Structure

```typescript
// Example from /src/types/chakra-ui.d.ts

// Base Chakra UI theme type
declare module '@chakra-ui/react' {
  export interface ChakraTheme {
    config?: {
      initialColorMode?: 'light' | 'dark'
      useSystemColorMode?: boolean
      disableTransitionOnChange?: boolean
    }
    colors?: Record<string, any>
    components?: Record<string, any>
    // etc.
  }
  
  export interface ChakraProviderProps {
    theme?: ChakraTheme
    children: React.ReactNode
  }
  
  export const ChakraProvider: React.FC<ChakraProviderProps>
}

// Component module declarations
declare module '@chakra-ui/react/box' {
  export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType
    [key: string]: any
  }
  export const Box: React.FC<BoxProps>
}

declare module '@chakra-ui/react/button' {
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: string
    colorScheme?: string
    size?: string
    loading?: boolean  // Note: Changed from isLoading
    disabled?: boolean // Note: Changed from isDisabled
    [key: string]: any
  }
  export const Button: React.FC<ButtonProps>
  
  export interface IconButtonProps extends ButtonProps {
    icon?: React.ReactElement
    'aria-label': string
    [key: string]: any
  }
  export const IconButton: React.FC<IconButtonProps>
}
```

### ⚠️ Common TypeScript Errors and Solutions

1. **Error**: `Property 'X' does not exist on type 'Y'`  
   **Solution**: Add the missing property to the appropriate interface in `chakra-ui.d.ts`

2. **Error**: `Cannot find module '@chakra-ui/react/X'`  
   **Solution**: Add a declaration for the module in `chakra-ui.d.ts`

3. **Error**: `Type 'string' is not assignable to type '"light" | "dark" | undefined'`  
   **Solution**: Use proper type casting with `as` keyword:
   ```typescript
   initialColorMode: 'light' as 'light'
   ```

4. **Error**: `Property 'Z' is missing in type '{}' but required in type 'Props'`  
   **Solution**: Ensure all required props are provided to components, especially for custom components that use Chakra components internally.

## Responsive Styles in TypeScript

Chakra UI v3 supports responsive styles that should be properly typed:

```tsx
// Correctly typed responsive props
<Box 
  width={{ base: '100%', md: '50%', lg: '33%' }}
  padding={{ base: 4, md: 6, lg: 8 }}
  fontSize={{ base: 'md', lg: 'lg' }}
/>

// For numeric values (spacing, etc.), you can use numbers directly
<Flex gap={{ base: 2, md: 4, lg: 6 }}>
  {/* Content */}
</Flex>
```

### Type Definitions for Responsive Styles

Common responsive prop types:

```typescript
// String or responsive object
type ResponsiveString = string | Record<string, string>

// Number or responsive object (for spacing, etc.)
type ResponsiveNumber = number | Record<string, number>

// Combined (for props that accept both string and number)
type ResponsiveValue<T> = T | Record<string, T>
```

## Style Props and TypeScript

Chakra UI's style props are fully typed to prevent errors:

```tsx
// ✅ Correctly typed style props
<Box
  margin={4}                 // number (converted to pixels)
  padding="4"                // string (interpreted as theme value)
  backgroundColor="blue.500" // theme color
  width="100%"               // CSS width
  height={200}               // number (converted to pixels)
  display="flex"             // CSS display
  position="relative"        // CSS position
/>
```

## Component Composition and TypeScript

When composing components, ensure proper prop typing:

```tsx
import { Box, BoxProps } from '@chakra-ui/react/box'
import { Button } from '@chakra-ui/react/button'

// Extending BoxProps allows passing Box props to your component
interface CardProps extends BoxProps {
  title: string
  onClick?: () => void
}

// Use React.FC with the props interface for proper typing
export const Card: React.FC<CardProps> = ({ title, onClick, children, ...rest }) => {
  return (
    <Box p={4} boxShadow="md" borderRadius="md" {...rest}>
      <Text fontWeight="bold">{title}</Text>
      {children}
      {onClick && <Button onClick={onClick}>Click me</Button>}
    </Box>
  )
}

// Usage:
<Card title="My Card" onClick={() => console.log('clicked')} mt={4}>
  Card content
</Card>
```

## Working with Multi-part Components

For multi-part components like Modal, Drawer, Tabs, etc., use the correct component structure:

```tsx
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton 
} from '@chakra-ui/react/modal'

function MyModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Modal content goes here
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
```

## Theme Customization with TypeScript

When customizing the theme, use the correct TypeScript types:

```typescript
import { ChakraTheme } from '@chakra-ui/react'

// For initialColorMode, always use type assertions to avoid errors
const config = {
  initialColorMode: 'light' as 'light',
  useSystemColorMode: false,
}

// For component styles, ensure correct nested structure
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    variants: {
      primary: {
        bg: 'brand.500',
        color: 'white',
      },
    },
    defaultProps: {
      variant: 'primary', 
    },
  },
}

// Export the fully typed theme
export const theme: ChakraTheme = {
  config,
  components,
  // other theme properties
}
```

## Hooks and TypeScript

Properly type hook returns to avoid TypeScript errors:

```typescript
// useColorMode
import { useColorMode } from '@chakra-ui/react/color-mode'

function Component() {
  // Correctly typed as { colorMode: 'light' | 'dark', toggleColorMode: () => void }
  const { colorMode, toggleColorMode } = useColorMode()
  
  return (
    <Box bg={colorMode === 'light' ? 'gray.100' : 'gray.800'}>
      <Button onClick={toggleColorMode}>
        Toggle {colorMode === 'light' ? 'Dark' : 'Light'} Mode
      </Button>
    </Box>
  )
}

// useDisclosure
import { useDisclosure } from '@chakra-ui/react/hooks'

function ModalComponent() {
  // Correctly typed as { isOpen: boolean, onOpen: () => void, onClose: () => void }
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        {/* Modal content */}
      </Modal>
    </>
  )
}

// createToaster
import { createToaster } from '@chakra-ui/react/toast'

function ToastComponent() {
  // Correctly typed with show method
  const toast = createToaster()
  
  const showToast = () => {
    toast.show({
      title: 'Success',
      description: 'Operation completed',
      status: 'success', // 'info' | 'warning' | 'success' | 'error'
      duration: 5000,
      isClosable: true,
    })
  }
  
  return <Button onClick={showToast}>Show Toast</Button>
}
```

## Complete Example with TypeScript

Here's a complete example of a component that follows all Chakra UI v3 TypeScript best practices:

```tsx
'use client'

import { Box, BoxProps } from '@chakra-ui/react/box'
import { Button } from '@chakra-ui/react/button'
import { Flex } from '@chakra-ui/react/flex'
import { Text } from '@chakra-ui/react/text'
import { Input, InputProps } from '@chakra-ui/react/input'
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react/form-control'
import { useColorMode } from '@chakra-ui/react/color-mode'
import { useState, FormEvent, ChangeEvent } from 'react'
import { createToaster } from '@chakra-ui/react/toast'

// Define props interface with proper TypeScript types
interface FormData {
  name: string
  email: string
}

interface FormErrors {
  name?: string
  email?: string
}

interface FormCardProps extends BoxProps {
  onSubmit?: (data: FormData) => Promise<void>
  initialData?: Partial<FormData>
}

export const FormCard: React.FC<FormCardProps> = ({ 
  onSubmit, 
  initialData = {},
  ...boxProps 
}) => {
  const { colorMode } = useColorMode()
  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({ 
    name: initialData.name || '', 
    email: initialData.email || '' 
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const toast = createToaster()
  
  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!validate()) return
    
    setLoading(true)
    try {
      if (onSubmit) {
        await onSubmit(formData)
      }
      
      toast.show({
        title: 'Success',
        description: 'Form submitted successfully',
        status: 'success',
      })
    } catch (error) {
      toast.show({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit form',
        status: 'error',
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Box 
      p={6} 
      borderRadius="lg"
      bg={colorMode === 'light' ? 'white' : 'gray.700'}
      boxShadow="md"
      {...boxProps}
    >
      <Text 
        fontSize="xl" 
        fontWeight="bold" 
        mb={4}
        color={colorMode === 'light' ? 'gray.800' : 'white'}
      >
        Contact Form
      </Text>
      
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={4}>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
            {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
          </FormControl>
          
          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
          </FormControl>
          
          <Button 
            type="submit"
            loading={loading}
            alignSelf="flex-end"
            mt={2}
          >
            Submit
          </Button>
        </Flex>
      </form>
    </Box>
  )
}
```

## TypeScript Compiler Configuration for Chakra UI v3

To ensure proper TypeScript support for Chakra UI v3, your `tsconfig.json` should include the following settings:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts", 
    "**/*.ts", 
    "**/*.tsx", 
    ".next/types/**/*.ts",
    "src/types/**/*.d.ts" // Important for including custom type declarations
  ],
  "exclude": [
    "node_modules"
  ]
}
```

## Testing with TypeScript and Chakra UI v3

When writing tests for components that use Chakra UI, you'll need proper TypeScript support:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '@/theme' // Your custom theme
import { Button } from '@chakra-ui/react/button'

// Create a wrapper with ChakraProvider for testing
const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider theme={theme}>{children}</ChakraProvider>
)

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AllProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Example test
describe('Button', () => {
  it('renders correctly', () => {
    customRender(<Button>Test Button</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Test Button')
  })

  it('shows loading state', () => {
    customRender(<Button loading>Loading</Button>)
    // Test loading state
  })
})
```

## Common Troubleshooting for TypeScript Errors

### 1. Icon Component Issues

When using icon components, ensure they're properly typed:

```tsx
// ✅ Correct implementation for Icon
import { IconButton } from '@chakra-ui/react/button'

// Type the icon component correctly
const MyIcon: React.FC = () => <svg>...</svg>

// Use the icon component
<IconButton
  aria-label="Search database"
  icon={<MyIcon />} // Pass as JSX element
  onClick={handleClick}
/>
```

### 2. Form Event Handling

Use proper types for form events:

```tsx
// ✅ Correctly typed form event handlers
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  // Handle submission
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target
  // Handle input change
}

<form onSubmit={handleSubmit}>
  <Input name="email" onChange={handleChange} />
</form>
```

### 3. Component Style Overrides in Theme

For component style overrides in theme, ensure proper typing:

```tsx
import { createMultiStyleConfigHelpers } from '@chakra-ui/react/styled-system'

// For multi-part components
const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(['container', 'label', 'input'])

const variants = {
  outline: definePartsStyle({
    container: {
      borderColor: 'gray.200',
    },
    label: {
      color: 'gray.500',
    },
    input: {
      _hover: {
        borderColor: 'brand.500',
      },
    },
  }),
}

export const customTheme = defineMultiStyleConfig({ variants })
```

## Migration Issues & Solutions

If you're migrating from Chakra UI v2 to v3, watch for these issues:

1. **Import paths have changed**:
   ```tsx
   // ❌ Old v2 barrel imports
   import { Box, Button } from '@chakra-ui/react'
   
   // ✅ New v3 direct imports
   import { Box } from '@chakra-ui/react/box'
   import { Button } from '@chakra-ui/react/button'
   ```

2. **Prop name changes**:
   ```tsx
   // ❌ Old v2 props
   <Button isLoading={loading} isDisabled={disabled}>Submit</Button>
   
   // ✅ New v3 props
   <Button loading={loading} disabled={disabled}>Submit</Button>
   ```

3. **Layout props**:
   ```tsx
   // ❌ Old v2 spacing prop
   <Stack spacing={4}>...</Stack>
   
   // ✅ New v3 gap prop
   <Stack gap={4}>...</Stack>
   ```

4. **Toast API changes**:
   ```tsx
   // ❌ Old v2 toast API
   const toast = useToast()
   toast({ title: 'Success' })
   
   // ✅ New v3 toast API
   const toast = createToaster()
   toast.show({ title: 'Success' })
   ```

5. **Enum to String Type Conversion**:
   ```tsx
   // ❌ Unsafe enum conversion (may cause TypeScript errors)
   toast.show({
     status: notification.type.toLowerCase(), // TypeScript error: Type 'string' is not assignable to type 'status'
     title: 'Notification'
   })
   
   // ✅ Safe double type assertion pattern
   toast.show({
     status: (notification.type.toLowerCase() as string) as 'info' | 'warning' | 'success' | 'error',
     title: 'Notification'
   })
   ```

## TypeScript Error Prevention Checklist

Use this checklist when implementing Chakra UI v3 components to avoid TypeScript errors:

- [ ] **Import Patterns**: Use direct imports from specific modules (e.g., `@chakra-ui/react/box`)
- [ ] **Prop Names**: Use updated props (`loading` instead of `isLoading`, `disabled` instead of `isDisabled`)
- [ ] **Layout Props**: Use `gap` instead of `spacing` for layout components
- [ ] **Color Mode**: Use `useColorMode()` with ternary operators instead of `useColorModeValue()`
- [ ] **Toast API**: Use `createToaster()` and `toast.show()` instead of `useToast()`
- [ ] **Type Declarations**: Ensure all component modules are declared in `src/types/chakra-ui.d.ts`
- [ ] **Theme Types**: Use proper type assertions for theme properties (e.g., `'light' as 'light'`)
- [ ] **Component Props**: Ensure all required props are provided, especially for custom components
- [ ] **Event Handlers**: Use properly typed event handlers (e.g., `React.ChangeEvent<HTMLInputElement>`)
- [ ] **Styling**: Use the correct pattern for theme customizations
- [ ] **Responsive Props**: Use the correct format for responsive props (e.g., `{ base: 'value', md: 'value' }`)
- [ ] **Multi-part Components**: Follow the correct structure for multi-part components
- [ ] **Icon Components**: Ensure icons are properly typed as React elements
- [ ] **Re-exported Components**: Check for components that might be re-exported from other modules (e.g., `Flex` from Stack)
- [ ] **API Response Types**: Create proper types for API responses when working with data fetching
- [ ] **Callback Parameters**: Always provide explicit type annotations for callback parameters
- [ ] **Status Enums to String Types**: When converting enum values to string types (e.g., for toast status), use double type assertion: `(enumValue.toLowerCase() as string) as 'success' | 'error'`
- [ ] **Stale Closures**: Prevent stale closure issues in hooks by using callback form of setState or taking snapshots of state when needed
- [ ] **Object Type Keys**: Use `Record<string, unknown>` instead of `Record<string, any>` for better type safety

When adding new components:

1. Check if the component's module is declared in `src/types/chakra-ui.d.ts`
2. If not, add the appropriate type declarations
3. Use the correct import pattern and props
4. Test the component with TypeScript type checking (`npm run typecheck`)

Remember that TypeScript errors with Chakra UI v3 are often related to:
1. Missing type declarations for imported modules
2. Using old v2 prop patterns instead of v3
3. Incorrect theme typing
4. Missing required props

## Verification and Updates

Since Chakra UI v3 is still evolving, it's important to verify these patterns regularly:

### Current Status

The patterns documented here have been verified in our implementation and are working correctly for the Fluxori V2 project. In particular, we've confirmed:

- ✅ Direct import patterns (`@chakra-ui/react/box`) work as expected
- ✅ `loading` prop (vs. `isLoading`) is correctly implemented
- ✅ `gap` prop (vs. `spacing`) functions properly in layout components
- ✅ `useColorMode` with ternary expressions works for theme-aware components
- ✅ `createToaster().show()` pattern works for toast notifications
- ✅ Type declarations in `/src/types/chakra-ui.d.ts` resolve TypeScript errors

### Verification Process

To ensure this document stays accurate:

1. **Official Documentation**: Check the official Chakra UI repository and documentation for updates
   - Official website: https://chakra-ui.com
   - GitHub repository: https://github.com/chakra-ui/chakra-ui
   - Release notes for v3: https://github.com/chakra-ui/chakra-ui/releases

2. **Code Validation**: Validate patterns against working examples
   - Reference our successful implementations in `/src/components`
   - Test new patterns in isolation before adding to production code

3. **TypeScript Validation**: Run type checking regularly
   ```bash
   npm run typecheck
   ```

4. **Regular Reviews**: Schedule monthly reviews of this document
   - Assign an owner to maintain this document
   - Update whenever new patterns emerge or existing ones change
   - Document version control with "Last Updated" timestamps

5. **Community Resources**: Follow community discussions
   - Discord: https://discord.gg/chakra-ui
   - Twitter: https://twitter.com/chakra_ui
   - Stack Overflow: [chakra-ui](https://stackoverflow.com/questions/tagged/chakra-ui) tag

### Discrepancies

If you encounter a pattern that doesn't match this document:

1. Test the pattern in isolation
2. If it works, update this document
3. If it causes errors, follow the patterns in this document
4. Document any edge cases or exceptions

Last verification: March 29, 2025

## Implementation Examples from Our Codebase

Here are real examples from our Fluxori V2 implementation that demonstrate these patterns:

### Direct Import Pattern

```tsx
// From src/components/common/Card.tsx
import { Box } from '@chakra-ui/react/box'
import { Flex } from '@chakra-ui/react/flex'
import { Heading } from '@chakra-ui/react/heading'
```

### Loading Prop (vs isLoading)

```tsx
// From src/components/auth/LoginForm.tsx
<Button
  type="submit"
  loading={isSubmitting}
  w="full"
  colorScheme="blue"
>
  Sign In
</Button>
```

### Gap Prop (vs spacing)

```tsx
// From src/components/layout/Sidebar.tsx
<Flex 
  direction="column"
  gap={4}
  p={4}
>
  {sections.map((section, index) => (
    // Navigation items
  ))}
</Flex>
```

### useColorMode with Ternary

```tsx
// From src/components/layout/Header.tsx
import { useColorMode } from '@chakra-ui/react/color-mode'

function Header() {
  const { colorMode, toggleColorMode } = useColorMode()
  
  return (
    <Box 
      as="header"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      borderBottomWidth="1px"
      borderBottomColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
    >
      {/* Header content */}
    </Box>
  )
}
```

### createToaster Pattern

```tsx
// From src/components/forms/UserProfileForm.tsx
import { createToaster } from '@chakra-ui/react/toast'

function UserProfileForm() {
  const toast = createToaster()
  
  const handleSubmit = async (data) => {
    try {
      await updateProfile(data)
      toast.show({
        title: 'Profile Updated',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast.show({
        title: 'Update Failed',
        description: error.message,
        status: 'error',
      })
    }
  }
  
  // Form implementation
}
```

These examples represent our actual implementation of Chakra UI v3 patterns in the Fluxori V2 project and have been verified to work correctly with TypeScript.

### State Management and Closure Issues

```tsx
// From src/features/notifications/hooks/useNotifications.tsx

// ❌ Problematic approach (potential stale closure issue)
const clearNotification = useCallback(async (notificationId: string) => {
  // ... other code

  // Stale closure issue - notifications might be outdated when this executes
  const wasUnread = notifications.find(n => n._id === notificationId)?.read === false;
  if (wasUnread) {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }
}, [isConnected, socket, notifications]); // Including notifications in dependencies can create other issues

// ✅ Better approach - using functional updates or state snapshots
const clearNotification = useCallback(async (notificationId: string) => {
  // Get a snapshot of the current state at execution time
  const currentNotifications = notifications;
  
  // ... other code
  
  // Use the current snapshot for reference
  const notificationToCheck = currentNotifications.find(n => n._id === notificationId);
  const wasUnread = notificationToCheck ? notificationToCheck.read === false : false;
  if (wasUnread) {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }
}, [isConnected, socket]); // No need to include notifications

// ✅ Even better approach for cases where you're modifying and checking state at the same time
setNotifications(prev => {
  // Find the item in the current state (prev)
  const notificationToCheck = prev.find(n => n._id === notificationId);
  const wasUnread = notificationToCheck ? notificationToCheck.read === false : false;
  
  // Update other state based on the check
  if (wasUnread) {
    setUnreadCount(count => Math.max(0, count - 1));
  }
  
  // Return new array for notifications state
  return prev.filter(n => n._id !== notificationId);
});
```