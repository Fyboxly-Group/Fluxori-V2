/**
 * Rule to enforce default exports for components
 * 
 * This rule helps prevent TypeScript errors by ensuring React components
 * have default exports to maintain compatibility with Next.js and other frameworks.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require default exports for React components',
      category: 'TypeScript Error Prevention',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingDefaultExport: 'Component "{{name}}" is missing a default export',
      addDefaultExport: 'Add a default export for this component',
    },
  },
  create(context) {
    // Check if a file matches the component pattern
    function isComponentFile(filename) {
      const isComponentPath = /components|pages|features|views/i.test(filename);
      const isComponentExt = /\.(tsx)$/i.test(filename);
      return isComponentPath && isComponentExt;
    }
    
    return {
      Program(node) {
        const filename = context.getFilename();
        
        // Only apply to component files
        if (!isComponentFile(filename)) {
          return;
        }
        
        let hasDefaultExport = false;
        let exportedComponentName = null;
        
        // Check for existing default export
        node.body.forEach(statement => {
          if (statement.type === 'ExportDefaultDeclaration') {
            hasDefaultExport = true;
          }
          // Track named function exports that might be components
          else if (statement.type === 'ExportNamedDeclaration' && 
                  statement.declaration && 
                  statement.declaration.type === 'FunctionDeclaration') {
            exportedComponentName = statement.declaration.id.name;
          }
        });
        
        // Report if no default export but has an exported component
        if (!hasDefaultExport && exportedComponentName) {
          // Find the last statement to add the default export after it
          const lastStatement = node.body[node.body.length - 1];
          
          context.report({
            node: lastStatement,
            messageId: 'missingDefaultExport',
            data: {
              name: exportedComponentName,
            },
            fix(fixer) {
              return fixer.insertTextAfter(
                lastStatement,
                `\n\nexport default ${exportedComponentName};\n`
              );
            }
          });
        }
      }
    };
  }
};