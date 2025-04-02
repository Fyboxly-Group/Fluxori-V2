/**
 * Rule to enforce proper typing of API responses
 * 
 * This rule helps prevent TypeScript errors by ensuring API responses
 * are properly typed and handled safely to prevent runtime errors.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce proper typing of API responses to prevent runtime errors',
      category: 'TypeScript Error Prevention',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      untypedApiResponse: 'API response is not properly typed',
      directDataAccess: 'Direct access to response.data without type safety',
      suggestTypeAssertion: 'Consider adding proper type assertion for this API response',
    },
  },
  create(context) {
    // Common fetch/API patterns to detect
    const apiPatterns = [
      'fetch', 'axios', 'get', 'post', 'put', 'delete', 'patch', 
      'useQuery', 'useMutation', 'api'
    ];
    
    return {
      // Look for variable declarations that might be API responses
      VariableDeclarator(node) {
        // If initialized with an await expression
        if (node.init && node.init.type === 'AwaitExpression') {
          const awaitedExpr = node.init.argument;
          
          // Check if it's a call to what looks like an API function
          if (awaitedExpr.type === 'CallExpression') {
            const callee = awaitedExpr.callee;
            let isApiCall = false;
            
            // Check if function name matches API patterns
            if (callee.type === 'Identifier') {
              isApiCall = apiPatterns.some(pattern => 
                callee.name.toLowerCase().includes(pattern.toLowerCase())
              );
            } 
            // Check if it's a method call that matches API patterns 
            else if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
              isApiCall = apiPatterns.some(pattern => 
                callee.property.name.toLowerCase().includes(pattern.toLowerCase())
              );
            }
            
            if (isApiCall) {
              // Check if the variable has a type annotation
              if (node.id.type === 'Identifier' && !node.id.typeAnnotation) {
                context.report({
                  node,
                  messageId: 'untypedApiResponse',
                  suggest: [
                    {
                      messageId: 'suggestTypeAssertion',
                      fix(fixer) {
                        // Cannot auto-fix without knowing the intended type
                        return null;
                      }
                    }
                  ]
                });
              }
            }
          }
        }
      },
      
      // Find property access on response objects that might be unsafe
      MemberExpression(node) {
        if (node.property.type === 'Identifier' && node.property.name === 'data') {
          const object = node.object;
          
          // Check if the object is a variable that might be an API response
          if (object.type === 'Identifier') {
            const variableName = object.name;
            // This is a simplistic check - a more sophisticated approach would 
            // use scope analysis to determine if this variable is an API response
            if (/response|result|data|api|query|mutation/i.test(variableName)) {
              context.report({
                node,
                messageId: 'directDataAccess'
              });
            }
          }
        }
      }
    };
  }
};