/**
 * Rule to enforce proper typing in array callback methods
 * 
 * This rule ensures that array callback methods like map, filter, forEach, etc.
 * have properly typed parameters to prevent TypeScript errors.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce explicit typing in array callback methods',
      category: 'TypeScript Error Prevention',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingParameterType: 'Array callback parameter "{{name}}" is missing a type annotation',
      addExplicitType: 'Add an explicit type for parameter "{{name}}"',
    },
  },
  create(context) {
    // List of array methods that commonly use callbacks
    const arrayCallbackMethods = [
      'map', 'filter', 'forEach', 'reduce', 'reduceRight',
      'find', 'findIndex', 'some', 'every', 'flatMap', 'sort'
    ];
    
    return {
      // Look for method calls on arrays
      CallExpression(node) {
        if (node.callee.type === 'MemberExpression') {
          const method = node.callee.property.name;
          
          // Check if it's one of the array callback methods
          if (arrayCallbackMethods.includes(method)) {
            const args = node.arguments;
            
            // These methods take a callback as first argument
            if (args.length > 0 && args[0].type === 'ArrowFunctionExpression') {
              const callback = args[0];
              
              // Check each parameter of the callback
              callback.params.forEach(param => {
                if (param.type === 'Identifier' && !param.typeAnnotation) {
                  context.report({
                    node: param,
                    messageId: 'missingParameterType',
                    data: {
                      name: param.name,
                    },
                    fix(fixer) {
                      // Cannot automatically fix as we don't know the exact type
                      // A real implementation would need to analyze the code to determine the type
                      return null;
                    }
                  });
                }
              });
            }
          }
        }
      }
    };
  }
};