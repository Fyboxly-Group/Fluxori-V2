/**
 * Utility to help with the migration from Chakra UI v2 to v3
 */

export const propMappings = {
  // Button and IconButton props
  'loading': 'loading',
  'disabled': 'disabled',
  'leftIcon': 'leftIcon', // Keep for now
  'rightIcon': 'rightIcon', // Keep for now
  
  // Stack props
  'spacing': 'gap',
  
  // Various component props
  'open': 'open',
  'checked': 'checked',
  'invalid': 'invalid',
  'readOnly': 'readOnly',
  'isRequired': 'required',
  'active': 'active',
  'focused': 'focused',
  'attached': 'attached',
  
  // BreadcrumbItem props
  'isCurrentPage': 'currentPage',
  
  // Tooltip props
  'hasArrow': 'arrow'
};

/**
 * Convert Chakra UI v2 props to v3 props
 * @param props Component props
 * @returns Updated props
 */
export function convertChakraProps(props: Record<string, any>): Record<string, any> {
  const result = { ...props };
  
  // Convert properties using the mappings
  for (const [oldProp, newProp] of Object.entries(propMappings)) {
    if (oldProp in result) {
      // Copy the value to the new property name
      result[newProp] = result[oldProp];
      // Remove the old property
      delete result[oldProp];
    }
  }
  
  return result;
}

/**
 * Icon button props utility to ensure aria-label is present
 * @param props Icon button props
 * @returns Updated props with aria-label
 */
export function withAriaLabel(props: Record<string, any>, defaultLabel = 'Button'): Record<string, any> {
  const result = { ...props };
  
  // Ensure 'aria-label' exists
  if (!result['aria-label']) {
    result['aria-label'] = defaultLabel;
  }
  
  return result;
}
