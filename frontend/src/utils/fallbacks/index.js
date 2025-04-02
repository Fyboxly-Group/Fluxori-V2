/**
 * Module resolver for missing or conflicting imports
 */
import * as React from 'react';
import * as formControl from './form-control';

// Re-export all fallbacks
export { formControl };

// Add a module resolver helper
export function resolveDependency(modulePath) {
  // Handle specific module paths
  if (modulePath === '@chakra-ui/react/form-control') {
    return formControl;
  }
  
  // Default case - return empty object
  return {};
}
