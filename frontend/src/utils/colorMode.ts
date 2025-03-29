// Utility for persisting and restoring color mode preference

type ColorMode = 'light' | 'dark'

// Get the stored color mode from localStorage
export const getStoredColorMode = (): ColorMode | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const storedColorMode = localStorage.getItem('chakra-ui-color-mode')
    return (storedColorMode as ColorMode) || null
  } catch (error) {
    console.error('Error reading color mode from localStorage:', error)
    return null
  }
}

// Store the color mode in localStorage
export const storeColorMode = (colorMode: ColorMode): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('chakra-ui-color-mode', colorMode)
  } catch (error) {
    console.error('Error storing color mode in localStorage:', error)
  }
}

// Detect system preference for color mode
export const getSystemColorMode = (): ColorMode => {
  if (typeof window === 'undefined') return 'light'
  
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  } catch (error) {
    console.error('Error detecting system color mode:', error)
    return 'light'
  }
}

// Get the initial color mode, with precedence:
// 1. User stored preference (if available)
// 2. System preference
export const getInitialColorMode = (): ColorMode => {
  const storedColorMode = getStoredColorMode()
  if (storedColorMode) return storedColorMode
  
  return getSystemColorMode()
}