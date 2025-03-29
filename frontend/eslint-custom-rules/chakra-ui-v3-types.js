/**
 * @fileoverview ESLint rule to enforce Chakra UI v3 type declaration usage
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
      description: "Encourage checking for type declarations when using Chakra UI v3 components",
      category: "Best Practices",
      recommended: true,
    },
    fixable: null, // Not auto-fixable
    schema: []
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    
    // List of known Chakra UI component prefixes
    const CHAKRA_COMPONENT_PREFIXES = [
      'Box', 'Flex', 'Grid', 'Stack', 'Button', 'Text', 'Heading',
      'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Form',
      'Avatar', 'Badge', 'Card', 'Container', 'Divider', 'Icon',
      'Image', 'Link', 'List', 'Menu', 'Modal', 'Popover', 'Tooltip',
      'Tab', 'Table', 'Spinner', 'Switch', 'Alert', 'Close', 'Center'
    ];
    
    // Keep track of identified components
    const identifiedComponents = new Set();
    
    return {
      // Identify JSX usage of Chakra components
      JSXOpeningElement(node) {
        if (node.name && node.name.name) {
          const componentName = node.name.name;
          
          // Check if component name starts with any Chakra component prefix
          for (const prefix of CHAKRA_COMPONENT_PREFIXES) {
            if (componentName === prefix || componentName.startsWith(prefix)) {
              identifiedComponents.add(componentName);
              break;
            }
          }
        }
      },
      
      // At the end of program, check if there's a corresponding type declaration
      'Program:exit'() {
        const comments = sourceCode.getAllComments();
        let hasTypeDeclarationGuide = false;
        
        // Check if there are any comments about type declarations
        for (const comment of comments) {
          if (comment.value.includes('chakra-ui.d.ts') || comment.value.includes('type declaration')) {
            hasTypeDeclarationGuide = true;
            break;
          }
        }
        
        // Only raise a warning if Chakra components are used but no type declaration guidance is found
        if (identifiedComponents.size > 0 && !hasTypeDeclarationGuide) {
          const components = Array.from(identifiedComponents).join(', ');
          
          context.report({
            loc: { line: 1, column: 0 },
            message: `This file uses Chakra UI v3 components (${components}) but doesn't mention type declarations. Ensure these components are declared in 'src/types/chakra-ui.d.ts'`
          });
        }
      }
    };
  },
};