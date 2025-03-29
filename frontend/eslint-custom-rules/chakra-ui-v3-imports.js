/**
 * @fileoverview ESLint rule to enforce Chakra UI v3 import patterns
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
      description: "Enforce Chakra UI v3 direct import patterns",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: []
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        // Check if the import source is '@chakra-ui/react'
        if (node.source.value === '@chakra-ui/react') {
          const specifiers = node.specifiers;
          
          // Map of component names to their module paths
          const CHAKRA_COMPONENTS = {
            Box: '@chakra-ui/react/box',
            Flex: '@chakra-ui/react/flex',
            Stack: '@chakra-ui/react/stack',
            HStack: '@chakra-ui/react/stack',
            VStack: '@chakra-ui/react/stack',
            Button: '@chakra-ui/react/button',
            IconButton: '@chakra-ui/react/button',
            Text: '@chakra-ui/react/text',
            Heading: '@chakra-ui/react/heading',
            Input: '@chakra-ui/react/input',
            Textarea: '@chakra-ui/react/textarea',
            Select: '@chakra-ui/react/select',
            Checkbox: '@chakra-ui/react/checkbox',
            Radio: '@chakra-ui/react/radio',
            FormControl: '@chakra-ui/react/form-control',
            FormLabel: '@chakra-ui/react/form-control',
            FormErrorMessage: '@chakra-ui/react/form-control',
            FormHelperText: '@chakra-ui/react/form-control',
            Avatar: '@chakra-ui/react/avatar',
            Badge: '@chakra-ui/react/badge',
            Card: '@chakra-ui/react/card',
            CardHeader: '@chakra-ui/react/card',
            CardBody: '@chakra-ui/react/card',
            CardFooter: '@chakra-ui/react/card',
            Container: '@chakra-ui/react/container',
            Divider: '@chakra-ui/react/divider',
            Grid: '@chakra-ui/react/grid',
            GridItem: '@chakra-ui/react/grid',
            Icon: '@chakra-ui/react/icon',
            Image: '@chakra-ui/react/image',
            Link: '@chakra-ui/react/link',
            List: '@chakra-ui/react/list',
            ListItem: '@chakra-ui/react/list',
            Menu: '@chakra-ui/react/menu',
            Modal: '@chakra-ui/react/modal',
            Popover: '@chakra-ui/react/popover',
            Tooltip: '@chakra-ui/react/tooltip',
            Tabs: '@chakra-ui/react/tabs',
            Table: '@chakra-ui/react/table',
            Spinner: '@chakra-ui/react/spinner',
            Switch: '@chakra-ui/react/switch',
            Alert: '@chakra-ui/react/alert',
            AlertIcon: '@chakra-ui/react/alert',
            AlertTitle: '@chakra-ui/react/alert',
            AlertDescription: '@chakra-ui/react/alert',
            CloseButton: '@chakra-ui/react/close-button',
            ButtonGroup: '@chakra-ui/react/button-group',
            Center: '@chakra-ui/react/center',
            // Add more components as needed
          };
          
          specifiers.forEach(specifier => {
            if (
              specifier.type === 'ImportSpecifier' && 
              CHAKRA_COMPONENTS[specifier.imported.name]
            ) {
              context.report({
                node: specifier,
                message: `Use direct import for Chakra UI components: import { {{ componentName }} } from '{{ modulePath }}'`,
                data: {
                  componentName: specifier.imported.name,
                  modulePath: CHAKRA_COMPONENTS[specifier.imported.name]
                },
                fix(fixer) {
                  // Create a mapping of components to their modules
                  const componentsByModule = {};
                  
                  specifiers.forEach(spec => {
                    if (spec.type === 'ImportSpecifier' && CHAKRA_COMPONENTS[spec.imported.name]) {
                      const modulePath = CHAKRA_COMPONENTS[spec.imported.name];
                      if (!componentsByModule[modulePath]) {
                        componentsByModule[modulePath] = [];
                      }
                      componentsByModule[modulePath].push(spec.imported.name);
                    }
                  });
                  
                  // Generate new import statements
                  let newImports = '';
                  Object.entries(componentsByModule).forEach(([modulePath, components]) => {
                    newImports += `import { ${components.join(', ')} } from '${modulePath}';\n`;
                  });
                  
                  // If there are other specifiers not related to Chakra components, keep them
                  const otherSpecifiers = specifiers.filter(spec => 
                    spec.type !== 'ImportSpecifier' || !CHAKRA_COMPONENTS[spec.imported.name]
                  );
                  
                  if (otherSpecifiers.length > 0) {
                    const sourceCode = context.getSourceCode();
                    const otherSpecifiersText = sourceCode.getText(node).split('{')[1].split('}')[0];
                    newImports += `import { ${otherSpecifiersText} } from '@chakra-ui/react';\n`;
                  }
                  
                  return fixer.replaceText(node, newImports.trim());
                }
              });
            }
          });
        }
      }
    };
  },
};