/**
 * Rule to enforce safe optional chaining
 * 
 * This rule helps prevent TypeScript errors by ensuring optional chaining
 * is used correctly and that appropriate fallbacks are provided when needed.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce safe optional chaining to prevent TypeScript errors',
      category: 'TypeScript Error Prevention',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      optionalChainWithoutFallback: 'Optional chain used in a context that requires a fallback',
      suggestAddingFallback: 'Add a fallback value using the ?? operator',
      potentialNullishAccess: 'Potential access of properties on a nullish value',
      useOptionalChaining: 'Use optional chaining (?.) to safely access this property',
    },
  },
  create(context) {
    return {
      // Check if an optional chain expression is used in a context where a fallback is needed
      ChainExpression(node) {
        const parent = node.parent;
        
        // Check if the optional chain is being used in a JSX expression
        if (parent.type === 'JSXExpressionContainer') {
          // In JSX, undefined is not allowed (it causes errors), so we should have a fallback
          const sourceCode = context.getSourceCode();
          const nodeText = sourceCode.getText(node);
          
          // Check if there's already a nullish coalescing operator
          if (!nodeText.includes('??')) {
            context.report({
              node,
              messageId: 'optionalChainWithoutFallback',
              suggest: [
                {
                  messageId: 'suggestAddingFallback',
                  fix(fixer) {
                    // Suggest adding a fallback, like ?? ''
                    return fixer.insertTextAfter(node, " ?? ''");
                  }
                }
              ]
            });
          }
        }
      },
      
      // Check for non-optional property access on potentially nullish values
      MemberExpression(node) {
        if (!node.optional) {
          const object = node.object;
          
          // If the object is another MemberExpression that uses optional chaining
          // this could be a chain where later parts are not using optional chaining
          if (object.type === 'ChainExpression') {
            context.report({
              node,
              messageId: 'potentialNullishAccess',
              suggest: [
                {
                  messageId: 'useOptionalChaining',
                  fix(fixer) {
                    const sourceCode = context.getSourceCode();
                    const dotToken = sourceCode.getTokenBefore(node.property);
                    return fixer.replaceText(dotToken, '?.');
                  }
                }
              ]
            });
          }
          
          // Also look for patterns like props.user.id where user might be undefined
          // This requires more sophisticated type analysis to be fully effective
        }
      }
    };
  }
};