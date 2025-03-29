/**
 * @fileoverview ESLint rule to enforce Chakra UI v3 prop patterns
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce Chakra UI v3 prop naming conventions",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: []
  },

  create(context) {
    // Map of old prop names to new prop names
    const PROP_NAMES_MAP = {
      isLoading: 'loading',
      isDisabled: 'disabled',
      isChecked: 'checked',
      isInvalid: 'invalid',
      isReadOnly: 'readOnly',
      isOpen: 'open',
      isActive: 'active',
      isFocused: 'focused',
      isHovered: 'hovered',
      isFullWidth: 'fullWidth',
      // Add more prop mappings as needed
    };
    
    // Components that use spacing prop
    const SPACING_COMPONENTS = [
      'Stack', 'HStack', 'VStack', 'SimpleGrid', 'Wrap'
    ];

    return {
      JSXAttribute(node) {
        const propName = node.name.name;
        const parentComponent = node.parent.name && node.parent.name.name;
        
        // Check for deprecated 'is' prefixed props
        if (PROP_NAMES_MAP[propName]) {
          context.report({
            node,
            message: `Use '{{ newProp }}' instead of '{{ oldProp }}' in Chakra UI v3`,
            data: {
              oldProp: propName,
              newProp: PROP_NAMES_MAP[propName]
            },
            fix(fixer) {
              return fixer.replaceText(node.name, PROP_NAMES_MAP[propName]);
            }
          });
        }
        
        // Check for 'spacing' prop on layout components
        if (propName === 'spacing' && SPACING_COMPONENTS.includes(parentComponent)) {
          context.report({
            node,
            message: `Use 'gap' instead of 'spacing' in Chakra UI v3 layout components`,
            fix(fixer) {
              return fixer.replaceText(node.name, 'gap');
            }
          });
        }
      },
      
      // Check for useColorModeValue hook usage
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useColorModeValue'
        ) {
          context.report({
            node,
            message: `Use 'useColorMode' with ternary operator instead of 'useColorModeValue' in Chakra UI v3`,
          });
        }
        
        // Check for useToast hook usage
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useToast'
        ) {
          context.report({
            node,
            message: `Use 'createToaster' instead of 'useToast' in Chakra UI v3`,
          });
        }
      }
    };
  },
};